import { ArrowLeft, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNav from "@/components/BottomNav";

const fishListings = [
  { name: "Pomfret", price: "₹450/kg", location: "Mangalore", phone: "+91 98765 43210", emoji: "🐟" },
  { name: "Mackerel", price: "₹180/kg", location: "Udupi", phone: "+91 87654 32109", emoji: "🐠" },
  { name: "Prawns", price: "₹600/kg", location: "Karwar", phone: "+91 76543 21098", emoji: "🦐" },
];

const FishMarket = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-muted">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t("fishMarket")}</h1>
        </div>
      </div>

      <div className="px-5 space-y-3">
        {fishListings.map((fish, i) => (
          <div key={i} className="glass-card rounded-2xl p-4 animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{fish.emoji}</span>
              <div className="flex-1">
                <p className="font-bold text-foreground">{fish.name}</p>
                <p className="text-primary font-bold">{fish.price}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin size={12} /> {fish.location}</span>
              <a href={`tel:${fish.phone}`} className="flex items-center gap-1 text-primary font-semibold">
                <Phone size={12} /> {t("contact")}
              </a>
            </div>
          </div>
        ))}

        <button className="w-full py-3 rounded-2xl border-2 border-dashed border-primary text-primary font-semibold mt-4">
          + {t("postListing")}
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default FishMarket;
