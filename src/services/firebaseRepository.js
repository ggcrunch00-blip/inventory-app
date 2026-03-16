import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, setDoc, writeBatch } from 'firebase/firestore';
import { CHARACTERS, DEFAULT_CLASSROOM, normalizeCharacterId } from '../utils/constants';
import { cloneMockSeed } from '../data/mockSeed';
import {
  DISABLED_ITEM_IDS,
  SEEDED_ITEM_IDS,
  createSeedItems,
  createSeedSessions,
  normalizeSessionsForLessonSeeds,
  sortSessionsByStructure,
} from '../data/lessonItemSeeds';
import { decodeUnicodeDeep } from '../utils/format';
import { db } from './firebase';
import { getLoginKey } from '../utils/inventory';
import {
  commitRewardPlan,
  createLog,
  grantAdminBonus,
  normalizeItemInput,
  normalizeSessionInput,
  normalizeStudentInput,
  removeInventoryEntryForAdmin,
  selectPetForStudent,
  selectMissionItemsForStudent,
  selectSpecialItemForStudent,
} from './businessRules';

async function fetchCollection(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((item) =>
    decodeUnicodeDeep({
      ...item.data(),
      id: item.id,
    }),
  );
}

async function fetchStudent(studentId) {
  const snapshot = await getDoc(doc(db, 'students', studentId));

  if (!snapshot.exists()) {
    throw new Error('학생 정보를 찾지 못했습니다.');
  }

  return normalizeStudentRecord(
    decodeUnicodeDeep({
      ...snapshot.data(),
      id: snapshot.id,
    }),
  );
}

async function fetchItem(itemId) {
  const snapshot = await getDoc(doc(db, 'items', itemId));

  if (!snapshot.exists()) {
    throw new Error('아이템 정보를 찾지 못했습니다.');
  }

  return decodeUnicodeDeep({ ...snapshot.data(), id: snapshot.id });
}

function normalizeStudentRecord(student) {
  return {
    ...student,
    id: student.loginKey || student.id,
    selectedCharacter: normalizeCharacterId(student.selectedCharacter),
  };
}

function saveLogs(batch, logs) {
  logs.forEach((log) => {
    batch.set(doc(collection(db, 'logs')), log);
  });
}

function applyInventoryReplacement({ student, replaceEntryIds = [], sessionId, itemsById = {}, replacementItemId = '' }) {
  const nextInventory = [...(student.inventory || [])];
  const logs = [];

  [...new Set(replaceEntryIds.filter(Boolean))].forEach((replaceEntryId) => {
    const replaceIndex = nextInventory.findIndex((entry) => entry.id === replaceEntryId);

    if (replaceIndex === -1) {
      throw new Error('버릴 아이템을 다시 선택해 주세요.');
    }

    const [discardedEntry] = nextInventory.splice(replaceIndex, 1);
    logs.push(
      createLog({
        studentId: student.id,
        sessionId,
        actionType: 'item_discarded',
        payload: {
          itemId: discardedEntry.itemId,
          itemName: discardedEntry.customName || itemsById[discardedEntry.itemId]?.name || '아이템',
          inventoryEntryId: discardedEntry.id,
          replacedByItemId: replacementItemId,
        },
      }),
    );
  });

  return {
    inventory: nextInventory,
    logs,
  };
}

function mergeSeededSessionItemIds(seedItemIds, existingItemIds) {
  return [
    ...new Set([
      ...(seedItemIds || []),
      ...((existingItemIds || []).filter((itemId) => !DISABLED_ITEM_IDS.includes(itemId))),
    ]),
  ];
}

function shouldAdoptSeedShopOpen(existingSession) {
  if (existingSession?.shopOpen === undefined) {
    return true;
  }

  return Boolean(existingSession?.createdAt) && existingSession.createdAt === existingSession.updatedAt;
}

