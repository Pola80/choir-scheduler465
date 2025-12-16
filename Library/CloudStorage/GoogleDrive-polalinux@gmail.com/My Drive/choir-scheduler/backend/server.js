const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'choiradmin',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || '/cloudsql/choir-scheduler-deploy:us-central1:choir-db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'choir_scheduler',
});

pool.on('error', (err) => console.error('Pool error:', err));

// Initialize database schema
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rehearsals (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date TIMESTAMP NOT NULL,
        duration INT,
        location VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database schema initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

initializeDatabase();

app.get('/', (req, res) => res.json({ message: 'Choir Scheduler API', version: '1.0.0' }));

app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/rehearsals', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rehearsals ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/rehearsals/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rehearsals WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/rehearsals', async (req, res) => {
  try {
    const { title, date, duration, location, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO rehearsals (title, date, duration, location, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, date, duration, location, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/rehearsals/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM rehearsals WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`choir-scheduler backend listening on ${port}`));
