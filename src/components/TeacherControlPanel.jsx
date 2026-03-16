import { useMemo, useState } from 'react';
import SectionCard from './common/SectionCard';
import useAppContext from '../hooks/useAppContext';
import { formatStudentLabel, getErrorMessage } from '../utils/format';
import { seedStudents } from '../scripts/seedStudents';

const initialSeedForm = {
  grade: '5',
  classNumber: '1',
  startNumber: '1',
  endNumber: '25',
  defaultPassword: '1234',
};

export default function TeacherControlPanel({ repository, sessions, students, items, onRefresh }) {
  const { activeSession } = useAppContext();
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStudentItemId, setSelectedStudentItemId] = useState('');
  const [selectedAllItemId, setSelectedAllItemId] = useState('');
  const [seedForm, setSeedForm] = useState(initialSeedForm);
  const [busyAction, setBusyAction] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  const sortedStudents = useMemo(
    () =>
      [...(students || [])].sort((left, right) => {
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

  async function runAction(actionKey, task, successMessage) {
    setBusyAction(actionKey);
    setStatus({ type: '', message: '' });

    try {
      const result = await task();
      await onRefresh?.();
      setStatus({ type: 'success', message: successMessage(result) });
      return result;
    } catch (error) {
      setStatus({ type: 'error', message: getErrorMessage(error) });
      return null;
    } finally {
      setBusyAction('');
    }
  }

  async function handleSessionUpdate() {
    const nextSessionId = currentSessionId || activeSession?.id || sessions?.[0]?.id || '';

    if (!nextSessionId) {
      setStatus({ type: 'error', message: '변경할 차시를 선택해 주세요.' });
      return;
    }

    await runAction(
      'session',
      () => repository.updateCurrentSession(nextSessionId),
      () => '현재 차시를 변경했어요.',
    );
  }

  async function handleSeedStudents() {
    const result = await runAction(
      'seed',
      () =>
        seedStudents({
          repository,
          existingStudents: students,
          grade: Number(seedForm.grade),
          classNumber: Number(seedForm.classNumber),
          startNumber: Number(seedForm.startNumber),
          endNumber: Number(seedForm.endNumber),
          defaultPassword: seedForm.defaultPassword,
        }),
      ({ createdCount, skippedCount }) =>
        `학생 ${createdCount}명을 생성했어요.${skippedCount ? ` 중복 ${skippedCount}명은 건너뛰었어요.` : ''}`,
    );

    if (result) {
      setSelectedStudentId('');
    }
  }

  async function handleGiveItemToStudent() {
    if (!selectedStudentId || !selectedStudentItemId) {
      setStatus({ type: 'error', message: '학생과 아이템을 모두 선택해 주세요.' });
      return;
    }

    await runAction(
      'student-item',
      () =>
        repository.giveBonusItemToStudent({
          studentId: selectedStudentId,
          itemId: selectedStudentItemId,
          sessionId: activeSession?.id || null,
        }),
      () => '선택한 학생에게 아이템을 지급했어요.',
    );
  }

  async function handleGiveItemToAll() {
    if (!selectedAllItemId) {
      setStatus({ type: 'error', message: '전체 지급할 아이템을 선택해 주세요.' });
      return;
    }

    await runAction(
      'all-item',
      () =>
        repository.giveBonusItemToAll({
          itemId: selectedAllItemId,
          sessionId: activeSession?.id || null,
        }),
      ({ successCount, skippedCount }) =>
        `전체 지급 완료: ${successCount}명 지급${skippedCount ? `, ${skippedCount}명 건너뜀` : ''}`,
    );
  }

  return (
    <SectionCard
      title="교사용 컨트롤 패널"
      description="현재 차시 변경, 학생 자동 생성, 개별 지급, 전체 지급을 한곳에서 처리해요."
    >
      <div className="stack-page">
        <div className="dashboard-grid">
          <div className="stack-page">
            <div className="form-grid">
              <label className="form-grid__full">
                현재 차시
                <select
                  value={currentSessionId || activeSession?.id || ''}
                  onChange={(event) => setCurrentSessionId(event.target.value)}
                >
                  {sessions?.length ? (
                    sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.id} / {session.title}
                      </option>
                    ))
                  ) : (
                    <option value="">차시 없음</option>
                  )}
                </select>
              </label>
            </div>
            <div className="quick-links">
              <button
                type="button"
                className="button button--primary"
                disabled={!sessions?.length || busyAction === 'session'}
                onClick={handleSessionUpdate}
              >
                {busyAction === 'session' ? '변경 중...' : '현재 차시 변경'}
              </button>
            </div>
            <p className="helper-text">
              현재 적용 중인 차시: {activeSession?.title || '없음'}
            </p>
          </div>

          <div className="stack-page">
            <div className="form-grid">
              <label>
                학년
                <input
                  value={seedForm.grade}
                  inputMode="numeric"
                  onChange={(event) => setSeedForm((current) => ({ ...current, grade: event.target.value }))}
                />
              </label>
              <label>
                반
                <input
                  value={seedForm.classNumber}
                  inputMode="numeric"
                  onChange={(event) => setSeedForm((current) => ({ ...current, classNumber: event.target.value }))}
                />
              </label>
              <label>
                시작 번호
                <input
                  value={seedForm.startNumber}
                  inputMode="numeric"
                  onChange={(event) => setSeedForm((current) => ({ ...current, startNumber: event.target.value }))}
                />
              </label>
              <label>
                끝 번호
                <input
                  value={seedForm.endNumber}
                  inputMode="numeric"
                  onChange={(event) => setSeedForm((current) => ({ ...current, endNumber: event.target.value }))}
                />
              </label>
              <label className="form-grid__full">
                기본 비밀번호
                <input
                  value={seedForm.defaultPassword}
                  inputMode="numeric"
                  maxLength="4"
                  onChange={(event) =>
                    setSeedForm((current) => ({ ...current, defaultPassword: event.target.value }))
                  }
                />
              </label>
            </div>
            <div className="quick-links">
              <button
                type="button"
                className="button button--secondary"
                disabled={busyAction === 'seed'}
                onClick={handleSeedStudents}
              >
                {busyAction === 'seed' ? '생성 중...' : '학생 자동 생성'}
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="stack-page">
            <div className="form-grid">
              <label className="form-grid__full">
                지급할 학생
                <select value={selectedStudentId} onChange={(event) => setSelectedStudentId(event.target.value)}>
                  <option value="">학생 선택</option>
                  {sortedStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {formatStudentLabel(student)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-grid__full">
                지급할 아이템
                <select
                  value={selectedStudentItemId}
                  onChange={(event) => setSelectedStudentItemId(event.target.value)}
                >
                  <option value="">아이템 선택</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="quick-links">
              <button
                type="button"
                className="button button--secondary"
                disabled={busyAction === 'student-item' || !students.length || !items.length}
                onClick={handleGiveItemToStudent}
              >
                {busyAction === 'student-item' ? '지급 중...' : '특정 학생에게 지급'}
              </button>
            </div>
          </div>

          <div className="stack-page">
            <div className="form-grid">
              <label className="form-grid__full">
                전체 지급 아이템
                <select value={selectedAllItemId} onChange={(event) => setSelectedAllItemId(event.target.value)}>
                  <option value="">아이템 선택</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="quick-links">
              <button
                type="button"
                className="button button--secondary"
                disabled={busyAction === 'all-item' || !students.length || !items.length}
                onClick={handleGiveItemToAll}
              >
                {busyAction === 'all-item' ? '지급 중...' : '전체 학생에게 지급'}
              </button>
            </div>
            <p className="helper-text">인벤토리가 가득 찬 학생은 자동으로 건너뛰어요.</p>
          </div>
        </div>

        {status.message && (
          <p
            className="helper-text"
            style={{ color: status.type === 'error' ? '#b91c1c' : '#0f766e', marginTop: 0 }}
          >
            {status.message}
          </p>
        )}
      </div>
    </SectionCard>
  );
}
