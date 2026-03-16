import { cloneMockSeed } from '../data/mockSeed';
import { CHARACTERS, DEFAULT_CLASSROOM, normalizeCharacterId } from '../utils/constants';
import { getLoginKey } from '../utils/inventory';
import {
  DISABLED_ITEM_IDS,
  SEEDED_ITEM_IDS,
  SESSION_GROUP_IDS,
  normalizeSessionsForLessonSeeds,
  sortSessionsByStructure,
} from '../data/lessonItemSeeds';
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
import { decodeUnicodeDeep } from '../utils/format';

const STORAGE_KEY = 'gukto-guardians-mock-db';
const MOCK_DATA_VERSION = 10;

function createFreshSeed() {
  return {
    ...cloneMockSeed(),
    __seedVersion: MOCK_DATA_VERSION,
  };
}

function needsMockMigration(database) {
  if (!database || database.__seedVersion !== MOCK_DATA_VERSION) {
    return true;
  }

  const seed = createFreshSeed();
  const itemIds = (database.items || []).map((item) => item.id);
  const hasLegacyItems = DISABLED_ITEM_IDS.some((itemId) => itemIds.includes(itemId));
  const hasSeedItems = SEEDED_ITEM_IDS.every((itemId) => itemIds.includes(itemId));
  const sessionIds = (database.sessions || []).map((session) => session.id);
  const hasAllSessionGroups = SESSION_GROUP_IDS.every((sessionId) => sessionIds.includes(sessionId));
  const normalizedSessions = normalizeSessionsForLessonSeeds(database.sessions || []);
  const matchesSeedSessions = SESSION_GROUP_IDS.every((sessionId) => {
    const expectedSession = normalizedSessions.find((session) => session.id === sessionId);
    const currentSession = (database.sessions || []).find((session) => session.id === sessionId);

    if (!expectedSession || !currentSession) {
      return false;
    }

      return (
        (expectedSession.purchaseItems || []).every((itemId) => (currentSession.purchaseItems || []).includes(itemId)) &&
        (expectedSession.bonusItems || []).every((itemId) => (currentSession.bonusItems || []).includes(itemId)) &&
        (expectedSession.petItems || []).every((itemId) => (currentSession.petItems || []).includes(itemId)) &&
        (expectedSession.specialItems || []).every((itemId) => (currentSession.specialItems || []).includes(itemId)) &&
        (expectedSession.missionItems || []).every((itemId) => (currentSession.missionItems || []).includes(itemId))
      );
  });

  return hasLegacyItems || !hasSeedItems || !hasAllSessionGroups || !matchesSeedSessions;
}

function migrateMockDatabase(database) {
  const seed = createFreshSeed();
  const allowedSeedItemIds = new Set(seed.items.map((item) => item.id));
  const customItems = (database?.items || []).filter(
    (item) => !DISABLED_ITEM_IDS.includes(item.id) && !allowedSeedItemIds.has(item.id),
  );
  const normalizedItems = [...seed.items, ...customItems];
  const allowedItemIds = new Set(normalizedItems.map((item) => item.id));
  const knownSessionIds = new Set(seed.sessions.map((session) => session.id));
  const normalizedSessions = normalizeSessionsForLessonSeeds([
    ...(database?.sessions || []).filter((session) => !SESSION_GROUP_IDS.includes(session.id)),
    ...(database?.sessions || []).filter((session) => SESSION_GROUP_IDS.includes(session.id)),
  ]);
  const students = (database?.students || seed.students).map((student) => ({
    ...student,
    id: student.loginKey || student.id,
    selectedCharacter: normalizeCharacterId(student.selectedCharacter),
    inventory: (student.inventory || []).filter((entry) => allowedItemIds.has(entry.itemId)),
  }));
  const logs = (database?.logs || []).filter((log) => {
    if (!log?.payload?.itemId) {
      return true;
    }

    return allowedItemIds.has(log.payload.itemId);
  });

  return {
    ...seed,
    items: normalizedItems,
    sessions: normalizedSessions,
    classroom: {
      ...(database?.classroom || seed.classroom),
      activeSessionId: knownSessionIds.has(database?.classroom?.activeSessionId)
        ? database.classroom.activeSessionId
        : seed.classroom.activeSessionId,
    },
    admins: database?.admins?.length ? database.admins : seed.admins,
    students,
    logs,
    __seedVersion: MOCK_DATA_VERSION,
  };
}

