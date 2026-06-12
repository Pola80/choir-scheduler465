import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const actions = [
  { view: 'events',     icon: '📅', bg: '#ede9fe', title: 'Events',     desc: 'Schedule rehearsals and performances' },
  { view: 'members',    icon: '👥', bg: '#dbeafe', title: 'Members',    desc: 'Manage choir member profiles' },
  { view: 'attendance', icon: '✅', bg: '#dcfce7', title: 'Attendance', desc: 'Track who showed up' },
  { view: 'messages',   icon: '💬', bg: '#fef3c7', title: 'Messages',   desc: 'Send announcements to all' },
  { view: 'profile',    icon: '👤', bg: '#fce7f3', title: 'Profile',    desc: 'Update your account info' },
  { view: 'settings',   icon: '⚙️', bg: '#f1f5f9', title: 'Settings',   desc: 'Customize choir preferences' },
];

const stats = [
  { icon: '👥', bg: '#ede9fe', label: 'Members',    value: '—' },
  { icon: '📅', bg: '#dbeafe', label: 'Events',     value: '—' },
  { icon: '✅', bg: '#dcfce7', label: 'Attendance', value: '—%' },
  { icon: '💬', bg: '#fef3c7', label: 'Messages',   value: '—' },
];

export default function HomeView() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <div className="page-hdr">
        <div className="page-hdr-left">
          <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Here's what's happening with your choir today.</p>
        </div>
      </div>

      <div className="home-stats">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-card-lbl">{s.label}</div>
            <div className="stat-card-val">{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--dark)', marginBottom: 14 }}>Quick Access</h2>
        <div className="home-actions">
          {actions.map((a) => (
            <div key={a.view} className="action-card" onClick={() => navigate(`/dashboard/${a.view}`)}>
              <div className="action-card-icon" style={{ background: a.bg }}>{a.icon}</div>
              <div className="action-card-body">
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
              </div>
              <div className="action-card-arr">›</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
