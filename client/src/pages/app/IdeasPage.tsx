import React, { useState } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  ArrowRight, 
  Palette, 
  Sparkles, 
  Copy, 
  Check, 
  X, 
  MessageSquare, 
  Mail, 
  Hash, 
  Shirt 
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { api } from '../../services/api';
import { Idea, ConceptStudio } from '../../types';

export const IdeasPage: React.FC = () => {
  const { activeEvent, updateActiveEvent } = useEvent();
  const [showAddIdea, setShowAddIdea] = useState(false);
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDesc, setIdeaDesc] = useState('');
  const [ideaCost, setIdeaCost] = useState('');
  const [ideaReason, setIdeaReason] = useState('');

  // AI Theme & Invitation Studio State
  const [showStudioModal, setShowStudioModal] = useState(false);
  const [studioTheme, setStudioTheme] = useState('');
  const [studioVibeNotes, setStudioVibeNotes] = useState('');
  const [isGeneratingStudio, setIsGeneratingStudio] = useState(false);
  const [studioResult, setStudioResult] = useState<ConceptStudio | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!activeEvent) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAdoptIdea = async (idea: Idea) => {
    const updatedIdeas = activeEvent.ideas.map(i =>
      i.id === idea.id ? { ...i, adopted: true } : i
    );

    const newItem = {
      id: `item-idea-${Date.now()}`,
      categoryId: activeEvent.budgetCategories[0]?.id || 'cat-general',
      title: idea.title,
      estimatedCost: idea.estimatedCost,
      actualCost: 0,
      status: 'planned' as const,
      notes: idea.reason,
    };

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

  const handleAdoptSignatureMoment = async (moment: ConceptStudio['signatureMoments'][0]) => {
    const newIdea: Idea = {
      id: `idea-moment-${Date.now()}`,
      title: moment.title,
      description: moment.description,
      estimatedCost: moment.estimatedCost,
      effort: 'medium',
      guestImpact: moment.impact === 'exceptional' ? 'high' : moment.impact,
      budgetImpact: moment.estimatedCost,
      reason: `Signature concept from ${studioResult?.themeName || 'Theme Studio'}`,
      adopted: true,
    };

    const newItem = {
      id: `item-moment-${Date.now()}`,
      categoryId: activeEvent.budgetCategories[0]?.id || 'cat-general',
      title: moment.title,
      estimatedCost: moment.estimatedCost,
      actualCost: 0,
      status: 'planned' as const,
      notes: moment.description,
    };

    const newTask = {
      id: `task-moment-${Date.now()}`,
      title: `Produce: ${moment.title}`,
      dueDate: activeEvent.meta.date,
      status: 'todo' as const,
      priority: 'high' as const,
      dependencies: [],
    };

    await updateActiveEvent({
      ideas: [...activeEvent.ideas, newIdea],
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

  const handleGenerateStudio = async () => {
    setIsGeneratingStudio(true);
    setStudioResult(null);

    try {
      const res = await api.generateConceptStudio({
        eventId: activeEvent.id,
        theme: studioTheme.trim() || undefined,
        vibeNotes: studioVibeNotes.trim() || undefined,
      });
      setStudioResult(res);
    } catch (err: unknown) {
      console.error('Concept studio failed:', err);
    } finally {
      setIsGeneratingStudio(false);
    }
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
            Event Ideas & Concept Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Contextual event concepts, color palettes, and ready-to-dispatch invitation templates powered by Gemini.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setStudioTheme(`${activeEvent.meta.name} Aesthetic`);
              setStudioVibeNotes('Warm regal celebration, sustainable floral touches, and timeless evening lighting');
              setStudioResult(null);
              setShowStudioModal(true);
            }}
            className="inline-flex items-center gap-2 text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 px-3.5 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <Palette className="w-3.5 h-3.5 text-violet-600" />
            AI Theme & Invitation Studio
          </button>

          <button
            onClick={() => setShowAddIdea(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Propose Idea
          </button>
        </div>
      </div>

      {/* AI Theme & Invitation Studio Modal */}
      {showStudioModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-violet-100 text-violet-700 rounded-xl">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-950 text-base">
                    AI Theme, Decor & Invitation Studio
                  </h3>
                  <p className="text-xs text-slate-500">
                    Generates cohesive aesthetic palettes, dress code rules, ready invitations, and signature moments.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStudioModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Desired Theme / Motif (Optional)
                </label>
                <input
                  type="text"
                  value={studioTheme}
                  onChange={e => setStudioTheme(e.target.value)}
                  placeholder="e.g. Modern Minimalist Royal Rajputana"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Vibe & Atmosphere Notes
                </label>
                <input
                  type="text"
                  value={studioVibeNotes}
                  onChange={e => setStudioVibeNotes(e.target.value)}
                  placeholder="e.g. Candlelit evening, marigold installations, acoustic music"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGenerateStudio}
                disabled={isGeneratingStudio}
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-700 hover:bg-violet-800 text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-50 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isGeneratingStudio ? 'Curating Studio Kit...' : 'Curate Aesthetic & Invitation Kit'}
              </button>
            </div>

            {/* Studio Results */}
            {studioResult && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-5 text-xs max-h-[75vh] overflow-y-auto pr-1">
                {/* Theme Header */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
                    Curated Concept
                  </div>
                  <h4 className="font-extrabold text-base text-slate-900">
                    {studioResult.themeName}
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    {studioResult.vibeSummary}
                  </p>
                </div>

                {/* 4-Hex Color Palette Swatches */}
                <div>
                  <h5 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-violet-600" /> Color Palette & Accent Guide
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {studioResult.colorPalette.map((color, idx) => (
                      <div
                        key={idx}
                        onClick={() => copyToClipboard(color.hex, `hex-${idx}`)}
                        className="p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-violet-300 transition-all text-center group"
                      >
                        <div
                          className="h-12 w-full rounded-lg mb-2 shadow-inner border border-black/10 group-hover:scale-[1.02] transition-transform"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="font-bold text-slate-900 text-xs truncate">
                          {color.name}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500 flex items-center justify-center gap-1 mt-0.5">
                          {color.hex}
                          {copiedKey === `hex-${idx}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 truncate">
                          {color.usage}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dress Code & Hashtags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <Shirt className="w-3.5 h-3.5 text-violet-600" /> Dress Code Advice
                    </span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {studioResult.dressCodeAdvice}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-violet-600" /> Curated Social Hashtags
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {studioResult.socialHashtags.map((tag, idx) => (
                        <span
                          key={idx}
                          onClick={() => copyToClipboard(tag, `tag-${idx}`)}
                          className="px-2 py-0.5 bg-violet-50 text-violet-800 rounded-md text-[11px] font-semibold cursor-pointer hover:bg-violet-100 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ready-to-Send Invitation Templates */}
                <div className="space-y-3">
                  <h5 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-violet-600" /> Ready-to-Send Invitation Copies
                  </h5>

                  {/* WhatsApp Invite */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp / Direct Message Copy
                      </span>
                      <button
                        onClick={() => copyToClipboard(studioResult.invitationTemplates.whatsappShort, 'whatsapp')}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors"
                      >
                        {copiedKey === 'whatsapp' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-600" /> Copy WhatsApp
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-slate-700 whitespace-pre-wrap font-sans text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                      {studioResult.invitationTemplates.whatsappShort}
                    </pre>
                  </div>

                  {/* Formal Email Invite */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-600" /> Formal Email Invitation Template
                      </span>
                      <button
                        onClick={() => copyToClipboard(studioResult.invitationTemplates.emailFormal, 'email')}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors"
                      >
                        {copiedKey === 'email' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-600" /> Copy Formal Email
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-slate-700 whitespace-pre-wrap font-sans text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                      {studioResult.invitationTemplates.emailFormal}
                    </pre>
                  </div>
                </div>

                {/* Signature Experience Moments */}
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-600" /> Signature Guest Moments
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {studioResult.signatureMoments.map((moment, idx) => (
                      <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">{moment.title}</span>
                            <span className="font-extrabold text-slate-800 text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                              ₹{moment.estimatedCost.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                            {moment.description}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-violet-700 font-semibold uppercase">
                            Impact: {moment.impact}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdoptSignatureMoment(moment)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-800 hover:text-violet-950 transition-colors"
                          >
                            Adopt into Plan <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-200">
                  <button
                    onClick={() => setShowStudioModal(false)}
                    className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-slate-800 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
        {activeEvent.ideas.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 md:col-span-2 bg-white rounded-2xl border border-slate-200">
            No custom ideas proposed yet. Click "AI Theme & Invitation Studio" above or "Propose Idea" to get started.
          </div>
        ) : (
          activeEvent.ideas.map(idea => (
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
          ))
        )}
      </div>
    </div>
  );
};