import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
}

export default function EventsView() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; description: string; date: string; time: string; location: string }>({ title: '', description: '', date: '', time: '', location: '' });

  useEffect(() => {
    apiFetch('/api/v1/events')
      .then(setEvents)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const get = (n: string) => (f.elements.namedItem(n) as HTMLInputElement).value;
    const date = get('date');
    const time = get('time');
    try {
      const created = await apiFetch('/api/v1/events', {
        method: 'POST',
        body: JSON.stringify({
          title: get('title'),
          description: get('description') || undefined,
          date: time ? `${date}T${time}` : date,
          location: get('location') || undefined,
        }),
      });
      setEvents((prev) => [created, ...prev]);
      f.reset();
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    }
  }

  function startEdit(evt: Event) {
    const [datePart, timePart] = evt.date.includes('T') ? evt.date.split('T') : [evt.date, ''];
    setEditForm({
      title: evt.title,
      description: evt.description ?? '',
      date: datePart,
      time: timePart ? timePart.slice(0, 5) : '',
      location: evt.location ?? '',
    });
    setEditingId(evt.id);
  }

  async function handleSaveEdit(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const get = (n: string) => (f.elements.namedItem(n) as HTMLInputElement).value;
    const date = get('date');
    const time = get('time');
    try {
      const updated = await apiFetch(`/api/v1/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: get('title'),
          description: get('description') || undefined,
          date: time ? `${date}T${time}` : date,
          location: get('location') || undefined,
        }),
      });
      setEvents((prev) => prev.map((ev) => ev.id === id ? updated : ev));
      setEditingId(null);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this event?')) return;
    try {
      await apiFetch(`/api/v1/events/${id}`, { method: 'DELETE' });
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  }

  function formatDate(dateStr: string) {
    const [datePart, timePart] = dateStr.includes('T') ? dateStr.split('T') : [dateStr, ''];
    return timePart ? `${datePart} at ${timePart.slice(0, 5)}` : datePart;
  }

  return (
    <>
      <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      <h2>📅 Events Management</h2>

      {error && <div className="message error">{error}</div>}

      <div className="form-container">
        <h3>Schedule New Event</h3>
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Event Name</label>
            <input type="text" name="title" placeholder="e.g., Sunday Rehearsal" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input type="text" name="description" placeholder="Optional description" />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" required />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input type="time" name="time" />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" name="location" placeholder="e.g., Church Hall" />
          </div>
          <button type="submit" className="submit-btn">Schedule Event</button>
        </form>
      </div>

      {loading ? (
        <div className="empty-state">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="empty-state">No events scheduled yet</div>
      ) : (
        events.map((evt) => (
          <div key={evt.id} className="item">
            {editingId === evt.id ? (
              <form onSubmit={(e) => handleSaveEdit(evt.id, e)}>
                <div className="form-group">
                  <label>Event Name</label>
                  <input type="text" name="title" defaultValue={editForm.title} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input type="text" name="description" defaultValue={editForm.description} />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" name="date" defaultValue={editForm.date} required />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input type="time" name="time" defaultValue={editForm.time} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" name="location" defaultValue={editForm.location} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button type="submit" className="submit-btn" style={{ padding: '8px 18px' }}>Save</button>
                  <button type="button" className="back-btn" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <h4>{evt.title}</h4>
                {evt.description && <p>📝 {evt.description}</p>}
                <p>📅 {formatDate(evt.date)}</p>
                {evt.location && <p>📍 {evt.location}</p>}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button className="submit-btn" style={{ padding: '6px 16px', fontSize: 13 }} onClick={() => startEdit(evt)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(evt.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </>
  );
}
