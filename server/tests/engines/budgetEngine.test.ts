import { describe, it, expect } from 'vitest';
import { calculateBudget } from '../../src/engines/budgetEngine.js';

describe('Deterministic Budget Engine', () => {
  it('calculates remaining budget and contingency correctly', () => {
    const mockEvent = {
      meta: {
        totalBudget: 800000,
        contingencyPercent: 10,
      },
      budgetCategories: [
        { id: 'cat-venue', name: 'Venue', allocated: 250000, committed: 250000, paid: 100000 },
        { id: 'cat-catering', name: 'Catering', allocated: 324000, committed: 324000, paid: 100000 },
      ],
      budgetItems: [],
      vendors: [],
    } as any;

    const result = calculateBudget(mockEvent);

    expect(result.totalBudget).toBe(800000);
    expect(result.contingencyAmount).toBe(80000);
    expect(result.committed).toBe(0); // Items empty, category forecast handles committed
    expect(result.forecast).toBe(574000); // 250000 + 324000
    expect(result.remaining).toBe(226000); // 800000 - 574000
    expect(result.isOverBudget).toBe(false);
    expect(result.overrunAmount).toBe(0);
  });

  it('detects budget overrun accurately', () => {
    const mockEvent = {
      meta: {
        totalBudget: 500000,
        contingencyPercent: 10,
      },
      budgetCategories: [
        { id: 'cat-1', name: 'Venue', allocated: 300000, committed: 350000, paid: 200000 },
        { id: 'cat-2', name: 'Catering', allocated: 250000, committed: 260000, paid: 100000 },
      ],
      budgetItems: [
        { id: 'item-1', categoryId: 'cat-1', title: 'Decor Upgrade', estimatedCost: 350000, actualCost: 350000, status: 'committed' },
        { id: 'item-2', categoryId: 'cat-2', title: 'Dinner', estimatedCost: 260000, actualCost: 260000, status: 'committed' },
      ],
      vendors: [],
    } as any;

    const result = calculateBudget(mockEvent);

    expect(result.forecast).toBe(610000);
    expect(result.isOverBudget).toBe(true);
    expect(result.overrunAmount).toBe(110000);
    expect(result.remaining).toBe(-110000);
  });

  it('handles zero budget safely without NaN or crash', () => {
    const mockEvent = {
      meta: {
        totalBudget: 0,
      },
      budgetCategories: [],
      budgetItems: [],
      vendors: [],
    } as any;

    const result = calculateBudget(mockEvent);

    expect(result.totalBudget).toBe(0);
    expect(result.forecast).toBe(0);
    expect(result.remaining).toBe(0);
    expect(result.isOverBudget).toBe(false);
  });

  it('flags category status as caution when approaching 90% allocation', () => {
    const mockEvent = {
      meta: {
        totalBudget: 100000,
      },
      budgetCategories: [
        { id: 'cat-1', name: 'Photography', allocated: 50000, committed: 46000, paid: 0 },
      ],
      budgetItems: [
        { id: 'item-1', categoryId: 'cat-1', title: 'Photo Package', estimatedCost: 46000, actualCost: 46000, status: 'committed' },
      ],
      vendors: [],
    } as any;

    const result = calculateBudget(mockEvent);
    expect(result.categoryBreakdown[0].status).toBe('caution');
  });
});
