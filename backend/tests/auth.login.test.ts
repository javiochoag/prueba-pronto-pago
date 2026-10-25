import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';
import { resetLockoutStore } from '../src/services/login-lockout.service.js';

const app = createApp();

describe('POST /login', () => {
  beforeEach(() => {
    resetLockoutStore();
  });

  it('LOG-01: admin login returns token without rut', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'admin@demo.com', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ token: expect.any(String) });
    expect(res.body).not.toHaveProperty('password');

    const payload = jwt.verify(res.body.token, env.jwtSecret) as jwt.JwtPayload;
    expect(payload.sub).toBe('1');
    expect(payload.role).toBe('admin');
    expect(payload.rut).toBeUndefined();
  });

  it('LOG-02: user login returns token with rut', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'user@demo.com', password: 'user123' });

    expect(res.status).toBe(200);
    const payload = jwt.verify(res.body.token, env.jwtSecret) as jwt.JwtPayload;
    expect(payload.role).toBe('user');
    expect(payload.rut).toBe('12.345.678-9');
  });

  it('LOG-03: token is signed and has exp', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'admin@demo.com', password: 'admin123' });

    const payload = jwt.verify(res.body.token, env.jwtSecret) as jwt.JwtPayload;
    expect(payload.exp).toBeTypeOf('number');
    expect((payload.exp as number) * 1000).toBeGreaterThan(Date.now());
  });

  it('LOG-04: wrong password → 401', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'admin@demo.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciales inválidas');
  });

  it('LOG-05: unknown user → same 401 message', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'nobody@demo.com', password: 'x' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciales inválidas');
  });

  it('LOG-06: missing body fields → 400', async () => {
    const res = await request(app).post('/login').send({});
    expect(res.status).toBe(400);
  });

  it('LOG-07: email trim / case-insensitive', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: '  Admin@Demo.com  ', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
  });

  it('LOG-08: response only exposes token', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'user@demo.com', password: 'user123' });

    expect(Object.keys(res.body)).toEqual(['token']);
  });
});
