import request from 'supertest';
import app from '../server';
import database from '../database';

beforeAll(async () => {
  await database.initialize();
});

afterAll(async () => {
  await database.close();
});

describe('GET /health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/v1/users/register', () => {
  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/v1/users/register').send({});
    expect(res.status).toBe(400);
  });

  it('creates a new user and returns a token', async () => {
    const res = await request(app).post('/api/v1/users/register').send({
      email: 'register-test@example.com',
      name: 'Register Test',
      password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe('register-test@example.com');
  });

  it('returns 409 when email is already taken', async () => {
    const res = await request(app).post('/api/v1/users/register').send({
      email: 'register-test@example.com',
      name: 'Duplicate User',
      password: 'password123',
    });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/v1/users/login', () => {
  const credentials = { email: 'login-test@example.com', password: 'mypassword' };

  beforeAll(async () => {
    await request(app).post('/api/v1/users/register').send({
      ...credentials,
      name: 'Login Test',
    });
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(app).post('/api/v1/users/login').send({});
    expect(res.status).toBe(400);
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ email: credentials.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('logs in successfully with correct credentials', async () => {
    const res = await request(app).post('/api/v1/users/login').send(credentials);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe(credentials.email);
  });
});

describe('GET /api/v1/users/me', () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/v1/users/register').send({
      email: 'me-test@example.com',
      name: 'Me Test',
      password: 'password123',
    });
    token = res.body.token as string;
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(401);
  });

  it('returns the current user profile with a valid token', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('me-test@example.com');
  });
});
