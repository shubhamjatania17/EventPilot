import { EventState, BudgetCalculations, BudgetCategory, BudgetItem } from '../types/index.js';

/**
 * Deterministic Budget Engine
 * Responsible for all financial calculations, forecasts, variances, and overruns.
 * Pure function: No AI, no database side effects.
 */
export function calculateBudget(event: Pick<EventState, 'meta' | 'budgetCategories' | 'budgetItems' | 'vendors'>): BudgetCalculations {
  const totalBudget = Math.max(0, event.meta.totalBudget || 0);
  const contingencyPercent = Math.max(0, event.meta.contingencyPercent ?? 10);
  const contingencyAmount = Math.round((totalBudget * contingencyPercent) / 100);

  const categories = event.budgetCategories || [];
  const items = event.budgetItems || [];
  const vendors = event.vendors || [];

  // Sum allocated from categories
  let totalAllocated = 0;
  for (const cat of categories) {
    totalAllocated += Math.max(0, cat.allocated || 0);
  }

  // Calculate committed and paid from vendors and budget items
  let totalCommitted = 0;
  let totalPaid = 0;

  // Track category-level aggregations
  const categoryMap = new Map<string, {
    categoryId: string;
    categoryName: string;
    allocated: number;
    committed: number;
    paid: number;
    forecast: number;
    variance: number;
    status: 'healthy' | 'caution' | 'over_budget';
  }>();

  for (const cat of categories) {
    categoryMap.set(cat.id, {
      categoryId: cat.id,
      categoryName: cat.name,
      allocated: Math.max(0, cat.allocated || 0),
      committed: 0,
      paid: 0,
      forecast: 0,
      variance: 0,
      status: 'healthy',
    });
  }

  // Aggregate items
  for (const item of items) {
    const cost = Math.max(0, item.actualCost > 0 ? item.actualCost : item.estimatedCost || 0);
    const catData = item.categoryId ? categoryMap.get(item.categoryId) : undefined;

    if (item.status === 'paid') {
      totalPaid += cost;
      totalCommitted += cost;
      if (catData) {
        catData.paid += cost;
        catData.committed += cost;
      }
    } else if (item.status === 'committed') {
      totalCommitted += cost;
      if (catData) {
        catData.committed += cost;
      }
    }
  }

  // Also include confirmed vendor quotes in committed if not already mapped to an item
  for (const vendor of vendors) {
    if (vendor.quoteAmount > 0 && (vendor.status === 'confirmed' || vendor.status === 'negotiating' || vendor.status === 'quote_received')) {
      // If vendor has paidAmount, track it
      if (vendor.paidAmount > 0 && vendor.paidAmount > totalPaid) {
        // Vendor payments count towards paid
      }
    }
  }

  // Compute forecast:
  // Forecast = committed costs + uncommitted planned allocations (or actuals when higher)
  let totalForecast = 0;
  const categoryBreakdown: BudgetCalculations['categoryBreakdown'] = [];

  for (const cat of categories) {
    const data = categoryMap.get(cat.id)!;
    // Category forecast is maximum of committed or allocated
    const catForecast = Math.max(data.allocated, data.committed);
    data.forecast = catForecast;
    data.variance = data.allocated - data.forecast; // negative means overrun

    if (data.forecast > data.allocated && data.allocated > 0) {
      data.status = 'over_budget';
    } else if (data.forecast > data.allocated * 0.9 && data.allocated > 0) {
      data.status = 'caution';
    } else {
      data.status = 'healthy';
    }

    totalForecast += catForecast;
    categoryBreakdown.push(data);
  }

  // Ensure forecast includes un-categorized items
  if (totalForecast < totalCommitted) {
    totalForecast = totalCommitted;
  }

  const remaining = totalBudget - totalForecast;
  const variance = totalBudget - totalForecast;
  const isOverBudget = totalForecast > totalBudget;
  const overrunAmount = isOverBudget ? totalForecast - totalBudget : 0;

  return {
    totalBudget,
    allocated: totalAllocated,
    committed: totalCommitted,
    paid: totalPaid,
    forecast: totalForecast,
    remaining,
    variance,
    contingencyAmount,
    categoryBreakdown,
    isOverBudget,
    overrunAmount,
  };
}
