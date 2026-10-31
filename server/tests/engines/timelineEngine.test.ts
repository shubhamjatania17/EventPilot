import { describe, it, expect } from 'vitest';
import { calculateTimeline } from '../../src/engines/timelineEngine.js';
import { EventState, Task } from '../../src/types/index.js';

describe('Deterministic Timeline Engine', () => {
  const baseMeta: EventState['meta'] = {
    name: 'Tech Horizon Summit',
    date: '2026-11-30',
    location: 'Bangalore, India',
    guestCount: 200,
    totalBudget: 1000000,
    contingencyPercent: 10,
    eventType: 'corporate',
  };

  it('correctly calculates days remaining and completion percentage', () => {
    const tasks: Task[] = [
      { id: 't1', title: 'Task 1', status: 'completed', dueDate: '2026-11-10', priority: 'high', dependencies: [] },
      { id: 't2', title: 'Task 2', status: 'completed', dueDate: '2026-11-15', priority: 'medium', dependencies: [] },
      { id: 't3', title: 'Task 3', status: 'todo', dueDate: '2026-11-20', priority: 'high', dependencies: [] },
      { id: 't4', title: 'Task 4', status: 'todo', dueDate: '2026-11-25', priority: 'low', dependencies: [] },
    ];

    const timeline = calculateTimeline({ meta: baseMeta, tasks }, '2026-11-01');

    expect(timeline.daysRemaining).toBe(29);
    expect(timeline.isPast).toBe(false);
    expect(timeline.progressPercent).toBe(50);
  });

  it('accurately categorizes overdue and upcoming tasks relative to reference date', () => {
    const tasks: Task[] = [
      { id: 't1', title: 'Old Task', status: 'todo', dueDate: '2026-10-25', priority: 'critical', dependencies: [] },
      { id: 't2', title: 'Imminent Task', status: 'todo', dueDate: '2026-11-04', priority: 'high', dependencies: [] },
      { id: 't3', title: 'Far Task', status: 'todo', dueDate: '2026-11-28', priority: 'low', dependencies: [] },
    ];

    const timeline = calculateTimeline({ meta: baseMeta, tasks }, '2026-11-01');

    expect(timeline.overdueTasks.map(t => t.id)).toContain('t1');
    expect(timeline.upcomingTasks.map(t => t.id)).toContain('t2');
    expect(timeline.upcomingTasks.map(t => t.id)).not.toContain('t3');
  });

  it('identifies critical path and blocked tasks via dependency integration', () => {
    const tasks: Task[] = [
      { id: 't-venue', title: 'Sign Venue Contract', status: 'todo', dueDate: '2026-11-05', priority: 'critical', dependencies: [] },
      { id: 't-catering', title: 'Book Catering', status: 'todo', dueDate: '2026-11-10', priority: 'high', dependencies: ['t-venue'] },
      { id: 't-tasting', title: 'Menu Tasting', status: 'todo', dueDate: '2026-11-15', priority: 'medium', dependencies: ['t-catering'] },
    ];

    const timeline = calculateTimeline({ meta: baseMeta, tasks }, '2026-11-01');

    const blockedTaskIds = timeline.blockedTasks.map(b => b.task.id);
    expect(timeline.criticalPath).toContain('t-venue');
    expect(blockedTaskIds).toContain('t-catering');
    expect(blockedTaskIds).toContain('t-tasting');
  });
});