async function ensureLessonSeedData(items, sessions) {
  const now = new Date().toISOString();
  const expectedItems = createSeedItems(now);
  const expectedSessions = createSeedSessions(now);
  const itemsById = Object.fromEntries(items.map((item) => [item.id, item]));
  const itemsNeedingSync = expectedItems.filter((item) => {
    const existing = itemsById[item.id];

    if (!existing) {
      return true;
    }

    return (
      existing.name !== item.name ||
      Number(existing.lesson) !== Number(item.lesson) ||
      JSON.stringify(existing.lessons || []) !== JSON.stringify(item.lessons || []) ||
      existing.rewardGroup !== item.rewardGroup ||
      existing.image !== item.image ||
      JSON.stringify(existing.allowedCharacters || []) !== JSON.stringify(item.allowedCharacters || []) ||
      existing.acquisitionType !== item.acquisitionType ||
      Number(existing.cost) !== Number(item.cost) ||
      existing.description !== item.description ||
      Number(existing.price) !== Number(item.price) ||
      existing.imageUrl !== item.imageUrl ||
      String(existing.petSpecies || '') !== String(item.petSpecies || '') ||
      existing.type !== item.type ||
      JSON.stringify(existing.activeSessions || []) !== JSON.stringify(item.activeSessions || []) ||
      JSON.stringify(existing.applicableCharacters || []) !== JSON.stringify(item.applicableCharacters || [])
    );
  });

  const batch = writeBatch(db);

  itemsNeedingSync.forEach((item) => {
    batch.set(doc(db, 'items', item.id), item, { merge: true });
  });

  items
    .filter((item) => DISABLED_ITEM_IDS.includes(item.id))
    .forEach((item) => {
      batch.delete(doc(db, 'items', item.id));
    });

  const sessionsById = Object.fromEntries((sessions || []).map((session) => [session.id, session]));

  expectedSessions.forEach((seedSession) => {
    const existingSession = sessionsById[seedSession.id] || {};

    batch.set(
      doc(db, 'sessions', seedSession.id),
      {
        ...existingSession,
        ...seedSession,
        shopOpen: shouldAdoptSeedShopOpen(existingSession) ? seedSession.shopOpen : Boolean(existingSession.shopOpen),
        purchaseItems: mergeSeededSessionItemIds(seedSession.purchaseItems, existingSession.purchaseItems),
        bonusItems: mergeSeededSessionItemIds(seedSession.bonusItems, existingSession.bonusItems),
        petItems: mergeSeededSessionItemIds(seedSession.petItems, existingSession.petItems),
        specialItems: mergeSeededSessionItemIds(seedSession.specialItems, existingSession.specialItems),
        missionItems: mergeSeededSessionItemIds(seedSession.missionItems, existingSession.missionItems),
        bonusEnabled: Boolean(existingSession.bonusEnabled ?? seedSession.bonusEnabled),
        notes: existingSession.notes || seedSession.notes,
        createdAt: existingSession.createdAt || seedSession.createdAt,
        updatedAt: now,
      },
      { merge: true },
    );
  });

  await batch.commit();
}

async function ensureAuthSeedData(students, admins) {
  const seed = cloneMockSeed();
  const batch = writeBatch(db);
  let hasChanges = false;
  const classroomSnapshot = await getDoc(doc(db, 'classrooms', 'main'));
  const hasTeacherAdmin = (admins || []).some(
    (admin) => admin.id === 'teacher' || String(admin.loginId || '').trim() === 'teacher',
  );

  if (!classroomSnapshot.exists()) {
    batch.set(doc(db, 'classrooms', 'main'), seed.classroom);
    hasChanges = true;
  }

  if (!hasTeacherAdmin) {
    seed.admins.forEach((admin) => {
      if (admin.id === 'teacher') {
        batch.set(doc(db, 'admins', admin.id), admin, { merge: true });
      }
    });
    hasChanges = true;
  }

  if (!(students || []).length) {
    seed.students.forEach((student) => {
      batch.set(doc(db, 'students', student.id), student, { merge: true });
    });
    hasChanges = true;
  }

  if (hasChanges) {
    await batch.commit();
  }
}

