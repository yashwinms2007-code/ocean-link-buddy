import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import mitraLogo from "@/assets/mitra-logo.png";

const Login = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const handleSendOtp = () => {
    if (phone.length >= 10) setOtpSent(true);
  };

  const handleVerify = () => {
    if (otp.length >= 4) navigate("/dashboard");
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
              className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold text-lg shadow-lg hover:opacity-90 transition"
            >
              {t("sendOtp")}
            </button>
          </>
        ) : (
          <>
            <label className="text-sm font-medium text-foreground">{t("enterOtp")}</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="••••"
              maxLength={6}
              className="w-full h-12 px-4 rounded-lg border border-input bg-card text-foreground text-2xl text-center tracking-[0.5em] focus:ring-2 focus:ring-primary outline-none"
            />
            <button
              onClick={handleVerify}
              className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold text-lg shadow-lg hover:opacity-90 transition"
            >
              {t("verifyOtp")}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
