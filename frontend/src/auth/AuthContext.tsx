import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ApiError, loginRequest } from '../api/client';
import type { AuthUser } from '../types/auth';
import {
  clearToken,
  decodeUserFromToken,
  getToken,
  saveToken,
} from './token';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): { token: string | null; user: AuthUser | null } {
  const token = getToken();
  if (!token) return { token: null, user: null };
  const user = decodeUserFromToken(token);
  if (!user) {
    clearToken();
    return { token: null, user: null };
  }
  return { token, user };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = readSession();
  const [token, setToken] = useState<string | null>(initial.token);
  const [user, setUser] = useState<AuthUser | null>(initial.user);

  const login = useCallback(async (email: string, password: string) => {
    const { token: nextToken } = await loginRequest(email, password);
    const nextUser = decodeUserFromToken(nextToken);
    if (!nextUser) {
      throw new ApiError('Token inválido recibido del servidor', 500);
    }
    saveToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, login, logout }),
    [user, token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
