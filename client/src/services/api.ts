import { EventState, UserProfile } from '../types';
import { SAMPLE_EVENT } from '../data/sampleEvent';
import { simulateGuestCountChange } from '../engines/impactEngine';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('eventpilot_token');
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('eventpilot_token', token);
  } else {
    localStorage.removeItem('eventpilot_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Authentication
  async signup(payload: { email: string; password: string; displayName: string }) {
    return request<{ token: string; user: UserProfile }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async signin(payload: { email: string; password: string }) {
    return request<{ token: string; user: UserProfile }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async googleAuth(payload: { credential: string; intent: 'signin' | 'signup' }) {
    return request<{ token: string; user: UserProfile }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getProfile() {
    return request<{ user: UserProfile }>('/auth/profile');
  },

  async updateProfile(payload: { displayName?: string; preferences?: Record<string, unknown> }) {
    return request<{ user: UserProfile }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    return request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteAccount() {
    return request<{ message: string }>('/auth/account', {
      method: 'DELETE',
    });
  },

  // Events
  async getEvents() {
    try {
      return await request<{ events: any[] }>('/events');
    } catch {
      // Local demo fallback
      return {
        events: [
          {
            id: SAMPLE_EVENT.id,
            meta: SAMPLE_EVENT.meta,
            budgetSummary: {
              total: SAMPLE_EVENT.meta.totalBudget,
              forecast: 759000,
              remaining: 41000,
              isOverBudget: false,
            },
            timelineSummary: {
              daysRemaining: 29,
              overdueCount: 0,
              progressPercent: 28,
            },
            updatedAt: SAMPLE_EVENT.updatedAt,
          },
        ],
      };
    }
  },

  async getEventById(id: string) {
    if (id === SAMPLE_EVENT.id || id === 'sample') {
      return { event: SAMPLE_EVENT };
    }
    try {
      return await request<{ event: EventState }>('/events/' + id);
    } catch {
      return { event: SAMPLE_EVENT };
    }
  },

  async createEvent(eventData: Partial<EventState>) {
    return request<{ message: string; event: EventState }>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  async updateEvent(id: string, updates: Partial<EventState>) {
    if (id === SAMPLE_EVENT.id || id === 'sample') {
      Object.assign(SAMPLE_EVENT, updates);
      return { event: SAMPLE_EVENT };
    }
    return request<{ event: EventState }>('/events/' + id, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteEvent(id: string) {
    return request<{ message: string }>('/events/' + id, {
      method: 'DELETE',
    });
  },

  async seedSampleEvent() {
    try {
      return await request<{ message: string; event: EventState }>('/events/seed/sample', {
        method: 'POST',
      });
    } catch {
      return { message: 'Sample event loaded in local demo mode', event: SAMPLE_EVENT };
    }
  },

  async simulateImpact(id: string, newGuestCount: number) {
    try {
      return await request<{ simulation: any }>(`/events/${id}/simulate`, {
        method: 'POST',
        body: JSON.stringify({ newGuestCount }),
      });
    } catch {
      const sim = simulateGuestCountChange(SAMPLE_EVENT, newGuestCount);
      return { simulation: sim };
    }
  },

  // AI Endpoints
  async generatePlan(payload: {
    eventType: string;
    name: string;
    location: string;
    date: string;
    guestCount: number;
    budget: number;
    priorities?: string[];
  }) {
    return request<any>('/ai/generate-plan', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async analyzeEvent(eventId: string) {
    return request<any>('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({ eventId }),
    });
  },

  async recommendTradeoffs(eventId: string, newGuestCount: number, constraint: string) {
    return request<any>('/ai/tradeoffs', {
      method: 'POST',
      body: JSON.stringify({ eventId, newGuestCount, constraint }),
    });
  },

  async extractQuote(quoteText: string) {
    return request<any>('/ai/extract-quote', {
      method: 'POST',
      body: JSON.stringify({ quoteText }),
    });
  },

  async askQuestion(eventId: string, question: string) {
    return request<any>('/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ eventId, question }),
    });
  },
};