function readDb() {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const seed = createFreshSeed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    const database = JSON.parse(raw);

    if (needsMockMigration(database)) {
      const migratedDatabase = migrateMockDatabase(database);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedDatabase));
      return migratedDatabase;
    }

    return database;
  } catch (error) {
    const seed = createFreshSeed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

function writeDb(database) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

function orderByUpdatedAt(list) {
  return [...list].sort((left, right) => String(right.updatedAt || '').localeCompare(String(left.updatedAt || '')));
}

function orderLogs(logs) {
  return [...logs].sort((left, right) => String(right.timestamp).localeCompare(String(left.timestamp)));
}

function buildSnapshot(database) {
  return {
    mode: 'mock',
    classroom: decodeUnicodeDeep(database.classroom || DEFAULT_CLASSROOM),
    characters: decodeUnicodeDeep(CHARACTERS),
    admins: decodeUnicodeDeep(database.admins || []),
    students: orderByUpdatedAt(database.students || []).map((student) => ({
      ...decodeUnicodeDeep(student),
      id: student.loginKey || student.id,
      selectedCharacter: normalizeCharacterId(student.selectedCharacter),
    })),
    items: decodeUnicodeDeep(
      orderByUpdatedAt((database.items || []).filter((item) => !DISABLED_ITEM_IDS.includes(item.id))),
    ),
    sessions: decodeUnicodeDeep(sortSessionsByStructure(normalizeSessionsForLessonSeeds(database.sessions || []))),
    logs: decodeUnicodeDeep(orderLogs(database.logs || [])),
  };
}

function findEntity(list, id, label) {
  const entity = list.find((item) => item.id === id);

  if (!entity) {
    throw new Error(`${label} 정보를 찾지 못했습니다.`);
  }

  return entity;
}

function findStudentEntity(list, studentId) {
  const entity = list.find((item) => item.id === studentId || item.loginKey === studentId);

  if (!entity) {
    throw new Error('학생 정보를 찾지 못했습니다.');
  }

  return entity;
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

function delay(value) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), 120);
  });
}

