import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventState, BudgetCalculations, TimelineCalculations, Risk } from '../types';
import { calculateBudget } from '../engines/budgetEngine';
import { calculateTimeline } from '../engines/timelineEngine';
import { evaluateRisks } from '../engines/riskEngine';
import { api, getAuthToken } from '../services/api';

const EMPTY_BUDGET: BudgetCalculations = {
  totalBudget: 0,
  allocated: 0,
  committed: 0,
  paid: 0,
  forecast: 0,
  remaining: 0,
  variance: 0,
  contingencyAmount: 0,
  categoryBreakdown: [],
  isOverBudget: false,
  overrunAmount: 0,
};

const EMPTY_TIMELINE: TimelineCalculations = {
  daysRemaining: 0,
  isPast: false,
  overdueTasks: [],
  upcomingTasks: [],
  completedTasksCount: 0,
  totalTasksCount: 0,
  progressPercent: 0,
  criticalPath: [],
  hasCircularDependency: false,
  blockedTasks: [],
};

interface EventContextType {
  activeEvent: EventState | null;
  eventsList: any[];
  hasEvents: boolean;
  loading: boolean;
  budget: BudgetCalculations;
  timeline: TimelineCalculations;
  risks: Risk[];
  loadEvent: (id: string) => Promise<void>;
  switchEvent: (id: string) => Promise<void>;
  updateActiveEvent: (updates: Partial<EventState>) => Promise<void>;
  createNewUserEvent: (payload: Partial<EventState>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  loadUserWorkspace: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  isNewEventModalOpen: boolean;
  setIsNewEventModalOpen: (open: boolean) => void;
  newEventDefaultType: string;
  setNewEventDefaultType: (type: string) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeEvent, setActiveEvent] = useState<EventState | null>(null);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New Event Modal State
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [newEventDefaultType, setNewEventDefaultType] = useState('wedding');

  // Derived deterministic states (safely handled when activeEvent is null)
  const budget = activeEvent ? calculateBudget(activeEvent) : EMPTY_BUDGET;
  const timeline = activeEvent ? calculateTimeline(activeEvent) : EMPTY_TIMELINE;
  const risks = activeEvent ? evaluateRisks(activeEvent) : [];

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
      const res = await api.getEventById(id);
      setActiveEvent(res.event);
      localStorage.setItem('eventpilot_active_event_id', id);
    } catch (err) {
      console.error('Failed to load event details:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchEvent = async (id: string) => {
    await loadEvent(id);
  };

  const createNewUserEvent = async (payload: Partial<EventState>) => {
    setLoading(true);
    try {
      const res = await api.createEvent(payload);
      const newEvent = res.event;
      setActiveEvent(newEvent);
      localStorage.setItem('eventpilot_active_event_id', newEvent.id);
      await refreshEvents();
    } catch (err) {
      console.error('Failed to create new user event:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateActiveEvent = async (updates: Partial<EventState>) => {
    if (!activeEvent) return;
    const updated = { ...activeEvent, ...updates, updatedAt: new Date().toISOString() };
    setActiveEvent(updated);

    try {
      await api.updateEvent(activeEvent.id, updates);
      await refreshEvents();
    } catch (err) {
      console.warn('Could not persist update to server, preserved locally:', err);
    }
  };

  const deleteEvent = async (id: string) => {
    setLoading(true);
    try {
      await api.deleteEvent(id);
      const res = await api.getEvents();
      const remainingEvents = res.events || [];
      setEventsList(remainingEvents);

      if (activeEvent?.id === id) {
        if (remainingEvents.length > 0) {
          await loadEvent(remainingEvents[0].id);
        } else {
          setActiveEvent(null);
          localStorage.removeItem('eventpilot_active_event_id');
        }
      }
    } catch (err) {
      console.error('Failed to delete event:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserWorkspace = async () => {
    setLoading(true);
    try {
      const res = await api.getEvents();
      const events = res.events || [];
      setEventsList(events);

      if (events.length > 0) {
        const storedId = localStorage.getItem('eventpilot_active_event_id');
        const target = events.find(e => e.id === storedId) || events[0];
        const detailRes = await api.getEventById(target.id);
        setActiveEvent(detailRes.event);
        localStorage.setItem('eventpilot_active_event_id', target.id);
      } else {
        // User has no events - empty workspace
        setActiveEvent(null);
        localStorage.removeItem('eventpilot_active_event_id');
      }
    } catch (err) {
      console.warn('Could not load user workspace:', err);
      setActiveEvent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      loadUserWorkspace();
    } else {
      setEventsList([]);
      setActiveEvent(null);
      setLoading(false);
    }
  }, []);

  return (
    <EventContext.Provider
      value={{
        activeEvent,
        eventsList,
        hasEvents: eventsList.length > 0 && activeEvent !== null,
        loading,
        budget,
        timeline,
        risks,
        loadEvent,
        switchEvent,
        updateActiveEvent,
        createNewUserEvent,
        deleteEvent,
        loadUserWorkspace,
        refreshEvents,
        isNewEventModalOpen,
        setIsNewEventModalOpen,
        newEventDefaultType,
        setNewEventDefaultType,
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
