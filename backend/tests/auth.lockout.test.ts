import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';
import {
  resetLockoutStore,
  setLockedUntilForTests,
} from '../src/services/login-lockout.service.js';

const app = createApp();

async function failLogin(email: string) {
  return request(app).post('/login').send({ email, password: 'wrong' });
}

describe('POST /login lockout', () => {
  beforeEach(() => {
    resetLockoutStore();
  });

  it('LOCK-01: after 3 failures next attempt is 429', async () => {
    for (let i = 0; i < env.loginMaxAttempts; i++) {
      const res = await failLogin('admin@demo.com');
      expect(res.status).toBe(401);
    }

    const locked = await request(app)
      .post('/login')
      .send({ email: 'admin@demo.com', password: 'admin123' });

    expect(locked.status).toBe(429);
    expect(locked.body.code).toBe('ACCOUNT_LOCKED');
  });

  it('LOCK-02: correct password still blocked while locked', async () => {
    for (let i = 0; i < env.loginMaxAttempts; i++) {
      await failLogin('user@demo.com');
    }

    const res = await request(app)
      .post('/login')
      .send({ email: 'user@demo.com', password: 'user123' });

    expect(res.status).toBe(429);
  });

  it('LOCK-03: successful login resets counter', async () => {
    await failLogin('admin@demo.com');
    await failLogin('admin@demo.com');

    const ok = await request(app)
      .post('/login')
      .send({ email: 'admin@demo.com', password: 'admin123' });
    expect(ok.status).toBe(200);

    for (let i = 0; i < env.loginMaxAttempts; i++) {
      const res = await failLogin('admin@demo.com');
      expect(res.status).toBe(401);
    }
  });

  it('LOCK-04: failures on A do not lock B', async () => {
    for (let i = 0; i < env.loginMaxAttempts; i++) {
      await failLogin('admin@demo.com');
    }

    const lockedA = await request(app)
      .post('/login')
      .send({ email: 'admin@demo.com', password: 'admin123' });
    expect(lockedA.status).toBe(429);

    const okB = await request(app)
      .post('/login')
      .send({ email: 'user@demo.com', password: 'user123' });
    expect(okB.status).toBe(200);
  });

  it('LOCK-05: after lock window expires, login works again', async () => {
    setLockedUntilForTests('admin@demo.com', Date.now() - 1000);

    const unlocked = await request(app)
      .post('/login')
      .send({ email: 'admin@demo.com', password: 'admin123' });
    expect(unlocked.status).toBe(200);
  });

  it('LOCK-06: unknown user failures also count toward lockout', async () => {
    for (let i = 0; i < env.loginMaxAttempts; i++) {
      const res = await failLogin('ghost@demo.com');
      expect(res.status).toBe(401);
    }

    const locked = await request(app)
      .post('/login')
      .send({ email: 'ghost@demo.com', password: 'anything' });
    expect(locked.status).toBe(429);
  });
});
