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

  useEffect(() => {
    apiFetch('/api/v1/events')
      .then(setEvents)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    }
  }

  async function handleDelete(id: string) {
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
        <form onSubmit={handleSubmit}>
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
            <h4>{evt.title}</h4>
            {evt.description && <p>📝 {evt.description}</p>}
            <p>📅 {formatDate(evt.date)}</p>
            {evt.location && <p>📍 {evt.location}</p>}
            <button className="delete-btn" onClick={() => handleDelete(evt.id)}>Delete</button>
          </div>
        ))
      )}
    </>
  );
}
