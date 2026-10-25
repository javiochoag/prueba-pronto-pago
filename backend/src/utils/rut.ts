const RUT_BODY_MIN = 7;
const RUT_BODY_MAX = 8;

/** Strip dots/dashes and uppercase K. */
export function normalizeRut(rut: string): string {
  return rut.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
}

export function isValidRutFormat(rut: string): boolean {
  const normalized = normalizeRut(rut);
  if (!/^\d{7,8}[\dK]$/.test(normalized)) {
    return false;
  }
  const body = normalized.slice(0, -1);
  return body.length >= RUT_BODY_MIN && body.length <= RUT_BODY_MAX;
}

/** Format as 12.345.678-9 (or shorter body). */
export function formatRut(rut: string): string {
  const normalized = normalizeRut(rut);
  if (!isValidRutFormat(normalized)) {
    return rut;
  }
  const body = normalized.slice(0, -1);
  const dv = normalized.slice(-1);
  const reversed = body.split('').reverse();
  const chunks: string[] = [];
  for (let i = 0; i < reversed.length; i += 3) {
    chunks.push(reversed.slice(i, i + 3).reverse().join(''));
  }
  return `${chunks.reverse().join('.')}-${dv}`;
}

export function rutsEqual(a: string, b: string): boolean {
  return normalizeRut(a) === normalizeRut(b);
}
