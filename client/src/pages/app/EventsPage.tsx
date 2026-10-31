import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
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
        return <Heart className="w-4 h-4 text-white" />;
      case 'birthday':
        return <Cake className="w-4 h-4 text-white" />;
      case 'corporate':
        return <Briefcase className="w-4 h-4 text-white" />;
      default:
        return <PartyPopper className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Event Management Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            My Events
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Switch between your active living plans, configure new events, or update event details.
          </p>
        </div>

        <button
          onClick={() => setIsNewEventModalOpen(true)}
          className="metallic-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      {/* Events Grid */}
      {eventsList.length === 0 ? (
        <div className="p-10 sm:p-14 text-center metallic-card rounded-3xl border border-white/15 shadow-2xl space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-zinc-800 border border-white/15 text-white flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-white">No events configured yet</h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mt-1.5 leading-relaxed">
              Create an event to unlock full AI planning, live budget calculators, dependency-aware timelines, and vendor workflows.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <button
              onClick={() => {
                setNewEventDefaultType('wedding');
                setIsNewEventModalOpen(true);
              }}
              className="metallic-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold"
            >
              <Heart className="w-3.5 h-3.5 text-white" />
              Wedding
            </button>
            <button
              onClick={() => {
                setNewEventDefaultType('birthday');
                setIsNewEventModalOpen(true);
              }}
              className="metallic-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold"
            >
              <Cake className="w-3.5 h-3.5 text-white" />
              Birthday
            </button>
            <button
              onClick={() => {
                setNewEventDefaultType('corporate');
                setIsNewEventModalOpen(true);
              }}
              className="metallic-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold"
            >
              <Briefcase className="w-3.5 h-3.5 text-white" />
              Corporate Summit
            </button>
            <button
              onClick={() => {
                setNewEventDefaultType('community');
                setIsNewEventModalOpen(true);
              }}
              className="metallic-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold"
            >
              <PartyPopper className="w-3.5 h-3.5 text-white" />
              Community Festival
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setNewEventDefaultType('custom');
                setIsNewEventModalOpen(true);
              }}
              className="metallic-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold"
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
                className={`metallic-card rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs ${
                  isActive
                    ? 'border-white/40 ring-1 ring-white/20 shadow-xl'
                    : 'border-white/10 hover:border-white/25 hover:shadow-md'
                }`}
              >
                {/* Card Top */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg metallic-pill text-[11px] font-bold uppercase tracking-wider">
                      {getTypeIcon(ev.meta?.type)}
                      {ev.meta?.type || 'Event'}
                    </span>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full metallic-pill-active text-white text-[11px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                        Active Living Plan
                      </span>
                    ) : (
                      <button
                        onClick={() => switchEvent(ev.id)}
                        className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors"
                      >
                        Switch to this →
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-white leading-snug line-clamp-1">
                      {ev.meta?.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        {ev.meta?.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                        {ev.meta?.location}
                      </span>
                    </div>
                  </div>

                  {/* Metrics Badges */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                    <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-white/5">
                      <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                        Total Budget
                      </div>
                      <div className="font-extrabold text-white mt-0.5">
                        ₹{(ev.budgetSummary?.total || ev.meta?.totalBudget || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-white/5">
                      <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                        Guest Capacity
                      </div>
                      <div className="font-extrabold text-white mt-0.5 flex items-center gap-1">
                        <Users className="w-3 h-3 text-zinc-400" />
                        {ev.meta?.guestCount || 0} pax
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="px-5 py-3.5 bg-white/[0.02] border-t border-white/10 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleStartEdit(activeEvent?.id === ev.id ? activeEvent : ev)}
                    className="inline-flex items-center gap-1.5 font-semibold text-zinc-300 hover:text-white transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Details
                  </button>

                  <div className="flex items-center gap-2">
                    {!isActive && (
                      <button
                        onClick={() => switchEvent(ev.id)}
                        className="metallic-btn-secondary px-3 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        Select
                      </button>
                    )}
                    <button
                      onClick={() => setDeletingId(ev.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.08] text-xs font-semibold transition-colors"
                      title="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
          <div className="metallic-card rounded-2xl max-w-xl w-full shadow-2xl border border-white/15 overflow-hidden my-auto max-h-[92dvh] overflow-y-auto text-white">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-white" />
                <h3 className="font-bold text-sm text-white">
                  Edit Event Details: {editingEvent.meta.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingEvent(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs sm:text-sm">
              {saveSuccess && (
                <div className="p-3 bg-zinc-900 border border-white/20 text-white rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>Event details updated successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 text-xs metallic-input rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.date || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 text-xs metallic-input rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Location / Venue
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.location || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 text-xs metallic-input rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Expected Guests
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editForm.guestCount || 0}
                    onChange={e => setEditForm(prev => ({ ...prev, guestCount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs metallic-input rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Venue Capacity Limit
                  </label>
                  <input
                    type="number"
                    value={editForm.venueCapacity || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, venueCapacity: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs metallic-input rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Total Budget (₹)
                  </label>
                  <input
                    type="number"
                    required
                    step={1000}
                    value={editForm.totalBudget || 0}
                    onChange={e => setEditForm(prev => ({ ...prev, totalBudget: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs metallic-input rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Contingency Reserve %
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={editForm.contingencyPercent || 10}
                    onChange={e => setEditForm(prev => ({ ...prev, contingencyPercent: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs metallic-input rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Event Theme & Aesthetics
                </label>
                <input
                  type="text"
                  value={editForm.theme || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, theme: e.target.value }))}
                  placeholder="e.g. Royal Heritage, Neon Cyberpunk, Minimalist Garden"
                  className="w-full px-3 py-2 text-xs metallic-input rounded-xl placeholder:text-zinc-500"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const idToDelete = editingEvent.id;
                    setEditingEvent(null);
                    setDeletingId(idToDelete);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Event
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(null)}
                    className="metallic-btn-secondary px-4 py-2 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="metallic-btn-primary px-5 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
          <div className="metallic-card rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-white/15 text-white my-auto max-h-[92dvh] overflow-y-auto">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-600 text-white flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Delete "{eventsList.find(e => e.id === deletingId)?.meta?.name || 'this event'}"?
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                This will permanently erase all budget items, timeline tasks, vendor quotes, and guest entries associated with this plan. This action is irreversible.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingId(null)}
                className="metallic-btn-secondary px-3.5 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-500 rounded-xl shadow-xs transition-colors disabled:opacity-50"
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