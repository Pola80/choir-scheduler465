import { useNavigate } from 'react-router-dom';

interface Member { id: number; name: string; }

function loadMembers(): Member[] {
  try { return JSON.parse(localStorage.getItem('members') || '[]'); } catch { return []; }
}

export default function AttendanceView() {
  const navigate = useNavigate();
  const members = loadMembers();

  return (
    <>
      <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      <h2>✅ Attendance Tracking</h2>
      <div className="form-container">
        <p className="attendance-description">Track member attendance and generate reports</p>
        {members.length === 0 ? (
          <div className="empty-state">Add members first to track attendance</div>
        ) : (
          members.map((m) => (
            <div key={m.id} className="item">
              <h4>{m.name}</h4>
              <p>📊 Total attended: 0 / 0 events</p>
            </div>
          ))
        )}
      </div>
    </>
  );
}
