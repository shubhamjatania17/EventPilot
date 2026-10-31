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
      badge: 'Most Popular',
    },
    {
      type: 'birthday',
      title: 'Birthday & Milestone Party',
      subtitle: 'Lounge venue, themed cake, DJ entertainment, photo corners & favors',
      icon: Cake,
      badge: 'Parties',
    },
    {
      type: 'corporate',
      title: 'Corporate Summit & Gala',
      subtitle: 'Keynote ballrooms, LED streaming walls, executive catering & badges',
      icon: Briefcase,
      badge: 'Professional',
    },
    {
      type: 'community',
      title: 'Community Festival & Fair',
      subtitle: 'Open ground tents, sound stages, food stalls, permits & security NOC',
      icon: Users,
      badge: 'Public & Cultural',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 space-y-8">
      {/* Welcome Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full metallic-pill text-xs font-semibold text-slate-200">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          Welcome to your Living Event Workspace
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          What event are you organising, <span className="metallic-chrome-text">{userName}</span>?
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Configure your event parameters and EventPilot will generate a customized living budget, timeline, milestone checklists, and run-of-show schedule.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onOpenNewEvent('wedding')}
            className="metallic-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-lg"
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
              className="text-left p-5 rounded-2xl metallic-card-interactive group relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-white/10 flex items-center justify-center text-slate-200 shadow-xs">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full metallic-pill text-zinc-300">
                  {c.badge}
                </span>
              </div>
              <h3 className="font-bold text-base text-white mt-4 group-hover:text-slate-200 transition-colors flex items-center justify-between">
                {c.title}
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {c.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Feature Highlights Banner */}
      <div className="p-6 rounded-2xl metallic-card grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
        <div className="flex items-center sm:items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-white/10 flex items-center justify-center shrink-0">
            <Calculator className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-xs text-white">Deterministic Math</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Zero budget hallucinations</div>
          </div>
        </div>

        <div className="flex items-center sm:items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-white/10 flex items-center justify-center shrink-0">
            <CalendarDays className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-xs text-white">Living Timeline</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Critical path dependency trees</div>
          </div>
        </div>

        <div className="flex items-center sm:items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-white/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-xs text-white">Multi-Event Switching</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Seamlessly organize multiple events</div>
          </div>
        </div>
      </div>
    </div>
  );
};