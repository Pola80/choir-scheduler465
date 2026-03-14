import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Member {
  id: number;
  name: string;
  email: string;
  voice: string;
  phone: string;
}

function load(): Member[] {
  try { return JSON.parse(localStorage.getItem('members') || '[]'); } catch { return []; }
}

export default function MembersView() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>(load);

  useEffect(() => {
    localStorage.setItem('members', JSON.stringify(members));
  }, [members]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const get = (n: string) => (f.elements.namedItem(n) as HTMLInputElement).value;
    setMembers((prev) => [
      ...prev,
      { id: Date.now(), name: get('name'), email: get('email'), voice: get('voice'), phone: get('phone') },
    ]);
    f.reset();
  }

  return (
    <>
      <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      <h2>👥 Member Management</h2>

      <div className="form-container">
        <h3>Add New Member</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" placeholder="Member's full name" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="member@email.com" required />
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

      {members.length === 0 ? (
        <div className="empty-state">No members added yet</div>
      ) : (
        members.map((m) => (
          <div key={m.id} className="item">
            <h4>{m.name}</h4>
            <p>📧 {m.email}</p>
            <p>🎤 {m.voice || 'Not specified'}</p>
            <p>📱 {m.phone || 'Not provided'}</p>
            <button
              className="delete-btn"
              onClick={() => setMembers((prev) => prev.filter((x) => x.id !== m.id))}
            >
              Remove
            </button>
          </div>
        ))
      )}
    </>
  );
}
