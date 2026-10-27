import { EventState, ImpactSimulation, Task, Vendor, Risk } from '../types';
import { calculateBudget } from './budgetEngine';

export function simulateGuestCountChange(
  event: EventState,
  newGuestCount: number
): ImpactSimulation {
  const originalGuestCount = event.meta.guestCount || 0;
  const guestDelta = newGuestCount - originalGuestCount;

  const cateringCostPerGuest = event.meta.cateringCostPerGuest && event.meta.cateringCostPerGuest > 0
    ? event.meta.cateringCostPerGuest
    : 1800;

  const cateringDelta = guestDelta * cateringCostPerGuest;

  const currentBudget = calculateBudget(event);
  const originalForecast = currentBudget.forecast;
  const newForecast = originalForecast + cateringDelta;
  const originalRemaining = currentBudget.remaining;
  const newRemaining = currentBudget.totalBudget - newForecast;
  const exceedsBudget = newForecast > currentBudget.totalBudget;
  const overrunAmount = exceedsBudget ? newForecast - currentBudget.totalBudget : 0;

  const venueCapacity = event.meta.venueCapacity || Infinity;
  let capacityWarning: string | undefined;
  if (newGuestCount > venueCapacity && isFinite(venueCapacity)) {
    capacityWarning = `New guest count (${newGuestCount}) exceeds venue limit of ${venueCapacity} by ${newGuestCount - venueCapacity} guests!`;
  }

  const taskKeywords = ['catering', 'food', 'seat', 'table', 'invitation', 'guest', 'venue', 'rsvp'];
  const affectedTasks: Task[] = (event.tasks || []).filter(t => 
    taskKeywords.some(kw => t.title.toLowerCase().includes(kw) || (t.description || '').toLowerCase().includes(kw))
  );

  const vendorKeywords = ['catering', 'food', 'venue', 'decor', 'rental'];
  const affectedVendors: Vendor[] = (event.vendors || []).filter(v =>
    vendorKeywords.some(kw => v.category.toLowerCase().includes(kw) || v.name.toLowerCase().includes(kw))
  );

  const newRisks: Partial<Risk>[] = [];
  if (exceedsBudget) {
    newRisks.push({
      title: `Projected Budget Overrun: ₹${overrunAmount.toLocaleString('en-IN')}`,
      category: 'budget',
      severity: 'critical',
      triggerReason: `Adding ${guestDelta} guests increases catering by ₹${cateringDelta.toLocaleString('en-IN')}, exceeding total budget.`,
      mitigationPlan: 'Ask EventPilot for trade-off suggestions to keep below budget.',
    });
  }

  if (capacityWarning) {
    newRisks.push({
      title: 'Venue Capacity Overflow',
      category: 'capacity',
      severity: 'high',
      triggerReason: capacityWarning,
      mitigationPlan: 'Explore additional seating zone or adjust invitation tiers.',
    });
  }

  return {
    originalGuestCount,
    newGuestCount,
    guestDelta,
    cateringDelta,
    originalForecast,
    newForecast,
    forecastDelta: cateringDelta,
    originalRemaining,
    newRemaining,
    exceedsBudget,
    overrunAmount,
    capacityWarning,
    affectedTasks,
    affectedVendors,
    newRisks,
  };
}
