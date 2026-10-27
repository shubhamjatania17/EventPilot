import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventState, BudgetCalculations, TimelineCalculations, Risk } from '../types';
import { SAMPLE_EVENT } from '../data/sampleEvent';
import { calculateBudget } from '../engines/budgetEngine';
import { calculateTimeline } from '../engines/timelineEngine';
import { evaluateRisks } from '../engines/riskEngine';
import { api } from '../services/api';

interface EventContextType {
  activeEvent: EventState;
  eventsList: any[];
  loading: boolean;
  budget: BudgetCalculations;
  timeline: TimelineCalculations;
  risks: Risk[];
  loadEvent: (id: string) => Promise<void>;
  updateActiveEvent: (updates: Partial<EventState>) => Promise<void>;
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
    refreshEvents();
    setLoading(false);
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
