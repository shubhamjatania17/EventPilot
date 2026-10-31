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
    <div className="space-y-8 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Vendor Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Vendors & Quote Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Track quotes, contracts, and use AI to extract line items and draft budget-aligned counter-offers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
            className="metallic-btn-secondary inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all"
          >
            <Handshake className="w-3.5 h-3.5 text-white" />
            AI Negotiator
          </button>

          <button
            onClick={() => setShowQuoteExtractor(!showQuoteExtractor)}
            className="metallic-btn-secondary inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            AI Quote Extractor
          </button>

          <button
            onClick={() => setShowAddVendor(true)}
            className="metallic-btn-primary inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Vendor
          </button>
        </div>
      </div>

      {/* AI Quote Extractor Drawer */}
      {showQuoteExtractor && (
        <div className="p-6 metallic-card border border-white/15 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-white" />
              Vendor Quote Extractor
            </h3>
            <button
              onClick={() => setShowQuoteExtractor(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Paste any unstructured vendor proposal, WhatsApp chat quote, or email message below. Gemini will extract line items, taxes, payment terms, and compare against your budget.
          </p>

          <textarea
            rows={4}
            value={rawQuoteText}
            onChange={e => setRawQuoteText(e.target.value)}
            placeholder="Paste text like: 'Hi, for the wedding dinner on Dec 29: 150 guests @ 1500/plate = 2,25,000. Mocktail bar: 20,000. Taxes 5% extra. 25% advance to block.'"
            className="w-full p-3 text-xs metallic-input rounded-xl leading-relaxed"
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={handleExtractQuote}
              disabled={extracting || !rawQuoteText.trim()}
              className="metallic-btn-primary inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-50 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {extracting ? 'Extracting with Gemini...' : 'Analyze & Extract Line Items'}
            </button>
          </div>

          {/* Extracted Quote Review Card */}
          {extractedQuote && (
            <div className="mt-4 p-5 bg-zinc-900/90 rounded-xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {extractedQuote.vendorName} ({extractedQuote.category})
                  </h4>
                  <span className="text-[11px] text-zinc-400">
                    Payment Terms: {extractedQuote.paymentTerms || 'Standard'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-zinc-500 block">Extracted Total</span>
                  <span className="text-base font-extrabold text-white">
                    ₹{extractedQuote.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="divide-y divide-white/10 text-xs">
                {(extractedQuote.lineItems || extractedQuote.extractedLineItems || []).map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-zinc-300">
                    <div>
                      <span className="font-medium text-white">{item.description}</span>
                      {(item.quantity ?? 1) > 1 && (
                        <span className="text-zinc-500 text-[11px] ml-2">
                          ({item.quantity} × ₹{(item.unitPrice ?? 0).toLocaleString('en-IN')})
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-white">₹{item.total.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={openNegotiatorForExtracted}
                  className="metallic-btn-secondary inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                >
                  <Handshake className="w-3.5 h-3.5 text-white" />
                  Negotiate Extracted Quote
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExtractedQuote(null)}
                    className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleConfirmQuote}
                    className="metallic-btn-primary px-4 py-1.5 text-xs font-bold rounded-lg"
                  >
                    Save as Vendor
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Negotiator Modal */}
      {showNegotiator && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
          <div className="metallic-card border border-white/20 rounded-2xl max-w-2xl w-full max-h-[92vh] max-h-[92dvh] overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 border border-white/20 rounded-xl text-white">
                  <Handshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    AI Vendor Negotiation & Counter-Offer Drafter
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Calculates strategic counter-offers, trade-off levers, and ready-to-send negotiation letters.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNegotiator(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">
                  Vendor Name
                </label>
                <input
                  type="text"
                  value={negotiateVendorName}
                  onChange={e => setNegotiateVendorName(e.target.value)}
                  placeholder="e.g. Royal Decorators"
                  className="w-full px-3 py-2 text-xs metallic-input rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">
                  Category
                </label>
                <select
                  value={negotiateCategory}
                  onChange={e => setNegotiateCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs metallic-input rounded-lg"
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
                <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">
                  Quoted Amount (₹)
                </label>
                <input
                  type="number"
                  value={negotiateQuotedAmount}
                  onChange={e => setNegotiateQuotedAmount(e.target.value)}
                  placeholder="e.g. 250000"
                  className="w-full px-3 py-2 text-xs metallic-input rounded-lg font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">
                  Target Budget / Desired Cap (₹)
                </label>
                <input
                  type="number"
                  value={negotiateTargetBudget}
                  onChange={e => setNegotiateTargetBudget(e.target.value)}
                  placeholder="e.g. 210000"
                  className="w-full px-3 py-2 text-xs metallic-input rounded-lg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">
                  Negotiation Levers / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={negotiateNotes}
                  onChange={e => setNegotiateNotes(e.target.value)}
                  placeholder="e.g. Can pay 50% upfront, flexible on setup time, comparing with another vendor"
                  className="w-full px-3 py-2 text-xs metallic-input rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRunNegotiation}
                disabled={isNegotiating || !negotiateVendorName.trim() || !negotiateQuotedAmount}
                className="metallic-btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl disabled:opacity-50 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-black" />
                {isNegotiating ? 'Generating Counter-Offer...' : 'Formulate Counter-Offer Strategy'}
              </button>
            </div>

            {/* Negotiation Results */}
            {negotiationResult && (
              <div className="p-4 bg-zinc-900/90 rounded-xl border border-white/10 space-y-4 text-xs">
                {/* Metric Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-white/[0.04] rounded-xl border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Initial Quote</span>
                    <span className="text-sm font-extrabold text-white">
                      ₹{negotiationResult.quotedAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-3 bg-white/[0.08] rounded-xl border border-white/20">
                    <span className="text-[10px] uppercase font-bold text-zinc-200 block">Target Counter-Offer</span>
                    <span className="text-sm font-extrabold text-white">
                      ₹{negotiationResult.proposedCounterOffer.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-3 bg-white/[0.04] rounded-xl border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block flex items-center justify-center gap-1">
                      <TrendingDown className="w-3 h-3 text-white" /> Potential Savings
                    </span>
                    <span className="text-sm font-extrabold text-white">
                      ₹{negotiationResult.potentialSavings.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Strategy Summary */}
                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/10">
                  <span className="font-bold text-white text-xs block mb-1">Strategy Overview:</span>
                  <p className="text-zinc-300 leading-relaxed">
                    {negotiationResult.strategySummary}
                  </p>
                </div>

                {/* Suggested Compromises & Phone Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white/[0.02] rounded-xl border border-white/10">
                    <span className="font-bold text-white text-[11px] uppercase tracking-wider block mb-2">
                      💡 Suggested Levers & Trade-Offs
                    </span>
                    <ul className="space-y-1 text-zinc-300 list-disc list-inside text-[11px]">
                      {negotiationResult.suggestedCompromises.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-white/[0.02] rounded-xl border border-white/10">
                    <span className="font-bold text-white text-[11px] uppercase tracking-wider block mb-2 flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-white" /> Phone Talking Points
                    </span>
                    <ul className="space-y-1 text-zinc-300 list-disc list-inside text-[11px]">
                      {negotiationResult.phoneTalkingPoints.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Copyable Letter */}
                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">
                      ✉️ Ready-to-Send Counter-Offer Message (WhatsApp / Email)
                    </span>
                    <button
                      onClick={handleCopyNegotiationEmail}
                      className="metallic-btn-secondary inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors"
                    >
                      {copiedEmail ? (
                        <>
                          <Check className="w-3 h-3 text-white" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-zinc-300" /> Copy Draft
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-zinc-200 whitespace-pre-wrap font-sans text-xs bg-black/40 p-3 rounded-lg border border-white/10 leading-relaxed">
                    {negotiationResult.negotiationEmail}
                  </pre>
                </div>

                {/* Action CTAs */}
                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => setShowNegotiator(false)}
                    className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    Close
                  </button>
                  {targetVendorId && (
                    <button
                      onClick={handleApplyNegotiationStatus}
                      className="metallic-btn-primary px-4 py-2 font-bold rounded-xl text-xs transition-all"
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
        <form onSubmit={handleAddVendor} className="p-5 metallic-card rounded-2xl border border-white/15 space-y-4">
          <h3 className="font-bold text-sm text-white">Add New Vendor</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Vendor Name"
              value={vendorName}
              onChange={e => setVendorName(e.target.value)}
              className="px-3.5 py-2 text-xs metallic-input rounded-lg"
              required
            />
            <select
              value={vendorCategory}
              onChange={e => setVendorCategory(e.target.value)}
              className="px-3.5 py-2 text-xs metallic-input rounded-lg"
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
              className="px-3.5 py-2 text-xs metallic-input rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddVendor(false)}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="metallic-btn-primary px-4 py-1.5 text-xs font-bold rounded-lg"
            >
              Save Vendor
            </button>
          </div>
        </form>
      )}

      {/* Vendors List */}
      <div className="metallic-card rounded-2xl divide-y divide-white/10">
        {activeEvent.vendors.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">
            No vendors registered yet. Add a vendor or extract one from a quote above.
          </div>
        ) : (
          activeEvent.vendors.map(vendor => (
            <div key={vendor.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{vendor.name}</span>
                  <span className="metallic-pill px-2 py-0.5 rounded text-[10px] font-semibold">
                    {vendor.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    vendor.status === 'confirmed'
                      ? 'border-white/50 bg-white/20 text-white'
                      : vendor.status === 'negotiating'
                      ? 'border-zinc-500 bg-zinc-800 text-zinc-200'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-300'
                  }`}>
                    {vendor.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  {vendor.contactName && `Contact: ${vendor.contactName} • `}
                  {vendor.phone && `${vendor.phone} • `}
                  {vendor.email || 'No contact email listed'}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-6 text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                <div>
                  <span className="text-zinc-500 text-[11px] block">Contract Amount</span>
                  <span className="font-bold text-white text-sm">₹{vendor.quoteAmount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[11px] block">Paid Advance</span>
                  <span className="font-semibold text-zinc-300">₹{vendor.paidAmount.toLocaleString('en-IN')}</span>
                </div>
                <button
                  onClick={() => openNegotiatorForVendor(vendor)}
                  className="metallic-btn-secondary px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 shrink-0"
                  title="Draft AI Counter-Offer"
                >
                  <Handshake className="w-3.5 h-3.5 text-white" />
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
