import { useMemo, useState } from 'react';
import useAppContext from '../../hooks/useAppContext';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import EmptyState from '../../components/common/EmptyState';
import AppImage from '../../components/common/AppImage';
import { ITEM_TYPE_OPTIONS } from '../../utils/constants';
import { decodeUnicodeText } from '../../utils/format';
import { getSessionLabel } from '../../data/lessonItemSeeds';
import { getItemCost, getItemImageSrc } from '../../utils/inventory';

const TEXT = {
  title: '아이템 관리',
  description: '자주 쓰는 입력을 위로 올리고, 차시/캐릭터 연결은 더 짧은 조작으로 정리했어요.',
  editItem: '아이템 수정',
  createItem: '새 아이템 만들기',
  formDescription: '이름, 설명, 이미지, 가격, 종류를 먼저 입력하고 필요한 연결만 아래에서 선택하세요.',
  name: '이름',
  price: '가격',
  descriptionLabel: '설명',
  imagePath: '이미지 경로',
  type: '아이템 종류',
  availableCharacters: '사용 가능 캐릭터',
  activeSessions: '연결된 차시',
  save: '아이템 저장',
  add: '아이템 추가',
  cancel: '취소',
  duplicateDraft: '이 내용으로 새 아이템 준비',
  previewTitle: '미리 보기',
  previewDescription: '학생 화면에 보이는 아이템 카드 형태를 바로 확인할 수 있어요.',
  previewAlt: '미리 보기',
  previewName: '아이템 이름',
  previewDescriptionText: '아이템 설명이 여기에 표시됩니다.',
  bonus: '보너스',
  score: '점',
  listTitle: '아이템 목록',
  listDescription: '수정하거나 삭제할 아이템을 바로 찾을 수 있어요.',
  sessionLabel: '연결 차시',
  characterLabel: '사용 캐릭터',
  none: '없음',
  priceLabel: '가격',
  noDescription: '설명이 없습니다.',
  edit: '수정',
  remove: '삭제',
  removeConfirm: '아이템을 삭제할까요?',
  emptyTitle: '등록된 아이템이 없어요.',
  emptyDescription: '새 아이템 만들기에서 첫 아이템을 추가해 주세요.',
  connectCurrentSession: '현재 차시 빠르게 연결',
  showMoreSessions: '차시 더 보기',
  showLessSessions: '차시 접기',
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

function getSessionOrder(session) {
  return Number.isFinite(Number(session?.sortOrder)) ? Number(session.sortOrder) : Number.MAX_SAFE_INTEGER;
}

export default function ItemManagementPage() {
  const { items, sessions, characters, actions, activeSession } = useAppContext();
  const [editingItemId, setEditingItemId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const itemTypeLabelMap = Object.fromEntries(
    ITEM_TYPE_OPTIONS.map((option) => [option.value, decodeUnicodeText(option.label)]),
  );

  const sortedSessions = useMemo(
    () =>
      [...sessions].sort((left, right) => {
        const leftOrder = getSessionOrder(left);
        const rightOrder = getSessionOrder(right);

        if (leftOrder !== rightOrder) {
          return leftOrder - rightOrder;
        }

        return decodeUnicodeText(getSessionLabel(left)).localeCompare(decodeUnicodeText(getSessionLabel(right)), 'ko');
      }),
    [sessions],
  );
  const visibleSessions = showAllSessions ? sortedSessions : sortedSessions.slice(0, 6);
  const selectedSessionNames = sortedSessions
    .filter((session) => form.activeSessions.includes(session.id))
    .map((session) => decodeUnicodeText(getSessionLabel(session)))
    .join(', ');
  const selectedCharacterNames = characters
    .filter((character) => form.applicableCharacters.includes(character.id))
    .map((character) => decodeUnicodeText(character.name))
    .join(', ');

  function startEditing(item) {
    setEditingItemId(item.id);
    setForm({
      name: decodeUnicodeText(item.name),
      description: decodeUnicodeText(item.description || ''),
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
              {TEXT.type}
              <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                {ITEM_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {decodeUnicodeText(option.label)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {TEXT.price}
              <input value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} inputMode="numeric" />
            </label>

            <label className="form-grid__full">
              {TEXT.imagePath}
              <input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
            </label>

            <label className="form-grid__full">
              {TEXT.descriptionLabel}
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows="3" />
            </label>

            <div className="form-grid__full selection-panel">
              <div className="selection-panel__header">
                <div>
                  <strong>{TEXT.availableCharacters}</strong>
                  <p className="helper-text">{selectedCharacterNames || '모든 캐릭터 허용 또는 아직 선택하지 않음'}</p>
                </div>
                {form.applicableCharacters.length ? (
                  <button
                    type="button"
                    className="button button--ghost button--small"
                    onClick={() => setForm((current) => ({ ...current, applicableCharacters: [] }))}
                  >
                    전체 허용
                  </button>
                ) : null}
              </div>
              <div className="quick-links">
                {characters.map((character) => {
                  const isSelected = form.applicableCharacters.includes(character.id);

                  return (
                    <button
                      key={character.id}
                      type="button"
                      className={isSelected ? 'button button--secondary button--small' : 'button button--ghost button--small'}
                      onClick={() => toggleArrayValue('applicableCharacters', character.id)}
                    >
                      {decodeUnicodeText(character.name)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-grid__full selection-panel">
              <div className="selection-panel__header">
                <div>
                  <strong>{TEXT.activeSessions}</strong>
                  <p className="helper-text">{selectedSessionNames || '아직 연결된 차시가 없어요.'}</p>
                </div>
                <div className="quick-links">
                  {form.activeSessions.length ? (
                    <button
                      type="button"
                      className="button button--ghost button--small"
                      onClick={() => setForm((current) => ({ ...current, activeSessions: [] }))}
                    >
                      모두 해제
                    </button>
                  ) : null}
                  {sortedSessions.length > 6 ? (
                    <button
                      type="button"
                      className="button button--ghost button--small"
                      onClick={() => setShowAllSessions((current) => !current)}
                    >
                      {showAllSessions ? TEXT.showLessSessions : TEXT.showMoreSessions}
                    </button>
                  ) : null}
                </div>
              </div>

              {activeSession ? (
                <div className="quick-links">
                  <button
                    type="button"
                    className={
                      form.activeSessions.includes(activeSession.id)
                        ? 'button button--secondary button--small'
                        : 'button button--ghost button--small'
                    }
                    onClick={() => toggleArrayValue('activeSessions', activeSession.id)}
                  >
                    {TEXT.connectCurrentSession}: {decodeUnicodeText(getSessionLabel(activeSession))}
                  </button>
                </div>
              ) : null}

              <div className="quick-links">
                {visibleSessions.map((session) => {
                  const isSelected = form.activeSessions.includes(session.id);

                  return (
                    <button
                      key={session.id}
                      type="button"
                      className={isSelected ? 'button button--secondary button--small' : 'button button--ghost button--small'}
                      onClick={() => toggleArrayValue('activeSessions', session.id)}
                    >
                      {decodeUnicodeText(getSessionLabel(session))}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" className="button button--primary button--full">
              {editingItemId ? TEXT.save : TEXT.add}
            </button>

            {editingItemId ? (
              <button
                type="button"
                className="button button--secondary button--full"
                onClick={() => setEditingItemId('')}
              >
                {TEXT.duplicateDraft}
              </button>
            ) : null}

            {editingItemId ? (
              <button type="button" className="button button--ghost button--full" onClick={resetForm}>
                {TEXT.cancel}
              </button>
            ) : null}
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
              <small>{`${TEXT.characterLabel}: ${selectedCharacterNames || TEXT.none}`}</small>
              <small>{`${TEXT.sessionLabel}: ${selectedSessionNames || TEXT.none}`}</small>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title={TEXT.listTitle} description={TEXT.listDescription}>
        {items.length ? (
          <div className="item-list">
            {items.map((item) => {
              const activeSessionNames = sortedSessions
                .filter((session) => (item.activeSessions || []).includes(session.id))
                .map((session) => decodeUnicodeText(getSessionLabel(session)))
                .join(', ');
              const characterNames = characters
                .filter((character) => (item.applicableCharacters || []).includes(character.id))
                .map((character) => decodeUnicodeText(character.name))
                .join(', ');

              return (
                <article key={item.id} className="item-card">
                  <AppImage
                    className="item-card__image"
                    src={getItemImageSrc(item)}
                    fallbackSrc="/items/item-placeholder.png"
                    alt={decodeUnicodeText(item.name)}
                  />
                  <div className="item-card__content">
                    <div className="item-card__title-row">
                      <h3>{decodeUnicodeText(item.name)}</h3>
                      <span className="chip">{itemTypeLabelMap[item.type] || decodeUnicodeText(item.type || TEXT.none)}</span>
                    </div>
                    <p>{decodeUnicodeText(item.description || TEXT.noDescription)}</p>
                    <small>{`${TEXT.sessionLabel}: ${activeSessionNames || TEXT.none}`}</small>
                    <small>{`${TEXT.characterLabel}: ${characterNames || TEXT.none}`}</small>
                    <small>{`${TEXT.priceLabel}: ${getItemCost(item)}${TEXT.score}`}</small>
                    <div className="quick-links">
                      <button type="button" className="button button--ghost button--small" onClick={() => startEditing(item)}>
                        {TEXT.edit}
                      </button>
                      <button
                        type="button"
                        className="button button--danger button--small"
                        onClick={() => {
                          if (window.confirm(`${decodeUnicodeText(item.name)} ${TEXT.removeConfirm}`)) {
                            actions.deleteItem(item.id);
                          }
                        }}
                      >
                        {TEXT.remove}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState title={TEXT.emptyTitle} description={TEXT.emptyDescription} />
        )}
      </SectionCard>
    </div>
  );
}
