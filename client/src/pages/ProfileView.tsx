import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';

export default function ProfileView() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    const f = e.currentTarget;
    const name = (f.elements.namedItem('name') as HTMLInputElement).value;
    const password = (f.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const updated = await apiFetch(`/api/v1/users/${user!.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name,
          ...(password ? { password } : {}),
        }),
      });
      // Sync updated name into auth context + localStorage
      login({ ...user!, name: updated.name ?? name });
      setSuccess('Profile saved successfully.');
      (f.elements.namedItem('password') as HTMLInputElement).value = '';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      <h2>👤 Profile Settings</h2>
      <div className="form-container">
        {success && <div className="message success" style={{ marginBottom: 16, color: '#059669', background: '#ecfdf5', padding: '10px 14px', borderRadius: 8 }}>{success}</div>}
        {error   && <div className="message error"   style={{ marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" defaultValue={user?.name} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" defaultValue={user?.email} disabled />
          </div>
          <div className="form-group">
            <label>New Password <span style={{ fontWeight: 400, color: '#9ca3af' }}>(leave blank to keep current)</span></label>
            <input type="password" name="password" placeholder="Enter new password" />
          </div>
          <button type="submit" className="submit-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </>
  );
}
