process.env.JWT_SECRET ??= 'test-jwt-secret-consulta-riesgo';
process.env.JWT_EXPIRES_IN ??= '1h';
process.env.CORS_ORIGIN ??= 'http://localhost:5173';
process.env.LOGIN_MAX_ATTEMPTS ??= '3';
process.env.LOGIN_LOCK_MINUTES ??= '15';
process.env.NODE_ENV = 'test';
