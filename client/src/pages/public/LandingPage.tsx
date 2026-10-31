import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Calculator, 
  GitFork, 
  FileText, 
  CheckCircle2, 
  Play, 
  ShieldCheck, 
  Clock, 
  TrendingUp, 
  ChevronRight,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen min-h-dvh bg-[#090a0f] flex flex-col text-slate-100 overflow-x-hidden">
      {/* 1. Navbar */}
      <header className="sticky top-0 z-40 bg-[#0c0d12]/95 backdrop-blur-md border-b border-white/10 pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="EventPilot"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-contain border border-white/15"
            />
            <span className="font-heading text-lg sm:text-xl font-bold tracking-tight metallic-chrome-text">
              EventPilot
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#demo-video" className="hover:text-white transition-colors">Product Walkthrough</a>
            <Link 
              to="/signup"
              className="text-zinc-200 hover:text-white font-semibold transition-colors"
            >
              New Event
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/signin"
              className="text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md hover:bg-white/6 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="metallic-btn-primary inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>

            {/* Mobile Nav Toggle */}
            <button
              onClick={() => setMobileNavOpen(prev => !prev)}
              className="md:hidden p-2 text-zinc-300 hover:text-white rounded-lg hover:bg-white/[0.08]"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu for phones & foldables */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0c0d12] px-4 py-3 space-y-2 text-sm animate-in fade-in duration-150">
            <a 
              href="#how-it-works" 
              onClick={() => setMobileNavOpen(false)}
              className="block py-2 text-zinc-300 hover:text-white font-medium"
            >
              How It Works
            </a>
            <a 
              href="#capabilities" 
              onClick={() => setMobileNavOpen(false)}
              className="block py-2 text-zinc-300 hover:text-white font-medium"
            >
              Capabilities
            </a>
            <a 
              href="#demo-video" 
              onClick={() => setMobileNavOpen(false)}
              className="block py-2 text-zinc-300 hover:text-white font-medium"
            >
              Product Walkthrough
            </a>
            <Link 
              to="/signup"
              onClick={() => setMobileNavOpen(false)}
              className="block py-2 text-white font-bold"
            >
              New Event
            </Link>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full metallic-pill text-xs font-semibold text-slate-200 mb-8">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          Living Event Intelligence
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white max-w-4xl mx-auto tracking-tight leading-[1.12]">
          Plan the event. <span className="metallic-chrome-text">See the impact.</span> Stay in control.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          EventPilot is a living event plan that connects budget, timeline, vendors, guests, and risks. 
          When real circumstances change, it calculates the deterministic consequences and uses Gemini to recommend verified trade-offs.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto metallic-btn-primary inline-flex items-center justify-center gap-2 text-base font-bold px-6 py-3.5 rounded-xl shadow-lg"
          >
            Create Your Event Plan
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/signin"
            className="w-full sm:w-auto metallic-btn-secondary inline-flex items-center justify-center gap-2 text-base font-semibold px-6 py-3.5 rounded-xl shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-white" />
            Open Existing Workspace
          </Link>
        </div>

        {/* Hero Interactive Teaser Card */}
        <div className="mt-16 metallic-card rounded-2xl shadow-2xl p-6 sm:p-8 max-w-5xl mx-auto text-left border border-white/15">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                What happens when guest count increases from 180 to 220?
              </h2>
            </div>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 metallic-btn-secondary px-3 py-1.5 rounded-lg"
            >
              Configure in Workspace <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            <div className="bg-zinc-900/80 p-4 rounded-xl border border-white/10">
              <span className="text-xs font-medium text-zinc-400">1. Fact: Headcount Delta</span>
              <div className="text-2xl font-bold text-white mt-1">+40 Guests</div>
              <p className="text-xs text-zinc-400 mt-1">Exceeds registered venue capacity (200) by 20 guests.</p>
            </div>
            <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-600">
              <span className="text-xs font-medium text-zinc-300">2. Deterministic Catering Delta</span>
              <div className="text-2xl font-bold text-white mt-1">+₹72,000</div>
              <p className="text-xs text-zinc-400 mt-1">₹1,800/guest creates a projected ₹31,000 budget overrun.</p>
            </div>
            <div className="bg-zinc-900/80 p-4 rounded-xl border border-white/20">
              <span className="text-xs font-medium text-zinc-200">3. Gemini Trade-Off Reasoner</span>
              <div className="text-base font-bold text-white mt-1">Curated Offset Proposal</div>
              <p className="text-xs text-zinc-400 mt-1">Trim floral decor by ₹43K & streamline live counters to preserve total budget.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Core Differentiator: Deterministic Facts vs AI Reasoning */}
      <section id="how-it-works" className="py-20 bg-[#0c0d12] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              The Core Engineering Principle
            </h2>
            <p className="mt-4 text-base text-zinc-400">
              Deterministic systems own facts. Gemini owns reasoning. The database owns persistence. The user owns decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl metallic-card border border-zinc-700/80">
              <div className="flex items-center gap-2 text-zinc-300 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-zinc-400" />
                Generic AI Planning Apps
              </div>
              <ul className="mt-4 space-y-3.5 text-sm text-zinc-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-zinc-500 font-bold shrink-0 mt-0.5">✕</span>
                  <span className="leading-relaxed">Asks LLM to guess budget arithmetic, producing hallucinations.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-zinc-500 font-bold shrink-0 mt-0.5">✕</span>
                  <span className="leading-relaxed">Unconnected CRUD cards with no dependency awareness.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-zinc-500 font-bold shrink-0 mt-0.5">✕</span>
                  <span className="leading-relaxed">Meaningless badges like "94% AI Accuracy".</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-zinc-500 font-bold shrink-0 mt-0.5">✕</span>
                  <span className="leading-relaxed">AI directly mutates database without user confirmation.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl metallic-card border border-white/20">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-white" />
                EventPilot Architecture
              </div>
              <ul className="mt-4 space-y-3.5 text-sm">
                <li className="flex items-start gap-2.5">
                  <span className="text-white font-bold shrink-0 mt-0.5">✓</span>
                  <div className="leading-relaxed">
                    <strong className="text-white font-semibold">Deterministic Math:</strong>{' '}
                    <span className="text-zinc-300">Pure engines calculate variances, forecast, and critical path.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-white font-bold shrink-0 mt-0.5">✓</span>
                  <div className="leading-relaxed">
                    <strong className="text-white font-semibold">Living Impact Engine:</strong>{' '}
                    <span className="text-zinc-300">Change one variable and immediately see consequences across the whole plan.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-white font-bold shrink-0 mt-0.5">✓</span>
                  <div className="leading-relaxed">
                    <strong className="text-white font-semibold">Human-in-the-Loop:</strong>{' '}
                    <span className="text-zinc-300">Gemini proposes structured adjustments, user approves before applying.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-white font-bold shrink-0 mt-0.5">✓</span>
                  <div className="leading-relaxed">
                    <strong className="text-white font-semibold">Multi-Tenant Isolation:</strong>{' '}
                    <span className="text-zinc-300">Zero data leakage between user event plans.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Product Walkthrough / Demo Advert Video */}
      <section id="demo-video" className="py-20 bg-[#090a0f] text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 metallic-pill px-3 py-1 rounded-full">
            Product Walkthrough
          </span>
          <h2 className="text-3xl font-bold tracking-tight mt-3 text-white">
            Watch the Living Plan in Action
          </h2>
          <p className="mt-3 text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
            From initial event setup to quote extraction and real-time What-If replanning.
          </p>

          <div className="mt-10 max-w-4xl mx-auto metallic-card border border-white/15 rounded-2xl overflow-hidden shadow-2xl relative aspect-video flex items-center justify-center group">
            {/* Playable Video Poster */}
            <div className="absolute inset-0 bg-linear-to-tr from-black via-zinc-950 to-zinc-900/60 flex flex-col items-center justify-center p-8 text-center">
              <button
                onClick={() => setShowVideoModal(true)}
                className="w-20 h-20 rounded-full metallic-btn-primary flex items-center justify-center shadow-2xl transition-transform transform group-hover:scale-105"
                aria-label="Play Product Walkthrough Video"
              >
                <Play className="w-8 h-8 fill-current ml-1 text-black" />
              </button>
              <h3 className="mt-6 text-xl font-bold text-white">
                Interactive Guided Walkthrough
              </h3>
              <p className="text-xs text-zinc-400 mt-2 max-w-md">
                Click to explore the step-by-step hero flow: Add 40 guests, observe budget impact, review Gemini trade-off suggestions, and confirm plan adaptation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Core Capabilities */}
      <section id="capabilities" className="py-20 bg-[#0c0d12] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Six Purpose-Engineered Capabilities
            </h2>
            <p className="mt-4 text-base text-zinc-400">
              Not disconnected pages. A unified, synchronized control room.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="p-6 rounded-2xl metallic-card-interactive">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/10 text-white flex items-center justify-center mb-4">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Deterministic Budgeting</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Tracks allocated, committed, paid, and forecast costs with contingency buffers and category variance alerts.
              </p>
            </div>

            <div className="p-6 rounded-2xl metallic-card-interactive">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/10 text-white flex items-center justify-center mb-4">
                <GitFork className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Critical Path Timeline</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Detects circular dependencies, blocked tasks, and identifies the exact chain of tasks that determine your event date.
              </p>
            </div>

            <div className="p-6 rounded-2xl metallic-card-interactive">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/10 text-white flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Vendor Quote Extractor</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Paste unstructured quote messages. Gemini extracts line items with prompt-injection defense and checks budget variance.
              </p>
            </div>

            <div className="p-6 rounded-2xl metallic-card-interactive">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/10 text-white flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">What-If Ripple Engine</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Simulate changing guest counts or event dates. Watch catering deltas and venue capacity risks propagate instantly.
              </p>
            </div>

            <div className="p-6 rounded-2xl metallic-card-interactive">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/10 text-white flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Event Day Execution</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Run-of-show mode showing current ceremony, upcoming milestones, delay replanning, and quick action contacts.
              </p>
            </div>

            <div className="p-6 rounded-2xl metallic-card-interactive">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/10 text-white flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Security & Isolation</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Strict multi-tenant Firebase Realtime DB isolation, server-side Gemini key protection, and cascading account deletion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Video Walkthrough Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="metallic-card rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-white/15 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">EventPilot Guided Tour</h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-zinc-400 hover:text-white font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900 border border-white/10 text-sm text-zinc-300">
                <p className="font-semibold text-white mb-1">Interactive Event Architecture</p>
                To experience the complete responsive flow directly in your browser, configure your own event plan. EventPilot generates real-time budgets, critical path dependency trees, and run-of-show schedules.
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-zinc-400 hover:text-white"
                >
                  Close
                </button>
                <Link
                  to="/signup"
                  className="metallic-btn-primary px-4 py-2 text-sm font-bold rounded-xl"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Footer */}
      <footer className="mt-auto bg-[#07080b] text-zinc-400 py-12 border-t border-white/10 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="EventPilot"
              className="w-8 h-8 rounded-lg object-contain shadow-xs border border-white/15"
            />
            <span className="font-heading font-bold text-white text-base">EventPilot</span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <Link to="/signin" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link>
            <Link to="/signup" className="hover:text-white transition-colors">New Event</Link>
          </div>

          <div className="text-xs text-zinc-500">
            © {currentYear} EventPilot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};