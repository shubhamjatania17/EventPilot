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
import { buildEventFromConfig, NewEventFormData } from '../engines/eventTemplateEngine';

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
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      activeColor: 'border-rose-500 bg-rose-50/70 text-rose-900',
    },
    {
      id: 'birthday',
      title: 'Birthday & Milestone',
      desc: 'Lounge, custom cake, DJ, photobooth & party favors',
      icon: Cake,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      activeColor: 'border-amber-500 bg-amber-50/70 text-amber-900',
    },
    {
      id: 'corporate',
      title: 'Corporate Summit & Gala',
      desc: 'Keynotes, LED walls, executive dining & badging',
      icon: Briefcase,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      activeColor: 'border-blue-500 bg-blue-50/70 text-blue-900',
    },
    {
      id: 'community',
      title: 'Community Festival',
      desc: 'Exhibitor stalls, stage sound, permits & crowd security',
      icon: Users,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      activeColor: 'border-emerald-500 bg-emerald-50/70 text-emerald-900',
    },
    {
      id: 'gathering',
      title: 'Private Social Gathering',
      desc: 'Anniversary, housewarming, reunion & private dining',
      icon: PartyPopper,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      activeColor: 'border-purple-500 bg-purple-50/70 text-purple-900',
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
    setError(null);

    const eventName = name.trim() || (
      selectedType === 'wedding'
        ? (coupleNames ? `${coupleNames} Wedding` : 'My Wedding Celebration')
        : selectedType === 'birthday'
        ? (celebrantName ? `${celebrantName}'s Birthday Bash` : 'Grand Birthday Celebration')
        : selectedType === 'corporate'
        ? (companyName ? `${companyName} Annual Summit` : 'Executive Summit 2026')
        : selectedType === 'community'
        ? 'Neighborhood Cultural Carnival'
        : 'Private Gathering'
    );

    const formData: NewEventFormData = {
      name: eventName,
      type: selectedType,
      date,
      location,
      guestCount: Number(guestCount) || 100,
      totalBudget: Number(totalBudget) || 500000,
      contingencyPercent: Number(contingencyPercent) || 10,
      theme: theme || (selectedType === 'birthday' ? birthdayTheme : 'Contemporary Elegance'),
      coupleNames,
      weddingStyle,
      cateringStyle,
      cateringCostPerGuest: Number(cateringCostPerGuest),
      celebrantName,
      celebrantAge,
      partyHighlights: selectedHighlights,
      companyName,
      eventFormat,
      techNeeds: selectedTechNeeds,
      stallsCount: Number(stallsCount),
      safetyNeeds: selectedSafetyNeeds,
      notes: `${selectedType.toUpperCase()} plan initialized via EventPilot Configurator`,
    };

    setSubmitting(true);
    try {
      const generatedEvent = buildEventFromConfig(formData);
      await createNewUserEvent(generatedEvent);
      onClose();
      navigate('/app/overview');
    } catch (err: any) {
      setError(err.message || 'Failed to create event. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 my-auto overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Configure New Event Plan
              </h2>
              <p className="text-xs text-slate-500">
                EventPilot adapts budgets, timeline tasks, and logistics to your event type.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Choose Event Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
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
                        ? `${t.activeColor} border-2 shadow-xs ring-1 ring-slate-900/10`
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${t.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between">
                        {t.title}
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                      <div className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-2">
                        {t.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Core Event Information */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              2. Core Event Details
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Target Event Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Venue City / Location
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Jaipur, Rajasthan"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Expected Guest Count
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  max={10000}
                  value={guestCount}
                  onChange={e => setGuestCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                  Total Budget (₹)
                </label>
                <input
                  type="number"
                  required
                  step={5000}
                  min={10000}
                  value={totalBudget}
                  onChange={e => setTotalBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Contingency Slider */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  Deterministic Contingency Reserve
                </span>
                <span className="font-bold text-indigo-700">
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
                className="w-full accent-indigo-600"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Reserved upfront to buffer unforeseen price spikes, extra guests, and emergencies.
              </p>
            </div>
          </div>

          {/* 3. Type-Specific Details (Creative Theorisation) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                3. {eventTypes.find(t => t.id === selectedType)?.title} Specifics
              </label>
              <span className="text-[11px] text-indigo-600 font-medium">Custom Parameters</span>
            </div>

            {/* WEDDING SPECIFICS */}
            {selectedType === 'wedding' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-rose-50/40 p-4 rounded-xl border border-rose-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Couple Names
                  </label>
                  <input
                    type="text"
                    value={coupleNames}
                    onChange={e => setCoupleNames(e.target.value)}
                    placeholder="e.g. Ananya & Rohan"
                    className="w-full px-3 py-2 text-xs bg-white border border-rose-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Wedding Setting / Style
                  </label>
                  <select
                    value={weddingStyle}
                    onChange={e => setWeddingStyle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-rose-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="Heritage Palace / Luxury Banquet">Heritage Palace / Luxury Banquet</option>
                    <option value="Beachside & Coastal Resort">Beachside & Coastal Resort</option>
                    <option value="Traditional Temple & Mandap">Traditional Temple & Mandap</option>
                    <option value="Modern City 5-Star Hotel">Modern City 5-Star Hotel</option>
                    <option value="Intimate Garden & Farmhouse">Intimate Garden & Farmhouse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catering Service Style
                  </label>
                  <select
                    value={cateringStyle}
                    onChange={e => setCateringStyle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-rose-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="Grand Multi-Cuisine Buffet">Grand Multi-Cuisine Buffet</option>
                    <option value="Traditional Sit-Down Royal Thali">Traditional Sit-Down Royal Thali</option>
                    <option value="Plated 4-Course Fine Dining">Plated 4-Course Fine Dining</option>
                    <option value="Cocktail & Global Live Counters">Cocktail & Global Live Counters</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Cost / Plate (₹)
                  </label>
                  <input
                    type="number"
                    value={cateringCostPerGuest}
                    onChange={e => setCateringCostPerGuest(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-rose-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
            )}

            {/* BIRTHDAY SPECIFICS */}
            {selectedType === 'birthday' && (
              <div className="space-y-3 bg-amber-50/40 p-4 rounded-xl border border-amber-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Celebrant Name
                    </label>
                    <input
                      type="text"
                      value={celebrantName}
                      onChange={e => setCelebrantName(e.target.value)}
                      placeholder="e.g. Diya"
                      className="w-full px-3 py-2 text-xs bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Milestone / Age Turning
                    </label>
                    <input
                      type="text"
                      value={celebrantAge}
                      onChange={e => setCelebrantAge(e.target.value)}
                      placeholder="e.g. 21st, 30th, 50th Jubilee"
                      className="w-full px-3 py-2 text-xs bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                      <label key={item} className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-white/60">
                        <input
                          type="checkbox"
                          checked={selectedHighlights.includes(item)}
                          onChange={() => handleToggleHighlight(item)}
                          className="rounded accent-amber-600"
                        />
                        <span className="text-slate-700">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CORPORATE SPECIFICS */}
            {selectedType === 'corporate' && (
              <div className="space-y-3 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hosting Company / Entity
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="e.g. InnovateX Technologies"
                      className="w-full px-3 py-2 text-xs bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Event Format
                    </label>
                    <select
                      value={eventFormat}
                      onChange={e => setEventFormat(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="In-Person Keynote + Breakouts">In-Person Keynote + Breakouts</option>
                      <option value="Hybrid (In-Person + Global Stream)">Hybrid (In-Person + Global Stream)</option>
                      <option value="Awards Night & Gala Dinner">Awards Night & Gala Dinner</option>
                      <option value="Hackathon / Workshop Sprint">Hackathon / Workshop Sprint</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                      <label key={item} className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-white/60">
                        <input
                          type="checkbox"
                          checked={selectedTechNeeds.includes(item)}
                          onChange={() => handleToggleTech(item)}
                          className="rounded accent-blue-600"
                        />
                        <span className="text-slate-700">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* COMMUNITY SPECIFICS */}
            {selectedType === 'community' && (
              <div className="space-y-3 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ground / Venue Setting
                    </label>
                    <input
                      type="text"
                      value={venueNature}
                      onChange={e => setVenueNature(e.target.value)}
                      placeholder="e.g. Shivaji Park Open Lawns"
                      className="w-full px-3 py-2 text-xs bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Expected Exhibitor / Food Stalls
                    </label>
                    <input
                      type="number"
                      value={stallsCount}
                      onChange={e => setStallsCount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                      <label key={item} className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-white/60">
                        <input
                          type="checkbox"
                          checked={selectedSafetyNeeds.includes(item)}
                          onChange={() => handleToggleSafety(item)}
                          className="rounded accent-emerald-600"
                        />
                        <span className="text-slate-700">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md transition-all text-xs flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              {submitting ? 'Generating Living Plan...' : 'Create Living Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
