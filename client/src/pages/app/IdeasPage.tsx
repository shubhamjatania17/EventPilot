import React, { useState } from 'react';
import { Plus, CheckCircle2, ArrowRight } from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { Idea } from '../../types';

export const IdeasPage: React.FC = () => {
  const { activeEvent, updateActiveEvent } = useEvent();
  const [showAddIdea, setShowAddIdea] = useState(false);
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDesc, setIdeaDesc] = useState('');
  const [ideaCost, setIdeaCost] = useState('');
  const [ideaReason, setIdeaReason] = useState('');

  if (!activeEvent) return null;

  const handleAdoptIdea = async (idea: Idea) => {
    // 1. Mark idea adopted
    const updatedIdeas = activeEvent.ideas.map(i =>
      i.id === idea.id ? { ...i, adopted: true } : i
    );

    // 2. Add as a planned budget item
    const newItem = {
      id: `item-idea-${Date.now()}`,
      categoryId: activeEvent.budgetCategories[0]?.id || 'cat-general',
      title: idea.title,
      estimatedCost: idea.estimatedCost,
      actualCost: 0,
      status: 'planned' as const,
      notes: idea.reason,
    };

    // 3. Add as a new task
    const newTask = {
      id: `task-idea-${Date.now()}`,
      title: `Coordinate: ${idea.title}`,
      dueDate: activeEvent.meta.date,
      status: 'todo' as const,
      priority: 'medium' as const,
      dependencies: [],
    };

    await updateActiveEvent({
      ideas: updatedIdeas,
      budgetItems: [...activeEvent.budgetItems, newItem],
      tasks: [...activeEvent.tasks, newTask],
    });
  };

  const handleAddIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle.trim() || !ideaDesc.trim()) return;

    const newIdea: Idea = {
      id: `idea-${Date.now()}`,
      title: ideaTitle.trim(),
      description: ideaDesc.trim(),
      estimatedCost: Number(ideaCost) || 0,
      effort: 'medium',
      guestImpact: 'high',
      budgetImpact: Number(ideaCost) || 0,
      reason: ideaReason.trim() || 'Enhances overall guest celebration experience.',
      adopted: false,
    };

    await updateActiveEvent({
      ideas: [...activeEvent.ideas, newIdea],
    });

    setIdeaTitle('');
    setIdeaDesc('');
    setIdeaCost('');
    setIdeaReason('');
    setShowAddIdea(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Creative Concepts & Personalization
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
            Event Ideas Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Contextual event concepts with estimated costs, effort, and one-click adoption into real plan items.
          </p>
        </div>

        <button
          onClick={() => setShowAddIdea(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Propose Idea
        </button>
      </div>

      {/* Add Idea Form */}
      {showAddIdea && (
        <form onSubmit={handleAddIdea} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Propose New Event Concept</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Idea Title (e.g. Polaroid Guestbook Booth)"
              value={ideaTitle}
              onChange={e => setIdeaTitle(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg sm:col-span-2"
              required
            />
            <input
              type="number"
              placeholder="Estimated Cost (₹)"
              value={ideaCost}
              onChange={e => setIdeaCost(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>
          <textarea
            placeholder="Description of the experience..."
            rows={2}
            value={ideaDesc}
            onChange={e => setIdeaDesc(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Why it fits this event (e.g. Vintage feel with lasting keepsake)"
            value={ideaReason}
            onChange={e => setIdeaReason(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddIdea(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              Save Idea
            </button>
          </div>
        </form>
      )}

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeEvent.ideas.map(idea => (
          <div key={idea.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-950 text-base">{idea.title}</span>
                <span className="text-xs font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded">
                  ₹{idea.estimatedCost.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {idea.description}
              </p>
              <div className="mt-4 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-700">
                <strong className="text-slate-900">Contextual Fit: </strong>
                {idea.reason}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex gap-2">
                <span className="text-slate-500">Effort: <strong>{idea.effort}</strong></span>
                <span className="text-slate-500">•</span>
                <span className="text-indigo-600 font-semibold">Impact: {idea.guestImpact}</span>
              </div>

              {idea.adopted ? (
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Adopted into Plan
                </span>
              ) : (
                <button
                  onClick={() => handleAdoptIdea(idea)}
                  className="inline-flex items-center gap-1.5 font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
                >
                  Adopt into Plan <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
