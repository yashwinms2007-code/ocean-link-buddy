import { useState } from "react";
import { ArrowLeft, Shield, CloudLightning, Anchor, Play, ChevronDown, ChevronUp, LifeBuoy, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNav from "@/components/BottomNav";

const safetyVideos = [
  {
    id: 1,
    title: "How to Wear a Life Jacket",
    description: "Step-by-step guide on properly wearing and securing a life jacket before heading out to sea.",
    thumbnail: "🦺",
    duration: "2:30",
    url: "https://www.youtube.com/embed/gkONHNXGfaM",
    category: "equipment",
  },
  {
    id: 2,
    title: "Storm Safety at Sea",
    description: "What to do when a storm approaches while you're on the water. Essential survival techniques.",
    thumbnail: "⛈️",
    duration: "4:15",
    url: "https://www.youtube.com/embed/gkONHNXGfaM",
    category: "weather",
  },
  {
    id: 3,
    title: "SOS Signal Guide",
    description: "Learn the international distress signals and how to properly send an SOS when in danger.",
    thumbnail: "🆘",
    duration: "3:00",
    url: "https://www.youtube.com/embed/gkONHNXGfaM",
    category: "emergency",
  },
  {
    id: 4,
    title: "First Aid on a Boat",
    description: "Basic first aid techniques every fisherman should know for injuries at sea.",
    thumbnail: "🩹",
    duration: "5:20",
    url: "https://www.youtube.com/embed/gkONHNXGfaM",
    category: "emergency",
  },
  {
    id: 5,
    title: "Boat Engine Maintenance",
    description: "Keep your boat engine running smoothly. Prevent breakdowns at sea with regular checks.",
    thumbnail: "⚙️",
    duration: "3:45",
    url: "https://www.youtube.com/embed/gkONHNXGfaM",
    category: "equipment",
  },
];

const safetyTips = [
  {
    icon: CloudLightning,
    title: "Storm Safety",
    color: "bg-[#eab308]/10 text-[#eab308]",
    steps: [
      "Check weather forecast before departure",
      "Head to shore if winds exceed 25 knots",
      "Secure all loose equipment",
      "Keep bilge pump operational",
      "Stay low in the boat during lightning",
    ],
  },
  {
    icon: Anchor,
    title: "Boat Safety",
    color: "bg-primary/10 text-primary",
    steps: [
      "Always wear a life jacket",
      "Carry emergency flares and whistle",
      "Check fuel before every trip",
      "Inform someone of your route",
      "Keep a first aid kit on board",
    ],
  },
  {
    icon: Shield,
    title: "Emergency Steps",
    color: "bg-[#ef4444]/10 text-[#ef4444]",
    steps: [
      "Stay calm and assess the situation",
      "Activate SOS on Mitra app",
      "Use VHF radio Channel 16",
      "Fire distress flares",
      "Stay with the boat if possible",
    ],
  },
];

const Safety = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const [expandedTip, setExpandedTip] = useState<number | null>(null);
  const [tab, setTab] = useState<"videos" | "tips">("videos");

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-muted">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t("safety")}</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setTab("videos")}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${
              tab === "videos" ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground"
            }`}
          >
            <Play size={16} /> Safety Videos
          </button>
          <button
            onClick={() => setTab("tips")}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${
              tab === "tips" ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground"
            }`}
          >
            <LifeBuoy size={16} /> Safety Tips
          </button>
        </div>
      </div>

      {/* Videos Tab */}
      {tab === "videos" && (
        <div className="px-5 space-y-4">
          {/* Now Playing */}
          {playingVideo !== null && (
            <div className="rounded-2xl overflow-hidden border border-border bg-card animate-fade-in">
              <div className="aspect-video w-full">
                <iframe
                  src={safetyVideos.find(v => v.id === playingVideo)?.url + "?autoplay=1"}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="Safety Video"
                />
              </div>
              <div className="p-4">
                <p className="font-bold text-foreground">
                  {safetyVideos.find(v => v.id === playingVideo)?.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {safetyVideos.find(v => v.id === playingVideo)?.description}
                </p>
              </div>
            </div>
          )}

          {/* Video List */}
          {safetyVideos.map((video, i) => (
            <button
              key={video.id}
              onClick={() => setPlayingVideo(playingVideo === video.id ? null : video.id)}
              className={`w-full text-left bg-card rounded-2xl p-4 border transition animate-fade-in ${
                playingVideo === video.id ? "border-primary" : "border-border"
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-3xl flex-shrink-0 relative">
                  {video.thumbnail}
                  <div className="absolute bottom-1 right-1 bg-foreground/80 text-background text-[10px] px-1 rounded font-mono">
                    {video.duration}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm">{video.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{video.description}</p>
                </div>
                <Play size={20} className="text-primary flex-shrink-0" />
              </div>
            </button>
          ))}

          {/* Emergency Banner */}
          <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-2xl p-4 flex items-center gap-3 mt-4">
            <AlertTriangle size={24} className="text-[#ef4444] flex-shrink-0" />
            <div>
              <p className="font-bold text-[#ef4444] text-sm">In an Emergency?</p>
              <p className="text-xs text-muted-foreground">Use the SOS button on the dashboard for immediate help</p>
            </div>
          </div>
        </div>
      )}

      {/* Tips Tab */}
      {tab === "tips" && (
        <div className="px-5 space-y-3">
          {safetyTips.map(({ icon: Icon, title, color, steps }, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <button
                onClick={() => setExpandedTip(expandedTip === i ? null : i)}
                className="w-full p-5 flex items-center gap-4 text-left"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} flex-shrink-0`}>
                  <Icon size={26} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{steps.length} tips</p>
                </div>
                {expandedTip === i ? (
                  <ChevronUp size={20} className="text-muted-foreground" />
                ) : (
                  <ChevronDown size={20} className="text-muted-foreground" />
                )}
              </button>
              {expandedTip === i && (
                <div className="px-5 pb-5 space-y-2 animate-fade-in">
                  {steps.map((step, j) => (
                    <div key={j} className="flex items-start gap-3 text-sm text-foreground">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {j + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Safety;
