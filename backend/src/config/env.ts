import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3001),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  loginMaxAttempts: Number(process.env.LOGIN_MAX_ATTEMPTS ?? 3),
  loginLockMinutes: Number(process.env.LOGIN_LOCK_MINUTES ?? 15),
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
