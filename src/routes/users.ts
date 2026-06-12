import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import database from '../database';
import { generateToken, authMiddleware } from '../middleware/auth';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, password } = req.body as {
      email?: string;
      name?: string;
      password?: string;
    };

    if (!email || !name || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const existingUser = await database.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = uuidv4();

    await database.run(
      'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, name, 'member'],
    );

    const token = generateToken(userId, email, 'member', name);

    res.status(201).json({ id: userId, email, name, role: 'member', token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const user = await database.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user || !bcrypt.compareSync(password, user.password as string)) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(
      user.id as string,
      user.email as string,
      user.role as string,
      user.name as string,
    );

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await database.get(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [req.user!.id],
    );
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, password } = req.body as { name?: string; password?: string };
    const userId = req.params.id;

    if (req.user!.id !== userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    // Fetch current values so we never overwrite with null
    const current = await database.get('SELECT name FROM users WHERE id = ?', [userId]);
    if (!current) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const newName = name || (current.name as string);

    if (password) {
      const hashed = bcrypt.hashSync(password, 10);
      await database.run('UPDATE users SET name = ?, password = ? WHERE id = ?', [newName, hashed, userId]);
    } else {
      await database.run('UPDATE users SET name = ? WHERE id = ?', [newName, userId]);
    }

    const updated = await database.get(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [userId],
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
