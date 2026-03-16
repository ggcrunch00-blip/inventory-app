import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAppContext from '../../hooks/useAppContext';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import EmptyState from '../../components/common/EmptyState';
import TeacherControlPanel from '../../components/TeacherControlPanel';
import { actionTypeToLabel, decodeUnicodeText, formatDateTime } from '../../utils/format';
import { findCharacterById } from '../../utils/constants';

function getSessionLabel(session) {
  return decodeUnicodeText(session?.label || session?.title || session?.id || '');
}

export default function AdminDashboardPage() {
  const { students, items, sessions, logs, activeSession, repositoryMode, actions, characters, repository } =
    useAppContext();
  const [changingSessionId, setChangingSessionId] = useState('');

  const sortedSessions = [...sessions].sort((left, right) => {
    const leftOrder = Number.isFinite(Number(left?.sortOrder)) ? Number(left.sortOrder) : Number.MAX_SAFE_INTEGER;
    const rightOrder = Number.isFinite(Number(right?.sortOrder)) ? Number(right.sortOrder) : Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return getSessionLabel(left).localeCompare(getSessionLabel(right), 'ko');
  });

  async function handleChangeSession(sessionId) {
    if (!sessionId || sessionId === activeSession?.id || changingSessionId) {
      return;
    }

    try {
      setChangingSessionId(sessionId);
      await actions.updateCurrentSession(sessionId);
    } catch (error) {
      return;
    } finally {
      setChangingSessionId('');
    }
  }

  return (
    <div className="stack-page">
      <PageHeader
        eyebrow="선생님 관리"
        title="수업 운영 현황"
        description="학생 수, 현재 차시, 최근 기록과 차시 변경을 이 화면에서 바로 확인할 수 있어요."
      />

      <div className="stats-grid">
        <SectionCard title="학생 수">
          <div className="metric">{students.length}명</div>
        </SectionCard>
        <SectionCard title="아이템 수">
          <div className="metric">{items.length}개</div>
        </SectionCard>
        <SectionCard title="차시 수">
          <div className="metric">{sortedSessions.length}개</div>
        </SectionCard>
        <SectionCard title="현재 차시">
          <div className="metric">{getSessionLabel(activeSession) || '없음'}</div>
          <p className="helper-text">{activeSession?.id || '아직 차시가 선택되지 않았어요.'}</p>
        </SectionCard>
      </div>

      <div className="dashboard-grid">
        <TeacherControlPanel
          repository={repository}
          sessions={sortedSessions}
          students={students}
          items={items}
          onRefresh={actions.refresh}
        />

        <SectionCard title="빠른 이동" description="자주 여는 관리 화면으로 바로 이동해요.">
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
      </div>

      <div className="dashboard-grid">
        <SectionCard title="현재 차시" description="지금 학생 화면에 적용되는 차시입니다.">
          {activeSession ? (
            <div className="stack-page">
              <p>
                <strong>현재 차시:</strong> {getSessionLabel(activeSession)}
              </p>
              <p className="helper-text">차시 ID: {activeSession.id}</p>
            </div>
          ) : (
            <EmptyState
              title="현재 차시가 없어요"
              description="아래에서 차시를 선택하면 학생 화면에 바로 반영됩니다."
            />
          )}
        </SectionCard>

        <SectionCard title="차시 변경" description="버튼을 누르면 현재 차시가 바로 바뀝니다.">
          {sortedSessions.length ? (
            <div className="quick-links">
              {sortedSessions.map((session) => {
                const isActive = session.id === activeSession?.id;
                const isChanging = changingSessionId === session.id;

                return (
                  <button
                    key={session.id}
                    type="button"
                    className={isActive ? 'button button--primary' : 'button button--secondary'}
                    disabled={isActive || Boolean(changingSessionId)}
                    onClick={() => handleChangeSession(session.id)}
                  >
                    {isChanging ? '변경 중...' : getSessionLabel(session)}
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="등록된 차시가 없어요"
              description="차시 관리에서 차시를 추가하면 여기에서 선택할 수 있어요."
            />
          )}
        </SectionCard>
      </div>

      <div className="dashboard-grid">
        <SectionCard title="안내" description="수업 중 자주 하는 관리 작업을 확인해 주세요.">
          <ul className="bullet-list">
            <li>학생 관리에서 비밀번호 재설정과 인벤토리 확인이 가능해요.</li>
            <li>현재 차시를 바꾸면 학생 보상 화면도 바로 함께 바뀝니다.</li>
            <li>보너스 아이템은 수동으로 지급할 수 있어요.</li>
          </ul>
          {repositoryMode === 'mock' && (
            <button type="button" className="button button--ghost" onClick={() => actions.resetMockData()}>
              모의 데이터 초기화
            </button>
          )}
        </SectionCard>

        <SectionCard title="차시 메모" description="선택된 차시의 메모를 볼 수 있어요.">
          {activeSession ? (
            <div className="stack-page">
              <p>
                <strong>{getSessionLabel(activeSession)}</strong>
              </p>
              <p className="helper-text">차시 ID: {activeSession.id}</p>
              <p>{decodeUnicodeText(activeSession.notes || '아직 메모가 없어요.')}</p>
            </div>
          ) : (
            <EmptyState
              title="현재 차시가 없어요"
              description="차시를 선택하면 메모를 볼 수 있어요."
            />
          )}
        </SectionCard>
      </div>

      <SectionCard title="최근 활동" description="최근 기록 8개를 보여 줘요.">
        {logs.length ? (
          <ul className="timeline">
            {logs.slice(0, 8).map((log) => (
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
            title="아직 활동 기록이 없어요"
            description="학생들이 앱을 사용하면 기록이 이곳에 보여요."
          />
        )}
      </SectionCard>
    </div>
  );
}
