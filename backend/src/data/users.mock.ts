import type { User } from '../types/auth.js';

export const USERS: User[] = [
  {
    id: '1',
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: '2',
    email: 'user@demo.com',
    password: 'user123',
    role: 'user',
    rut: '12.345.678-9',
  },
];

export function findUserByEmail(email: string): User | undefined {
  const normalized = email.trim().toLowerCase();
  return USERS.find((u) => u.email.toLowerCase() === normalized);
}
