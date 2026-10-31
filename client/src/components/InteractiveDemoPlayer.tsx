import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Calculator, 
  GitFork, 
  FileText, 
  Clock, 
  Sliders, 
  Maximize2,
  ExternalLink
} from 'lucide-react';

interface Scene {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

const SCENES: Scene[] = [
  {
    id: 'setup',
    tag: '01. Setup & Budget',
    title: 'Deterministic Event Planning',
    subtitle: 'Zero math hallucinations with guaranteed category allocations.',
    icon: Calculator
  },
  {
    id: 'what-if',
    tag: '02. What-If Simulation',
    title: 'Real-Time Ripple Engine',
    subtitle: 'Simulate guest or date changes and watch atomic deltas propagate.',
    icon: Sliders
  },
  {
    id: 'tradeoffs',
    tag: '03. Gemini AI Trade-offs',
    title: 'Intelligent Budget Rebalancing',
    subtitle: 'Gemini analyzes financial overruns and proposes cost-neutral solutions.',
    icon: Sparkles
  },
  {
    id: 'timeline',
    tag: '04. Critical Path Timeline',
    title: 'Topological Task Dependencies',
    subtitle: 'Automated critical path computation and circular blocker detection.',
    icon: GitFork
  },
  {
    id: 'quotes',
    tag: '05. AI Quote Extractor',
    title: 'Unstructured Message Parsing',
    subtitle: 'Paste raw vendor emails or chats into verified line-item budgets.',
    icon: FileText
  },
  {
    id: 'event-day',
    tag: '06. Day-Of Execution',
    title: 'Live Run-of-Show Control',
    subtitle: 'Real-time ceremony tracking, delay cascade replanning, and SOS contacts.',
    icon: Clock
  }
];

const SCENE_DURATION_SEC = 7;

export const InteractiveDemoPlayer: React.FC<{
  userLoggedIn?: boolean;
  onOpenFullscreen?: () => void;
}> = ({ userLoggedIn = false, onOpenFullscreen }) => {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [tradeoffApplied, setTradeoffApplied] = useState(false);
  const [sliderPax, setSliderPax] = useState(150);

  const timerRef = useRef<number | null>(null);

  // Auto-play progress loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = 50;
    const step = 100 / ((SCENE_DURATION_SEC * 1000) / intervalMs);

    timerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next scene
          setCurrentSceneIdx((curr) => (curr + 1) % SCENES.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSceneIdx]);

  // Animate slider during scene 1 (What-If)
  useEffect(() => {
    let t0: number | undefined;
    let t1: number | undefined;
    let t2: number | undefined;

    if (currentSceneIdx === 1) {
      t0 = window.setTimeout(() => setSliderPax(150), 0);
      t1 = window.setTimeout(() => setSliderPax(170), 1200);
      t2 = window.setTimeout(() => setSliderPax(190), 2400);
    } else if (currentSceneIdx === 2) {
      t0 = window.setTimeout(() => setSliderPax(190), 0);
    } else {
      t0 = window.setTimeout(() => {
        setTradeoffApplied(false);
        setSliderPax(150);
      }, 0);
    }

    return () => {
      if (t0) clearTimeout(t0);
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
    };
  }, [currentSceneIdx]);

  const selectScene = (idx: number) => {
    setCurrentSceneIdx(idx);
    setProgress(0);
  };

  const currentScene = SCENES[currentSceneIdx];

