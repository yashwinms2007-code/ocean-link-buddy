import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import mitraLogo from "@/assets/mitra-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Lock, LogIn, UserPlus, Globe, Ship, ShieldCheck, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard", { replace: true });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/dashboard", { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error(t("fillAllFields"));
      return;
    }
    setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      toast.success(t("accountCreatedVerify"));
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      toast.success(t("loginSuccess"));
      navigate("/dashboard");
    }
  };

  const handleGuestLogin = () => {
    toast.success(t("guestWelcome"));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-sm relative z-10 space-y-10">
        <div className="flex flex-col items-center text-center">
           {/* REFINED OFFICIAL LOGO BOX */}
           <div className="w-28 h-28 bg-white rounded-[2.5rem] border-2 border-slate-100 mb-8 shadow-[0_15px_40px_rgba(0,0,0,0.08)] flex items-center justify-center p-6">
              <img src={mitraLogo} alt="Mitra Official Logo" width={80} height={80} className="drop-shadow-lg" />
           </div>
           <h1 className="text-5xl font-black text-slate-950 tracking-tighter uppercase leading-none">{t("appName")}</h1>
           <p className="text-primary text-[11px] font-black tracking-[0.5em] uppercase mt-4 mb-2">{t("tagline")}</p>
        </div>

        <div className="bg-white p-10 rounded-[3.5rem] border-2 border-slate-100 shadow-[0_30px_70px_rgba(0,0,0,0.12)] space-y-8">
           <div className="flex justify-center">
              <LanguageSwitcher />
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-4">{t("email")}</label>
                 <div className="bg-slate-50 rounded-[2.5rem] p-1.5 flex items-center border-2 border-slate-100 focus-within:border-primary/30 transition-all">
                    <div className="p-4 text-slate-400"><Mail size={22} /></div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="fisherman@mitra.com"
                      className="flex-1 bg-transparent pr-8 py-5 text-slate-950 outline-none font-black text-base placeholder:text-slate-300"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-4">{t("password")}</label>
                 <div className="bg-slate-50 rounded-[2.5rem] p-1.5 flex items-center border-2 border-slate-100 focus-within:border-primary/30 transition-all">
                    <div className="p-4 text-slate-400"><Lock size={22} /></div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent pr-8 py-5 text-slate-950 outline-none font-black text-base placeholder:text-slate-300"
                    />
                 </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-7 rounded-[2.5rem] bg-primary text-white font-black uppercase tracking-[0.3em] text-[13px] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-4 mt-6"
              >
                 {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : isSignUp ? <UserPlus size={22} /> : <LogIn size={22} />}
                 {loading ? t("pleaseWait") : isSignUp ? t("signup") : t("login")}
              </button>

              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-[12px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center justify-center gap-1 mt-4"
              >
                {isSignUp ? t("alreadyHaveAccount") : t("dontHaveAccount")}
                <ChevronRight size={14} />
              </button>
           </div>

           <div className="flex items-center gap-4">
              <div className="flex-1 h-0.5 bg-slate-100" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">OR</span>
              <div className="flex-1 h-0.5 bg-slate-100" />
           </div>

           <button
             onClick={handleGuestLogin}
             disabled={loading}
             className="w-full py-6 rounded-[2.5rem] bg-slate-950 text-white font-black text-[12px] uppercase tracking-[0.3em] hover:bg-black transition-all flex items-center justify-center gap-4 shadow-2xl group"
           >
             <Ship size={22} className="text-primary group-hover:scale-110 transition-transform" />
             {t("continueAsGuest")}
           </button>
        </div>

        <div className="flex flex-col items-center gap-4 pt-6">
           <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm opacity-60">
              <ShieldCheck size={20} strokeWidth={3} className="text-primary" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-950">Secure Marine Platform</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
