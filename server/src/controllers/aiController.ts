import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { AIService } from '../services/aiService.js';
import { EventRepository } from '../repositories/eventRepository.js';

export class AIController {
  /**
   * AI-01: Generate Event Plan Proposal
   */
  static async generatePlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { eventType, name, location, date, guestCount, budget, priorities } = req.body;

      if (!eventType || !name || !date || !budget) {
        res.status(400).json({ error: 'Missing required event parameters (eventType, name, date, budget).' });
        return;
      }

      const proposal = await AIService.generateEventPlan({
        eventType,
        name,
        location: location || 'TBD',
        date,
        guestCount: Number(guestCount) || 50,
        budget: Number(budget),
        priorities: priorities || [],
      });

      res.status(200).json({
        proposalId: `prop-plan-${Date.now()}`,
        summary: proposal.summary,
        data: proposal,
        needsConfirmation: true,
      });
    } catch (err: any) {
      console.error('generatePlan error:', err);
      res.status(500).json({ error: 'AI plan generation failed. Please try again.' });
    }
  }

  /**
   * AI-02: Analyze Current Event State
   */
  static async analyze(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.body;
      const userId = req.user!.id;

      const event = await EventRepository.findById(userId, eventId);
      if (!event) {
        res.status(404).json({ error: 'Event not found.' });
        return;
      }

      const analysis = await AIService.analyzeEvent(event);

      res.status(200).json({ analysis });
    } catch (err: any) {
      console.error('analyze error:', err);
      res.status(500).json({ error: 'AI analysis failed.' });
    }
  }

  /**
   * AI-03: Recommend Trade-offs (What-If Hero Flow)
   */
  static async recommendTradeoffs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { eventId, newGuestCount, constraint } = req.body;
      const userId = req.user!.id;

      const event = await EventRepository.findById(userId, eventId);
      if (!event) {
        res.status(404).json({ error: 'Event not found.' });
        return;
      }

      const tradeoffs = await AIService.recommendTradeoffs(
        event,
        Number(newGuestCount),
        constraint || 'Keep me below total budget'
      );

      res.status(200).json({
        proposalId: `prop-tradeoff-${Date.now()}`,
        summary: tradeoffs.assessment,
        data: tradeoffs,
        needsConfirmation: true,
      });
    } catch (err: any) {
      console.error('recommendTradeoffs error:', err);
      res.status(500).json({ error: 'Failed to recommend trade-offs.' });
    }
  }

  /**
   * AI-04: Extract Vendor Quote
   */
  static async extractQuote(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { quoteText } = req.body;

      if (!quoteText || typeof quoteText !== 'string' || quoteText.trim().length === 0) {
        res.status(400).json({ error: 'Quote text is required for extraction.' });
        return;
      }

      const extracted = await AIService.extractVendorQuote(quoteText);

      res.status(200).json({
        proposalId: `prop-quote-${Date.now()}`,
        extracted,
        needsConfirmation: true,
      });
    } catch (err: any) {
      console.error('extractQuote error:', err);
      res.status(500).json({ error: 'Failed to extract vendor quote.' });
    }
  }

  /**
   * AI-05: Conversational Copilot
   */
  static async askQuestion(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { eventId, question } = req.body;
      const userId = req.user!.id;

      if (!question) {
        res.status(400).json({ error: 'Question is required.' });
        return;
      }

      const event = await EventRepository.findById(userId, eventId);
      if (!event) {
        res.status(404).json({ error: 'Event not found.' });
        return;
      }

      const response = await AIService.answerEventQuestion(event, question);

      res.status(200).json({ response });
    } catch (err: any) {
      console.error('askQuestion error:', err);
      res.status(500).json({ error: 'AI copilot response failed.' });
    }
  }
}
