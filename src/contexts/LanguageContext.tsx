import React, { createContext, useContext, useState } from "react";

export type Language = "en" | "kn" | "hi";

const translations: Record<string, Record<Language, string>> = {
  // App identity
  appName:            { en: "Mitra",                      kn: "ಮಿತ್ರ",                       hi: "मित्र" },
  tagline:            { en: "Marine Safety Platform",      kn: "ಸಮುದ್ರ ಸುರಕ್ಷಾ ವೇದಿಕೆ",       hi: "समुद्री सुरक्षा मंच" },
  letsStart:          { en: "Let's Start",                 kn: "ಪ್ರಾರಂಭಿಸೋಣ",                  hi: "शुरू करें" },

  // Bottom Nav
  home:               { en: "Home",                        kn: "ಮುಖಪುಟ",                       hi: "होम" },
  map:                { en: "Map",                         kn: "ನಕ್ಷೆ",                         hi: "नक्शा" },
  alerts:             { en: "Alerts",                      kn: "ಎಚ್ಚರಿಕೆಗಳು",                  hi: "अलर्ट" },
  profile:            { en: "Profile",                     kn: "ಪ್ರೊಫೈಲ್",                     hi: "प्रोफ़ाइल" },

  // Dashboard menu
  chatbot:            { en: "AI Buddy",                    kn: "AI ಸ್ನೇಹಿತ",                  hi: "AI साथी" },
  sosEmergency:       { en: "SOS Emergency",               kn: "SOS ತುರ್ತು",                   hi: "SOS आपातकाल" },
  fishDetection:      { en: "Fish Detection",              kn: "ಮೀನು ಪತ್ತೆ",                  hi: "मछली खोज" },
  weather:            { en: "Weather",                     kn: "ಹವಾಮಾನ",                       hi: "मौसम" },
  fishMarket:         { en: "Fish Market",                 kn: "ಮೀನು ಮಾರುಕಟ್ಟೆ",             hi: "मछली बाजार" },
  safety:             { en: "Safety Drills",               kn: "ಸುರಕ್ಷಾ ತರಬೇತಿ",              hi: "सुरक्षा अभ्यास" },
  seaMap:             { en: "Sea Map",                     kn: "ಸಮುದ್ರ ನಕ್ಷೆ",                hi: "समुद्र नक्शा" },
  settings:           { en: "Settings",                    kn: "ಸೆಟ್ಟಿಂಗ್ಸ್",                  hi: "सेटिंग्स" },

  // SOS page
  sosSuccessToast:    { en: "SOS Emergency Sent!",         kn: "SOS ತುರ್ತು ಕಳುಹಿಸಲಾಗಿದೆ!",    hi: "SOS आपातकाल भेजा गया!" },
  latitude:           { en: "Latitude",                    kn: "ಅಕ್ಷಾಂಶ",                      hi: "अक्षांश" },
  longitude:          { en: "Longitude",                   kn: "ರೇಖಾಂಶ",                       hi: "देशांतर" },

  // Login page
  email:              { en: "Email",                       kn: "ಇಮೇಲ್",                        hi: "ईमेल" },
  password:           { en: "Password",                    kn: "ಪಾಸ್‌ವರ್ಡ್",                   hi: "पासवर्ड" },
  loginEmailPlaceholder:    { en: "fisherman@email.com",   kn: "fisherman@email.com",           hi: "fisherman@email.com" },
  loginPasswordPlaceholder: { en: "Enter password",        kn: "ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ",           hi: "पासवर्ड दर्ज करें" },
  pleaseWait:         { en: "Please Wait...",              kn: "ದಯವಿಟ್ಟು ಕಾಯಿರಿ...",           hi: "कृपया प्रतीक्षा करें..." },
  signup:             { en: "Create Account",              kn: "ಖಾತೆ ರಚಿಸಿ",                   hi: "खाता बनाएं" },
  login:              { en: "Login",                       kn: "ಲಾಗಿನ್",                        hi: "लॉग इन" },
  alreadyHaveAccount: { en: "Already have an account? Login", kn: "ಖಾತೆ ಇದೆಯೇ? ಲಾಗಿನ್ ಮಾಡಿ",  hi: "खाता है? लॉग इन करें" },
  dontHaveAccount:    { en: "Don't have an account? Sign Up", kn: "ಖಾತೆ ಇಲ್ಲವೇ? ನೋಂದಾಯಿಸಿ",  hi: "खाता नहीं? साइन अप करें" },
  or:                 { en: "or",                          kn: "ಅಥವಾ",                          hi: "या" },
  continueAsGuest:    { en: "Continue as Guest",           kn: "ಅತಿಥಿಯಾಗಿ ಮುಂದುವರಿಯಿರಿ",      hi: "अतिथि के रूप में जारी रखें" },
  fillAllFields:      { en: "Please fill all fields",      kn: "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳನ್ನು ತುಂಬಿಸಿ", hi: "कृपया सभी फ़ील्ड भरें" },
  passwordLengthError: { en: "Password must be at least 6 characters", kn: "ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು ಇರಬೇಕು", hi: "पासवर्ड कम से कम 6 अक्षर होना चाहिए" },
  accountCreatedVerify: { en: "Account created! Please verify your email.", kn: "ಖಾತೆ ರಚಿಸಲಾಗಿದೆ! ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಮೇಲ್ ಪರಿಶೀಲಿಸಿ.", hi: "खाता बन गया! कृपया अपना ईमेल सत्यापित करें।" },
  loginSuccess:       { en: "Welcome back, Captain!",      kn: "ಸ್ವಾಗತ ಕ್ಯಾಪ್ಟನ್!",             hi: "वापस स्वागत, कैप्टन!" },
  guestWelcome:       { en: "Welcome, Guest Navigator!",   kn: "ಸ್ವಾಗತ, ಅತಿಥಿ ನಾವಿಕ!",         hi: "स्वागत, अतिथि नाविक!" },

  // Profile page
  userNameDemo:       { en: "Captain Rajan",               kn: "ಕ್ಯಾಪ್ಟನ್ ರಾಜನ್",             hi: "कैप्टन राजन" },
  verifiedFisherman:  { en: "Verified Fisherman",          kn: "ದೃಢೀಕರಿಸಿದ ಮೀನುಗಾರ",          hi: "सत्यापित मछुआरा" },
  safetyCertificates: { en: "Safety Certificates",         kn: "ಸುರಕ್ಷಾ ಪ್ರಮಾಣಪತ್ರಗಳು",        hi: "सुरक्षा प्रमाणपत्र" },
  appSettings:        { en: "App Settings",                kn: "ಅಪ್ಲಿಕೇಶನ್ ಸೆಟ್ಟಿಂಗ್ಸ್",        hi: "ऐप सेटिंग्स" },
  logout:             { en: "Logout",                      kn: "ಲಾಗ್ ಔಟ್",                     hi: "लॉग आउट" },
  langChangedToast:   { en: "Language Updated",            kn: "ಭಾಷೆ ಬದಲಾಯಿಸಲಾಗಿದೆ",           hi: "भाषा अपडेट हुई" },

  // Settings page
  languageSwitch:     { en: "Language",                    kn: "ಭಾಷೆ",                          hi: "भाषा" },
  displayLanguage:    { en: "Display Language",            kn: "ಪ್ರದರ್ಶನ ಭಾಷೆ",                hi: "प्रदर्शन भाषा" },
  notificationSettings: { en: "Push Notifications",       kn: "ಪುಶ್ ಅಧಿಸೂಚನೆಗಳು",             hi: "पुश अधिसूचनाएं" },

  // Alert engine
  dangerAlert:        { en: "🚨 DANGER ALERT",             kn: "🚨 ಅಪಾಯ ಎಚ್ಚರಿಕೆ",              hi: "🚨 खतरे की अलर्ट" },
  highWindAlert:      { en: "💨 HIGH WIND ALERT",          kn: "💨 ತೀವ್ರ ಗಾಳಿ ಎಚ್ಚರಿಕೆ",         hi: "💨 तेज हवा अलर्ट" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] ?? entry["en"] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
