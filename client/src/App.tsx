import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './components/DashboardLayout';
import HomeView from './pages/HomeView';
import EventsView from './pages/EventsView';
import MembersView from './pages/MembersView';
import AttendanceView from './pages/AttendanceView';
import MessagesView from './pages/MessagesView';
import ProfileView from './pages/ProfileView';
import SettingsView from './pages/SettingsView';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomeView />} />
          <Route path="events" element={<EventsView />} />
          <Route path="members" element={<MembersView />} />
          <Route path="attendance" element={<AttendanceView />} />
          <Route path="messages" element={<MessagesView />} />
          <Route path="profile" element={<ProfileView />} />
          <Route path="settings" element={<SettingsView />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
