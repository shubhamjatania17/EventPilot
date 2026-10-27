import { EventState, Risk } from '../types/index.js';
import { calculateBudget } from './budgetEngine.js';
import { calculateTimeline } from './timelineEngine.js';

/**
 * Deterministic Risk Engine
 * Evaluates rule-based risks across budget, schedule, vendors, and capacity.
 */
export function evaluateRisks(event: EventState): Risk[] {
  const risks: Risk[] = [];
  const budget = calculateBudget(event);
  const timeline = calculateTimeline(event);
  const venueCapacity = event.meta.venueCapacity || Infinity;
  const currentGuests = event.meta.guestCount || 0;

  // 1. Critical Financial Risk
  if (budget.isOverBudget) {
    risks.push({
      id: 'risk-budget-overrun',
      title: `Budget Overrun of ₹${budget.overrunAmount.toLocaleString('en-IN')}`,
      category: 'budget',
      severity: 'critical',
      status: 'open',
      triggerReason: `Projected forecast (₹${budget.forecast.toLocaleString('en-IN')}) exceeds total allocated budget (₹${budget.totalBudget.toLocaleString('en-IN')}).`,
      mitigationPlan: 'Reduce non-essential budget categories or renegotiate vendor contracts.',
      impactScore: 10,
    });
  } else if (budget.forecast > budget.totalBudget * 0.95 && budget.totalBudget > 0) {
    risks.push({
      id: 'risk-budget-contingency-low',
      title: 'Contingency Margin Exhausted',
      category: 'budget',
      severity: 'high',
      status: 'open',
      triggerReason: `Projected spend is at ${Math.round((budget.forecast / budget.totalBudget) * 100)}% of total budget.`,
      mitigationPlan: 'Protect contingency reserves by freezing new commitments.',
      impactScore: 7,
    });
  }

  // 2. Timeline & Critical Path Risks
  if (timeline.hasCircularDependency) {
    risks.push({
      id: 'risk-circular-dependency',
      title: 'Circular Task Dependency Detected',
      category: 'timeline',
      severity: 'critical',
      status: 'open',
      triggerReason: 'Two or more tasks depend on each other, preventing milestone completion.',
      mitigationPlan: 'Break the circular loop by removing one of the dependent edges.',
      impactScore: 9,
    });
  }

  const criticalOverdue = timeline.overdueTasks.filter(t => timeline.criticalPath.includes(t.id));
  if (criticalOverdue.length > 0) {
    risks.push({
      id: 'risk-critical-path-overdue',
      title: `${criticalOverdue.length} Overdue Task(s) on Critical Path`,
      category: 'timeline',
      severity: 'critical',
      status: 'open',
      triggerReason: `Overdue tasks: ${criticalOverdue.map(t => t.title).join(', ')}.`,
      mitigationPlan: 'Reallocate task owners or expedite immediately to prevent delaying the event date.',
      impactScore: 9,
    });
  } else if (timeline.overdueTasks.length > 0) {
    risks.push({
      id: 'risk-general-overdue',
      title: `${timeline.overdueTasks.length} Overdue Task(s)`,
      category: 'timeline',
      severity: 'medium',
      status: 'open',
      triggerReason: `Tasks past due: ${timeline.overdueTasks.slice(0, 3).map(t => t.title).join(', ')}${timeline.overdueTasks.length > 3 ? '...' : ''}.`,
      mitigationPlan: 'Review deadlines and update target dates.',
      impactScore: 5,
    });
  }

  // 3. Vendor Risks
  const keyCategories = ['venue', 'catering', 'photography', 'sound'];
  const vendors = event.vendors || [];
  for (const v of vendors) {
    const isKey = keyCategories.some(c => v.category.toLowerCase().includes(c));
    if (isKey && timeline.daysRemaining < 30 && v.status !== 'confirmed') {
      risks.push({
        id: `risk-vendor-${v.id}`,
        title: `Unconfirmed Key Vendor: ${v.name} (${v.category})`,
        category: 'vendor',
        severity: timeline.daysRemaining < 14 ? 'critical' : 'high',
        status: 'open',
        triggerReason: `Event is in ${timeline.daysRemaining} days, but vendor status is "${v.status}".`,
        mitigationPlan: `Follow up urgently to sign contract or contact backup vendor in ${v.category}.`,
        impactScore: 8,
      });
    }
  }

  // 4. Capacity Risks
  if (currentGuests > venueCapacity && isFinite(venueCapacity)) {
    risks.push({
      id: 'risk-capacity-overflow',
      title: 'Guest Count Exceeds Venue Capacity',
      category: 'capacity',
      severity: 'high',
      status: 'open',
      triggerReason: `Current guest count (${currentGuests}) exceeds registered venue capacity (${venueCapacity}) by ${currentGuests - venueCapacity} people.`,
      mitigationPlan: 'Arrange additional seating zone or cap pending RSVP acceptances.',
      impactScore: 8,
    });
  }

  // Merge with any manual user-defined risks not covered by rules
  const ruleRiskIds = new Set(risks.map(r => r.id));
  const userRisks = (event.risks || []).filter(r => !ruleRiskIds.has(r.id));

  return [...risks, ...userRisks];
}
