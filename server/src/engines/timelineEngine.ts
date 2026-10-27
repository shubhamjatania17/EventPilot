import { EventState, TimelineCalculations, Task } from '../types/index.js';
import { analyzeDependencies } from './dependencyEngine.js';

/**
 * Deterministic Timeline Engine
 * Calculates days remaining, task progression, overdue detection, and schedule health.
 */
export function calculateTimeline(
  event: Pick<EventState, 'meta' | 'tasks'>,
  referenceDateStr?: string
): TimelineCalculations {
  const eventDate = new Date(event.meta.date);
  const today = referenceDateStr ? new Date(referenceDateStr) : new Date();

  // Normalize both dates to midnight UTC to avoid timezone variance
  const eventTime = Date.UTC(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  const todayTime = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysRemaining = Math.round((eventTime - todayTime) / msPerDay);
  const isPast = daysRemaining < 0;

  const tasks = event.tasks || [];
  const overdueTasks: Task[] = [];
  const upcomingTasks: Task[] = [];
  let completedTasksCount = 0;

  for (const t of tasks) {
    if (t.status === 'completed') {
      completedTasksCount++;
      continue;
    }

    if (t.dueDate) {
      const taskDue = new Date(t.dueDate);
      const dueTime = Date.UTC(taskDue.getFullYear(), taskDue.getMonth(), taskDue.getDate());
      const diffDays = Math.round((dueTime - todayTime) / msPerDay);

      if (diffDays < 0) {
        overdueTasks.push(t);
      } else if (diffDays <= 7) {
        upcomingTasks.push(t);
      }
    }
  }

  const totalTasksCount = tasks.length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Run dependency analysis
  const depAnalysis = analyzeDependencies(tasks);

  return {
    daysRemaining,
    isPast,
    overdueTasks,
    upcomingTasks,
    completedTasksCount,
    totalTasksCount,
    progressPercent,
    criticalPath: depAnalysis.criticalPath,
    hasCircularDependency: depAnalysis.hasCircularDependency,
    blockedTasks: depAnalysis.blockedTasks,
  };
}
