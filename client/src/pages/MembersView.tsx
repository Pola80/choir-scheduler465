import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';

interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
}

export default function MembersView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/api/v1/members')
      .then(setMembers)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const get = (n: string) => (f.elements.namedItem(n) as HTMLInputElement).value;
    try {
      const created = await apiFetch('/api/v1/members', {
        method: 'POST',
        body: JSON.stringify({
          name: get('name'),
          email: get('email') || undefined,
          phone: get('phone') || undefined,
          role: get('voice') || undefined,
        }),
      });
      setMembers((prev) => [...prev, created]);
      f.reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/api/v1/members/${id}`, { method: 'DELETE' });
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete member');
    }
  }

  return (
    <>
      <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      <h2>👥 Member Management</h2>

      {error && <div className="message error">{error}</div>}

      <div className="form-container">
        <h3>Add New Member</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" placeholder="Member's full name" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="member@email.com" />
          </div>
          <div className="form-group">
            <label>Voice Part</label>
            <input type="text" name="voice" placeholder="Soprano, Alto, Tenor, Bass" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" name="phone" placeholder="Phone number" />
          </div>
          <button type="submit" className="submit-btn">Add Member</button>
        </form>
      </div>

      {loading ? (
        <div className="empty-state">Loading members...</div>
      ) : members.length === 0 ? (
        <div className="empty-state">No members added yet</div>
      ) : (
        members.map((m) => (
          <div key={m.id} className="item">
            <h4>{m.name}</h4>
            {m.email && <p>📧 {m.email}</p>}
            <p>🎤 {m.role || 'Not specified'}</p>
            {m.phone && <p>📱 {m.phone}</p>}
            {user?.role === 'admin' && (
              <button className="delete-btn" onClick={() => handleDelete(m.id)}>Remove</button>
            )}
          </div>
        ))
      )}
    </>
  );
}
