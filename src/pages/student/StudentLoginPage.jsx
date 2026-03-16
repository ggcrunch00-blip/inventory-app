import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import useAppContext from '../../hooks/useAppContext';
import { APP_TITLE } from '../../utils/constants';

export default function StudentLoginPage() {
  const { currentStudent, actions, loading, repositoryMode } = useAppContext();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    grade: '5',
    classNumber: '1',
    studentNumber: '',
    password4digit: '',
  });

  if (currentStudent) {
    return <Navigate to={currentStudent.selectedCharacter ? '/student/dashboard' : '/student/characters'} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const student = await actions.loginStudent(form);
      navigate(student.selectedCharacter ? '/student/dashboard' : '/student/characters');
    } catch (error) {
      return;
    }
  }

  return (
    <div className="auth-screen">
      <section className="auth-card">
        <p className="auth-card__eyebrow">학생용 화면</p>
        <h1>{APP_TITLE}</h1>
        <p className="auth-card__description">수업이 끝난 뒤 오늘 점수로 아이템을 받고 보상을 확인해 보세요.</p>

        {repositoryMode === 'mock' && (
          <div className="demo-hint">
            <strong>로컬 테스트 계정</strong>
            <p>5학년 1반 1번 / 비밀번호 1111</p>
            <p>5학년 1반 2번 / 비밀번호 2222</p>
          </div>
        )}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            학년
            <input value={form.grade} onChange={(event) => setForm({ ...form, grade: event.target.value })} inputMode="numeric" />
          </label>
          <label>
            반
            <input
              value={form.classNumber}
              onChange={(event) => setForm({ ...form, classNumber: event.target.value })}
              inputMode="numeric"
            />
          </label>
          <label>
            번호
            <input
              value={form.studentNumber}
              onChange={(event) => setForm({ ...form, studentNumber: event.target.value })}
              inputMode="numeric"
            />
          </label>
          <label>
            4자리 비밀번호
            <input
              type="password"
              maxLength="4"
              value={form.password4digit}
              onChange={(event) => setForm({ ...form, password4digit: event.target.value })}
              inputMode="numeric"
            />
          </label>
          <button type="submit" className="button button--primary button--full" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <Link className="text-link" to="/admin/login">
          선생님 관리 화면으로 이동
        </Link>
      </section>
    </div>
  );
}
