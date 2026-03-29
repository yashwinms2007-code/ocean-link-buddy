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
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (session) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const formatPhone = (input: string): string => {
    let cleaned = input.replace(/[^\d+]/g, "");
    if (!cleaned.startsWith("+")) {
      cleaned = "+91" + cleaned;
    }
    return cleaned;
  };

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    const formattedPhone = formatPhone(phone);

    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message || "Failed to send OTP");
      return;
    }

    toast.success("OTP sent successfully!");
    setOtpSent(true);
  };

  const handleVerify = async () => {
    if (otp.length < 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    const formattedPhone = formatPhone(phone);

    const { error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: "sms",
    });

    setLoading(false);

    if (error) {
      toast.error(error.message || "Invalid OTP");
      return;
    }

    toast.success("Login successful!");
    navigate("/dashboard");
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
        {!otpSent ? (
          <>
            <label className="text-sm font-medium text-foreground">{t("phoneNumber")}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full h-12 px-4 rounded-lg border border-input bg-card text-foreground text-lg focus:ring-2 focus:ring-primary outline-none"
            />
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold text-lg shadow-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Sending..." : t("sendOtp")}
            </button>
          </>
        ) : (
          <>
            <label className="text-sm font-medium text-foreground">{t("enterOtp")}</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="••••••"
              maxLength={6}
              className="w-full h-12 px-4 rounded-lg border border-input bg-card text-foreground text-2xl text-center tracking-[0.5em] focus:ring-2 focus:ring-primary outline-none"
            />
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold text-lg shadow-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : t("verifyOtp")}
            </button>
            <button
              onClick={() => { setOtpSent(false); setOtp(""); }}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition"
            >
              ← Change phone number
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
