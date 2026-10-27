import { EventState, ImpactSimulation, Task, Vendor, Risk } from '../types/index.js';
import { calculateBudget } from './budgetEngine.js';

/**
 * Deterministic Impact Engine
 * Models what-if ripples:
 * Guest Count -> Catering Delta -> Budget Forecast -> Overrun & Capacity Risks
 */
export function simulateGuestCountChange(
  event: EventState,
  newGuestCount: number
): ImpactSimulation {
  const originalGuestCount = event.meta.guestCount || 0;
  const guestDelta = newGuestCount - originalGuestCount;

  // Catering cost per guest: default to ₹1,500 if not set
  const cateringCostPerGuest = event.meta.cateringCostPerGuest && event.meta.cateringCostPerGuest > 0
    ? event.meta.cateringCostPerGuest
    : 1500;

  const cateringDelta = guestDelta * cateringCostPerGuest;

  const currentBudget = calculateBudget(event);
  const originalForecast = currentBudget.forecast;
  const newForecast = originalForecast + cateringDelta;
  const originalRemaining = currentBudget.remaining;
  const newRemaining = currentBudget.totalBudget - newForecast;
  const exceedsBudget = newForecast > currentBudget.totalBudget;
  const overrunAmount = exceedsBudget ? newForecast - currentBudget.totalBudget : 0;

  // Check venue capacity
  const venueCapacity = event.meta.venueCapacity || Infinity;
  let capacityWarning: string | undefined;
  if (newGuestCount > venueCapacity && isFinite(venueCapacity)) {
    capacityWarning = `New guest count (${newGuestCount}) exceeds venue limit of ${venueCapacity} by ${newGuestCount - venueCapacity} guests!`;
  }

  // Find affected tasks (catering, seating, invitations)
  const taskKeywords = ['catering', 'food', 'seat', 'table', 'invitation', 'guest', 'venue', 'rsvp'];
  const affectedTasks: Task[] = (event.tasks || []).filter(t => 
    taskKeywords.some(kw => t.title.toLowerCase().includes(kw) || (t.description || '').toLowerCase().includes(kw))
  );

  // Find affected vendors (catering, venue, rentals)
  const vendorKeywords = ['catering', 'food', 'venue', 'decor', 'rental'];
  const affectedVendors: Vendor[] = (event.vendors || []).filter(v =>
    vendorKeywords.some(kw => v.category.toLowerCase().includes(kw) || v.name.toLowerCase().includes(kw))
  );

  // New simulated risks
  const newRisks: Partial<Risk>[] = [];
  if (exceedsBudget) {
    newRisks.push({
      title: `Projected Budget Overrun: ₹${overrunAmount.toLocaleString('en-IN')}`,
      category: 'budget',
      severity: 'critical',
      triggerReason: `Adding ${guestDelta} guests increases catering by ₹${cateringDelta.toLocaleString('en-IN')}, exceeding total budget.`,
      mitigationPlan: 'Ask EventPilot for trade-off suggestions (e.g. trim decor or entertainment) to keep below budget.',
    });
  }

  if (capacityWarning) {
    newRisks.push({
      title: 'Venue Capacity Overflow',
      category: 'capacity',
      severity: 'high',
      triggerReason: capacityWarning,
      mitigationPlan: 'Explore adjacent hall expansion or adjust invitation tiers.',
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
