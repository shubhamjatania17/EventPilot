export type EventType = 'wedding' | 'birthday' | 'community';

export type EventStatus = 'planning' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export type VendorStatus = 
  | 'discovered' 
  | 'shortlisted' 
  | 'contacted' 
  | 'quote_received' 
  | 'negotiating' 
  | 'confirmed' 
  | 'completed';

export type RSVPStatus = 'pending' | 'attending' | 'declined';

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

export type RiskCategory = 'budget' | 'timeline' | 'vendor' | 'capacity' | 'weather' | 'operational';

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  committed: number;
  paid: number;
  color?: string;
}

export interface BudgetItem {
  id: string;
  categoryId: string;
  title: string;
  estimatedCost: number;
  actualCost: number;
  status: 'planned' | 'committed' | 'paid';
  vendorId?: string;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  status: TaskStatus;
  priority: Priority;
  owner?: string;
  dependencies: string[];
  relatedVendorId?: string;
  relatedCategoryId?: string;
  isMilestone?: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  completed: boolean;
  relatedTaskId?: string;
}

export interface VendorQuoteLineItem {
  description: string;
  quantity?: number;
  unitPrice?: number;
  total: number;
}

export interface VendorQuote {
  id: string;
  vendorName: string;
  category: string;
  subtotal: number;
  taxes: number;
  discounts: number;
  additionalCharges: number;
  total: number;
  paymentTerms?: string;
  deadlines?: string;
  extractedLineItems: VendorQuoteLineItem[];
  lineItems?: VendorQuoteLineItem[];
  rawText?: string;
  ambiguities?: string[];
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  contactName?: string;
  email?: string;
  phone?: string;
  status: VendorStatus;
  quoteAmount: number;
  paidAmount: number;
  deadline?: string;
  notes?: string;
  quote?: VendorQuote;
}

export interface Guest {
  id: string;
  name: string;
  group: 'family' | 'friends' | 'colleagues' | 'vip' | 'general';
  rsvp: RSVPStatus;
  adults: number;
  children: number;
  dietaryRequirements?: string;
  accommodationNeeded?: boolean;
  transportNeeded?: boolean;
  notes?: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  estimatedCost: number;
  effort: 'low' | 'medium' | 'high';
  guestImpact: 'low' | 'medium' | 'high';
  budgetImpact: number;
  reason: string;
  adopted: boolean;
  relatedCategoryId?: string;
}

export interface Risk {
  id: string;
  title: string;
  category: RiskCategory;
  severity: RiskSeverity;
  status: 'open' | 'mitigated' | 'resolved';
  triggerReason: string;
  mitigationPlan: string;
  impactScore?: number;
}

export interface EventDayItem {
  id: string;
  time: string;
  title: string;
  location?: string;
  responsiblePerson?: string;
  status: 'upcoming' | 'current' | 'done' | 'delayed';
  delayMinutes?: number;
  notes?: string;
}

export interface ActivityEntry {
  id: string;
  timestamp: string;
  type: 'create' | 'update' | 'ai_proposal' | 'vendor_quote' | 'decision';
  description: string;
  actor: string;
}

export interface EventMeta {
  name: string;
  type: EventType;
  location: string;
  date: string;
  guestCount: number;
  venueCapacity?: number;
  cateringCostPerGuest?: number;
  totalBudget: number;
  contingencyPercent?: number;
  priorities?: string[];
  theme?: string;
}

export interface EventState {
  id: string;
  userId: string;
  meta: EventMeta;
  budgetCategories: BudgetCategory[];
  budgetItems: BudgetItem[];
  tasks: Task[];
  milestones: Milestone[];
  vendors: Vendor[];
  guests: Guest[];
  ideas: Idea[];
  risks: Risk[];
  eventDaySchedule: EventDayItem[];
  activities: ActivityEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCalculations {
  totalBudget: number;
  allocated: number;
  committed: number;
  paid: number;
  forecast: number;
  remaining: number;
  variance: number;
  contingencyAmount: number;
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    allocated: number;
    committed: number;
    paid: number;
    forecast: number;
    variance: number;
    status: 'healthy' | 'caution' | 'over_budget';
  }[];
  isOverBudget: boolean;
  overrunAmount: number;
}

export interface TimelineCalculations {
  daysRemaining: number;
  isPast: boolean;
  overdueTasks: Task[];
  upcomingTasks: Task[];
  completedTasksCount: number;
  totalTasksCount: number;
  progressPercent: number;
  criticalPath: string[];
  hasCircularDependency: boolean;
  blockedTasks: {
    task: Task;
    blockedBy: Task[];
  }[];
}

export interface ImpactSimulation {
  originalGuestCount: number;
  newGuestCount: number;
  guestDelta: number;
  cateringDelta: number;
  originalForecast: number;
  newForecast: number;
  forecastDelta: number;
  originalRemaining: number;
  newRemaining: number;
  exceedsBudget: boolean;
  overrunAmount: number;
  capacityWarning?: string;
  affectedTasks: Task[];
  affectedVendors: Vendor[];
  newRisks: Partial<Risk>[];
}

export interface AIRecommendation {
  id: string;
  title: string;
  tradeoffType: 'cut_cost' | 'reschedule' | 'vendor_renegotiation' | 'scope_adjustment';
  estimatedSavings: number;
  impactExplanation: string;
  suggestedAction: {
    type: 'update_budget_category' | 'remove_task' | 'update_guest_count' | 'switch_vendor';
    payload: Record<string, unknown>;
  };
}

export interface AIAnalysisResult {
  overallStatus: 'healthy' | 'watch' | 'at_risk';
  summary: string;
  keyInsights: string[];
  recommendations: AIRecommendation[];
}

export interface AIProposalResponse<T = unknown> {
  proposalId: string;
  summary: string;
  data: T;
  needsConfirmation: true;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    currency?: string;
    notificationsEnabled?: boolean;
  };
  hasPassword?: boolean;
  isGoogleLinked?: boolean;
  createdAt?: string;
}
