import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import database from '../database';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get current user's notifications (newest first)
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const notifications = await database.all(
      `SELECT * FROM notifications WHERE "userId" = ? ORDER BY "createdAt" DESC LIMIT 50`,
      [req.user!.id],
    );
    const unreadCount = notifications.filter((n) => !n.read).length;
    res.json({ notifications, unreadCount });
  } catch {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark a single notification as read
router.put('/read-all', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    await database.run(
      `UPDATE notifications SET read = TRUE WHERE "userId" = ?`,
      [req.user!.id],
    );
    res.json({ message: 'All notifications marked as read' });
  } catch {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

router.put('/:id/read', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    await database.run(
      `UPDATE notifications SET read = TRUE WHERE id = ? AND "userId" = ?`,
      [req.params.id, req.user!.id],
    );
    res.json({ message: 'Notification marked as read' });
  } catch {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// ---------------------------------------------------------------------------
// Internal helper — called by events.ts and messages.ts to fan out notifications
// ---------------------------------------------------------------------------
export async function createNotificationsForAllUsers(
  type: string,
  title: string,
  body: string,
  relatedId: string,
): Promise<void> {
  const users = await database.all('SELECT id FROM users');
  for (const user of users) {
    await database.run(
      `INSERT INTO notifications (id, "userId", type, title, body, "relatedId") VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), user.id as string, type, title, body, relatedId],
    );
  }
}

export default router;
