import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import database from '../database';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get all events
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const events = await database.all('SELECT * FROM events ORDER BY date DESC');
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get event by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await database.get('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create event
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, date, location } = req.body as {
      title?: string;
      description?: string;
      date?: string;
      location?: string;
    };

    if (!title || !date) {
      res.status(400).json({ error: 'Title and date required' });
      return;
    }

    const eventId = uuidv4();
    await database.run(
      'INSERT INTO events (id, title, description, date, location, createdBy) VALUES (?, ?, ?, ?, ?, ?)',
      [eventId, title, description || null, date, location || null, req.user!.id],
    );

    const event = await database.get('SELECT * FROM events WHERE id = ?', [eventId]);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, date, location } = req.body as {
      title?: string;
      description?: string;
      date?: string;
      location?: string;
    };

    const event = await database.get('SELECT createdBy FROM events WHERE id = ?', [
      req.params.id,
    ]);

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (event.createdBy !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    await database.run(
      'UPDATE events SET title = ?, description = ?, date = ?, location = ? WHERE id = ?',
      [title || null, description || null, date || null, location || null, req.params.id],
    );

    const updated = await database.get('SELECT * FROM events WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await database.get('SELECT createdBy FROM events WHERE id = ?', [
      req.params.id,
    ]);

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (event.createdBy !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    await database.run('DELETE FROM event_members WHERE eventId = ?', [req.params.id]);
    await database.run('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
