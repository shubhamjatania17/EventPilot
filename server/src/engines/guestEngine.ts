import { Guest } from '../types/index.js';

export interface GuestCalculations {
  totalInvitedGuests: number;
  confirmedGuests: number;
  confirmedAdults: number;
  confirmedChildren: number;
  declinedGuests: number;
  pendingGuests: number;
  accommodationRequiredCount: number;
  transportRequiredCount: number;
  cateringHeadcount: number;
  cateringCost: number;
  isCapacityExceeded: boolean;
  capacityVariance: number; // positive = seats available, negative = overflow
}

/**
 * Deterministic Guest Engine
 * Aggregates headcount, RSVP rates, accommodation/transport requirements, and catering cost.
 */
export function calculateGuestMetrics(
  guests: Guest[],
  cateringCostPerGuest: number = 0,
  venueCapacity?: number
): GuestCalculations {
  let totalInvited = 0;
  let confirmedGuests = 0;
  let confirmedAdults = 0;
  let confirmedChildren = 0;
  let declinedGuests = 0;
  let pendingGuests = 0;
  let accommodationRequiredCount = 0;
  let transportRequiredCount = 0;

  for (const g of guests) {
    const headCount = Math.max(1, (g.adults || 0) + (g.children || 0));
    totalInvited += headCount;

    if (g.rsvp === 'attending') {
      confirmedGuests += headCount;
      confirmedAdults += Math.max(0, g.adults || 0);
      confirmedChildren += Math.max(0, g.children || 0);

      if (g.accommodationNeeded) accommodationRequiredCount += headCount;
      if (g.transportNeeded) transportRequiredCount += headCount;
    } else if (g.rsvp === 'declined') {
      declinedGuests += headCount;
    } else {
      pendingGuests += headCount;
    }
  }

  // If no RSVPs yet, assume total invited for catering estimate; otherwise use confirmed + 50% of pending
  const cateringHeadcount = confirmedGuests > 0 ? confirmedGuests : totalInvited;
  const cateringCost = cateringHeadcount * Math.max(0, cateringCostPerGuest);

  const capacity = venueCapacity && venueCapacity > 0 ? venueCapacity : Infinity;
  const isCapacityExceeded = cateringHeadcount > capacity;
  const capacityVariance = isFinite(capacity) ? capacity - cateringHeadcount : 0;

  return {
    totalInvitedGuests: totalInvited,
    confirmedGuests,
    confirmedAdults,
    confirmedChildren,
    declinedGuests,
    pendingGuests,
    accommodationRequiredCount,
    transportRequiredCount,
    cateringHeadcount,
    cateringCost,
    isCapacityExceeded,
    capacityVariance,
  };
}
