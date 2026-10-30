import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  IndianRupee, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Sliders,
  AlertTriangle,
  X,
  Heart,
  Cake,
  Briefcase,
  PartyPopper
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { EventState, EventMeta } from '../../types';

export const EventsPage: React.FC = () => {
  const { 
    eventsList, 
    activeEvent, 
    switchEvent, 
    deleteEvent, 
    updateActiveEvent,
    setIsNewEventModalOpen,
    setNewEventDefaultType
  } = useEvent();

  // Edit Drawer State
  const [editingEvent, setEditingEvent] = useState<EventState | null>(null);
  const [editForm, setEditForm] = useState<Partial<EventMeta>>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStartEdit = (event: EventState) => {
    setEditingEvent(event);
    setEditForm({ ...event.meta });
    setSaveSuccess(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setSaving(true);
    try {
      await updateActiveEvent({
        meta: {
          ...editingEvent.meta,
          ...editForm,
          name: editForm.name || editingEvent.meta.name,
          date: editForm.date || editingEvent.meta.date,
          location: editForm.location || editingEvent.meta.location,
          guestCount: Number(editForm.guestCount) || editingEvent.meta.guestCount,
          totalBudget: Number(editForm.totalBudget) || editingEvent.meta.totalBudget,
          contingencyPercent: Number(editForm.contingencyPercent) || editingEvent.meta.contingencyPercent,
          venueCapacity: editForm.venueCapacity ? Number(editForm.venueCapacity) : editingEvent.meta.venueCapacity,
          cateringCostPerGuest: editForm.cateringCostPerGuest ? Number(editForm.cateringCostPerGuest) : editingEvent.meta.cateringCostPerGuest,
        },
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setEditingEvent(null);
        setSaveSuccess(false);
      }, 800);
    } catch (err) {
      console.error('Failed to save event edits:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteEvent(deletingId);
      setDeletingId(null);
    } catch (err) {
      console.error('Failed to delete event:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeIcon = (type: string = '') => {
    switch (type.toLowerCase()) {
      case 'wedding':
        return <Heart className="w-4 h-4 text-rose-600" />;
      case 'birthday':
        return <Cake className="w-4 h-4 text-amber-600" />;
      case 'corporate':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      default:
        return <PartyPopper className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Event Management Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
            My Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Switch between your active living plans, configure new events, or update event details.
          </p>
        </div>

        <button
          onClick={() => setIsNewEventModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-xs transition-all text-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      {/* Events Grid */}
      {eventsList.length === 0 ? (
        <div className="p-10 sm:p-14 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-slate-900">No events configured yet</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
              Create an event to unlock full AI planning, live budget calculators, dependency-aware timelines, and vendor workflows.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <button
              onClick={() => {
                setNewEventDefaultType('wedding');
                setIsNewEventModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-xl text-xs transition-colors shadow-2xs"
            >
              <Heart className="w-3.5 h-3.5 text-rose-600" />
              Wedding
            </button>
            <button
              onClick={() => {
                setNewEventDefaultType('birthday');
                setIsNewEventModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-semibold rounded-xl text-xs transition-colors shadow-2xs"
            >
              <Cake className="w-3.5 h-3.5 text-amber-600" />
              Birthday
            </button>
            <button
              onClick={() => {
                setNewEventDefaultType('corporate');
                setIsNewEventModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold rounded-xl text-xs transition-colors shadow-2xs"
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              Corporate Summit
            </button>
            <button
              onClick={() => {
                setNewEventDefaultType('community');
                setIsNewEventModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold rounded-xl text-xs transition-colors shadow-2xs"
            >
              <PartyPopper className="w-3.5 h-3.5 text-purple-600" />
              Community Festival
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setNewEventDefaultType('custom');
                setIsNewEventModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              Configure Custom Event
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {eventsList.map(ev => {
            const isActive = activeEvent?.id === ev.id;
            return (
              <div
                key={ev.id}
                className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs ${
                  isActive
                    ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {/* Card Top */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                      {getTypeIcon(ev.meta?.type)}
                      {ev.meta?.type || 'Event'}
                    </span>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Active Living Plan
                      </span>
                    ) : (
                      <button
                        onClick={() => switchEvent(ev.id)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        Switch to this →
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-1">
                      {ev.meta?.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {ev.meta?.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {ev.meta?.location}
                      </span>
                    </div>
                  </div>

                  {/* Metrics Badges */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Total Budget
                      </div>
                      <div className="font-extrabold text-slate-900 mt-0.5">
                        ₹{(ev.budgetSummary?.total || ev.meta?.totalBudget || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Guest Capacity
                      </div>
                      <div className="font-extrabold text-slate-900 mt-0.5 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        {ev.meta?.guestCount || 0} pax
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleStartEdit(activeEvent?.id === ev.id ? activeEvent : ev)}
                    className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Details
                  </button>

                  <div className="flex items-center gap-2">
                    {!isActive && (
                      <button
                        onClick={() => switchEvent(ev.id)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
                      >
                        Select
                      </button>
                    )}
                    <button
                      onClick={() => setDeletingId(ev.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 text-xs font-semibold transition-colors border border-transparent hover:border-red-200"
                      title="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Event Details Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Edit Event Details: {editingEvent.meta.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingEvent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs sm:text-sm">
              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Event details updated successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.date || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location / Venue
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.location || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expected Guests
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editForm.guestCount || 0}
                    onChange={e => setEditForm(prev => ({ ...prev, guestCount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Venue Capacity Limit
                  </label>
                  <input
                    type="number"
                    value={editForm.venueCapacity || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, venueCapacity: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Budget (₹)
                  </label>
                  <input
                    type="number"
                    required
                    step={1000}
                    value={editForm.totalBudget || 0}
                    onChange={e => setEditForm(prev => ({ ...prev, totalBudget: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contingency Reserve %
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={editForm.contingencyPercent || 10}
                    onChange={e => setEditForm(prev => ({ ...prev, contingencyPercent: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Theme & Aesthetics
                </label>
                <input
                  type="text"
                  value={editForm.theme || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, theme: e.target.value }))}
                  placeholder="e.g. Royal Heritage, Neon Cyberpunk, Minimalist Garden"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const idToDelete = editingEvent.id;
                    setEditingEvent(null);
                    setDeletingId(idToDelete);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Event
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Event Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Delete "{eventsList.find(e => e.id === deletingId)?.meta?.name || 'this event'}"?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This will permanently erase all budget items, timeline tasks, vendor quotes, and guest entries associated with this plan. This action is irreversible.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
