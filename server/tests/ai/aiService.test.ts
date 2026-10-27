import { describe, it, expect } from 'vitest';
import { 
  GeneratedPlanSchema, 
  ExtractedQuoteSchema, 
  TradeoffResponseSchema, 
  AnalysisResponseSchema,
  AIService
} from '../../src/services/aiService.js';

describe('AI Schema Validation & Injection Defense', () => {
  it('validates a correct generated plan proposal schema', () => {
    const validPlan = {
      summary: 'Wedding plan for 150 guests',
      budgetCategories: [
        { name: 'Venue', allocated: 200000, color: '#3B82F6' },
        { name: 'Catering', allocated: 250000, color: '#10B981' },
      ],
      tasks: [
        { title: 'Confirm Venue', description: 'Advance payment', dueDateOffsetDays: -60, priority: 'critical', category: 'Venue' },
      ],
      vendorCategories: ['Venue', 'Catering', 'Decor'],
      ideas: [
        { title: 'Live Sitar', description: 'Classical entrance', estimatedCost: 10000, effort: 'low', guestImpact: 'high', reason: 'Ambiance' },
      ],
    };

    const parsed = GeneratedPlanSchema.safeParse(validPlan);
    expect(parsed.success).toBe(true);
  });

  it('rejects a malformed AI proposal missing required fields', () => {
    const malformed = {
      summary: 'Incomplete plan',
      budgetCategories: 'not an array', // Invalid shape
    };

    const parsed = GeneratedPlanSchema.safeParse(malformed);
    expect(parsed.success).toBe(false);
  });

  it('validates structured vendor quote schema with line items', () => {
    const quoteData = {
      vendorName: 'Royal Catering',
      category: 'Catering',
      lineItems: [
        { description: 'Buffet', quantity: 100, unitPrice: 1500, total: 150000 },
      ],
      subtotal: 150000,
      taxes: 7500,
      discounts: 0,
      additionalCharges: 0,
      total: 157500,
      paymentTerms: '50% advance',
      deadlines: '7 days prior',
      ambiguities: [],
    };

    const parsed = ExtractedQuoteSchema.safeParse(quoteData);
    expect(parsed.success).toBe(true);
  });

  it('provides safe deterministic fallback when Gemini API key is absent', async () => {
    // When GEMINI_API_KEY is not configured or in test mode, AIService returns valid proposal
    const result = await AIService.extractVendorQuote('Untrusted quote string with test data');
    expect(result.vendorName).toBeDefined();
    expect(result.total).toBeGreaterThan(0);
    expect(result.lineItems.length).toBeGreaterThan(0);
  });
});
