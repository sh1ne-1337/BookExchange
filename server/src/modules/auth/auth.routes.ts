import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authRateLimit, emailRateLimit } from '../../middlewares/rate-limit.js';
import * as authController from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', authRateLimit, authController.register);
authRouter.post('/login', authRateLimit, authController.login);
authRouter.post('/forgot-password', emailRateLimit, authController.forgotPassword);
authRouter.post('/reset-password', authRateLimit, authController.resetPassword);
authRouter.get('/me', authenticate, authController.me);
