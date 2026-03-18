import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const cards = [
  { view: 'events',     icon: '📅', title: 'Events',     desc: 'Schedule and manage choir rehearsals and performances' },
  { view: 'members',    icon: '👥', title: 'Members',    desc: 'Keep track of all choir members and their details' },
  { view: 'attendance', icon: '✅', title: 'Attendance', desc: 'Track member attendance at events' },
  { view: 'messages',   icon: '💬', title: 'Messages',   desc: 'Send announcements to choir members' },
  { view: 'profile',    icon: '⚙️', title: 'Profile',    desc: 'Update your account information' },
  { view: 'settings',   icon: '🔧', title: 'Settings',   desc: 'Customize your choir preferences' },
];

export default function HomeView() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <div className="welcome-card">
        <h2>Welcome back, {user?.name}!</h2>
        <p>📧 {user?.email}</p>
      </div>
      <div className="grid">
        {cards.map((c) => (
          <div key={c.view} className="card" onClick={() => navigate(`/dashboard/${c.view}`)}>
            <h3>{c.icon} {c.title}</h3>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
}
