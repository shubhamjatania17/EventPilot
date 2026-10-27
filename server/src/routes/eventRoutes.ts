import { Router } from 'express';
import { EventController } from '../controllers/eventController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export const eventRouter = Router();

// All event operations require authentication
eventRouter.use(requireAuth);

eventRouter.get('/', EventController.getEvents);
eventRouter.get('/:id', EventController.getEventById);
eventRouter.post('/', EventController.createEvent);
eventRouter.put('/:id', EventController.updateEvent);
eventRouter.delete('/:id', EventController.deleteEvent);

// Deterministic What-if simulation
eventRouter.post('/:id/simulate', EventController.simulateImpact);

// Seed sample event for demo / judging
eventRouter.post('/seed/sample', EventController.seedSampleEvent);
