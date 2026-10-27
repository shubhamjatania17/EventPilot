import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  AlertTriangle
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { seedSample } = useEvent();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleTryDemo = async () => {
    await seedSample();
    navigate('/app/overview');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* 1. Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg tracking-wider">
              EP
            </div>
            <span className="font-heading text-xl font-bold tracking-tight text-slate-900">
              EventPilot
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#capabilities" className="hover:text-slate-900 transition-colors">Capabilities</a>
            <a href="#demo-video" className="hover:text-slate-900 transition-colors">Product Walkthrough</a>
            <button 
              onClick={handleTryDemo}
              className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
            >
              Try Sample Event
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/signin"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg shadow-sm transition-all"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-8">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Virtual Prompt Wars — Challenge 5 Submission
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-950 max-w-4xl mx-auto tracking-tight leading-[1.12]">
          Plan the event. <span className="text-indigo-600">See the impact.</span> Stay in control.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          EventPilot is a living event plan that connects budget, timeline, vendors, guests, and risks. 
          When real circumstances change, it calculates the deterministic consequences and uses Gemini to recommend verified trade-offs.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold text-white bg-slate-900 hover:bg-slate-800 px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Create Your Event Plan
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={handleTryDemo}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 px-6 py-3.5 rounded-xl shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Try Rahul & Ananya Wedding (₹8L)
          </button>
        </div>

        {/* Hero Interactive Teaser Card */}
        <div className="mt-16 bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 max-w-5xl mx-auto text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
                Live Simulation Demonstration
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">
                What happens when guest count increases from 180 to 220?
              </h2>
            </div>
            <button
              onClick={handleTryDemo}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition-colors"
            >
              Open in Live Workspace <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-medium text-slate-500">1. Fact: Headcount Delta</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">+40 Guests</div>
              <p className="text-xs text-slate-600 mt-1">Exceeds registered venue capacity (200) by 20 guests.</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
              <span className="text-xs font-medium text-red-600">2. Deterministic Catering Delta</span>
              <div className="text-2xl font-bold text-red-700 mt-1">+₹72,000</div>
              <p className="text-xs text-red-700 mt-1">₹1,800/guest creates a projected ₹31,000 budget overrun.</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
              <span className="text-xs font-medium text-indigo-600">3. Gemini Trade-Off Reasoner</span>
              <div className="text-base font-bold text-indigo-900 mt-1">Curated Offset Proposal</div>
              <p className="text-xs text-indigo-800 mt-1">Trim floral decor by ₹43K & streamline live counters to preserve total budget.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Core Differentiator: Deterministic Facts vs AI Reasoning */}
      <section id="how-it-works" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-950 tracking-tight">
              The Core Engineering Principle
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Deterministic systems own facts. Gemini owns reasoning. The database owns persistence. The user owns decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-rose-50/70 border border-rose-200">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                Generic AI Planning Apps
              </div>
              <ul className="mt-4 space-y-3 text-sm text-rose-900">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  Asks LLM to guess budget arithmetic, producing hallucinations.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  Unconnected CRUD cards with no dependency awareness.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  Meaningless badges like "94% AI Accuracy".
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  AI directly mutates database without user confirmation.
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                EventPilot Architecture
              </div>
              <ul className="mt-4 space-y-3 text-sm text-emerald-950">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <strong>Deterministic Math:</strong> Pure engines calculate variances, forecast, and critical path.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <strong>Living Impact Engine:</strong> Change one variable and immediately see consequences across the whole plan.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <strong>Human-in-the-Loop:</strong> Gemini proposes structured adjustments, user approves before applying.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <strong>Multi-Tenant Isolation:</strong> Zero data leakage between user event plans.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Product Walkthrough / Demo Advert Video */}
      <section id="demo-video" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Product Walkthrough
          </span>
          <h2 className="text-3xl font-bold tracking-tight mt-2 text-white">
            Watch the Living Plan in Action
          </h2>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            From initial event setup to quote extraction and real-time What-If replanning.
          </p>

          <div className="mt-10 max-w-4xl mx-auto bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl relative aspect-video flex items-center justify-center group">
            {/* Poster / Playable Video Container */}
            <div className="absolute inset-0 bg-linear-to-tr from-slate-950 via-slate-900 to-indigo-950/40 flex flex-col items-center justify-center p-8 text-center">
              <button
                onClick={() => setShowVideoModal(true)}
                className="w-20 h-20 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-transform transform group-hover:scale-105"
                aria-label="Play Product Walkthrough Video"
              >
                <Play className="w-8 h-8 fill-current ml-1" />
              </button>
              <h3 className="mt-6 text-xl font-bold text-slate-100">
                Interactive Guided Walkthrough
              </h3>
              <p className="text-xs text-slate-400 mt-2 max-w-md">
                Click to explore the step-by-step hero flow: Add 40 guests, observe budget impact, review Gemini trade-off suggestions, and confirm plan adaptation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Core Capabilities */}
      <section id="capabilities" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-950 tracking-tight">
              Six Purpose-Engineered Capabilities
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Not disconnected pages. A unified, synchronized control room.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Deterministic Budgeting</h3>
              <p className="mt-2 text-sm text-slate-600">
                Tracks allocated, committed, paid, and forecast costs with contingency buffers and category variance alerts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <GitFork className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Critical Path Timeline</h3>
              <p className="mt-2 text-sm text-slate-600">
                Detects circular dependencies, blocked tasks, and identifies the exact chain of tasks that determine your event date.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Vendor Quote Extractor</h3>
              <p className="mt-2 text-sm text-slate-600">
                Paste unstructured quote messages. Gemini extracts line items with prompt-injection defense and checks budget variance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">What-If Ripple Engine</h3>
              <p className="mt-2 text-sm text-slate-600">
                Simulate changing guest counts or event dates. Watch catering deltas and venue capacity risks propagate instantly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Event Day Execution</h3>
              <p className="mt-2 text-sm text-slate-600">
                Run-of-show mode showing current ceremony, upcoming milestones, delay replanning, and quick action contacts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Security & Isolation</h3>
              <p className="mt-2 text-sm text-slate-600">
                Strict multi-tenant MongoDB query boundaries, server-side Gemini key protection, and cascading account deletion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Video Walkthrough Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">EventPilot Guided Tour</h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700">
                <p className="font-semibold text-slate-900 mb-1">Live Competition Demonstration</p>
                To experience the complete responsive flow directly in your browser, click below to open the pre-loaded <strong>Rahul & Ananya Jaipur Wedding (180 guests, ₹8L)</strong> sample event.
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    handleTryDemo();
                  }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Launch Sample Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              EP
            </div>
            <span className="font-heading font-bold text-white text-base">EventPilot</span>
            <span className="text-xs text-slate-500">| Virtual Prompt Wars Challenge 5</span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <Link to="/signin" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link>
            <button onClick={handleTryDemo} className="hover:text-white transition-colors">Sample Event</button>
          </div>

          <div className="text-xs text-slate-500">
            © {currentYear} EventPilot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
