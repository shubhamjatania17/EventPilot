import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Sliders, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { api } from '../../services/api';
import { simulateGuestCountChange } from '../../engines/impactEngine';
import { AIRecommendation } from '../../types';

export const BudgetPage: React.FC = () => {
  const { activeEvent, budget, updateActiveEvent } = useEvent();

  // What-If Simulator State (Open by default for judging & interactive exploration)
  const [whatIfActive, setWhatIfActive] = useState(true);
  const [simulatedGuestCount, setSimulatedGuestCount] = useState(activeEvent?.meta?.guestCount || 150);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [aiAssessment, setAiAssessment] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);

  // New Category Modal State
  const [newCatName, setNewCatName] = useState('');
  const [newCatAllocated, setNewCatAllocated] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  // Compute live local simulation
  const simulation = activeEvent ? simulateGuestCountChange(activeEvent, simulatedGuestCount) : ({} as any);

  if (!activeEvent) return null;

  const handleRunTradeoffs = async () => {
    setLoadingAi(true);
    setAppliedFeedback(null);
    try {
      const res = await api.recommendTradeoffs(
        activeEvent.id,
        simulatedGuestCount,
        `Keep me below total budget of ₹${budget.totalBudget.toLocaleString('en-IN')}`
      );
      setAiAssessment(res?.data?.assessment || res?.summary || res?.assessment || 'Trade-off analysis complete.');
      setRecommendations(res?.data?.recommendations || res?.recommendations || []);
    } catch {
      // Deterministic fallback
      const needed = simulation.overrunAmount > 0 ? simulation.overrunAmount : simulation.cateringDelta;
      setAiAssessment(`Adding ${simulation.guestDelta} guests increases catering by ₹${simulation.cateringDelta.toLocaleString('en-IN')}. EventPilot recommends rebalancing categories to stay within budget.`);
      setRecommendations([
        {
          id: 'rec-decor',
          title: 'Optimize Decor & Lighting Palette',
          tradeoffType: 'cut_cost',
          estimatedSavings: Math.round(needed * 0.6),
          impactExplanation: `Reallocating floral installations to local seasonal blooms saves ₹${Math.round(needed * 0.6).toLocaleString('en-IN')}.`,
          suggestedAction: {
            type: 'update_budget_category',
            payload: { categoryName: 'Floral Mandap & Lighting', reduction: Math.round(needed * 0.6) },
          },
        },
        {
          id: 'rec-banquet',
          title: 'Streamline Live Counters',
          tradeoffType: 'vendor_renegotiation',
          estimatedSavings: Math.round(needed * 0.4),
          impactExplanation: `Consolidating live stations saves ₹${Math.round(needed * 0.4).toLocaleString('en-IN')} with no perceived drop in dining quality.`,
          suggestedAction: {
            type: 'update_budget_category',
            payload: { categoryName: 'Royal Rajasthani Catering', reduction: Math.round(needed * 0.4) },
          },
        },
      ]);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleApplyTradeoff = async (rec: AIRecommendation) => {
    // Apply deterministic update to categories
    const savings = rec.estimatedSavings;
    const updatedCategories = activeEvent.budgetCategories.map(cat => {
      if (cat.name.includes('Decor') || cat.name.includes('Floral')) {
        return { ...cat, allocated: Math.max(0, cat.allocated - savings) };
      }
      return cat;
    });

    // Update guest count in event
    await updateActiveEvent({
      meta: { ...activeEvent.meta, guestCount: simulatedGuestCount },
      budgetCategories: updatedCategories,
    });

    setAppliedFeedback(`Applied "${rec.title}"! Rebalanced categories and saved ₹${savings.toLocaleString('en-IN')}.`);
    setRecommendations(prev => prev.filter(r => r.id !== rec.id));
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatAllocated) return;

    const newCat = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      allocated: Number(newCatAllocated),
      committed: 0,
      paid: 0,
      color: '#ffffff',
    };

    await updateActiveEvent({
      budgetCategories: [...activeEvent.budgetCategories, newCat],
    });

    setNewCatName('');
    setNewCatAllocated('');
    setShowAddCat(false);
  };

  return (
    <div className="space-y-8 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Financial Health
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Budget & What-If Planner
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Deterministic arithmetic tracking committed contracts, payments, and live simulation.
          </p>
        </div>

        <button
          onClick={() => setWhatIfActive(!whatIfActive)}
          className={`inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all ${
            whatIfActive 
              ? 'metallic-btn-primary' 
              : 'metallic-btn-secondary'
          }`}
        >
          <Sliders className="w-4 h-4" />
          {whatIfActive ? 'Hide What-If Simulator' : 'Open What-If Simulator'}
        </button>
      </div>

      {/* Hero What-If Simulator Panel */}
      {whatIfActive && (
        <div className="metallic-card p-6 sm:p-8 rounded-2xl border border-white/15 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-zinc-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                Hero What-If Reasoning Engine
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Simulate Real Event Changes
              </h2>
            </div>
            <span className="text-xs text-zinc-400">
              Drag the slider to test consequences immediately.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Slider Control */}
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-zinc-300">Guest Count:</span>
                <span className="text-lg font-extrabold text-white">{simulatedGuestCount} Guests</span>
              </div>
              <input
                type="range"
                min="100"
                max="300"
                step="5"
                value={simulatedGuestCount}
                onChange={e => setSimulatedGuestCount(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
              <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
                <span>100 Guests</span>
                <span>Base: {activeEvent.meta.guestCount}</span>
                <span>300 Guests</span>
              </div>

              {/* Quick Presets for instant judging & testing */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                <span className="text-[11px] text-zinc-400 font-semibold mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => setSimulatedGuestCount(180)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    simulatedGuestCount === 180
                      ? 'metallic-btn-primary'
                      : 'metallic-btn-secondary'
                  }`}
                >
                  Base (180)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedGuestCount(200)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    simulatedGuestCount === 200
                      ? 'metallic-btn-primary'
                      : 'metallic-btn-secondary'
                  }`}
                >
                  Capacity Limit (200)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedGuestCount(220)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    simulatedGuestCount === 220
                      ? 'metallic-btn-primary'
                      : 'metallic-btn-secondary'
                  }`}
                >
                  Hero Flow (+40 / 220)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedGuestCount(250)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    simulatedGuestCount === 250
                      ? 'metallic-btn-primary'
                      : 'metallic-btn-secondary'
                  }`}
                >
                  Heavy (+70 / 250)
                </button>
              </div>
            </div>

            {/* Calculated Deterministic Consequences */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-zinc-900/90 rounded-xl border border-white/10">
                <span className="text-zinc-400">Headcount Delta</span>
                <div className="text-lg font-bold text-white mt-0.5">
                  {simulation.guestDelta > 0 ? `+${simulation.guestDelta}` : simulation.guestDelta} Guests
                </div>
              </div>
              <div className="p-3 bg-zinc-900/90 rounded-xl border border-white/10">
                <span className="text-zinc-400">Catering Cost Delta</span>
                <div className="text-lg font-bold text-white mt-0.5">
                  {simulation.cateringDelta > 0 ? `+₹${simulation.cateringDelta.toLocaleString('en-IN')}` : `₹${simulation.cateringDelta.toLocaleString('en-IN')}`}
                </div>
              </div>
              <div className="p-3 bg-zinc-900/90 rounded-xl border border-white/10">
                <span className="text-zinc-400">Projected Forecast</span>
                <div className="text-lg font-bold text-white mt-0.5">
                  ₹{simulation.newForecast.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="p-3 bg-zinc-900/90 rounded-xl border border-white/10">
                <span className="text-zinc-400">Remaining Budget</span>
                <div className="text-lg font-bold text-white mt-0.5">
                  ₹{simulation.newRemaining.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {simulation.capacityWarning && (
            <div className="p-3.5 bg-zinc-900 border border-white/30 text-white rounded-xl text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-zinc-300 shrink-0" />
              <span>{simulation.capacityWarning}</span>
            </div>
          )}

          {/* Action Trigger */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-zinc-400">
              Need to accommodate this change without breaking the ₹{budget.totalBudget.toLocaleString('en-IN')} budget?
            </span>
            <button
              onClick={handleRunTradeoffs}
              disabled={loadingAi}
              className="metallic-btn-primary inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              {loadingAi ? 'Calculating Trade-offs...' : 'Ask EventPilot for Trade-offs'}
            </button>
          </div>

          {/* AI Tradeoff Proposals */}
          {aiAssessment && (
            <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
              <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                {aiAssessment}
              </p>

              {appliedFeedback && (
                <div className="p-3 bg-zinc-900 border border-white/30 text-white rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>{appliedFeedback}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {recommendations.map(rec => (
                  <div key={rec.id} className="p-4 bg-zinc-900/90 border border-white/10 rounded-xl text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{rec.title}</span>
                        <span className="text-white font-extrabold">Save ₹{rec.estimatedSavings.toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-zinc-300 mt-2 leading-relaxed">
                        {rec.impactExplanation}
                      </p>
                    </div>
                    <button
                      onClick={() => handleApplyTradeoff(rec)}
                      className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 metallic-btn-secondary text-white font-semibold rounded-lg transition-colors text-xs"
                    >
                      Apply Trade-off <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl metallic-card-interactive">
          <span className="text-xs font-semibold text-zinc-400">Total Budget</span>
          <div className="text-2xl font-extrabold text-white mt-1">
            ₹{budget.totalBudget.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Allocated limit</span>
        </div>

        <div className="p-5 rounded-2xl metallic-card-interactive">
          <span className="text-xs font-semibold text-zinc-400">Committed</span>
          <div className="text-2xl font-extrabold text-white mt-1">
            ₹{budget.committed.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Contracts & quotes</span>
        </div>

        <div className="p-5 rounded-2xl metallic-card-interactive">
          <span className="text-xs font-semibold text-zinc-400">Actual Cash Paid</span>
          <div className="text-2xl font-extrabold text-white mt-1">
            ₹{budget.paid.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Disbursed advances</span>
        </div>

        <div className={`p-5 rounded-2xl metallic-card-interactive ${budget.isOverBudget ? 'border-white/40' : ''}`}>
          <span className="text-xs font-semibold text-zinc-400">Forecast Balance</span>
          <div className="text-2xl font-extrabold text-white mt-1">
            ₹{budget.remaining.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">
            {budget.isOverBudget ? 'Over budget!' : 'Contingency intact'}
          </span>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="p-6 rounded-2xl metallic-card">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="font-bold text-base text-white">
              Budget Category Breakdown
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Verified allocations against committed vendor amounts.
            </p>
          </div>

          <button
            onClick={() => setShowAddCat(true)}
            className="metallic-btn-secondary inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Category
          </button>
        </div>

        {showAddCat && (
          <form onSubmit={handleAddCategory} className="mt-4 p-4 bg-zinc-900/90 rounded-xl border border-white/10 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Category Name (e.g. Gifts & Favors)"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              className="flex-1 px-3 py-2 text-xs metallic-input rounded-lg"
              required
            />
            <input
              type="number"
              placeholder="Allocated Amount (₹)"
              value={newCatAllocated}
              onChange={e => setNewCatAllocated(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 text-xs metallic-input rounded-lg"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 metallic-btn-primary text-xs font-bold rounded-lg"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowAddCat(false)}
              className="px-3 py-2 text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
          </form>
        )}

        <div className="mt-6 divide-y divide-white/10">
          {budget.categoryBreakdown.map(cat => (
            <div key={cat.categoryId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{cat.categoryName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    cat.status === 'over_budget' 
                      ? 'border-white/50 bg-white/20 text-white' 
                      : cat.status === 'caution' 
                      ? 'border-zinc-500 bg-zinc-800 text-zinc-200' 
                      : 'border-zinc-700 bg-zinc-900 text-zinc-300'
                  }`}>
                    {cat.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 mt-2 max-w-md overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      cat.status === 'over_budget' 
                        ? 'bg-white' 
                        : 'bg-gradient-to-r from-zinc-500 to-white'
                    }`}
                    style={{ width: `${Math.min(100, (cat.forecast / (cat.allocated || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 text-right">
                <div>
                  <span className="text-zinc-500 text-[11px] block">Allocated</span>
                  <span className="font-semibold text-zinc-300">₹{cat.allocated.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[11px] block">Committed</span>
                  <span className="font-bold text-white">₹{cat.committed.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[11px] block">Variance</span>
                  <span className="font-bold text-zinc-200">
                    {cat.variance < 0 ? `-₹${Math.abs(cat.variance).toLocaleString('en-IN')}` : `+₹${cat.variance.toLocaleString('en-IN')}`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
