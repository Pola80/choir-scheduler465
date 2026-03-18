import request from 'supertest';
import app from '../server';
import database from '../database';

beforeAll(async () => {
  await database.initialize();
});

afterAll(async () => {
  await database.close();
});

async function registerUser(email: string, name: string, password: string): Promise<{ id: string; token: string }> {
  const res = await request(app).post('/api/v1/users/register').send({ email, name, password });
  return { id: res.body.id as string, token: res.body.token as string };
}

describe('Events API', () => {
  it('returns an empty list initially', async () => {
    const res = await request(app).get('/api/v1/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('requires auth to create an event', async () => {
    const res = await request(app).post('/api/v1/events').send({
      title: 'Unauthorized Event',
      date: '2026-04-01T18:00:00.000Z',
    });
    expect(res.status).toBe(401);
  });

  it('returns 400 when title/date are missing', async () => {
    const user = await registerUser('events-missing@example.com', 'Events Missing', 'password123');
    const res = await request(app)
      .post('/api/v1/events')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ description: 'No title/date' });

    expect(res.status).toBe(400);
  });

  it('creates and fetches an event', async () => {
    const user = await registerUser('events-create@example.com', 'Events Create', 'password123');

    const createRes = await request(app)
      .post('/api/v1/events')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        title: 'Choir Rehearsal',
        description: 'Weekly run-through',
        date: '2026-04-02T19:00:00.000Z',
        location: 'Main Hall',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.title).toBe('Choir Rehearsal');

    const getRes = await request(app).get(`/api/v1/events/${createRes.body.id as string}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.location).toBe('Main Hall');
  });

  it('returns 403 when non-owner updates an event', async () => {
    const owner = await registerUser('events-owner@example.com', 'Events Owner', 'password123');
    const otherUser = await registerUser('events-other@example.com', 'Events Other', 'password123');

    const createRes = await request(app)
      .post('/api/v1/events')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        title: 'Owner Event',
        date: '2026-04-03T19:00:00.000Z',
      });

    const eventId = createRes.body.id as string;

    const updateRes = await request(app)
      .put(`/api/v1/events/${eventId}`)
      .set('Authorization', `Bearer ${otherUser.token}`)
      .send({
        title: 'Hacked Title',
        description: 'Nope',
        date: '2026-04-03T20:00:00.000Z',
        location: 'Elsewhere',
      });

    expect(updateRes.status).toBe(403);
  });

  it("allows admin to delete someone else's event", async () => {
    const owner = await registerUser('events-owner-2@example.com', 'Events Owner 2', 'password123');
    const admin = await registerUser('events-admin@example.com', 'Events Admin', 'password123');

    await database.run('UPDATE users SET role = ? WHERE id = ?', ['admin', admin.id]);

    const adminLogin = await request(app).post('/api/v1/users/login').send({
      email: 'events-admin@example.com',
      password: 'password123',
    });

    const createRes = await request(app)
      .post('/api/v1/events')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        title: 'Delete Me',
        date: '2026-04-04T19:00:00.000Z',
      });

    const eventId = createRes.body.id as string;

    const deleteRes = await request(app)
      .delete(`/api/v1/events/${eventId}`)
      .set('Authorization', `Bearer ${adminLogin.body.token as string}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toBe('Event deleted');

    const fetchDeleted = await request(app).get(`/api/v1/events/${eventId}`);
    expect(fetchDeleted.status).toBe(404);
  });
});