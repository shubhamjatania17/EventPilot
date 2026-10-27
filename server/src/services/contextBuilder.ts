import { EventState } from '../types/index.js';
import { calculateBudget } from '../engines/budgetEngine.js';
import { calculateTimeline } from '../engines/timelineEngine.js';
import { evaluateRisks } from '../engines/riskEngine.js';

export type ContextScope = 'overview' | 'budget' | 'timeline' | 'vendor' | 'tradeoff' | 'chat';

/**
 * Compact, deterministic EventContext builder for Gemini calls.
 * Ensures the LLM only receives relevant, token-efficient, verified state.
 */
export function buildEventContext(event: EventState, scope: ContextScope, extraContext?: Record<string, unknown>) {
  const budget = calculateBudget(event);
  const timeline = calculateTimeline(event);
  const risks = evaluateRisks(event);

  const baseMeta = {
    eventName: event.meta.name,
    eventType: event.meta.type,
    location: event.meta.location,
    date: event.meta.date,
    daysRemaining: timeline.daysRemaining,
    guestCount: event.meta.guestCount,
    totalBudget: budget.totalBudget,
    forecast: budget.forecast,
    remaining: budget.remaining,
    isOverBudget: budget.isOverBudget,
    priorities: event.meta.priorities || [],
  };

  switch (scope) {
    case 'tradeoff':
      return {
        event: baseMeta,
        budgetCategories: budget.categoryBreakdown.map(c => ({
          name: c.categoryName,
          allocated: c.allocated,
          committed: c.committed,
          forecast: c.forecast,
          status: c.status,
        })),
        topRisks: risks.slice(0, 3).map(r => ({ title: r.title, severity: r.severity })),
        simulation: extraContext?.simulation,
        userQuery: extraContext?.userQuery,
      };

    case 'budget':
      return {
        event: baseMeta,
        budgetSummary: {
          total: budget.totalBudget,
          committed: budget.committed,
          forecast: budget.forecast,
          remaining: budget.remaining,
          variance: budget.variance,
        },
        categories: budget.categoryBreakdown,
        budgetRisks: risks.filter(r => r.category === 'budget'),
      };

    case 'timeline':
      return {
        event: baseMeta,
        daysRemaining: timeline.daysRemaining,
        overdueTasks: timeline.overdueTasks.map(t => ({ id: t.id, title: t.title, dueDate: t.dueDate, priority: t.priority })),
        criticalPath: timeline.criticalPath,
        blockedTasksCount: timeline.blockedTasks.length,
      };

    case 'vendor':
      return {
        event: baseMeta,
        vendors: (event.vendors || []).map(v => ({
          name: v.name,
          category: v.category,
          status: v.status,
          quoteAmount: v.quoteAmount,
        })),
        vendorRisks: risks.filter(r => r.category === 'vendor'),
      };

    case 'overview':
    case 'chat':
    default:
      return {
        event: baseMeta,
        criticalIssues: risks.filter(r => r.severity === 'critical' || r.severity === 'high').map(r => r.title),
        upcomingMilestones: (event.milestones || []).filter(m => !m.completed).slice(0, 3),
        overdueTasksCount: timeline.overdueTasks.length,
        userQuery: extraContext?.userQuery,
      };
  }
}
