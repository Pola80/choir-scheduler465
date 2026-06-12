import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  relatedId: string;
  createdAt: string;
}

export default function NotificationsView() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await apiFetch('/api/v1/notifications');
      setNotifications(data.notifications);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function markAllRead() {
    await apiFetch('/api/v1/notifications/read-all', { method: 'PUT' });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function markRead(id: string) {
    await apiFetch(`/api/v1/notifications/${id}/read`, { method: 'PUT' });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  const typeIcon: Record<string, string> = { event: '📅', message: '💬' };
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <>
      <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>

      <div className="page-hdr">
        <div className="page-hdr-left">
          <h2>Notifications {unread > 0 && <span style={{ background: '#7c3aed', color: '#fff', borderRadius: 12, padding: '2px 10px', fontSize: 13, marginLeft: 8 }}>{unread}</span>}</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Event reminders and group announcements.</p>
        </div>
        {unread > 0 && (
          <button className="back-btn" style={{ alignSelf: 'flex-start' }} onClick={markAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
          <p>You're all caught up!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => { if (!n.read) markRead(n.id); }}
              style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                padding: '14px 18px', borderRadius: 10,
                background: n.read ? 'var(--white)' : '#f5f3ff',
                border: `1px solid ${n.read ? 'var(--border)' : '#ddd6fe'}`,
                cursor: n.read ? 'default' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              <div style={{ fontSize: 22, lineHeight: 1 }}>{typeIcon[n.type] ?? '🔔'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: n.read ? 500 : 700, fontSize: 14 }}>{n.title}</span>
                  <span style={{ color: 'var(--muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(n.createdAt)}</span>
                </div>
                {n.body && <p style={{ margin: '3px 0 0', color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>{n.body}</p>}
              </div>
              {!n.read && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', marginTop: 5, flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
