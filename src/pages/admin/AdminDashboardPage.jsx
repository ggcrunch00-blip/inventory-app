import { Link } from 'react-router-dom';
import useAppContext from '../../hooks/useAppContext';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import EmptyState from '../../components/common/EmptyState';
import TeacherControlPanel from '../../components/TeacherControlPanel';
import { actionTypeToLabel, decodeUnicodeText, formatDateTime } from '../../utils/format';
import { findCharacterById } from '../../utils/constants';

export default function AdminDashboardPage() {
  const { students, items, sessions, logs, activeSession, repositoryMode, actions, characters, repository } =
    useAppContext();

  return (
    <div className="stack-page">
      <PageHeader
        eyebrow="선생님 관리"
        title="수업 운영 현황"
        description="학생 수, 현재 차시, 최근 기록을 한 화면에서 확인할 수 있어요."
      />

      <div className="stats-grid">
        <SectionCard title="학생 수">
          <div className="metric">{students.length}명</div>
        </SectionCard>
        <SectionCard title="아이템 수">
          <div className="metric">{items.length}개</div>
        </SectionCard>
        <SectionCard title="차시 수">
          <div className="metric">{sessions.length}개</div>
        </SectionCard>
        <SectionCard title="현재 차시">
          <div className="metric">{decodeUnicodeText(activeSession?.title || '없음')}</div>
          <p className="helper-text">{activeSession?.id || '아직 차시가 선택되지 않았어요.'}</p>
        </SectionCard>
      </div>

      <div className="dashboard-grid">
        <TeacherControlPanel
          repository={repository}
          sessions={sessions}
          students={students}
          items={items}
          onRefresh={actions.refresh}
        />

        <SectionCard title="빠른 이동" description="자주 쓰는 관리 화면으로 바로 이동해요.">
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
        <SectionCard title="안내" description="수업 중 자주 쓰는 관리 포인트를 확인해 주세요.">
          <ul className="bullet-list">
            <li>학생 관리에서 비밀번호 재설정과 인벤토리 확인이 가능해요.</li>
            <li>현재 차시를 바꾸면 학생 보상 화면도 바로 바뀝니다.</li>
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
                <strong>{decodeUnicodeText(activeSession.title)}</strong>
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
            description="학생이 앱을 사용하면 기록이 여기에 보여요."
          />
        )}
      </SectionCard>
    </div>
  );
}
