import { Pool, PoolClient, PoolConfig, QueryResult } from 'pg';
import bcryptjs from 'bcryptjs';

// ---------------------------------------------------------------------------
// Placeholder conversion: SQLite uses ?, PostgreSQL uses $1, $2, ...
// This lets all route files stay unchanged.
// ---------------------------------------------------------------------------
function convertPlaceholders(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

// ---------------------------------------------------------------------------
// Pool factory — split by environment so tests never need a real database
// ---------------------------------------------------------------------------
function createPool(): Pool {
  if (process.env.NODE_ENV === 'test') {
    // pg-mem: in-memory PostgreSQL-compatible engine for tests (devDependency only)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { newDb } = require('pg-mem') as typeof import('pg-mem');
    const memDb = newDb();
    const { Pool: MemPool } = memDb.adapters.createPg();
    return new MemPool() as unknown as Pool;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required.');
  }

  const config: PoolConfig = {
    connectionString,
    // Cloud Run connects via a Unix socket (/cloudsql/...) — no SSL needed there.
    // For local dev (no SSL configured on Homebrew PG), disable SSL entirely.
    ssl: connectionString.includes('/cloudsql/')
      ? false
      : process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  };

  return new Pool(config);
}

// ---------------------------------------------------------------------------
// Shared result type — mirrors the old sqlite3 RunResult shape.
// id is always 0 because all IDs are pre-generated UUIDs (never read by routes).
// changes maps to pg's rowCount.
// ---------------------------------------------------------------------------
interface DbRunResult {
  id: number;
  changes: number;
}

let pool: Pool;

// ---------------------------------------------------------------------------
// Database object — identical public interface as before
// ---------------------------------------------------------------------------
const database = {
  initialize: async (): Promise<void> => {
    pool = createPool();

    const client: PoolClient = await pool.connect();
    try {
      await client.query('BEGIN');

      // Note: camelCase column names are double-quoted so PostgreSQL preserves
      // their casing, keeping route code working without any changes.
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id          TEXT PRIMARY KEY,
          email       TEXT UNIQUE NOT NULL,
          password    TEXT NOT NULL,
          name        TEXT NOT NULL,
          role        TEXT DEFAULT 'member',
          "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS events (
          id           TEXT PRIMARY KEY,
          title        TEXT NOT NULL,
          description  TEXT,
          date         TIMESTAMPTZ NOT NULL,
          location     TEXT,
          "createdBy"  TEXT NOT NULL,
          "createdAt"  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("createdBy") REFERENCES users(id)
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS event_members (
          id          TEXT PRIMARY KEY,
          "eventId"   TEXT NOT NULL,
          "userId"    TEXT NOT NULL,
          status      TEXT DEFAULT 'pending',
          attendance  TEXT DEFAULT 'absent',
          "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          UNIQUE("eventId", "userId"),
          FOREIGN KEY ("eventId") REFERENCES events(id),
          FOREIGN KEY ("userId")  REFERENCES users(id)
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS members (
          id          TEXT PRIMARY KEY,
          name        TEXT NOT NULL,
          email       TEXT,
          phone       TEXT,
          role        TEXT DEFAULT 'member',
          "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id          TEXT PRIMARY KEY,
          "userId"    TEXT NOT NULL,
          subject     TEXT NOT NULL,
          content     TEXT NOT NULL,
          "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("userId") REFERENCES users(id)
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id           TEXT PRIMARY KEY,
          "userId"     TEXT NOT NULL,
          type         TEXT NOT NULL,
          title        TEXT NOT NULL,
          body         TEXT,
          read         BOOLEAN DEFAULT FALSE,
          "relatedId"  TEXT,
          "createdAt"  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("userId") REFERENCES users(id)
        )
      `);

      // Seed test user — only in non-production environments
      if (process.env.NODE_ENV !== 'production') {
        const seedEmail = process.env.SEED_USER_EMAIL;
        const seedPassword = process.env.SEED_USER_PASSWORD;
        if (seedEmail && seedPassword) {
          const hashedPassword = bcryptjs.hashSync(seedPassword, 10);
          await client.query(
            `INSERT INTO users (id, email, password, name, role)
             VALUES ($1, $2, $3, 'Test User', 'member')
             ON CONFLICT (id) DO NOTHING`,
            ['test-user-1', seedEmail, hashedPassword],
          );
          console.log('✓ Test user seeded');
        }
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  run: async (sql: string, params: unknown[] = []): Promise<DbRunResult> => {
    const result: QueryResult = await pool.query(convertPlaceholders(sql), params);
    return { id: 0, changes: result.rowCount ?? 0 };
  },

  get: async (
    sql: string,
    params: unknown[] = [],
  ): Promise<Record<string, unknown> | undefined> => {
    const result: QueryResult = await pool.query(convertPlaceholders(sql), params);
    return result.rows[0] as Record<string, unknown> | undefined;
  },

  all: async (sql: string, params: unknown[] = []): Promise<Record<string, unknown>[]> => {
    const result: QueryResult = await pool.query(convertPlaceholders(sql), params);
    return result.rows as Record<string, unknown>[];
  },

  close: async (): Promise<void> => {
    if (pool) {
      await pool.end();
    }
  },
};

export default database;
