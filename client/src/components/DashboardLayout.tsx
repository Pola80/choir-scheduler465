import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <>
      <nav>
        <h1>Choir Scheduler</h1>
        <div className="nav-right">
          <div className="user-badge">&#128100; <span>{user?.name}</span></div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="container">
        <Outlet />
      </div>
    </>
  );
}
