import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: number;
  name: string;
  date: string;
  time: string;
  location: string;
}

function load(): Event[] {
  try { return JSON.parse(localStorage.getItem('events') || '[]'); } catch { return []; }
}

export default function EventsView() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>(load);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const get = (n: string) => (f.elements.namedItem(n) as HTMLInputElement).value;
    setEvents((prev) => [
      ...prev,
      { id: Date.now(), name: get('name'), date: get('date'), time: get('time'), location: get('location') },
    ]);
    f.reset();
  }

  return (
    <>
      <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      <h2>📅 Events Management</h2>

      <div className="form-container">
        <h3>Schedule New Event</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Name</label>
            <input type="text" name="name" placeholder="e.g., Sunday Rehearsal" required />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" required />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input type="time" name="time" required />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" name="location" placeholder="e.g., Church Hall" required />
          </div>
          <button type="submit" className="submit-btn">Schedule Event</button>
        </form>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">No events scheduled yet</div>
      ) : (
        events.map((evt) => (
          <div key={evt.id} className="item">
            <h4>{evt.name}</h4>
            <p>📅 {evt.date} at {evt.time}</p>
            <p>📍 {evt.location}</p>
            <button
              className="delete-btn"
              onClick={() => setEvents((prev) => prev.filter((e) => e.id !== evt.id))}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </>
  );
}
