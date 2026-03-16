import { MAX_INVENTORY_SLOTS, normalizeCharacterId } from '../utils/constants';
import { createId, createInventoryEntry, getItemCost, getLoginKey, normalizeCustomName } from '../utils/inventory';
import {
  buildSessionIdFromLesson,
  extractLessonNumber,
  getItemAcquisitionType,
  getItemAllowedCharacters,
  getItemImage,
  getItemLessons,
  getItemRewardGroup,
  getSessionGroupDefinitionById,
  getSessionGroupDefinitionByRewardGroup,
  getSessionLessons,
  getSessionRewardGroup,
  getSessionSortOrder,
} from '../data/lessonItemSeeds';

function toNumber(value) {
  return Number(value);
}

function ensureArray(value) {
  return Array.isArray(value) ? [...new Set(value.filter(Boolean))] : [];
}

function getPetSpecies(item) {
  return String(item?.petSpecies || item?.id || '').replace('lesson5_', '');
}

function discardInventoryEntries({
  inventory,
  replaceEntryIds,
  studentId,
  sessionId,
  itemsById = {},
  replacementItemId = '',
}) {
  const nextInventory = [...(inventory || [])];
  const logs = [];
  const uniqueReplaceEntryIds = [...new Set((replaceEntryIds || []).filter(Boolean))];

  uniqueReplaceEntryIds.forEach((replaceEntryId) => {
    const replaceIndex = nextInventory.findIndex((entry) => entry.id === replaceEntryId);

    if (replaceIndex === -1) {
      throw new Error('버릴 아이템을 다시 선택해 주세요.');
    }

    const [discardedEntry] = nextInventory.splice(replaceIndex, 1);

    logs.push(
      createLog({
        studentId,
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

export function ensurePassword4digit(password) {
  const normalized = String(password || '').trim();

  if (!/^\d{4}$/.test(normalized)) {
    throw new Error('비밀번호는 4자리 숫자로 입력해 주세요.');
  }

  return normalized;
}

export function createLog({ studentId, sessionId, actionType, payload, timestamp }) {
  return {
    id: createId('log'),
    studentId,
    sessionId: sessionId || null,
    actionType,
    payload: payload || {},
    timestamp: timestamp || new Date().toISOString(),
  };
}

export function normalizeStudentInput(values, existingStudent = {}) {
  const grade = toNumber(values.grade);
  const classNumber = toNumber(values.classNumber);
  const studentNumber = toNumber(values.studentNumber);
  const name = String(values.name || '').trim();
  const nickname = String(values.nickname || '').trim();
  const passwordCandidate =
    values.password4digit === undefined || values.password4digit === ''
      ? existingStudent.password4digit
      : values.password4digit;

  if (!grade || !classNumber || !studentNumber || !name) {
    throw new Error('학년, 반, 번호, 이름을 모두 입력해 주세요.');
  }

  const now = new Date().toISOString();
  const loginKey = getLoginKey({ grade, classNumber, studentNumber });

  return {
    ...existingStudent,
    id: loginKey,
    loginKey,
    grade,
    classNumber,
    studentNumber,
    name,
    nickname: nickname || name,
    password4digit: ensurePassword4digit(passwordCandidate),
    selectedCharacter: normalizeCharacterId(
      values.selectedCharacter !== undefined
        ? values.selectedCharacter
        : existingStudent.selectedCharacter || '',
    ),
    inventory: existingStudent.inventory || [],
    createdAt: existingStudent.createdAt || now,
    updatedAt: now,
  };
}

export function normalizeItemInput(values, existingItem = {}) {
  const name = String(values.name || '').trim();

  if (!name) {
    throw new Error('아이템 이름을 입력해 주세요.');
  }

  const now = new Date().toISOString();
  const mergedItem = { ...existingItem, ...values };
  const activeSessions = ensureArray(values.activeSessions ?? existingItem.activeSessions);
  const rewardGroup =
    String(values.rewardGroup || existingItem.rewardGroup || getItemRewardGroup(mergedItem) || '').trim();
  const matchedRewardGroup = getSessionGroupDefinitionByRewardGroup(rewardGroup);
  const lessons = getItemLessons({
    ...mergedItem,
    rewardGroup,
    lessons: values.lessons !== undefined ? values.lessons : existingItem.lessons,
    lesson: values.lesson !== undefined ? values.lesson : existingItem.lesson,
  });
  const lesson =
    Math.max(
      Number(values.lesson ?? existingItem.lesson ?? lessons[0] ?? extractLessonNumber(activeSessions[0])),
      0,
    ) || lessons[0] || extractLessonNumber(activeSessions[0]);
  const normalizedActiveSessions = activeSessions.length
    ? activeSessions
    : matchedRewardGroup
      ? [matchedRewardGroup.id]
      : lesson
        ? [buildSessionIdFromLesson(lesson)]
        : [];
  const allowedCharacters = getItemAllowedCharacters({
    ...mergedItem,
    allowedCharacters:
      values.allowedCharacters !== undefined
        ? values.allowedCharacters
        : values.applicableCharacters !== undefined
          ? values.applicableCharacters
          : existingItem.allowedCharacters ?? existingItem.applicableCharacters,
  });
  const acquisitionType = getItemAcquisitionType(mergedItem);
  const cost = Math.max(Number(values.cost ?? values.price ?? existingItem.cost ?? existingItem.price ?? 0), 0);
  const image = getItemImage({
    ...mergedItem,
    image: values.image !== undefined ? values.image : values.imageUrl,
  });

  return {
    ...existingItem,
    id: values.id || existingItem.id || createId('item'),
    lesson,
    lessons,
    rewardGroup: rewardGroup || matchedRewardGroup?.rewardGroup || '',
    name,
    image,
    allowedCharacters,
    acquisitionType,
    cost,
    description: String(values.description || '').trim(),
    price: cost,
    imageUrl: image,
    petSpecies: String(values.petSpecies ?? existingItem.petSpecies ?? '').trim(),
    applicableCharacters: allowedCharacters.includes('all') ? [] : allowedCharacters,
    type: acquisitionType === 'select' ? 'purchase' : acquisitionType,
    activeSessions: normalizedActiveSessions,
    createdAt: existingItem.createdAt || now,
    updatedAt: now,
  };
}

export function normalizeSessionInput(values, existingSession = {}) {
  const title = String(values.title || '').trim();

  if (!title) {
    throw new Error('차시 이름을 입력해 주세요.');
  }

  const now = new Date().toISOString();
  const sessionId = values.id || existingSession.id || createId('session');
  const matchedSession = getSessionGroupDefinitionById(sessionId);
  const lessons = getSessionLessons({
    ...existingSession,
    ...values,
    id: sessionId,
    lessons: values.lessons !== undefined ? values.lessons : existingSession.lessons,
  });
  const rewardGroup =
    String(values.rewardGroup || existingSession.rewardGroup || getSessionRewardGroup({ id: sessionId, lessons }) || '')
      .trim();
  const label = values.label || existingSession.label || matchedSession?.label || title;
  const sortOrder = Number(values.sortOrder ?? existingSession.sortOrder ?? getSessionSortOrder({ id: sessionId }));

  return {
    ...existingSession,
    id: sessionId,
    label,
    title: matchedSession?.label || title,
    lessons,
    rewardGroup,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 999,
    shopOpen: Boolean(values.shopOpen),
    purchaseItems: ensureArray(values.purchaseItems),
    bonusItems: ensureArray(values.bonusItems),
    petItems: ensureArray(values.petItems ?? existingSession.petItems),
    specialItems: ensureArray(values.specialItems ?? existingSession.specialItems),
    missionItems: ensureArray(values.missionItems ?? existingSession.missionItems),
    bonusEnabled: Boolean(values.bonusEnabled),
    notes: String(values.notes || '').trim(),
    createdAt: existingSession.createdAt || now,
    updatedAt: now,
  };
}

export function commitRewardPlan({ student, plan, enteredScore, sessionId, itemsById }) {
  if (!student) {
    throw new Error('학생 정보를 찾을 수 없습니다.');
  }

  const safeScore = Number(enteredScore);

  if (Number.isNaN(safeScore) || safeScore < 0) {
    throw new Error('오늘 점수를 다시 확인해 주세요.');
  }

  let inventory = [...(student.inventory || [])];
  let spentScore = 0;
  const logs = [
    createLog({
      studentId: student.id,
      sessionId,
      actionType: 'score_entered',
      payload: { enteredScore: safeScore },
    }),
  ];

  plan.forEach((step) => {
    const item = itemsById[step.itemId];

    if (!item) {
      throw new Error('존재하지 않는 아이템이 포함되어 있습니다.');
    }

    const cost = step.mode === 'purchase' ? getItemCost(item) : 0;
    spentScore += cost;

    if (spentScore > safeScore) {
      throw new Error('점수가 부족합니다. 아이템 계획을 다시 확인해 주세요.');
    }

    if (step.replaceEntryId) {
      const discardResult = discardInventoryEntries({
        inventory,
        replaceEntryIds: [step.replaceEntryId],
        studentId: student.id,
        sessionId,
        itemsById,
        replacementItemId: item.id,
      });

      inventory = discardResult.inventory;
      logs.push(...discardResult.logs);
    }

    if (inventory.length >= MAX_INVENTORY_SLOTS) {
      throw new Error('인벤토리가 가득 차 있습니다. 먼저 버릴 아이템을 선택해 주세요.');
    }

    const nextEntry = createInventoryEntry({
      itemId: item.id,
      sessionId,
      mode: step.mode,
      createdAt: step.createdAt,
    });

    inventory.push(nextEntry);
    logs.push(
      createLog({
        studentId: student.id,
        sessionId,
        actionType: step.mode === 'purchase' ? 'item_purchased' : 'item_bonus_received',
        payload: {
          itemId: item.id,
          itemName: item.name,
          cost,
          inventoryEntryId: nextEntry.id,
        },
      }),
    );
  });

  const remainingScore = Math.max(safeScore - spentScore, 0);

  logs.push(
    createLog({
      studentId: student.id,
      sessionId,
      actionType: 'session_closed',
      payload: {
        enteredScore: safeScore,
        spentScore,
        remainingScore,
      },
    }),
  );

  return {
    inventory,
    logs,
    spentScore,
    remainingScore,
  };
}

export function selectPetForStudent({ student, item, sessionId, customName, replaceEntryId = '', itemsById = {} }) {
  if (!student || !item) {
    throw new Error('학생 또는 펫 정보를 찾을 수 없습니다.');
  }

  if (getItemAcquisitionType(item) !== 'pet_select') {
    throw new Error('선택할 수 없는 펫입니다.');
  }

  const normalizedCustomName = normalizeCustomName(customName, 10);

  if (!normalizedCustomName) {
    throw new Error('펫 이름을 입력해 주세요.');
  }

  const lessonNumber = Number(item.lesson || 5);
  const existingPet = (student.inventory || []).find(
    (entry) => entry.type === 'pet' && Number(entry.lesson) === lessonNumber,
  );

  if (existingPet) {
    throw new Error('이미 5차시 펫을 선택했습니다.');
  }

  let nextInventory = [...(student.inventory || [])];
  const logs = [];

  if (nextInventory.length >= MAX_INVENTORY_SLOTS) {
    if (!replaceEntryId) {
      throw new Error('인벤토리가 가득 차서 펫을 바로 추가할 수 없습니다.');
    }

    const discardResult = discardInventoryEntries({
      inventory: nextInventory,
      replaceEntryIds: [replaceEntryId],
      studentId: student.id,
      sessionId,
      itemsById,
      replacementItemId: item.id,
    });

    nextInventory = discardResult.inventory;
    logs.push(...discardResult.logs);
  }

  if (nextInventory.length >= MAX_INVENTORY_SLOTS) {
    throw new Error('인벤토리가 가득 차서 펫을 추가할 수 없습니다.');
  }

  const nextEntry = createInventoryEntry({
    itemId: item.id,
    sessionId,
    mode: 'pet_select',
    type: 'pet',
    lesson: lessonNumber,
    petSpecies: getPetSpecies(item),
    customName: normalizedCustomName,
    image: item.image || item.imageUrl || '',
  });

  return {
    inventory: [...nextInventory, nextEntry],
    logs: [
      ...logs,
      createLog({
        studentId: student.id,
        sessionId,
        actionType: 'pet_selected',
        payload: {
          itemId: item.id,
          itemName: item.name,
          customName: normalizedCustomName,
          petSpecies: getPetSpecies(item),
          inventoryEntryId: nextEntry.id,
        },
      }),
    ],
  };
}

export function selectSpecialItemForStudent({ student, item, sessionId, replaceEntryId = '', itemsById = {} }) {
  if (!student || !item) {
    throw new Error('학생 또는 카메라 정보를 찾을 수 없습니다.');
  }

  if (getItemAcquisitionType(item) !== 'special_select') {
    throw new Error('선택할 수 없는 카메라입니다.');
  }

  const lessonNumber = Number(item.lesson || 6);
  const existingSpecialItem = (student.inventory || []).find(
    (entry) => entry.type === 'special_select' && Number(entry.lesson) === lessonNumber,
  );

  if (existingSpecialItem) {
    throw new Error('이미 6차시 카메라를 선택했습니다.');
  }

  let nextInventory = [...(student.inventory || [])];
  const logs = [];

  if (nextInventory.length >= MAX_INVENTORY_SLOTS) {
    if (!replaceEntryId) {
      throw new Error('인벤토리가 가득 차서 카메라를 바로 추가할 수 없습니다.');
    }

    const discardResult = discardInventoryEntries({
      inventory: nextInventory,
      replaceEntryIds: [replaceEntryId],
      studentId: student.id,
      sessionId,
      itemsById,
      replacementItemId: item.id,
    });

    nextInventory = discardResult.inventory;
    logs.push(...discardResult.logs);
  }

  if (nextInventory.length >= MAX_INVENTORY_SLOTS) {
    throw new Error('인벤토리가 가득 차서 카메라를 추가할 수 없습니다.');
  }

  const nextEntry = createInventoryEntry({
    itemId: item.id,
    sessionId,
    mode: 'special_select',
    type: 'special_select',
    lesson: lessonNumber,
    image: item.image || item.imageUrl || '',
  });

  return {
    inventory: [...nextInventory, nextEntry],
    logs: [
      ...logs,
      createLog({
        studentId: student.id,
        sessionId,
        actionType: 'special_item_selected',
        payload: {
          itemId: item.id,
          itemName: item.name,
          inventoryEntryId: nextEntry.id,
        },
      }),
    ],
  };
}

export function selectMissionItemsForStudent({ student, items, sessionId, replaceEntryIds = [], itemsById = {} }) {
  if (!student || !Array.isArray(items) || !items.length) {
    throw new Error('선택한 미션 보상을 찾을 수 없습니다.');
  }

  const lessonNumber = Number(items[0].lesson || 10);
  const rewardGroup = items[0].rewardGroup || '';
  const uniqueItems = [...new Map(items.map((item) => [item.id, item])).values()];

  if (uniqueItems.some((item) => getItemAcquisitionType(item) !== 'mission_select')) {
    throw new Error('선택할 수 없는 미션 보상이 포함되어 있습니다.');
  }

  let nextInventory = [...(student.inventory || [])];
  const existingMissionItemIds = new Set(
    nextInventory
      .filter(
        (entry) =>
          entry.type === 'mission_select' &&
          (entry.rewardGroup === rewardGroup || Number(entry.lesson) === lessonNumber),
      )
      .map((entry) => entry.itemId),
  );

  const selectableItems = uniqueItems.filter((item) => !existingMissionItemIds.has(item.id));

  if (!selectableItems.length) {
    throw new Error('이미 선택한 미션 보상입니다.');
  }

  const neededDiscardCount = Math.max(nextInventory.length + selectableItems.length - MAX_INVENTORY_SLOTS, 0);
  const logs = [];

  if (neededDiscardCount > 0) {
    if ((replaceEntryIds || []).filter(Boolean).length < neededDiscardCount) {
      throw new Error('버릴 아이템을 더 선택해 주세요.');
    }

    const discardResult = discardInventoryEntries({
      inventory: nextInventory,
      replaceEntryIds: replaceEntryIds.slice(0, neededDiscardCount),
      studentId: student.id,
      sessionId,
      itemsById,
      replacementItemId: selectableItems.map((item) => item.id).join(','),
    });

    nextInventory = discardResult.inventory;
    logs.push(...discardResult.logs);
  }

  if (nextInventory.length + selectableItems.length > MAX_INVENTORY_SLOTS) {
    throw new Error('인벤토리가 가득 차서 미션 보상을 추가할 수 없습니다.');
  }

  selectableItems.forEach((item) => {
    const nextEntry = createInventoryEntry({
      itemId: item.id,
      sessionId,
      mode: 'mission_select',
      type: 'mission_select',
      lesson: lessonNumber,
      rewardGroup,
      image: item.image || item.imageUrl || '',
    });

    nextInventory.push(nextEntry);
    logs.push(
      createLog({
        studentId: student.id,
        sessionId,
        actionType: 'mission_item_selected',
        payload: {
          itemId: item.id,
          itemName: item.name,
          inventoryEntryId: nextEntry.id,
        },
      }),
    );
  });

  return {
    inventory: nextInventory,
    logs,
  };
}

export function grantAdminBonus({ student, item, sessionId }) {
  if (!student || !item) {
    throw new Error('학생 또는 아이템 정보를 찾을 수 없습니다.');
  }

  if ((student.inventory || []).length >= MAX_INVENTORY_SLOTS) {
    throw new Error('인벤토리가 가득 차 있어 보너스를 바로 지급할 수 없습니다.');
  }

  const nextEntry = createInventoryEntry({
    itemId: item.id,
    sessionId,
    mode: 'admin_bonus',
  });

  return {
    inventory: [...(student.inventory || []), nextEntry],
    logs: [
      createLog({
        studentId: student.id,
        sessionId,
        actionType: 'admin_bonus_given',
        payload: {
          itemId: item.id,
          itemName: item.name,
          customName: nextEntry.customName || '',
          inventoryEntryId: nextEntry.id,
        },
      }),
    ],
  };
}

export function removeInventoryEntryForAdmin({ student, inventoryEntryId, sessionId, itemsById = {} }) {
  const inventory = [...(student.inventory || [])];
  const removeIndex = inventory.findIndex((entry) => entry.id === inventoryEntryId);

  if (removeIndex === -1) {
    throw new Error('삭제할 인벤토리 칸을 찾지 못했습니다.');
  }

  const [removedEntry] = inventory.splice(removeIndex, 1);

  return {
    inventory,
    logs: [
      createLog({
        studentId: student.id,
        sessionId,
        actionType: 'admin_inventory_removed',
        payload: {
          itemId: removedEntry.itemId,
          itemName: removedEntry.customName || itemsById[removedEntry.itemId]?.name || '아이템',
          inventoryEntryId,
        },
      }),
    ],
  };
}
