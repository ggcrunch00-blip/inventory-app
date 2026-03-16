import { MAX_INVENTORY_SLOTS } from '../../utils/constants';
import {
  buildInventorySlots,
  getInventoryEntryName,
  getInventoryEntrySecondaryText,
  getItemImageSrc,
} from '../../utils/inventory';
import { decodeUnicodeText } from '../../utils/format';
import AppImage from './AppImage';

const TEXT_SELECT = '\uC120\uD0DD';
const TEXT_EMPTY_SLOT = '\uBE48 \uCE78';
const TEXT_EMPTY_ITEM = '\uC544\uC9C1 \uC544\uC774\uD15C\uC774 \uC5C6\uC5B4\uC694.';

export default function InventoryGrid({
  inventory = [],
  itemsById = {},
  selectable = false,
  selectedEntryId = '',
  dangerEntryIds = [],
  disabledEntryIds = [],
  onSelectEntry,
  actionLabel = TEXT_SELECT,
  maxSlots = MAX_INVENTORY_SLOTS,
  compact = false,
}) {
  const slots = buildInventorySlots(inventory, maxSlots);

  return (
    <div className={`inventory-grid ${compact ? 'inventory-grid--compact' : ''}`.trim()}>
      {slots.map((slot) => {
        const item = slot.entry ? itemsById[slot.entry.itemId] : null;
        const isSelected = selectedEntryId && slot.entry?.id === selectedEntryId;
        const isDanger = slot.entry && dangerEntryIds.includes(slot.entry.id);
        const isDisabled = slot.entry && disabledEntryIds.includes(slot.entry.id);

        return (
          <article
            key={`slot-${slot.slotNumber}`}
            className={`inventory-slot ${slot.entry ? 'inventory-slot--filled' : ''} ${
              isDanger ? 'inventory-slot--danger' : ''
            } ${
              isDisabled ? 'inventory-slot--disabled' : ''
            } ${
              isSelected ? 'inventory-slot--selected' : ''
            }`.trim()}
          >
            <span className="inventory-slot__number">{slot.slotNumber}</span>
            {slot.entry && item ? (
              <>
                <AppImage
                  className="inventory-slot__image"
                  src={getItemImageSrc(item)}
                  fallbackSrc="/items/item-placeholder.png"
                  alt={getInventoryEntryName(slot.entry, item)}
                />
                <strong>{getInventoryEntryName(slot.entry, item)}</strong>
                <small>{getInventoryEntrySecondaryText(slot.entry, item)}</small>
                {selectable && (
                  <button
                    type="button"
                    className="button button--ghost button--small"
                    disabled={isDisabled}
                    onClick={() => onSelectEntry(slot.entry)}
                  >
                    {decodeUnicodeText(actionLabel)}
                  </button>
                )}
              </>
            ) : (
              <>
                <strong>{TEXT_EMPTY_SLOT}</strong>
                <small>{TEXT_EMPTY_ITEM}</small>
              </>
            )}
          </article>
        );
      })}
    </div>
  );
}
