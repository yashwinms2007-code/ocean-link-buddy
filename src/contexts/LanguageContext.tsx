<<<<<<< HEAD
import React, { createContext, useContext, useState } from "react";
=======
import React, { createContext, useContext, useState, useCallback } from "react";
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5

export type Language = "en" | "kn" | "hi";

const translations: Record<string, Record<Language, string>> = {
<<<<<<< HEAD
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
=======
  appName: { en: "Mitra", kn: "ಮಿತ್ರ", hi: "मित्र" },
  tagline: { en: "Smart Safety for Fishermen", kn: "ಮೀನುಗಾರರಿಗೆ ಸ್ಮಾರ್ಟ್ ಸುರಕ್ಷತೆ", hi: "मछुआरों के लिए स्मार्ट सुरक्षा" },
  welcome: { en: "Welcome to Mitra", kn: "ಮಿತ್ರಕ್ಕೆ ಸ್ವಾಗತ", hi: "मित्र में आपका स्वागत है" },
  letsStart: { en: "Let's Start", kn: "ಪ್ರಾರಂಭಿಸೋಣ", hi: "शुरू करें" },
  login: { en: "Login", kn: "ಲಾಗಿನ್", hi: "लॉगिन" },
  phoneNumber: { en: "Phone Number", kn: "ಫೋನ್ ಸಂಖ್ಯೆ", hi: "फ़ोन नंबर" },
  sendOtp: { en: "Send OTP", kn: "OTP ಕಳುಹಿಸಿ", hi: "OTP भेजें" },
  verifyOtp: { en: "Verify OTP", kn: "OTP ಪರಿಶೀಲಿಸಿ", hi: "OTP सत्यापित करें" },
  enterOtp: { en: "Enter OTP", kn: "OTP ನಮೂದಿಸಿ", hi: "OTP दर्ज करें" },
  dashboard: { en: "Dashboard", kn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", hi: "डैशबोर्ड" },
  fishDetection: { en: "Fish Detection", kn: "ಮೀನು ಪತ್ತೆ", hi: "मछली का पता" },
  weather: { en: "Weather", kn: "ಹವಾಮಾನ", hi: "मौसम" },
  seaMap: { en: "Sea Map", kn: "ಸಮುದ್ರ ನಕ್ಷೆ", hi: "समुद्र का नक्शा" },
  sosEmergency: { en: "SOS Emergency", kn: "SOS ತುರ್ತು", hi: "SOS आपातकाल" },
  safety: { en: "Safety", kn: "ಸುರಕ್ಷತೆ", hi: "सुरक्षा" },
  fishMarket: { en: "Fish Market", kn: "ಮೀನು ಮಾರುಕಟ್ಟೆ", hi: "मछली बाज़ार" },
  notifications: { en: "Notifications", kn: "ಅಧಿಸೂಚನೆಗಳು", hi: "सूचनाएं" },
  settings: { en: "Settings", kn: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", hi: "सेटिंग्स" },
  chatbot: { en: "AI Assistant", kn: "AI ಸಹಾಯಕ", hi: "AI सहायक" },
  profile: { en: "Profile", kn: "ಪ್ರೊಫೈಲ್", hi: "प्रोफ़ाइल" },
  home: { en: "Home", kn: "ಮುಖಪುಟ", hi: "होम" },
  map: { en: "Map", kn: "ನಕ್ಷೆ", hi: "नक्शा" },
  alerts: { en: "Alerts", kn: "ಎಚ್ಚರಿಕೆಗಳು", hi: "अलर्ट" },
  temperature: { en: "Temperature", kn: "ತಾಪಮಾನ", hi: "तापमान" },
  windSpeed: { en: "Wind Speed", kn: "ಗಾಳಿ ವೇಗ", hi: "हवा की गति" },
  seaCondition: { en: "Sea Condition", kn: "ಸಮುದ್ರ ಸ್ಥಿತಿ", hi: "समुद्र की स्थिति" },
  waveHeight: { en: "Wave Height", kn: "ಅಲೆ ಎತ್ತರ", hi: "लहर की ऊंचाई" },
  safe: { en: "Safe", kn: "ಸುರಕ್ಷಿತ", hi: "सुरक्षित" },
  moderate: { en: "Moderate", kn: "ಮಧ್ಯಮ", hi: "मध्यम" },
  dangerous: { en: "Dangerous", kn: "ಅಪಾಯಕಾರಿ", hi: "खतरनाक" },
  sendSos: { en: "SEND SOS", kn: "SOS ಕಳುಹಿಸಿ", hi: "SOS भेजें" },
  sosAlertSent: { en: "Alert sent to nearby boats!", kn: "ಹತ್ತಿರದ ದೋಣಿಗಳಿಗೆ ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಲಾಗಿದೆ!", hi: "आस-पास की नावों को अलर्ट भेजा गया!" },
  helpOnTheWay: { en: "HELP ON THE WAY", kn: "ಸಹಾಯ ಬರುತ್ತಿದೆ", hi: "मदद आ रही है" },
  editProfile: { en: "Edit Profile", kn: "ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ", hi: "प्रोफ़ाइल संपादित करें" },
  language: { en: "Language", kn: "ಭಾಷೆ", hi: "भाषा" },
  logout: { en: "Logout", kn: "ಲಾಗ್ ಔಟ್", hi: "लॉग आउट" },
  safeToGo: { en: "Safe to proceed", kn: "ಮುಂದುವರಿಯಲು ಸುರಕ್ಷಿತ", hi: "आगे बढ़ना सुरक्षित है" },
  dangerousConditions: { en: "Dangerous sea conditions", kn: "ಅಪಾಯಕಾರಿ ಸಮುದ್ರ ಪರಿಸ್ಥಿತಿಗಳು", hi: "खतरनाक समुद्री स्थितियाँ" },
  highTide: { en: "High Tide Warning", kn: "ಹೈ ಟೈಡ್ ಎಚ್ಚರಿಕೆ", hi: "ज्वार चेतावनी" },
  floodRisk: { en: "Flood Risk", kn: "ಪ್ರವಾಹ ಅಪಾಯ", hi: "बाढ़ का खतरा" },
  heavyRain: { en: "Heavy Rain", kn: "ಭಾರೀ ಮಳೆ", hi: "भारी बारिश" },
  fishDensity: { en: "Fish Density", kn: "ಮೀನು ಸಾಂದ್ರತೆ", hi: "मछली की घनत्व" },
  high: { en: "High", kn: "ಹೆಚ್ಚು", hi: "अधिक" },
  medium: { en: "Medium", kn: "ಮಧ್ಯಮ", hi: "मध्यम" },
  low: { en: "Low", kn: "ಕಡಿಮೆ", hi: "कम" },
  stormSafety: { en: "Storm Safety", kn: "ಬಿರುಗಾಳಿ ಸುರಕ್ಷತೆ", hi: "तूफान सुरक्षा" },
  boatSafety: { en: "Boat Safety", kn: "ದೋಣಿ ಸುರಕ್ಷತೆ", hi: "नाव सुरक्षा" },
  emergencySteps: { en: "Emergency Steps", kn: "ತುರ್ತು ಹಂತಗಳು", hi: "आपातकालीन कदम" },
  name: { en: "Name", kn: "ಹೆಸರು", hi: "नाम" },
  seller: { en: "Seller", kn: "ಮಾರಾಟಗಾರ", hi: "विक्रेता" },
  buyer: { en: "Buyer", kn: "ಖರೀದಿದಾರ", hi: "खरीदार" },
  price: { en: "Price", kn: "ಬೆಲೆ", hi: "कीमत" },
  quantity: { en: "Quantity", kn: "ಪ್ರಮಾಣ", hi: "मात्रा" },
  location: { en: "Location", kn: "ಸ್ಥಳ", hi: "स्थान" },
  postListing: { en: "Post Listing", kn: "ಪಟ್ಟಿ ಪೋಸ್ಟ್ ಮಾಡಿ", hi: "लिस्टिंग पोस्ट करें" },
  contact: { en: "Contact", kn: "ಸಂಪರ್ಕ", hi: "संपर्क" },
  latitude: { en: "Latitude", kn: "ಅಕ್ಷಾಂಶ", hi: "अक्षांश" },
  longitude: { en: "Longitude", kn: "ರೇಖಾಂಶ", hi: "देशांतर" },
  safeZone: { en: "Safe Zone", kn: "ಸುರಕ್ಷಿತ ವಲಯ", hi: "सुरक्षित क्षेत्र" },
  dangerZone: { en: "Danger Zone", kn: "ಅಪಾಯ ವಲಯ", hi: "खतरे का क्षेत्र" },
  fishZone: { en: "Fish Zone", kn: "ಮೀನು ವಲಯ", hi: "मछली क्षेत्र" },
  yourBoat: { en: "Your Boat", kn: "ನಿಮ್ಮ ದೋಣಿ", hi: "आपकी नाव" },
  prediction: { en: "AI Fish Prediction", kn: "AI ಮೀನು ಮುನ್ಸೂಚನೆ", hi: "AI मछली भविष्यवाणी" },
  bestArea: { en: "Best fishing area in next 1 hour", kn: "ಮುಂದಿನ 1 ಗಂಟೆಯಲ್ಲಿ ಅತ್ಯುತ್ತಮ ಮೀನುಗಾರಿಕೆ ಪ್ರದೇಶ", hi: "अगले 1 घंटे में सबसे अच्छा मछली पकड़ने का क्षेत्र" },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = useCallback(
    (key: string) => translations[key]?.[language] || key,
    [language]
  );
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

<<<<<<< HEAD
export const useLanguage = (): LanguageContextType => {
=======
export const useLanguage = () => {
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
