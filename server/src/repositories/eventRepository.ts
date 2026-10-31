import { getDatabaseRef } from '../config/firebase.js';
import { EventState } from '../types/index.js';

export class EventRepository {
  private static getDb() {
    return getDatabaseRef();
  }

  /**
   * Normalizes event records from Firebase Realtime Database.
   * Firebase strips empty arrays ([]) upon storage; this ensures
   * all array collections are safely restored as arrays, preventing
   * undefined-property errors on client and server engines.
   */
  private static normalizeEvent(val: any, eventId: string, userId: string): EventState {
    return {
      ...val,
      id: eventId,
      userId,
      meta: val.meta || {},
      budgetCategories: Array.isArray(val.budgetCategories) ? val.budgetCategories : [],
      budgetItems: Array.isArray(val.budgetItems) ? val.budgetItems : [],
      tasks: Array.isArray(val.tasks) ? val.tasks : [],
      milestones: Array.isArray(val.milestones) ? val.milestones : [],
      vendors: Array.isArray(val.vendors) ? val.vendors : [],
      guests: Array.isArray(val.guests) ? val.guests : [],
      ideas: Array.isArray(val.ideas) ? val.ideas : [],
      risks: Array.isArray(val.risks) ? val.risks : [],
      eventDaySchedule: Array.isArray(val.eventDaySchedule) ? val.eventDaySchedule : [],
      activities: Array.isArray(val.activities) ? val.activities : [],
    };
  }

  static async findByUserId(userId: string): Promise<EventState[]> {
    try {
      const db = this.getDb();
      const snapshot = await db.ref(`users/${userId}/events`).once('value');
      const val = snapshot.val();
      if (!val) return [];

      return Object.entries(val).map(([eventId, eventData]: [string, any]) =>
        this.normalizeEvent(eventData, eventId, userId)
      );
    } catch (err) {
      console.error(`Error finding events for user (${userId}):`, err);
      return [];
    }
  }

  static async findById(userId: string, eventId: string): Promise<EventState | null> {
    try {
      const db = this.getDb();
      // Strict ownership: always reads through /users/${userId}/events/${eventId}
      const snapshot = await db.ref(`users/${userId}/events/${eventId}`).once('value');
      const val = snapshot.val();
      if (!val) return null;

      return this.normalizeEvent(val, eventId, userId);
    } catch (err) {
      console.error(`Error finding event (${eventId}) for user (${userId}):`, err);
      return null;
    }
  }

  static async create(userId: string, eventData: Partial<EventState>): Promise<EventState> {
    const db = this.getDb();
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const record: Omit<EventState, 'id'> = {
      userId,
      meta: eventData.meta!,
      budgetCategories: eventData.budgetCategories || [],
      budgetItems: eventData.budgetItems || [],
      tasks: eventData.tasks || [],
      milestones: eventData.milestones || [],
      vendors: eventData.vendors || [],
      guests: eventData.guests || [],
      ideas: eventData.ideas || [],
      risks: eventData.risks || [],
      eventDaySchedule: eventData.eventDaySchedule || [],
      activities: eventData.activities || [
        {
          id: `act-${Date.now()}`,
          timestamp: now,
          type: 'create',
          description: `Event "${eventData.meta?.name}" initialized.`,
          actor: 'User',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const cleanRecord = JSON.parse(JSON.stringify(record));
    await db.ref(`users/${userId}/events/${eventId}`).set(cleanRecord);
    return this.normalizeEvent(record, eventId, userId);
  }

  static async update(userId: string, eventId: string, updates: Partial<EventState>): Promise<EventState | null> {
    const db = this.getDb();
    const existing = await this.findById(userId, eventId);
    if (!existing) return null;

    const { id: _ignoreId, userId: _ignoreUserId, ...rest } = existing;
    const merged = JSON.parse(
      JSON.stringify({
        ...rest,
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    );

    await db.ref(`users/${userId}/events/${eventId}`).update(merged);
    return this.normalizeEvent(merged, eventId, userId);
  }

  static async delete(userId: string, eventId: string): Promise<boolean> {
    const db = this.getDb();
    const existing = await this.findById(userId, eventId);
    if (!existing) return false;

    await db.ref(`users/${userId}/events/${eventId}`).remove();
    return true;
  }

  static async deleteAllForUser(userId: string): Promise<void> {
    const db = this.getDb();
    await db.ref(`users/${userId}/events`).remove();
  }
}
