import { describe, expect, it } from 'vitest';
import {
  formatRut,
  isValidRutFormat,
  normalizeRut,
  rutsEqual,
} from '../src/utils/rut.js';

describe('RUT utils', () => {
  it('RUT-01: normalizes and formats 12.345.678-9', () => {
    expect(normalizeRut('12.345.678-9')).toBe('123456789');
    expect(formatRut('12.345.678-9')).toBe('12.345.678-9');
  });

  it('RUT-02: same identity without dots', () => {
    expect(normalizeRut('12345678-9')).toBe('123456789');
    expect(rutsEqual('12.345.678-9', '12345678-9')).toBe(true);
  });

  it('RUT-03: DV K is case-insensitive', () => {
    expect(normalizeRut('12.345.678-k')).toBe('12345678K');
    expect(normalizeRut('12.345.678-K')).toBe('12345678K');
    expect(rutsEqual('12.345.678-k', '12.345.678-K')).toBe(true);
  });

  it('RUT-04: digits only accepted', () => {
    expect(isValidRutFormat('123456789')).toBe(true);
    expect(normalizeRut('123456789')).toBe('123456789');
  });

  it('RUT-05: empty / invalid rejected', () => {
    expect(isValidRutFormat('')).toBe(false);
    expect(isValidRutFormat('   ')).toBe(false);
    expect(isValidRutFormat('abc')).toBe(false);
    expect(isValidRutFormat('12.345.678-X')).toBe(false);
  });

  it('RUT-06: invalid length rejected', () => {
    expect(isValidRutFormat('123456')).toBe(false);
    expect(isValidRutFormat('12345678901')).toBe(false);
  });
});
