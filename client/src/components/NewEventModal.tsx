import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Sparkles, 
  Heart, 
  Cake, 
  Briefcase, 
  Users, 
  PartyPopper,
  MapPin,
  Calendar,
  IndianRupee,
  ShieldAlert,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { useEvent } from '../context/EventContext';
import { buildEventFromConfig } from '../engines/eventTemplateEngine';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: string;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({ isOpen, onClose, defaultType }) => {
  const navigate = useNavigate();
  const { createNewUserEvent } = useEvent();

  const [selectedType, setSelectedType] = useState<string>(defaultType || 'wedding');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Common Form Fields
  const [name, setName] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d.toISOString().split('T')[0];
  });
  const [location, setLocation] = useState('Mumbai, Maharashtra');
  const [guestCount, setGuestCount] = useState<number>(150);
  const [totalBudget, setTotalBudget] = useState<number>(600000);
  const [contingencyPercent, setContingencyPercent] = useState<number>(10);
  const [theme, setTheme] = useState('');

  // Wedding Specific
  const [coupleNames, setCoupleNames] = useState('');
  const [weddingStyle, setWeddingStyle] = useState('Heritage Palace / Luxury Banquet');
  const [cateringStyle, setCateringStyle] = useState('Grand Multi-Cuisine Buffet');
  const [cateringCostPerGuest, setCateringCostPerGuest] = useState<number>(1600);

  // Birthday Specific
  const [celebrantName, setCelebrantName] = useState('');
  const [celebrantAge, setCelebrantAge] = useState('');
  const [birthdayTheme, setBirthdayTheme] = useState('Neon & Retro Chic');
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>([
    'Custom Fondant Cake',
    'DJ Sound & Dance Floor',
    'Photobooth & Instant Prints'
  ]);

  // Corporate Specific
  const [companyName, setCompanyName] = useState('');
  const [eventFormat, setEventFormat] = useState('In-Person Keynote + Breakouts');
  const [selectedTechNeeds, setSelectedTechNeeds] = useState<string[]>([
    'High-Resolution LED Video Wall',
    'Live Multi-Cam Streaming',
    'Digital QR Badging & Check-in'
  ]);

  // Community Specific
  const [stallsCount, setStallsCount] = useState<number>(15);
  const [venueNature, setVenueNature] = useState('Open Community Grounds');
  const [selectedSafetyNeeds, setSelectedSafetyNeeds] = useState<string[]>([
    'Police NOC & Municipal Permission',
    'Dedicated Security Marshals',
    'Emergency Medical / First Aid Desk'
  ]);

  if (!isOpen) return null;

  const eventTypes = [
    {
      id: 'wedding',
      title: 'Wedding & Reception',
      desc: 'Mandap, catering, rituals, photography & hospitality',
      icon: Heart,
    },
    {
      id: 'birthday',
      title: 'Birthday & Milestone',
      desc: 'Lounge, custom cake, DJ, photobooth & party favors',
      icon: Cake,
    },
    {
      id: 'corporate',
      title: 'Corporate Summit & Gala',
      desc: 'Keynotes, LED walls, executive dining & badging',
      icon: Briefcase,
    },
    {
      id: 'community',
      title: 'Community Festival',
      desc: 'Exhibitor stalls, stage sound, permits & crowd security',
      icon: Users,
    },
    {
      id: 'gathering',
      title: 'Private Social Gathering',
      desc: 'Anniversary, housewarming, reunion & private dining',
      icon: PartyPopper,
    },
  ];

  const handleToggleHighlight = (item: string) => {
    setSelectedHighlights(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  const handleToggleTech = (item: string) => {
    setSelectedTechNeeds(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  const handleToggleSafety = (item: string) => {
    setSelectedSafetyNeeds(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide an event name or title.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const generatedEvent = buildEventFromConfig({
        type: selectedType,
        name: name.trim(),
        date,
        location: location.trim(),
        guestCount,
        totalBudget,
        contingencyPercent,
        theme: theme.trim() || undefined,
        coupleNames: coupleNames.trim() || undefined,
        weddingStyle,
        cateringStyle,
        cateringCostPerGuest,
        celebrantName: celebrantName.trim() || undefined,
        celebrantAge: celebrantAge.trim() || undefined,
        birthdayTheme: birthdayTheme.trim() || undefined,
        selectedHighlights,
        companyName: companyName.trim() || undefined,
        eventFormat,
        selectedTechNeeds,
        stallsCount,
        venueNature,
        selectedSafetyNeeds,
      });

      const newId = await createNewUserEvent(generatedEvent);
      onClose();
      navigate('/app/overview');
    } catch (err: any) {
      console.error('Failed to create event:', err);
      setError(err.message || 'Failed to create event. Please verify inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="metallic-card rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-white/15 my-auto overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/15 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                Configure New Event Plan
              </h2>
              <p className="text-xs text-zinc-400">
                EventPilot adapts budgets, timeline tasks, and logistics to your event type.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm">
          {error && (
            <div className="p-3 bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-white" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Choose Event Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              1. What type of event are you organising?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {eventTypes.map(t => {
                const Icon = t.icon;
                const isSelected = selectedType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedType(t.id)}
                    className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'metallic-pill-active border-white/40 ring-1 ring-white/20'
                        : 'metallic-btn-secondary border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/10 bg-zinc-800/80 text-white">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-white flex items-center justify-between">
                        {t.title}
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="text-[11px] text-zinc-400 leading-snug mt-0.5 line-clamp-2">
                        {t.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Core Event Information */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              2. Core Event Details
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Event Title / Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={
                    selectedType === 'wedding'
                      ? 'e.g. Tanya & Kabir Destination Wedding'
                      : selectedType === 'birthday'
                      ? "e.g. Siddharth's 25th Rooftop Birthday"
                      : selectedType === 'corporate'
                      ? 'e.g. CloudTech Global Summit 2026'
                      : 'e.g. Annual Winter Cultural Fest'
                  }
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm metallic-input rounded-xl placeholder:text-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  Target Event Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm metallic-input rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  Venue City / Location
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Jaipur, Rajasthan"
                  className="w-full px-3 py-2 text-xs sm:text-sm metallic-input rounded-xl placeholder:text-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  Expected Guest Count
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  max={10000}
                  value={guestCount}
                  onChange={e => setGuestCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs sm:text-sm metallic-input rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-zinc-400" />
                  Total Budget (₹)
                </label>
                <input
                  type="number"
                  required
                  step={5000}
                  min={10000}
                  value={totalBudget}
                  onChange={e => setTotalBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs sm:text-sm metallic-input rounded-xl"
                />
              </div>
            </div>

            {/* Contingency Slider */}
            <div className="p-3 metallic-card rounded-xl border border-white/10">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-white" />
                  Deterministic Contingency Reserve
                </span>
                <span className="font-bold text-white">
                  {contingencyPercent}% (₹{Math.round((totalBudget * contingencyPercent) / 100).toLocaleString('en-IN')})
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={25}
                step={1}
                value={contingencyPercent}
                onChange={e => setContingencyPercent(Number(e.target.value))}
                className="w-full accent-white"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Reserved upfront to buffer unforeseen price spikes, extra guests, and emergencies.
              </p>
            </div>
          </div>

          {/* 3. Type-Specific Details */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                3. {eventTypes.find(t => t.id === selectedType)?.title} Specifics
              </label>
              <span className="text-[11px] text-zinc-400 font-medium">Custom Parameters</span>
            </div>

            {/* WEDDING SPECIFICS */}
            {selectedType === 'wedding' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 metallic-card p-4 rounded-xl border border-white/10">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Couple Names
                  </label>
                  <input
                    type="text"
                    value={coupleNames}
                    onChange={e => setCoupleNames(e.target.value)}
                    placeholder="e.g. Ananya & Rohan"
                    className="w-full px-3 py-2 text-xs metallic-input rounded-lg placeholder:text-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Wedding Setting / Style
                  </label>
                  <select
                    value={weddingStyle}
                    onChange={e => setWeddingStyle(e.target.value)}
                    className="w-full px-3 py-2 text-xs metallic-input rounded-lg"
                  >
                    <option value="Heritage Palace / Luxury Banquet">Heritage Palace / Luxury Banquet</option>
                    <option value="Beachside & Coastal Resort">Beachside & Coastal Resort</option>
                    <option value="Traditional Temple & Mandap">Traditional Temple & Mandap</option>
                    <option value="Modern City 5-Star Hotel">Modern City 5-Star Hotel</option>
                    <option value="Intimate Garden & Farmhouse">Intimate Garden & Farmhouse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Catering Service Style
                  </label>
                  <select
                    value={cateringStyle}
                    onChange={e => setCateringStyle(e.target.value)}
                    className="w-full px-3 py-2 text-xs metallic-input rounded-lg"
                  >
                    <option value="Grand Multi-Cuisine Buffet">Grand Multi-Cuisine Buffet</option>
                    <option value="Traditional Sit-Down Royal Thali">Traditional Sit-Down Royal Thali</option>
                    <option value="Plated 4-Course Fine Dining">Plated 4-Course Fine Dining</option>
                    <option value="Cocktail & Global Live Counters">Cocktail & Global Live Counters</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Estimated Cost / Plate (₹)
                  </label>
                  <input
                    type="number"
                    value={cateringCostPerGuest}
                    onChange={e => setCateringCostPerGuest(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs metallic-input rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* BIRTHDAY SPECIFICS */}
            {selectedType === 'birthday' && (
              <div className="space-y-3 metallic-card p-4 rounded-xl border border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Celebrant Name
                    </label>
                    <input
                      type="text"
                      value={celebrantName}
                      onChange={e => setCelebrantName(e.target.value)}
                      placeholder="e.g. Diya"
                      className="w-full px-3 py-2 text-xs metallic-input rounded-lg placeholder:text-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Milestone / Age Turning
                    </label>
                    <input
                      type="text"
                      value={celebrantAge}
                      onChange={e => setCelebrantAge(e.target.value)}
                      placeholder="e.g. 21st, 30th, 50th Jubilee"
                      className="w-full px-3 py-2 text-xs metallic-input rounded-lg placeholder:text-zinc-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Party Highlights & Special Add-ons
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      'Custom Fondant Cake',
                      'DJ Sound & Dance Floor',
                      'Photobooth & Instant Prints',
                      'Cocktail / Mocktail Bar',
                      'Personalized Return Hampers',
                      'Magician / Entertainer',
                    ].map(item => (
                      <label key={item} className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-white/[0.04]">
                        <input
                          type="checkbox"
                          checked={selectedHighlights.includes(item)}
                          onChange={() => handleToggleHighlight(item)}
                          className="rounded accent-white"
                        />
                        <span className="text-zinc-300">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CORPORATE SPECIFICS */}
            {selectedType === 'corporate' && (
              <div className="space-y-3 metallic-card p-4 rounded-xl border border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Hosting Company / Entity
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="e.g. InnovateX Technologies"
                      className="w-full px-3 py-2 text-xs metallic-input rounded-lg placeholder:text-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Event Format
                    </label>
                    <select
                      value={eventFormat}
                      onChange={e => setEventFormat(e.target.value)}
                      className="w-full px-3 py-2 text-xs metallic-input rounded-lg"
                    >
                      <option value="In-Person Keynote + Breakouts">In-Person Keynote + Breakouts</option>
                      <option value="Hybrid (In-Person + Global Stream)">Hybrid (In-Person + Global Stream)</option>
                      <option value="Awards Night & Gala Dinner">Awards Night & Gala Dinner</option>
                      <option value="Hackathon / Workshop Sprint">Hackathon / Workshop Sprint</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Audio-Visual & Tech Infrastructure
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      'High-Resolution LED Video Wall',
                      'Live Multi-Cam Streaming',
                      'Digital QR Badging & Check-in',
                      'Simultaneous Audio Translation',
                      'Dedicated High-Speed WiFi',
                      'Stage Lighting & Teleprompters',
                    ].map(item => (
                      <label key={item} className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-white/[0.04]">
                        <input
                          type="checkbox"
                          checked={selectedTechNeeds.includes(item)}
                          onChange={() => handleToggleTech(item)}
                          className="rounded accent-white"
                        />
                        <span className="text-zinc-300">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* COMMUNITY SPECIFICS */}
            {selectedType === 'community' && (
              <div className="space-y-3 metallic-card p-4 rounded-xl border border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Ground / Venue Setting
                    </label>
                    <input
                      type="text"
                      value={venueNature}
                      onChange={e => setVenueNature(e.target.value)}
                      placeholder="e.g. Shivaji Park Open Lawns"
                      className="w-full px-3 py-2 text-xs metallic-input rounded-lg placeholder:text-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Expected Exhibitor / Food Stalls
                    </label>
                    <input
                      type="number"
                      value={stallsCount}
                      onChange={e => setStallsCount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs metallic-input rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Permits & Safety Infrastructure
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      'Police NOC & Municipal Permission',
                      'Dedicated Security Marshals',
                      'Emergency Medical / First Aid Desk',
                      'Dual Generator Backup',
                      'Sanitation & Waste Disposal Bins',
                      'Traffic & Parking Marshals',
                    ].map(item => (
                      <label key={item} className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-white/[0.04]">
                        <input
                          type="checkbox"
                          checked={selectedSafetyNeeds.includes(item)}
                          onChange={() => handleToggleSafety(item)}
                          className="rounded accent-white"
                        />
                        <span className="text-zinc-300">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="metallic-btn-secondary px-4 py-2.5 rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="metallic-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              {submitting ? 'Generating Living Plan...' : 'Create Living Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};