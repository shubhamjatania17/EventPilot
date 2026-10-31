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
  ChevronLeft,
  ChevronRight,
  Check,
  Lock,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../context/EventContext';
import { api, getAuthToken } from '../services/api';
import { NewEventModal } from './NewEventModal';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, signout } = useAuth();
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
  } = useEvent();

  const token = getAuthToken();

  // Route protection: redirect to sign-in if no valid session
  useEffect(() => {
    if (!authLoading && !token && !user) {
      navigate('/signin', { replace: true });
    }
  }, [user, authLoading, token, navigate]);

  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Desktop sidebar collapse state (persisted)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('eventpilot_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('eventpilot_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Event Switcher Dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  // Copilot Drawer
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; actions?: any[] }>>([]);
  const [copilotLoading, setCopilotLoading] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)
      ) {
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

  const bottomNavItems = [
    { label: 'Overview', to: '/app/overview', icon: LayoutDashboard },
    { label: 'Budget', to: '/app/budget', icon: Wallet },
    { label: 'Timeline', to: '/app/timeline', icon: CalendarDays },
    { label: 'Vendors', to: '/app/vendors', icon: Briefcase },
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

  if (authLoading && !user) {
    return (
      <div className="min-h-screen min-h-dvh bg-[#08090d] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!token && !user) {
    return null;
  }

  return (
    <div className="h-screen h-dvh max-h-screen max-h-dvh w-full bg-[#08090d] flex flex-col md:flex-row text-slate-100 overflow-hidden">
      {/* 1. Desktop Sidebar Navigation (Windows, Mac, Linux, iPad landscape, large foldables) */}
      <aside className={`hidden md:flex ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'} bg-[#0c0d12] border-r border-white/10 flex-col shrink-0 h-full overflow-hidden transition-all duration-300 ease-in-out select-none`}>
        <div className={`h-16 border-b border-white/10 flex items-center shrink-0 ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/logo.png"
              alt="EventPilot"
              className="w-8 h-8 rounded-lg object-contain shadow-xs border border-white/15 shrink-0"
            />
            {!sidebarCollapsed && (
              <span className="font-heading font-extrabold text-lg metallic-chrome-text truncate">
                EventPilot
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={toggleSidebar}
            className={`p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors shrink-0 ${sidebarCollapsed ? 'hidden' : 'block'}`}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* If collapsed, show a mini expand button */}
        {sidebarCollapsed && (
          <div className="py-2 flex justify-center border-b border-white/10 bg-white/[0.02]">
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Active Event Card Summary in Desktop Sidebar */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-white/10 bg-white/[0.02] shrink-0">
            {activeEvent ? (
              <>
                <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                  <span>Active Living Plan</span>
                  <NavLink to="/app/events" className="text-zinc-200 hover:text-white font-bold text-[11px] transition-colors">
                    All Events →
                  </NavLink>
                </div>
                <div className="font-bold text-sm text-white truncate mt-1">
                  {activeEvent.meta.name}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className="metallic-pill px-2 py-0.5 font-semibold text-[11px] rounded">
                    {timeline.daysRemaining > 0 ? `${timeline.daysRemaining} days left` : 'Event Day'}
                  </span>
                  {criticalRisksCount > 0 && (
                    <span className="bg-zinc-900 border border-zinc-600 text-white px-2 py-0.5 font-bold rounded text-[11px] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-zinc-300" />
                      {criticalRisksCount} critical
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-zinc-400">No active event selected</div>
                <button
                  onClick={() => setIsNewEventModalOpen(true)}
                  className="w-full metallic-btn-primary inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Event
                </button>
              </div>
            )}
          </div>
        )}

        {/* If collapsed and active event exists, show compact icon */}
        {sidebarCollapsed && activeEvent && (
          <div className="p-3 border-b border-white/10 flex justify-center shrink-0" title={`${activeEvent.meta.name} (${timeline.daysRemaining > 0 ? `${timeline.daysRemaining}d left` : 'Event Day'})`}>
            <NavLink to="/app/events" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 flex items-center justify-center text-white transition-colors">
              <Layers className="w-4 h-4 text-white" />
            </NavLink>
          </div>
        )}

        {/* Navigation links */}
        <nav className={`p-2.5 space-y-1 flex-1 overflow-y-auto ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isAllowed = hasEvents || isPageAllowedWithoutEvent(item.to);

            if (!isAllowed) {
              return (
                <div
                  key={item.to}
                  onClick={() => setIsNewEventModalOpen(true)}
                  className={`flex items-center rounded-xl font-semibold text-zinc-600 opacity-40 cursor-not-allowed select-none transition-all hover:opacity-70 hover:bg-white/[0.02] ${
                    sidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5 text-sm'
                  }`}
                  title={`${item.label} (Add an event first to unlock)`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0 text-zinc-600" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && <Lock className="w-3.5 h-3.5 text-zinc-600 shrink-0" />}
                </div>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={sidebarCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-xl font-semibold transition-all ${
                    sidebarCollapsed 
                      ? 'justify-center p-3 text-sm' 
                      : 'gap-3 px-3.5 py-2.5 text-sm'
                  } ${
                    isActive
                      ? 'bg-white/[0.1] text-white font-bold border-l-2 border-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile & Sign Out Footer */}
        <div className={`p-3.5 border-t border-white/10 bg-[#090a0f] flex items-center shrink-0 ${
          sidebarCollapsed ? 'flex-col justify-center gap-3' : 'justify-between'
        }`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-200 border border-white/15 flex items-center justify-center font-bold text-xs uppercase shrink-0"
              title={user?.displayName || 'Organizer'}
            >
              {user?.displayName ? user.displayName.slice(0, 2) : 'EP'}
            </div>
            {!sidebarCollapsed && (
              <div className="truncate text-xs">
                <div className="font-bold text-white truncate">
                  {user?.displayName || 'Organizer'}
                </div>
                <div className="text-zinc-400 truncate text-[11px]">
                  {user?.email || ''}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleSignout}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. Mobile Top Navigation Bar (iPhones, Android, Foldables outer/cover screens) */}
      <header className="md:hidden sticky top-0 z-30 bg-[#0c0d12]/95 backdrop-blur-md border-b border-white/10 px-3 py-2.5 pt-[max(0.6rem,env(safe-area-inset-top,0px))] flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-1 text-zinc-300 hover:text-white rounded-xl hover:bg-white/[0.08] active:scale-95 transition-all shrink-0"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <img
            src="/logo.png"
            alt="EventPilot"
            className="w-7 h-7 rounded-lg object-contain border border-white/15 shrink-0"
          />

          <div className="relative min-w-0" ref={mobileDropdownRef}>
            {activeEvent ? (
              <button
                type="button"
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center gap-1 px-1.5 py-1 text-left rounded-lg hover:bg-white/[0.06] transition-colors max-w-[140px] xs:max-w-[180px] sm:max-w-xs"
              >
                <span className="font-bold text-xs sm:text-sm text-white truncate">
                  {activeEvent.meta.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              </button>
            ) : (
              <span className="font-bold text-xs text-zinc-400 truncate">
                Workspace
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {activeEvent && (
            <button
              onClick={() => setCopilotOpen(true)}
              className="metallic-btn-secondary p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1"
              title="Ask EventPilot"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Copilot</span>
            </button>
          )}
        </div>
      </header>

      {/* 3. Mobile Slide-Over Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-sm flex">
          <div className="w-[85%] max-w-xs bg-[#0c0d12] border-r border-white/15 flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-200 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
            <div className="h-14 px-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo.png"
                  alt="EventPilot"
                  className="w-7 h-7 rounded-lg object-contain border border-white/15"
                />
                <span className="font-heading font-extrabold text-base metallic-chrome-text">
                  EventPilot
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.08]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Event Banner in Mobile Drawer */}
            <div className="p-4 border-b border-white/10 bg-white/[0.02]">
              {activeEvent ? (
                <>
                  <div className="text-[11px] text-zinc-400 font-medium">Active Event</div>
                  <div className="font-bold text-sm text-white truncate mt-0.5">
                    {activeEvent.meta.name}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    {timeline.daysRemaining > 0 ? `${timeline.daysRemaining} days left` : 'Event Day'} • ₹{budget.remaining.toLocaleString('en-IN')} balance
                  </div>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsNewEventModalOpen(true);
                  }}
                  className="w-full metallic-btn-primary py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> New Event
                </button>
              )}
            </div>

            {/* Full Nav Links in Mobile Drawer */}
            <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
              {navItems.map(item => {
                const Icon = item.icon;
                const isAllowed = hasEvents || isPageAllowedWithoutEvent(item.to);

                if (!isAllowed) {
                  return (
                    <div
                      key={item.to}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setIsNewEventModalOpen(true);
                      }}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 opacity-40 select-none"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-white/[0.1] text-white font-bold border-l-2 border-white'
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Mobile Drawer Footer with User & Sign Out */}
            <div className="p-4 border-t border-white/10 bg-[#090a0f] flex items-center justify-between">
              <div className="truncate text-xs">
                <div className="font-bold text-white truncate">{user?.displayName || 'Organizer'}</div>
                <div className="text-zinc-400 truncate text-[11px]">{user?.email || ''}</div>
              </div>
              <button
                onClick={handleSignout}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.08]"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* Dismiss backdrop */}
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* 4. Main Desktop & Mobile Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex h-16 bg-[#0c0d12]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 items-center justify-between shrink-0 z-20">
          {/* Left: Interactive Event Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {activeEvent ? (
              <button
                type="button"
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/[0.06] text-left transition-colors max-w-xs sm:max-w-md"
              >
                <div className="truncate">
                  <div className="font-heading text-sm sm:text-base font-bold text-white truncate flex items-center gap-1.5">
                    {activeEvent.meta.name}
                    <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate hidden sm:block">
                    {activeEvent.meta.location} • {activeEvent.meta.date}
                  </div>
                </div>
              </button>
            ) : (
              <div className="text-sm font-semibold text-zinc-400">
                EventPilot Workspace
              </div>
            )}

            {/* Dropdown Menu for Event Switching */}
            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 sm:w-80 metallic-card rounded-2xl shadow-2xl border border-white/15 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                  <span>Switch Event</span>
                  <span className="text-[10px] text-zinc-500 font-normal">{eventsList.length} total</span>
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
                        className={`w-full text-left px-4 py-2.5 hover:bg-white/[0.06] transition-colors flex items-center justify-between gap-3 text-xs ${
                          isSelected ? 'bg-white/[0.08] font-bold text-white' : 'text-zinc-300'
                        }`}
                      >
                        <div className="truncate">
                          <div className="truncate text-xs font-semibold">{ev.meta?.name}</div>
                          <div className="text-[11px] text-zinc-400 truncate flex items-center gap-2 mt-0.5">
                            <span>{ev.meta?.date}</span>
                            <span>•</span>
                            <span>{ev.meta?.guestCount || 0} guests</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="p-2 border-t border-white/10">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setIsNewEventModalOpen(true);
                    }}
                    className="w-full metallic-btn-primary flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Event
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Desktop Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            {activeEvent && (
              <button
                onClick={() => setCopilotOpen(true)}
                className="metallic-btn-secondary inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-200" />
                <span>Ask EventPilot</span>
              </button>
            )}
          </div>
        </header>

        {/* Page Content Outlet with Mobile Safe Margin for Bottom Navigation - ONLY THIS SCROLLS */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-8 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* 5. Mobile Bottom Tab Bar (Thumb navigation for iPhones & Androids) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0c0d12]/95 backdrop-blur-md border-t border-white/10 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] px-2 flex items-center justify-around">
        {bottomNavItems.map(item => {
          const Icon = item.icon;
          const isAllowed = hasEvents || isPageAllowedWithoutEvent(item.to);

          if (!isAllowed) {
            return (
              <button
                key={item.to}
                onClick={() => setIsNewEventModalOpen(true)}
                className="flex flex-col items-center justify-center py-1 px-2 text-zinc-600 opacity-40 min-w-[56px]"
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 transition-colors min-w-[56px] ${
                  isActive ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}

        {/* 'More' Button to Open Full Mobile Drawer */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 text-zinc-400 hover:text-white transition-colors min-w-[56px]"
          aria-label="More navigation options"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>

      {/* Global New Event Modal */}
      <NewEventModal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        defaultType={newEventDefaultType}
      />

      {/* Copilot Drawer / Modal with Mobile Safe Areas */}
      {copilotOpen && activeEvent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
          <div className="bg-[#0c0d12] w-full sm:max-w-md h-full h-dvh max-h-dvh shadow-2xl flex flex-col border-l border-white/15 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
            <div className="h-14 sm:h-16 px-4 sm:px-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02] shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white" />
                <h3 className="font-bold text-sm text-white">Ask EventPilot</h3>
              </div>
              <button
                onClick={() => setCopilotOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
                aria-label="Close copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 text-sm">
              {copilotMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'ml-auto metallic-btn-primary rounded-br-none text-xs'
                      : 'mr-auto bg-zinc-900/90 text-zinc-100 border border-white/10 rounded-bl-none text-xs shadow-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
                      {msg.actions.map((act: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (act.payload?.route) navigate(act.payload.route);
                            setCopilotOpen(false);
                          }}
                          className="px-2.5 py-1 metallic-btn-secondary text-[11px] rounded-md transition-colors"
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {copilotLoading && (
                <div className="p-3 bg-zinc-900 border border-white/10 rounded-2xl max-w-[85%] text-xs text-zinc-400 animate-pulse">
                  Analyzing verified event state...
                </div>
              )}
            </div>

            <form onSubmit={handleCopilotSubmit} className="p-3 border-t border-white/10 bg-[#090a0f] flex gap-2 shrink-0">
              <input
                type="text"
                value={copilotQuery}
                onChange={e => setCopilotQuery(e.target.value)}
                placeholder="Ask about budget, tasks, or trade-offs..."
                className="flex-1 px-3 py-2 text-xs metallic-input rounded-xl placeholder:text-zinc-500"
              />
              <button
                type="submit"
                disabled={!copilotQuery.trim() || copilotLoading}
                className="p-2 metallic-btn-primary rounded-xl disabled:opacity-40 transition-colors shrink-0"
                aria-label="Send query"
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
