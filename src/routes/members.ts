import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import database from '../database';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Get all members (public)
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const members = await database.all('SELECT * FROM members ORDER BY name ASC');
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Get member by ID (public)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const member = await database.get('SELECT * FROM members WHERE id = ?', [req.params.id]);
    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// Create member (authenticated)
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, role } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      role?: string;
    };

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const memberId = uuidv4();
    await database.run(
      'INSERT INTO members (id, name, email, phone, role) VALUES (?, ?, ?, ?, ?)',
      [memberId, name, email || null, phone || null, role || 'member'],
    );

    const member = await database.get('SELECT * FROM members WHERE id = ?', [memberId]);
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// Update member (authenticated)
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, role } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      role?: string;
    };

    const member = await database.get('SELECT * FROM members WHERE id = ?', [req.params.id]);

    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    await database.run(
      'UPDATE members SET name = ?, email = ?, phone = ?, role = ? WHERE id = ?',
      [
        name || member.name,
        email || member.email,
        phone || member.phone,
        role || member.role,
        req.params.id,
      ],
    );

    const updated = await database.get('SELECT * FROM members WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// Delete member (admin only — authMiddleware required before adminMiddleware)
router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const member = await database.get('SELECT * FROM members WHERE id = ?', [req.params.id]);
      if (!member) {
        res.status(404).json({ error: 'Member not found' });
        return;
      }

      await database.run('DELETE FROM members WHERE id = ?', [req.params.id]);
      res.json({ message: 'Member deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete member' });
    }
  },
);

// Member stats (public)
router.get('/:id/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await database.get(
      `SELECT COUNT(*) as totalEvents,
              SUM(CASE WHEN attendance = 'present' THEN 1 ELSE 0 END) as attendedEvents
       FROM event_members WHERE userId = ?`,
      [req.params.id],
    );
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
