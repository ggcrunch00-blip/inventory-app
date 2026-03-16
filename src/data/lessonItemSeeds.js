const ITEM_PLACEHOLDER = '/items/item-placeholder.png';

export const LEGACY_SAMPLE_ITEM_IDS = [
  'item-compass',
  'item-shield',
  'item-flag',
  'item-medal',
  'item-chest',
];

export const REPLACED_SESSION_1_ITEM_IDS = [
  'item-pearl-necklace',
  'item-sunglasses',
  'item-military-hat',
];

export const DISABLED_ITEM_IDS = [...LEGACY_SAMPLE_ITEM_IDS, ...REPLACED_SESSION_1_ITEM_IDS];

export const SESSION_GROUP_DEFINITIONS = [
  { id: 'session-1', label: '\u0031\uCC28\uC2DC', lessons: [1], rewardGroup: 'lesson1', sortOrder: 1 },
  { id: 'session-2', label: '\u0032\uCC28\uC2DC', lessons: [2], rewardGroup: 'lesson2', sortOrder: 2 },
  { id: 'session-3', label: '\u0033\uCC28\uC2DC', lessons: [3], rewardGroup: 'lesson3', sortOrder: 3 },
  { id: 'session-4', label: '\u0034\uCC28\uC2DC', lessons: [4], rewardGroup: 'lesson4', sortOrder: 4 },
  { id: 'session-5', label: '\u0035\uCC28\uC2DC', lessons: [5], rewardGroup: 'lesson5', sortOrder: 5 },
  { id: 'session-6', label: '\u0036\uCC28\uC2DC', lessons: [6], rewardGroup: 'lesson6', sortOrder: 6 },
  { id: 'session-7-8', label: '\u0037~\u0038\uCC28\uC2DC', lessons: [7, 8], rewardGroup: 'lesson7_8', sortOrder: 7 },
  { id: 'session-9', label: '\u0039\uCC28\uC2DC', lessons: [9], rewardGroup: 'lesson9', sortOrder: 8 },
  { id: 'session-10-11', label: '\u0031\u0030~\u0031\u0031\uCC28\uC2DC', lessons: [10, 11], rewardGroup: 'lesson10_11', sortOrder: 9 },
  { id: 'session-12', label: '\u0031\u0032\uCC28\uC2DC', lessons: [12], rewardGroup: 'lesson12', sortOrder: 10 },
  { id: 'session-13-14', label: '\u0031\u0033~\u0031\u0034\uCC28\uC2DC', lessons: [13, 14], rewardGroup: 'lesson13_14', sortOrder: 11 },
  { id: 'session-15-16', label: '\u0031\u0035~\u0031\u0036\uCC28\uC2DC', lessons: [15, 16], rewardGroup: 'lesson15_16', sortOrder: 12 },
];

