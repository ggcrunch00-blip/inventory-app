import { useState } from 'react';
import useAppContext from '../../hooks/useAppContext';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import EmptyState from '../../components/common/EmptyState';
import { getItemAcquisitionType } from '../../data/lessonItemSeeds';
import { decodeUnicodeText } from '../../utils/format';

const emptyForm = {
  title: '',
  shopOpen: false,
  bonusEnabled: false,
  purchaseItems: [],
  bonusItems: [],
  notes: '',
};

export default function SessionManagementPage() {
  const { sessions, items, actions } = useAppContext();
  const [editingSessionId, setEditingSessionId] = useState('');
  const [form, setForm] = useState(emptyForm);

  const purchaseItems = items.filter((item) => getItemAcquisitionType(item) === 'select');
  const bonusItems = items.filter((item) =>
    ['teacher_award', 'bonus', 'special'].includes(getItemAcquisitionType(item)),
  );
  const itemsById = Object.fromEntries(items.map((item) => [item.id, item]));

  function startEditing(session) {
    setEditingSessionId(session.id);
    setForm({
      title: decodeUnicodeText(session.title),
      shopOpen: Boolean(session.shopOpen),
      bonusEnabled: Boolean(session.bonusEnabled),
      purchaseItems: session.purchaseItems || [],
      bonusItems: session.bonusItems || [],
      notes: decodeUnicodeText(session.notes || ''),
    });
  }

  function resetForm() {
    setEditingSessionId('');
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
      if (editingSessionId) {
        await actions.updateSession(editingSessionId, form);
      } else {
        await actions.createSession(form);
      }

      resetForm();
    } catch (error) {
      return;
    }
  }

  return (
    <div className="stack-page">
      <PageHeader
        title="차시 관리"
        description="차시 이름, 상점 열림 여부, 구매 아이템, 보너스 아이템, 메모를 관리해요."
      />

      <div className="admin-columns">
        <SectionCard
          title={editingSessionId ? '차시 수정' : '새 차시 만들기'}
          description="보상이 없는 차시는 상점을 닫은 상태로 두어도 괜찮아요."
        >
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              차시 이름
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="예: 1차시"
              />
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.shopOpen}
                onChange={(event) => setForm({ ...form, shopOpen: event.target.checked })}
              />
              상점 열기
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.bonusEnabled}
                onChange={(event) => setForm({ ...form, bonusEnabled: event.target.checked })}
              />
              보너스 아이템 보여주기
            </label>

            <div className="checkbox-group form-grid__full">
              <span>구매 아이템</span>
              {purchaseItems.map((item) => (
                <label key={item.id} className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.purchaseItems.includes(item.id)}
                    onChange={() => toggleArrayValue('purchaseItems', item.id)}
                  />
                  {decodeUnicodeText(item.name)}
                </label>
              ))}
            </div>

            <div className="checkbox-group form-grid__full">
              <span>보너스 아이템</span>
              {bonusItems.map((item) => (
                <label key={item.id} className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.bonusItems.includes(item.id)}
                    onChange={() => toggleArrayValue('bonusItems', item.id)}
                  />
                  {decodeUnicodeText(item.name)}
                </label>
              ))}
            </div>

            <label className="form-grid__full">
              메모
              <textarea
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                rows="3"
              />
            </label>

            <button type="submit" className="button button--primary button--full">
              {editingSessionId ? '차시 저장' : '차시 추가'}
            </button>
            {editingSessionId && (
              <button type="button" className="button button--ghost button--full" onClick={resetForm}>
                취소
              </button>
            )}
          </form>
        </SectionCard>

        <SectionCard title="안내" description="학생 화면에 보일 보상을 이 화면에서 조정할 수 있어요.">
          <ul className="bullet-list">
            <li>상점을 열면 학생이 차시 아이템을 받을 수 있어요.</li>
            <li>보너스 표시를 켜야 연결된 보너스 아이템이 화면에 보여요.</li>
            <li>5차시 펫 기능도 같은 차시 구조 안에서 관리돼요.</li>
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="차시 목록" description="학생 화면에 연결된 차시 설정을 한눈에 볼 수 있어요.">
        {sessions.length ? (
          <div className="session-list">
            {sessions.map((session) => (
              <article key={session.id} className="section-card">
                <div className="student-admin-card__header">
                  <div>
                    <strong>{decodeUnicodeText(session.title)}</strong>
                    <p>
                      상점 {session.shopOpen ? '열림' : '닫힘'} / 보너스 {session.bonusEnabled ? '표시' : '숨김'}
                    </p>
                  </div>
                  <div className="quick-links">
                    <button type="button" className="button button--ghost button--small" onClick={() => startEditing(session)}>
                      수정
                    </button>
                    <button
                      type="button"
                      className="button button--danger button--small"
                      onClick={() => {
                        if (window.confirm(`${decodeUnicodeText(session.title)} 차시를 삭제할까요?`)) {
                          actions.deleteSession(session.id);
                        }
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <p>
                  구매 아이템:{' '}
                  {(session.purchaseItems || [])
                    .map((itemId) => decodeUnicodeText(itemsById[itemId]?.name || itemId))
                    .join(', ') || '없음'}
                </p>
                <p>
                  보너스 아이템:{' '}
                  {(session.bonusItems || [])
                    .map((itemId) => decodeUnicodeText(itemsById[itemId]?.name || itemId))
                    .join(', ') || '없음'}
                </p>
                <p>
                  펫 아이템:{' '}
                  {(session.petItems || [])
                    .map((itemId) => decodeUnicodeText(itemsById[itemId]?.name || itemId))
                    .join(', ') || '없음'}
                </p>
                <p>메모: {decodeUnicodeText(session.notes || '없음')}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="아직 차시가 없어요"
            description="위 화면에서 첫 차시를 추가해 주세요."
          />
        )}
      </SectionCard>
    </div>
  );
}
