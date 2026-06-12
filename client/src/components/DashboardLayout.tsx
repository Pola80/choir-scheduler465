import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../api';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

const navItems = [
  { path: '/dashboard',                 icon: '⊞',  label: 'Overview' },
  { path: '/dashboard/events',          icon: '📅', label: 'Events' },
  { path: '/dashboard/members',         icon: '👥', label: 'Members' },
  { path: '/dashboard/attendance',      icon: '✅', label: 'Attendance' },
  { path: '/dashboard/messages',        icon: '💬', label: 'Messages' },
  { path: '/dashboard/notifications',   icon: '🔔', label: 'Notifications' },
];

const bottomItems = [
  { path: '/dashboard/profile',  icon: '👤', label: 'Profile' },
  { path: '/dashboard/settings', icon: '⚙️', label: 'Settings' },
];

const pageLabels: Record<string, string> = {
  '/dashboard':               'Overview',
  '/dashboard/events':        'Events',
  '/dashboard/members':       'Members',
  '/dashboard/attendance':    'Attendance',
  '/dashboard/messages':      'Messages',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/profile':       'Profile',
  '/dashboard/settings':      'Settings',
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function loadNotifications() {
    try {
      const data = await apiFetch('/api/v1/notifications');
      setNotifications(data.notifications);
    } catch {
      // silent — don't disrupt the layout if this fails
    }
  }

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function markRead(id: string) {
    await apiFetch(`/api/v1/notifications/${id}/read`, { method: 'PUT' });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  async function markAllRead() {
    await apiFetch('/api/v1/notifications/read-all', { method: 'PUT' });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  function formatDate(iso: string) {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
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
              style={{ position: 'relative' }}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.label}
              {item.path === '/dashboard/notifications' && unreadCount > 0 && (
                <span style={{
                  marginLeft: 'auto', background: '#7c3aed', color: '#fff',
                  borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700,
                }}>{unreadCount}</span>
              )}
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
          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Notification bell */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 20, position: 'relative', padding: '4px 8px',
                  borderRadius: 8, transition: 'background 0.15s',
                }}
                title="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 0, right: 0,
                    background: '#ef4444', color: '#fff',
                    borderRadius: '50%', width: 18, height: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, lineHeight: 1,
                  }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 340, maxHeight: 400, overflowY: 'auto',
                  background: '#fff', borderRadius: 12, border: '1px solid var(--border)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 1000,
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px', borderBottom: '1px solid var(--border)',
                  }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} style={{ fontSize: 12, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer' }}>
                          Mark all read
                        </button>
                      )}
                      <button onClick={() => { setDropdownOpen(false); navigate('/dashboard/notifications'); }} style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        See all
                      </button>
                    </div>
                  </div>

                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                      You're all caught up!
                    </div>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => { markRead(n.id); setDropdownOpen(false); navigate('/dashboard/notifications'); }}
                        style={{
                          display: 'flex', gap: 10, alignItems: 'flex-start',
                          padding: '10px 16px', cursor: 'pointer',
                          background: n.read ? 'transparent' : '#f5f3ff',
                          borderBottom: '1px solid var(--border)',
                          transition: 'background 0.15s',
                        }}
                      >
                        <span style={{ fontSize: 18, lineHeight: 1.4 }}>{n.type === 'event' ? '📅' : '💬'}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: n.read ? 400 : 600, fontSize: 13, lineHeight: 1.4 }}>{n.title}</div>
                          {n.body && <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body}</div>}
                          <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 2 }}>{formatDate(n.createdAt)}</div>
                        </div>
                        {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#7c3aed', marginTop: 5, flexShrink: 0 }} />}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

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
