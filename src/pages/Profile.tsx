import { useState } from "react";
import { ArrowLeft, User, Phone, Globe, Edit3, Settings, Shield, Bell, LogOut, ChevronRight, Fish, Waves, ShieldCheck, BadgeCheck, Save, X, Star, Zap, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const Profile = () => {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: localStorage.getItem("mitra_userName") || t("userNameDemo"),
    phone: localStorage.getItem("mitra_userPhone") || "+91 98765 43210"
  });
  
  const [isEditing, setIsEditing] = useState(false);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as any);
    toast.success(t("langChangedToast"));
  };

  const handleSaveProfile = () => {
    if (!profile.name.trim() || !profile.phone.trim()) {
      toast.error("Name and Phone cannot be empty.");
      return;
    }
    localStorage.setItem("mitra_userName", profile.name.trim());
    localStorage.setItem("mitra_userPhone", profile.phone.trim());
    setIsEditing(false);
    toast.success("Profile Settings Synchronized.");
  };

  // Get completed drills for badges
  const completedDrills = JSON.parse(localStorage.getItem("mitra_completed_drills") || "[]");

  return (
    <div className="flex flex-col gap-6 pb-24 selection:bg-primary/20">
      {/* Header Overhaul: Identity HUD */}
      <div className="bg-slate-900 border-b border-white/10 p-12 rounded-b-[4.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.6)] flex flex-col items-center text-center relative overflow-hidden">
        <button 
           onClick={() => navigate(-1)} 
           className="absolute top-6 left-6 p-4 glass-dark rounded-2xl hover:bg-white/10 transition-all z-20 text-white border border-white/10 shadow-xl"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="absolute top-[-50px] left-[-50px] w-80 h-80 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative group mb-8 mt-6">
          <div className="absolute inset-[-15px] bg-primary/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="relative w-32 h-32 glass-dark rounded-[3rem] flex items-center justify-center border-2 border-white/10 shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
             <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
             <div className="relative">
                <Fish size={64} className="text-white drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]" />
                <div className="absolute -bottom-2 -right-2 bg-primary p-2.5 rounded-full border-4 border-slate-950 shadow-2xl animate-in zoom-in duration-700">
                   <ShieldCheck size={20} className="text-slate-950" strokeWidth={3} />
                </div>
             </div>
          </div>
        </div>

        <h1 className="text-4xl font-black tracking-tighter text-white uppercase leading-none mb-4">{profile.name}</h1>
        <div className="flex flex-wrap justify-center gap-3">
           <div className="flex items-center gap-2 bg-primary/20 px-5 py-2 rounded-full border border-primary/30 shadow-lg">
              <BadgeCheck size={16} className="text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{t("verifiedFisherman")}</span>
           </div>
           {completedDrills.length > 0 && (
              <div className="flex items-center gap-2 bg-emerald-500/20 px-5 py-2 rounded-full border border-emerald-500/30 shadow-lg">
                 <Award size={16} className="text-emerald-400" />
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Safety Pro</span>
              </div>
           )}
        </div>
      </div>

      <div className="px-5 space-y-10">
        {/* User Stats HUD */}
        <div className="grid grid-cols-2 gap-4 -mt-20 relative z-10">
           <div className="glass-dark p-6 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-white/5 rounded-2xl text-slate-500">
                 <Star size={20} className="text-yellow-400" />
              </div>
              <div>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Experience</p>
                 <p className="text-xl font-black text-white leading-none">Level 12</p>
              </div>
           </div>
           <div className="glass-dark p-6 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-white/5 rounded-2xl text-slate-500">
                 <Zap size={20} className="text-primary" />
              </div>
              <div>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sea Readiness</p>
                 <p className="text-xl font-black text-white leading-none">94% High</p>
              </div>
           </div>
        </div>

        {/* Identity Details */}
        <div className="space-y-4">
           <div className="flex items-center gap-3 px-3">
              <div className="w-1.5 h-4 bg-primary rounded-full" />
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">IDENTITY METRICS</h3>
           </div>
           <div className="glass-dark p-8 rounded-[3.5rem] border border-white/10 shadow-2xl flex items-center gap-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full pointer-events-none" />
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center border border-primary/20 shadow-inner flex-shrink-0 relative group-hover:scale-105 transition-transform duration-500">
                 <User size={40} />
              </div>
              
              {isEditing ? (
                <div className="flex-1 space-y-3 relative z-10">
                   <div className="space-y-1">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-2">Vessel Master Name</span>
                      <input 
                        type="text" 
                        value={profile.name}
                        onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                        className="w-full bg-slate-900 border border-primary/30 rounded-2xl px-4 py-3 text-white font-black text-lg focus:outline-none focus:border-primary shadow-inner"
                        placeholder="Master Name"
                      />
                   </div>
                   <div className="space-y-1">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-2">Comm Link (Phone)</span>
                      <input 
                        type="tel" 
                        value={profile.phone}
                        onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                        className="w-full bg-slate-900 border border-primary/30 rounded-2xl px-4 py-3 text-slate-300 font-black text-sm tracking-widest focus:outline-none focus:border-primary shadow-inner"
                        placeholder="+91..."
                      />
                   </div>
                </div>
              ) : (
                <div className="flex-1 overflow-hidden relative z-10">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Vessel Master</p>
                   <h2 className="font-black text-white text-2xl tracking-tighter leading-none truncate mb-3">{profile.name}</h2>
                   <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 w-fit">
                      <Phone size={14} className="text-primary" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{profile.phone}</span>
                   </div>
                </div>
              )}

              <div className="relative z-10">
                 {isEditing ? (
                   <div className="flex flex-col gap-2">
                      <button onClick={handleSaveProfile} className="p-4 bg-emerald-500 text-slate-900 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                         <Save size={20} strokeWidth={3} />
                      </button>
                      <button onClick={() => setIsEditing(false)} className="p-4 bg-white/10 text-slate-400 rounded-2xl hover:text-white transition-all">
                         <X size={20} strokeWidth={3} />
                      </button>
                   </div>
                 ) : (
                   <button onClick={() => setIsEditing(true)} className="p-5 glass-dark text-slate-500 rounded-[1.8rem] border border-white/10 hover:text-primary hover:border-primary/40 transition-all shadow-xl group/btn">
                      <Edit3 size={24} className="group-hover/btn:rotate-12 transition-transform" />
                   </button>
                 )}
              </div>
           </div>
        </div>

        {/* Global Dialect Link */}
        <div className="space-y-4">
           <div className="flex items-center gap-3 px-3">
              <div className="w-1.5 h-4 bg-primary rounded-full" />
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">COMMUNICATION DIALECT</h3>
           </div>
           <div className="glass-dark p-8 rounded-[3.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Globe size={100} />
              </div>
              <div className="grid grid-cols-3 gap-3 relative z-10">
                 {[
                   { id: 'en', label: 'ENGLISH' },
                   { id: 'kn', label: 'ಕನ್ನಡ' },
                   { id: 'hi', label: 'हिंदी' }
                 ].map(langOption => (
                   <button
                     key={langOption.id}
                     onClick={() => handleLanguageChange(langOption.id)}
                     className={`py-5 rounded-[1.8rem] text-[10px] font-black transition-all border-2 flex flex-col items-center gap-2 ${language === langOption.id ? 'bg-primary border-primary text-slate-950 shadow-2xl' : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10 hover:border-white/5'}`}
                   >
                     {langOption.label}
                   </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Action HUD Menu */}
        <div className="space-y-4">
           <div className="flex items-center gap-3 px-3">
              <div className="w-1.5 h-4 bg-primary rounded-full" />
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">ADMINISTRATIVE LINKS</h3>
           </div>
           <div className="glass-dark rounded-[3.5rem] border border-white/10 shadow-2xl overflow-hidden">
              <ProfileItem icon={Shield} label={t("safetyCertificates")} onClick={() => navigate("/safety")} />
              <ProfileItem icon={Settings} label={t("appSettings")} onClick={() => navigate("/settings")} />
              <ProfileItem icon={LogOut} label={t("logout")} color="text-red-500" onClick={() => navigate("/login")} last />
           </div>
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
const ProfileItem = ({ icon: Icon, label, color = "text-slate-400", onClick, last = false }: any) => (
  <div onClick={onClick} className={`group flex items-center justify-between p-8 cursor-pointer transition-all active:bg-white/[0.03] hover:bg-white/[0.02] ${!last && 'border-b border-white/5'}`}>
     <div className="flex items-center gap-6">
        <div className={`p-4 rounded-[1.4rem] bg-white/5 border border-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-300 ${color === 'text-red-500' ? 'text-red-500 bg-red-500/5' : color}`}>
           <Icon size={24} />
        </div>
        <span className={`text-base font-black tracking-tight ${color === 'text-red-500' ? 'text-red-500' : 'text-slate-200 group-hover:text-white'} transition-colors`}>{label}</span>
     </div>
     <div className="p-2 glass-dark rounded-xl border border-white/5 group-hover:border-primary/30 transition-all">
        <ChevronRight size={20} className="text-slate-700 group-hover:text-primary transition-colors" />
     </div>
  </div>
);

=======
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5
export default Profile;
