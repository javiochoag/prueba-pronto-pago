import type { AuthUser, Role } from '../types/auth';

const TOKEN_KEY = 'consulta_riesgo_token';

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function decodeBase64Url(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

/** Decode JWT payload for UI only — never treat as trust boundary. */
export function decodeUserFromToken(token: string): AuthUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(decodeBase64Url(parts[1])) as {
      sub?: string;
      role?: string;
      rut?: string;
      exp?: number;
    };

    if (!payload.sub || (payload.role !== 'admin' && payload.role !== 'user')) {
      return null;
    }

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    const user: AuthUser = {
      sub: payload.sub,
      role: payload.role as Role,
    };
    if (payload.role === 'user' && typeof payload.rut === 'string') {
      user.rut = payload.rut;
    }
    return user;
  } catch {
    return null;
  }
}