export const LESSON_ITEM_DEFINITIONS = [
  {
    id: 'lesson1_pearl_necklace',
    lesson: 1,
    lessons: [1],
    rewardGroup: 'lesson1',
    name: '\uC9C4\uC8FC \uBAA9\uAC78\uC774',
    image: '/items/lesson1_pearl_necklace.png',
    allowedCharacters: ['all'],
    acquisitionType: 'select',
    cost: 50,
    description: '\u0031\uCC28\uC2DC\uC5D0\uC11C \uC5BB\uC744 \uC218 \uC788\uB294 \uC7A5\uC2DD \uC544\uC774\uD15C\uC785\uB2C8\uB2E4.',
  },
  {
    id: 'lesson1_sunglasses',
    lesson: 1,
    lessons: [1],
    rewardGroup: 'lesson1',
    name: '\uC120\uAE00\uB77C\uC2A4',
    image: '/items/lesson1_sunglasses.png',
    allowedCharacters: ['all'],
    acquisitionType: 'select',
    cost: 40,
    description: '\u0031\uCC28\uC2DC\uC5D0\uC11C \uC5BB\uC744 \uC218 \uC788\uB294 \uC7A5\uC2DD \uC544\uC774\uD15C\uC785\uB2C8\uB2E4.',
  },
  {
    id: 'lesson1_military_hat',
    lesson: 1,
    lessons: [1],
    rewardGroup: 'lesson1',
    name: '\uAD70\uC778 \uBAA8\uC790',
    image: '/items/lesson1_military_hat.png',
    allowedCharacters: ['all'],
    acquisitionType: 'select',
    cost: 60,
    description: '\u0031\uCC28\uC2DC\uC5D0\uC11C \uC5BB\uC744 \uC218 \uC788\uB294 \uC7A5\uC2DD \uC544\uC774\uD15C\uC785\uB2C8\uB2E4.',
  },
  {
    id: 'lesson2_scissors',
    lesson: 2,
    lessons: [2],
    rewardGroup: 'lesson2',
    name: '\uAC00\uC704',
    image: '/items/lesson2_scissors.png',
    allowedCharacters: ['maru', 'yeouli'],
    acquisitionType: 'select',
    cost: 50,
    description: '\u0032\uCC28\uC2DC\uC5D0\uC11C \uACE0\uB97C \uC218 \uC788\uB294 \uC544\uC774\uD15C\uC785\uB2C8\uB2E4.',
  },
  {
    id: 'lesson2_branch',
    lesson: 2,
    lessons: [2],
    rewardGroup: 'lesson2',
    name: '\uB098\uBB47\uAC00\uC9C0',
    image: '/items/lesson2_branch.png',
    allowedCharacters: ['deogi'],
    acquisitionType: 'select',
    cost: 35,
    description: '\u0032\uCC28\uC2DC\uC5D0\uC11C \uACE0\uB97C \uC218 \uC788\uB294 \uC544\uC774\uD15C\uC785\uB2C8\uB2E4.',
  },
  {
    id: 'lesson2_slingshot_set',
    lesson: 2,
    lessons: [2],
    rewardGroup: 'lesson2',
    name: '\uC0C8\uCD1D \uC138\uD2B8',
    image: '/items/lesson2_slingshot_set.png',
    allowedCharacters: ['all'],
    acquisitionType: 'select',
    cost: 35,
    description: '\u0032\uCC28\uC2DC\uC5D0\uC11C \uACE0\uB97C \uC218 \uC788\uB294 \uC544\uC774\uD15C\uC785\uB2C8\uB2E4.',
  },
  {
    id: 'lesson2_bonus_mystic_compass',
    lesson: 2,
    lessons: [2],
    rewardGroup: 'lesson2',
    name: '\uC2E0\uBE44\uC758 \uB098\uCE68\uBC18',
    image: '/items/lesson2_bonus_mystic_compass.png',
    allowedCharacters: ['all'],
    acquisitionType: 'teacher_award',
    cost: 0,
    description: '\uC120\uC0DD\uB2D8\uC774 \uD544\uC694\uD560 \uB54C \uC218\uB3D9\uC73C\uB85C \uC9C0\uAE09\uD558\uB294 \uBCF4\uB108\uC2A4 \uC544\uC774\uD15C\uC785\uB2C8\uB2E4.',
  },
  {
    id: 'lesson3_wildflower',
    lesson: 3,
    lessons: [3],
    rewardGroup: 'lesson3',
    name: '\uB4E4\uAF43',
    image: '/items/lesson3_wildflower.png',
    allowedCharacters: ['all'],
    acquisitionType: 'select',
    cost: 5,
    description: '\u0033\uCC28\uC2DC\uC5D0\uC11C \uACE0\uB97C \uC218 \uC788\uB294 \uC544\uC774\uD15C\uC785\uB2C8\uB2E4.',
  },
  {
    id: 'lesson3_fire_ant_army',
    lesson: 3,
    lessons: [3],
    rewardGroup: 'lesson3',
    name: '\uBD88\uAC1C\uBBF8 \uAD70\uB2E8',
    image: '/items/lesson3_fire_ant_army.png',
    allowedCharacters: ['all'],
    acquisitionType: 'select',
    cost: 35,
    description: '\u0033\uCC28\uC2DC\uC5D0\uC11C \uACE0\uB97C \uC218 \uC788\uB294 \uC544\uC774\uD15C\uC785\uB2C8\uB2E4.',
  },
  {
    id: 'lesson3_club',
    lesson: 3,
    lessons: [3],
    rewardGroup: 'lesson3',
    name: '\uBABD\uB465\uC774',
    image: '/items/lesson3_club.png',
    allowedCharacters: ['all'],
    acquisitionType: 'select',
    cost: 35,
    description: '\u0033\uCC28\uC2DC\uC5D0\uC11C \uACE0\uB97C \uC218 \uC788\uB294 \uC544\uC774\uD15C\uC785\uB2C8\uB2E4.',
  },
  {
    id: 'lesson3_bonus_magnifying_glass',
    lesson: 3,
    lessons: [3],
    rewardGroup: 'lesson3',
    name: '\uB3CB\uBCF4\uAE30',
    image: '/items/lesson3_bonus_magnifying_glass.png',
    allowedCharacters: ['all'],
    acquisitionType: 'teacher_award',
    cost: 0,
    description: '\uC120\uC0DD\uB2D8\uC774 \uD544\uC694\uD560 \uB54C \uC218\uB3D9\uC73C\uB85C \uC9C0\uAE09\uD558\uB294 \uBCF4\uB108\uC2A4 \uC544\uC774\uD15C\uC785\uB2C8\uB2E4.',
  },
  {
    id: 'lesson4_green_flip_flops',
    lesson: 4,
    lessons: [4],
    rewardGroup: 'lesson4',
    name: '\uCD08\uB85D \uCAFC\uB9AC',
    image: '/items/lesson4_green_flip_flops.png',
    allowedCharacters: ['all'],
    acquisitionType: 'select',
    cost: 50,
    description: '\u0034\uCC28\uC2DC\uC5D0\uC11C \uACE0\uB97C \uC218 \uC788\uB294 \uC544\uC774\uD15C\uC785\uB2C8\uB2E4.',
  },
  {
    id: 'lesson4_red_shoes',
    lesson: 4,
    lessons: [4],
    rewardGroup: 'lesson4',
    name: '\uBE68\uAC04 \uAD6C\uB450',
    image: '/items/lesson4_red_shoes.png',
    allowedCharacters: ['all'],
    acquisitionType: 'select',
    cost: 30,
    description: '\u0034\uCC28\uC2DC\uC5D0\uC11C \uACE0\uB97C \uC218 \uC788\uB294 \uC544\uC774\uD15C\uC785\uB2C8\uB2E4.',
  },
  {
    id: 'lesson4_handmade_shoes',
    lesson: 4,
    lessons: [4],
    rewardGroup: 'lesson4',
    name: '\uB0B4\uAC00 \uB9CC\uB4E0 \uC2E0\uBC1C',
    image: '/items/lesson4_handmade_shoes.png',
    allowedCharacters: ['all'],
    acquisitionType: 'select',
    cost: 100,
    description: '\u0034\uCC28\uC2DC\uC5D0\uC11C \uACE0\uB97C \uC218 \uC788\uB294 \uC544\uC774\uD15C\uC785\uB2C8\uB2E4.',
  },
  {
    id: 'lesson5_crab',
    lesson: 5,
    lessons: [5],
    rewardGroup: 'lesson5',
    name: '\uAF43\uAC8C',
    image: '/items/lesson5_crab.png',
    allowedCharacters: ['all'],
    acquisitionType: 'pet_select',
    cost: 0,
    petSpecies: 'crab',
    description: '\u0035\uCC28\uC2DC\uC5D0\uC11C \uC120\uD0DD\uD560 \uC218 \uC788\uB294 \uD380 \uC785\uB2C8\uB2E4.',
  },
  {
    id: 'lesson5_seagull',
    lesson: 5,
    lessons: [5],
    rewardGroup: 'lesson5',
    name: '\uAC08\uB9E4\uAE30',
    image: '/items/lesson5_seagull.png',
    allowedCharacters: ['all'],
    acquisitionType: 'pet_select',
    cost: 0,
    petSpecies: 'seagull',
    description: '\u0035\uCC28\uC2DC\uC5D0\uC11C \uC120\uD0DD\uD560 \uC218 \uC788\uB294 \uD380 \uC785\uB2C8\uB2E4.',
  },
  {
    id: 'lesson5_starfish',
    lesson: 5,
    lessons: [5],
    rewardGroup: 'lesson5',
    name: '\uBD88\uAC00\uC0AC\uB9AC',
    image: '/items/lesson5_starfish.png',
    allowedCharacters: ['all'],
    acquisitionType: 'pet_select',
    cost: 0,
    petSpecies: 'starfish',
    description: '\u0035\uCC28\uC2DC\uC5D0\uC11C \uC120\uD0DD\uD560 \uC218 \uC788\uB294 \uD380 \uC785\uB2C8\uB2E4.',
  },
  {
    id: 'lesson6_film_camera',
    lesson: 6,
    lessons: [6],
    rewardGroup: 'lesson6',
    name: '필름 카메라',
    image: '/items/lesson6_film_camera.png',
    allowedCharacters: ['all'],
    acquisitionType: 'special_select',
    cost: 0,
    description: '6차시 스페셜 에디션에서 선택할 수 있는 카메라입니다.',
  },
  {
    id: 'lesson6_high_resolution_camera',
    lesson: 6,
    lessons: [6],
    rewardGroup: 'lesson6',
    name: '고화질 카메라',
    image: '/items/lesson6_high_resolution_camera.png',
    allowedCharacters: ['all'],
    acquisitionType: 'special_select',
    cost: 0,
    description: '6차시 스페셜 에디션에서 선택할 수 있는 카메라입니다.',
  },
  {
    id: 'lesson6_camera_drone',
    lesson: 6,
    lessons: [6],
    rewardGroup: 'lesson6',
    name: '카메라 드론',
    image: '/items/lesson6_camera_drone.png',
    allowedCharacters: ['all'],
    acquisitionType: 'special_select',
    cost: 0,
    description: '6차시 스페셜 에디션에서 선택할 수 있는 카메라입니다.',
  },
  {
    id: 'lesson10_11_gangchi_doll',
    lesson: 10,
    lessons: [10, 11],
    rewardGroup: 'lesson10_11',
    name: '강치 인형',
    image: '/items/lesson10_11_gangchi_doll.png',
    allowedCharacters: ['all'],
    acquisitionType: 'mission_select',
    cost: 0,
    description: '10~11차시 미션 성공 보상으로 선택할 수 있는 아이템입니다.',
  },
  {
    id: 'lesson10_11_dokdo_taegukgi',
    lesson: 10,
    lessons: [10, 11],
    rewardGroup: 'lesson10_11',
    name: '독도 태극기',
    image: '/items/lesson10_11_dokdo_taegukgi.png',
    allowedCharacters: ['all'],
    acquisitionType: 'mission_select',
    cost: 0,
    description: '10~11차시 미션 성공 보상으로 선택할 수 있는 아이템입니다.',
  },
  {
    id: 'lesson10_11_dokdo_umbrella',
    lesson: 10,
    lessons: [10, 11],
    rewardGroup: 'lesson10_11',
    name: '독도 우산',
    image: '/items/lesson10_11_dokdo_umbrella.png',
    allowedCharacters: ['all'],
    acquisitionType: 'mission_select',
    cost: 0,
    description: '10~11차시 미션 성공 보상으로 선택할 수 있는 아이템입니다.',
  },
];

