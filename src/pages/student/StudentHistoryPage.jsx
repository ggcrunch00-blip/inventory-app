import useAppContext from '../../hooks/useAppContext';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import EmptyState from '../../components/common/EmptyState';
import { actionTypeToLabel, decodeUnicodeText, formatDateTime } from '../../utils/format';

export default function StudentHistoryPage() {
  const { currentStudent, items, logs, sessions } = useAppContext();
  const itemsById = Object.fromEntries(items.map((item) => [item.id, item]));
  const sessionsById = Object.fromEntries(sessions.map((session) => [session.id, session]));
  const studentLogs = logs.filter((log) => log.studentId === currentStudent?.id);

  return (
    <div className="stack-page">
      <PageHeader
        title="내 기록 보기"
        description="점수, 아이템, 펫, 버리기 기록을 시간 순서로 볼 수 있어요."
      />

      <SectionCard title="기록 목록" description="최근 기록이 먼저 보여요.">
        {studentLogs.length ? (
          <ul className="timeline">
            {studentLogs.map((log) => (
              <li key={log.id}>
                <strong>{actionTypeToLabel(log.actionType)}</strong>
                <p>
                  {decodeUnicodeText(sessionsById[log.sessionId]?.title || '공통')} /{' '}
                  {decodeUnicodeText(
                    log.payload.customName || itemsById[log.payload.itemId]?.name || log.payload.itemName || '기록',
                  )}
                </p>
                <small>{formatDateTime(log.timestamp)}</small>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="아직 기록이 없어요"
            description="수업에서 활동하면 기록이 여기에 쌓여요."
          />
        )}
      </SectionCard>
    </div>
  );
}
