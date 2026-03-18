import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';

interface Member {
  id: string;
  name: string;
}

interface Stats {
  totalEvents: number;
  attendedEvents: number;
}

export default function AttendanceView() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<Record<string, Stats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/api/v1/members')
      .then(async (data: Member[]) => {
        setMembers(data);
        const entries = await Promise.all(
          data.map(async (m) => {
            try {
              const s = await apiFetch(`/api/v1/members/${m.id}/stats`);
              return [m.id, { totalEvents: s.totalEvents ?? 0, attendedEvents: s.attendedEvents ?? 0 }] as const;
            } catch {
              return [m.id, { totalEvents: 0, attendedEvents: 0 }] as const;
            }
          }),
        );
        setStats(Object.fromEntries(entries));
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      <h2>✅ Attendance Tracking</h2>
      <div className="form-container">
        <p className="attendance-description">Track member attendance and generate reports</p>

        {error && <div className="message error">{error}</div>}

        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : members.length === 0 ? (
          <div className="empty-state">Add members first to track attendance</div>
        ) : (
          members.map((m) => {
            const s = stats[m.id] ?? { totalEvents: 0, attendedEvents: 0 };
            return (
              <div key={m.id} className="item">
                <h4>{m.name}</h4>
                <p>📊 Attended: {s.attendedEvents} / {s.totalEvents} events</p>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
