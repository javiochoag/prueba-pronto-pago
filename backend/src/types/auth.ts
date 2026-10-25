export type Role = 'admin' | 'user';

export interface JwtPayload {
  sub: string;
  role: Role;
  rut?: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: Role;
  rut?: string;
}
