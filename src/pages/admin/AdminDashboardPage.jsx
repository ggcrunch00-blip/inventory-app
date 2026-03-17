import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useAppContext from '../../hooks/useAppContext';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import EmptyState from '../../components/common/EmptyState';
import TeacherControlPanel from '../../components/TeacherControlPanel';
import { actionTypeToLabel, decodeUnicodeText, formatDateTime, getErrorMessage } from '../../utils/format';
import { findCharacterById } from '../../utils/constants';

function getSessionLabel(session) {
  return decodeUnicodeText(session?.label || session?.title || session?.id || '');
}

function getSessionTitle(session) {
  return decodeUnicodeText(session?.title || session?.label || session?.id || '');
}

function getSessionOrder(session) {
  return Number.isFinite(Number(session?.sortOrder)) ? Number(session.sortOrder) : Number.MAX_SAFE_INTEGER;
}

function getStatusMessageColor(type) {
  if (type === 'error') {
    return '#b91c1c';
  }

  if (type === 'success') {
    return '#0f766e';
  }

  return '#64748b';
}

export default function AdminDashboardPage() {
  const {
    classroom,
    students,
    items,
    sessions,
    logs,
    activeSession,
    repositoryMode,
    actions,
    characters,
    repository,
  } = useAppContext();
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [changingSessionId, setChangingSessionId] = useState('');
  const [sessionStatus, setSessionStatus] = useState({ type: '', message: '' });

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

  const currentActiveSessionId = classroom?.activeSessionId || activeSession?.id || '';
  const currentInventoryLimit = classroom?.maxInventorySlots ?? '-';
  const selectedSessionValue = selectedSessionId || currentActiveSessionId || sortedSessions[0]?.id || '';
  const currentSessionIndex = sortedSessions.findIndex((session) => session.id === currentActiveSessionId);
  const previousSession = currentSessionIndex > 0 ? sortedSessions[currentSessionIndex - 1] : null;
  const nextSession =
    currentSessionIndex >= 0 && currentSessionIndex < sortedSessions.length - 1
      ? sortedSessions[currentSessionIndex + 1]
      : null;

  async function handleChangeSession(targetSessionId = selectedSessionValue) {
    const nextSessionId = targetSessionId;
    const nextSessionRecord = sortedSessions.find((session) => session.id === nextSessionId);

    if (!nextSessionId) {
      setSessionStatus({ type: 'error', message: '변경할 차시를 먼저 선택해 주세요.' });
      return;
    }

    if (nextSessionId === currentActiveSessionId) {
      setSessionStatus({ type: 'info', message: '이미 현재 차시로 적용되어 있어요.' });
      return;
    }

    try {
      setChangingSessionId(nextSessionId);
      setSessionStatus({ type: '', message: '' });
      await actions.updateCurrentSession(nextSessionId);
      setSelectedSessionId('');
      setSessionStatus({
        type: 'success',
        message: `${getSessionLabel(nextSessionRecord)}로 현재 차시를 변경했어요.`,
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
        eyebrow="수업 운영 관리"
        title="수업 운영 현황"
        description="수업 중 가장 자주 보는 현재 차시와 핵심 조작을 위쪽에 모아 두었어요."
      />

      <SectionCard title="수업 진행 핵심 영역" description="현재 수업 상태를 바로 확인하고 차시를 빠르게 바꿀 수 있어요.">
        {sortedSessions.length ? (
          <div className="dashboard-grid">
            <div className="stack-page">
              {activeSession ? (
                <>
                  <div>
                    <strong>{getSessionLabel(activeSession)}</strong>
                    <p className="helper-text">{getSessionTitle(activeSession)}</p>
                  </div>

                  <div className="info-list">
                    <div>
                      <span>activeSessionId</span>
                      <strong>{currentActiveSessionId || '없음'}</strong>
                    </div>
                    <div>
                      <span>상점</span>
                      <strong>{activeSession.shopOpen ? '열림' : '닫힘'}</strong>
                    </div>
                    <div>
                      <span>보상 그룹</span>
                      <strong>{decodeUnicodeText(activeSession.rewardGroup || '없음')}</strong>
                    </div>
                    <div>
                      <span>차시 순서</span>
                      <strong>{currentSessionIndex >= 0 ? `${currentSessionIndex + 1} / ${sortedSessions.length}` : '확인 필요'}</strong>
                    </div>
                  </div>

                  <p className="helper-text">{decodeUnicodeText(activeSession.notes || '현재 차시에 등록된 메모가 없어요.')}</p>
                </>
              ) : (
                <EmptyState
                  title="현재 차시가 아직 없어요."
                  description="오른쪽에서 차시를 선택하면 학생 화면에 바로 반영되고, 여기에 핵심 운영 정보가 표시돼요."
                />
              )}
            </div>

            <div className="stack-page">
              <div className="quick-links">
                <button
                  type="button"
                  className="button button--ghost"
                  disabled={!previousSession || Boolean(changingSessionId)}
                  onClick={() => handleChangeSession(previousSession?.id)}
                >
                  이전 차시
                </button>
                <button
                  type="button"
                  className="button button--ghost"
                  disabled={!nextSession || Boolean(changingSessionId)}
                  onClick={() => handleChangeSession(nextSession?.id)}
                >
                  다음 차시
                </button>
                <Link to="/admin/sessions" className="button button--secondary">
                  차시 관리 열기
                </Link>
              </div>

              <label>
                원하는 차시 직접 선택
                <select
                  value={selectedSessionValue}
                  disabled={Boolean(changingSessionId)}
                  onChange={(event) => {
                    setSelectedSessionId(event.target.value);
                    setSessionStatus({ type: '', message: '' });
                  }}
                >
                  {sortedSessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {getSessionLabel(session)} / {getSessionTitle(session)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="quick-links">
                <button
                  type="button"
                  className="button button--primary"
                  disabled={!sortedSessions.length || Boolean(changingSessionId)}
                  onClick={() => handleChangeSession()}
                >
                  {changingSessionId ? '변경 중...' : '현재 차시 적용'}
                </button>
              </div>

              {sessionStatus.message && (
                <p className="helper-text" style={{ color: getStatusMessageColor(sessionStatus.type) }}>
                  {sessionStatus.message}
                </p>
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            title="등록된 차시가 없어요."
            description="차시 관리에서 차시를 만든 뒤 이 영역에서 바로 현재 차시를 운영할 수 있어요."
          />
        )}
      </SectionCard>

      <div className="stats-grid">
        <SectionCard title="학생 수">
          <div className="metric">{students.length}명</div>
          <p className="helper-text">현재 등록된 학생 수예요.</p>
        </SectionCard>

        <SectionCard title="아이템 수">
          <div className="metric">{items.length}개</div>
          <p className="helper-text">운영 중인 전체 아이템 개수예요.</p>
        </SectionCard>

        <SectionCard title="현재 인벤토리 제한">
          <div className="metric">{currentInventoryLimit === '-' ? '-' : `${currentInventoryLimit}칸`}</div>
          <p className="helper-text">학생 1명당 보관 가능한 최대 칸 수예요.</p>
        </SectionCard>

        <SectionCard title="전체 차시 수">
          <div className="metric">{sortedSessions.length}개</div>
          <p className="helper-text">등록된 차시 개수예요.</p>
        </SectionCard>
      </div>

      <SectionCard title="빠른 이동" description="관리 화면 이동은 유지하되, 핵심 운영 정보보다 한 단계 아래에 배치했어요.">
        <div className="quick-links">
          <Link to="/admin/students" className="button button--secondary">
            학생 관리
          </Link>
          <Link to="/admin/items" className="button button--secondary">
            아이템 관리
          </Link>
          <Link to="/admin/sessions" className="button button--secondary">
            차시 관리
          </Link>
        </div>
      </SectionCard>

      <div className="dashboard-grid">
        <TeacherControlPanel
          repository={repository}
          sessions={sortedSessions}
          students={students}
          items={items}
          onRefresh={actions.refresh}
        />

        <SectionCard title="운영 메모" description="대시보드 아래에는 자주 쓰는 보조 운영 기능만 남겨 두었어요.">
          <ul className="bullet-list">
            <li>현재 차시 변경은 상단 핵심 영역에서 먼저 처리할 수 있어요.</li>
            <li>학생 지급, 전체 지급, 자동 학생 생성 같은 보조 작업은 이 영역에서 이어서 진행해요.</li>
            <li>모의 데이터 환경에서는 초기화 버튼으로 빠르게 상태를 되돌릴 수 있어요.</li>
          </ul>

          {repositoryMode === 'mock' && (
            <div className="quick-links">
              <button type="button" className="button button--ghost" onClick={() => actions.resetMockData()}>
                모의 데이터 초기화
              </button>
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="최근 활동" description="필수 운영 정보는 아니므로 간단히만 확인할 수 있게 두었어요.">
        {logs.length ? (
          <ul className="timeline">
            {logs.slice(0, 6).map((log) => (
              <li key={log.id}>
                <strong>{actionTypeToLabel(log.actionType)}</strong>
                <p>
                  {decodeUnicodeText(
                    log.payload.customName ||
                      log.payload.itemName ||
                      findCharacterById(characters, log.payload.selectedCharacter)?.name ||
                      '수업 활동',
                  )}
                </p>
                <small>{formatDateTime(log.timestamp)}</small>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="최근 활동 기록이 없어요."
            description="활동 기록이 없어도 관리자 운영에는 문제가 없어요."
          />
        )}
      </SectionCard>
    </div>
  );
}
