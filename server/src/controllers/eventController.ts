import { Response } from 'express';
import { EventRepository } from '../repositories/eventRepository.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { calculateBudget } from '../engines/budgetEngine.js';
import { calculateTimeline } from '../engines/timelineEngine.js';
import { evaluateRisks } from '../engines/riskEngine.js';
import { simulateGuestCountChange } from '../engines/impactEngine.js';
import { getSampleEvent } from '../data/sampleEvent.js';
import { EventState } from '../types/index.js';

export class EventController {
  /**
   * List all events owned by authenticated user
   */
  static async getEvents(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const events = await EventRepository.findByUserId(userId);

      const formatted = events.map(obj => {
        const budget = calculateBudget(obj);
        const timeline = calculateTimeline(obj);
        return {
          id: obj.id,
          meta: obj.meta,
          budgetSummary: {
            total: budget.totalBudget,
            forecast: budget.forecast,
            remaining: budget.remaining,
            isOverBudget: budget.isOverBudget,
          },
          timelineSummary: {
            daysRemaining: timeline.daysRemaining,
            overdueCount: timeline.overdueTasks.length,
            progressPercent: timeline.progressPercent,
          },
          updatedAt: obj.updatedAt,
        };
      });

      res.status(200).json({ events: formatted });
    } catch (err: any) {
      console.error('getEvents error:', err);
      res.status(500).json({ error: 'Failed to retrieve events.' });
    }
  }

  /**
   * Get single event by ID (strictly user-scoped)
   */
  static async getEventById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const event = await EventRepository.findById(userId, id);
      if (!event) {
        res.status(404).json({ error: 'Event not found or unauthorized access.' });
        return;
      }

      const budgetCalculations = calculateBudget(event);
      const timelineCalculations = calculateTimeline(event);
      const calculatedRisks = evaluateRisks(event);

      res.status(200).json({
        event,
        calculations: {
          budget: budgetCalculations,
          timeline: timelineCalculations,
          risks: calculatedRisks,
        },
      });
    } catch (err: any) {
      console.error('getEventById error:', err);
      res.status(500).json({ error: 'Failed to load event details.' });
    }
  }

  /**
   * Create new event
   */
  static async createEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const eventData = req.body;

      if (!eventData.meta || !eventData.meta.name) {
        res.status(400).json({ error: 'Event name is required.' });
        return;
      }

      const eventDate = eventData.meta.date || eventData.meta.startDate;
      if (!eventDate) {
        res.status(400).json({ error: 'Event date is required.' });
        return;
      }

      eventData.meta.date = eventDate;
      if (!eventData.meta.guestCount && eventData.meta.expectedGuests) {
        eventData.meta.guestCount = eventData.meta.expectedGuests;
      }
      if (!eventData.meta.guestCount) {
        eventData.meta.guestCount = 100;
      }
      if (!eventData.meta.totalBudget) {
        eventData.meta.totalBudget = 500000;
      }

      const newEvent = await EventRepository.create(userId, eventData);

      res.status(201).json({
        message: 'Event created successfully in Firebase Realtime Database.',
        event: newEvent,
      });
    } catch (err: any) {
      console.error('createEvent error:', err);
      res.status(500).json({ error: 'Failed to create event.' });
    }
  }

  /**
   * Update existing event
   */
  static async updateEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const updates = req.body;

      delete updates.userId;
      delete updates.id;

      const updated = await EventRepository.update(userId, id, updates);
      if (!updated) {
        res.status(404).json({ error: 'Event not found or unauthorized.' });
        return;
      }

      const budgetCalculations = calculateBudget(updated);
      const timelineCalculations = calculateTimeline(updated);
      const calculatedRisks = evaluateRisks(updated);

      res.status(200).json({
        message: 'Event updated successfully in Firebase Realtime Database.',
        event: updated,
        calculations: {
          budget: budgetCalculations,
          timeline: timelineCalculations,
          risks: calculatedRisks,
        },
      });
    } catch (err: any) {
      console.error('updateEvent error:', err);
      res.status(500).json({ error: 'Failed to update event.' });
    }
  }

  /**
   * Delete single event
   */
  static async deleteEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const deleted = await EventRepository.delete(userId, id);
      if (!deleted) {
        res.status(404).json({ error: 'Event not found or unauthorized.' });
        return;
      }

      res.status(200).json({ message: 'Event deleted successfully from Firebase Realtime Database.' });
    } catch (err: any) {
      console.error('deleteEvent error:', err);
      res.status(500).json({ error: 'Failed to delete event.' });
    }
  }

  /**
   * Deterministic What-If Simulation Endpoint
   */
  static async simulateImpact(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { newGuestCount } = req.body;
      const userId = req.user!.id;

      const event = await EventRepository.findById(userId, id);
      if (!event) {
        res.status(404).json({ error: 'Event not found or unauthorized.' });
        return;
      }

      const simulation = simulateGuestCountChange(event, Number(newGuestCount));
      res.status(200).json({ simulation });
    } catch (err: any) {
      console.error('simulateImpact error:', err);
      res.status(500).json({ error: 'Failed to simulate impact.' });
    }
  }

  /**
   * Seed Sample Event (Rahul & Ananya Wedding)
   */
  static async seedSampleEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const sample = getSampleEvent(userId);

      const created = await EventRepository.create(userId, sample as any);

      res.status(201).json({
        message: 'Rahul & Ananya sample event loaded successfully into Firebase Realtime Database.',
        event: created,
      });
    } catch (err: any) {
      console.error('seedSampleEvent error:', err);
      res.status(500).json({ error: 'Failed to seed sample event.' });
    }
  }
}
