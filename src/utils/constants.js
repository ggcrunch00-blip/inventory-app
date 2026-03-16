export const APP_TITLE = '\uAD6D\uD1A0 \uC218\uD638\uB300 \uB514\uC9C0\uD138 \uC778\uBCA4\uD1A0\uB9AC \uC571';
export const MAX_INVENTORY_SLOTS = 12;

export const CHARACTERS = [
  {
    id: 'maru',
    name: '\uB9C8\uB8E8',
    summary: '\uC6A9\uAC10\uD558\uACE0 \uC55E\uC7A5\uC11C\uB294 \uCE90\uB9AD\uD130\uC608\uC694.',
    imageUrl: '/assets/characters/maru.png',
  },
  {
    id: 'yeouli',
    name: '\uC5EC\uC6B8\uC774',
    summary: '\uC0B4\uD53C\uACE0 \uC0DD\uAC01\uD558\uB294 \uC57C\uBB34\uC9C4 \uCE90\uB9AD\uD130\uC608\uC694.',
    imageUrl: '/assets/characters/yeouli.png',
  },
  {
    id: 'deogi',
    name: '\uB354\uAE30',
    summary: '\uB290\uAE0B\uD558\uACE0 \uCC28\uBD84\uD55C \uBD84\uC704\uAE30\uC758 \uCE90\uB9AD\uD130\uC608\uC694.',
    imageUrl: '/assets/characters/deogi.png',
  },
];

export const LEGACY_CHARACTER_ID_MAP = {
  'guardian-tiger': 'maru',
  'guardian-hawk': 'yeouli',
  'guardian-bear': 'deogi',
  'guardian-turtle': 'deogi',
};

export function normalizeCharacterId(characterId) {
  if (!characterId) {
    return '';
  }

  return LEGACY_CHARACTER_ID_MAP[characterId] || characterId;
}

export function findCharacterById(characters, characterId) {
  const normalizedId = normalizeCharacterId(characterId);
  return (characters || []).find((character) => character.id === normalizedId) || null;
}

export const DEFAULT_CLASSROOM = {
  id: 'main',
  schoolYear: 2026,
  grade: 5,
  classNumber: 1,
  activeSessionId: 'session-1',
  maxInventorySlots: MAX_INVENTORY_SLOTS,
};

export const ITEM_TYPE_OPTIONS = [
  { value: 'purchase', label: '\uAD6C\uB9E4 \uC544\uC774\uD15C' },
  { value: 'bonus', label: '\uBCF4\uB108\uC2A4 \uC544\uC774\uD15C' },
  { value: 'special', label: '\uD2B9\uC218 \uC544\uC774\uD15C' },
];

export const ACTION_TYPE_LABELS = {
  score_entered: '\uC810\uC218 \uC785\uB825',
  item_purchased: '\uC544\uC774\uD15C \uAD6C\uB9E4',
  item_bonus_received: '\uBCF4\uB108\uC2A4 \uD68D\uB4DD',
  item_discarded: '\uC544\uC774\uD15C \uBC84\uB9AC\uAE30',
  admin_bonus_given: '\uC120\uC0DD\uB2D8 \uBCF4\uB108\uC2A4 \uC9C0\uAE09',
  admin_inventory_removed: '\uC120\uC0DD\uB2D8 \uC778\uBCA4\uD1A0\uB9AC \uC815\uB9AC',
  session_closed: '\uBCF4\uC0C1 \uC885\uB8CC',
  character_selected: '\uCE90\uB9AD\uD130 \uC120\uD0DD',
  password_reset: '\uBE44\uBC00\uBC88\uD638 \uC7AC\uC124\uC815',
  pet_selected: '\uD3AB \uC120\uD0DD',
  special_item_selected: '스페셜 선택',
  mission_item_selected: '미션 보상 선택',
};

export const STUDENT_NAV_ITEMS = [
  { to: '/student/dashboard', label: '\uB0B4 \uC778\uBCA4\uD1A0\uB9AC' },
  { to: '/student/reward', label: '\uC544\uC774\uD15C \uC5BB\uAE30' },
  { to: '/student/history', label: '\uAE30\uB85D \uBCF4\uAE30' },
];

export const ADMIN_NAV_ITEMS = [
  { to: '/admin/dashboard', label: '\uAD00\uB9AC \uD604\uD669' },
  { to: '/admin/students', label: '\uD559\uC0DD \uAD00\uB9AC' },
  { to: '/admin/items', label: '\uC544\uC774\uD15C \uAD00\uB9AC' },
  { to: '/admin/sessions', label: '\uCC28\uC2DC \uAD00\uB9AC' },
];

export const SYNC_STATUS_LABELS = {
  idle: '\uC900\uBE44\uB428',
  saving: '\uC800\uC7A5 \uC911',
  saved: '\uC800\uC7A5 \uC644\uB8CC',
  queued: '\uC624\uD504\uB77C\uC778 \uC800\uC7A5 \uB300\uAE30',
  error: '\uC800\uC7A5 \uC624\uB958',
};
