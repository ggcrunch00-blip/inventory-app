import { Navigate } from 'react-router-dom';
import useAppContext from '../../hooks/useAppContext';

export default function ProtectedRoute({ role, children }) {
  const { initialized, currentStudent, currentAdmin } = useAppContext();

  if (!initialized) {
    return <div className="screen-state">앱 정보를 불러오는 중입니다...</div>;
  }

  if (role === 'student' && !currentStudent) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'admin' && !currentAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

