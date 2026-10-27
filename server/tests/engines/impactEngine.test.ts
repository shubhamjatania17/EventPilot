import { describe, it, expect } from 'vitest';
import { simulateGuestCountChange } from '../../src/engines/impactEngine.js';
import { getSampleEvent } from '../../src/data/sampleEvent.js';
import { EventState } from '../../src/types/index.js';

describe('Deterministic Impact Engine (Hero What-If Flow)', () => {
  it('calculates numeric consequences of increasing guests from 180 to 220', () => {
    const sample = getSampleEvent() as unknown as EventState;
    sample.id = 'sample-1';

    // Base state: 180 guests, ₹800,000 budget, venue capacity 200, catering ₹1,800/pax
    const simulation = simulateGuestCountChange(sample, 220);

    expect(simulation.originalGuestCount).toBe(180);
    expect(simulation.newGuestCount).toBe(220);
    expect(simulation.guestDelta).toBe(40);

    // 40 guests * ₹1,800 = ₹72,000
    expect(simulation.cateringDelta).toBe(72000);
    expect(simulation.forecastDelta).toBe(72000);

    // New forecast exceeds total budget (800,000 + 72,000 = 872,000 > 800,000)
    expect(simulation.exceedsBudget).toBe(true);
    expect(simulation.overrunAmount).toBe(72000);

    // Venue capacity is 200, so 220 exceeds by 20 guests
    expect(simulation.capacityWarning).toBeDefined();
    expect(simulation.capacityWarning).toContain('exceeds venue limit of 200 by 20 guests');

    // Generates simulated risk entries
    expect(simulation.newRisks.length).toBeGreaterThanOrEqual(2);
    expect(simulation.newRisks.some(r => r.category === 'budget')).toBe(true);
    expect(simulation.newRisks.some(r => r.category === 'capacity')).toBe(true);
  });

  it('handles guest count reduction with positive budget savings', () => {
    const sample = getSampleEvent() as unknown as EventState;
    sample.id = 'sample-1';

    const simulation = simulateGuestCountChange(sample, 150);

    expect(simulation.guestDelta).toBe(-30);
    expect(simulation.cateringDelta).toBe(-54000); // -30 * 1800
    expect(simulation.exceedsBudget).toBe(false);
    expect(simulation.overrunAmount).toBe(0);
    expect(simulation.capacityWarning).toBeUndefined();
  });
});
