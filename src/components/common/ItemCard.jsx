import { getItemAcquisitionMode, getItemCost, getItemImageSrc } from '../../utils/inventory';
import { decodeUnicodeText } from '../../utils/format';
import AppImage from './AppImage';

const TEXT_SELECTED = '\uC120\uD0DD\uB428';
const TEXT_BONUS = '\uBCF4\uB108\uC2A4';
const TEXT_EMPTY_DESCRIPTION = '\uC124\uBA85\uC774 \uC544\uC9C1 \uC5C6\uC5B4\uC694.';
const TEXT_DISABLED = '\uC120\uD0DD \uBD88\uAC00';
const TEXT_RECEIVE = '\uC774 \uC544\uC774\uD15C \uBC1B\uAE30';
const TEXT_SCORE = '\uC810';

export default function ItemCard({
  item,
  disabled = false,
  reason = '',
  selected = false,
  onAdd,
  badgeLabel = '',
  actionLabel = '',
}) {
  const resolvedBadgeLabel =
    badgeLabel || (selected ? TEXT_SELECTED : getItemAcquisitionMode(item) === 'purchase' ? `${getItemCost(item)}${TEXT_SCORE}` : TEXT_BONUS);
  const resolvedActionLabel = actionLabel || TEXT_RECEIVE;
  const itemName = decodeUnicodeText(item?.name || '');
  const itemDescription = decodeUnicodeText(item?.description || TEXT_EMPTY_DESCRIPTION);

  return (
    <article className={`item-card ${disabled ? 'item-card--disabled' : ''} ${selected ? 'item-card--selected' : ''}`.trim()}>
      <AppImage
        className="item-card__image"
        src={getItemImageSrc(item)}
        fallbackSrc="/items/item-placeholder.png"
        alt={itemName}
      />
      <div className="item-card__content">
        <div className="item-card__title-row">
          <h3>{itemName}</h3>
          <span className={`chip ${selected ? 'chip--selected' : ''}`.trim()}>{decodeUnicodeText(resolvedBadgeLabel)}</span>
        </div>
        <p>{itemDescription}</p>
        <button type="button" className="button button--secondary button--full" disabled={disabled} onClick={() => onAdd(item)}>
          {decodeUnicodeText(disabled ? reason || TEXT_DISABLED : resolvedActionLabel)}
        </button>
      </div>
    </article>
  );
}
