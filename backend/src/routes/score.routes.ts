import { Router } from 'express';
import { getScore } from '../controllers/score.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizeScore } from '../middlewares/authorizeScore.js';

export const scoreRouter = Router();

scoreRouter.get('/score/:rut', authenticate, authorizeScore, getScore);
