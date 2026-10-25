import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { authRouter } from './routes/auth.routes.js';
import { scoreRouter } from './routes/score.routes.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin,
    }),
  );
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use(authRouter);
  app.use(scoreRouter);

  app.use(errorHandler);

  return app;
}
