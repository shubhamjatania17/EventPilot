import React, { useState } from 'react';
import { 
  CalendarDays, 
  CheckCircle2, 
  GitFork, 
  AlertTriangle, 
  Plus, 
  Clock, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { Task } from '../../types';

export const TimelinePage: React.FC = () => {
  const { activeEvent, timeline, updateActiveEvent } = useEvent();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [showAddTask, setShowAddTask] = useState(false);

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Schedule & Critical Path
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
            Timeline & Dependencies
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Deterministic topological dependency graph and critical chain analysis.
          </p>
        </div>

        <button
          onClick={() => setShowAddTask(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Task
        </button>
      </div>

      {/* Critical Path Indicator Banner */}
      <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <GitFork className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-xs text-amber-900 uppercase tracking-wider">
              Critical Path Sequence ({timeline.criticalPath.length} Essential Milestones)
            </span>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
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
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-amber-300 text-amber-950 text-xs font-bold rounded-md shadow-2xs"
              >
                <span>{i + 1}. {task?.title ? task.title.slice(0, 24) + '...' : taskId}</span>
                {i < timeline.criticalPath.length - 1 && <span className="text-amber-400">→</span>}
              </span>
            );
          })}
        </div>
      </div>

      {/* Blocked Tasks Alert (if any) */}
      {timeline.blockedTasks.length > 0 && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Blocked Tasks Detected:</span>{' '}
            {timeline.blockedTasks.map(b => (
              <span key={b.task.id} className="block mt-1">
                • <strong>{b.task.title}</strong> is blocked by: {b.blockedBy.map(dep => dep.title).join(', ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <form onSubmit={handleAddTask} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Add New Timeline Task</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Task Title (e.g. Confirm Sound License)"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg sm:col-span-2"
              required
            />
            <input
              type="date"
              value={newTaskDueDate}
              onChange={e => setNewTaskDueDate(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddTask(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Timeline Tasks List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
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
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-bold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {task.title}
                    </span>
                    {isCritical && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                        Critical Path
                      </span>
                    )}
                    {isOverdue && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-100 text-red-700">
                        Overdue
                      </span>
                    )}
                  </div>
                  {task.owner && (
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Assigned to: {task.owner}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-500 text-right sm:self-center">
                <span className="text-xs font-semibold">
                  Due: {task.dueDate}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  task.priority === 'critical' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'
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
