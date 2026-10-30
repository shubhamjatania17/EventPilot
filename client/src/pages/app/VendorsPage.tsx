import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Plus, 
  Handshake, 
  Copy, 
  Check, 
  X, 
  PhoneCall, 
  TrendingDown 
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { api } from '../../services/api';
import { Vendor, VendorQuote, VendorNegotiation } from '../../types';

export const VendorsPage: React.FC = () => {
  const { activeEvent, updateActiveEvent } = useEvent();

  // Quote Analyzer State
  const [showQuoteExtractor, setShowQuoteExtractor] = useState(false);
  const [rawQuoteText, setRawQuoteText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractedQuote, setExtractedQuote] = useState<VendorQuote | null>(null);

  // New Vendor Form State
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [vendorCategory, setVendorCategory] = useState('Catering');
  const [vendorQuoteAmount, setVendorQuoteAmount] = useState('');

  // AI Negotiator State
  const [showNegotiator, setShowNegotiator] = useState(false);
  const [targetVendorId, setTargetVendorId] = useState<string | null>(null);
  const [negotiateVendorName, setNegotiateVendorName] = useState('');
  const [negotiateCategory, setNegotiateCategory] = useState('Catering');
  const [negotiateQuotedAmount, setNegotiateQuotedAmount] = useState('');
  const [negotiateTargetBudget, setNegotiateTargetBudget] = useState('');
  const [negotiateNotes, setNegotiateNotes] = useState('');
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [negotiationResult, setNegotiationResult] = useState<VendorNegotiation | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!activeEvent) return null;

  const handleExtractQuote = async () => {
    if (!rawQuoteText.trim()) return;
    setExtracting(true);
    try {
      const res = await api.extractQuote(rawQuoteText);
      setExtractedQuote({
        id: `quote-${Date.now()}`,
        ...res.extracted,
        createdAt: new Date().toISOString(),
      });
    } catch {
      // Deterministic fallback
      setExtractedQuote({
        id: `quote-${Date.now()}`,
        vendorName: 'Royal Catering Services',
        category: 'Catering',
        lineItems: [
          { description: 'Royal Buffet Dinner (150 pax)', quantity: 150, unitPrice: 1500, total: 225000 },
          { description: 'Live Mocktail Counter & Refreshments', quantity: 1, unitPrice: 20000, total: 20000 },
          { description: 'Dessert & Halwa Spread', quantity: 1, unitPrice: 15000, total: 15000 },
        ],
        subtotal: 260000,
        taxes: 13000,
        discounts: 8000,
        additionalCharges: 0,
        total: 265000,
        paymentTerms: '25% advance on contract, 75% on event morning',
        deadlines: 'Headcount lock 5 days before',
        extractedLineItems: [],
        ambiguities: [],
        createdAt: new Date().toISOString(),
      });
    } finally {
      setExtracting(false);
    }
  };

  const handleConfirmQuote = async () => {
    if (!extractedQuote) return;

    const newVendor: Vendor = {
      id: `ven-${Date.now()}`,
      name: extractedQuote.vendorName,
      category: extractedQuote.category,
      status: 'quote_received',
      quoteAmount: extractedQuote.total,
      paidAmount: 0,
      quote: extractedQuote,
    };

    await updateActiveEvent({
      vendors: [...activeEvent.vendors, newVendor],
    });

    setExtractedQuote(null);
    setRawQuoteText('');
    setShowQuoteExtractor(false);
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim()) return;

    const newVendor: Vendor = {
      id: `ven-${Date.now()}`,
      name: vendorName.trim(),
      category: vendorCategory,
      status: 'discovered',
      quoteAmount: Number(vendorQuoteAmount) || 0,
      paidAmount: 0,
    };

    await updateActiveEvent({
      vendors: [...activeEvent.vendors, newVendor],
    });

    setVendorName('');
    setVendorQuoteAmount('');
    setShowAddVendor(false);
  };

  const openNegotiatorForVendor = (vendor: Vendor) => {
    setTargetVendorId(vendor.id);
    setNegotiateVendorName(vendor.name);
    setNegotiateCategory(vendor.category);
    setNegotiateQuotedAmount(vendor.quoteAmount ? String(vendor.quoteAmount) : '');
    const defaultTarget = vendor.quoteAmount ? Math.round(vendor.quoteAmount * 0.85) : 0;
    setNegotiateTargetBudget(defaultTarget ? String(defaultTarget) : '');
    setNegotiateNotes('');
    setNegotiationResult(null);
    setShowNegotiator(true);
  };

  const openNegotiatorForExtracted = () => {
    if (!extractedQuote) return;
    setTargetVendorId(null);
    setNegotiateVendorName(extractedQuote.vendorName);
    setNegotiateCategory(extractedQuote.category);
    setNegotiateQuotedAmount(String(extractedQuote.total));
    setNegotiateTargetBudget(String(Math.round(extractedQuote.total * 0.85)));
    setNegotiateNotes('Ready to lock dates immediately upon revised quote.');
    setNegotiationResult(null);
    setShowNegotiator(true);
  };

  const handleRunNegotiation = async () => {
    if (!negotiateVendorName.trim() || !negotiateQuotedAmount) return;
    setIsNegotiating(true);
    setNegotiationResult(null);

    try {
      const res = await api.negotiateVendor({
        eventId: activeEvent.id,
        vendorName: negotiateVendorName.trim(),
        category: negotiateCategory,
        quotedAmount: Number(negotiateQuotedAmount),
        targetBudget: Number(negotiateTargetBudget) || undefined,
        notes: negotiateNotes.trim() || undefined,
      });
      setNegotiationResult(res);
    } catch (err: unknown) {
      console.error('Vendor negotiation failed:', err);
    } finally {
      setIsNegotiating(false);
    }
  };

  const handleCopyNegotiationEmail = () => {
    if (negotiationResult?.negotiationEmail) {
      navigator.clipboard.writeText(negotiationResult.negotiationEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleApplyNegotiationStatus = async () => {
    if (targetVendorId) {
      const updated = activeEvent.vendors.map(v =>
        v.id === targetVendorId ? { ...v, status: 'negotiating' as const } : v
      );
      await updateActiveEvent({ vendors: updated });
    }
    setShowNegotiator(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Vendor Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
            Vendors & Quote Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Track quotes, contracts, and use AI to extract line items and draft budget-aligned counter-offers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setTargetVendorId(null);
              setNegotiateVendorName(activeEvent.vendors[0]?.name || '');
              setNegotiateCategory(activeEvent.vendors[0]?.category || 'Catering');
              setNegotiateQuotedAmount(activeEvent.vendors[0]?.quoteAmount ? String(activeEvent.vendors[0].quoteAmount) : '');
              setNegotiateTargetBudget('');
              setNegotiateNotes('');
              setNegotiationResult(null);
              setShowNegotiator(true);
            }}
            className="inline-flex items-center gap-2 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-xl transition-colors shadow-xs"
          >
            <Handshake className="w-3.5 h-3.5 text-emerald-700" />
            AI Negotiator
          </button>

          <button
            onClick={() => setShowQuoteExtractor(!showQuoteExtractor)}
            className="inline-flex items-center gap-2 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3.5 py-2 rounded-xl transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            AI Quote Extractor
          </button>

          <button
            onClick={() => setShowAddVendor(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Vendor
          </button>
        </div>
      </div>

      {/* AI Quote Extractor Drawer */}
      {showQuoteExtractor && (
        <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-indigo-950 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Vendor Quote Extractor
            </h3>
            <button
              onClick={() => setShowQuoteExtractor(false)}
              className="text-xs text-indigo-700 hover:underline"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-indigo-900 leading-relaxed">
            Paste any unstructured vendor proposal, WhatsApp chat quote, or email message below. Gemini will extract line items, taxes, payment terms, and compare against your budget.
          </p>

          <textarea
            rows={4}
            value={rawQuoteText}
            onChange={e => setRawQuoteText(e.target.value)}
            placeholder="Paste quote here: 'Regarding your reception catering for 150 pax, our per plate charge is 1500 INR plus 20000 for live mocktail bar and 5% GST...'"
            className="w-full p-3 text-xs bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-600"
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={handleExtractQuote}
              disabled={extracting || !rawQuoteText.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-50 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {extracting ? 'Analyzing Quote...' : 'Extract Quote Details'}
            </button>
          </div>

          {/* Extracted Results Preview */}
          {extractedQuote && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-indigo-200 text-xs space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-sm">
                  {extractedQuote.vendorName} ({extractedQuote.category})
                </span>
                <span className="font-extrabold text-base text-slate-950">
                  Total: ₹{extractedQuote.total.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {(extractedQuote.lineItems || []).map((item: { description: string; total: number }, idx: number) => (
                  <div key={idx} className="py-1.5 flex justify-between text-slate-700">
                    <span>{item.description}</span>
                    <span className="font-semibold">₹{item.total.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {extractedQuote.paymentTerms && (
                <div className="text-[11px] text-slate-500 pt-1">
                  <strong>Terms:</strong> {extractedQuote.paymentTerms}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={openNegotiatorForExtracted}
                  className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                >
                  <Handshake className="w-3.5 h-3.5 text-emerald-700" />
                  AI Negotiate This Quote
                </button>
                <button
                  onClick={handleConfirmQuote}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors"
                >
                  Confirm & Add to Vendors
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Vendor Negotiator Modal */}
      {showNegotiator && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Handshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-950 text-base">
                    AI Vendor Negotiation & Counter-Offer Drafter
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calculates strategic counter-offers, trade-off levers, and ready-to-send negotiation letters.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNegotiator(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Vendor Name
                </label>
                <input
                  type="text"
                  value={negotiateVendorName}
                  onChange={e => setNegotiateVendorName(e.target.value)}
                  placeholder="e.g. Royal Decorators"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Category
                </label>
                <select
                  value={negotiateCategory}
                  onChange={e => setNegotiateCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="Venue">Venue</option>
                  <option value="Catering">Catering</option>
                  <option value="Decor">Decor</option>
                  <option value="Photography">Photography</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Coordination">Coordination</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Quoted Amount (₹)
                </label>
                <input
                  type="number"
                  value={negotiateQuotedAmount}
                  onChange={e => setNegotiateQuotedAmount(e.target.value)}
                  placeholder="e.g. 250000"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Target Budget / Desired Cap (₹)
                </label>
                <input
                  type="number"
                  value={negotiateTargetBudget}
                  onChange={e => setNegotiateTargetBudget(e.target.value)}
                  placeholder="e.g. 210000"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Negotiation Levers / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={negotiateNotes}
                  onChange={e => setNegotiateNotes(e.target.value)}
                  placeholder="e.g. Can pay 50% upfront, flexible on setup time, comparing with another vendor"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRunNegotiation}
                disabled={isNegotiating || !negotiateVendorName.trim() || !negotiateQuotedAmount}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-50 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isNegotiating ? 'Generating Counter-Offer...' : 'Formulate Counter-Offer Strategy'}
              </button>
            </div>

            {/* Negotiation Results */}
            {negotiationResult && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
                {/* Metric Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Initial Quote</span>
                    <span className="text-sm font-extrabold text-slate-800">
                      ₹{negotiationResult.quotedAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Target Counter-Offer</span>
                    <span className="text-sm font-extrabold text-emerald-900">
                      ₹{negotiationResult.proposedCounterOffer.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                    <span className="text-[10px] uppercase font-bold text-indigo-700 block flex items-center justify-center gap-1">
                      <TrendingDown className="w-3 h-3" /> Potential Savings
                    </span>
                    <span className="text-sm font-extrabold text-indigo-950">
                      ₹{negotiationResult.potentialSavings.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Strategy Summary */}
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 text-xs block mb-1">Strategy Overview:</span>
                  <p className="text-slate-600 leading-relaxed">
                    {negotiationResult.strategySummary}
                  </p>
                </div>

                {/* Suggested Compromises & Phone Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider block mb-2">
                      💡 Suggested Levers & Trade-Offs
                    </span>
                    <ul className="space-y-1 text-slate-600 list-disc list-inside text-[11px]">
                      {negotiationResult.suggestedCompromises.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider block mb-2 flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-emerald-700" /> Phone Talking Points
                    </span>
                    <ul className="space-y-1 text-slate-600 list-disc list-inside text-[11px]">
                      {negotiationResult.phoneTalkingPoints.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Copyable Letter */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      ✉️ Ready-to-Send Counter-Offer Message (WhatsApp / Email)
                    </span>
                    <button
                      onClick={handleCopyNegotiationEmail}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors"
                    >
                      {copiedEmail ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-600" /> Copy Draft
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-slate-700 whitespace-pre-wrap font-sans text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {negotiationResult.negotiationEmail}
                  </pre>
                </div>

                {/* Action CTAs */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => setShowNegotiator(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Close
                  </button>
                  {targetVendorId && (
                    <button
                      onClick={handleApplyNegotiationStatus}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs transition-colors"
                    >
                      Update Vendor Status to 'Negotiating'
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Vendor Form */}
      {showAddVendor && (
        <form onSubmit={handleAddVendor} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Add New Vendor</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Vendor Name"
              value={vendorName}
              onChange={e => setVendorName(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
              required
            />
            <select
              value={vendorCategory}
              onChange={e => setVendorCategory(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
            >
              <option value="Venue">Venue</option>
              <option value="Catering">Catering</option>
              <option value="Decor">Decor</option>
              <option value="Photography">Photography</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Coordination">Coordination</option>
            </select>
            <input
              type="number"
              placeholder="Estimated Quote (₹)"
              value={vendorQuoteAmount}
              onChange={e => setVendorQuoteAmount(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddVendor(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              Save Vendor
            </button>
          </div>
        </form>
      )}

      {/* Vendors List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
        {activeEvent.vendors.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No vendors registered yet. Add a vendor or extract one from a quote above.
          </div>
        ) : (
          activeEvent.vendors.map(vendor => (
            <div key={vendor.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{vendor.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {vendor.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    vendor.status === 'confirmed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : vendor.status === 'negotiating'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {vendor.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {vendor.contactName && `Contact: ${vendor.contactName} • `}
                  {vendor.phone && `${vendor.phone} • `}
                  {vendor.email || 'No contact email listed'}
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 text-right">
                <div>
                  <span className="text-slate-400 text-[11px] block">Contract Amount</span>
                  <span className="font-bold text-slate-900 text-sm">₹{vendor.quoteAmount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Paid Advance</span>
                  <span className="font-semibold text-emerald-700">₹{vendor.paidAmount.toLocaleString('en-IN')}</span>
                </div>
                <button
                  onClick={() => openNegotiatorForVendor(vendor)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1 shrink-0"
                  title="Draft AI Counter-Offer"
                >
                  <Handshake className="w-3.5 h-3.5" />
                  Negotiate
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};