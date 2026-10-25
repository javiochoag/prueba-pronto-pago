export type Role = 'admin' | 'user';

export interface AuthUser {
  sub: string;
  role: Role;
  rut?: string;
}
