import type { NextFunction, Request, Response } from 'express';
import { AuthError, verifyToken } from '../services/auth.service.js';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header) {
      throw new AuthError('No autenticado', 401, 'UNAUTHORIZED');
    }

    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new AuthError('No autenticado', 401, 'UNAUTHORIZED');
    }

    req.user = verifyToken(token);
    next();
  } catch (err) {
    if (err instanceof AuthError) {
      next(err);
      return;
    }
    next(new AuthError('No autenticado', 401, 'UNAUTHORIZED'));
  }
}
