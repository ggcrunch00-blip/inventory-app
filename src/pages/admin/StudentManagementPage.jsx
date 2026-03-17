import { useMemo, useState } from 'react';
import useAppContext from '../../hooks/useAppContext';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import InventoryGrid from '../../components/common/InventoryGrid';
import EmptyState from '../../components/common/EmptyState';
import { decodeUnicodeText, formatStudentLabel } from '../../utils/format';
import { findCharacterById } from '../../utils/constants';
import { getItemAcquisitionType, getSessionLabel as getLessonSessionLabel } from '../../data/lessonItemSeeds';
import { getInventoryEntryName } from '../../utils/inventory';

const emptyForm = {
  grade: '5',
  classNumber: '1',
  studentNumber: '',
  name: '',
  nickname: '',
  password4digit: '',
};

function getCharacterName(characters, selectedCharacter) {
  return decodeUnicodeText(findCharacterById(characters, selectedCharacter)?.name || '미선택');
}

function getStudentSearchText(student, characters) {
  return [
    formatStudentLabel(student),
    decodeUnicodeText(student.name),
    decodeUnicodeText(student.nickname || ''),
    getCharacterName(characters, student.selectedCharacter),
    `${student.grade}-${student.classNumber}-${student.studentNumber}`,
    `${student.grade}${student.classNumber}${student.studentNumber}`,
    student.id,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export default function StudentManagementPage() {
  const { students, items, activeSession, actions, characters } = useAppContext();
  const [editingStudentId, setEditingStudentId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [selectedBonusItemId, setSelectedBonusItemId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStudentIds, setExpandedStudentIds] = useState([]);

  const itemsById = Object.fromEntries(items.map((item) => [item.id, item]));
  const bonusCandidates = useMemo(
    () => items.filter((item) => ['teacher_award', 'bonus', 'special'].includes(getItemAcquisitionType(item))),
    [items],
  );
  const sortedStudents = useMemo(
    () =>
      [...students].sort((left, right) => {
        if (Number(left.grade) !== Number(right.grade)) {
          return Number(left.grade) - Number(right.grade);
        }

        if (Number(left.classNumber) !== Number(right.classNumber)) {
          return Number(left.classNumber) - Number(right.classNumber);
        }

        return Number(left.studentNumber) - Number(right.studentNumber);
      }),
    [students],
  );
  const filteredStudents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return sortedStudents;
    }

    return sortedStudents.filter((student) => getStudentSearchText(student, characters).includes(normalizedQuery));
  }, [characters, searchQuery, sortedStudents]);

  function startEditing(student) {
    setEditingStudentId(student.id);
    setForm({
      grade: String(student.grade),
      classNumber: String(student.classNumber),
      studentNumber: String(student.studentNumber),
      name: decodeUnicodeText(student.name),
      nickname: decodeUnicodeText(student.nickname || ''),
      password4digit: student.password4digit,
    });
  }

  function resetForm() {
    setEditingStudentId('');
    setForm(emptyForm);
  }

  function toggleStudentExpanded(studentId) {
    setExpandedStudentIds((current) =>
      current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId],
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      if (editingStudentId) {
        await actions.updateStudent(editingStudentId, form);
      } else {
        await actions.createStudent(form);
      }

      resetForm();
    } catch (error) {
      return;
    }
  }

  return (
    <div className="stack-page">
      <PageHeader
        title="학생 관리"
        description="학생을 빠르게 찾고, 필요한 학생만 펼쳐서 인벤토리와 지급/회수 작업을 진행할 수 있어요."
      />

      <div className="admin-columns">
        <SectionCard
          title={editingStudentId ? '학생 정보 수정' : '새 학생 등록'}
          description="학년, 반, 번호는 학생 로그인 정보로 사용돼요."
        >
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              학년
              <input value={form.grade} onChange={(event) => setForm({ ...form, grade: event.target.value })} inputMode="numeric" />
            </label>
            <label>
              반
              <input value={form.classNumber} onChange={(event) => setForm({ ...form, classNumber: event.target.value })} inputMode="numeric" />
            </label>
            <label>
              번호
              <input value={form.studentNumber} onChange={(event) => setForm({ ...form, studentNumber: event.target.value })} inputMode="numeric" />
            </label>
            <label>
              이름
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label>
              별명
              <input value={form.nickname} onChange={(event) => setForm({ ...form, nickname: event.target.value })} />
            </label>
            <label>
              4자리 비밀번호
              <input
                value={form.password4digit}
                onChange={(event) => setForm({ ...form, password4digit: event.target.value })}
                inputMode="numeric"
                maxLength="4"
              />
            </label>
            <button type="submit" className="button button--primary button--full">
              {editingStudentId ? '저장하기' : '학생 등록'}
            </button>
            {editingStudentId && (
              <button type="button" className="button button--ghost button--full" onClick={resetForm}>
                취소
              </button>
            )}
          </form>
        </SectionCard>

        <SectionCard title="보너스 지급" description="전체 지급과 개별 지급에 공통으로 사용할 보너스 아이템을 먼저 선택해 두세요.">
          {bonusCandidates.length ? (
            <div className="stack-page">
              <label>
                지급할 아이템
                <select value={selectedBonusItemId} onChange={(event) => setSelectedBonusItemId(event.target.value)}>
                  <option value="">아이템 선택</option>
                  {bonusCandidates.map((item) => (
                    <option key={item.id} value={item.id}>
                      {decodeUnicodeText(item.name)}
                    </option>
                  ))}
                </select>
              </label>
              <p className="helper-text">
                현재 차시: {getLessonSessionLabel(activeSession) || '없음'} / 선택한 아이템:{' '}
                {decodeUnicodeText(itemsById[selectedBonusItemId]?.name || '없음')}
              </p>
              <button
                type="button"
                className="button button--secondary button--full"
                disabled={!selectedBonusItemId}
                onClick={async () => {
                  if (!selectedBonusItemId) {
                    return;
                  }

                  await actions.giveBonusItemToAll({
                    itemId: selectedBonusItemId,
                    sessionId: activeSession?.id || null,
                  });
                }}
              >
                모든 학생에게 지급
              </button>
            </div>
          ) : (
            <EmptyState
              title="지급할 보너스 아이템이 없어요."
              description="아이템 관리에서 보너스 아이템을 먼저 등록해 주세요."
            />
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="학생 목록"
        description="검색으로 학생을 빠르게 찾고, 필요한 학생만 펼쳐서 인벤토리를 확인하세요."
        action={
          <div className="quick-links">
            <span className="chip">{filteredStudents.length}명 표시</span>
            {expandedStudentIds.length ? (
              <button type="button" className="button button--ghost button--small" onClick={() => setExpandedStudentIds([])}>
                모두 접기
              </button>
            ) : null}
          </div>
        }
      >
        {students.length ? (
          <div className="stack-page">
            <div className="inline-form">
              <input
                value={searchQuery}
                placeholder="이름, 번호, 반, 캐릭터로 검색"
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              {searchQuery ? (
                <button type="button" className="button button--ghost" onClick={() => setSearchQuery('')}>
                  검색 지우기
                </button>
              ) : null}
            </div>
            <p className="helper-text">학생 카드는 요약형으로 보여 주고, 상세를 열었을 때만 인벤토리 12칸을 렌더링해요.</p>

            {filteredStudents.length ? (
              <div className="student-admin-grid">
                {filteredStudents.map((student) => {
                  const inventory = student.inventory || [];
                  const isExpanded = expandedStudentIds.includes(student.id);

                  return (
                    <article
                      key={student.id}
                      className={`student-admin-card ${isExpanded ? 'student-admin-card--expanded' : ''}`.trim()}
                    >
                      <div className="student-admin-card__header">
                        <div>
                          <strong>{decodeUnicodeText(student.name)}</strong>
                          <p>
                            {student.grade}학년 {student.classNumber}반 {student.studentNumber}번 / 비밀번호{' '}
                            {student.password4digit}
                          </p>
                        </div>
                        <div className="quick-links">
                          <button
                            type="button"
                            className="button button--ghost button--small"
                            onClick={() => toggleStudentExpanded(student.id)}
                          >
                            {isExpanded ? '상세 닫기' : '상세 보기'}
                          </button>
                          <button type="button" className="button button--ghost button--small" onClick={() => startEditing(student)}>
                            수정
                          </button>
                          <button
                            type="button"
                            className="button button--ghost button--small"
                            onClick={() => actions.updateStudent(student.id, { selectedCharacter: '' })}
                          >
                            캐릭터 초기화
                          </button>
                          <button
                            type="button"
                            className="button button--secondary button--small"
                            disabled={!selectedBonusItemId}
                            onClick={() =>
                              actions.giveBonusItemToStudent({
                                studentId: student.id,
                                itemId: selectedBonusItemId,
                                sessionId: activeSession?.id || null,
                              })
                            }
                          >
                            선택한 보너스 지급
                          </button>
                          <button
                            type="button"
                            className="button button--danger button--small"
                            onClick={() => {
                              if (window.confirm(`${decodeUnicodeText(student.name)} 학생을 삭제할까요?`)) {
                                actions.deleteStudent(student.id);
                              }
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      </div>

                      <div className="info-list">
                        <div>
                          <span>식별 정보</span>
                          <strong>{formatStudentLabel(student)}</strong>
                        </div>
                        <div>
                          <span>캐릭터</span>
                          <strong>{getCharacterName(characters, student.selectedCharacter)}</strong>
                        </div>
                        <div>
                          <span>보유 아이템 수</span>
                          <strong>{inventory.length}개</strong>
                        </div>
                      </div>

                      {isExpanded ? (
                        <div className="stack-page">
                          <InventoryGrid inventory={inventory} itemsById={itemsById} compact />

                          {inventory.length ? (
                            <div className="pill-row">
                              {inventory.map((entry) => (
                                <button
                                  key={entry.id}
                                  type="button"
                                  className="pill-button"
                                  onClick={() =>
                                    actions.removeInventoryEntry({
                                      studentId: student.id,
                                      inventoryEntryId: entry.id,
                                      sessionId: activeSession?.id || null,
                                    })
                                  }
                                >
                                  {getInventoryEntryName(entry, itemsById[entry.itemId])} 회수
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="helper-text">인벤토리가 비어 있어요.</p>
                          )}
                        </div>
                      ) : (
                        <p className="helper-text">상세 보기를 누르면 인벤토리 12칸과 개별 회수 버튼이 열려요.</p>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <EmptyState title="검색 결과가 없어요." description="이름이나 번호 일부로 다시 검색해 보세요." />
            )}
          </div>
        ) : (
          <EmptyState title="아직 등록된 학생이 없어요." description="위 입력 폼에서 첫 학생을 등록해 주세요." />
        )}
      </SectionCard>
    </div>
  );
}