  return (
    <div className="w-full metallic-card border border-white/15 rounded-2xl overflow-hidden shadow-2xl bg-[#0c0d12] flex flex-col">
      {/* Player Topbar: Mac-style chrome + Tab bar */}
      <div className="bg-zinc-950/90 border-b border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-3 text-xs font-mono font-medium text-zinc-400 hidden sm:inline">
            EventPilot Demo • 60 FPS Interactive Tour
          </span>
        </div>

        {/* Scene Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {SCENES.map((scene, idx) => {
            const isActive = idx === currentSceneIdx;
            return (
              <button
                key={scene.id}
                onClick={() => selectScene(idx)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {scene.tag.split('.')[0]}
              </button>
            );
          })}
        </div>

        {/* Fullscreen / Expand */}
        {onOpenFullscreen && (
          <button
            onClick={onOpenFullscreen}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Expand Fullscreen"
            aria-label="Expand Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Video Simulation Stage (16:9 Aspect Ratio Container) */}
      <div className="relative aspect-video w-full bg-[#08090d] p-4 sm:p-6 lg:p-8 flex flex-col justify-between overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Scene Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0">
              <currentScene.icon className="w-5 h-5 text-zinc-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-white/10 text-zinc-300">
                  {currentScene.tag}
                </span>
                <span className="text-xs text-zinc-500">•</span>
                <span className="text-xs text-emerald-400 font-mono">LIVE PREVIEW</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                {currentScene.title}
              </h3>
            </div>
          </div>
          <p className="text-xs text-zinc-400 max-w-sm text-left sm:text-right hidden md:block">
            {currentScene.subtitle}
          </p>
        </div>

        {/* Interactive Screen Content Based on Scene */}
        <div className="relative z-10 my-auto py-2">
          {/* SCENE 0: Setup & Deterministic Budget */}
          {currentSceneIdx === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-5 p-4 rounded-xl bg-zinc-900/90 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Active Living Plan</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">60 days left</span>
                </div>
                <h4 className="font-bold text-white text-base">Shubham's 21st Birthday Getaway</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-zinc-950 border border-white/5">
                    <span className="text-zinc-500 block">Location</span>
                    <span className="text-zinc-200 font-medium">Lonavla, Villa</span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-950 border border-white/5">
                    <span className="text-zinc-500 block">Baseline Guests</span>
                    <span className="text-zinc-200 font-medium">150 Guests</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-linear-to-r from-zinc-950 to-zinc-900 border border-white/10">
                  <span className="text-xs text-zinc-400 block">Allocated Total Budget</span>
                  <span className="text-2xl font-bold font-mono text-white">₹2,00,000</span>
                  <span className="text-[10px] text-emerald-400 block mt-1">✓ Contingency reserve locked at ₹50,000 (25%)</span>
                </div>
              </div>

              <div className="md:col-span-7 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400 font-medium px-2">
                  <span>Category Allocation</span>
                  <span>Amount</span>
                </div>
                {[
                  { name: 'Venue / Villa Reservation', amt: '₹52,500', pct: '26%' },
                  { name: 'Food, Cocktails & Beverages', amt: '₹52,500', pct: '26%' },
                  { name: 'Theme Balloon Arch & Photobooth', amt: '₹18,000', pct: '9%' },
                  { name: 'Custom Fondant Cake & Dessert Bar', amt: '₹15,000', pct: '7%' },
                  { name: 'DJ Sound, Favors & Hampers', amt: '₹12,000', pct: '6%' },
                  { name: 'Contingency Safety Reserve', amt: '₹50,000', pct: '25%', highlight: true },
                ].map((cat, i) => (
                  <div 
                    key={i} 
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      cat.highlight 
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' 
                        : 'bg-zinc-900/60 border-white/5 text-zinc-300'
                    }`}
                  >
                    <span className="font-medium">{cat.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-500 font-mono text-[11px]">{cat.pct}</span>
                      <span className="font-mono font-bold text-white">{cat.amt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCENE 1: What-If Ripple Engine */}
          {currentSceneIdx === 1 && (
            <div className="space-y-4 max-w-2xl mx-auto text-left">
              <div className="p-4 rounded-xl bg-zinc-900/90 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">Live Guest Simulation Slider</span>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/40">
                    {sliderPax} Guests ({sliderPax > 150 ? `+${sliderPax - 150}` : 'Base'})
                  </span>
                </div>
                
                {/* Simulated interactive slider */}
                <input 
                  type="range" 
                  min="150" 
                  max="200" 
                  value={sliderPax}
                  onChange={(e) => setSliderPax(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer h-2 bg-zinc-800 rounded-lg"
                />

                <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Base: 150</span>
                  <span>Preset: +20 (170)</span>
                  <span>Hero Flow: +40 (190)</span>
                  <span>Max Venue Limit: 200</span>
                </div>
              </div>

              {/* Ripple Impact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/10">
                  <span className="text-[11px] text-zinc-400 block">Catering Delta</span>
                  <span className={`text-xl font-bold font-mono mt-1 block ${sliderPax > 150 ? 'text-amber-400' : 'text-zinc-300'}`}>
                    {sliderPax > 150 ? `+₹${(sliderPax - 150) * 350}` : '₹0'}
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-1 block">@ ₹350 per head buffet</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900 border border-white/10">
                  <span className="text-[11px] text-zinc-400 block">Projected Total</span>
                  <span className={`text-xl font-bold font-mono mt-1 block ${sliderPax > 150 ? 'text-red-400' : 'text-white'}`}>
                    ₹{(200000 + (sliderPax - 150) * 350).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-red-400 mt-1 block">
                    {sliderPax > 150 ? `+₹${(sliderPax - 150) * 350} over budget` : 'Balanced'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900 border border-white/10">
                  <span className="text-[11px] text-zinc-400 block">Venue Capacity</span>
                  <span className="text-xl font-bold font-mono text-zinc-200 mt-1 block">
                    {Math.round((sliderPax / 200) * 100)}%
                  </span>
                  <span className="text-[10px] text-amber-400 mt-1 block">
                    {sliderPax >= 190 ? '⚠️ Nearing 200 Villa Limit' : 'Safe Headroom'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SCENE 2: Gemini AI Trade-offs */}
          {currentSceneIdx === 2 && (
            <div className="space-y-4 max-w-2xl mx-auto text-left">
              <div className="p-3 rounded-xl bg-linear-to-r from-purple-950/40 via-zinc-900 to-zinc-900 border border-purple-500/30 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-white">Gemini 2.5 Flash Reasoning Engine</span>
                  <p className="text-zinc-300">Detected ₹14,000 budget overrun from 40 extra guests. Generated 2 mathematically sound trade-offs:</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1 */}
                <div className={`p-4 rounded-xl border transition-all ${
                  tradeoffApplied 
                    ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/50' 
                    : 'bg-zinc-900 border-white/10 hover:border-white/25'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Strategy A (Recommended)</span>
                    {tradeoffApplied ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full">ACTIVE</span>
                    ) : (
                      <span className="text-[10px] text-zinc-400">Cost-Neutral</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 mt-2">
                    Reallocate ₹14,000 from <strong className="text-white">Contingency Reserve</strong> (₹50k → ₹36k). Leaves 18% safety buffer without touching vendors.
                  </p>
                  <button
                    onClick={() => setTradeoffApplied(!tradeoffApplied)}
                    className="mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-bold metallic-btn-primary"
                  >
                    {tradeoffApplied ? '✓ Trade-Off Applied (Budget Balanced)' : 'Apply Strategy A'}
                  </button>
                </div>

                {/* Option 2 */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 opacity-70">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300">Strategy B</span>
                    <span className="text-[10px] text-zinc-500">Vendor Trimming</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">
                    Downgrade DJ package to essential sound (-₹5,000) and trim cocktail bar variety (-₹9,000). Preserves 100% contingency.
                  </p>
                  <button disabled className="mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-medium text-zinc-500 bg-zinc-950 border border-white/5">
                    Alternative Option
                  </button>
                </div>
              </div>

              {tradeoffApplied && (
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Success: Living Plan adapted. ₹2,00,000 ceiling maintained with zero unbacked debt.</span>
                </div>
              )}
            </div>
          )}

          {/* SCENE 3: Critical Path Timeline */}
          {currentSceneIdx === 3 && (
            <div className="space-y-4 max-w-2xl mx-auto text-left">
              <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-400">Critical Path Duration: </span>
                  <span className="font-bold text-white font-mono">42 Days to Completion</span>
                </div>
                <span className="text-emerald-400 font-mono font-medium">✓ 0 Circular Dependencies Detected</span>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'Book Lonavla Villa Venue', dur: '5 days', status: 'Completed', color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200' },
                  { name: 'Finalize Catering Menu & Advance', dur: '7 days', status: 'In Progress (Critical Path)', color: 'border-amber-500/40 bg-amber-950/20 text-amber-200', critical: true },
                  { name: 'Dispatch Physical & Digital Invites', dur: '3 days', status: 'Blocked by Catering Menu', color: 'border-zinc-800 bg-zinc-900/60 text-zinc-400', blocked: true },
                  { name: 'Confirm Sound & Photobooth Setup', dur: '2 days', status: 'Scheduled', color: 'border-zinc-800 bg-zinc-900/60 text-zinc-400' },
                ].map((task, i) => (
                  <div key={i} className={`p-3 rounded-xl border flex items-center justify-between text-xs ${task.color}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${task.critical ? 'bg-amber-400 animate-pulse' : task.blocked ? 'bg-red-400' : 'bg-emerald-400'}`} />
                      <span className="font-semibold">{task.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-zinc-400">{task.dur}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10">{task.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCENE 4: AI Quote Extractor */}
          {currentSceneIdx === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="p-3 rounded-xl bg-zinc-950 border border-white/10 space-y-2">
                <span className="text-[11px] font-semibold text-zinc-400 block">Raw Unstructured Vendor Message (Input)</span>
                <div className="p-3 rounded-lg bg-zinc-900/80 font-mono text-[11px] text-zinc-300 border border-white/5 space-y-1">
                  <p>"Hi Shubham, for the 190 pax catering at Lonavla:</p>
                  <p>• Royal Buffet: ₹350 x 190 = ₹66,500</p>
                  <p>• Welcome mocktails & bar setup: ₹7,500</p>
                  <p>Total = ₹74,000. 30% advance deposit (₹22,200) required to block dates."</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/90 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-400">Gemini Extracted Line Items</span>
                  <span className="text-[10px] font-mono text-zinc-400">Prompt-Shield Verified</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="p-2 rounded bg-zinc-950 flex justify-between">
                    <span className="text-zinc-300">Buffet (190 pax @ ₹350)</span>
                    <span className="font-mono text-white">₹66,500</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-950 flex justify-between">
                    <span className="text-zinc-300">Mocktails & Bar</span>
                    <span className="font-mono text-white">₹7,500</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-950 flex justify-between border-t border-white/10 font-bold">
                    <span className="text-zinc-200">Total Committed</span>
                    <span className="font-mono text-emerald-400">₹74,000</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCENE 5: Day-Of Execution Mode */}
          {currentSceneIdx === 5 && (
            <div className="space-y-3 max-w-2xl mx-auto text-left">
              <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-white">Live Event Mode • Running Now</span>
                </div>
                <button className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 text-[11px] hover:bg-amber-500/30">
                  +15m Delay Replanner
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-zinc-900/40 border border-white/5 flex items-center justify-between text-zinc-500">
                  <span>18:00 — Guest Arrival & Welcome Cocktails</span>
                  <span className="text-[10px] font-medium text-emerald-500">COMPLETED</span>
                </div>
                <div className="p-3 rounded-xl bg-linear-to-r from-zinc-900 to-zinc-800 border border-cyan-500/40 flex items-center justify-between text-white shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-bold">19:30 — Cake Cutting, Toast & Speeches</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">ACTIVE (18m left)</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between text-zinc-300">
                  <span>20:30 — Dinner Buffet & DJ Dance Floor Open</span>
                  <span className="text-[10px] font-medium text-zinc-500">UPCOMING</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Player Controls Bar at Bottom */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col gap-2">
          {/* Timeline Scrubber */}
          <div className="w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-linear-to-r from-cyan-400 via-white to-purple-400 h-full rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold hover:scale-105 transition-transform"
                title={isPlaying ? 'Pause Demo' : 'Play Demo'}
                aria-label={isPlaying ? 'Pause Demo' : 'Play Demo'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  setCurrentSceneIdx((curr) => (curr + 1) % SCENES.length);
                  setProgress(0);
                }}
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
                title="Next Scene"
                aria-label="Next Scene"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setCurrentSceneIdx(0);
                  setProgress(0);
                }}
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
                title="Restart Tour"
                aria-label="Restart Tour"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <span className="font-mono text-[11px] text-zinc-500 hidden sm:inline">
                Scene {currentSceneIdx + 1} of {SCENES.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={userLoggedIn ? "/app/overview" : "/signup"}
                target="_blank"
                rel="noopener noreferrer"
                className="metallic-btn-primary px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <span>{userLoggedIn ? "Open Live App" : "Try Free in Browser"}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
