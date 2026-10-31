import { EventState, EventMeta, BudgetCategory, Task, Milestone, EventDayItem, Risk } from '../types';

export interface NewEventFormData {
  name: string;
  type: string;
  date: string;
  location: string;
  guestCount: number;
  venueCapacity?: number;
  totalBudget: number;
  contingencyPercent: number;
  theme?: string;
  priorities?: string[];
  // Type-specific
  coupleNames?: string;
  weddingStyle?: string;
  cateringStyle?: string;
  cateringCostPerGuest?: number;
  celebrantName?: string;
  celebrantAge?: number | string;
  birthdayTheme?: string;
  partyHighlights?: string[];
  selectedHighlights?: string[];
  companyName?: string;
  eventFormat?: string;
  techNeeds?: string[];
  selectedTechNeeds?: string[];
  targetOutcome?: string;
  stallsCount?: number;
  venueNature?: string;
  safetyNeeds?: string[];
  selectedSafetyNeeds?: string[];
  notes?: string;
}

export function buildEventFromConfig(config: NewEventFormData, userId: string = 'user'): Partial<EventState> {
  const budget = Number(config.totalBudget) || 500000;
  const guestCount = Number(config.guestCount) || 100;
  const contingencyPct = Number(config.contingencyPercent) || 10;
  const contingencyAmt = Math.round((budget * contingencyPct) / 100);
  const effectiveSpendable = budget - contingencyAmt;

  const eventDateObj = new Date(config.date || Date.now() + 60 * 24 * 60 * 60 * 1000);
  const targetDateStr = eventDateObj.toISOString().split('T')[0];

  function daysBefore(days: number): string {
    const d = new Date(eventDateObj);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  }

  let categories: BudgetCategory[] = [];
  let tasks: Task[] = [];
  let milestones: Milestone[] = [];
  let schedule: EventDayItem[] = [];
  let starterRisks: Risk[] = [];

  const type = config.type.toLowerCase();

  if (type === 'wedding') {
    const venueAmt = Math.round(effectiveSpendable * 0.32);
    const cateringAmt = Math.round(effectiveSpendable * 0.38);
    const decorAmt = Math.round(effectiveSpendable * 0.12);
    const photoAmt = Math.round(effectiveSpendable * 0.10);
    const musicAmt = Math.round(effectiveSpendable * 0.08);

    categories = [
      { id: 'cat-venue', name: 'Venue & Banquet Hall', allocated: venueAmt, committed: 0, paid: 0, color: '#3B82F6' },
      { id: 'cat-catering', name: 'Catering & Dining', allocated: cateringAmt, committed: 0, paid: 0, color: '#10B981' },
      { id: 'cat-decor', name: 'Mandap, Florals & Stage Decor', allocated: decorAmt, committed: 0, paid: 0, color: '#F59E0B' },
      { id: 'cat-photo', name: 'Cinematography & Photography', allocated: photoAmt, committed: 0, paid: 0, color: '#8B5CF6' },
      { id: 'cat-music', name: 'Music, Sound & DJ Troupe', allocated: musicAmt, committed: 0, paid: 0, color: '#EC4899' },
      { id: 'cat-contingency', name: 'Contingency Reserve', allocated: contingencyAmt, committed: 0, paid: 0, color: '#6B7280' },
    ];

    tasks = [
      { id: 'task-1', title: 'Confirm & Sign Venue Contract with Deposit', dueDate: daysBefore(45), status: 'todo', priority: 'critical', owner: 'Family / Host', dependencies: [] },
      { id: 'task-2', title: 'Curate Tasting Session & Lock Feast Menu', dueDate: daysBefore(30), status: 'todo', priority: 'high', owner: 'Host', dependencies: ['task-1'] },
      { id: 'task-3', title: 'Finalize Mandap Floral Design & Light Blueprint', dueDate: daysBefore(25), status: 'todo', priority: 'high', owner: 'Decor Lead', dependencies: ['task-1'] },
      { id: 'task-4', title: 'Lock Photo/Video Shot List & Ceremonial Moments', dueDate: daysBefore(15), status: 'todo', priority: 'medium', owner: 'Couple', dependencies: [] },
      { id: 'task-5', title: 'Final RSVP Headcount Lock with Caterer', dueDate: daysBefore(7), status: 'todo', priority: 'critical', owner: 'Coordinator', dependencies: ['task-2'] },
      { id: 'task-6', title: 'Full Sound Check & Rehearsal with Family', dueDate: daysBefore(2), status: 'todo', priority: 'high', owner: 'Coordinator', dependencies: ['task-5'] },
    ];

    milestones = [
      { id: 'ms-1', title: 'Venue Booking Sealed', targetDate: daysBefore(45), completed: false, relatedTaskId: 'task-1' },
      { id: 'ms-2', title: 'Catering Menu Locked', targetDate: daysBefore(30), completed: false, relatedTaskId: 'task-2' },
      { id: 'ms-3', title: 'Final Guest Count Dispatched', targetDate: daysBefore(7), completed: false, relatedTaskId: 'task-5' },
    ];

    schedule = [
      { id: 'sched-1', time: '09:00', title: 'Mandap & Audio Setup Inspection', responsiblePerson: 'Coordinator', status: 'upcoming', notes: 'Check sound levels and power backup' },
      { id: 'sched-2', time: '11:30', title: 'Baraat & Ceremonial Welcome', responsiblePerson: 'Family Lead', status: 'upcoming', notes: 'Dhol & floral welcome' },
      { id: 'sched-3', time: '13:00', title: 'Wedding Rituals / Vows Exchange', responsiblePerson: 'Couple & Priest', status: 'upcoming', notes: 'Center stage ceremony' },
      { id: 'sched-4', time: '14:30', title: 'Royal Feast & Banquet Dining', responsiblePerson: 'Caterer Lead', status: 'upcoming', notes: 'Open dining counters' },
      { id: 'sched-5', time: '19:00', title: 'Evening Reception & Live Music', responsiblePerson: 'DJ / MC', status: 'upcoming', notes: 'Stage photography and felicitation' },
    ];
  } else if (type === 'birthday') {
    const venueAmt = Math.round(effectiveSpendable * 0.35);
    const foodAmt = Math.round(effectiveSpendable * 0.35);
    const cakeAmt = Math.round(effectiveSpendable * 0.10);
    const decorAmt = Math.round(effectiveSpendable * 0.12);
    const favorsAmt = Math.round(effectiveSpendable * 0.08);

    categories = [
      { id: 'cat-venue', name: 'Venue / Lounge Reservation', allocated: venueAmt, committed: 0, paid: 0, color: '#3B82F6' },
      { id: 'cat-food', name: 'Food, Cocktails & Beverages', allocated: foodAmt, committed: 0, paid: 0, color: '#10B981' },
      { id: 'cat-cake', name: 'Custom Fondant Cake & Dessert Bar', allocated: cakeAmt, committed: 0, paid: 0, color: '#EC4899' },
      { id: 'cat-decor', name: 'Theme Balloon Arch & Photobooth', allocated: decorAmt, committed: 0, paid: 0, color: '#F59E0B' },
      { id: 'cat-favors', name: 'DJ Sound, Favors & Hampers', allocated: favorsAmt, committed: 0, paid: 0, color: '#8B5CF6' },
      { id: 'cat-contingency', name: 'Contingency Reserve', allocated: contingencyAmt, committed: 0, paid: 0, color: '#6B7280' },
    ];

    tasks = [
      { id: 'task-1', title: 'Reserve Lounge / Party Lawn & Pay Token', dueDate: daysBefore(20), status: 'todo', priority: 'critical', owner: 'Organizer', dependencies: [] },
      { id: 'task-2', title: 'Order Signature 3-Tier Theme Birthday Cake', dueDate: daysBefore(12), status: 'todo', priority: 'high', owner: 'Organizer', dependencies: [] },
      { id: 'task-3', title: 'Book DJ & Coordinate Party Playlist', dueDate: daysBefore(10), status: 'todo', priority: 'medium', owner: 'Organizer', dependencies: ['task-1'] },
      { id: 'task-4', title: 'Finalize Themed Photo Corner & Props', dueDate: daysBefore(7), status: 'todo', priority: 'medium', owner: 'Decor Team', dependencies: ['task-1'] },
      { id: 'task-5', title: 'Confirm Final RSVP Headcount for Catering', dueDate: daysBefore(4), status: 'todo', priority: 'critical', owner: 'Organizer', dependencies: [] },
    ];

    milestones = [
      { id: 'ms-1', title: 'Party Venue Confirmed', targetDate: daysBefore(20), completed: false, relatedTaskId: 'task-1' },
      { id: 'ms-2', title: 'Signature Cake Booked', targetDate: daysBefore(12), completed: false, relatedTaskId: 'task-2' },
      { id: 'ms-3', title: 'Guest List RSVP Locked', targetDate: daysBefore(4), completed: false, relatedTaskId: 'task-5' },
    ];

    schedule = [
      { id: 'sched-1', time: '17:00', title: 'Decor & Balloon Installation', responsiblePerson: 'Decorator', status: 'upcoming', notes: 'Photobooth and lighting setup' },
      { id: 'sched-2', time: '18:30', title: 'Cake Delivery & Temperature Check', responsiblePerson: 'Organizer', status: 'upcoming', notes: 'Place on centerpiece table' },
      { id: 'sched-3', time: '19:30', title: 'Guest Arrivals & Welcome Drinks', responsiblePerson: 'Host', status: 'upcoming', notes: 'Appetizers circulating' },
      { id: 'sched-4', time: '20:30', title: 'Grand Cake Cutting & Toast', responsiblePerson: 'Celebrant', status: 'upcoming', notes: 'Spotlight and birthday anthem' },
      { id: 'sched-5', time: '21:00', title: 'Dinner Buffet & DJ Dance Floor', responsiblePerson: 'DJ', status: 'upcoming', notes: 'Party music and dance floor open' },
    ];
  } else if (type === 'corporate') {
    const venueAmt = Math.round(effectiveSpendable * 0.35);
    const avAmt = Math.round(effectiveSpendable * 0.25);
    const cateringAmt = Math.round(effectiveSpendable * 0.25);
    const badgeAmt = Math.round(effectiveSpendable * 0.10);
    const giftsAmt = Math.round(effectiveSpendable * 0.05);

    categories = [
      { id: 'cat-venue', name: 'Conference Center / Ballroom', allocated: venueAmt, committed: 0, paid: 0, color: '#3B82F6' },
      { id: 'cat-av', name: 'LED Video Wall & Streaming Tech', allocated: avAmt, committed: 0, paid: 0, color: '#8B5CF6' },
      { id: 'cat-catering', name: 'Executive Catering & High Tea', allocated: cateringAmt, committed: 0, paid: 0, color: '#10B981' },
      { id: 'cat-branding', name: 'Stage Backdrops & Badging', allocated: badgeAmt, committed: 0, paid: 0, color: '#F59E0B' },
      { id: 'cat-speakers', name: 'Speaker Logistics & Swag Kits', allocated: giftsAmt, committed: 0, paid: 0, color: '#EC4899' },
      { id: 'cat-contingency', name: 'Contingency Reserve', allocated: contingencyAmt, committed: 0, paid: 0, color: '#6B7280' },
    ];

    tasks = [
      { id: 'task-1', title: 'Lock Convention Hall & Tech Rider Contract', dueDate: daysBefore(40), status: 'todo', priority: 'critical', owner: 'Operations Lead', dependencies: [] },
      { id: 'task-2', title: 'Confirm Keynote Speakers & Run of Show', dueDate: daysBefore(25), status: 'todo', priority: 'critical', owner: 'Program Director', dependencies: [] },
      { id: 'task-3', title: 'Setup Attendee Registration & Badge Printing', dueDate: daysBefore(20), status: 'todo', priority: 'high', owner: 'Marketing Team', dependencies: ['task-1'] },
      { id: 'task-4', title: 'AV Tech Dry-Run & Hybrid Stream Test', dueDate: daysBefore(3), status: 'todo', priority: 'critical', owner: 'AV Lead', dependencies: ['task-1', 'task-2'] },
      { id: 'task-5', title: 'Deliver Swag Kits & Signage Banners to Venue', dueDate: daysBefore(1), status: 'todo', priority: 'high', owner: 'Logistics', dependencies: ['task-3'] },
    ];

    milestones = [
      { id: 'ms-1', title: 'Venue & AV Tech Rider Sealed', targetDate: daysBefore(40), completed: false, relatedTaskId: 'task-1' },
      { id: 'ms-2', title: 'Keynote Speaker Schedule Locked', targetDate: daysBefore(25), completed: false, relatedTaskId: 'task-2' },
      { id: 'ms-3', title: 'AV Stream Technical Rehearsal Complete', targetDate: daysBefore(3), completed: false, relatedTaskId: 'task-4' },
    ];

    schedule = [
      { id: 'sched-1', time: '08:00', title: 'Registration Desk & Badge Pickup Open', responsiblePerson: 'Registration Staff', status: 'upcoming', notes: 'Breakfast & coffee served' },
      { id: 'sched-2', time: '09:30', title: 'Keynote Opening & Leadership Address', responsiblePerson: 'Keynote Speaker', status: 'upcoming', notes: 'Main auditorium LED active' },
      { id: 'sched-3', time: '11:15', title: 'Networking Break & High Tea', responsiblePerson: 'Catering Lead', status: 'upcoming', notes: 'Exhibition hall networking' },
      { id: 'sched-4', time: '12:00', title: 'Panel Discussions & Breakout Tracks', responsiblePerson: 'Track Moderators', status: 'upcoming', notes: 'Auditoriums A & B' },
      { id: 'sched-5', time: '13:30', title: 'Executive Networking Lunch', responsiblePerson: 'Catering Lead', status: 'upcoming', notes: 'Buffet dining hall' },
      { id: 'sched-6', time: '17:00', title: 'Closing Remarks & Awards Gala', responsiblePerson: 'Host / MC', status: 'upcoming', notes: 'Felicitation and evening reception' },
    ];
  } else if (type === 'community') {
    const venueAmt = Math.round(effectiveSpendable * 0.30);
    const stageAmt = Math.round(effectiveSpendable * 0.25);
    const securityAmt = Math.round(effectiveSpendable * 0.20);
    const refreshAmt = Math.round(effectiveSpendable * 0.15);
    const permitAmt = Math.round(effectiveSpendable * 0.10);

    categories = [
      { id: 'cat-ground', name: 'Open Grounds & Canopy Tents', allocated: venueAmt, committed: 0, paid: 0, color: '#3B82F6' },
      { id: 'cat-sound', name: 'Stage, Truss & Sound Amplification', allocated: stageAmt, committed: 0, paid: 0, color: '#8B5CF6' },
      { id: 'cat-security', name: 'Security, First Aid & Crowd Marshals', allocated: securityAmt, committed: 0, paid: 0, color: '#10B981' },
      { id: 'cat-stalls', name: 'Exhibitor Stalls & Waste Management', allocated: refreshAmt, committed: 0, paid: 0, color: '#F59E0B' },
      { id: 'cat-permits', name: 'Municipal Permissions & Generator Backup', allocated: permitAmt, committed: 0, paid: 0, color: '#EC4899' },
      { id: 'cat-contingency', name: 'Contingency Reserve', allocated: contingencyAmt, committed: 0, paid: 0, color: '#6B7280' },
    ];

    tasks = [
      { id: 'task-1', title: 'Submit Police NOC & Fire Safety Permissions', dueDate: daysBefore(35), status: 'todo', priority: 'critical', owner: 'Liaison Officer', dependencies: [] },
      { id: 'task-2', title: 'Contract Tent, Canopy & Ground Layout Team', dueDate: daysBefore(25), status: 'todo', priority: 'high', owner: 'Infrastructure Lead', dependencies: ['task-1'] },
      { id: 'task-3', title: 'Assign Exhibitor & Food Stalls Layout', dueDate: daysBefore(15), status: 'todo', priority: 'medium', owner: 'Vendor Manager', dependencies: ['task-2'] },
      { id: 'task-4', title: 'Brief Security Guards & Medical Volunteer Team', dueDate: daysBefore(5), status: 'todo', priority: 'critical', owner: 'Safety Coordinator', dependencies: ['task-1'] },
      { id: 'task-5', title: 'Generator Test Run & Sound Decibel Check', dueDate: daysBefore(1), status: 'todo', priority: 'high', owner: 'Sound Engineer', dependencies: ['task-2'] },
    ];

    milestones = [
      { id: 'ms-1', title: 'Municipal & Police NOCs Obtained', targetDate: daysBefore(35), completed: false, relatedTaskId: 'task-1' },
      { id: 'ms-2', title: 'Ground & Stall Layout Finalized', targetDate: daysBefore(15), completed: false, relatedTaskId: 'task-3' },
      { id: 'ms-3', title: 'Security & Medical Readiness Verified', targetDate: daysBefore(5), completed: false, relatedTaskId: 'task-4' },
    ];

    schedule = [
      { id: 'sched-1', time: '08:00', title: 'Exhibitor & Food Stall Influx & Setup', responsiblePerson: 'Stall Manager', status: 'upcoming', notes: 'Vehicle passes verified' },
      { id: 'sched-2', time: '10:00', title: 'Festival Gates Open to Public', responsiblePerson: 'Security Chief', status: 'upcoming', notes: 'Turnstiles & bag check active' },
      { id: 'sched-3', time: '12:30', title: 'Cultural Performances on Main Stage', responsiblePerson: 'Stage Coordinator', status: 'upcoming', notes: 'Local troupe dances & songs' },
      { id: 'sched-4', time: '18:00', title: 'Evening Headline Band / Grand Finale', responsiblePerson: 'Event Director', status: 'upcoming', notes: 'Sound limit compliance monitoring' },
      { id: 'sched-5', time: '22:00', title: 'Event Closure & Crowd Dispersal', responsiblePerson: 'Security Chief', status: 'upcoming', notes: 'Controlled exit & sanitation team' },
    ];
  } else {
    // Custom / Gathering
    const venueAmt = Math.round(effectiveSpendable * 0.40);
    const foodAmt = Math.round(effectiveSpendable * 0.35);
    const decorAmt = Math.round(effectiveSpendable * 0.15);
    const miscAmt = Math.round(effectiveSpendable * 0.10);

    categories = [
      { id: 'cat-venue', name: 'Venue Rental', allocated: venueAmt, committed: 0, paid: 0, color: '#3B82F6' },
      { id: 'cat-food', name: 'Food & Beverages', allocated: foodAmt, committed: 0, paid: 0, color: '#10B981' },
      { id: 'cat-decor', name: 'Decor & Ambiance', allocated: decorAmt, committed: 0, paid: 0, color: '#F59E0B' },
      { id: 'cat-misc', name: 'Entertainment & Equipment', allocated: miscAmt, committed: 0, paid: 0, color: '#8B5CF6' },
      { id: 'cat-contingency', name: 'Contingency Reserve', allocated: contingencyAmt, committed: 0, paid: 0, color: '#6B7280' },
    ];

    tasks = [
      { id: 'task-1', title: 'Finalize Event Venue & Terms', dueDate: daysBefore(20), status: 'todo', priority: 'critical', owner: 'Host', dependencies: [] },
      { id: 'task-2', title: 'Arrange Catering & Food Menu', dueDate: daysBefore(14), status: 'todo', priority: 'high', owner: 'Host', dependencies: ['task-1'] },
      { id: 'task-3', title: 'Confirm Guest Headcount', dueDate: daysBefore(5), status: 'todo', priority: 'high', owner: 'Host', dependencies: [] },
    ];

    milestones = [
      { id: 'ms-1', title: 'Venue Booked', targetDate: daysBefore(20), completed: false, relatedTaskId: 'task-1' },
      { id: 'ms-2', title: 'Headcount Confirmed', targetDate: daysBefore(5), completed: false, relatedTaskId: 'task-3' },
    ];

    schedule = [
      { id: 'sched-1', time: '16:00', title: 'Venue Access & Setup', responsiblePerson: 'Host', status: 'upcoming', notes: 'Decor and seating' },
      { id: 'sched-2', time: '18:00', title: 'Guest Arrival & Refreshments', responsiblePerson: 'Host', status: 'upcoming', notes: 'Welcome drinks' },
      { id: 'sched-3', time: '20:00', title: 'Dinner & Social Activities', responsiblePerson: 'Host', status: 'upcoming', notes: 'Dining & socializing' },
    ];
  }

  // Common baseline starter risk
  starterRisks = [
    {
      id: 'risk-1',
      title: 'Contingency Allocation Monitored',
      category: 'budget',
      severity: contingencyPct < 10 ? 'high' : 'medium',
      status: 'open',
      triggerReason: `Contingency reserve set at ${contingencyPct}% (₹${contingencyAmt.toLocaleString('en-IN')}).`,
      mitigationPlan: 'Maintain strict vendor quotes within category allocations to avoid eroding contingency.',
    },
  ];

  const meta: EventMeta = {
    name: config.name.trim() || 'Untitled Event',
    type: config.type,
    location: config.location.trim() || 'TBD',
    date: targetDateStr,
    guestCount,
    venueCapacity: config.venueCapacity ? Number(config.venueCapacity) : Math.round(guestCount * 1.25),
    cateringCostPerGuest: config.cateringCostPerGuest ? Number(config.cateringCostPerGuest) : undefined,
    totalBudget: budget,
    contingencyPercent: contingencyPct,
    theme: config.theme || 'Elegant Contemporary',
    priorities: config.priorities && config.priorities.length > 0 ? config.priorities : ['Budget control', 'Guest experience'],
    coupleNames: config.coupleNames,
    weddingStyle: config.weddingStyle,
    cateringStyle: config.cateringStyle,
    celebrantName: config.celebrantName,
    celebrantAge: config.celebrantAge,
    partyHighlights: config.partyHighlights,
    companyName: config.companyName,
    eventFormat: config.eventFormat,
    techNeeds: config.techNeeds,
    targetOutcome: config.targetOutcome,
    stallsCount: config.stallsCount,
    safetyNeeds: config.safetyNeeds,
    notes: config.notes,
  };

  return {
    userId,
    meta,
    budgetCategories: categories,
    budgetItems: [],
    tasks,
    milestones,
    vendors: [],
    guests: [],
    ideas: [],
    risks: starterRisks,
    eventDaySchedule: schedule,
    activities: [
      {
        id: 'act-' + Date.now(),
        timestamp: new Date().toISOString(),
        type: 'create',
        description: `Living plan created for ${meta.name} (${meta.type.toUpperCase()}) with ₹${budget.toLocaleString('en-IN')} budget.`,
        actor: 'Host',
      },
    ],
  };
}
