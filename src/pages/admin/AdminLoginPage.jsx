import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import useAppContext from '../../hooks/useAppContext';

export default function AdminLoginPage() {
  const { currentAdmin, actions, loading, repositoryMode } = useAppContext();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    loginId: 'teacher',
    password: '1234',
  });

  if (currentAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await actions.loginAdmin(form);
      navigate('/admin/dashboard');
    } catch (error) {
      return;
    }
  }

  return (
    <div className="auth-screen auth-screen--admin">
      <section className="auth-card auth-card--admin">
        <p className="auth-card__eyebrow">선생님 관리 로그인</p>
        <h1>관리 화면</h1>
        <p className="auth-card__description">학생, 아이템, 차시를 관리하고 보너스 지급과 비밀번호 재설정을 할 수 있어요.</p>

        {repositoryMode === 'mock' && (
          <div className="demo-hint">
            <strong>로컬 테스트 계정</strong>
            <p>아이디 `teacher` / 비밀번호 `1234`</p>
          </div>
        )}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            아이디
            <input value={form.loginId} onChange={(event) => setForm({ ...form, loginId: event.target.value })} />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>
          <button type="submit" className="button button--primary button--full" disabled={loading}>
            {loading ? '확인 중...' : '관리 화면 들어가기'}
          </button>
        </form>

        <Link className="text-link" to="/login">
          학생 로그인 화면으로 돌아가기
        </Link>
      </section>
    </div>
  );
}
