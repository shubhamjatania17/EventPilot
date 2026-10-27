import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventState, BudgetCalculations, TimelineCalculations, Risk } from '../types';
import { SAMPLE_EVENT } from '../data/sampleEvent';
import { calculateBudget } from '../engines/budgetEngine';
import { calculateTimeline } from '../engines/timelineEngine';
import { evaluateRisks } from '../engines/riskEngine';
import { api, getAuthToken } from '../services/api';

interface EventContextType {
  activeEvent: EventState;
  eventsList: any[];
  loading: boolean;
  budget: BudgetCalculations;
  timeline: TimelineCalculations;
  risks: Risk[];
  loadEvent: (id: string) => Promise<void>;
  updateActiveEvent: (updates: Partial<EventState>) => Promise<void>;
  createNewUserEvent: (name?: string) => Promise<void>;
  loadUserWorkspace: (displayName?: string) => Promise<void>;
  seedSample: () => Promise<void>;
  refreshEvents: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeEvent, setActiveEvent] = useState<EventState>(SAMPLE_EVENT);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Derived deterministic states
  const budget = calculateBudget(activeEvent);
  const timeline = calculateTimeline(activeEvent);
  const risks = evaluateRisks(activeEvent);

  const refreshEvents = async () => {
    try {
      const res = await api.getEvents();
      setEventsList(res.events || []);
    } catch (err) {
      console.warn('Could not fetch events list:', err);
    }
  };

  const loadEvent = async (id: string) => {
    setLoading(true);
    try {
      if (id === 'sample' || id === SAMPLE_EVENT.id) {
        setActiveEvent(SAMPLE_EVENT);
      } else {
        const res = await api.getEventById(id);
        setActiveEvent(res.event);
      }
    } catch (err) {
      console.error('Failed to load event:', err);
      setActiveEvent(SAMPLE_EVENT);
    } finally {
      setLoading(false);
    }
  };

  const createNewUserEvent = async (name?: string) => {
    setLoading(true);
    try {
      const eventName = name || 'My Wedding & Reception';
      const targetDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const newEventPayload: Partial<EventState> = {
        meta: {
          name: eventName,
          type: 'wedding',
          location: 'City Palace / Banquet Hall',
          date: targetDate,
          guestCount: 150,
          venueCapacity: 200,
          cateringCostPerGuest: 1500,
          totalBudget: 600000,
          contingencyPercent: 10,
          priorities: ['Budget adherence', 'Guest experience', 'Quality catering'],
          theme: 'Modern Indian Elegance',
        },
        budgetCategories: [
          { id: 'cat-venue', name: 'Venue & Lawns', allocated: 200000, committed: 0, paid: 0, color: '#3B82F6' },
          { id: 'cat-catering', name: 'Catering & Beverages', allocated: 225000, committed: 0, paid: 0, color: '#10B981' },
          { id: 'cat-decor', name: 'Floral & Stage Decor', allocated: 75000, committed: 0, paid: 0, color: '#F59E0B' },
          { id: 'cat-photo', name: 'Cinematography & Photo', allocated: 50000, committed: 0, paid: 0, color: '#8B5CF6' },
          { id: 'cat-contingency', name: 'Contingency Reserve', allocated: 50000, committed: 0, paid: 0, color: '#6B7280' },
        ],
        budgetItems: [],
        tasks: [
          { id: 'task-1', title: 'Confirm Venue Contract & Pay Token Advance', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'todo', priority: 'critical', owner: 'Organizer', dependencies: [] },
          { id: 'task-2', title: 'Draft and Finalize Guest List', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'todo', priority: 'high', owner: 'Organizer', dependencies: [] },
          { id: 'task-3', title: 'Schedule Food Tasting with Caterer', dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'todo', priority: 'medium', owner: 'Organizer', dependencies: ['task-1'] },
        ],
        milestones: [
          { id: 'ms-1', title: 'Venue Booking Confirmed', targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: false, relatedTaskId: 'task-1' },
          { id: 'ms-2', title: 'Guest List Finalized', targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: false, relatedTaskId: 'task-2' },
        ],
        vendors: [],
        guests: [],
        ideas: [],
        risks: [],
        eventDaySchedule: [
          { id: 'sched-1', time: '09:00', title: 'Venue Setup & Sound Check', responsiblePerson: 'Coordinator', status: 'upcoming', notes: 'Stage and audio gear ready' },
          { id: 'sched-2', time: '12:00', title: 'Guest Arrival & Welcome', responsiblePerson: 'Host', status: 'upcoming', notes: 'Refreshments served' },
        ],
        activities: [
          { id: 'act-1', timestamp: new Date().toISOString(), type: 'create', description: 'Personalized event workspace initialized', actor: 'System' },
        ],
      };

      const res = await api.createEvent(newEventPayload);
      setActiveEvent(res.event);
      await refreshEvents();
    } catch (err) {
      console.error('Failed to create new user event:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserWorkspace = async (displayName?: string) => {
    setLoading(true);
    try {
      const res = await api.getEvents();
      const events = res.events || [];
      setEventsList(events);

      // Check if user has an existing real event in Firebase
      const realEvents = events.filter((e: any) => e.id !== SAMPLE_EVENT.id && e.id !== 'sample');
      if (realEvents.length > 0) {
        const primaryEvent = realEvents[0];
        const detailRes = await api.getEventById(primaryEvent.id);
        setActiveEvent(detailRes.event);
      } else {
        // First-time user: initialize their personalized clean event in Firebase
        const eventTitle = displayName ? `${displayName}'s Wedding & Reception` : 'My Wedding & Reception';
        await createNewUserEvent(eventTitle);
      }
    } catch (err) {
      console.warn('Could not load user workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateActiveEvent = async (updates: Partial<EventState>) => {
    const updated = { ...activeEvent, ...updates, updatedAt: new Date().toISOString() };
    setActiveEvent(updated);

    try {
      if (activeEvent.id && activeEvent.id !== 'sample-event-jaipur') {
        await api.updateEvent(activeEvent.id, updates);
      }
    } catch (err) {
      console.warn('Could not persist update to server, preserved locally:', err);
    }
  };

  const seedSample = async () => {
    setLoading(true);
    try {
      const res = await api.seedSampleEvent();
      setActiveEvent(res.event);
      await refreshEvents();
    } catch (err) {
      setActiveEvent(SAMPLE_EVENT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      loadUserWorkspace();
    } else {
      refreshEvents();
      setLoading(false);
    }
  }, []);

  return (
    <EventContext.Provider
      value={{
        activeEvent,
        eventsList,
        loading,
        budget,
        timeline,
        risks,
        loadEvent,
        updateActiveEvent,
        createNewUserEvent,
        loadUserWorkspace,
        seedSample,
        refreshEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};
