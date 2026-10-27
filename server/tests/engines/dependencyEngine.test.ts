import { describe, it, expect } from 'vitest';
import { analyzeDependencies } from '../../src/engines/dependencyEngine.js';
import { Task } from '../../src/types/index.js';

describe('Deterministic Dependency Engine', () => {
  it('detects circular dependencies correctly', () => {
    const cyclicTasks: Task[] = [
      {
        id: 'task-a',
        title: 'Task A',
        dueDate: '2026-11-01',
        status: 'todo',
        priority: 'high',
        dependencies: ['task-b'],
      },
      {
        id: 'task-b',
        title: 'Task B',
        dueDate: '2026-11-02',
        status: 'todo',
        priority: 'high',
        dependencies: ['task-a'], // Circular loop!
      },
    ];

    const result = analyzeDependencies(cyclicTasks);
    expect(result.hasCircularDependency).toBe(true);
    expect(result.cycleNodes.length).toBeGreaterThan(0);
  });

  it('determines topological order and critical path in valid DAG', () => {
    const dagTasks: Task[] = [
      {
        id: 't-venue',
        title: 'Book Venue',
        dueDate: '2026-08-01',
        status: 'completed',
        priority: 'critical',
        dependencies: [],
      },
      {
        id: 't-catering',
        title: 'Menu Tasting',
        dueDate: '2026-09-01',
        status: 'todo',
        priority: 'critical',
        dependencies: ['t-venue'],
      },
      {
        id: 't-invitations',
        title: 'Send RSVPs',
        dueDate: '2026-10-01',
        status: 'todo',
        priority: 'high',
        dependencies: ['t-catering'],
      },
    ];

    const result = analyzeDependencies(dagTasks);
    expect(result.hasCircularDependency).toBe(false);
    expect(result.topologicalOrder).toEqual(['t-venue', 't-catering', 't-invitations']);
    expect(result.criticalPath).toContain('t-catering');
  });

  it('identifies blocked tasks when dependencies are incomplete', () => {
    const tasks: Task[] = [
      {
        id: 't-1',
        title: 'Incomplete Prerequisite',
        dueDate: '2026-10-01',
        status: 'todo',
        priority: 'high',
        dependencies: [],
      },
      {
        id: 't-2',
        title: 'Blocked Dependent Task',
        dueDate: '2026-10-15',
        status: 'todo',
        priority: 'medium',
        dependencies: ['t-1'],
      },
    ];

    const result = analyzeDependencies(tasks);
    expect(result.blockedTasks.length).toBe(1);
    expect(result.blockedTasks[0].task.id).toBe('t-2');
    expect(result.blockedTasks[0].blockedBy[0].id).toBe('t-1');
  });
});
