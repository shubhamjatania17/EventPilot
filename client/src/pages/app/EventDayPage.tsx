import React, { useState } from 'react';
import { Clock, AlertTriangle, CheckCircle2, Plus, Sparkles, MapPin, User } from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { EventDayItem } from '../../types';

export const EventDayPage: React.FC = () => {
  const { activeEvent, updateActiveEvent } = useEvent();
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemTime, setItemTime] = useState('');
  const [itemTitle, setItemTitle] = useState('');
  const [itemLocation, setItemLocation] = useState('');
  const [itemLead, setItemLead] = useState('');
  const [replanningNotes, setReplanningNotes] = useState<string | null>(null);

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

        <button
          onClick={() => setShowAddItem(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Schedule Block
        </button>
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

      {/* Add Schedule Block Modal */}
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
              placeholder="Responsible Person (e.g. Priest / Rahul)"
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
