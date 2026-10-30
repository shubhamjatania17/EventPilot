import React, { useState } from 'react';
import { 
  Plus, 
  Sparkles, 
  ListTree, 
  CheckCircle2, 
  X, 
  Calendar, 
  ArrowRight,
  Clock 
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { api } from '../../services/api';
import { Task, TaskDecomposition } from '../../types';

export const TasksPage: React.FC = () => {
  const { activeEvent, timeline, updateActiveEvent } = useEvent();
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'completed'>('all');
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [owner, setOwner] = useState('');

  // AI Task Decomposer State
  const [showDecomposeModal, setShowDecomposeModal] = useState(false);
  const [decomposeTitle, setDecomposeTitle] = useState('');
  const [decomposeCategory, setDecomposeCategory] = useState('Operations');
  const [decomposeOffsetDays, setDecomposeOffsetDays] = useState('14');
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [decompositionResult, setDecompositionResult] = useState<TaskDecomposition | null>(null);
  const [selectedSubtaskIds, setSelectedSubtaskIds] = useState<Set<string>>(new Set());
  const [successNote, setSuccessNote] = useState<string | null>(null);

  if (!activeEvent) return null;

  const filteredTasks = (activeEvent.tasks || []).filter(t => {
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

  const openDecomposeForTask = (task: Task) => {
    setDecomposeTitle(task.title);
    setDecomposeCategory('Operations');
    setDecomposeOffsetDays('14');
    setDecompositionResult(null);
    setSelectedSubtaskIds(new Set());
    setShowDecomposeModal(true);
  };

  const handleRunDecomposition = async () => {
    if (!decomposeTitle.trim()) return;
    setIsDecomposing(true);
    setDecompositionResult(null);

    try {
      const res = await api.decomposeTask({
        eventId: activeEvent.id,
        taskTitle: decomposeTitle.trim(),
        category: decomposeCategory,
        dueDateOffsetDays: Number(decomposeOffsetDays) || 14,
      });
      setDecompositionResult(res);
      setSelectedSubtaskIds(new Set(res.subtasks.map(st => st.id)));
    } catch (err: unknown) {
      console.error('Task decomposition failed:', err);
    } finally {
      setIsDecomposing(false);
    }
  };

  const toggleSubtaskSelection = (subtaskId: string) => {
    setSelectedSubtaskIds(prev => {
      const next = new Set(prev);
      if (next.has(subtaskId)) {
        next.delete(subtaskId);
      } else {
        next.add(subtaskId);
      }
      return next;
    });
  };

  const handleApplySubtasks = async () => {
    if (!decompositionResult) return;

    const eventDateObj = new Date(activeEvent.meta.date);
    const selectedSubtasks = decompositionResult.subtasks.filter(st =>
      selectedSubtaskIds.has(st.id)
    );

    const newTasks: Task[] = selectedSubtasks.map((st, idx) => {
      const targetDate = new Date(eventDateObj);
      targetDate.setDate(targetDate.getDate() - (st.dueDateOffsetDays || 7));
      const dateStr = !isNaN(targetDate.getTime())
        ? targetDate.toISOString().split('T')[0]
        : activeEvent.meta.date;

      return {
        id: `task-sub-${Date.now()}-${idx}`,
        title: st.title,
        description: st.description,
        dueDate: dateStr,
        priority: st.priority,
        status: 'todo' as const,
        owner: st.recommendedOwner || undefined,
        dependencies: [],
      };
    });

    await updateActiveEvent({
      tasks: [...activeEvent.tasks, ...newTasks],
    });

    setSuccessNote(`✨ Added ${newTasks.length} sequential subtasks to the project timeline!`);
    setShowDecomposeModal(false);
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setDecomposeTitle(activeEvent.tasks[0]?.title || 'Finalize Venue Catering & Floor Plan');
              setDecomposeCategory('Logistics');
              setDecomposeOffsetDays('14');
              setDecompositionResult(null);
              setSelectedSubtaskIds(new Set());
              setShowDecomposeModal(true);
            }}
            className="inline-flex items-center gap-2 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3.5 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <ListTree className="w-3.5 h-3.5 text-indigo-600" />
            AI Task Decomposer
          </button>

          <button
            onClick={() => setShowAddTask(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>
        </div>
      </div>

      {/* Success alert */}
      {successNote && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNote}</span>
          </div>
          <button
            onClick={() => setSuccessNote(null)}
            className="font-bold underline text-emerald-800 hover:text-emerald-950"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* AI Task Decomposer Modal */}
      {showDecomposeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <ListTree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-950 text-base">
                    AI Smart Task Decomposer
                  </h3>
                  <p className="text-xs text-slate-500">
                    Break down broad event milestones into sequential, operational subtasks.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDecomposeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Task or Milestone to Break Down
                </label>
                <input
                  type="text"
                  value={decomposeTitle}
                  onChange={e => setDecomposeTitle(e.target.value)}
                  placeholder="e.g. Stage & Audio-Visual Production Setup"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Category
                </label>
                <select
                  value={decomposeCategory}
                  onChange={e => setDecomposeCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="Operations">Operations</option>
                  <option value="Venue">Venue</option>
                  <option value="Catering">Catering</option>
                  <option value="Decor">Decor</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Guests">Guests & Invites</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRunDecomposition}
                disabled={isDecomposing || !decomposeTitle.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-50 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isDecomposing ? 'Decomposing Task...' : 'Generate Subtasks with AI'}
              </button>
            </div>

            {/* Decomposition Results */}
            {decompositionResult && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900 text-xs">
                    Proposed Subtasks for: <span className="text-indigo-600 font-extrabold">{decompositionResult.parentTask}</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {selectedSubtaskIds.size} of {decompositionResult.subtasks.length} selected
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {decompositionResult.subtasks.map(st => {
                    const isSelected = selectedSubtaskIds.has(st.id);
                    return (
                      <div
                        key={st.id}
                        onClick={() => toggleSubtaskSelection(st.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-white border-indigo-300 shadow-xs ring-1 ring-indigo-200'
                            : 'bg-slate-100/70 border-slate-200 opacity-60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-4 w-4 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900 text-xs">{st.title}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                                <Clock className="w-3 h-3 text-slate-400" />
                                T-{st.dueDateOffsetDays}d
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                st.priority === 'critical'
                                  ? 'bg-red-100 text-red-800'
                                  : st.priority === 'high'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {st.priority}
                              </span>
                            </div>
                          </div>
                          {st.description && (
                            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                              {st.description}
                            </p>
                          )}
                          <span className="text-[10px] text-slate-400 block mt-1">
                            Owner: {st.recommendedOwner}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => setShowDecomposeModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplySubtasks}
                    disabled={selectedSubtaskIds.size === 0}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Selected Subtasks ({selectedSubtaskIds.size}) to Plan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
              placeholder="Assignee (e.g. Event Lead)"
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
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer shrink-0"
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
                    {task.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                    {task.owner && (
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        Assigned to: {task.owner}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
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
                  <button
                    onClick={() => openDecomposeForTask(task)}
                    className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1 shrink-0"
                    title="Decompose Task with AI"
                  >
                    <ListTree className="w-3 h-3 text-indigo-600" />
                    Subtasks
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};