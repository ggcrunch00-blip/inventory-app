import { useMemo, useState } from 'react';
import useAppContext from '../../hooks/useAppContext';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import EmptyState from '../../components/common/EmptyState';
import { getItemAcquisitionType } from '../../data/lessonItemSeeds';
import { decodeUnicodeText, getErrorMessage } from '../../utils/format';

const emptyForm = {
  title: '',
  shopOpen: false,
  bonusEnabled: false,
  purchaseItems: [],
  bonusItems: [],
  notes: '',
};

function getSessionLabel(session) {
  return decodeUnicodeText(session?.label || session?.title || session?.id || '');
}

function getSessionOrder(session) {
  return Number.isFinite(Number(session?.sortOrder)) ? Number(session.sortOrder) : Number.MAX_SAFE_INTEGER;
}

function getSessionStatusColor(type) {
  if (type === 'error') {
    return '#b91c1c';
  }

  if (type === 'success') {
    return '#0f766e';
  }

  return '#64748b';
}

function getItemNames(itemIds, itemsById) {
  return (itemIds || []).map((itemId) => decodeUnicodeText(itemsById[itemId]?.name || itemId)).join(', ');
}

export default function SessionManagementPage() {
  const { classroom, sessions, items, actions, activeSession } = useAppContext();
  const [editingSessionId, setEditingSessionId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [sessionStatus, setSessionStatus] = useState({ type: '', message: '' });
  const [changingSessionId, setChangingSessionId] = useState('');

  const sortedSessions = useMemo(
    () =>
      [...sessions].sort((left, right) => {
        const leftOrder = getSessionOrder(left);
        const rightOrder = getSessionOrder(right);

        if (leftOrder !== rightOrder) {
          return leftOrder - rightOrder;
        }

        return getSessionLabel(left).localeCompare(getSessionLabel(right), 'ko');
      }),
    [sessions],
  );
  const purchaseItems = items.filter((item) => getItemAcquisitionType(item) === 'select');
  const bonusItems = items.filter((item) =>
    ['teacher_award', 'bonus', 'special'].includes(getItemAcquisitionType(item)),
  );
  const itemsById = Object.fromEntries(items.map((item) => [item.id, item]));
  const currentActiveSessionId = classroom?.activeSessionId || activeSession?.id || '';

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

  async function handleActivateSession(sessionId) {
    if (!sessionId || sessionId === currentActiveSessionId) {
      setSessionStatus({ type: 'info', message: '이미 현재 차시로 적용되어 있어요.' });
      return;
    }

    try {
      setChangingSessionId(sessionId);
      setSessionStatus({ type: '', message: '' });
      await actions.updateCurrentSession(sessionId);
      setSessionStatus({
        type: 'success',
        message: `${getSessionLabel(sortedSessions.find((session) => session.id === sessionId))}를 현재 차시로 적용했어요.`,
      });
    } catch (error) {
      setSessionStatus({
        type: 'error',
        message: getErrorMessage(error, '현재 차시를 변경하지 못했어요. 잠시 후 다시 시도해 주세요.'),
      });
    } finally {
      setChangingSessionId('');
    }
  }

  return (
    <div className="stack-page">
      <PageHeader
        title="차시 관리"
        description="현재 차시를 눈에 띄게 보여 주고, 각 차시를 빠르게 수정하거나 운영할 수 있게 정리했어요."
      />

      <div className="admin-columns">
        <SectionCard
          title={editingSessionId ? '차시 수정' : '새 차시 만들기'}
          description="생성/수정 영역과 목록 영역을 분리해 운영 중에도 덜 헷갈리게 구성했어요."
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

            <div className="form-grid__full selection-panel">
              <div className="selection-panel__header">
                <div>
                  <strong>구매 아이템</strong>
                  <p className="helper-text">{form.purchaseItems.length ? `${form.purchaseItems.length}개 선택됨` : '아직 선택하지 않았어요.'}</p>
                </div>
              </div>
              <div className="quick-links">
                {purchaseItems.map((item) => {
                  const isSelected = form.purchaseItems.includes(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={isSelected ? 'button button--secondary button--small' : 'button button--ghost button--small'}
                      onClick={() => toggleArrayValue('purchaseItems', item.id)}
                    >
                      {decodeUnicodeText(item.name)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-grid__full selection-panel">
              <div className="selection-panel__header">
                <div>
                  <strong>보너스 아이템</strong>
                  <p className="helper-text">{form.bonusItems.length ? `${form.bonusItems.length}개 선택됨` : '아직 선택하지 않았어요.'}</p>
                </div>
              </div>
              <div className="quick-links">
                {bonusItems.map((item) => {
                  const isSelected = form.bonusItems.includes(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={isSelected ? 'button button--secondary button--small' : 'button button--ghost button--small'}
                      onClick={() => toggleArrayValue('bonusItems', item.id)}
                    >
                      {decodeUnicodeText(item.name)}
                    </button>
                  );
                })}
              </div>
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
            {editingSessionId ? (
              <button type="button" className="button button--ghost button--full" onClick={resetForm}>
                취소
              </button>
            ) : null}
          </form>
        </SectionCard>

        <SectionCard title="현재 운영 중 차시" description="수업 중 가장 중요한 현재 차시를 별도 영역에서 먼저 보여 줘요.">
          {activeSession ? (
            <div className="stack-page">
              <div>
                <strong>{getSessionLabel(activeSession)}</strong>
                <p className="helper-text">activeSessionId: {currentActiveSessionId}</p>
              </div>

              <div className="summary-grid">
                <div>
                  <span>상점</span>
                  <strong>{activeSession.shopOpen ? '열림' : '닫힘'}</strong>
                </div>
                <div>
                  <span>구매 아이템</span>
                  <strong>{(activeSession.purchaseItems || []).length}개</strong>
                </div>
                <div>
                  <span>보너스 아이템</span>
                  <strong>{(activeSession.bonusItems || []).length}개</strong>
                </div>
                <div>
                  <span>펫 아이템</span>
                  <strong>{(activeSession.petItems || []).length}개</strong>
                </div>
              </div>

              <p className="helper-text">
                메모 {decodeUnicodeText(activeSession.notes ? '있음' : '없음')} / 보상 그룹{' '}
                {decodeUnicodeText(activeSession.rewardGroup || '없음')}
              </p>

              <div className="quick-links">
                <button type="button" className="button button--ghost" onClick={() => startEditing(activeSession)}>
                  현재 차시 수정
                </button>
              </div>
            </div>
          ) : (
            <EmptyState title="현재 활성 차시가 없어요." description="차시를 추가하거나 목록에서 현재 차시를 지정해 주세요." />
          )}

          {sessionStatus.message ? (
            <p className="helper-text" style={{ color: getSessionStatusColor(sessionStatus.type) }}>
              {sessionStatus.message}
            </p>
          ) : null}
        </SectionCard>
      </div>

      <SectionCard title="차시 목록" description="활성 차시를 바로 알아보고, 각 차시의 상태와 수정 작업을 빠르게 처리할 수 있어요.">
        {sortedSessions.length ? (
          <div className="session-list">
            {sortedSessions.map((session) => {
              const isActive = session.id === currentActiveSessionId;

              return (
                <article
                  key={session.id}
                  className={`section-card management-card ${isActive ? 'management-card--active' : ''}`.trim()}
                >
                  <div className="student-admin-card__header">
                    <div>
                      <div className="quick-links">
                        <strong>{getSessionLabel(session)}</strong>
                        {isActive ? <span className="chip chip--selected">현재 차시</span> : null}
                      </div>
                      <p>
                        상점 {session.shopOpen ? '열림' : '닫힘'} / 보너스 {session.bonusEnabled ? '표시' : '숨김'} / 보상 그룹{' '}
                        {decodeUnicodeText(session.rewardGroup || '없음')}
                      </p>
                    </div>
                    <div className="quick-links">
                      <button
                        type="button"
                        className="button button--secondary button--small"
                        disabled={isActive || changingSessionId === session.id}
                        onClick={() => handleActivateSession(session.id)}
                      >
                        {changingSessionId === session.id ? '적용 중...' : isActive ? '현재 차시' : '현재 차시 적용'}
                      </button>
                      <button type="button" className="button button--ghost button--small" onClick={() => startEditing(session)}>
                        수정
                      </button>
                      <button
                        type="button"
                        className="button button--danger button--small"
                        onClick={() => {
                          if (window.confirm(`${getSessionLabel(session)} 차시를 삭제할까요?`)) {
                            actions.deleteSession(session.id);
                          }
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  <div className="summary-grid">
                    <div>
                      <span>구매 아이템</span>
                      <strong>{(session.purchaseItems || []).length}개</strong>
                    </div>
                    <div>
                      <span>보너스 아이템</span>
                      <strong>{(session.bonusItems || []).length}개</strong>
                    </div>
                    <div>
                      <span>펫 아이템</span>
                      <strong>{(session.petItems || []).length}개</strong>
                    </div>
                    <div>
                      <span>메모</span>
                      <strong>{decodeUnicodeText(session.notes ? '있음' : '없음')}</strong>
                    </div>
                  </div>

                  <p className="helper-text">
                    구매: {getItemNames(session.purchaseItems, itemsById) || '없음'}
                  </p>
                  <p className="helper-text">
                    보너스: {getItemNames(session.bonusItems, itemsById) || '없음'}
                  </p>
                  <p className="helper-text">
                    펫: {getItemNames(session.petItems, itemsById) || '없음'}
                  </p>
                  <p className="helper-text">메모: {decodeUnicodeText(session.notes || '없음')}</p>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState title="아직 차시가 없어요." description="위 생성 영역에서 첫 차시를 추가해 주세요." />
        )}
      </SectionCard>
    </div>
  );
}
