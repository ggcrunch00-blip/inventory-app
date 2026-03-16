import { useState } from 'react';
import useAppContext from '../../hooks/useAppContext';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import EmptyState from '../../components/common/EmptyState';
import AppImage from '../../components/common/AppImage';
import { ITEM_TYPE_OPTIONS } from '../../utils/constants';
import { getItemCost, getItemImageSrc } from '../../utils/inventory';

const TEXT = {
  title: '\uC544\uC774\uD15C \uAD00\uB9AC',
  description:
    '\uAC00\uACA9, \uC124\uBA85, \uC774\uBBF8\uC9C0, \uC0AC\uC6A9 \uAC00\uB2A5 \uCE90\uB9AD\uD130\uC640 \uCC28\uC2DC \uC5F0\uACB0\uC744 \uAD00\uB9AC\uD560 \uC218 \uC788\uC5B4\uC694.',
  editItem: '\uC544\uC774\uD15C \uC218\uC815',
  createItem: '\uC0C8 \uC544\uC774\uD15C \uB9CC\uB4E4\uAE30',
  formDescription:
    '\uCC28\uC2DC\uBCC4 \uC2E4\uC81C \uC544\uC774\uD15C\uC744 \uCD94\uAC00\uD558\uB294 \uAE30\uBCF8 \uD654\uBA74\uC785\uB2C8\uB2E4. \uC774\uBBF8\uC9C0 \uD30C\uC77C\uC774 \uC5C6\uC73C\uBA74 placeholder\uAC00 \uBCF4\uC785\uB2C8\uB2E4.',
  name: '\uC774\uB984',
  price: '\uAC00\uACA9',
  descriptionLabel: '\uC124\uBA85',
  imagePath: '\uC774\uBBF8\uC9C0 \uACBD\uB85C',
  type: '\uC544\uC774\uD15C \uC885\uB958',
  availableCharacters: '\uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uCE90\uB9AD\uD130',
  activeSessions: '\uC5F0\uACB0\uB41C \uCC28\uC2DC',
  save: '\uC544\uC774\uD15C \uC800\uC7A5',
  add: '\uC544\uC774\uD15C \uCD94\uAC00',
  cancel: '\uCDE8\uC18C',
  previewTitle: '\uBBF8\uB9AC \uBCF4\uAE30',
  previewDescription: '\uD559\uC0DD \uD654\uBA74\uC5D0 \uBCF4\uC774\uB294 \uC544\uC774\uD15C \uCE74\uB4DC \uD615\uD0DC\uB97C \uBC14\uB85C \uD655\uC778\uD560 \uC218 \uC788\uC5B4\uC694.',
  previewAlt: '\uBBF8\uB9AC \uBCF4\uAE30',
  previewName: '\uC544\uC774\uD15C \uC774\uB984',
  previewDescriptionText: '\uC544\uC774\uD15C \uC124\uBA85\uC774 \uC5EC\uAE30\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4.',
  bonus: '\uBCF4\uB108\uC2A4',
  score: '\uC810',
  listTitle: '\uC544\uC774\uD15C \uBAA9\uB85D',
  listDescription: '\uC218\uC815\uD558\uAC70\uB098 \uC0AD\uC81C\uD560 \uC544\uC774\uD15C\uC744 \uBC14\uB85C \uCC3E\uC744 \uC218 \uC788\uC5B4\uC694.',
  sessionLabel: '\uC5F0\uACB0 \uCC28\uC2DC',
  none: '\uC5C6\uC74C',
  priceLabel: '\uAC00\uACA9',
  noDescription: '\uC124\uBA85\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.',
  edit: '\uC218\uC815',
  remove: '\uC0AD\uC81C',
  removeConfirm: '\uC544\uC774\uD15C\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694?',
  emptyTitle: '\uB4F1\uB85D\uB41C \uC544\uC774\uD15C\uC774 \uC5C6\uC5B4\uC694',
  emptyDescription: '\uC0C8 \uC544\uC774\uD15C \uB9CC\uB4E4\uAE30\uC5D0\uC11C \uCCAB \uC544\uC774\uD15C\uC744 \uCD94\uAC00\uD574 \uC8FC\uC138\uC694.',
};

const emptyForm = {
  name: '',
  description: '',
  price: '0',
  imageUrl: '/items/item-placeholder.png',
  type: 'purchase',
  applicableCharacters: [],
  activeSessions: [],
};