export const SESSION_GROUP_IDS = SESSION_GROUP_DEFINITIONS.map((session) => session.id);

function dedupeArray(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function dedupeNumberArray(values) {
  return [...new Set((values || []).map((value) => Number(value)).filter((value) => value > 0))];
}

function getRewardGroupItems(rewardGroup) {
  return LESSON_ITEM_DEFINITIONS.filter((item) => item.rewardGroup === rewardGroup);
}

function mergeSessionItemIds(seedItemIds, existingItemIds) {
  return dedupeArray([
    ...(seedItemIds || []),
    ...((existingItemIds || []).filter((itemId) => !DISABLED_ITEM_IDS.includes(itemId))),
  ]);
}

function shouldAdoptSeedShopOpen(existingSession) {
  if (existingSession?.shopOpen === undefined) {
    return true;
  }

  return Boolean(existingSession?.createdAt) && existingSession.createdAt === existingSession.updatedAt;
}

export function getPurchaseItemIdsForRewardGroup(rewardGroup) {
  return getRewardGroupItems(rewardGroup)
    .filter((item) => item.acquisitionType === 'select')
    .map((item) => item.id);
}

export function getBonusItemIdsForRewardGroup(rewardGroup) {
  return getRewardGroupItems(rewardGroup)
    .filter((item) => !['select', 'pet_select', 'special_select', 'mission_select'].includes(item.acquisitionType))
    .map((item) => item.id);
}

export function getPetItemIdsForRewardGroup(rewardGroup) {
  return getRewardGroupItems(rewardGroup)
    .filter((item) => item.acquisitionType === 'pet_select')
    .map((item) => item.id);
}

export function getSpecialItemIdsForRewardGroup(rewardGroup) {
  return getRewardGroupItems(rewardGroup)
    .filter((item) => item.acquisitionType === 'special_select')
    .map((item) => item.id);
}

export function getMissionItemIdsForRewardGroup(rewardGroup) {
  return getRewardGroupItems(rewardGroup)
    .filter((item) => item.acquisitionType === 'mission_select')
    .map((item) => item.id);
}

export const SEEDED_ITEM_IDS = LESSON_ITEM_DEFINITIONS.map((item) => item.id);

export function getSessionGroupDefinitionById(sessionId) {
  return SESSION_GROUP_DEFINITIONS.find((session) => session.id === sessionId) || null;
}

export function getSessionGroupDefinitionByRewardGroup(rewardGroup) {
  return SESSION_GROUP_DEFINITIONS.find((session) => session.rewardGroup === rewardGroup) || null;
}

export function buildSessionIdFromLesson(lesson) {
  const normalizedLesson = Number(lesson || 0);
  const matchedSession = SESSION_GROUP_DEFINITIONS.find((session) => session.lessons.includes(normalizedLesson));
  return matchedSession?.id || '';
}

export function extractLessonNumber(sessionId) {
  const matchedSession = getSessionGroupDefinitionById(sessionId);
  return matchedSession?.lessons?.[0] || 0;
}

export function getSessionLabel(session) {
  const matchedSession = getSessionGroupDefinitionById(session?.id);
  return session?.label || session?.title || matchedSession?.label || '';
}

export function getSessionLessons(session) {
  if (Array.isArray(session?.lessons) && session.lessons.length) {
    return dedupeNumberArray(session.lessons);
  }

  const matchedSession = getSessionGroupDefinitionById(session?.id);
  return matchedSession ? [...matchedSession.lessons] : [];
}

export function getSessionRewardGroup(session) {
  if (session?.rewardGroup) {
    return session.rewardGroup;
  }

  const matchedSession = getSessionGroupDefinitionById(session?.id);
  return matchedSession?.rewardGroup || '';
}

export function getSessionSortOrder(session) {
  if (Number.isFinite(Number(session?.sortOrder))) {
    return Number(session.sortOrder);
  }

  const matchedSession = getSessionGroupDefinitionById(session?.id);
  return matchedSession?.sortOrder || 999;
}

export function getItemImage(item) {
  return String(item?.image || item?.imageUrl || ITEM_PLACEHOLDER).trim() || ITEM_PLACEHOLDER;
}

export function getItemLessons(item) {
  if (Array.isArray(item?.lessons) && item.lessons.length) {
    return dedupeNumberArray(item.lessons);
  }

  if (item?.lesson) {
    return dedupeNumberArray([item.lesson]);
  }

  const rewardGroupMatch = getSessionGroupDefinitionByRewardGroup(item?.rewardGroup);

  if (rewardGroupMatch) {
    return [...rewardGroupMatch.lessons];
  }

  return [];
}

export function getItemRewardGroup(item) {
  if (item?.rewardGroup) {
    return item.rewardGroup;
  }

  const lessons = getItemLessons(item);
  const matchedSession = SESSION_GROUP_DEFINITIONS.find(
    (session) =>
      session.lessons.length === lessons.length &&
      session.lessons.every((lessonNumber) => lessons.includes(lessonNumber)),
  );

  if (matchedSession) {
    return matchedSession.rewardGroup;
  }

  const activeSessionIds = Array.isArray(item?.activeSessions) ? item.activeSessions.filter(Boolean) : [];
  const activeSessionMatch = activeSessionIds.map((sessionId) => getSessionGroupDefinitionById(sessionId)).find(Boolean);
  return activeSessionMatch?.rewardGroup || '';
}

export function getItemAllowedCharacters(item) {
  const allowedCharacters = Array.isArray(item?.allowedCharacters) ? item.allowedCharacters.filter(Boolean) : [];

  if (allowedCharacters.length) {
    return dedupeArray(allowedCharacters);
  }

  const applicableCharacters = Array.isArray(item?.applicableCharacters) ? item.applicableCharacters.filter(Boolean) : [];

  if (applicableCharacters.length) {
    return dedupeArray(applicableCharacters);
  }

  return ['all'];
}

export function getItemAcquisitionType(item) {
  if (item?.acquisitionType) {
    return item.acquisitionType;
  }

  if (item?.type === 'purchase') {
    return 'select';
  }

  if (item?.type) {
    return item.type;
  }

  return 'select';
}

export function getItemSessionIds(item) {
  const activeSessions = Array.isArray(item?.activeSessions) ? item.activeSessions.filter(Boolean) : [];

  if (activeSessions.length) {
    return dedupeArray(activeSessions);
  }

  const rewardGroup = getItemRewardGroup(item);
  const matchedSession = getSessionGroupDefinitionByRewardGroup(rewardGroup);

  if (matchedSession) {
    return [matchedSession.id];
  }

  const lessons = getItemLessons(item);
  return lessons.length
    ? dedupeNumberArray(lessons)
        .map((lessonNumber) => buildSessionIdFromLesson(lessonNumber))
        .filter(Boolean)
    : [];
}

export function isCharacterAllowedForItem(item, characterId) {
  const allowedCharacters = getItemAllowedCharacters(item);
  return allowedCharacters.includes('all') || allowedCharacters.includes(characterId);
}

export function isItemAvailableForSession(item, session) {
  const sessionId = typeof session === 'string' ? session : session?.id;
  const sessionRewardGroup = typeof session === 'string' ? getSessionRewardGroup({ id: session }) : getSessionRewardGroup(session);
  const itemRewardGroup = getItemRewardGroup(item);

  if (sessionRewardGroup && itemRewardGroup) {
    return sessionRewardGroup === itemRewardGroup;
  }

  const sessionIds = getItemSessionIds(item);
  return !sessionIds.length || sessionIds.includes(sessionId);
}

export function toSeedItem(item, baseTime) {
  const allowedCharacters = getItemAllowedCharacters(item);
  const acquisitionType = getItemAcquisitionType(item);
  const sessionIds = getItemSessionIds(item);
  const lessons = getItemLessons(item);
  const rewardGroup = getItemRewardGroup(item);

  return {
    ...item,
    lesson: lessons[0] || 0,
    lessons,
    rewardGroup,
    image: getItemImage(item),
    allowedCharacters,
    acquisitionType,
    cost: Number(item.cost || 0),
    imageUrl: getItemImage(item),
    applicableCharacters: allowedCharacters.includes('all') ? [] : allowedCharacters,
    type: acquisitionType === 'select' ? 'purchase' : acquisitionType,
    price: Number(item.cost || 0),
    petSpecies: item.petSpecies || '',
    activeSessions: sessionIds,
    createdAt: baseTime,
    updatedAt: baseTime,
  };
}

function createSeedSessionFromDefinition(sessionDefinition, baseTime) {
  const purchaseItems = getPurchaseItemIdsForRewardGroup(sessionDefinition.rewardGroup);
  const bonusItems = getBonusItemIdsForRewardGroup(sessionDefinition.rewardGroup);
  const petItems = getPetItemIdsForRewardGroup(sessionDefinition.rewardGroup);
  const specialItems = getSpecialItemIdsForRewardGroup(sessionDefinition.rewardGroup);
  const missionItems = getMissionItemIdsForRewardGroup(sessionDefinition.rewardGroup);

  return {
    id: sessionDefinition.id,
    label: sessionDefinition.label,
    title: sessionDefinition.label,
    lessons: [...sessionDefinition.lessons],
    rewardGroup: sessionDefinition.rewardGroup,
    sortOrder: sessionDefinition.sortOrder,
    shopOpen: purchaseItems.length > 0 || petItems.length > 0 || specialItems.length > 0 || missionItems.length > 0,
    purchaseItems,
    bonusItems,
    petItems,
    specialItems,
    missionItems,
    bonusEnabled: false,
    notes: `${sessionDefinition.label} \uC218\uC5C5\uC6A9 \uC544\uC774\uD15C \uC124\uC815\uC785\uB2C8\uB2E4.`,
    createdAt: baseTime,
    updatedAt: baseTime,
  };
}

export function createSeedItems(baseTime) {
  return LESSON_ITEM_DEFINITIONS.map((item) => toSeedItem(item, baseTime));
}

export function createSeedSessions(baseTime) {
  return SESSION_GROUP_DEFINITIONS.map((sessionDefinition) => createSeedSessionFromDefinition(sessionDefinition, baseTime));
}

export function sortSessionsByStructure(sessions) {
  return [...(sessions || [])].sort((left, right) => {
    const leftOrder = getSessionSortOrder(left);
    const rightOrder = getSessionSortOrder(right);

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return String(left.id || '').localeCompare(String(right.id || ''));
  });
}

export function normalizeSessionsForLessonSeeds(sessions) {
  const sessionMap = new Map((sessions || []).map((session) => [session.id, session]));
  const normalizedSeedSessions = SESSION_GROUP_DEFINITIONS.map((sessionDefinition) => {
    const baseSession = createSeedSessionFromDefinition(sessionDefinition, new Date().toISOString());
    const existingSession = sessionMap.get(sessionDefinition.id) || {};

    return {
      ...existingSession,
      ...baseSession,
      shopOpen: shouldAdoptSeedShopOpen(existingSession) ? baseSession.shopOpen : Boolean(existingSession.shopOpen),
      purchaseItems: mergeSessionItemIds(baseSession.purchaseItems, existingSession.purchaseItems),
      bonusItems: mergeSessionItemIds(baseSession.bonusItems, existingSession.bonusItems),
      petItems: mergeSessionItemIds(baseSession.petItems, existingSession.petItems),
      specialItems: mergeSessionItemIds(baseSession.specialItems, existingSession.specialItems),
      missionItems: mergeSessionItemIds(baseSession.missionItems, existingSession.missionItems),
      bonusEnabled: Boolean(existingSession.bonusEnabled ?? baseSession.bonusEnabled),
      notes: existingSession.notes || baseSession.notes,
      createdAt: existingSession.createdAt || baseSession.createdAt,
      updatedAt: existingSession.updatedAt || baseSession.updatedAt,
    };
  });
  const customSessions = (sessions || []).filter((session) => !SESSION_GROUP_IDS.includes(session.id));

  return [
    ...normalizedSeedSessions,
    ...customSessions.map((session) => ({
      ...session,
      label: session.label || session.title || session.id,
      lessons: getSessionLessons(session),
      rewardGroup: getSessionRewardGroup(session) || session.rewardGroup || session.id,
      sortOrder: getSessionSortOrder(session),
    })),
  ];
}
