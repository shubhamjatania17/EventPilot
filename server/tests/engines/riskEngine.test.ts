import { describe, it, expect } from 'vitest';
import { evaluateRisks } from '../../src/engines/riskEngine.js';
import { EventState } from '../../src/types/index.js';

describe('Deterministic Risk Engine', () => {
  it('triggers critical budget overrun risk when forecast exceeds budget', () => {
    const event = {
      meta: {
        totalBudget: 500000,
        guestCount: 100,
      },
      budgetCategories: [
        { id: 'c-1', name: 'Venue', allocated: 400000, committed: 600000, paid: 100000 },
      ],
      budgetItems: [
        { id: 'i-1', categoryId: 'c-1', title: 'Venue', estimatedCost: 600000, actualCost: 600000, status: 'committed' },
      ],
      tasks: [],
      vendors: [],
      risks: [],
    } as unknown as EventState;

    const risks = evaluateRisks(event);
    const budgetRisk = risks.find(r => r.category === 'budget' && r.severity === 'critical');

    expect(budgetRisk).toBeDefined();
    expect(budgetRisk?.title).toContain('Budget Overrun of ₹1,00,000');
  });

  it('triggers capacity overflow risk when guest count exceeds venue capacity', () => {
    const event = {
      meta: {
        totalBudget: 500000,
        guestCount: 250,
        venueCapacity: 200,
        date: '2026-12-01',
      },
      budgetCategories: [],
      budgetItems: [],
      tasks: [],
      vendors: [],
      risks: [],
    } as unknown as EventState;

    const risks = evaluateRisks(event);
    const capacityRisk = risks.find(r => r.category === 'capacity');

    expect(capacityRisk).toBeDefined();
    expect(capacityRisk?.triggerReason).toContain('exceeds registered venue capacity (200) by 50 people');
  });

  it('triggers critical schedule risk when a task on critical path is overdue', () => {
    const event = {
      meta: {
        totalBudget: 500000,
        guestCount: 50,
        date: '2026-12-01',
      },
      budgetCategories: [],
      budgetItems: [],
      tasks: [
        {
          id: 't-critical',
          title: 'Mandap Approval',
          dueDate: '2025-01-01', // Clearly in past
          status: 'todo',
          priority: 'critical',
          dependencies: [],
        },
      ],
      vendors: [],
      risks: [],
    } as unknown as EventState;

    const risks = evaluateRisks(event);
    const timelineRisk = risks.find(r => r.category === 'timeline' && r.severity === 'critical');

    expect(timelineRisk).toBeDefined();
    expect(timelineRisk?.title).toContain('Overdue Task(s) on Critical Path');
  });
});
