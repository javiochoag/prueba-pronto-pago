import type { NextFunction, Request, Response } from 'express';
import { AuthError } from '../services/auth.service.js';
import { rutsEqual } from '../utils/rut.js';

export function authorizeScore(req: Request, _res: Response, next: NextFunction): void {
  const user = req.user;
  if (!user) {
    next(new AuthError('No autenticado', 401, 'UNAUTHORIZED'));
    return;
  }

  const rutParam = Array.isArray(req.params.rut) ? req.params.rut[0] : req.params.rut;
  if (!rutParam) {
    next(new AuthError('RUT requerido', 400, 'VALIDATION_ERROR'));
    return;
  }

  if (user.role === 'admin') {
    next();
    return;
  }

  if (user.role === 'user') {
    if (!user.rut || !rutsEqual(user.rut, rutParam)) {
      next(new AuthError('No autorizado para consultar este RUT', 403, 'FORBIDDEN'));
      return;
    }
    next();
    return;
  }

  next(new AuthError('No autorizado para consultar este RUT', 403, 'FORBIDDEN'));
}
