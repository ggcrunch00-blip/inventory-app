import { MAX_INVENTORY_SLOTS } from './constants';
import { decodeUnicodeText } from './format';

export function createId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
}

export function normalizeCustomName(value, maxLength = 10) {
  return String(value || '').trim().slice(0, maxLength);
}

export function getLoginKey({ grade, classNumber, studentNumber }) {
  return `g${Number(grade)}-c${Number(classNumber)}-s${String(Number(studentNumber)).padStart(2, '0')}`;
}

export function createInventoryEntry({ id = createId('inv'), itemId, sessionId, mode, createdAt, ...metadata }) {
  return {
    id,
    itemId,
    sessionId: sessionId || null,
    obtainedBy: mode,
    obtainedAt: createdAt || new Date().toISOString(),
    ...metadata,
  };
}

export function getItemAcquisitionMode(item) {
  if (item?.acquisitionType === 'select' || item?.type === 'purchase') {
    return 'purchase';
  }

  if (item?.acquisitionType === 'pet_select' || item?.type === 'pet_select') {
    return 'pet';
  }

  if (item?.acquisitionType === 'special_select' || item?.type === 'special_select') {
    return 'special';
  }

  if (item?.acquisitionType === 'mission_select' || item?.type === 'mission_select') {
    return 'mission';
  }

  return 'bonus';
}

export function getItemImageSrc(item) {
  return item?.image || item?.imageUrl || '/items/item-placeholder.png';
}

export function buildInventorySlots(inventory = [], maxSlots = MAX_INVENTORY_SLOTS) {
  return Array.from({ length: maxSlots }, (_, index) => ({
    slotNumber: index + 1,
    entry: inventory[index] || null,
  }));
}

export function getItemCost(item) {
  return getItemAcquisitionMode(item) === 'purchase' ? Number(item?.cost ?? item?.price ?? 0) : 0;
}

export function getInventoryEntryName(entry, item) {
  if (entry?.customName) {
    return decodeUnicodeText(entry.customName);
  }

  return decodeUnicodeText(item?.name || '\uC544\uC774\uD15C');
}

export function getInventoryEntrySecondaryText(entry, item) {
  if (entry?.type === 'pet' || getItemAcquisitionMode(item) === 'pet') {
    return '\uD3AB';
  }

  return getItemAcquisitionMode(item) === 'purchase' ? `${getItemCost(item)}\uC810` : '\uBB34\uB8CC/\uBCF4\uB108\uC2A4';
}

export function hasLessonPet(inventory = [], lessonNumber) {
  return (inventory || []).some((entry) => entry.type === 'pet' && Number(entry.lesson) === Number(lessonNumber));
}

export function calculatePlanSummary(baseInventory = [], plan = [], itemsById = {}) {
  let projectedInventory = [...baseInventory];
  let spentScore = 0;

  plan.forEach((step) => {
    const item = itemsById[step.itemId];

    if (!item) {
      return;
    }

    if (step.replaceEntryId) {
      const replaceIndex = projectedInventory.findIndex((entry) => entry.id === step.replaceEntryId);

      if (replaceIndex !== -1) {
        projectedInventory.splice(replaceIndex, 1);
      }
    }

    projectedInventory.push(
      createInventoryEntry({
        id: step.previewEntryId || step.draftId,
        itemId: step.itemId,
        sessionId: step.sessionId,
        mode: step.mode,
        createdAt: step.createdAt,
      }),
    );

    spentScore += Number(step.cost || 0);
  });

  return {
    projectedInventory,
    spentScore,
    remainingSlots: Math.max(MAX_INVENTORY_SLOTS - projectedInventory.length, 0),
  };
}
