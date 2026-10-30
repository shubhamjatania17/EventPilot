import { EventState, UserProfile } from '../types';
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
    return request<{ events: any[] }>('/events');
  },

  async getEventById(id: string) {
    return request<{ event: EventState }>('/events/' + id);
  },

  async createEvent(eventData: Partial<EventState>) {
    return request<{ message: string; event: EventState }>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  async updateEvent(id: string, updates: Partial<EventState>) {
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

  async simulateImpact(id: string, newGuestCount: number) {
    return request<{ simulation: any }>(`/events/${id}/simulate`, {
      method: 'POST',
      body: JSON.stringify({ newGuestCount }),
    });
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
