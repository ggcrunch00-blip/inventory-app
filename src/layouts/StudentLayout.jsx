import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { APP_TITLE, STUDENT_NAV_ITEMS, SYNC_STATUS_LABELS } from '../utils/constants';
import useAppContext from '../hooks/useAppContext';
import { formatStudentLabel } from '../utils/format';
import StatusBanner from '../components/common/StatusBanner';

export default function StudentLayout() {
  const { currentStudent, activeSession, error, isOnline, syncStatus, actions } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="shell shell--student">
      <header className="topbar">
        <div className="brand-block">
          <span className="brand-mark">국토</span>
          <div>
            <strong>{APP_TITLE}</strong>
            <p>학생용 화면</p>
          </div>
        </div>
        <div className="topbar__meta">
          <p>{activeSession ? `현재 차시: ${activeSession.title}` : '현재 차시 없음'}</p>
          <p>{formatStudentLabel(currentStudent)}</p>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => {
              actions.logoutStudent();
              navigate('/login');
            }}
          >
            로그아웃
          </button>
        </div>
      </header>

      <nav className="nav-tabs">
        {STUDENT_NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-tabs__item ${isActive ? 'is-active' : ''}`}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {!isOnline && <StatusBanner tone="warning">인터넷이 불안정해도 지금 행동은 저장을 시도하고, 연결되면 자동 동기화합니다.</StatusBanner>}
      {syncStatus !== 'idle' && <StatusBanner tone={syncStatus === 'error' ? 'danger' : 'info'}>저장 상태: {SYNC_STATUS_LABELS[syncStatus]}</StatusBanner>}
      {error && <StatusBanner tone="danger">{error}</StatusBanner>}

      <main className="page-body">
        <Outlet />
      </main>
    </div>
  );
}
