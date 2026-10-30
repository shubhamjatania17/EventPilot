import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  GeneratedPlanSchema, 
  ExtractedQuoteSchema, 
  TradeoffResponseSchema, 
  AnalysisResponseSchema,
  ChatAnswerSchema,
  IncidentResponseSchema,
  VendorNegotiationSchema,
  TaskDecompositionSchema,
  ConceptStudioSchema,
  AIService,
  executeWithModelFallback
} from '../../src/services/aiService.js';
import { 
  getResolvedModelChain, 
  SUPPORTED_GEMINI_MODELS, 
  DEFAULT_MODEL_CHAIN 
} from '../../src/services/geminiRegistry.js';

describe('Gemini Model Registry & Fallback Chain', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    AIService.setMockClient(null);
  });

  it('contains supported Gemini models with valid specifications', () => {
    expect(SUPPORTED_GEMINI_MODELS['gemini-2.5-flash']).toBeDefined();
    expect(SUPPORTED_GEMINI_MODELS['gemini-2.0-flash']).toBeDefined();
    expect(SUPPORTED_GEMINI_MODELS['gemini-1.5-flash']).toBeDefined();
    expect(SUPPORTED_GEMINI_MODELS['gemini-2.5-pro']).toBeDefined();
    expect(SUPPORTED_GEMINI_MODELS['gemini-2.5-flash'].tier).toBe('flagship');
  });

  it('defaults to the recommended 4-tier model cascade chain', () => {
    delete process.env.GEMINI_MODELS;
    delete process.env.GEMINI_MODEL;
    delete process.env.GEMINI_FALLBACK_MODELS;

    const chain = getResolvedModelChain();
    expect(chain).toEqual(DEFAULT_MODEL_CHAIN);
    expect(chain[0]).toBe('gemini-2.5-flash');
    expect(chain[1]).toBe('gemini-2.0-flash');
    expect(chain[2]).toBe('gemini-1.5-flash');
    expect(chain[3]).toBe('gemini-2.5-pro');
  });

  it('respects GEMINI_MODELS comma-separated override', () => {
    process.env.GEMINI_MODELS = 'gemini-2.5-pro, gemini-2.0-flash, gemini-1.5-flash';
    const chain = getResolvedModelChain();
    expect(chain).toEqual(['gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-1.5-flash']);
  });

  it('sanitizes legacy non-existent models to supported models', () => {
    process.env.GEMINI_MODEL = 'gemini-3.5-flash';
    const chain = getResolvedModelChain();
    expect(chain[0]).toBe('gemini-2.5-flash');
  });
});

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
    const result = await AIService.extractVendorQuote('Untrusted quote string with test data');
    expect(result.vendorName).toBeDefined();
    expect(result.total).toBeGreaterThan(0);
    expect(result.lineItems.length).toBeGreaterThan(0);
  });
});

describe('Multi-Model Fallback Execution Engine', () => {
  afterEach(() => {
    AIService.setMockClient(null);
  });

  it('succeeds on primary model when available', async () => {
    const mockClient = {
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify({
            vendorName: 'Primary Vendor',
            category: 'Decor',
            lineItems: [{ description: 'Backdrop', total: 50000 }],
            subtotal: 50000,
            taxes: 0,
            discounts: 0,
            additionalCharges: 0,
            total: 50000,
            ambiguities: [],
          }),
        }),
      },
    };

    AIService.setMockClient(mockClient);

    const result = await executeWithModelFallback({
      operationName: 'testQuoteExtraction',
      prompt: 'dummy prompt',
      schema: ExtractedQuoteSchema,
      deterministicFallback: () => ({
        vendorName: 'Fallback Vendor',
        category: 'Misc',
        lineItems: [],
        subtotal: 0,
        taxes: 0,
        discounts: 0,
        additionalCharges: 0,
        total: 0,
        ambiguities: [],
      }),
    });

    expect(result.vendorName).toBe('Primary Vendor');
    expect(mockClient.models.generateContent).toHaveBeenCalledTimes(1);
  });

  it('falls back to secondary model when primary model encounters 429 rate limit or error', async () => {
    const callHistory: string[] = [];
    const mockClient = {
      models: {
        generateContent: vi.fn().mockImplementation(async ({ model }) => {
          callHistory.push(model);
          if (model === 'gemini-2.5-flash') {
            throw new Error('429 ResourceExhausted: Rate limit exceeded');
          }
          return {
            text: JSON.stringify({
              vendorName: 'Secondary Model Vendor',
              category: 'Catering',
              lineItems: [{ description: 'Main Buffet', total: 75000 }],
              subtotal: 75000,
              taxes: 0,
              discounts: 0,
              additionalCharges: 0,
              total: 75000,
              ambiguities: [],
            }),
          };
        }),
      },
    };

    AIService.setMockClient(mockClient);

    const result = await executeWithModelFallback({
      operationName: 'testRateLimitFallback',
      prompt: 'test prompt',
      schema: ExtractedQuoteSchema,
      deterministicFallback: () => ({
        vendorName: 'Deterministic Fallback Vendor',
        category: 'Catering',
        lineItems: [],
        subtotal: 0,
        taxes: 0,
        discounts: 0,
        additionalCharges: 0,
        total: 0,
        ambiguities: [],
      }),
    });

    expect(callHistory).toEqual(['gemini-2.5-flash', 'gemini-2.0-flash']);
    expect(result.vendorName).toBe('Secondary Model Vendor');
    expect(result.total).toBe(75000);
  });

  it('safely engages deterministic fallback when all models in cascade fail', async () => {
    const mockClient = {
      models: {
        generateContent: vi.fn().mockRejectedValue(new Error('503 Service Unavailable across all regions')),
      },
    };

    AIService.setMockClient(mockClient);

    const result = await executeWithModelFallback({
      operationName: 'testExhaustion',
      prompt: 'test prompt',
      schema: ExtractedQuoteSchema,
      deterministicFallback: () => ({
        vendorName: 'Guaranteed Deterministic Vendor',
        category: 'Catering',
        lineItems: [{ description: 'Buffet', total: 100000 }],
        subtotal: 100000,
        taxes: 0,
        discounts: 0,
        additionalCharges: 0,
        total: 100000,
        ambiguities: [],
      }),
    });

    expect(result.vendorName).toBe('Guaranteed Deterministic Vendor');
    expect(result.total).toBe(100000);
  });

  it('strips markdown code fences before validating JSON', async () => {
    const mockClient = {
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: '```json\n{\n  "answer": "This was fenced in markdown",\n  "referencedEntities": [],\n  "suggestedActions": []\n}\n```',
        }),
      },
    };

    AIService.setMockClient(mockClient);

    const result = await executeWithModelFallback({
      operationName: 'testMarkdownStripping',
      prompt: 'test prompt',
      schema: ChatAnswerSchema,
      deterministicFallback: () => ({
        answer: 'Fallback',
        referencedEntities: [],
        suggestedActions: [],
      }),
    });

    expect(result.answer).toBe('This was fenced in markdown');
  });
});

