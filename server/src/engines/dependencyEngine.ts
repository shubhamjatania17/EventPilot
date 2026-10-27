import { Task } from '../types/index.js';

export interface DependencyAnalysis {
  hasCircularDependency: boolean;
  cycleNodes: string[];
  topologicalOrder: string[];
  criticalPath: string[];
  blockedTasks: {
    task: Task;
    blockedBy: Task[];
  }[];
}

/**
 * Deterministic Dependency Engine
 * Builds DAG of tasks, validates no cycles, finds blocked tasks, and computes critical path.
 */
export function analyzeDependencies(tasks: Task[]): DependencyAnalysis {
  const taskMap = new Map<string, Task>();
  for (const t of tasks) {
    taskMap.set(t.id, t);
  }

  // Build adjacency list: node -> outgoing edges (dependent tasks that need node to finish first)
  const inDegree = new Map<string, number>();
  const graph = new Map<string, string[]>(); // dependencyId -> [taskList depending on it]

  for (const t of tasks) {
    inDegree.set(t.id, 0);
    graph.set(t.id, []);
  }

  for (const t of tasks) {
    const deps = t.dependencies || [];
    for (const depId of deps) {
      if (taskMap.has(depId)) {
        graph.get(depId)!.push(t.id);
        inDegree.set(t.id, (inDegree.get(t.id) || 0) + 1);
      }
    }
  }

  // Kahn's algorithm for topological sorting and cycle detection
  const queue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) {
      queue.push(id);
    }
  }

  const topologicalOrder: string[] = [];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    topologicalOrder.push(curr);

    for (const neighbor of graph.get(curr) || []) {
      const newDeg = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) {
        queue.push(neighbor);
      }
    }
  }

  const hasCircularDependency = topologicalOrder.length !== tasks.length;
  const cycleNodes: string[] = [];
  if (hasCircularDependency) {
    for (const [id, deg] of inDegree.entries()) {
      if (deg > 0) {
        cycleNodes.push(id);
      }
    }
  }

  // Find blocked tasks: incomplete task whose dependencies are not all completed
  const blockedTasks: DependencyAnalysis['blockedTasks'] = [];
  for (const t of tasks) {
    if (t.status === 'completed') continue;
    const blocking: Task[] = [];
    for (const depId of t.dependencies || []) {
      const depTask = taskMap.get(depId);
      if (depTask && depTask.status !== 'completed') {
        blocking.push(depTask);
      }
    }
    if (blocking.length > 0) {
      blockedTasks.push({
        task: t,
        blockedBy: blocking,
      });
    }
  }

  // Compute Critical Path (longest sequence of incomplete tasks linked by dependencies)
  // Distance metric: 1 unit per task, or based on priority
  const dist = new Map<string, number>();
  const parent = new Map<string, string | null>();

  for (const id of topologicalOrder) {
    dist.set(id, 1);
    parent.set(id, null);
  }

  let maxDist = 0;
  let endNode: string | null = null;

  for (const u of topologicalOrder) {
    const uDist = dist.get(u) || 1;
    for (const v of graph.get(u) || []) {
      const weight = (taskMap.get(v)?.priority === 'critical' ? 2 : 1);
      if ((dist.get(v) || 0) < uDist + weight) {
        dist.set(v, uDist + weight);
        parent.set(v, u);
        if (uDist + weight > maxDist) {
          maxDist = uDist + weight;
          endNode = v;
        }
      }
    }
  }

  const criticalPath: string[] = [];
  if (endNode) {
    let curr: string | null = endNode;
    while (curr) {
      criticalPath.unshift(curr);
      curr = parent.get(curr) || null;
    }
  } else if (tasks.length > 0) {
    // If no dependencies, the critical path is the highest priority incomplete task
    const criticalTask = tasks.find(t => t.priority === 'critical' && t.status !== 'completed');
    if (criticalTask) criticalPath.push(criticalTask.id);
  }

  return {
    hasCircularDependency,
    cycleNodes,
    topologicalOrder,
    criticalPath,
    blockedTasks,
  };
}
