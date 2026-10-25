export type Role = 'admin' | 'user';

export interface AuthUser {
  sub: string;
  role: Role;
  rut?: string;
}

export interface ScoreResponse {
  rut: string;
  score: number;
  fecha: string;
}
