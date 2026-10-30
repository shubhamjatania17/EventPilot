import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers,
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
  X,
  AlertCircle,
  Plus,
  ChevronDown,
  Check,
  Calendar,
  MapPin,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../context/EventContext';
import { api } from '../services/api';
import { NewEventModal } from './NewEventModal';
import { NoEventsOnboarding } from './NoEventsOnboarding';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signout } = useAuth();
  const { 
    activeEvent, 
    eventsList, 
    hasEvents,
    loading,
    timeline, 
    budget, 
    risks, 
    switchEvent,
    isNewEventModalOpen,
    setIsNewEventModalOpen,
    newEventDefaultType,
    setNewEventDefaultType
  } = useEvent();

  // Event Switcher Dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Copilot Drawer
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; actions?: any[] }>>([]);
  const [copilotLoading, setCopilotLoading] = useState(false);

  useEffect(() => {
    if (activeEvent) {
      setCopilotMessages([
        {
          role: 'assistant',
          text: `Hello! I am your EventPilot copilot for "${activeEvent.meta.name}". You have ${timeline.daysRemaining} days remaining with ₹${budget.remaining.toLocaleString('en-IN')} budget balance. How can I assist with your plan today?`,
        },
      ]);
    }
  }, [activeEvent?.id]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopilotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuery.trim() || copilotLoading || !activeEvent) return;

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
    { label: 'Events', to: '/app/events', icon: Layers },
    { label: 'Budget & What-If', to: '/app/budget', icon: Wallet },
    { label: 'Timeline', to: '/app/timeline', icon: CalendarDays },
    { label: 'Vendors', to: '/app/vendors', icon: Briefcase },
    { label: 'Guests', to: '/app/guests', icon: Users },
    { label: 'Tasks', to: '/app/tasks', icon: CheckSquare },
    { label: 'Ideas', to: '/app/ideas', icon: Lightbulb },
    { label: 'Event Day', to: '/app/event-day', icon: Clock },
    { label: 'Settings', to: '/app/settings', icon: Settings },
  ];

  const isPageAllowedWithoutEvent = (pathname: string) => {
    return pathname === '/app/events' || pathname === '/app/settings';
  };

  // Redirect to /app/events if user tries to access a locked page with no events configured
  useEffect(() => {
    if (!loading && !hasEvents && !isPageAllowedWithoutEvent(location.pathname)) {
      navigate('/app/events', { replace: true });
    }
  }, [loading, hasEvents, location.pathname, navigate]);

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

        {/* Active Event Card Summary / Quick Switcher in Sidebar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70">
          {activeEvent ? (
            <>
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Active Living Plan</span>
                <NavLink to="/app/events" className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px]">
                  All Events →
                </NavLink>
              </div>
              <div className="font-bold text-sm text-slate-900 truncate mt-1">
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
            </>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-slate-500">No active event selected</div>
              <button
                onClick={() => setIsNewEventModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-slate-800 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                New Event
              </button>
            </div>
          )}
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isAllowed = hasEvents || isPageAllowedWithoutEvent(item.to);

            if (!isAllowed) {
              return (
                <div
                  key={item.to}
                  onClick={() => setIsNewEventModalOpen(true)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 opacity-40 cursor-not-allowed select-none transition-all hover:opacity-70 hover:bg-slate-50 group"
                  title="Add an event first to unlock this section"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-slate-600 transition-colors" />
                </div>
              );
            }

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
                {user?.displayName || 'Organizer'}
              </div>
              <div className="text-slate-500 truncate text-[11px]">
                {user?.email || ''}
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
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0">
          {/* Left: Interactive Event Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {activeEvent ? (
              <button
                type="button"
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 text-left transition-colors max-w-xs sm:max-w-md"
              >
                <div className="truncate">
                  <div className="font-heading text-sm sm:text-base font-bold text-slate-900 truncate flex items-center gap-1.5">
                    {activeEvent.meta.name}
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                  <div className="text-[11px] text-slate-500 truncate hidden sm:block">
                    {activeEvent.meta.location} • {activeEvent.meta.date}
                  </div>
                </div>
              </button>
            ) : (
              <div className="text-sm font-semibold text-slate-500">
                EventPilot Workspace
              </div>
            )}

            {/* Dropdown Menu for Event Switching */}
            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  <span>Switch Event</span>
                  <span className="text-[10px] text-slate-400 font-normal">{eventsList.length} total</span>
                </div>

                <div className="max-h-60 overflow-y-auto py-1">
                  {eventsList.map(ev => {
                    const isSelected = activeEvent?.id === ev.id;
                    return (
                      <button
                        key={ev.id}
                        onClick={() => {
                          switchEvent(ev.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs ${
                          isSelected ? 'bg-indigo-50/60 font-bold text-indigo-950' : 'text-slate-800'
                        }`}
                      >
                        <div className="truncate">
                          <div className="truncate text-xs font-semibold">{ev.meta?.name}</div>
                          <div className="text-[11px] text-slate-500 truncate flex items-center gap-2 mt-0.5">
                            <span>{ev.meta?.date}</span>
                            <span>•</span>
                            <span>{ev.meta?.guestCount || 0} guests</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="p-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setIsNewEventModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Event
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsNewEventModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Event</span>
              <span className="sm:hidden">New</span>
            </button>

            {activeEvent && (
              <button
                onClick={() => setCopilotOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Ask EventPilot</span>
              </button>
            )}
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global New Event Modal */}
      <NewEventModal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        defaultType={newEventDefaultType}
      />

      {/* Copilot Drawer / Modal */}
      {copilotOpen && activeEvent && (
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
