import { useState } from "react";
<<<<<<< HEAD
import { ArrowLeft, ShoppingCart, Plus, MessageCircle, Phone, Camera, Tag, Trash2, Filter, Search, MapPin, Package, ShieldCheck, Zap, TrendingUp, Star, Info, ChevronRight, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const marketItems = [
  { id: 1, name: "Fresh Mackerel", price: "₹240/kg", weight: "15kg", location: "Mangalore Harbor", user: "Ravi K.", phone: "+91 98765 43210", category: "Fish", quality: "A+", freshness: 98 },
  { id: 2, name: "King Prawns", price: "₹850/kg", weight: "5kg", location: "Surathkal Coast", user: "Somu S.", phone: "+91 98765 11111", category: "Crustacean", quality: "A", freshness: 92 },
  { id: 3, name: "Sardines (Bulk)", price: "₹120/kg", weight: "50kg", location: "Ullal Port", user: "Ismail M.", phone: "+91 98765 22222", category: "Fish", quality: "B+", freshness: 85 },
  { id: 4, name: "White Pomfret", price: "₹1200/kg", weight: "2kg", location: "Bunder Port", user: "Ganesh P.", phone: "+91 98765 33333", category: "Premium", quality: "A++", freshness: 100 },
];

const categoryIcons: Record<string, string> = {
  Fish: "🐟",
  Crustacean: "🦐",
  Bulk: "📦",
  Premium: "⭐"
};
=======
import { ArrowLeft, Phone, MapPin, Plus, Image, X, ShoppingCart, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

interface FishListing {
  id: number;
  name: string;
  price: string;
  quantity: string;
  location: string;
  phone: string;
  image: string | null;
  seller: string;
  createdAt: string;
}

const sampleListings: FishListing[] = [
  { id: 1, name: "Pomfret", price: "₹450/kg", quantity: "20 kg", location: "Mangalore", phone: "+919876543210", image: null, seller: "Ramesh K", createdAt: "Today" },
  { id: 2, name: "Mackerel", price: "₹180/kg", quantity: "50 kg", location: "Udupi", phone: "+918765432109", image: null, seller: "Suresh M", createdAt: "Today" },
  { id: 3, name: "Prawns", price: "₹600/kg", quantity: "15 kg", location: "Karwar", phone: "+917654321098", image: null, seller: "Ganesh P", createdAt: "Yesterday" },
];
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5

const FishMarket = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [searchQuery, setSearchQuery] = useState("");

  const handleContact = (phone: string, item: string) => {
    window.location.href = `tel:${phone}`;
    toast.success(`Initializing secure trade line for ${item}...`);
  };

  return (
    <div className="flex flex-col gap-6 selection:bg-primary/20">
      {/* Header & Trade HUB */}
      <div className="bg-slate-900 border-b border-white/10 p-6 rounded-b-[3.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-teal-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3.5 glass-dark rounded-2xl hover:bg-white/10 transition-all text-white border border-white/10 z-10"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="z-10">
            <h1 className="text-2xl font-black tracking-tight uppercase">{t("fishMarket")}</h1>
            <div className="flex items-center gap-2 mt-1">
               <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(45,212,191,1)]" />
               <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest leading-none">Global Direct Trade HUB • Live Market</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher - Pro Style */}
        <div className="flex glass-dark p-1.5 rounded-[2rem] border border-white/10 relative z-10">
           <button 
             onClick={() => setActiveTab("buy")}
             className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-3 ${activeTab === 'buy' ? 'bg-teal-500 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <ShoppingCart size={16} /> {t("buyFish")}
           </button>
           <button 
             onClick={() => setActiveTab("sell")}
             className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-3 ${activeTab === 'sell' ? 'bg-teal-500 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <Camera size={16} /> {t("sellCatch")}
           </button>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {activeTab === "buy" ? (
          <>
            {/* Scientific Market Analysis Ribbon */}
            <div className="grid grid-cols-3 gap-3">
               {[
                 { label: 'Market Demand', value: 'High', icon: TrendingUp, color: 'text-teal-400' },
                 { label: 'Avg Price', value: '₹240/kg', icon: Tag, color: 'text-primary' },
                 { label: 'Traceability', value: 'Verified', icon: ShieldCheck, color: 'text-green-400' },
               ].map((stat, i) => (
                 <div key={i} className="glass-dark p-3.5 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                    <stat.icon size={14} className={`${stat.color} mb-1.5`} />
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">{stat.label}</span>
                    <span className="text-[10px] font-black text-white leading-none">{stat.value}</span>
                 </div>
               ))}
            </div>

            {/* Pro Search Bar */}
            <div className="glass-dark p-2.5 rounded-[1.8rem] flex items-center gap-3 border border-white/10 shadow-xl">
               <div className="p-3 bg-white/5 rounded-2xl text-teal-400">
                  <Search size={18} />
               </div>
               <input 
                 type="text" 
                 placeholder={t("askAnythingPlaceHolder")}
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="flex-1 bg-transparent text-white outline-none font-bold placeholder:text-slate-600 text-sm"
               />
               <button className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-teal-400 transition-colors">
                  <Filter size={18} />
               </button>
            </div>

            {/* Listings Grid */}
            <div className="space-y-4 pb-12">
              <div className="flex items-center justify-between px-2">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t("availableListings")}</h3>
                 <span className="text-[9px] font-bold text-teal-400 uppercase tracking-widest">Live Updates</span>
              </div>
              
              {marketItems.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                <div key={item.id} className="glass-dark rounded-[2.5rem] border border-white/5 overflow-hidden group hover:border-teal-500/30 transition-all shadow-2xl active:scale-[0.98]">
                   <div className="p-6">
                      <div className="flex gap-5">
                         {/* Item Image Placeholder with Quality Badge */}
                         <div className="relative">
                            <div className="w-24 h-24 bg-white/[0.03] rounded-[1.8rem] flex items-center justify-center text-5xl border border-white/5 group-hover:scale-105 transition-transform relative overflow-hidden backdrop-blur-md">
                               <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                               {categoryIcons[item.category] || "🐟"}
                            </div>
                            <div className="absolute -top-2 -right-2 bg-teal-500 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg border border-white/20">
                               {item.quality}
                            </div>
                         </div>

                         <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                               <h3 className="font-black text-slate-100 text-xl tracking-tighter truncate leading-tight">{item.name}</h3>
                               <div className="flex flex-col items-end">
                                  <span className="text-teal-400 font-black text-lg leading-none">{item.price}</span>
                                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Direct Trade</span>
                               </div>
                            </div>
                            
                            <div className="space-y-2">
                               <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1.5 p-1.5 bg-white/5 rounded-xl border border-white/5">
                                     <Activity size={12} className="text-teal-400" />
                                     <span className="text-[9px] font-black text-slate-300 uppercase leading-none">{item.freshness}% FRESH</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                     <Package size={12} className="text-slate-500" />
                                     <span className="text-[9px] font-black text-slate-500 uppercase leading-none">{item.weight} AVAIL</span>
                                  </div>
                               </div>
                               <div className="flex items-center gap-2 text-slate-600">
                                  <MapPin size={12} />
                                  <p className="text-[9px] font-black uppercase tracking-widest truncate">{item.location}</p>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Footer Interaction Strip */}
                   <div className="bg-white/[0.02] border-t border-white/5 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center font-black text-[10px] text-slate-400">
                            {item.user[0]}
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-200 leading-none">{item.user}</p>
                            <p className="text-[8px] font-bold text-slate-600 tracking-widest mt-1">TRUSTED SELLER</p>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <button 
                           onClick={() => handleContact(item.phone, item.name)}
                           className="flex items-center gap-2 px-5 py-3 bg-teal-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-teal-500/20 active:scale-90 transition-all"
                         >
                            <Phone size={14} /> {t("callSeller")}
                         </button>
                         <button className="p-3 bg-white/5 text-slate-400 rounded-2xl hover:bg-white/10 transition-all border border-white/5">
                            <MessageCircle size={18} />
                         </button>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* SELL CATCH PAGE */
          <div className="space-y-6 pb-12">
            {/* Pro AI Grading Upload */}
            <div className="glass-dark p-12 rounded-[3.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-6 text-center group cursor-pointer hover:border-teal-500 hover:bg-teal-500/5 transition-all shadow-2xl relative overflow-hidden">
               <div className="absolute inset-x-0 inset-y-0 bg-teal-500/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="w-28 h-28 bg-white/[0.03] rounded-[2.5rem] flex items-center justify-center text-slate-400 group-hover:text-teal-400 group-hover:scale-105 transition-all shadow-inner border border-white/10 relative z-10 backdrop-blur-md">
                  <Camera size={56} className="group-hover:rotate-12 transition-transform" />
               </div>
               <div className="relative z-10">
                  <h3 className="text-2xl font-black text-slate-100 tracking-tighter uppercase">{t("uploadPhoto")}</h3>
                  <p className="text-[11px] text-slate-500 px-8 mt-2 font-black uppercase tracking-[0.1em] leading-relaxed">
                    AI SENSORS WILL AUTOMATICALLY DETECT SPECIES & QUALITY
                  </p>
               </div>
               <div className="flex items-center gap-2 bg-teal-500/10 text-teal-400 px-5 py-2.5 rounded-full border border-teal-500/20 text-[9px] font-black uppercase tracking-[0.2em] relative z-10 animate-pulse">
                  <ShieldCheck size={14} /> AI Quality Shield Active
               </div>
            </div>

            {/* Dynamic Form */}
            <div className="glass-dark p-8 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
               
               <div className="space-y-8 relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                     <Info size={14} className="text-teal-400" />
                     <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Trade Specification</span>
                  </div>

                  <div>
                     <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-3 ml-1">{t("fishNameSpecies")}</label>
                     <div className="bg-white/[0.03] rounded-[1.8rem] p-1.5 flex items-center border border-white/10 focus-within:border-teal-500/50 transition-all backdrop-blur-md">
                        <div className="p-3.5 bg-white/5 rounded-[1.4rem] text-teal-400 shadow-inner"><Tag size={20} /></div>
                        <input 
                          type="text" 
                          placeholder={t("fishNamePlaceholder")} 
                          className="flex-1 bg-transparent px-4 py-3 text-white outline-none font-black text-base placeholder:text-slate-700" 
                        />
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-3 ml-1">{t("pricePerKg")}</label>
                        <div className="bg-white/[0.03] rounded-[1.8rem] p-1.5 flex items-center border border-white/10 focus-within:border-teal-500/50 transition-all backdrop-blur-md">
                           <div className="p-3.5 bg-white/5 rounded-[1.4rem] text-teal-400 font-black text-xl w-12 flex items-center justify-center shadow-inner">₹</div>
                           <input 
                             type="number" 
                             placeholder="0.00" 
                             className="flex-1 bg-transparent px-3 py-3 text-white outline-none font-black text-lg placeholder:text-slate-700" 
                           />
                        </div>
                     </div>
                     <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-3 ml-1">{t("availableQty")}</label>
                        <div className="bg-white/[0.03] rounded-[1.8rem] p-1.5 flex items-center border border-white/10 focus-within:border-teal-500/50 transition-all backdrop-blur-md">
                           <div className="p-3.5 bg-white/5 rounded-[1.4rem] text-teal-400 shadow-inner"><Package size={20} /></div>
                           <input 
                             type="number" 
                             placeholder="KG" 
                             className="flex-1 bg-transparent px-3 py-3 text-white outline-none font-black text-lg placeholder:text-slate-700" 
                           />
                        </div>
                     </div>
                  </div>
                  
                  <button className="w-full py-7 bg-teal-500 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(20,184,166,0.3)] active:scale-95 transition-all text-xs mt-6 flex items-center justify-center gap-3 relative overflow-hidden group">
                     <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                     <Zap size={18} className="group-hover:animate-pulse" />
                     {t("listItemMarket")}
                  </button>
               </div>
            </div>

            {/* Scientific Listing Note */}
            <div className="p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 text-center">
               <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] leading-relaxed">
                 All listings are time-stamped and geo-verified via GPS-Hash to ensure maximum transparency and buyer confidence in the Mitra Trade Network.
               </p>
            </div>
          </div>
        )}
      </div>
=======
  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [listings, setListings] = useState<FishListing[]>(sampleListings);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", quantity: "", location: "", phone: "", image: null as string | null });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm(f => ({ ...f, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    if (!form.name || !form.price || !form.phone) {
      toast.error("Please fill fish name, price and phone number");
      return;
    }
    const newListing: FishListing = {
      id: Date.now(),
      name: form.name,
      price: `₹${form.price}/kg`,
      quantity: form.quantity || "N/A",
      location: form.location || "Unknown",
      phone: form.phone,
      image: form.image,
      seller: "You",
      createdAt: "Just now",
    };
    setListings([newListing, ...listings]);
    setForm({ name: "", price: "", quantity: "", location: "", phone: "", image: null });
    setShowForm(false);
    toast.success("Listing posted successfully! 🐟");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-muted">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t("fishMarket")}</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => { setTab("buy"); setShowForm(false); }}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${
              tab === "buy" ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground"
            }`}
          >
            <ShoppingCart size={16} /> Buyer
          </button>
          <button
            onClick={() => setTab("sell")}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${
              tab === "sell" ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground"
            }`}
          >
            <Store size={16} /> Seller
          </button>
        </div>
      </div>

      {/* Buyer View */}
      {tab === "buy" && (
        <div className="px-5 space-y-3">
          {listings.map((fish, i) => (
            <div key={fish.id} className="bg-card rounded-2xl p-4 border border-border animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex gap-3">
                {/* Fish image */}
                <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {fish.image ? (
                    <img src={fish.image} alt={fish.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🐟</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-foreground text-base">{fish.name}</p>
                    <span className="text-xs text-muted-foreground">{fish.createdAt}</span>
                  </div>
                  <p className="text-primary font-bold text-lg">{fish.price}</p>
                  <p className="text-xs text-muted-foreground">Qty: {fish.quantity} • by {fish.seller}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={12} /> {fish.location}
                </span>
                <a
                  href={`tel:${fish.phone}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
                >
                  <Phone size={12} /> Call Seller
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Seller View */}
      {tab === "sell" && (
        <div className="px-5">
          {!showForm ? (
            <div className="space-y-3">
              {/* My Listings */}
              {listings.filter(l => l.seller === "You").length > 0 && (
                <>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Your Listings</p>
                  {listings.filter(l => l.seller === "You").map((fish) => (
                    <div key={fish.id} className="bg-card rounded-2xl p-4 border border-border">
                      <div className="flex gap-3 items-center">
                        <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                          {fish.image ? (
                            <img src={fish.image} alt={fish.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">🐟</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{fish.name}</p>
                          <p className="text-primary font-bold">{fish.price}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              <button
                onClick={() => setShowForm(true)}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 shadow-lg mt-4"
              >
                <Plus size={20} /> Add New Fish Listing
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-foreground text-lg">New Listing</p>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-full bg-muted">
                  <X size={16} className="text-foreground" />
                </button>
              </div>

              {/* Image Upload */}
              <label className="block w-full h-40 rounded-2xl border-2 border-dashed border-border bg-muted/50 flex items-center justify-center cursor-pointer overflow-hidden">
                {form.image ? (
                  <img src={form.image} alt="Fish" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Image size={32} />
                    <span className="text-sm font-medium">Upload Fish Photo</span>
                  </div>
                )}
                <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
              </label>

              {/* Form Fields */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Fish Name (e.g. Pomfret)"
                  className="w-full h-12 px-4 rounded-xl border border-input bg-card text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="Price per kg (₹)"
                    className="flex-1 h-12 px-4 rounded-xl border border-input bg-card text-foreground focus:ring-2 focus:ring-primary outline-none"
                  />
                  <input
                    type="text"
                    value={form.quantity}
                    onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                    placeholder="Qty (kg)"
                    className="w-28 h-12 px-4 rounded-xl border border-input bg-card text-foreground focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Location (e.g. Mangalore)"
                  className="w-full h-12 px-4 rounded-xl border border-input bg-card text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Contact Number"
                  className="w-full h-12 px-4 rounded-xl border border-input bg-card text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <button
                onClick={handlePost}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-lg"
              >
                Post Listing
              </button>
            </div>
          )}
        </div>
      )}

      <BottomNav />
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5
    </div>
  );
};

export default FishMarket;
