import type { NextFunction, Request, Response } from 'express';
import { login } from '../services/auth.service.js';

export function postLogin(req: Request, res: Response, next: NextFunction): void {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };
    const result = login(email, password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
