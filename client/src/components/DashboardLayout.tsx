import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard',            icon: '⊞',  label: 'Overview' },
  { path: '/dashboard/events',     icon: '📅', label: 'Events' },
  { path: '/dashboard/members',    icon: '👥', label: 'Members' },
  { path: '/dashboard/attendance', icon: '✅', label: 'Attendance' },
  { path: '/dashboard/messages',   icon: '💬', label: 'Messages' },
];

const bottomItems = [
  { path: '/dashboard/profile',  icon: '👤', label: 'Profile' },
  { path: '/dashboard/settings', icon: '⚙️', label: 'Settings' },
];

const pageLabels: Record<string, string> = {
  '/dashboard':            'Overview',
  '/dashboard/events':     'Events',
  '/dashboard/members':    'Members',
  '/dashboard/attendance': 'Attendance',
  '/dashboard/messages':   'Messages',
  '/dashboard/profile':    'Profile',
  '/dashboard/settings':   'Settings',
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const pageTitle = pageLabels[location.pathname] ?? 'Dashboard';

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">♪</div>
          Choir Scheduler
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Menu</div>
          {navItems.map((item) => (
            <a
              key={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.label}
            </a>
          ))}

          <div className="sidebar-section-label" style={{ marginTop: 16 }}>Account</div>
          {bottomItems.map((item) => (
            <a
              key={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div>
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role ?? 'Member'}</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <span>⬅</span> Sign out
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-page-title">{pageTitle}</div>
          <div className="topbar-right">
            <div className="topbar-user-chip">
              <div className="topbar-user-chip-avatar">{initials}</div>
              {user?.name}
            </div>
          </div>
        </header>
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
