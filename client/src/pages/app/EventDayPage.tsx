import React, { useState } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  Plus, 
  Sparkles, 
  MapPin, 
  User, 
  ShieldAlert, 
  Copy, 
  Check, 
  X, 
  Radio
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { api } from '../../services/api';
import { EventDayItem, IncidentResponse } from '../../types';

export const EventDayPage: React.FC = () => {
  const { activeEvent, updateActiveEvent } = useEvent();
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemTime, setItemTime] = useState('');
  const [itemTitle, setItemTitle] = useState('');
  const [itemLocation, setItemLocation] = useState('');
  const [itemLead, setItemLead] = useState('');
  const [replanningNotes, setReplanningNotes] = useState<string | null>(null);

  // Crisis & Incident Responder State
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentText, setIncidentText] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [isAnalyzingIncident, setIsAnalyzingIncident] = useState(false);
  const [incidentResult, setIncidentResult] = useState<IncidentResponse | null>(null);
  const [copiedEmcee, setCopiedEmcee] = useState(false);

  if (!activeEvent) return null;

  const handleUpdateStatus = async (itemId: string, status: EventDayItem['status']) => {
    const updated = activeEvent.eventDaySchedule.map(item =>
      item.id === itemId ? { ...item, status } : item
    );
    await updateActiveEvent({ eventDaySchedule: updated });
  };

  const handleApplyDelay = async (itemId: string, delayMinutes: number) => {
    const updated = activeEvent.eventDaySchedule.map(item =>
      item.id === itemId ? { ...item, delayMinutes, status: 'delayed' as const } : item
    );
    await updateActiveEvent({ eventDaySchedule: updated });
    setReplanningNotes(
      `Applied ${delayMinutes} minute delay to schedule. Downstream ceremonies and dining shifted automatically.`
    );
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTime.trim() || !itemTitle.trim()) return;

    const newItem: EventDayItem = {
      id: `eds-${Date.now()}`,
      time: itemTime.trim(),
      title: itemTitle.trim(),
      location: itemLocation.trim() || undefined,
      responsiblePerson: itemLead.trim() || undefined,
      status: 'upcoming',
    };

    await updateActiveEvent({
      eventDaySchedule: [...activeEvent.eventDaySchedule, newItem],
    });

    setItemTime('');
    setItemTitle('');
    setItemLocation('');
    setItemLead('');
    setShowAddItem(false);
  };

  const handleTriageIncident = async (presetPrompt?: string) => {
    const query = presetPrompt || incidentText;
    if (!query.trim()) return;
    if (presetPrompt) setIncidentText(presetPrompt);

    setIsAnalyzingIncident(true);
    setIncidentResult(null);

    try {
      const currentItem = activeEvent.eventDaySchedule.find(i => i.status === 'current') || activeEvent.eventDaySchedule[0];
      const res = await api.respondToIncident({
        eventId: activeEvent.id,
        incident: query,
        currentItemTitle: currentItem?.title,
        severity: incidentSeverity,
      });
      setIncidentResult(res);
    } catch (err: unknown) {
      console.error('Incident triage failed:', err);
    } finally {
      setIsAnalyzingIncident(false);
    }
  };

  const handleCopyEmcee = () => {
    if (incidentResult?.emceeScript) {
      navigator.clipboard.writeText(incidentResult.emceeScript);
      setCopiedEmcee(true);
      setTimeout(() => setCopiedEmcee(false), 2000);
    }
  };

  const handleApplyIncidentDelay = async () => {
    if (!incidentResult) return;
    const delay = incidentResult.recommendedDelayMinutes || 15;

    const updated = activeEvent.eventDaySchedule.map(item => {
      if (item.status === 'current' || item.status === 'upcoming') {
        return {
          ...item,
          delayMinutes: (item.delayMinutes || 0) + delay,
          status: item.status === 'current' ? ('delayed' as const) : item.status,
        };
      }
      return item;
    });

    await updateActiveEvent({ eventDaySchedule: updated });
    setReplanningNotes(
      `🚨 Incident Handled: Added ${delay}m recovery buffer to run-of-show. ${incidentResult.coordinatorNotes}`
    );
    setShowIncidentModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
            <Clock className="w-3.5 h-3.5" /> Live Execution Mode
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
            Event Day Run-of-Show
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Hour-by-hour operational itinerary with instant delay replanning and coordinator dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowIncidentModal(true)}
            className="inline-flex items-center gap-2 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
            AI Crisis & Incident Responder
          </button>

          <button
            onClick={() => setShowAddItem(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Schedule Block
          </button>
        </div>
      </div>

      {/* Delay Replanning Feedback Alert */}
      {replanningNotes && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{replanningNotes}</span>
          </div>
          <button
            onClick={() => setReplanningNotes(null)}
            className="font-bold underline text-amber-800 hover:text-amber-950"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* AI Crisis & Incident Responder Modal */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-950 text-base">
                    Event Day Crisis & Incident Responder
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time AI triage, run-of-show delay math, emcee script, and coordinator guidance.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIncidentModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick incident presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Quick Scenario Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '🌧️ Sudden Heavy Rain', text: 'Heavy unexpected rain began at outdoor venue, need immediate pavilion relocation.' },
                  { label: '⏳ Catering 45m Late', text: 'Catering truck broke down in transit, dinner buffet delayed by 45 minutes.' },
                  { label: '🔊 Audio / Mic Outage', text: 'Main sound console experienced power outage right before the prime announcement.' },
                  { label: '🚗 VIP / Speaker Late', text: 'Keynote VIP guest is caught in heavy gridlock traffic and will be 30 minutes late.' },
                ].map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleTriageIncident(preset.text)}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom incident description */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Or Describe the Live Incident:
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">Severity:</span>
                  <select
                    value={incidentSeverity}
                    onChange={e => setIncidentSeverity(e.target.value as any)}
                    className="text-xs border border-slate-300 rounded-md px-2 py-1 bg-white font-semibold text-slate-700"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <textarea
                rows={3}
                value={incidentText}
                onChange={e => setIncidentText(e.target.value)}
                placeholder="e.g. The priest arrived 30 mins late and stage spotlight bulb exploded..."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleTriageIncident()}
                  disabled={isAnalyzingIncident || !incidentText.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-50 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isAnalyzingIncident ? 'Triaging Incident...' : 'Analyze & Generate Recovery Plan'}
                </button>
              </div>
            </div>

            {/* Incident Analysis Results */}
            {incidentResult && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
                {/* Severity & Summary Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        incidentResult.severity === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : incidentResult.severity === 'high'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {incidentResult.severity} Severity
                      </span>
                      <span className="font-bold text-slate-900">
                        {incidentResult.incidentSummary}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-500 block">Recommended Buffer</span>
                    <span className="text-sm font-extrabold text-rose-600">
                      +{incidentResult.recommendedDelayMinutes} Minutes
                    </span>
                  </div>
                </div>

                {/* Immediate Action Steps */}
                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-rose-600" /> Immediate Dispatch Steps
                  </h4>
                  <ul className="space-y-1 text-slate-700 list-disc list-inside bg-white p-3 rounded-lg border border-slate-200">
                    {incidentResult.immediateActionSteps.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">{step}</li>
                    ))}
                  </ul>
                </div>

                {/* Emcee Script with Copy Button */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 text-xs">
                      🎤 Public Emcee / Host Script (Preserve Guest Poise)
                    </span>
                    <button
                      onClick={handleCopyEmcee}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-white hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-md transition-colors"
                    >
                      {copiedEmcee ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-600" /> Copy Script
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-amber-900 italic bg-white/80 p-2.5 rounded-lg border border-amber-200 leading-relaxed">
                    "{incidentResult.emceeScript}"
                  </p>
                </div>

                {/* Coordinator Notes */}
                <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                  <strong className="text-slate-800">Staff Note:</strong> {incidentResult.coordinatorNotes}
                </div>

                {/* Apply Schedule Action CTA */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => setShowIncidentModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={handleApplyIncidentDelay}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Apply +{incidentResult.recommendedDelayMinutes}m to Run-of-Show
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Schedule Block Form */}
      {showAddItem && (
        <form onSubmit={handleAddItem} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Add Schedule Item</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Time (e.g. 04:30 PM)"
              value={itemTime}
              onChange={e => setItemTime(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Item Title (e.g. Varmala Ceremony)"
              value={itemTitle}
              onChange={e => setItemTitle(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg sm:col-span-3"
              required
            />
            <input
              type="text"
              placeholder="Location (e.g. Marble Pavilion)"
              value={itemLocation}
              onChange={e => setItemLocation(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg sm:col-span-2"
            />
            <input
              type="text"
              placeholder="Responsible Person (e.g. Priest / Lead)"
              value={itemLead}
              onChange={e => setItemLead(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg sm:col-span-2"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddItem(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              Save Schedule Block
            </button>
          </div>
        </form>
      )}

      {/* Hourly Timeline */}
      <div className="space-y-4">
        {activeEvent.eventDaySchedule.map((item, index) => (
          <div 
            key={item.id}
            className={`p-5 rounded-2xl border transition-all ${
              item.status === 'current' 
                ? 'bg-indigo-50/70 border-indigo-300 shadow-sm ring-1 ring-indigo-200'
                : item.status === 'done'
                ? 'bg-slate-50 border-slate-200 opacity-60'
                : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="text-center shrink-0 w-20">
                  <div className="font-heading font-extrabold text-base text-slate-900">
                    {item.time}
                  </div>
                  {item.delayMinutes ? (
                    <span className="text-[10px] font-bold text-red-600 block mt-0.5">
                      +{item.delayMinutes}m delay
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Step #{index + 1}
                    </span>
                  )}
                </div>

                <div className="border-l border-slate-200 pl-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-sm">
                      {item.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.status === 'current'
                        ? 'bg-indigo-100 text-indigo-800'
                        : item.status === 'done'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'delayed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                    {item.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {item.location}
                      </span>
                    )}
                    {item.responsiblePerson && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Lead: {item.responsiblePerson}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Replanning Buttons */}
              <div className="flex items-center gap-2 sm:self-center">
                <button
                  onClick={() => handleUpdateStatus(item.id, 'current')}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-md border border-slate-300 hover:bg-slate-100 text-slate-700"
                >
                  Set Live
                </button>
                <button
                  onClick={() => handleUpdateStatus(item.id, 'done')}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Done
                </button>
                <button
                  onClick={() => handleApplyDelay(item.id, 15)}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100"
                >
                  +15m Delay
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};