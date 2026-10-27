import { Router } from 'express';
import { AIController } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export const aiRouter = Router();

// AI generation can be called when onboarding or in-app
aiRouter.post('/generate-plan', requireAuth, AIController.generatePlan);
aiRouter.post('/analyze', requireAuth, AIController.analyze);
aiRouter.post('/tradeoffs', requireAuth, AIController.recommendTradeoffs);
aiRouter.post('/trade-offs', requireAuth, AIController.recommendTradeoffs);
aiRouter.post('/extract-quote', requireAuth, AIController.extractQuote);
aiRouter.post('/ask', requireAuth, AIController.askQuestion);
