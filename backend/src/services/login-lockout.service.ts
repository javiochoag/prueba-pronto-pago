import { env } from '../config/env.js';

interface LockEntry {
  failures: number;
  lockedUntil: number | null;
}

const store = new Map<string, LockEntry>();

function keyFor(email: string): string {
  return email.trim().toLowerCase();
}

export function resetLockoutStore(): void {
  store.clear();
}

export function isLocked(email: string, now = Date.now()): boolean {
  const entry = store.get(keyFor(email));
  if (!entry?.lockedUntil) {
    return false;
  }
  if (entry.lockedUntil <= now) {
    store.delete(keyFor(email));
    return false;
  }
  return true;
}

export function getLockRemainingMs(email: string, now = Date.now()): number {
  const entry = store.get(keyFor(email));
  if (!entry?.lockedUntil || entry.lockedUntil <= now) {
    return 0;
  }
  return entry.lockedUntil - now;
}

export function recordFailedAttempt(email: string, now = Date.now()): void {
  const key = keyFor(email);
  const entry = store.get(key) ?? { failures: 0, lockedUntil: null };

  if (entry.lockedUntil && entry.lockedUntil > now) {
    return;
  }

  if (entry.lockedUntil && entry.lockedUntil <= now) {
    entry.failures = 0;
    entry.lockedUntil = null;
  }

  entry.failures += 1;

  if (entry.failures >= env.loginMaxAttempts) {
    entry.lockedUntil = now + env.loginLockMinutes * 60 * 1000;
  }

  store.set(key, entry);
}

export function resetAttempts(email: string): void {
  store.delete(keyFor(email));
}

/** Test helper: force a lock that expires at the given timestamp. */
export function setLockedUntilForTests(email: string, lockedUntil: number): void {
  store.set(keyFor(email), {
    failures: env.loginMaxAttempts,
    lockedUntil,
  });
}
