import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import mitraLogo from "@/assets/mitra-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (session) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Account created! Please check your email to verify.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Login successful!");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>
      <img src={mitraLogo} alt="Mitra" width={80} height={80} className="mb-4" />
      <h1 className="text-2xl font-bold text-foreground mb-1">{t("appName")}</h1>
      <p className="text-muted-foreground text-sm mb-8">{t("tagline")}</p>

      <div className="w-full max-w-sm space-y-4">
        <label className="text-sm font-medium text-foreground">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full h-12 px-4 rounded-lg border border-input bg-card text-foreground text-lg focus:ring-2 focus:ring-primary outline-none"
        />
        <label className="text-sm font-medium text-foreground">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full h-12 px-4 rounded-lg border border-input bg-card text-foreground text-lg focus:ring-2 focus:ring-primary outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold text-lg shadow-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Login"}
        </button>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition"
        >
          {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
};

export default Login;
