import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="auth-screen">
      <section className="auth-card">
        <p className="auth-card__eyebrow">404</p>
        <h1>페이지를 찾을 수 없습니다</h1>
        <p className="auth-card__description">주소가 잘못되었거나 아직 준비되지 않은 화면입니다.</p>
        <Link to="/login" className="button button--primary">
          학생 로그인으로 이동
        </Link>
      </section>
    </div>
  );
}
