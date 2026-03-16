import { Link } from 'react-router-dom';
import useAppContext from '../../hooks/useAppContext';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import InventoryGrid from '../../components/common/InventoryGrid';
import EmptyState from '../../components/common/EmptyState';
import { actionTypeToLabel, decodeUnicodeText, formatDateTime } from '../../utils/format';
import { findCharacterById } from '../../utils/constants';

export default function StudentDashboardPage() {
  const { currentStudent, activeSession, characters, items, logs } = useAppContext();

  const character = findCharacterById(characters, currentStudent?.selectedCharacter);
  const itemsById = Object.fromEntries(items.map((item) => [item.id, item]));
  const studentLogs = logs.filter((log) => log.studentId === currentStudent?.id);
  const recentObtained = studentLogs.filter((log) =>
    ['item_purchased', 'item_bonus_received', 'admin_bonus_given', 'pet_selected', 'special_item_selected', 'mission_item_selected'].includes(log.actionType),
  );
  const recentDiscarded = studentLogs.filter((log) =>
    ['item_discarded', 'admin_inventory_removed'].includes(log.actionType),
  );
  const studentName = decodeUnicodeText(currentStudent?.nickname || currentStudent?.name || '');
  const activeSessionTitle = decodeUnicodeText(activeSession?.title || '');

  return (
    <div className="stack-page">
      <PageHeader
        eyebrow={activeSession ? `현재 차시: ${activeSessionTitle}` : '현재 차시 없음'}
        title={`${studentName}의 인벤토리`}
        description="12칸 인벤토리를 한눈에 볼 수 있어요."
        actions={
          <Link to="/student/reward" className="button button--primary">
            아이템 얻기
          </Link>
        }
      />

      <div className="dashboard-grid">
        <SectionCard title="내 캐릭터" description="처음 선택한 캐릭터를 계속 사용해요.">
          {character ? (
            <div className="character-summary">
              <img src={character.imageUrl} alt={decodeUnicodeText(character.name)} />
              <div>
                <strong>{decodeUnicodeText(character.name)}</strong>
                <p>{decodeUnicodeText(character.summary)}</p>
              </div>
            </div>
          ) : (
            <EmptyState
              title="캐릭터를 아직 고르지 않았어요"
              description="캐릭터 선택 화면에서 먼저 골라 주세요."
            />
          )}
        </SectionCard>

        <SectionCard title="학생 정보" description="로그인한 학생 정보가 맞는지 확인해 주세요.">
          <div className="info-list">
            <div>
              <span>학년 / 반</span>
              <strong>
                {currentStudent?.grade}학년 {currentStudent?.classNumber}반
              </strong>
            </div>
            <div>
              <span>번호</span>
              <strong>{currentStudent?.studentNumber}번</strong>
            </div>
            <div>
              <span>이름</span>
              <strong>{decodeUnicodeText(currentStudent?.name || '')}</strong>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="내 아이템 12칸"
        description="칸이 모두 차면 새 아이템을 받기 전에 기존 아이템 1개를 버려야 해요."
      >
        <InventoryGrid inventory={currentStudent?.inventory || []} itemsById={itemsById} />
      </SectionCard>

      <div className="dashboard-grid">
        <SectionCard title="최근 얻은 아이템" description="최근에 받은 순서대로 보여 줘요.">
          {recentObtained.length ? (
            <ul className="history-list">
              {recentObtained.slice(0, 5).map((log) => (
                <li key={log.id}>
                  <strong>
                    {decodeUnicodeText(
                      log.payload.customName || itemsById[log.payload.itemId]?.name || log.payload.itemName || '아이템',
                    )}
                  </strong>
                  <span>{actionTypeToLabel(log.actionType)}</span>
                  <small>{formatDateTime(log.timestamp)}</small>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="아직 받은 아이템이 없어요"
              description="보상 화면에서 받은 아이템이 여기에 표시돼요."
            />
          )}
        </SectionCard>

        <SectionCard title="최근 버린 아이템" description="인벤토리가 가득 찼을 때 버린 기록이 보여요.">
          {recentDiscarded.length ? (
            <ul className="history-list">
              {recentDiscarded.slice(0, 5).map((log) => (
                <li key={log.id}>
                  <strong>
                    {decodeUnicodeText(
                      log.payload.customName || log.payload.itemName || itemsById[log.payload.itemId]?.name || '아이템',
                    )}
                  </strong>
                  <span>{actionTypeToLabel(log.actionType)}</span>
                  <small>{formatDateTime(log.timestamp)}</small>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="버린 아이템이 없어요"
              description="아이템을 버릴 때 기록이 여기에 남아요."
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
