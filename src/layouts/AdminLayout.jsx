import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ADMIN_NAV_ITEMS, APP_TITLE, SYNC_STATUS_LABELS } from '../utils/constants';
import useAppContext from '../hooks/useAppContext';
import StatusBanner from '../components/common/StatusBanner';

export default function AdminLayout() {
  const { currentAdmin, error, isOnline, syncStatus, actions, repositoryMode } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="shell shell--admin">
      <header className="topbar topbar--admin">
        <div className="brand-block">
          <span className="brand-mark brand-mark--admin">관리</span>
          <div>
            <strong>{APP_TITLE}</strong>
            <p>선생님 관리 화면</p>
          </div>
        </div>
        <div className="topbar__meta">
          <p>
            {currentAdmin?.name} · {repositoryMode === 'firebase' ? 'Firebase 모드' : '로컬 목업 모드'}
          </p>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => {
              actions.logoutAdmin();
              navigate('/admin/login');
            }}
          >
            로그아웃
          </button>
        </div>
      </header>

      <nav className="nav-tabs nav-tabs--admin">
        {ADMIN_NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-tabs__item ${isActive ? 'is-active' : ''}`}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {!isOnline && <StatusBanner tone="warning">오프라인 상태입니다. 브라우저에 저장된 캐시를 기준으로 동작하며 연결되면 자동 동기화됩니다.</StatusBanner>}
      {syncStatus !== 'idle' && <StatusBanner tone={syncStatus === 'error' ? 'danger' : 'info'}>저장 상태: {SYNC_STATUS_LABELS[syncStatus]}</StatusBanner>}
      {error && <StatusBanner tone="danger">{error}</StatusBanner>}

      <main className="page-body">
        <Outlet />
      </main>
    </div>
  );
}
