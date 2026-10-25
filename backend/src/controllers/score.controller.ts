import type { NextFunction, Request, Response } from 'express';
import { AuthError } from '../services/auth.service.js';
import { computeScore } from '../services/score.service.js';
import { isValidRutFormat } from '../utils/rut.js';

export function getScore(req: Request, res: Response, next: NextFunction): void {
  try {
    const rut = Array.isArray(req.params.rut) ? req.params.rut[0] : req.params.rut;
    if (!rut || !isValidRutFormat(rut)) {
      throw new AuthError('RUT inválido', 400, 'INVALID_RUT');
    }

    const result = computeScore(rut);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