export default function ItemManagementPage() {
  const { items, sessions, characters, actions } = useAppContext();
  const [editingItemId, setEditingItemId] = useState('');
  const [form, setForm] = useState(emptyForm);

  function startEditing(item) {
    setEditingItemId(item.id);
    setForm({
      name: item.name,
      description: item.description || '',
      price: String(item.cost ?? item.price ?? 0),
      imageUrl: getItemImageSrc(item),
      type: item.type || 'purchase',
      applicableCharacters: item.applicableCharacters || [],
      activeSessions: item.activeSessions || [],
    });
  }

  function resetForm() {
    setEditingItemId('');
    setForm(emptyForm);
  }

  function toggleArrayValue(field, value) {
    setForm((current) => ({
      ...current,
      [field]: current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value],
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      if (editingItemId) {
        await actions.updateItem(editingItemId, form);
      } else {
        await actions.createItem(form);
      }
      resetForm();
    } catch (error) {
      return;
    }
  }

  return (
    <div className="stack-page">
      <PageHeader title={TEXT.title} description={TEXT.description} />

      <div className="admin-columns">
        <SectionCard title={editingItemId ? TEXT.editItem : TEXT.createItem} description={TEXT.formDescription}>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              {TEXT.name}
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label>
              {TEXT.price}
              <input value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} inputMode="numeric" />
            </label>
            <label className="form-grid__full">
              {TEXT.descriptionLabel}
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows="3" />
            </label>
            <label className="form-grid__full">
              {TEXT.imagePath}
              <input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
            </label>
            <label>
              {TEXT.type}
              <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                {ITEM_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="checkbox-group form-grid__full">
              <span>{TEXT.availableCharacters}</span>
              {characters.map((character) => (
                <label key={character.id} className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.applicableCharacters.includes(character.id)}
                    onChange={() => toggleArrayValue('applicableCharacters', character.id)}
                  />
                  {character.name}
                </label>
              ))}
            </div>

            <div className="checkbox-group form-grid__full">
              <span>{TEXT.activeSessions}</span>
              {sessions.map((session) => (
                <label key={session.id} className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.activeSessions.includes(session.id)}
                    onChange={() => toggleArrayValue('activeSessions', session.id)}
                  />
                  {session.title}
                </label>
              ))}
            </div>

            <button type="submit" className="button button--primary button--full">
              {editingItemId ? TEXT.save : TEXT.add}
            </button>
            {editingItemId && (
              <button type="button" className="button button--ghost button--full" onClick={resetForm}>
                {TEXT.cancel}
              </button>
            )}
          </form>
        </SectionCard>

        <SectionCard title={TEXT.previewTitle} description={TEXT.previewDescription}>
          <div className="item-card">
            <AppImage
              className="item-card__image"
              src={form.imageUrl || '/items/item-placeholder.png'}
              fallbackSrc="/items/item-placeholder.png"
              alt={form.name || TEXT.previewAlt}
            />
            <div className="item-card__content">
              <div className="item-card__title-row">
                <h3>{form.name || TEXT.previewName}</h3>
                <span className="chip">{form.type === 'purchase' ? `${form.price || 0}${TEXT.score}` : TEXT.bonus}</span>
              </div>
              <p>{form.description || TEXT.previewDescriptionText}</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title={TEXT.listTitle} description={TEXT.listDescription}>
        {items.length ? (
          <div className="item-list">
            {items.map((item) => (
              <article key={item.id} className="item-card">
                <AppImage
                  className="item-card__image"
                  src={getItemImageSrc(item)}
                  fallbackSrc="/items/item-placeholder.png"
                  alt={item.name}
                />
                <div className="item-card__content">
                  <div className="item-card__title-row">
                    <h3>{item.name}</h3>
                    <span className="chip">{item.type}</span>
                  </div>
                  <p>{item.description || TEXT.noDescription}</p>
                  <small>{`${TEXT.sessionLabel}: ${(item.activeSessions || []).join(', ') || TEXT.none}`}</small>
                  <small>{`${TEXT.priceLabel}: ${getItemCost(item)}${TEXT.score}`}</small>
                  <div className="quick-links">
                    <button type="button" className="button button--ghost button--small" onClick={() => startEditing(item)}>
                      {TEXT.edit}
                    </button>
                    <button
                      type="button"
                      className="button button--danger button--small"
                      onClick={() => {
                        if (window.confirm(`${item.name} ${TEXT.removeConfirm}`)) {
                          actions.deleteItem(item.id);
                        }
                      }}
                    >
                      {TEXT.remove}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title={TEXT.emptyTitle} description={TEXT.emptyDescription} />
        )}
      </SectionCard>
    </div>
  );
}
