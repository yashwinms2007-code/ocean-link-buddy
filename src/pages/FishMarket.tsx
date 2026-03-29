import { useState } from "react";
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

const FishMarket = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
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
    </div>
  );
};

export default FishMarket;
