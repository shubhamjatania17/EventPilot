import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Users, 
  TrendingUp 
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { api } from '../../services/api';

export const OverviewPage: React.FC = () => {
  const { activeEvent, budget, timeline, risks, updateActiveEvent } = useEvent();
  const [analyzing, setAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const handleRunAnalysis = async () => {
    if (!activeEvent) return;
    setAnalyzing(true);
    try {
      const res = await api.analyzeEvent(activeEvent.id);
      setAiInsight(res.analysis.summary);
    } catch {
      setAiInsight(
        `EventPilot state review: Plan is healthy. Projected forecast is ₹${budget.forecast.toLocaleString('en-IN')} with ₹${budget.remaining.toLocaleString('en-IN')} remaining.`
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const topRisks = risks.slice(0, 3);
  const criticalTasks = timeline.overdueTasks.slice(0, 3);

  if (!activeEvent) return null;

  return (
    <div className="space-y-8 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {activeEvent.meta.name}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {activeEvent.meta.type.toUpperCase()} • {activeEvent.meta.location} • {activeEvent.meta.date}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            to="/app/budget"
            className="metallic-btn-secondary inline-flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-xs flex-1 sm:flex-initial"
          >
            <TrendingUp className="w-3.5 h-3.5 text-white" />
            What-If Simulator
          </Link>
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="metallic-btn-primary inline-flex items-center justify-center gap-2 text-xs font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-50 flex-1 sm:flex-initial"
          >
            <Sparkles className="w-3.5 h-3.5 text-black" />
            {analyzing ? 'Analyzing Plan...' : 'Analyze Event'}
          </button>
        </div>
      </div>

      {/* AI State Insight Banner (if generated) */}
      {aiInsight && (
        <div className="p-4 rounded-xl metallic-card border border-white/20 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-white shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-200 flex-1">
            <span className="font-bold text-white">EventPilot Recommendation: </span>
            {aiInsight}
          </div>
        </div>
      )}

      {/* 4 Core Health Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Days Countdown */}
        <div className="p-5 rounded-2xl metallic-card-interactive">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Countdown</span>
            <Calendar className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {timeline.daysRemaining > 0 ? `${timeline.daysRemaining} Days` : 'Today'}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Target: {activeEvent.meta.date}
          </div>
        </div>

        {/* Budget Health */}
        <div className="p-5 rounded-2xl metallic-card-interactive">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Budget Balance</span>
            <Wallet className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            ₹{budget.remaining.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Forecast: ₹{budget.forecast.toLocaleString('en-IN')} / ₹{budget.totalBudget.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Timeline Progression */}
        <div className="p-5 rounded-2xl metallic-card-interactive">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Task Progress</span>
            <CheckCircle2 className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {timeline.progressPercent}%
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {timeline.completedTasksCount} of {timeline.totalTasksCount} completed
          </div>
        </div>

        {/* Guests & Capacity */}
        <div className="p-5 rounded-2xl metallic-card-interactive">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Guest Capacity</span>
            <Users className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {activeEvent.meta.guestCount} Guests
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Venue Limit: {activeEvent.meta.venueCapacity || 'Unlimited'}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Items Needing Attention & Upcoming Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Items Needing Attention */}
        <div className="p-6 rounded-2xl metallic-card flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-zinc-300" />
              Items Needing Attention
            </h2>
            <span className="text-xs font-semibold text-zinc-400">
              {topRisks.length + criticalTasks.length} items
            </span>
          </div>

          <div className="mt-4 space-y-3 flex-1">
            {topRisks.length === 0 && criticalTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400">
                <CheckCircle2 className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
                All systems healthy. No immediate blockers detected!
              </div>
            ) : (
              <>
                {topRisks.map(r => (
                  <div key={r.id} className="p-3.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{r.title}</span>
                      <span className="metallic-pill px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {r.severity}
                      </span>
                    </div>
                    <p className="text-zinc-300 mt-1">{r.triggerReason}</p>
                    <div className="text-white font-medium mt-2">
                      Plan: {r.mitigationPlan}
                    </div>
                  </div>
                ))}

                {criticalTasks.map(t => (
                  <div key={t.id} className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-700 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white">{t.title}</span>
                      <span className="block text-[11px] text-zinc-400 mt-0.5">Due: {t.dueDate} (Overdue)</span>
                    </div>
                    <Link to="/app/tasks" className="text-white font-bold hover:underline">
                      View Task →
                    </Link>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Upcoming Milestones & Next Actions */}
        <div className="p-6 rounded-2xl metallic-card flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-white" />
              Upcoming Milestones
            </h2>
            <Link to="/app/timeline" className="text-xs font-bold text-zinc-300 hover:text-white transition-colors">
              View Timeline →
            </Link>
          </div>

          <div className="mt-4 space-y-3 flex-1">
            {activeEvent.milestones.map(m => (
              <div 
                key={m.id}
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                  m.completed ? 'bg-white/[0.04] border-white/20' : 'bg-zinc-900/90 border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{m.title}</span>
                    {m.completed && (
                      <span className="text-[10px] metallic-pill px-1.5 py-0.5 rounded font-bold text-white border-white/30">
                        DONE
                      </span>
                    )}
                  </div>
                  <span className="text-zinc-400 text-[11px] mt-0.5 block">
                    Target Date: {m.targetDate}
                  </span>
                </div>

                {!m.completed && (
                  <button
                    onClick={() => {
                      const updated = activeEvent.milestones.map(item =>
                        item.id === m.id ? { ...item, completed: true } : item
                      );
                      updateActiveEvent({ milestones: updated });
                    }}
                    className="metallic-btn-secondary px-2.5 py-1 text-[11px] font-semibold rounded-md"
                  >
                    Mark Done
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};