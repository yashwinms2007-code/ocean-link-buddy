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
  chatbot:            { en: "Ask Mitra",                   kn: "ಮಿತ್ರನಿಗೆ ಕೇಳಿ",                  hi: "मित्र से पूछें" },
  sosEmergency:       { en: "SOS Emergency",               kn: "SOS ತುರ್ತು",                   hi: "SOS आपातकाल" },
  pfzFinderTitle:     { en: "PFZ Finder",                  kn: "ಮೀನುಗಾರಿಕೆ ವಲಯ ಪತ್ತೆ",           hi: "PFZ खोजक" },
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
  roleFisherman:      { en: "Fisherman",                   kn: "ಮೀನುಗಾರ",                      hi: "मछुआरा" },
  roleTourist:        { en: "Tourist",                     kn: "ಪ್ರವಾಸಿ",                       hi: "पर्यटक" },

  // Profile page
  userNameDemo:       { en: "Captain Rajan",               kn: "ಕ್ಯಾಪ್ಟನ್ ರಾಜನ್",             hi: "कैप्टन राजन" },
  verifiedFisherman:  { en: "Verified Fisherman",          kn: "ದೃಢೀಕರಿಸಿದ ಮೀನುಗಾರ",          hi: "सत्यापित मछुआरा" },
  safetyCertificates: { en: "Safety Certificates",         kn: "ಸುರಕ್ಷಾ ಪ್ರಮಾಣಪತ್ರಗಳು",        hi: "ಸುರಕ್ಷಾ ಪ್ರಮಾಣಪತ್ರ" },
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

  // Chatbot strings
  chatbotWelcome:     { en: "Welcome to Mitra AI. How can I assist you with your voyage today?", kn: "ಮಿತ್ರ AI ಗೆ ಸ್ವಾಗತ. ಇಂದು ನಿಮ್ಮ ಸಮುದ್ರಯಾನಕ್ಕೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?", hi: "मित्रा AI में आपका स्वागत है। आज मैं आपकी समुद्री यात्रा में कैसे सहायता कर सकता हूँ?" },
  aiDefaultResponse:  { en: "Synchronizing with maritime data. Please rephrase your query.", kn: "ಸಮುದ್ರ ಮಾಹಿತಿಯನ್ನು ಸಿಂಕ್ ಮಾಡಲಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಕೇಳಿ.", hi: "समुद्री डेटा के साथ समन्वय किया जा रहा है। कृपया अपना प्रश्न फिर से पूछें।" },

  // Notifications
  stayInformed:       { en: "Stay informed with real-time maritime intelligence.", kn: "ನೈಜ ಸಮಯದ ಸಮುದ್ರ ಮಾಹಿತಿಯೊಂದಿಗೆ ನವೀಕೃತವಾಗಿರಿ.", hi: "वास्तविक समय की समुद्री जानकारी के साथ अपडेट रहें।" },
  markAllAsRead:      { en: "Mark All Read",                kn: "ಎಲ್ಲವನ್ನೂ ಓದಿದಂತೆ ಗುರುತಿಸಿ",    hi: "सभी को पढ़ा हुआ चिह्नित करें" },

  // Dashboard
  welcomeBack:        { en: "Welcome back,",               kn: "ಮರಳಿ ಸ್ವಾಗತ,",               hi: "वापस स्वागत है," },
  coastalIntelligence: { en: "Coastal Intelligence",        kn: "ಕರಾವಳಿ ಬುದ್ಧಿವಂತಿಕೆ",           hi: "तटीय जानकारी" },
  myVessel:           { en: "My Vessel",                   kn: "ನನ್ನ ನೌಕೆ",                   hi: "मेरा जहाज" },
  aiAssistant:        { en: "AI Assistant",                kn: "AI ಸಹಾಯಕ",                    hi: "AI सहायक" },
  emergencyAlerts:    { en: "Emergency Alerts",            kn: "ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳು",              hi: "आपातकालीन अलर्ट" },
  liveTelemetry:      { en: "Live Telemetry",              kn: "ಲೈವ್ ಟೆಲಿಮೆಟ್ರಿ",                hi: "लाइव टेलीमेट्री" },

  // Weather
  liveWeather:        { en: "Live Weather",                kn: "ನೇರ ಹವಾಮಾನ",                   hi: "लाइव मौसम" },
  safeToSail:         { en: "Safe to Sail",                kn: "ಹಡಗು ನಡೆಸಲು ಸುರಕ್ಷಿತ",           hi: "सैल करने के लिए सुरक्षित" },
  dangerToSail:       { en: "Danger to Sail",              kn: "ಹಡಗು ನಡೆಸಲು ಅಪಾಯಕಾರಿ",          hi: "सैल करने के लिए खतरनाक" },
  windSpeed:          { en: "Wind Speed",                  kn: "ಗಾಳಿಯ ವೇಗ",                  hi: "हवा की गति" },
  waveHeight:         { en: "Wave Height",                 kn: "ಅಲೆಗಳ ಎತ್ತರ",                  hi: "लहर की ऊँचाई" },
  locatingGps:        { en: "Locating via GPS...",         kn: "GPS ಮೂಲಕ ಹುಡುಕಲಾಗುತ್ತಿದೆ...",     hi: "GPS के माध्यम से खोज की जा रही है..." },

  // Fish Market
  buyFish:            { en: "Buy Catch",                   kn: "ಮೀನು ಖರೀದಿ",                  hi: "मछली खरीदें" },
  sellCatch:          { en: "Sell Catch",                  kn: "ಮೀನು ಮಾರಾಟ",                  hi: "मछली बेचें" },
  availableListings:  { en: "Available Listings",          kn: "ಲಭ್ಯವಿರುವ ಪಟ್ಟಿಗಳು",           hi: "उपलब्ध लिस्टिंग" },
  uploadPhoto:        { en: "Upload Catch Photo",          kn: "ಮೀನಿನ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",     hi: "मछली की फोटो अपलोड करें" },
  fishNameSpecies:    { en: "Fish Name / Species",         kn: "ಮೀನಿನ ಹೆಸರು / ತಳಿ",             hi: "मछली का नाम / प्रजाति" },
  fishNamePlaceholder: { en: "e.g. King Mackerel",          kn: "ಉದಾ: ಕಿಂಗ್ ಮ್ಯಾಕೆರೆಲ್",          hi: "जैसे: किंग मैकेरल" },
  pricePerKg:         { en: "Price per KG (₹)",            kn: "ಕೆಜಿಗೆ ಬೆಲೆ (₹)",                 hi: "मूल्य प्रति किलोग्राम (₹)" },
  availableQty:       { en: "Available Qty (KG)",          kn: "ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣ (ಕೆಜಿ)",        hi: "उपलब्ध मात्रा (किलोग्राम)" },
  listItemMarket:     { en: "List Item on Market",         kn: "ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಪಟ್ಟಿ ಮಾಡಿ",       hi: "बाजार में लिस्ट करें" },
  callSeller:         { en: "Call Seller",                 kn: "ಮಾರಾಟಗಾರರಿಗೆ ಕರೆ ಮಾಡಿ",        hi: "विक्रेता को कॉल करें" },
  whatsappSeller:     { en: "WhatsApp",                    kn: "WhatsApp",                    hi: "WhatsApp" },
  listingSuccess:     { en: "Listing Added Successfully!", kn: "ಯಶಸ್ವಿಯಾಗಿ ಪಟ್ಟಿಗೆ ಸೇರಿಸಲಾಗಿದೆ!", hi: "लिस्टिंग सफलतापूर्वक जुड़ गई!" },

  // PFZ / Fish Detection
  pfzFinder:          { en: "PFZ Finder",                  kn: "ಮೀನುಗಾರಿಕೆ ವಲಯ ಪತ್ತೆ",           hi: "PFZ खोजक" },
  aiPredictionActive: { en: "AI Prediction Active",        kn: "AI ಭವಿಷ್ಯವಾಣಿ ಸಕ್ರಿಯವಾಗಿದೆ",      hi: "AI भविष्यवाणी सक्रिय है" },
  catchProbability:   { en: "Catch Probability",           kn: "ಮೀನು ಸಿಗುವ ಸಾಧ್ಯತೆ",             hi: "मछली मिलने की संभावना" },
  highDensity:        { en: "High Density Hotspot",        kn: "ಹೆಚ್ಚು ಮೀನು ಸಿಗುವ ವಲಯ",          hi: "उच्च घनत्व हॉटस्पॉट" },
  oceanFronts:        { en: "Convergence Zone",            kn: "ಸಮುದ್ರದ ಅಲೆಗಳ ಸಂಗಮ",            hi: "अभिसरण क्षेत्र" },
  sst:                { en: "Sea Temp (SST)",              kn: "ಸಮುದ್ರದ ತಾಪಮಾನ",                hi: "समुद्री तापमान" },
  chlorophyll:        { en: "Chlorophyll Front",           kn: "ಕ್ಲೋರೋಫಿಲ್ ಮುಂಭಾಗ",              hi: "क्लोरोफिल फ्रंट" },
  bathymetry:         { en: "Shelf Depth",                 kn: "ಸಮುದ್ರದ ಆಳ",                    hi: "शेल्फ गहराई" },
  currents:           { en: "Ocean Currents",              kn: "ಸಮುದ್ರದ ಪ್ರವಾಹಗಳು",             hi: "समुद्री धाराएं" },
  confirmCatch:       { en: "Confirm Catch",               kn: "ಮೀನು ಸಿಕ್ಕಿದ್ದನ್ನು ಖಚಿತಪಡಿಸಿ",   hi: "पकड़ की पुष्टि करें" },
  trainAI:            { en: "Teach AI",                    kn: "AI ಗೆ ತರಬೇತಿ ನೀಡಿ",              hi: "AI को सिखाएं" },

  // Fish Market V2 Expanded
  browseBuy:          { en: "Browse & Buy",                kn: "ಬ್ರೌಸ್ ಮತ್ತು ಖರೀದಿಸಿ",            hi: "ब्राउज़ करें और खरीदें" },
  postListing:        { en: "Post a Listing",              kn: "ಪಟ್ಟಿಯನ್ನು ತಯಾರಿಸಿ",              hi: "सूची पोस्ट करें" },
  searchMarket:       { en: "Search fish, seller, or location...", kn: "ಮೀನು, ಮಾರಾಟಗಾರ ಅಥವಾ ಸ್ಥಳವನ್ನು ಹುಡುಕಿ...", hi: "मछली, विक्रेता या स्थान खोजें..." },
  allTypes:           { en: "All Types",                   kn: "ಎಲ್ಲಾ ವಿಧಗಳು",                  hi: "सभी प्रकार" },
  prawn:              { en: "Prawn",                       kn: "ಸಿಗಡಿ",                        hi: "झींगा" },
  crab:               { en: "Crab",                        kn: "ಏಡಿ",                          hi: "केकड़ा" },
  squid:              { en: "Squid",                       kn: "ಸ್ಕ್ವಿಡ್",                      hi: "स्क्विड" },
  lobster:            { en: "Lobster",                     kn: "ನಳ್ಳಿ",                        hi: "लॉबस्टर" },
  other:              { en: "Other",                       kn: "ಇತರೆ",                         hi: "अन्य" },
  listingsFound:      { en: "listings found",              kn: "ಪಟ್ಟಿಗಳು ಕಂಡುಬಂದಿವೆ",            hi: "लिस्टिंग मिलीं" },
  activeListingsCount:{ en: "Active Listings",             kn: "ಸಕ್ರಿಯ ಪಟ್ಟಿಗಳು",                 hi: "सक्रिय लिस्टिंग" },
  avgPrice:           { en: "Avg Price",                   kn: "ಸರಾಸರಿ ಬೆಲೆ",                  hi: "औसत मूल्य" },
  verified:           { en: "Verified",                    kn: "ದೃಢೀಕರಿಸಲಾಗಿದೆ",                hi: "सत्यापित" },
  kgAvail:            { en: "kg available",                kn: "ಕೆಜಿ ಲಭ್ಯವಿದೆ",                  hi: "किलो उपलब्ध" },
  fresh:              { en: "Fresh",                       kn: "ತಾಜಾ",                         hi: "ताज़ा" },
  yourName:           { en: "Your Name *",                 kn: "ನಿಮ್ಮ ಹೆಸರು *",                  hi: "आपका नाम *" },
  phoneNumberTarget:  { en: "Phone Number * (Buyers will contact here)", kn: "ಫೋನ್ ಸಂಖ್ಯೆ * (ಖರೀದಿದಾರರು ಇಲ್ಲಿ ಸಂಪರ್ಕಿಸುತ್ತಾರೆ)", hi: "फोन नंबर * (खरीदार यहां संपर्क करेंगे)" },
  categoryTarget:     { en: "Category *",                  kn: "ವರ್ಗ *",                       hi: "श्रेणी *" },
  priceTarget:        { en: "Price (₹/kg) *",              kn: "ಬೆಲೆ (₹/ಕೆಜಿ) *",                hi: "मूल्य (₹/किलो) *" },
  qtyTarget:          { en: "Quantity (kg) *",             kn: "ಪ್ರಮಾಣ (ಕೆಜಿ) *",                hi: "मात्रा (किलो) *" },
  descTarget:         { en: "Description (optional)",      kn: "ವಿವರಣೆ (ಐಚ್ಛಿಕ)",               hi: "विवरण (वैकल्पिक)" },
  gpsAutoDetect:      { en: "Your GPS location will be auto-detected when listing is posted", kn: "ಪಟ್ಟಿ ಮಾಡಿದಾಗ ನಿಮ್ಮ GPS ಸ್ಥಳವನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತದೆ", hi: "लिस्टिंग पोस्ट होने पर आपकी GPS स्थिति स्वचालित रूप से पता लगाई जाएगी" },
  goLive:             { en: "Post Listing — Go Live",      kn: "ಪಟ್ಟಿಮಾಡಿ — ಲೈವ್ ಮಾಡಿ",           hi: "सूची पोस्ट करें — लाइव जाएं" },
  removeListing:      { en: "Remove my listing",           kn: "ನನ್ನ ಪಟ್ಟಿಯನ್ನು ಅಳಿಸಿ",            hi: "मेरी सूची हटाएँ" },
  confirmDelete:      { en: "Confirm delete?",             kn: "ಅಳಿಸಲು ಖಚಿತಪಡಿಸಿ?",              hi: "हटाने की पुष्टि करें?" },
  yesRemove:          { en: "Yes, remove",                 kn: "ಹೌದು, ಅಳಿಸಿ",                  hi: "हाँ, हटाएँ" },
  cancel:             { en: "Cancel",                      kn: "ರದ್ದುಗೊಳಿಸಿ",                    hi: "रद्द करें" },
  loadingMarket:      { en: "Loading market data...",      kn: "ಮಾರುಕಟ್ಟೆ ಡೇಟಾ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",  hi: "बाजार डेटा लोड हो रहा है..." },
  noListings:         { en: "No listings found",           kn: "ಯಾವುದೇ ಪಟ್ಟಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ",       hi: "कोई लिस्टिंग नहीं मिली" },
  beTheFirst:         { en: "Be the first to post a listing!", kn: "ಪಟ್ಟಿ ಮಾಡುವಲ್ಲಿ ಮೊದಲಿಗರಾಗಿರಿ!",   hi: "लिस्टिंग पोस्ट करने वाले पहले व्यक्ति बनें!" },
  tradeHub:           { en: "Live Trade Hub",              kn: "ಲೈವ್ ಟ್ರೇಡ್ ಹಬ್",                hi: "लाइव ट्रेड हब" },

  // --- Native Animations: Safety Module ---
  startDrill:         { en: "Start Drill",                 kn: "ತರಬೇತಿ ಪ್ರಾರಂಭಿಸಿ",              hi: "अभ्यास शुरू करें" },
  vhfTitle:           { en: "Marine VHF Radio Mastery",    kn: "VHF ರೇಡಿಯೋ ಬಳಕೆ",             hi: "VHF रेडियो का उपयोग" },
  vhfStep1:           { en: "Tune to Emergency Channel 16",kn: "ತುರ್ತು ಚಾನೆಲ್ 16 ಗೆ ಟ್ಯೂನ್ ಮಾಡಿ",        hi: "आपातकालीन चैनल 16 पर ट्यून करें" },
  vhfStep2:           { en: "Broadcast: MAYDAY, MAYDAY, MAYDAY", kn: "ಮೇಡೇ, ಮೇಡೇ ಎಂದು 3 ಬಾರಿ ಹೇಳಿ", hi: "३ बार मेडे कहें" },
  vhfStep3:           { en: "Relay exact GPS coordinates & status", kn: "ನಿಮ್ಮ GPS ಸ್ಥಳವನ್ನು ಸ್ಪಷ್ಟಪಡಿಸಿ",  hi: "अपनी सटीक GPS स्थिति बताएं" },

  raftTitle:          { en: "Life Raft Deployment Drill",  kn: "ಲೈಫ್ ರಾಫ್ಟ್ ಬಳಕೆ",              hi: "लाइफ राफ्ट का उपयोग" },
  raftStep1:          { en: "Release safety pin on the canister", kn: "ರಾಫ್ಟ್ ನ ಸೇಫ್ಟಿ ಪಿನ್ ತೆಗೆಯಿರಿ",     hi: "राफ्ट का सेफ्टी पिन निकालें" },
  raftStep2:          { en: "Throw canister overboard firmly", kn: "ಕ್ಯಾನಿಸ್ಟರ್ ಅನ್ನು ನೀರಿಗೆ ಎಸೆಯಿರಿ",  hi: "कैनिस्टर को पानी में फेंकें" },
  raftStep3:          { en: "Yank painter line hard to inflate", kn: "ಗಾಳಿ ತುಂಬಲು ಹಗ್ಗವನ್ನು ಎಳೆಯಿರಿ",  hi: "हवा भरने के लिए रस्सी को जोर से खींचें" },

  mobTitle:           { en: "Man Overboard (MOB) Rescue",  kn: "ಮನುಷ್ಯ ನೀರಿನಲ್ಲಿ ಬಿದ್ದಾಗ",         hi: "मैन ओवरबोर्ड (MOB) बचाव" },
  mobStep1:           { en: "Shout 'Man Overboard!' & point constantly", kn: "'ಮನುಷ್ಯ ನೀರಿನಲ್ಲಿ' ಎಂದು ಕಿರುಚಿರಿ", hi: "जोर से चिल्लाएं और इशारा करें" },
  mobStep2:           { en: "Immediately toss life ring to victim", kn: "ಲೈಫ್ ರಿಂಗ್ ಅನ್ನು ಎಸೆಯಿರಿ",      hi: "तुरंत लाइफ रिंग फेंकें" },
  mobStep3:           { en: "Execute Williamson Turn to retrieve", kn: "ಹಡಗನ್ನು ತಿರುಗಿಸಿ ರಕ್ಷಿಸಿ",        hi: "जहाज को मोड़कर बचाएं" },

  flareTitle:         { en: "Distress Flare Operations",   kn: "ತುರ್ತು ಫ್ಲೇರ್ ಬಳಕೆ",             hi: "आपातकालीन फ्लेयर का उपयोग" },
  flareStep1:         { en: "Twist and remove bottom strike cap", kn: "ಬಾಟಮ್ ಕ್ಯಾಪ್ ತೆಗೆಯಿರಿ",            hi: "नीचे का कैप निकालें" },
  flareStep2:         { en: "Hold tightly & angle away downwind", kn: "ಗಾಳಿಯ ದಿಕ್ಕಿನಿಂದ ದೂರ ಹಿಡಿಯಿರಿ",    hi: "हवा की दिशा से दूर पकड़ें" },
  flareStep3:         { en: "Pull striker string sharply to ignite", kn: "ಬೆಂಕಿ ಹಚ್ಚಲು ದಾರವನ್ನು ಎಳೆಯಿರಿ",     hi: "जलाने के लिए रस्सी को खींचें" },
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
