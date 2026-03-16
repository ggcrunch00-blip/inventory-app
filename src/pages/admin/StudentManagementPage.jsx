import { useMemo, useState } from 'react';
import useAppContext from '../../hooks/useAppContext';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import InventoryGrid from '../../components/common/InventoryGrid';
import EmptyState from '../../components/common/EmptyState';
import { decodeUnicodeText, formatStudentLabel } from '../../utils/format';
import { findCharacterById } from '../../utils/constants';
import { getItemAcquisitionType } from '../../data/lessonItemSeeds';
import { getInventoryEntryName } from '../../utils/inventory';

const emptyForm = {
  grade: '5',
  classNumber: '1',
  studentNumber: '',
  name: '',
  nickname: '',
  password4digit: '',
};

export default function StudentManagementPage() {
  const { students, items, activeSession, actions, characters } = useAppContext();
  const [editingStudentId, setEditingStudentId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [selectedBonusItemId, setSelectedBonusItemId] = useState('');

  const itemsById = Object.fromEntries(items.map((item) => [item.id, item]));
  const bonusCandidates = useMemo(
    () => items.filter((item) => ['teacher_award', 'bonus', 'special'].includes(getItemAcquisitionType(item))),
    [items],
  );

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
        description="학생 등록, 수정, 삭제, 비밀번호 재설정과 인벤토리 확인을 이곳에서 해요."
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

        <SectionCard title="보너스 지급" description="선택한 보너스 아이템을 전체 학생에게 한 번에 지급할 수 있어요.">
          {bonusCandidates.length ? (
            <>
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
            </>
          ) : (
            <EmptyState
              title="지급할 보너스 아이템이 없어요"
              description="아이템 관리에서 보너스 아이템을 먼저 등록해 주세요."
            />
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="학생 목록"
        description="학생별 인벤토리 확인, 캐릭터 초기화, 개별 보너스 지급을 할 수 있어요."
      >
        {students.length ? (
          <div className="student-admin-grid">
            {students.map((student) => (
              <article key={student.id} className="student-admin-card">
                <div className="student-admin-card__header">
                  <div>
                    <strong>{formatStudentLabel(student)}</strong>
                    <p>
                      비밀번호 {student.password4digit} / 캐릭터{' '}
                      {decodeUnicodeText(findCharacterById(characters, student.selectedCharacter)?.name || '미선택')}
                    </p>
                  </div>
                  <div className="quick-links">
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

                <InventoryGrid inventory={student.inventory || []} itemsById={itemsById} compact />

                {(student.inventory || []).length ? (
                  <div className="pill-row">
                    {student.inventory.map((entry) => (
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
                        {getInventoryEntryName(entry, itemsById[entry.itemId])} 삭제
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="helper-text">인벤토리가 비어 있어요.</p>
                )}

                <button
                  type="button"
                  className="button button--secondary button--full"
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
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="아직 등록된 학생이 없어요"
            description="위 입력 폼에서 첫 학생을 등록해 주세요."
          />
        )}
      </SectionCard>
    </div>
  );
}
