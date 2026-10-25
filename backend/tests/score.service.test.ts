import { describe, expect, it } from 'vitest';
import { computeScore } from '../src/services/score.service.js';

describe('score.service', () => {
  it('SCR-01: same RUT yields same score', () => {
    const a = computeScore('12.345.678-9');
    const b = computeScore('12.345.678-9');
    expect(a.score).toBe(b.score);
  });

  it('SCR-02 / SCR-03: score is integer in 0..100', () => {
    const result = computeScore('11.111.111-1');
    expect(Number.isInteger(result.score)).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('SCR-04: different formats same identity → same score', () => {
    expect(computeScore('12.345.678-9').score).toBe(computeScore('12345678-9').score);
    expect(computeScore('12.345.678-9').score).toBe(computeScore('123456789').score);
  });

  it('SCR-05: fecha is ISO 8601 UTC', () => {
    const { fecha } = computeScore('12.345.678-9');
    expect(() => new Date(fecha)).not.toThrow();
    expect(new Date(fecha).toISOString()).toBe(fecha);
  });
});
