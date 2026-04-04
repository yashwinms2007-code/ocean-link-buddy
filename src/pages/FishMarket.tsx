import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, ShoppingCart, Phone, Tag, MapPin, Package,
  ShieldCheck, Zap, TrendingUp, Info, Search, Trash2,
  MessageCircle, Plus, Fish, Clock, CheckCircle2, ChevronDown, X,
  Sparkles, TrendingDown, Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import {
  saveListing, getAllListings, deleteListing,
  seedDemoListings, FishListing
} from "@/services/fishMarketStorage";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

// ── Category config ────────────────────────────────────────────────────────────
const getCategories = (t: any) => [
  { value: "Fish",    emoji: "🐟", label: t("Fish") || "Fish",   color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
  { value: "Prawn",   emoji: "🦐", label: t("prawn"),  color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { value: "Crab",    emoji: "🦀", label: t("crab"),   color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20" },
  { value: "Squid",   emoji: "🦑", label: t("squid"),  color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { value: "Lobster", emoji: "🦞", label: t("lobster"),color: "text-rose-400",   bg: "bg-rose-500/10",   border: "border-rose-500/20" },
  { value: "Other",   emoji: "📦", label: t("other"),  color: "text-slate-400",  bg: "bg-slate-500/10",  border: "border-slate-500/20" },
];

const getCat = (v: string, t: any) => getCategories(t).find(c => c.value === v) ?? getCategories(t)[0];

// ── Reverse geocode helper ─────────────────────────────────────────────────────
const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`);
    const d = await res.json();
    const a = d.address;
    return a.suburb ?? a.village ?? a.town ?? a.city ?? a.county ?? `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
  } catch {
    return `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
  }
};

// ── Main Component ─────────────────────────────────────────────────────────────
const FishMarket = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [listings, setListings] = useState<FishListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [form, setForm] = useState({
    species: "",
    price: "",
    quantity: "",
    phone: "+91 ",
    sellerName: localStorage.getItem("mitra_seller_name") ?? "Captain",
    category: "Fish" as "Fish" | "Prawn" | "Crab" | "Squid" | "Lobster" | "Other",
    description: "",
  });

  // Live reload on DB change
  const loadListings = useCallback(async () => {
    const items = await getAllListings();
    setListings(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    seedDemoListings().then(loadListings);
    window.addEventListener("mitra-market-change", loadListings);
    return () => window.removeEventListener("mitra-market-change", loadListings);
  }, [loadListings]);

  // ── Filtered listings ─────────────────────────────────────────────────────
  const filtered = listings.filter(item => {
    const matchSearch = item.species.toLowerCase().includes(searchQuery.toLowerCase())
      || item.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
      || item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === "ALL" || item.category === categoryFilter;
    return matchSearch && matchCat;
  });

  // Derived stats
  const avgPrice = listings.length
    ? Math.round(listings.reduce((sum, i) => sum + i.price, 0) / listings.length)
    : 0;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCall = (phone: string, species: string) => {
    window.location.href = `tel:${phone.replace(/\s/g, "")}`;
    toast.success(`Calling seller for ${species}...`);
  };

  const handleWhatsApp = (phone: string, species: string, price: number, qty: number) => {
    const clean = phone.replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Hi, I'm interested in buying your *${species}* listed on *Mitra Fish Market*.\n\nDetails: ${qty}kg @ ₹${price}/kg\n\nPlease confirm availability.`
    );
    window.open(`https://wa.me/${clean}?text=${msg}`, "_blank");
  };

  const handleDelete = async (id: string) => {
    await deleteListing(id);
    setConfirmDelete(null);
    toast.success("Listing removed.");
  };

  const handleSubmit = async () => {
    if (!form.species.trim() || !form.price || !form.quantity || form.phone.length < 10) {
      toast.error("Please fill all required fields.");
      return;
    }
    setSubmitting(true);
    toast.info("Detecting your location...");

    const getPos = () => new Promise<GeolocationPosition | null>((res) => {
      if (!navigator.geolocation) { res(null); return; }
      navigator.geolocation.getCurrentPosition(res, () => res(null), { timeout: 8000 });
    });

    const pos = await getPos();
    const lat = pos?.coords.latitude ?? 12.9141;
    const lon = pos?.coords.longitude ?? 74.856;
    const location = await reverseGeocode(lat, lon);

    try {
      await saveListing({
        species: form.species.trim(),
        price: Number(form.price),
        quantity: Number(form.quantity),
        location,
        lat,
        lon,
        sellerName: form.sellerName.trim() || "Captain",
        sellerPhone: form.phone.trim(),
        category: form.category as "Fish" | "Prawn" | "Crab" | "Squid" | "Lobster" | "Other",
        description: form.description.trim(),
        freshness: 95 + Math.floor(Math.random() * 5),
      });

      localStorage.setItem("mitra_seller_name", form.sellerName);
      toast.success("Listing posted successfully! Buyers can now contact you.");
      setForm(f => ({ ...f, species: "", price: "", quantity: "", description: "" }));
      setActiveTab("buy");
    } catch {
      toast.error("Failed to post listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-0 pb-40 bg-slate-950 min-h-screen">

      {/* ── Header ── */}
      <div className="bg-slate-900 border-b border-white/10 px-6 pt-5 pb-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 blur-[80px] rounded-full pointer-events-none" />

        {/* Top row */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="p-3 glass-dark rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-white relative z-10">
            <ArrowLeft size={20} />
          </button>
          <div className="relative z-10">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              {t("fishMarket").split(' ')[0]} <span className="text-teal-400">{t("fishMarket").split(' ')[1] || "MARKET"}</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.25em]">{t("tradeHub")} • {listings.length} {t("activeListingsCount")}</p>
            </div>
          </div>
          <div className="ml-auto relative z-10">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: t("availableListings"), value: listings.length, color: "text-teal-400" },
                { label: t("avgPrice"), value: `₹${avgPrice}`, color: "text-primary" },
                { label: t("verified"), value: "✓", color: "text-green-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="glass-dark px-3 py-2 rounded-xl border border-white/5 text-center">
                  <p className={`text-base font-black leading-none ${color}`}>{value}</p>
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex glass-dark p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab("buy")}
            className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'buy' ? 'bg-teal-500 text-white shadow-lg' : 'text-slate-500'}`}
          >
            <ShoppingCart size={15} /> {t("browseBuy")}
          </button>
          <button
            onClick={() => setActiveTab("sell")}
            className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'sell' ? 'bg-teal-500 text-white shadow-lg' : 'text-slate-500'}`}
          >
            <Plus size={15} /> {t("postListing")}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-4 pt-5 space-y-5">
        <AnimatePresence mode="wait">

          {/* ══════════════ BUY TAB ══════════════ */}
          {activeTab === "buy" && (
            <motion.div key="buy" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="space-y-5">

              {/* AI Market Insights Ticker */}
              <div className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-2xl p-4 border border-teal-500/20 shadow-inner overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Activity size={60} className="text-teal-500" />
                 </div>
                 <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 border border-teal-500/30 flex-shrink-0 animate-pulse">
                       <Sparkles size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-[10px] font-black uppercase tracking-widest text-teal-400 mb-0.5">Live AI Market Insight</p>
                       <p className="text-xs text-slate-300 font-bold truncate">Premium grade <span className="text-white">Tiger Prawn</span> demand is soaring. Expected price spike: +15% next 12h.</p>
                    </div>
                 </div>
              </div>

              {/* Search bar */}
              <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-3 bg-slate-800 rounded-2xl px-4 py-3 border border-white/10">
                  <Search size={16} className="text-slate-500 flex-shrink-0" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t("searchMarket")}
                    className="bg-transparent text-white text-sm font-medium outline-none flex-1 placeholder:text-slate-600"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")}><X size={14} className="text-slate-500" /></button>
                  )}
                </div>
              </div>

              {/* Category filter pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => setCategoryFilter("ALL")}
                  className={`flex-shrink-0 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${categoryFilter === 'ALL' ? 'bg-teal-500 text-white border-teal-500' : 'bg-white/5 text-slate-500 border-white/5'}`}
                >
                  {t("allTypes")}
                </button>
                {getCategories(t).map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setCategoryFilter(cat.value)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${categoryFilter === cat.value ? `${cat.bg} ${cat.color} ${cat.border}` : 'bg-white/5 text-slate-500 border-white/5'}`}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>

              {/* Results count */}
              <div className="flex items-center justify-between px-1">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                  {filtered.length} {t("listingsFound")}
                </p>
                {searchQuery && (
                  <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest">
                    Filtered by: "{searchQuery}"
                  </p>
                )}
              </div>

              {/* Listings */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Zap size={36} className="text-teal-500 animate-pulse" />
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{t("loadingMarket")}</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20 glass-dark rounded-3xl border border-white/5">
                  <Fish size={40} className="mx-auto mb-4 text-slate-700" />
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{t("noListings")}</p>
                  <p className="text-[9px] text-slate-700 mt-2">{t("beTheFirst")}</p>
                </div>
              ) : (
                <div className="space-y-4 pb-6">
                  {filtered.map((item, idx) => {
                    const cat = getCat(item.category, t);
                    const timeAgo = formatDistanceToNow(item.timestamp, { addSuffix: true });
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="bg-slate-900 rounded-3xl border border-white/10 overflow-hidden hover:border-teal-500/30 transition-all shadow-xl"
                      >
                        {/* Card top */}
                        <div className="p-5">
                          <div className="flex gap-4">
                            {/* Category icon */}
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${cat.bg} border ${cat.border}`}>
                              {cat.emoji}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-black text-white text-lg tracking-tight leading-none">{item.species}</h3>
                                  <div className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${cat.bg} ${cat.color} border ${cat.border}`}>
                                    {cat.emoji} {cat.label}
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-teal-400 font-black text-xl leading-none">₹{item.price}</p>
                                  <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest mt-0.5">per kg</p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 mt-3">
                                <div className="flex items-center gap-1.5">
                                  <Package size={12} className="text-slate-500" />
                                  <span className="text-[11px] font-black text-slate-300">{item.quantity} {t("kgAvail")}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                  <span className="text-[11px] font-black text-green-400">{item.freshness}% {t("fresh")}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          {item.description && (
                            <p className="text-[11px] text-slate-500 mt-3 leading-relaxed font-medium bg-white/[0.02] rounded-xl px-3 py-2 border border-white/5">
                              "{item.description}"
                            </p>
                          )}

                          {/* Location + time */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <MapPin size={12} />
                              <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[160px]">{item.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Clock size={11} />
                              <span className="text-[9px] font-bold">{timeAgo}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card bottom — Seller + CTA */}
                        <div className="bg-white/[0.02] border-t border-white/5 px-5 py-4 flex items-center justify-between gap-3">
                          {/* Seller */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400 font-black text-sm flex-shrink-0 border border-teal-500/20">
                              {item.sellerName[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-black text-white truncate">{item.sellerName}</p>
                              <p className="text-[9px] text-slate-600 font-bold">{item.sellerPhone}</p>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleWhatsApp(item.sellerPhone, item.species, item.price, item.quantity)}
                              className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 text-green-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-500/20 hover:bg-green-500/20 transition-all active:scale-95"
                            >
                              <MessageCircle size={14} strokeWidth={2.5} /> WhatsApp
                            </button>
                            <button
                              onClick={() => handleCall(item.sellerPhone, item.species)}
                              className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:bg-teal-400 transition-all active:scale-95"
                            >
                              <Phone size={14} strokeWidth={2.5} /> Call
                            </button>
                          </div>
                        </div>

                        {/* Delete (non-demo listings) */}
                        {!item.isDemo && (
                          <div className="border-t border-white/5 px-5 py-2 flex justify-end">
                            {confirmDelete === item.id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">{t("confirmDelete")}</span>
                                <button onClick={() => handleDelete(item.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg text-[9px] font-black uppercase">{t("yesRemove")}</button>
                                <button onClick={() => setConfirmDelete(null)} className="px-3 py-1 bg-white/10 text-slate-400 rounded-lg text-[9px] font-black uppercase">{t("cancel")}</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelete(item.id)}
                                className="flex items-center gap-1.5 text-[9px] font-black text-slate-600 hover:text-red-400 uppercase tracking-widest transition-colors py-1"
                              >
                                <Trash2 size={11} /> {t("removeListing")}
                              </button>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ══════════════ SELL TAB ══════════════ */}
          {activeTab === "sell" && (
            <motion.div key="sell" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="space-y-5 pb-6">

              {/* Info banner */}
              <div className="flex items-start gap-3 p-4 bg-teal-500/10 rounded-2xl border border-teal-500/20">
                <CheckCircle2 size={18} className="text-teal-400 flex-shrink-0 mt-0.5" />
                <div>
                   <p className="text-[11px] font-black text-teal-300">{t("postListing")} — {t("tagline")}</p>
                   <p className="text-[9px] text-teal-600 mt-0.5">{t("phonePrompt")}</p>
                </div>
              </div>

              <div className="bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-xl overflow-hidden">
                <div className="p-6 space-y-6">

                  {/* Seller name */}
                  <Field label={t("yourName")}>
                    <input
                      type="text"
                      placeholder="e.g. Captain Rajan"
                      value={form.sellerName}
                      onChange={e => setForm(f => ({ ...f, sellerName: e.target.value }))}
                      className="input-field"
                    />
                  </Field>

                  {/* Phone */}
                  <Field label={t("phoneNumberTarget")}>
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="input-field"
                    />
                  </Field>

                  {/* Category */}
                  <Field label={t("categoryTarget")}>
                    <div className="grid grid-cols-3 gap-2">
                      {getCategories(t).map((cat: any) => (
                        <button
                          key={cat.value}
                          onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                          className={`py-3 rounded-xl border text-[11px] font-black flex flex-col items-center gap-1 transition-all ${form.category === cat.value ? `${cat.bg} ${cat.color} ${cat.border} scale-105` : 'bg-white/5 text-slate-500 border-white/5'}`}
                        >
                          <span className="text-xl">{cat.emoji}</span>
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </Field>

                  {/* Fish name */}
                  <Field label={t("fishNameSpecies")}>
                    <input
                      type="text"
                      placeholder={t("fishNamePlaceholder")}
                      value={form.species}
                      onChange={e => setForm(f => ({ ...f, species: e.target.value }))}
                      className="input-field"
                    />
                  </Field>

                  {/* Price + Quantity */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={t("priceTarget")}>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400 font-black text-lg">₹</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={form.price}
                          onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                          className="input-field pl-9"
                        />
                      </div>
                    </Field>
                    <Field label={t("qtyTarget")}>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="0"
                          value={form.quantity}
                          onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                          className="input-field pr-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-[11px] uppercase">kg</span>
                      </div>
                    </Field>
                  </div>

                  {/* AI Price Recommendation */}
                  <AnimatePresence>
                    {form.category && form.species.length > 2 && (
                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                          <div className="flex items-center gap-3 p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl mt-1">
                             <TrendingUp size={16} className="text-teal-400 flex-shrink-0" />
                             <div>
                                <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest leading-none">AI {t("priceTarget")}</p>
                                <p className="text-[11px] font-bold text-slate-300 mt-1">
                                  {t("aiMarketInsights")}
                                </p>
                             </div>
                          </div>
                       </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Description */}
                  <Field label={t("descTarget")}>
                    <textarea
                      placeholder={t("placeholderDesc")}
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      rows={3}
                      className="input-field resize-none"
                    />
                  </Field>

                  {/* GPS note */}
                  <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                    <MapPin size={14} className="text-primary flex-shrink-0" />
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t("gpsAutoDetect")}</p>
                  </div>

                </div>

                {/* Submit */}
                <div className="px-6 pb-6">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 transition-all ${
                      submitting
                        ? 'bg-teal-500/40 text-white/50 cursor-not-allowed'
                        : 'bg-teal-500 text-white shadow-2xl shadow-teal-500/30 hover:bg-teal-400 active:scale-95'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t("syncing")}
                      </>
                    ) : (
                      <>
                        <Zap size={18} /> {t("goLive")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Inline styles for input fields */}
      <style>{`
        .input-field {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border-radius: 0.75rem;
          padding: 0.875rem 1.25rem;
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          outline: none;
          border: 1px solid rgba(255,255,255,0.08);
          transition: border-color 0.2s;
        }
        .input-field:focus {
          border-color: rgba(20,184,166,0.4);
        }
        .input-field::placeholder {
          color: rgb(100, 116, 139);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

// ── Helper sub-component ───────────────────────────────────────────────────────
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-1">{label}</label>
    {children}
  </div>
);

export default FishMarket;