export function createFirebaseRepository() {
  return {
    mode: 'firebase',

    subscribeClassroom(onChange) {
      const classroomRef = doc(db, 'classrooms', 'main');

      return onSnapshot(classroomRef, (snapshot) => {
        const classroom = snapshot.exists()
          ? decodeUnicodeDeep({ id: snapshot.id, ...snapshot.data() })
          : DEFAULT_CLASSROOM;

        onChange(classroom);
      });
    },

    async bootstrap() {
      let [students, items, sessions, logs, admins] = await Promise.all([
        fetchCollection('students'),
        fetchCollection('items'),
        fetchCollection('sessions'),
        fetchCollection('logs'),
        fetchCollection('admins'),
      ]);
      await ensureAuthSeedData(students, admins);
      await ensureLessonSeedData(items, sessions);
      [students, items, sessions, admins] = await Promise.all([
        fetchCollection('students'),
        fetchCollection('items'),
        fetchCollection('sessions'),
        fetchCollection('admins'),
      ]);
      const classroomSnapshot = await getDoc(doc(db, 'classrooms', 'main'));
      const classroom = classroomSnapshot.exists()
        ? decodeUnicodeDeep({ id: classroomSnapshot.id, ...classroomSnapshot.data() })
        : DEFAULT_CLASSROOM;
      const normalizedItems = [...items.filter((item) => !DISABLED_ITEM_IDS.includes(item.id))].sort((left, right) =>
        String(right.updatedAt || '').localeCompare(String(left.updatedAt || '')),
      );
      const normalizedSessions = sortSessionsByStructure(normalizeSessionsForLessonSeeds(sessions));

      return {
        mode: 'firebase',
        classroom,
        characters: CHARACTERS,
        admins,
        students: students
          .map(normalizeStudentRecord)
          .sort((left, right) => String(right.updatedAt || '').localeCompare(String(left.updatedAt || ''))),
        items: normalizedItems,
        sessions: normalizedSessions,
        logs: logs.sort((left, right) => String(right.timestamp || '').localeCompare(String(left.timestamp || ''))),
      };
    },

    async studentLogin(credentials) {
      const loginKey = getLoginKey(credentials);
      const snapshot = await getDoc(doc(db, 'students', loginKey));

      if (!snapshot.exists()) {
        throw new Error('학생 로그인 정보를 다시 확인해 주세요.');
      }

      const student = normalizeStudentRecord(
        decodeUnicodeDeep({
          ...snapshot.data(),
          id: snapshot.id,
        }),
      );

      if (student.password4digit !== String(credentials.password4digit)) {
        throw new Error('학생 로그인 정보를 다시 확인해 주세요.');
      }

      return student;
    },

    async adminLogin({ loginId, password }) {
      const adminId = String(loginId || '').trim();
      const snapshot = await getDoc(doc(db, 'admins', adminId));
      let admin = null;

      if (snapshot.exists()) {
        admin = decodeUnicodeDeep({ id: snapshot.id, ...snapshot.data() });
      } else {
        const admins = await fetchCollection('admins');
        admin =
          admins.find((item) => String(item.loginId || '').trim() === adminId) ||
          admins.find((item) => String(item.id || '').trim() === adminId) ||
          null;
      }

      if (!admin) {
        throw new Error('선생님 로그인 정보를 다시 확인해 주세요.');
      }

      if (admin.password !== String(password).trim()) {
        throw new Error('선생님 로그인 정보를 다시 확인해 주세요.');
      }

      return admin;
    },

    async saveCharacter(studentId, characterId) {
      const student = await fetchStudent(studentId);
      const updatedStudent = {
        ...student,
        selectedCharacter: normalizeCharacterId(characterId),
        updatedAt: new Date().toISOString(),
      };
      const batch = writeBatch(db);
      batch.set(doc(db, 'students', studentId), updatedStudent);
      saveLogs(batch, [
        createLog({
          studentId,
          actionType: 'character_selected',
          payload: { selectedCharacter: updatedStudent.selectedCharacter },
        }),
      ]);
      await batch.commit();
      return normalizeStudentRecord(updatedStudent);
    },

    async submitRewardPlan({ studentId, sessionId, enteredScore, plan }) {
      const [student, items] = await Promise.all([fetchStudent(studentId), fetchCollection('items')]);
      const itemsById = Object.fromEntries(items.map((item) => [item.id, item]));
      const result = commitRewardPlan({ student, plan, enteredScore, sessionId, itemsById });
      const batch = writeBatch(db);
      const updatedStudent = {
        ...student,
        inventory: result.inventory,
        updatedAt: new Date().toISOString(),
      };

      batch.set(doc(db, 'students', studentId), updatedStudent);
      saveLogs(batch, result.logs);
      await batch.commit();

      return { student: updatedStudent, logs: result.logs };
    },

    async selectPet({ studentId, itemId, sessionId, customName, replaceEntryId }) {
      const [student, item, items] = await Promise.all([fetchStudent(studentId), fetchItem(itemId), fetchCollection('items')]);
      const itemsById = Object.fromEntries(items.map((entry) => [entry.id, entry]));
      const result = selectPetForStudent({
        student,
        item,
        sessionId,
        customName,
        replaceEntryId,
        itemsById,
      });
      const batch = writeBatch(db);
      const updatedStudent = {
        ...student,
        inventory: result.inventory,
        updatedAt: new Date().toISOString(),
      };

      batch.set(doc(db, 'students', studentId), updatedStudent);
      saveLogs(batch, result.logs);
      await batch.commit();

      return { student: updatedStudent, logs: result.logs };
    },

    async selectSpecialItem({ studentId, itemId, sessionId, replaceEntryId }) {
      const [student, item, items] = await Promise.all([fetchStudent(studentId), fetchItem(itemId), fetchCollection('items')]);
      const itemsById = Object.fromEntries(items.map((entry) => [entry.id, entry]));
      const result = selectSpecialItemForStudent({
        student,
        item,
        sessionId,
        replaceEntryId,
        itemsById,
      });
      const batch = writeBatch(db);
      const updatedStudent = {
        ...student,
        inventory: result.inventory,
        updatedAt: new Date().toISOString(),
      };

      batch.set(doc(db, 'students', studentId), updatedStudent);
      saveLogs(batch, result.logs);
      await batch.commit();

      return { student: updatedStudent, logs: result.logs };
    },

    async selectMissionItems({ studentId, itemIds, sessionId, replaceEntryIds = [] }) {
      const [student, items] = await Promise.all([fetchStudent(studentId), fetchCollection('items')]);
      const itemsById = Object.fromEntries(items.map((entry) => [entry.id, entry]));
      const selectedItems = (itemIds || []).map((itemId) => itemsById[itemId]).filter(Boolean);
      const result = selectMissionItemsForStudent({
        student,
        items: selectedItems,
        sessionId,
        replaceEntryIds,
        itemsById,
      });
      const batch = writeBatch(db);
      const updatedStudent = {
        ...student,
        inventory: result.inventory,
        updatedAt: new Date().toISOString(),
      };

      batch.set(doc(db, 'students', studentId), updatedStudent);
      saveLogs(batch, result.logs);
      await batch.commit();

      return { student: updatedStudent, logs: result.logs };
    },

    async createStudent(values) {
      const nextStudent = normalizeStudentInput(values);
      const existing = await getDoc(doc(db, 'students', nextStudent.id));

      if (existing.exists()) {
        throw new Error('이미 등록된 학년/반/번호입니다.');
      }

      await setDoc(doc(db, 'students', nextStudent.id), nextStudent);
      return normalizeStudentRecord(nextStudent);
    },

    async updateStudent(studentId, values) {
      const existingStudent = await fetchStudent(studentId);
      const nextStudent = normalizeStudentInput({ ...existingStudent, ...values }, existingStudent);
      const batch = writeBatch(db);

      if (studentId !== nextStudent.id) {
        const conflictSnapshot = await getDoc(doc(db, 'students', nextStudent.id));

        if (conflictSnapshot.exists()) {
          throw new Error('수정하려는 학년/반/번호가 이미 사용 중입니다.');
        }

        batch.delete(doc(db, 'students', studentId));
      }

      batch.set(doc(db, 'students', nextStudent.id), {
        ...nextStudent,
        inventory: existingStudent.inventory || [],
      });
      await batch.commit();
      return normalizeStudentRecord(nextStudent);
    },

    async deleteStudent(studentId) {
      await deleteDoc(doc(db, 'students', studentId));
      return true;
    },

    async createItem(values) {
      const nextItem = normalizeItemInput(values);
      await setDoc(doc(db, 'items', nextItem.id), nextItem);
      return nextItem;
    },

    async updateItem(itemId, values) {
      const existingItem = await fetchItem(itemId);
      const nextItem = normalizeItemInput({ ...existingItem, ...values, id: itemId }, existingItem);
      await setDoc(doc(db, 'items', itemId), nextItem);
      return nextItem;
    },

    async deleteItem(itemId) {
      await deleteDoc(doc(db, 'items', itemId));
      return true;
    },

    async createSession(values) {
      const nextSession = normalizeSessionInput(values);
      await setDoc(doc(db, 'sessions', nextSession.id), nextSession);
      return nextSession;
    },

    async updateSession(sessionId, values) {
      const existingSnapshot = await getDoc(doc(db, 'sessions', sessionId));

      if (!existingSnapshot.exists()) {
        throw new Error('차시 정보를 찾지 못했습니다.');
      }

      const nextSession = normalizeSessionInput(
        { ...existingSnapshot.data(), ...values, id: sessionId },
        { id: sessionId, ...existingSnapshot.data() },
      );
      await setDoc(doc(db, 'sessions', sessionId), nextSession);
      return nextSession;
    },

    async deleteSession(sessionId) {
      await deleteDoc(doc(db, 'sessions', sessionId));
      return true;
    },

    async updateCurrentSession(sessionId) {
      const sessionSnapshot = await getDoc(doc(db, 'sessions', sessionId));

      if (!sessionSnapshot.exists()) {
        throw new Error('차시 정보를 찾지 못했습니다.');
      }

      const classroomSnapshot = await getDoc(doc(db, 'classrooms', 'main'));
      const now = new Date().toISOString();
      const currentClassroom = classroomSnapshot.exists()
        ? decodeUnicodeDeep({ ...classroomSnapshot.data() })
        : DEFAULT_CLASSROOM;

      await setDoc(
        doc(db, 'classrooms', 'main'),
        {
          ...currentClassroom,
          activeSessionId: sessionId,
          updatedAt: now,
        },
        { merge: true },
      );

      return {
        ...currentClassroom,
        activeSessionId: sessionId,
        updatedAt: now,
      };
    },
    async getCurrentLessonState() {
  const snapshot = await getDoc(doc(db, 'lessonState', 'current'));

  if (!snapshot.exists()) {
    return null;
  }

  return decodeUnicodeDeep({
    id: snapshot.id,
    ...snapshot.data(),
  });
},

    async giveBonusItemToStudent({ studentId, itemId, sessionId }) {
      const [student, item] = await Promise.all([fetchStudent(studentId), fetchItem(itemId)]);
      const result = grantAdminBonus({ student, item, sessionId });
      const batch = writeBatch(db);
      const updatedStudent = {
        ...student,
        inventory: result.inventory,
        updatedAt: new Date().toISOString(),
      };

      batch.set(doc(db, 'students', studentId), updatedStudent);
      saveLogs(batch, result.logs);
      await batch.commit();

      return { student: updatedStudent, logs: result.logs };
    },

    async giveBonusItemToAll({ itemId, sessionId }) {
      const [students, item] = await Promise.all([fetchCollection('students'), fetchItem(itemId)]);
      let successCount = 0;
      let skippedCount = 0;
      const batch = writeBatch(db);

      students.forEach((student) => {
        try {
          const result = grantAdminBonus({ student, item, sessionId });
          successCount += 1;
          batch.set(doc(db, 'students', student.id), {
            ...student,
            inventory: result.inventory,
            updatedAt: new Date().toISOString(),
          });
          saveLogs(batch, result.logs);
        } catch (error) {
          skippedCount += 1;
        }
      });

      await batch.commit();
      return { successCount, skippedCount };
    },

    async removeInventoryEntry({ studentId, inventoryEntryId, sessionId }) {
      const [student, items] = await Promise.all([fetchStudent(studentId), fetchCollection('items')]);
      const itemsById = Object.fromEntries(items.map((item) => [item.id, item]));
      const result = removeInventoryEntryForAdmin({ student, inventoryEntryId, sessionId, itemsById });
      const batch = writeBatch(db);
      const updatedStudent = {
        ...student,
        inventory: result.inventory,
        updatedAt: new Date().toISOString(),
      };

      batch.set(doc(db, 'students', studentId), updatedStudent);
      saveLogs(batch, result.logs);
      await batch.commit();

      return { student: updatedStudent, logs: result.logs };
    },
  };
}
