import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  subject: string;
  content: string;
  createdAt: string;
  userId: string;
  senderName: string;
}

export default function MessagesView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  async function loadMessages() {
    try {
      const data = await apiFetch('/api/v1/messages');
      setMessages(data);
    } catch {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 30_000);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPosting(true);
    setError('');
    const form = e.currentTarget;
    const subject = (form.elements.namedItem('subject') as HTMLInputElement).value;
    const content = (form.elements.namedItem('content') as HTMLTextAreaElement).value;
    try {
      const msg = await apiFetch('/api/v1/messages', {
        method: 'POST',
        body: JSON.stringify({ subject, content }),
      });
      setMessages((prev) => [msg, ...prev]);
      setShowForm(false);
      formRef.current?.reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to post announcement');
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this announcement?')) return;
    try {
      await apiFetch(`/api/v1/messages/${id}`, { method: 'DELETE' });
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch {
      setError('Failed to delete');
    }
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <>
      <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>

      <div className="page-hdr">
        <div className="page-hdr-left">
          <h2>Group Announcements</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Messages posted here are visible to everyone and trigger email reminders.</p>
        </div>
        <button className="submit-btn" style={{ alignSelf: 'flex-start' }} onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New Announcement'}
        </button>
      </div>

      {error && <div style={{ color: '#ef4444', marginBottom: 12 }}>{error}</div>}

      {showForm && (
        <div className="form-container" style={{ marginBottom: 24 }}>
          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Subject</label>
              <input name="subject" type="text" placeholder="Announcement subject" required />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea name="content" placeholder="Write your announcement…" rows={5} required />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="submit-btn" disabled={posting}>
                {posting ? 'Posting…' : 'Post Announcement'}
              </button>
              <button type="button" className="back-btn" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : messages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
          <p>No announcements yet. Post the first one!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((m) => (
            <div key={m.id} className="form-container" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{m.subject}</span>
                  <span style={{ color: 'var(--muted)', fontSize: 13, marginLeft: 10 }}>
                    by {m.senderName} · {formatDate(m.createdAt)}
                  </span>
                </div>
                {(m.userId === user?.id || user?.role === 'admin' || user?.role === 'director') && (
                  <button
                    onClick={() => handleDelete(m.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 4px' }}
                    title="Delete"
                  >×</button>
                )}
              </div>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{m.content}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
