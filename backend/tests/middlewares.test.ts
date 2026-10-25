import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';
import { resetLockoutStore } from '../src/services/login-lockout.service.js';
import type { JwtPayload } from '../src/types/auth.js';

const app = createApp();

function tokenFor(payload: JwtPayload, options?: jwt.SignOptions): string {
  return jwt.sign(payload, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: '1h',
    ...options,
  });
}

async function loginAs(email: string, password: string): Promise<string> {
  const res = await request(app).post('/login').send({ email, password });
  return res.body.token as string;
}

describe('authenticate + authorizeScore middlewares', () => {
  beforeEach(() => {
    resetLockoutStore();
  });

  it('AUTH-01: valid bearer continues', async () => {
    const token = await loginAs('admin@demo.com', 'admin123');
    const res = await request(app)
      .get('/score/12.345.678-9')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('AUTH-02: missing Authorization → 401', async () => {
    const res = await request(app).get('/score/12.345.678-9');
    expect(res.status).toBe(401);
  });

  it('AUTH-03: malformed header → 401', async () => {
    const res = await request(app)
      .get('/score/12.345.678-9')
      .set('Authorization', 'Bearer');
    expect(res.status).toBe(401);
  });

  it('AUTH-04: wrong secret → 401', async () => {
    const bad = jwt.sign({ sub: '1', role: 'admin' }, 'other-secret', {
      algorithm: 'HS256',
      expiresIn: '1h',
    });
    const res = await request(app)
      .get('/score/12.345.678-9')
      .set('Authorization', `Bearer ${bad}`);
    expect(res.status).toBe(401);
  });

  it('AUTH-05: expired token → 401', async () => {
    const expired = jwt.sign(
      { sub: '1', role: 'admin', exp: Math.floor(Date.now() / 1000) - 60 },
      env.jwtSecret,
      { algorithm: 'HS256' },
    );
    const res = await request(app)
      .get('/score/12.345.678-9')
      .set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });

  it('AUTH-06: tampered payload → 401', async () => {
    const token = await loginAs('user@demo.com', 'user123');
    const [h, p, s] = token.split('.');
    const body = JSON.parse(Buffer.from(p, 'base64url').toString()) as {
      role: string;
    };
    body.role = 'admin';
    const tampered = `${h}.${Buffer.from(JSON.stringify(body)).toString('base64url')}.${s}`;
    const res = await request(app)
      .get('/score/99.999.999-9')
      .set('Authorization', `Bearer ${tampered}`);
    expect(res.status).toBe(401);
  });

  it('AUTH-07: garbage token → 401', async () => {
    const res = await request(app)
      .get('/score/12.345.678-9')
      .set('Authorization', 'Bearer not.a.jwt');
    expect(res.status).toBe(401);
  });

  it('AUTHZ-01: admin can query any RUT', async () => {
    const token = await loginAs('admin@demo.com', 'admin123');
    const res = await request(app)
      .get('/score/11.111.111-1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('AUTHZ-02: user can query own RUT', async () => {
    const token = await loginAs('user@demo.com', 'user123');
    const res = await request(app)
      .get('/score/12.345.678-9')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('AUTHZ-03: user own RUT different format', async () => {
    const token = await loginAs('user@demo.com', 'user123');
    const res = await request(app)
      .get('/score/123456789')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('AUTHZ-04: user other RUT → 403', async () => {
    const token = await loginAs('user@demo.com', 'user123');
    const res = await request(app)
      .get('/score/11.111.111-1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('AUTHZ-05: user token without rut → 403', async () => {
    const token = tokenFor({ sub: '2', role: 'user' });
    const res = await request(app)
      .get('/score/12.345.678-9')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('AUTHZ-06: unknown role → 401 or 403', async () => {
    const token = jwt.sign({ sub: '9', role: 'super' }, env.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: '1h',
    });
    const res = await request(app)
      .get('/score/12.345.678-9')
      .set('Authorization', `Bearer ${token}`);
    expect([401, 403]).toContain(res.status);
  });
});
