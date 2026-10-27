import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  CalendarDays, 
  Users, 
  Briefcase, 
  CheckSquare, 
  Lightbulb, 
  Clock, 
  Settings, 
  Sparkles, 
  LogOut, 
  Send, 
  MessageSquare, 
  X,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../context/EventContext';
import { api } from '../services/api';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, signout } = useAuth();
  const { activeEvent, timeline, budget, risks } = useEvent();

  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; actions?: any[] }>>([
    {
      role: 'assistant',
      text: `Hello! I am your EventPilot copilot for "${activeEvent.meta.name}". You have ${timeline.daysRemaining} days remaining with ₹${budget.remaining.toLocaleString('en-IN')} budget balance. How can I assist with your plan today?`,
    },
  ]);
  const [copilotLoading, setCopilotLoading] = useState(false);

  const handleCopilotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuery.trim() || copilotLoading) return;

    const userText = copilotQuery.trim();
    setCopilotQuery('');
    setCopilotMessages(prev => [...prev, { role: 'user', text: userText }]);
    setCopilotLoading(true);

    try {
      const res = await api.askQuestion(activeEvent.id, userText);
      setCopilotMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: res.response.answer,
          actions: res.response.suggestedActions,
        },
      ]);
    } catch {
      setCopilotMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `EventPilot note: Your event has ${timeline.daysRemaining} days remaining. Current forecast is ₹${budget.forecast.toLocaleString('en-IN')} with ₹${budget.remaining.toLocaleString('en-IN')} remaining.`,
        },
      ]);
    } finally {
      setCopilotLoading(false);
    }
  };

  const navItems = [
    { label: 'Overview', to: '/app/overview', icon: LayoutDashboard },
    { label: 'Budget & What-If', to: '/app/budget', icon: Wallet },
    { label: 'Timeline', to: '/app/timeline', icon: CalendarDays },
    { label: 'Vendors', to: '/app/vendors', icon: Briefcase },
    { label: 'Guests', to: '/app/guests', icon: Users },
    { label: 'Tasks', to: '/app/tasks', icon: CheckSquare },
    { label: 'Ideas', to: '/app/ideas', icon: Lightbulb },
    { label: 'Event Day', to: '/app/event-day', icon: Clock },
    { label: 'Settings', to: '/app/settings', icon: Settings },
  ];

  const handleSignout = () => {
    signout();
    navigate('/');
  };

  const criticalRisksCount = risks.filter(r => r.severity === 'critical').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider">
              EP
            </div>
            <span className="font-heading font-bold text-lg text-slate-900">
              EventPilot
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            v1.0
          </span>
        </div>

        {/* Active Event Card Summary */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70">
          <div className="text-xs text-slate-500 font-medium">Active Living Plan</div>
          <div className="font-bold text-sm text-slate-900 truncate mt-0.5">
            {activeEvent.meta.name}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded">
              {timeline.daysRemaining > 0 ? `${timeline.daysRemaining} days left` : 'Event Day'}
            </span>
            {criticalRisksCount > 0 && (
              <span className="px-2 py-0.5 bg-red-50 text-red-700 font-semibold rounded flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {criticalRisksCount} critical
              </span>
            )}
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile & Sign Out Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {user?.displayName ? user.displayName.slice(0, 2) : 'EP'}
            </div>
            <div className="truncate text-xs">
              <div className="font-bold text-slate-900 truncate">
                {user?.displayName || 'Demo Organizer'}
              </div>
              <div className="text-slate-500 truncate text-[11px]">
                {user?.email || 'demo@eventpilot.com'}
              </div>
            </div>
          </div>
          <button
            onClick={handleSignout}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-heading text-lg font-bold text-slate-900 truncate">
              {activeEvent.meta.name}
            </h2>
            <span className="text-xs text-slate-500 hidden sm:inline-block">
              {activeEvent.meta.location} • {activeEvent.meta.date}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCopilotOpen(true)}
              className="inline-flex items-center gap-2 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Ask EventPilot
            </button>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Copilot Drawer / Modal */}
      {copilotOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200">
            <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">Ask EventPilot</h3>
              </div>
              <button
                onClick={() => setCopilotOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm">
              {copilotMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'ml-auto bg-slate-900 text-white rounded-br-none'
                      : 'mr-auto bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-xs">{msg.text}</p>
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
                      {msg.actions.map((act: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (act.payload?.route) navigate(act.payload.route);
                            setCopilotOpen(false);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-300 text-indigo-700 text-[11px] font-semibold rounded-md shadow-xs transition-colors"
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {copilotLoading && (
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-2xl max-w-[85%] text-xs text-slate-500 animate-pulse">
                  Analyzing verified event state...
                </div>
              )}
            </div>

            <form onSubmit={handleCopilotSubmit} className="p-3 border-t border-slate-200 bg-white flex gap-2">
              <input
                type="text"
                value={copilotQuery}
                onChange={e => setCopilotQuery(e.target.value)}
                placeholder="Ask about budget, tasks, or trade-offs..."
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <button
                type="submit"
                disabled={!copilotQuery.trim() || copilotLoading}
                className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
