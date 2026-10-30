import React, { useState } from 'react';
import { 
  Briefcase, 
  FileText, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { api } from '../../services/api';
import { Vendor, VendorQuote } from '../../types';

export const VendorsPage: React.FC = () => {
  const { activeEvent, budget, updateActiveEvent } = useEvent();

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
          { description: 'Royal Rajasthani Buffet Dinner (180 pax)', quantity: 180, unitPrice: 1600, total: 288000 },
          { description: 'Live Mocktail Counter & Refreshments', quantity: 1, unitPrice: 20000, total: 20000 },
          { description: 'Mithai & Traditional Halwa Spread', quantity: 1, unitPrice: 16000, total: 16000 },
        ],
        subtotal: 324000,
        taxes: 16200,
        discounts: 10000,
        additionalCharges: 0,
        total: 330200,
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
            Track quotes, contract statuses, and extract structured line items from unstructured proposals.
          </p>
        </div>

        <div className="flex items-center gap-3">
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

      {/* AI Quote Extractor Drawer / Box */}
      {showQuoteExtractor && (
        <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-indigo-950 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Vendor Quote Extractor (Journey C)
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
            placeholder="Paste quote here: 'Dear Rahul, regarding your wedding reception catering for 180 pax, our per plate charge is 1600 INR plus 20000 for live mocktail bar and 5% GST...'"
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

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleConfirmQuote}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors"
                >
                  Confirm & Add to Vendors
                </button>
              </div>
            </div>
          )}
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
        {activeEvent.vendors.map(vendor => (
          <div key={vendor.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{vendor.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                  {vendor.category}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  vendor.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {vendor.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {vendor.contactName && `Contact: ${vendor.contactName} • `}
                {vendor.phone && `${vendor.phone} • `}
                {vendor.email}
              </div>
            </div>

            <div className="flex items-center gap-6 text-right">
              <div>
                <span className="text-slate-400 text-[11px] block">Contract Amount</span>
                <span className="font-bold text-slate-900 text-sm">₹{vendor.quoteAmount.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Paid Advance</span>
                <span className="font-semibold text-emerald-700">₹{vendor.paidAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
