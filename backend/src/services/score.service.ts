import { createHash } from 'node:crypto';
import { formatRut, isValidRutFormat, normalizeRut } from '../utils/rut.js';

export interface ScoreResult {
  rut: string;
  score: number;
  fecha: string;
}

/** Deterministic score 0–100 from normalized RUT. */
export function computeScore(rut: string): ScoreResult {
  if (!isValidRutFormat(rut)) {
    throw new Error('INVALID_RUT');
  }

  const normalized = normalizeRut(rut);
  const hash = createHash('sha256').update(normalized).digest();
  const score = hash.readUInt32BE(0) % 101;

  return {
    rut: formatRut(rut),
    score,
    fecha: new Date().toISOString(),
  };
}
