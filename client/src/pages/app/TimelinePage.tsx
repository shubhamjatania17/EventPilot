import React, { useState } from 'react';
import { 
  GitFork, 
  AlertTriangle, 
  Plus
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { Task } from '../../types';

export const TimelinePage: React.FC = () => {
  const { activeEvent, timeline, updateActiveEvent } = useEvent();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [showAddTask, setShowAddTask] = useState(false);

  if (!activeEvent) return null;

  const handleToggleTask = async (taskId: string) => {
    const updatedTasks = activeEvent.tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: (t.status === 'completed' ? 'todo' : 'completed') as Task['status'],
        };
      }
      return t;
    });

    await updateActiveEvent({ tasks: updatedTasks });
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDueDate) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      dueDate: newTaskDueDate,
      priority: newTaskPriority,
      status: 'todo',
      dependencies: [],
    };

    await updateActiveEvent({
      tasks: [...activeEvent.tasks, newTask],
    });

    setNewTaskTitle('');
    setNewTaskDueDate('');
    setShowAddTask(false);
  };

  return (
    <div className="space-y-8 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Schedule & Critical Path
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Timeline & Dependencies
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Deterministic topological dependency graph and critical chain analysis.
          </p>
        </div>

        <button
          onClick={() => setShowAddTask(true)}
          className="metallic-btn-primary inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Task
        </button>
      </div>

      {/* Critical Path Indicator Banner */}
      <div className="p-5 rounded-2xl metallic-card border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <GitFork className="w-5 h-5 text-white shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-xs text-white uppercase tracking-wider">
              Critical Path Sequence ({timeline.criticalPath.length} Essential Milestones)
            </span>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              These interdependent tasks dictate the earliest completion date. Any delay here directly delays the event.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {timeline.criticalPath.map((taskId, i) => {
            const task = activeEvent.tasks.find(t => t.id === taskId);
            return (
              <span
                key={taskId}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/[0.08] border border-white/20 text-white text-xs font-bold rounded-lg"
              >
                <span>{i + 1}. {task?.title ? task.title.slice(0, 24) + '...' : taskId}</span>
                {i < timeline.criticalPath.length - 1 && <span className="text-zinc-500">→</span>}
              </span>
            );
          })}
        </div>
      </div>

      {/* Blocked Tasks Alert (if any) */}
      {timeline.blockedTasks.length > 0 && (
        <div className="p-4 rounded-xl bg-zinc-900 border border-white/25 text-xs text-zinc-200 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-white shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Blocked Tasks Detected:</span>{' '}
            {timeline.blockedTasks.map(b => (
              <span key={b.task.id} className="block mt-1">
                • <strong className="text-white">{b.task.title}</strong> is blocked by: {b.blockedBy.map(dep => dep.title).join(', ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <form onSubmit={handleAddTask} className="p-5 metallic-card rounded-2xl border border-white/15 space-y-4">
          <h3 className="font-bold text-sm text-white">Add New Timeline Task</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Task Title (e.g. Confirm Sound License)"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="px-3.5 py-2 text-xs metallic-input rounded-lg sm:col-span-2"
              required
            />
            <input
              type="date"
              value={newTaskDueDate}
              onChange={e => setNewTaskDueDate(e.target.value)}
              className="px-3.5 py-2 text-xs metallic-input rounded-lg"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddTask(false)}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold metallic-btn-primary rounded-lg"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Timeline Tasks List */}
      <div className="metallic-card rounded-2xl divide-y divide-white/10">
        {activeEvent.tasks.map(task => {
          const isOverdue = timeline.overdueTasks.some(t => t.id === task.id);
          const isCritical = timeline.criticalPath.includes(task.id);

          return (
            <div key={task.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-start gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => handleToggleTask(task.id)}
                  className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-white cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-bold ${task.status === 'completed' ? 'line-through text-zinc-500' : 'text-white'}`}>
                      {task.title}
                    </span>
                    {isCritical && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-white/15 text-white border border-white/30">
                        Critical Path
                      </span>
                    )}
                    {isOverdue && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-zinc-800 text-zinc-200 border border-zinc-600">
                        Overdue
                      </span>
                    )}
                  </div>
                  {task.owner && (
                    <span className="text-[11px] text-zinc-400 mt-1 block">
                      Assigned to: {task.owner}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-zinc-400 text-right sm:self-center">
                <span className="text-xs font-semibold">
                  Due: {task.dueDate}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  task.priority === 'critical' ? 'border-white/50 bg-white/20 text-white' : 'border-zinc-700 bg-zinc-900 text-zinc-300'
                }`}>
                  {task.priority}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
