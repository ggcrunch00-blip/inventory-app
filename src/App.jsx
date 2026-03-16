import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';
import StudentLoginPage from './pages/student/StudentLoginPage';
import CharacterSelectionPage from './pages/student/CharacterSelectionPage';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import RewardPage from './pages/student/RewardPage';
import StudentHistoryPage from './pages/student/StudentHistoryPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import StudentManagementPage from './pages/admin/StudentManagementPage';
import ItemManagementPage from './pages/admin/ItemManagementPage';
import SessionManagementPage from './pages/admin/SessionManagementPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<StudentLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="characters" element={<CharacterSelectionPage />} />
            <Route path="dashboard" element={<StudentDashboardPage />} />
            <Route path="reward" element={<RewardPage />} />
            <Route path="history" element={<StudentHistoryPage />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="students" element={<StudentManagementPage />} />
            <Route path="items" element={<ItemManagementPage />} />
            <Route path="sessions" element={<SessionManagementPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
