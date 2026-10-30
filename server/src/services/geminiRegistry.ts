/**
 * Gemini Model Registry & Specifications
 * Review of currently supported Google Gemini API models (Google Gen AI SDK @google/genai)
 */

export interface GeminiModelSpec {
  id: string;
  name: string;
  tier: 'flagship' | 'reasoning' | 'fast' | 'fallback';
  contextWindow: string;
  description: string;
  recommendedRole: string;
  isStable: boolean;
}

/**
 * Curated catalog of currently supported Gemini models
 */
export const SUPPORTED_GEMINI_MODELS: Record<string, GeminiModelSpec> = {
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    tier: 'flagship',
    contextWindow: '1M tokens',
    description: 'Latest high-speed, high-intelligence multimodal model with enhanced structured output capabilities.',
    recommendedRole: 'Primary default model for real-time plan generation, budget analysis, and copilot chat.',
    isStable: true,
  },
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    tier: 'fast',
    contextWindow: '1M tokens',
    description: 'Next-gen workhorse model offering ultra-low latency, strong reasoning, and reliable JSON schema mode.',
    recommendedRole: 'Secondary fallback for fast quote extraction and what-if simulation trade-offs.',
    isStable: true,
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    tier: 'fallback',
    contextWindow: '1M tokens',
    description: 'Battle-tested, widely deployed fast model with generous quota ceilings and robust availability.',
    recommendedRole: 'Tertiary fallback during rate limiting or regional traffic spikes.',
    isStable: true,
  },
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    tier: 'reasoning',
    contextWindow: '2M tokens',
    description: 'Premier deep-reasoning model optimized for complex trade-off balancing and multi-variable optimization.',
    recommendedRole: 'Heavy reasoning fallback for high-consequence event risk analyses and deep budget trade-offs.',
    isStable: true,
  },
  'gemini-2.0-flash-lite': {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    tier: 'fast',
    contextWindow: '1M tokens',
    description: 'Ultra-lightweight model designed for rapid throughput and cost efficiency.',
    recommendedRole: 'Fast conversational assistant and line-item categorization fallback.',
    isStable: true,
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    tier: 'reasoning',
    contextWindow: '2M tokens',
    description: 'Established reasoning model for complex workflows with massive multi-modal context support.',
    recommendedRole: 'Comprehensive backup reasoning model.',
    isStable: true,
  },
};

/**
 * Standard default fallback sequence (cascading priority)
 */
export const DEFAULT_MODEL_CHAIN: string[] = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.5-pro',
];

/**
 * Computes the active multi-model fallback chain from environment variables.
 * Allows runtime overrides via GEMINI_MODEL, GEMINI_FALLBACK_MODELS, or GEMINI_MODELS.
 */
export function getResolvedModelChain(): string[] {
  // 1. Direct explicit chain override
  if (process.env.GEMINI_MODELS) {
    const customList = process.env.GEMINI_MODELS
      .split(',')
      .map(m => m.trim())
      .filter(Boolean);
    if (customList.length > 0) {
      return Array.from(new Set(customList));
    }
  }

  // 2. Primary model + fallback models
  const primary = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
  const fallbacks = (process.env.GEMINI_FALLBACK_MODELS || 'gemini-2.0-flash,gemini-1.5-flash,gemini-2.5-pro')
    .split(',')
    .map(m => m.trim())
    .filter(Boolean);

  const chain = [primary, ...fallbacks];

  // If someone had the legacy typo 'gemini-3.5-flash', map or replace it
  const sanitizedChain = chain.map(m => (m === 'gemini-3.5-flash' ? 'gemini-2.5-flash' : m));

  // Deduplicate preserving order
  return Array.from(new Set(sanitizedChain));
}
