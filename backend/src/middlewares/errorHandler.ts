import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { AuthError } from '../services/auth.service.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AuthError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      ...(err.details ?? {}),
    });
    return;
  }

  if (env.nodeEnv !== 'production') {
    console.error(err);
  }

  res.status(500).json({
    error: 'Error interno del servidor',
    code: 'INTERNAL_ERROR',
  });
}
