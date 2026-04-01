import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import mitraLogo from "@/assets/mitra-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Lock, LogIn, UserPlus, Globe, Ship, ShieldCheck } from "lucide-react";

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
    if (password.length < 6) {
      toast.error(t("passwordLengthError"));
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(t("accountCreatedVerify"));
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(t("loginSuccess"));
      navigate("/dashboard");
    }
  };

  const handleGuestLogin = () => {
    toast.success(t("guestWelcome"));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-10">
           <div className="p-5 glass-dark rounded-[2.5rem] border border-white/10 mb-6 shadow-2xl relative translate-y-2">
              <img src={mitraLogo} alt="Mitra" width={64} height={64} className="drop-shadow-[0_0_15px_rgba(14,165,233,0.4)]" />
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{t("appName")}</h1>
           <p className="text-primary text-[10px] font-black tracking-[0.4em] uppercase mt-3">{t("tagline")}</p>
        </div>

        <div className="glass-dark p-8 rounded-[3.5rem] border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
           
           <div className="flex justify-center mb-4">
              <LanguageSwitcher />
           </div>

           <div className="space-y-4 pt-2">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 pl-1">{t("email")}</label>
                 <div className="bg-white/5 rounded-2xl p-1 flex items-center border border-white/10 focus-within:border-primary/50 transition-all">
                    <div className="p-3 text-slate-500"><Mail size={20} /></div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("loginEmailPlaceholder")}
                      className="flex-1 bg-transparent p-3 text-white outline-none font-bold placeholder:text-slate-600"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 pl-1">{t("password")}</label>
                 <div className="bg-white/5 rounded-2xl p-1 flex items-center border border-white/10 focus-within:border-primary/50 transition-all">
                    <div className="p-3 text-slate-500"><Lock size={20} /></div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("loginPasswordPlaceholder")}
                      className="flex-1 bg-transparent p-3 text-white outline-none font-bold placeholder:text-slate-600"
                    />
                 </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="group relative w-full py-5 rounded-[2rem] bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-6 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-3">
                   {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
                   {loading ? t("pleaseWait") : isSignUp ? t("signup") : t("login")}
                </span>
              </button>

              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-primary transition-colors mt-2"
              >
                {isSignUp ? t("alreadyHaveAccount") : t("dontHaveAccount")}
              </button>
           </div>

           <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.5em]">{t("or").toUpperCase()}</span>
              <div className="flex-1 h-px bg-white/5" />
           </div>

           <button
             onClick={handleGuestLogin}
             disabled={loading}
             className="w-full py-5 rounded-[2rem] border border-white/10 bg-white/5 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-3 shadow-lg group"
           >
             <Ship size={18} className="group-hover:text-primary transition-colors" />
             {t("continueAsGuest")}
           </button>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 opacity-40">
           <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-primary" />
              <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white">Encrypted Marine Link</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
