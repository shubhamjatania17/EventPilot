import React, { useState } from 'react';
import { Users, Plus, CheckCircle2, Clock, XCircle, Home, Bus } from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { Guest } from '../../types';

export const GuestsPage: React.FC = () => {
  const { activeEvent, updateActiveEvent } = useEvent();

  const [showAddGuest, setShowAddGuest] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestGroup, setGuestGroup] = useState<Guest['group']>('family');
  const [adults, setAdults] = useState('2');
  const [children, setChildren] = useState('0');
  const [needsAccom, setNeedsAccom] = useState(false);
  const [needsTransport, setNeedsTransport] = useState(false);

  if (!activeEvent) return null;

  const confirmedGuests = (activeEvent.guests || [])
    .filter(g => g.rsvp === 'attending')
    .reduce((sum, g) => sum + (g.adults + g.children), 0);

  const pendingGuests = activeEvent.guests
    .filter(g => g.rsvp === 'pending')
    .reduce((sum, g) => sum + (g.adults + g.children), 0);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const newGuest: Guest = {
      id: `gst-${Date.now()}`,
      name: guestName.trim(),
      group: guestGroup,
      rsvp: 'pending',
      adults: Number(adults) || 1,
      children: Number(children) || 0,
      accommodationNeeded: needsAccom,
      transportNeeded: needsTransport,
    };

    await updateActiveEvent({
      guests: [...activeEvent.guests, newGuest],
    });

    setGuestName('');
    setShowAddGuest(false);
  };

  const handleUpdateRSVP = async (guestId: string, status: Guest['rsvp']) => {
    const updated = activeEvent.guests.map(g =>
      g.id === guestId ? { ...g, rsvp: status } : g
    );
    await updateActiveEvent({ guests: updated });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Headcount & Accommodations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
            Guests & Capacity Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Track RSVPs, logistics, and dietary requirements feeding directly into catering calculations.
          </p>
        </div>

        <button
          onClick={() => setShowAddGuest(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Guest Party
        </button>
      </div>

      {/* Headcount Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Confirmed Attendees</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {confirmedGuests}
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">RSVP Attending</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Pending RSVPs</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {pendingGuests}
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">Awaiting response</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Venue Capacity</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {activeEvent.meta.venueCapacity || '200'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Registered hall limit</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Catering Headcount</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {activeEvent.meta.guestCount}
          </div>
          <span className="text-[11px] text-indigo-700 mt-1 block">Budget calculation base</span>
        </div>
      </div>

      {/* Add Guest Modal */}
      {showAddGuest && (
        <form onSubmit={handleAddGuest} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Add Guest Party</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Guest / Family Name"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg sm:col-span-2"
              required
            />
            <select
              value={guestGroup}
              onChange={e => setGuestGroup(e.target.value as any)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
            >
              <option value="family">Family</option>
              <option value="friends">Friends</option>
              <option value="colleagues">Colleagues</option>
              <option value="vip">VIP</option>
              <option value="general">General</option>
            </select>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Adults"
                value={adults}
                onChange={e => setAdults(e.target.value)}
                className="w-1/2 px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
              />
              <input
                type="number"
                placeholder="Kids"
                value={children}
                onChange={e => setChildren(e.target.value)}
                className="w-1/2 px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={needsAccom}
                onChange={e => setNeedsAccom(e.target.checked)}
                className="rounded border-slate-300 text-slate-900"
              />
              Needs Accommodation
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={needsTransport}
                onChange={e => setNeedsTransport(e.target.checked)}
                className="rounded border-slate-300 text-slate-900"
              />
              Needs Local Transport
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddGuest(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              Save Guest Party
            </button>
          </div>
        </form>
      )}

      {/* Guests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
        {activeEvent.guests.map(guest => (
          <div key={guest.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{guest.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
                  {guest.group}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  guest.rsvp === 'attending' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : guest.rsvp === 'declined' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {guest.rsvp}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                <span>{guest.adults} Adults, {guest.children} Children</span>
                {guest.accommodationNeeded && (
                  <span className="flex items-center gap-1 text-indigo-700">
                    <Home className="w-3 h-3" /> Hotel Room Required
                  </span>
                )}
                {guest.transportNeeded && (
                  <span className="flex items-center gap-1 text-slate-700">
                    <Bus className="w-3 h-3" /> Pickup Needed
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateRSVP(guest.id, 'attending')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-colors ${
                  guest.rsvp === 'attending' 
                    ? 'bg-emerald-600 text-white border-emerald-600' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Attending
              </button>
              <button
                onClick={() => handleUpdateRSVP(guest.id, 'declined')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-colors ${
                  guest.rsvp === 'declined' 
                    ? 'bg-red-600 text-white border-red-600' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Declined
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
