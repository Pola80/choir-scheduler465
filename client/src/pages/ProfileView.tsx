import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfileView() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = (e.currentTarget.elements.namedItem('name') as HTMLInputElement).value;
    if (user) login({ ...user, name });
    alert('Profile updated successfully!');
  }

  return (
    <>
      <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      <h2>⚙️ Profile Settings</h2>
      <div className="form-container">
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
            <label>New Password (leave blank to keep current)</label>
            <input type="password" name="password" placeholder="Enter new password" />
          </div>
          <button type="submit" className="submit-btn">Save Changes</button>
        </form>
      </div>
    </>
  );
}
