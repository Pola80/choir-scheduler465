const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let rehearsals = [];

app.get('/', (req, res) => res.json({ message: 'Choir Scheduler API', version: '1.0.0' }));

app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/rehearsals', (req, res) => {
  res.json(rehearsals);
});

app.get('/rehearsals/:id', (req, res) => {
  const r = rehearsals.find(x => String(x.id) === String(req.params.id));
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json(r);
});

app.post('/rehearsals', (req, res) => {
  const item = req.body;
  rehearsals.push(item);
  res.status(201).json(item);
});

app.delete('/rehearsals/:id', (req, res) => {
  rehearsals = rehearsals.filter(x => String(x.id) !== String(req.params.id));
  res.status(204).end();
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`choir-scheduler backend listening on ${port}`));
