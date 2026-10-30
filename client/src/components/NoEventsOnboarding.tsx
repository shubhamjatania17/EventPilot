import React from 'react';
import { 
  Plus, 
  Sparkles, 
  Heart, 
  Cake, 
  Briefcase, 
  Users, 
  ArrowRight,
  ShieldCheck,
  Calculator,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NoEventsOnboardingProps {
  onOpenNewEvent: (preselectedType?: string) => void;
}

export const NoEventsOnboarding: React.FC<NoEventsOnboardingProps> = ({ onOpenNewEvent }) => {
  const { user } = useAuth();
  const userName = user?.displayName ? user.displayName.split(' ')[0] : 'there';

  const cards = [
    {
      type: 'wedding',
      title: 'Wedding & Reception',
      subtitle: 'Mandap, catering thali, photo/video, decor & guest accommodations',
      icon: Heart,
      accent: 'from-rose-500/10 to-rose-500/0 hover:border-rose-300 text-rose-600',
      badge: 'Most Popular',
    },
    {
      type: 'birthday',
      title: 'Birthday & Milestone Party',
      subtitle: 'Lounge venue, themed cake, DJ entertainment, photo corners & favors',
      icon: Cake,
      accent: 'from-amber-500/10 to-amber-500/0 hover:border-amber-300 text-amber-600',
      badge: 'Parties',
    },
    {
      type: 'corporate',
      title: 'Corporate Summit & Gala',
      subtitle: 'Keynote ballrooms, LED streaming walls, executive catering & badges',
      icon: Briefcase,
      accent: 'from-blue-500/10 to-blue-500/0 hover:border-blue-300 text-blue-600',
      badge: 'Professional',
    },
    {
      type: 'community',
      title: 'Community Festival & Fair',
      subtitle: 'Open ground tents, sound stages, food stalls, permits & security NOC',
      icon: Users,
      accent: 'from-emerald-500/10 to-emerald-500/0 hover:border-emerald-300 text-emerald-600',
      badge: 'Public & Cultural',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 space-y-8">
      {/* Welcome Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700">
          <Sparkles className="w-3.5 h-3.5" />
          Welcome to your Living Event Workspace
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          What event are you organising, {userName}?
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          Configure your event parameters and EventPilot will generate a customized living budget, timeline, milestone checklists, and run-of-show schedule.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onOpenNewEvent('wedding')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>

      {/* Event Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <button
              key={c.type}
              onClick={() => onOpenNewEvent(c.type)}
              className={`text-left p-5 bg-white rounded-2xl border border-slate-200 hover:shadow-md transition-all group relative overflow-hidden bg-linear-to-b ${c.accent}`}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {c.badge}
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 mt-4 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                {c.title}
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {c.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Feature Highlights Banner */}
      <div className="p-6 bg-slate-100/70 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
        <div className="flex items-center sm:items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
            <Calculator className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900">Deterministic Math</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Zero budget hallucinations</div>
          </div>
        </div>

        <div className="flex items-center sm:items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
            <CalendarDays className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900">Living Timeline</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Critical path dependency trees</div>
          </div>
        </div>

        <div className="flex items-center sm:items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900">Multi-Event Switching</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Seamlessly organize multiple events</div>
          </div>
        </div>
      </div>
    </div>
  );
};