export function createMockRepository() {
  return {
    mode: 'mock',

    async bootstrap() {
      return delay(buildSnapshot(readDb()));
    },

    async studentLogin(credentials) {
      const database = readDb();
      const loginKey = getLoginKey(credentials);
      const student = database.students.find(
        (item) => item.loginKey === loginKey && item.password4digit === String(credentials.password4digit),
      );

      if (!student) {
        throw new Error('학생 로그인 정보를 다시 확인해 주세요.');
      }

      return delay(decodeUnicodeDeep({
        ...student,
        id: student.loginKey || student.id,
        selectedCharacter: normalizeCharacterId(student.selectedCharacter),
      }));
    },

    async adminLogin({ loginId, password }) {
      const database = readDb();
      const admin = database.admins.find(
        (item) => item.loginId === String(loginId).trim() && item.password === String(password).trim(),
      );

      if (!admin) {
        throw new Error('선생님 로그인 정보를 다시 확인해 주세요.');
      }

      return delay(decodeUnicodeDeep(admin));
    },

    async saveCharacter(studentId, characterId) {
      const database = readDb();
      const student = findStudentEntity(database.students, studentId);
      student.selectedCharacter = normalizeCharacterId(characterId);
      student.updatedAt = new Date().toISOString();
      database.logs.push(
        createLog({
          studentId,
          actionType: 'character_selected',
          payload: { selectedCharacter: student.selectedCharacter },
        }),
      );
      writeDb(database);

      return delay({
        ...student,
        id: student.loginKey || student.id,
      });
    },

    async submitRewardPlan({ studentId, sessionId, enteredScore, plan }) {
      const database = readDb();
      const student = findStudentEntity(database.students, studentId);
      const itemsById = Object.fromEntries(database.items.map((item) => [item.id, item]));
      const result = commitRewardPlan({ student, plan, enteredScore, sessionId, itemsById });

      student.inventory = result.inventory;
      student.updatedAt = new Date().toISOString();
      database.logs.push(...result.logs);
      writeDb(database);

      return delay({ student, logs: result.logs });
    },

    async selectPet({ studentId, itemId, sessionId, customName, replaceEntryId }) {
      const database = readDb();
      const student = findStudentEntity(database.students, studentId);
      const item = findEntity(database.items, itemId, 'Item');
      const itemsById = Object.fromEntries(database.items.map((entry) => [entry.id, entry]));
      const result = selectPetForStudent({
        student,
        item,
        sessionId,
        customName,
        replaceEntryId,
        itemsById,
      });

      student.inventory = result.inventory;
      student.updatedAt = new Date().toISOString();
      database.logs.push(...result.logs);
      writeDb(database);

      return delay({ student, logs: result.logs });
    },

    async selectSpecialItem({ studentId, itemId, sessionId, replaceEntryId }) {
      const database = readDb();
      const student = findStudentEntity(database.students, studentId);
      const item = findEntity(database.items, itemId, 'Item');
      const itemsById = Object.fromEntries(database.items.map((entry) => [entry.id, entry]));
      const result = selectSpecialItemForStudent({
        student,
        item,
        sessionId,
        replaceEntryId,
        itemsById,
      });

      student.inventory = result.inventory;
      student.updatedAt = new Date().toISOString();
      database.logs.push(...result.logs);
      writeDb(database);

      return delay({ student, logs: result.logs });
    },

    async selectMissionItems({ studentId, itemIds, sessionId, replaceEntryIds = [] }) {
      const database = readDb();
      const student = findStudentEntity(database.students, studentId);
      const selectedItems = (itemIds || []).map((itemId) => findEntity(database.items, itemId, 'Item'));
      const itemsById = Object.fromEntries(database.items.map((entry) => [entry.id, entry]));
      const result = selectMissionItemsForStudent({
        student,
        items: selectedItems,
        sessionId,
        replaceEntryIds,
        itemsById,
      });

      student.inventory = result.inventory;
      student.updatedAt = new Date().toISOString();
      database.logs.push(...result.logs);
      writeDb(database);

      return delay({ student, logs: result.logs });
    },

    async createStudent(values) {
      const database = readDb();
      const nextStudent = normalizeStudentInput(values);

      if (database.students.some((student) => student.id === nextStudent.id)) {
        throw new Error('이미 등록된 학년/반/번호입니다.');
      }

      database.students.push(nextStudent);
      writeDb(database);
      return delay(nextStudent);
    },

    async updateStudent(studentId, values) {
      const database = readDb();
      const existingStudent = findStudentEntity(database.students, studentId);
      const nextStudent = normalizeStudentInput({ ...existingStudent, ...values }, existingStudent);

      if (studentId !== nextStudent.id && database.students.some((student) => student.id === nextStudent.id)) {
        throw new Error('수정하려는 학년/반/번호가 이미 사용 중입니다.');
      }

      database.students = database.students.filter((student) => student.id !== studentId);
      database.students.push({
        ...nextStudent,
        inventory: existingStudent.inventory || [],
      });
      writeDb(database);
      return delay(nextStudent);
    },

    async deleteStudent(studentId) {
      const database = readDb();
      database.students = database.students.filter((student) => student.id !== studentId);
      writeDb(database);
      return delay(true);
    },

    async createItem(values) {
      const database = readDb();
      const nextItem = normalizeItemInput(values);
      database.items.push(nextItem);
      writeDb(database);
      return delay(nextItem);
    },

    async updateItem(itemId, values) {
      const database = readDb();
      const existingItem = findEntity(database.items, itemId, 'Item');
      const nextItem = normalizeItemInput({ ...existingItem, ...values, id: itemId }, existingItem);
      database.items = database.items.filter((item) => item.id !== itemId);
      database.items.push(nextItem);
      writeDb(database);
      return delay(nextItem);
    },

    async deleteItem(itemId) {
      const database = readDb();
      database.items = database.items.filter((item) => item.id !== itemId);
      writeDb(database);
      return delay(true);
    },

    async createSession(values) {
      const database = readDb();
      const nextSession = normalizeSessionInput(values);
      database.sessions.push(nextSession);

      if (!database.classroom?.activeSessionId) {
        database.classroom = {
          ...(database.classroom || DEFAULT_CLASSROOM),
          activeSessionId: nextSession.id,
          updatedAt: new Date().toISOString(),
        };
      }

      writeDb(database);
      return delay(nextSession);
    },

    async updateSession(sessionId, values) {
      const database = readDb();
      const existingSession = findEntity(database.sessions, sessionId, 'Session');
      const nextSession = normalizeSessionInput({ ...existingSession, ...values, id: sessionId }, existingSession);
      database.sessions = database.sessions.filter((session) => session.id !== sessionId);
      database.sessions.push(nextSession);
      writeDb(database);
      return delay(nextSession);
    },

    async deleteSession(sessionId) {
      const database = readDb();
      database.sessions = database.sessions.filter((session) => session.id !== sessionId);

      if (database.classroom?.activeSessionId === sessionId) {
        database.classroom = {
          ...(database.classroom || DEFAULT_CLASSROOM),
          activeSessionId: database.sessions[0]?.id || DEFAULT_CLASSROOM.activeSessionId,
          updatedAt: new Date().toISOString(),
        };
      }

      writeDb(database);
      return delay(true);
    },

    async updateCurrentSession(sessionId) {
      const database = readDb();
      const session = findEntity(database.sessions, sessionId, 'Session');
      const now = new Date().toISOString();
      database.classroom = {
        ...(database.classroom || DEFAULT_CLASSROOM),
        activeSessionId: session.id,
        updatedAt: now,
      };
      writeDb(database);
      return delay(database.classroom);
    },

    async giveBonusItemToStudent({ studentId, itemId, sessionId }) {
      const database = readDb();
      const student = findStudentEntity(database.students, studentId);
      const item = findEntity(database.items, itemId, 'Item');
      const result = grantAdminBonus({ student, item, sessionId });

      student.inventory = result.inventory;
      student.updatedAt = new Date().toISOString();
      database.logs.push(...result.logs);
      writeDb(database);

      return delay({ student, logs: result.logs });
    },

    async giveBonusItemToAll({ itemId, sessionId }) {
      const database = readDb();
      const item = findEntity(database.items, itemId, 'Item');
      let successCount = 0;
      let skippedCount = 0;

      database.students = database.students.map((student) => {
        try {
          const result = grantAdminBonus({ student, item, sessionId });
          successCount += 1;
          database.logs.push(...result.logs);
          return {
            ...student,
            inventory: result.inventory,
            updatedAt: new Date().toISOString(),
          };
        } catch (error) {
          skippedCount += 1;
          return student;
        }
      });

      writeDb(database);
      return delay({ successCount, skippedCount });
    },

    async removeInventoryEntry({ studentId, inventoryEntryId, sessionId }) {
      const database = readDb();
      const student = findStudentEntity(database.students, studentId);
      const itemsById = Object.fromEntries(database.items.map((item) => [item.id, item]));
      const result = removeInventoryEntryForAdmin({ student, inventoryEntryId, sessionId, itemsById });

      student.inventory = result.inventory;
      student.updatedAt = new Date().toISOString();
      database.logs.push(...result.logs);
      writeDb(database);

      return delay({ student, logs: result.logs });
    },

    async resetMockData() {
      writeDb(createFreshSeed());
      return delay(true);
    },
  };
}
