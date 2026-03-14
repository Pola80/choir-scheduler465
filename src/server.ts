import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import database from './database';
import userRoutes from './routes/users';
import eventRoutes from './routes/events';
import memberRoutes from './routes/members';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security headers — no unsafe-inline: CSS and JS are served from external files
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        fontSrc: ["'self'", 'data:'],
      },
    },
  }),
);

// CORS — restrict to origins listed in CORS_ORIGINS env var (comma-separated)
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : [];
app.use(
  cors({
    origin:
      allowedOrigins.length > 0
        ? (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
            } else {
              callback(new Error('Not allowed by CORS'));
            }
          }
        : false,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Serve React build output
app.use(express.static(path.join(__dirname, '../client/dist')));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/members', memberRoutes);

// SPA fallback — let React Router handle client-side routes
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Error handler
app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const startServer = async (): Promise<void> => {
  try {
    await database.initialize();
    console.log('✓ Database initialized');

    app.listen(PORT, () => {
      console.log(`\n╔════════════════════════════════════════╗`);
      console.log(`║   Choir Scheduler API                  ║`);
      console.log(`║   Server is running                    ║`);
      console.log(`║   URL: http://localhost:${PORT}           ║`);
      console.log(`║   Environment: ${String(NODE_ENV).padEnd(24)}║`);
      console.log(`╚════════════════════════════════════════╝\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Only start the HTTP server when this file is run directly (not imported by tests)
if (require.main === module) {
  startServer();

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing database...');
    await database.close();
    process.exit(0);
  });
}

export default app;
