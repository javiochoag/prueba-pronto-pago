import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { resetLockoutStore } from '../src/services/login-lockout.service.js';

const app = createApp();

async function adminToken(): Promise<string> {
  const res = await request(app)
    .post('/login')
    .send({ email: 'admin@demo.com', password: 'admin123' });
  return res.body.token as string;
}

describe('GET /score/:rut', () => {
  beforeEach(() => {
    resetLockoutStore();
  });

  it('SCORE-01: invalid RUT with admin → 400', async () => {
    const token = await adminToken();
    const res = await request(app)
      .get('/score/not-a-rut')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_RUT');
  });

  it('SCORE-02: response shape { rut, score, fecha }', async () => {
    const token = await adminToken();
    const res = await request(app)
      .get('/score/12.345.678-9')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      rut: '12.345.678-9',
      score: expect.any(Number),
      fecha: expect.any(String),
    });
    expect(res.body.score).toBeGreaterThanOrEqual(0);
    expect(res.body.score).toBeLessThanOrEqual(100);
  });
});