describe('New AI Suite Endpoints (Incident, Negotiation, Decomposition, Concept Studio)', () => {
  const dummyEvent: any = {
    id: 'ev-test-1',
    userId: 'u1',
    meta: {
      name: 'Sahil & Riya Wedding',
      type: 'wedding',
      date: '2026-12-15',
      location: 'Grand Ballroom, Mumbai',
      guestCount: 200,
      totalBudget: 1000000,
      contingencyPercent: 10,
    },
    budgetCategories: [
      { id: 'c1', name: 'Catering', allocated: 400000, color: '#10B981' },
      { id: 'c2', name: 'Decor', allocated: 250000, color: '#F59E0B' },
    ],
    tasks: [],
    eventDaySchedule: [
      { id: 'sch-1', time: '17:00', title: 'Baraat Arrival', lead: 'Groom Family', location: 'Main Gate', status: 'completed' },
      { id: 'sch-2', time: '18:00', title: 'Varmala & Pheras', lead: 'Panditji', location: 'Mandap', status: 'pending' },
      { id: 'sch-3', time: '20:00', title: 'Grand Dinner & Reception', lead: 'Catering Manager', location: 'Dining Lawn', status: 'pending' },
    ],
  };

  it('validates IncidentResponseSchema and executes fallback safely', async () => {
    const res = await AIService.respondToIncident(dummyEvent, {
      incident: 'Heavy sudden rain on open reception lawn',
    });

    expect(IncidentResponseSchema.safeParse(res).success).toBe(true);
    expect(res.recommendedDelayMinutes).toBeGreaterThan(0);
    expect(res.emceeScript).toContain('Ladies and gentlemen');
    expect(res.scheduleShifts.length).toBeGreaterThan(0);
  });

  it('validates VendorNegotiationSchema and generates counter-offer strategy', async () => {
    const res = await AIService.negotiateVendor(dummyEvent, {
      vendorName: 'Royal Decorators',
      category: 'Decor',
      quotedAmount: 320000,
      targetBudget: 250000,
    });

    expect(VendorNegotiationSchema.safeParse(res).success).toBe(true);
    expect(res.potentialSavings).toBe(70000);
    expect(res.negotiationEmail).toContain('Royal Decorators');
    expect(res.suggestedCompromises.length).toBeGreaterThan(0);
  });

  it('validates TaskDecompositionSchema and generates actionable subtasks', async () => {
    const res = await AIService.decomposeTask(dummyEvent, {
      taskTitle: 'Finalize Stage Lighting & Audio Setup',
      category: 'Production',
    });

    expect(TaskDecompositionSchema.safeParse(res).success).toBe(true);
    expect(res.subtasks.length).toBeGreaterThanOrEqual(3);
    expect(res.subtasks[0].title).toBeDefined();
    expect(res.subtasks[0].priority).toBeDefined();
  });

  it('validates ConceptStudioSchema and crafts aesthetic palette & invitation copy', async () => {
    const res = await AIService.generateConceptStudio(dummyEvent, {
      theme: 'Royal Heritage with Contemporary Gold',
    });

    expect(ConceptStudioSchema.safeParse(res).success).toBe(true);
    expect(res.colorPalette.length).toBeGreaterThanOrEqual(3);
    expect(res.invitationTemplates.whatsappShort).toContain('Sahil & Riya Wedding');
    expect(res.signatureMoments.length).toBeGreaterThanOrEqual(2);
    expect(res.hashtags.length).toBeGreaterThanOrEqual(2);
  });
});
