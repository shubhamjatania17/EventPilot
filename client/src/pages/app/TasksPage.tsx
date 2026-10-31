import React, { useState } from 'react';
import { 
  Plus, 
  Sparkles, 
  ListTree, 
  CheckCircle2, 
  X, 
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
    <div className="space-y-8 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Action Items & Deliverables
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Task Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Organized by priority, deadlines, and dependencies across event teams.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              setDecomposeTitle(activeEvent.tasks[0]?.title || 'Finalize Venue Catering & Floor Plan');
              setDecomposeCategory('Logistics');
              setDecomposeOffsetDays('14');
              setDecompositionResult(null);
              setSelectedSubtaskIds(new Set());
              setShowDecomposeModal(true);
            }}
            className="metallic-btn-secondary inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all"
          >
            <ListTree className="w-3.5 h-3.5 text-white" />
            AI Task Decomposer
          </button>

          <button
            onClick={() => setShowAddTask(true)}
            className="metallic-btn-primary inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>
        </div>
      </div>

      {/* Success alert */}
      {successNote && (
        <div className="p-4 rounded-xl metallic-card border border-white/20 flex items-center justify-between gap-3 text-xs text-white">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span>{successNote}</span>
          </div>
          <button
            onClick={() => setSuccessNote(null)}
            className="font-bold underline text-zinc-300 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* AI Task Decomposer Modal */}
      {showDecomposeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
          <div className="metallic-card rounded-2xl border border-white/20 max-w-2xl w-full p-4 sm:p-6 space-y-4 sm:space-y-5 my-auto max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 text-white rounded-xl">
                  <ListTree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    AI Smart Task Decomposer
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Break down broad event milestones into sequential, operational subtasks.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDecomposeModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">
                  Task or Milestone to Break Down
                </label>
                <input
                  type="text"
                  value={decomposeTitle}
                  onChange={e => setDecomposeTitle(e.target.value)}
                  placeholder="e.g. Stage & Audio-Visual Production Setup"
                  className="w-full px-3 py-2 text-xs metallic-input rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">
                  Category
                </label>
                <select
                  value={decomposeCategory}
                  onChange={e => setDecomposeCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs metallic-input rounded-lg"
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
                className="metallic-btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl disabled:opacity-50 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-black" />
                {isDecomposing ? 'Decomposing Task...' : 'Generate Subtasks with AI'}
              </button>
            </div>

            {/* Decomposition Results */}
            {decompositionResult && (
              <div className="p-4 bg-zinc-900/90 rounded-xl border border-white/10 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="font-bold text-white text-xs">
                    Proposed Subtasks for: <span className="text-white font-extrabold">{decompositionResult.parentTask}</span>
                  </span>
                  <span className="text-[11px] text-zinc-400">
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
                            ? 'bg-white/[0.08] border-white/30 shadow-xs'
                            : 'bg-zinc-900 border-white/10 opacity-60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-4 w-4 mt-0.5 rounded border-zinc-700 bg-zinc-900 accent-white cursor-pointer shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-white text-xs">{st.title}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-medium">
                                <Clock className="w-3 h-3 text-zinc-400" />
                                T-{st.dueDateOffsetDays}d
                              </span>
                              <span className="metallic-pill px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                                {st.priority}
                              </span>
                            </div>
                          </div>
                          {st.description && (
                            <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                              {st.description}
                            </p>
                          )}
                          <span className="text-[10px] text-zinc-500 block mt-1">
                            Owner: {st.recommendedOwner}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => setShowDecomposeModal(false)}
                    className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplySubtasks}
                    disabled={selectedSubtaskIds.size === 0}
                    className="metallic-btn-primary inline-flex items-center gap-1.5 px-4 py-2 disabled:opacity-50 font-bold rounded-xl text-xs transition-all"
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
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto scrollbar-none">
        {(['all', 'todo', 'in_progress', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
              filter === tab
                ? 'metallic-btn-primary'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {tab.replace('_', ' ')} ({tab === 'all' ? activeEvent.tasks.length : activeEvent.tasks.filter(t => t.status === tab).length})
          </button>
        ))}
      </div>

      {/* Add Task Form */}
      {showAddTask && (
        <form onSubmit={handleAddTask} className="p-5 metallic-card rounded-2xl border border-white/15 space-y-4">
          <h3 className="font-bold text-sm text-white">Add New Task</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Task Title (e.g. Schedule Priest Briefing)"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              className="px-3.5 py-2 text-xs metallic-input rounded-lg sm:col-span-2"
              required
            />
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="px-3.5 py-2 text-xs metallic-input rounded-lg"
              required
            />
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
              className="px-3.5 py-2 text-xs metallic-input rounded-lg"
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
              className="px-3.5 py-2 text-xs metallic-input rounded-lg max-w-xs"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddTask(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="metallic-btn-primary px-4 py-1.5 text-xs font-bold rounded-lg"
              >
                Save Task
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tasks Table */}
      <div className="metallic-card rounded-2xl divide-y divide-white/10">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">
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
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-white cursor-pointer shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-bold ${task.status === 'completed' ? 'line-through text-zinc-500' : 'text-white'}`}>
                        {task.title}
                      </span>
                      {isCritical && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-white/15 text-white border border-white/30">
                          Critical
                        </span>
                      )}
                      {isOverdue && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-zinc-800 text-zinc-200 border border-zinc-600">
                          Overdue
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                    {task.owner && (
                      <span className="text-[11px] text-zinc-500 mt-0.5 block">
                        Assigned to: {task.owner}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <span className="text-xs font-medium text-zinc-400">
                    {task.dueDate}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    task.priority === 'critical' 
                      ? 'border-white/50 bg-white/20 text-white' 
                      : task.priority === 'high' 
                      ? 'border-zinc-500 bg-zinc-800 text-zinc-200' 
                      : 'border-zinc-700 bg-zinc-900 text-zinc-300'
                  }`}>
                    {task.priority}
                  </span>
                  <button
                    onClick={() => openDecomposeForTask(task)}
                    className="metallic-btn-secondary px-2 py-1 text-[11px] font-semibold rounded-lg transition-all flex items-center gap-1 shrink-0"
                    title="Decompose Task with AI"
                  >
                    <ListTree className="w-3 h-3 text-white" />
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
