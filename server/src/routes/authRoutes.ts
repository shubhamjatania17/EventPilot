import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export const authRouter = Router();

// Public auth endpoints
authRouter.post('/signup', AuthController.signup);
authRouter.post('/signin', AuthController.signin);
authRouter.post('/google', AuthController.googleAuth);

// Authenticated profile endpoints
authRouter.get('/profile', requireAuth, AuthController.getProfile);
authRouter.put('/profile', requireAuth, AuthController.updateProfile);
authRouter.post('/change-password', requireAuth, AuthController.changePassword);
authRouter.delete('/account', requireAuth, AuthController.deleteAccount);
