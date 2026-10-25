import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { findUserByEmail } from '../data/users.mock.js';
import type { JwtPayload, User } from '../types/auth.js';
import {
  getLockRemainingMs,
  isLocked,
  recordFailedAttempt,
  resetAttempts,
} from './login-lockout.service.js';

export class AuthError extends Error {
  statusCode: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

function buildPayload(user: User): JwtPayload {
  const payload: JwtPayload = {
    sub: user.id,
    role: user.role,
  };
  if (user.role === 'user' && user.rut) {
    payload.rut = user.rut;
  }
  return payload;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    algorithm: 'HS256',
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.jwtSecret, {
    algorithms: ['HS256'],
  });

  if (typeof decoded === 'string' || !decoded || typeof decoded !== 'object') {
    throw new AuthError('Token inválido', 401, 'INVALID_TOKEN');
  }

  const { sub, role, rut } = decoded as jwt.JwtPayload & Partial<JwtPayload>;

  if (!sub || (role !== 'admin' && role !== 'user')) {
    throw new AuthError('Token inválido', 401, 'INVALID_TOKEN');
  }

  const payload: JwtPayload = { sub: String(sub), role };
  if (role === 'user' && typeof rut === 'string') {
    payload.rut = rut;
  }
  return payload;
}

export function login(email: string | undefined, password: string | undefined): { token: string } {
  if (!email?.trim() || !password) {
    throw new AuthError('Email y password son requeridos', 400, 'VALIDATION_ERROR');
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (isLocked(normalizedEmail)) {
    const remainingMs = getLockRemainingMs(normalizedEmail);
    throw new AuthError(
      'Cuenta temporalmente bloqueada por demasiados intentos fallidos',
      429,
      'ACCOUNT_LOCKED',
      { retryAfterSeconds: Math.ceil(remainingMs / 1000) },
    );
  }

  const user = findUserByEmail(normalizedEmail);
  if (!user || user.password !== password) {
    recordFailedAttempt(normalizedEmail);
    throw new AuthError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
  }

  resetAttempts(normalizedEmail);
  return { token: signToken(buildPayload(user)) };
}
