import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import database from '../database';
import { authMiddleware } from '../middleware/auth';
import { createNotificationsForAllUsers } from './notifications';
import { sendEmailToAllUsers } from '../email';

const router = Router();

// Get all messages (with sender name)
router.get('/', authMiddleware, async (_req: Request, res: Response): Promise<void> => {
  try {
    const messages = await database.all(`
      SELECT m.id, m.subject, m.content, m."createdAt", m."userId",
             u.name AS "senderName"
      FROM messages m
      JOIN users u ON u.id = m."userId"
      ORDER BY m."createdAt" DESC
    `);
    res.json(messages);
  } catch {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Post a new announcement
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, content } = req.body as { subject?: string; content?: string };

    if (!subject || !content) {
      res.status(400).json({ error: 'Subject and content are required' });
      return;
    }

    const messageId = uuidv4();
    await database.run(
      'INSERT INTO messages (id, "userId", subject, content) VALUES (?, ?, ?, ?)',
      [messageId, req.user!.id, subject, content],
    );

    const message = await database.all(`
      SELECT m.id, m.subject, m.content, m."createdAt", m."userId",
             u.name AS "senderName"
      FROM messages m
      JOIN users u ON u.id = m."userId"
      WHERE m.id = ?
    `, [messageId]);

    // Notify all users and send emails (fire-and-forget)
    const notifTitle = `New announcement: ${subject}`;
    const notifBody = content.length > 120 ? content.slice(0, 120) + '…' : content;
    createNotificationsForAllUsers('message', notifTitle, notifBody, messageId).catch(console.error);
    sendEmailToAllUsers(subject, content, req.user!.name).catch(console.error);

    res.status(201).json(message[0]);
  } catch {
    res.status(500).json({ error: 'Failed to post announcement' });
  }
});

// Delete a message (own or admin)
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const message = await database.get('SELECT "userId" FROM messages WHERE id = ?', [req.params.id]);
    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }
    if (message.userId !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }
    await database.run('DELETE FROM messages WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;
