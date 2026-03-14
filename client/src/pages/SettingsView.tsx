import { useNavigate } from 'react-router-dom';

export default function SettingsView() {
  const navigate = useNavigate();

  return (
    <>
      <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      <h2>🔧 Choir Settings</h2>
      <div className="form-container">
        <div className="form-group">
          <label>Choir Name</label>
          <input type="text" name="choir-name" placeholder="Your choir name" />
        </div>
        <div className="form-group">
          <label>Choir Description</label>
          <textarea name="choir-description" placeholder="Describe your choir" rows={4} />
        </div>
        <button className="submit-btn" onClick={() => alert('Settings saved successfully!')}>
          Save Settings
        </button>
      </div>
    </>
  );
}
