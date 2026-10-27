import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { Task } from '../../types';

export const TasksPage: React.FC = () => {
  const { activeEvent, timeline, updateActiveEvent } = useEvent();
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'completed'>('all');
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [owner, setOwner] = useState('');

  const filteredTasks = activeEvent.tasks.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const handleToggle = async (taskId: string) => {
    const updated = activeEvent.tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: (t.status === 'completed' ? 'todo' : 'completed') as Task['status'],
        };
      }
      return t;
    });
    await updateActiveEvent({ tasks: updated });
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !dueDate) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      dueDate,
      priority,
      status: 'todo',
      owner: owner.trim() || undefined,
      dependencies: [],
    };

    await updateActiveEvent({
      tasks: [...activeEvent.tasks, newTask],
    });

    setTaskTitle('');
    setDueDate('');
    setOwner('');
    setShowAddTask(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Action Items & Deliverables
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
            Task Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Organized by priority, deadlines, and dependencies across event teams.
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {(['all', 'todo', 'in_progress', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
              filter === tab
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.replace('_', ' ')} ({tab === 'all' ? activeEvent.tasks.length : activeEvent.tasks.filter(t => t.status === tab).length})
          </button>
        ))}
      </div>

      {/* Add Task Form */}
      {showAddTask && (
        <form onSubmit={handleAddTask} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Add New Task</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Task Title (e.g. Schedule Priest Briefing)"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg sm:col-span-2"
              required
            />
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
              required
            />
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex justify-between items-center pt-2">
            <input
              type="text"
              placeholder="Assignee (e.g. Rahul)"
              value={owner}
              onChange={e => setOwner(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg max-w-xs"
            />
            <div className="flex gap-2">
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
          </div>
        </form>
      )}

      {/* Tasks Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No tasks found in this view.
          </div>
        ) : (
          filteredTasks.map(task => {
            const isOverdue = timeline.overdueTasks.some(t => t.id === task.id);
            const isCritical = timeline.criticalPath.includes(task.id);

            return (
              <div key={task.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => handleToggle(task.id)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-bold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.title}
                      </span>
                      {isCritical && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900">
                          Critical
                        </span>
                      )}
                      {isOverdue && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-100 text-red-700">
                          Overdue
                        </span>
                      )}
                    </div>
                    {task.owner && (
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        Assigned to: {task.owner}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <span className="text-xs font-medium text-slate-600">
                    {task.dueDate}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    task.priority === 'critical' 
                      ? 'bg-red-50 text-red-700' 
                      : task.priority === 'high' 
                      ? 'bg-amber-50 text-amber-800' 
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
