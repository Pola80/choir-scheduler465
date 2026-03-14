import { useNavigate } from 'react-router-dom';

export default function MessagesView() {
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let members: unknown[] = [];
    try { members = JSON.parse(localStorage.getItem('members') || '[]'); } catch { /* empty */ }
    alert(`Message sent to all ${members.length} members!`);
    e.currentTarget.reset();
  }

  return (
    <>
      <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      <h2>💬 Send Announcement</h2>
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Subject</label>
            <input type="text" name="subject" placeholder="Announcement subject" required />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea name="content" placeholder="Type your announcement..." rows={5} required />
          </div>
          <button type="submit" className="submit-btn">Send to All Members</button>
        </form>
      </div>
    </>
  );
}
