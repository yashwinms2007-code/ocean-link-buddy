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
  seaExplorer:        { en: "Sea Explorer",                kn: "ಸಮುದ್ರ ಅನ್ವೇಷಕ",                 hi: "समुद्र अन्वेषक" },
  realTimeNav:        { en: "Real-time maritime navigation", kn: "ನೈಜ ಸಮಯದ ಸಮುದ್ರ ನ್ಯಾವಿಗೇಷನ್",   hi: "वास्तविक समय समुद्री नेविगेशन" },
  rescueModeActive:   { en: "Rescue Mode Active",          kn: "ರಕ್ಷಣಾ ಮೋಡ್ ಸಕ್ರಿಯ",            hi: "बचाव मोड सक्रिय" },
  vesselPosition:     { en: "Vessel Position",             kn: "ನೌಕೆಯ ಸ್ಥಾನ",                   hi: "जहाज की स्थिति" },
  safeCorridor:       { en: "Safe Corridor",               kn: "ಸುರಕ್ಷಿತ ಹಾದಿ",                  hi: "ಸುರಕ್ಷಿತ ಗಲಿಹಾರ" },
  stableSea:          { en: "Stable Sea",                  kn: "ಸ್ಥಿರ ಸಮುದ್ರ",                   hi: "ಸ್ಥಿರ ಸಮುದ್ರ" },
  dangerZone:         { en: "Danger Zone",                 kn: "ಅಪಾಯಕಾರಿ ವಲಯ",                 hi: "खतरा क्षेत्र" },
  rescueTarget:       { en: "Rescue Target",               kn: "ರಕ್ಷಣಾ ಗುರಿ",                    hi: "बचाव लक्ष्य" },
  steerTo:            { en: "STEER TO",                    kn: "ಇತ್ತ ತಿರುಗಿಸಿ",                  hi: "इधर मुड़ें" },
  distance:           { en: "DISTANCE",                    kn: "ದೂರ",                           hi: "ದೂರ" },
  estArrival:         { en: "EST. ARRIVAL",                kn: "ಸರಾಸರಿ ಸಮಯ",                   hi: "ಸರಾಸರಿ ಆಗಮನ" },
  interceptActive:    { en: "RESCUE INTERCEPT ACTIVE",     kn: "ರಕ್ಷಣಾ ಕಾರ್ಯಾಚರಣೆ ಸಕ್ರಿಯ",       hi: "ಬಚಾವ್ ಇಂಟರ್ಸೆಪ್ಟ್ ಸಕ್ರಿಯ" },
  openGoogleMaps:     { en: "Open in Google Maps",          kn: "ಗೂಗಲ್ ಮ್ಯಾಪ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ",       hi: "गूगल मैप्स में खोलें" },
  downloadArea:       { en: "Download Current Area",       kn: "ಪ್ರದೇಶದ ನಕ್ಷೆ ಡೌನ್‌ಲೋಡ್",         hi: "ಪ್ರದೇಶದ ನಕ್ಷೆ ಡೌನ್‌ಲೋಡ್" },
  settings:           { en: "Settings",                    kn: "ಸೆಟ್ಟಿಂಗ್ಸ್",                  hi: "ಸೆಟ್ಟಿಂಗ್ಸ್" },

  // SOS page
  sosSuccessToast:    { en: "SOS Emergency Sent!",         kn: "SOS ತುರ್ತು ಕಳುಹಿಸಲಾಗಿದೆ!",    hi: "SOS ತುರ್ತು ಕಳುಹಿಸಲಾಗಿದೆ!" },
  latitude:           { en: "Latitude",                    kn: "ಅಕ್ಷಾಂಶ",                      hi: "ಅಕ್ಷಾಂಶ" },
  longitude:          { en: "Longitude",                   kn: "ರೇಖಾಂಶ",                       hi: "ರೇಖಾಂಶ" },
  shipRadioBridge:    { en: "Ship Radio Bridge",           kn: "ಹಡಗು ರೇಡಿಯೋ ಸೇತುವೆ",           hi: "ಜಹಾಜ್ ರೇಡಿಯೋ ಬ್ರಿಡ್ಜ್" },
  digitalBurst:       { en: "Digital Burst",               kn: "ಡಿಜಿಟಲ್ ಸಂಕೇತ",                hi: "ಡಿಜಿಟಲ್ ಬರ್ಸ್ಟ್" },
  voiceMayday:        { en: "Voice Mayday",                kn: "ಧ್ವನಿ ಮೇಡೇ",                    hi: "ಧ್ವನಿ ಮೇಡೇ" },
  radioReceiver:      { en: "Radio Receiver",              kn: "ರೇಡಿಯೋ ರಿಸೀವರ್",               hi: "ರೇಡಿಯೋ ರಿಸೀವರ್" },
  broadcastSignal:    { en: "Broadcast Signal",            kn: "ಸಂಕೇತ ಪ್ರಸಾರ ಮಾಡಿ",           hi: "ಸಂಕೇತ ಪ್ರಸಾರ ಮಾಡಿ" },
  listenIncoming:     { en: "Listen for Incoming",         kn: "ಬರುವ ಸಂಕೇತ ಆಲಿಸಿ",              hi: "ಬರುವ ಸಂಕೇತ ಆಲಿಸಿ" },

  // Login page
  email:              { en: "Email",                       kn: "ಇಮೇಲ್",                        hi: "ईमेल" },
  password:           { en: "Password",                    kn: "ಪಾಸ್‌ವರ್ಡ್",                   hi: "पासवर्ड" },
  loginEmailPlaceholder:    { en: "fisherman@email.com",   kn: "fisherman@email.com",           hi: "fisherman@email.com" },
  loginPasswordPlaceholder: { en: "Enter password",        kn: "ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ",           hi: "ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ" },
  pleaseWait:         { en: "Please Wait...",              kn: "ದಯವಿಟ್ಟು ಕಾಯಿರಿ...",           hi: "कृपया प्रतीक्षा करें..." },
  signup:             { en: "Create Account",              kn: "ಖಾತೆ ರಚಿಸಿ",                   hi: "खाता बनाएं" },
  login:              { en: "Login",                       kn: "ಲಾಗಿನ್",                        hi: "लॉग इन" },
  alreadyHaveAccount: { en: "Already have an account? Login", kn: "ಖಾತೆ ಇದೆಯೇ? ಲಾಗಿನ್ ಮಾಡಿ",  hi: "खाता ہے? लॉग इन करें" },
  dontHaveAccount:    { en: "Don't have an account? Sign Up", kn: "ಖಾತೆ ಇಲ್ಲವೇ? ನೋಂದಾಯಿಸಿ",  hi: "ಖಾತೆ ಇಲ್ಲವೇ? ನೋಂದಾಯಿಸಿ" },
  or:                 { en: "or",                          kn: "ಅಥವಾ",                          hi: "या" },
  continueAsGuest:    { en: "Continue as Guest",           kn: "ಅತಿಥಿಯಾಗಿ ಮುಂದುವರಿಯಿರಿ",      hi: "अतिथि के रूप में जारी रखें" },
  fillAllFields:      { en: "Please fill all fields",      kn: "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳನ್ನು ತುಂಬಿಸಿ", hi: "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳನ್ನು ತುಂಬಿಸಿ" },
  passwordLengthError: { en: "Password must be at least 6 characters", kn: "ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು ಇರಬೇಕು", hi: "ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು ಇರಬೇಕು" },
  accountCreatedVerify: { en: "Account created! Please verify your email.", kn: "ಖಾತೆ ರಚಿಸಲಾಗಿದೆ! ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಮೇಲ್ ಪರಿಶೀಲಿಸಿ.", hi: "ಖಾತೆ ರಚಿಸಲಾಗಿದೆ! ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಮೇಲ್ ಪರಿಶೀಲಿಸಿ." },
  loginSuccess:       { en: "Welcome back, Captain!",      kn: "ಸ್ವಾಗತ ಕ್ಯಾಪ್ಟನ್!",             hi: "ವಾಪಸ್ ಸ್ವಾಗತ, ಕ್ಯಾಪ್ಟನ್!" },
  guestWelcome:       { en: "Welcome, Guest Navigator!",   kn: "ಸ್ವಾಗತ, ಅತಿಥಿ ನಾವಿಕ!",         hi: "ಸ್ವಾಗತ, ಅತಿಥಿ ನಾವಿಕ!" },
  roleFisherman:      { en: "Fisherman",                   kn: "ಮೀನುಗಾರ",                      hi: "मछुआरा" },
  roleTourist:        { en: "Tourist",                     kn: "ಪ್ರವಾಸಿ",                       hi: "पर्यटक" },

  // Profile page
  userNameDemo:       { en: "Captain Rajan",               kn: "ಕ್ಯಾಪ್ಟನ್ ರಾಜನ್",             hi: "कैप्टन राजन" },
  verifiedFisherman:  { en: "Verified Vessel Master",      kn: "ಪರಿಶೀಲಿಸಿದ ನೌಕಾ ಮಾಸ್ಟರ್",      hi: "सत्यापित वेसल मास्टर" },
  safetyPro:          { en: "Safety Pro",                  kn: "ಸುರಕ್ಷತಾ ತಜ್ಞ",                 hi: "ಸುರಕ್ಷತಾ ಪ್ರೊ" },
  experience:         { en: "Experience",                  kn: "ಅನಿಭವ",                        hi: "ಅನಿಭವ" },
  level:              { en: "Level",                       kn: "ಹಂತ",                          hi: "ಹಂತ" },
  seaReadiness:       { en: "Sea Readiness",               kn: "ಸಮುದ್ರ ಸನ್ನದ್ಧತೆ",              hi: "ಸಮುದ್ರ ತಯಾರಿಕೆ" },
  high:               { en: "High",                        kn: "ಹೆಚ್ಚು",                        hi: "ಹೆಚ್ಚು" },
  identityMetrics:    { en: "IDENTITY METRICS",            kn: "ಗುರುತಿನ ಮಾಪನಗಳು",               hi: "पहचान मेट्रिक्स" },
  vesselMasterName:   { en: "Vessel Master Name",          kn: "ನೌಕಾ ಮಾಸ್ಟರ್ ಹೆಸರು",            hi: "ವೆಸೆಲ್ ಮಾಸ್ಟರ್ ಹೆಸರು" },
  commLink:           { en: "Comm Link (Phone)",           kn: "ಸಂಪರ್ಕ ಲಿಂಕ್ (ಫೋನ್)",            hi: "ಸಂಪರ್ಕ ಲಿಂಕ್ (ಫೋನ್)" },
  vesselMaster:       { en: "Vessel Master",               kn: "ನೌಕಾ ಮಾಸ್ಟರ್",                  hi: "ವೆಸೆಲ್ ಮಾಸ್ಟರ್" },
  commDialect:        { en: "COMMUNICATION DIALECT",       kn: "ಸಂವಹನ ಉಪಭಾಷೆ",                hi: "ಸಂವಹನ ಡೈಲೆಕ್ಟ್" },
  adminLinks:         { en: "ADMINISTRATIVE LINKS",        kn: "ಆಡಳಿತಾತ್ಮಕ ಲಿಂಕ್‌ಗಳು",            hi: "ಆಡಳಿತಾತ್ಮಕ ಲಿಂಕ್‌ಗಳು" },
  safetyCertificates: { en: "Safety Certificates",         kn: "ಸುರಕ್ಷತಾ ಪ್ರಮಾಣಪತ್ರಗಳು",          hi: "ಸುರಕ್ಷತಾ ಪ್ರಮಾಣಪತ್ರಗಳು" },
  appSettings:        { en: "App Settings",                kn: "ಅಪ್ಲಿಕೇಶನ್ ಸೆಟ್ಟಿಂಗ್ಸ್",        hi: "ಸೆಟ್ಟಿಂಗ್ಸ್" },
  logout:             { en: "Logout",                      kn: "ಲಾಗ್ ಔಟ್",                     hi: "ಲಾಗಿನ್ ಔಟ್" },
  langChangedToast:   { en: "Language Updated",            kn: "ಭಾಷೆ ಬದಲಾಯಿಸಲಾಗಿದೆ",           hi: "ಭಾಷೆ ಅಪ್‌ಡೇಟ್ ಆಗಿದೆ" },
  chatbotTitle:       { en: "MITRA AI CORE",            kn: "ಮಿತ್ರ AI ಕೋರ್",                 hi: "ಮಿತ್ರ AI ಕೋರ್" },
  chatbotIntro:       { en: "I am **MITRA AI**, your Maritime Intelligence Assistant.", kn: "ನಾನು ಮಿತ್ರ AI, ನಿಮ್ಮ ಸಮುದ್ರ ಗುಪ್ತಚರ ಸಹಾಯಕ.", hi: "ನಾನು ಮಿತ್ರ AI, ನಿಮ್ಮ ಸಮುದ್ರ ಗುಪ್ತಚರ ಸಹಾಯಕ." },
  askMitra:           { en: "Ask Mitra AI...",             kn: "ಮಿತ್ರ AI ಅನ್ನು ಕೇಳಿ...",          hi: "ಮಿತ್ರ AI ಅನ್ನು ಕೇಳಿ..." },
  bestFishingZones:   { en: "Best Fishing Zones",          kn: "ಉತ್ತಮ ಮೀನುಗಾರಿಕೆ ವಲಯಗಳು",        hi: "ಉತ್ತಮ ಮೀನುಗಾರಿಕೆ ವಲಯಗಳು" },
  seaConditions:      { en: "Sea Conditions",              kn: "ಸಮುದ್ರದ ಪರಿಸ್ಥಿತಿಗಳು",            hi: "ಸಮುದ್ರದ ಪರಿಸ್ಥಿತಿಗಳು" },
  safetyTips:         { en: "Safety Tips",                 kn: "ಸುರಕ್ಷತಾ ಸಲಹೆಗಳು",              hi: "ಸುರಕ್ಷತಾ ಸಲಹೆಗಳು" },
  navigationHelp:     { en: "Navigation Help",             kn: "ನೌಕಾಯಾನ ಸಹಾಯ",                 hi: "ನೌಕಾಯಾನ ಸಹಾಯ" },
  emergencySteps:     { en: "Emergency Steps",             kn: "ತುರ್ತು ಕ್ರಮಗಳು",                  hi: "ತುರ್ತು ಕ್ರಮಗಳು" },
  aiThinking:         { en: "Syncing data...",             kn: "ಮಾಹಿತಿ ಸಿಂಕ್ ಆಗುತ್ತಿದೆ...",        hi: "ಮಾಹಿತಿ ಸಿಂಕ್ ಆಗುತ್ತಿದೆ..." },
  aiOnline:           { en: "Advanced Marine Intelligence • Online", kn: "ಸುಧಾರಿತ ಸಮುದ್ರ ಗುಪ್ತಚರ • ಆನ್‌ಲೈನ್", hi: "ಸುಧಾರಿತ ಸಮುದ್ರ ಗುಪ್ತಚರ • ಆನ್‌ಲೈನ್" },

  // Settings page
  languageSwitch:     { en: "Language",                    kn: "ಭಾಷೆ",                          hi: "ಭಾಷೆ" },
  displayLanguage:    { en: "Display Language",            kn: "ಪ್ರದರ್ಶನ ಭಾಷೆ",                hi: "ಪ್ರದರ್ಶನ ಭಾಷೆ" },
  notificationSettings: { en: "Push Notifications",       kn: "ಪುಶ್ ಅಧಿಸೂಚನೆಗಳು",             hi: "ಪುಶ್ ಅಧಿಸೂಚನೆಗಳು" },

  // Alert engine
  dangerAlert:        { en: "🚨 DANGER ALERT",             kn: "🚨 ಅಪಾಯ ಎಚ್ಚರಿಕೆ",              hi: "🚨 ಅಪಾಯದ ಎಚ್ಚರಿಕೆ" },
  highWindAlert:      { en: "💨 HIGH WIND ALERT",          kn: "💨 ತೀವ್ರ ಗಾಳಿ ಎಚ್ಚರಿಕೆ",         hi: "💨 ತೀವ್ರ ಗಾಳಿ ಎಚ್ಚರಿಕೆ" },

  // Chatbot strings
  chatbotWelcome:     { en: "Welcome to Mitra AI. How can I assist you with your voyage today?", kn: "ಮಿತ್ರ AI ಗೆ ಸ್ವಾಗತ. ಇಂದು ನಿಮ್ಮ ಸಮುದ್ರಯಾನಕ್ಕೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?", hi: "ಮಿತ್ರ AI ಗೆ ಸ್ವಾಗತ. ಇಂದು ನಿಮ್ಮ ಸಮುದ್ರಯಾನಕ್ಕೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?" },
  aiDefaultResponse:  { en: "Synchronizing with maritime data. Please rephrase your query.", kn: "ಸಮುದ್ರ ಮಾಹಿತಿಯನ್ನು ಸಿಂಕ್ ಮಾಡಲಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಕೇಳಿ.", hi: "ಸಮುದ್ರ ಮಾಹಿತಿಯನ್ನು ಸಿಂಕ್ ಮಾಡಲಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಕೇಳಿ." },

  // Notifications
  stayInformed:       { en: "Stay informed with real-time maritime intelligence.", kn: "ನೈಜ ಸಮಯದ ಸಮುದ್ರ ಮಾಹಿತಿಯೊಂದಿಗೆ ನವೀಕೃತವಾಗಿರಿ.", hi: "ನೈಜ ಸಮಯದ ಸಮುದ್ರ ಮಾಹಿತಿಯೊಂದಿಗೆ ನವೀಕೃತವಾಗಿರಿ." },
  markAllAsRead:      { en: "Mark All Read",                kn: "ಎಲ್ಲವನ್ನೂ ಓದಿದಂತೆ ಗುರುತಿಸಿ",    hi: "ಎಲ್ಲವನ್ನೂ ಓದಿದಂತೆ ಗುರುತಿಸಿ" },

  // Dashboard
  welcomeBack:        { en: "Welcome back,",               kn: "ಮರಳಿ ಸ್ವಾಗತ,",               hi: "ವಾಪಸ್ ಸ್ವಾಗತ," },
  coastalIntelligence: { en: "Coastal Intelligence",        kn: "ಕರಾವಳಿ ಬುದ್ಧಿವಂತಿಕೆ",           hi: "ಕರಾವಳಿ ಬುದ್ಧಿವಂತಿಕೆ" },
  myVessel:           { en: "My Vessel",                   kn: "ನನ್ನ ನೌಕೆ",                   hi: "ನನ್ನ ಹಡಗು" },
  aiAssistant:        { en: "AI Assistant",                kn: "AI ಸಹಾಯಕ",                    hi: "AI ಸಹಾಯಕ" },
  emergencyAlerts:    { en: "Emergency Alerts",            kn: "ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳು",              hi: "ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳು" },
  liveTelemetry:      { en: "Live Telemetry",              kn: "ಲೈವ್ ಟೆಲಿಮೆಟ್ರಿ",                hi: "ಲೈವ್ ಟೆಲಿಮೆಟ್ರಿ" },
  temperature:        { en: "Temperature",                 kn: "ತಾಪಮಾನ",                        hi: "ತಾಪಮಾನ" },
  seaState:           { en: "Sea State",                   kn: "ಸಮುದ್ರದ ಸ್ಥಿತಿ",                  hi: "ಸಮುದ್ರದ ಸ್ಥಿತಿ" },
  calm:               { en: "Calm",                        kn: "ಶಾಂತ",                         hi: "ಶಾಂತ" },
  moderate:           { en: "Moderate",                    kn: "ಮಧ್ಯಮ",                        hi: "ಮಧ್ಯಮ" },
  humidity:           { en: "Humidity",                    kn: "ಆರ್ದ್ರತೆ",                      hi: "ಆರ್ದ್ರತೆ" },
  rainfall:           { en: "Rainfall",                    kn: "ಮಳೆ",                           hi: "ಮಳೆ" },
  weatherOutlook:     { en: "Weather Outlook",             kn: "ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ",              hi: "ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ" },
  next8Hours:         { en: "Next 8 Hours",                kn: "ಮುಂದಿನ 8 ಗಂಟೆ",                 hi: "ಮುಂದಿನ 8 ಗಂಟೆ" },
  history:            { en: "History",                     kn: "ಇತಿಹಾಸ",                        hi: "ಇತಿಹಾಸ" },
  activeAlertCritical: { en: "Active Alert • Critical",    kn: "ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆ • ಗಂಭೀರ",         hi: "ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆ • ಗಂಭೀರ" },
  cautionMonitoring:  { en: "Caution • Monitoring",        kn: "ಎಚ್ಚರಿಕೆ • ಮೇಲ್ವಿಚಾರಣೆ",          hi: "ಎಚ್ಚರಿಕೆ • ಮೇಲ್ವಿಚಾರಣೆ" },
  scanningTelemetry:  { en: "Scanning coastal telemetry...", kn: "ಕರಾವಳಿ ಮಾಹಿತಿಗಾಗಿ ಸ್ಕ್ಯಾನ್...", hi: "ಕರಾವಳಿ ಮಾಹಿತಿಗಾಗಿ ಸ್ಕ್ಯಾನ್..." },
  syncStatus:         { en: "Sync Status",                 kn: "ಸಿಂಕ್ ಸ್ಥಿತಿ",                   hi: "ಸಿಂಕ್ ಸ್ಥಿತಿ" },
  locked:             { en: "LOCKED",                      kn: "ಲಾಕ್ ಆಗಿದೆ",                   hi: "ಲಾಕ್ ಆಗಿದೆ" },
  monitoringStation:  { en: "Monitoring Station",          kn: "ಮೇಲ್ವಿಚಾರಣಾ ಕೇಂದ್ರ",            hi: "ಮೇಲ್ವಿಚಾರಣಾ ಕೇಂದ್ರ" },
  missionVerdict:     { en: "Mission Verdict",             kn: "ಕಾರ್ಯಾಚರಣೆಯ ತೀರ್ಪು",             hi: "ಮಿಷನ್ ವರ್ಡಿಕ್ಟ್" },
  analyzingRisk:      { en: "Analyzing Ocean Risk...",      kn: "ಸಮುದ್ರದ ಅಪಾಯ ವಿಶ್ಲೇಷಣೆ...",     hi: "ಸಮುದ್ರದ ಅಪಾಯ ವಿಶ್ಲೇಷಣೆ..." },
  oceanCurrents:      { en: "Ocean Currents",              kn: "ಸಮುದ್ರದ ಪ್ರವಾಹಗಳು",             hi: "ಸಮುದ್ರದ ಪ್ರವಾಹಗಳು" },
  windVector:         { en: "Wind Vector",                 kn: "ಗಾಳಿಯ ದಿಕ್ಕೆ",                   hi: "ಗಾಳಿಯ ದಿಕ್ಕೆ" },
  nextTide:           { en: "Next Tide Update",            kn: "ಮುಂದಿನ ಉಬ್ಬರವಿಳಿತ",             hi: "ಮುಂದಿನ ಉಬ್ಬರವಿಳಿತ" },
  inMins:             { en: "IN {mins} MINS",              kn: "{mins} ನಿಮಿಷದಲ್ಲಿ",             hi: "{mins} ನಿಮಿಷದಲ್ಲಿ" },

  // Weather
  liveWeather:        { en: "Live Weather",                kn: "ನೇರ ಹವಾಮಾನ",                   hi: "ನೈಜ ಹವಾಮಾನ" },
  safeToSail:         { en: "Safe to Sail",                kn: "ಹಡಗು ನಡೆಸಲು ಸುರಕ್ಷಿತ",           hi: "ನೌಕಾಯಾನಕ್ಕೆ ಸುರಕ್ಷಿತ" },
  dangerToSail:       { en: "Danger to Sail",              kn: "ಹಡಗು ನಡೆಸಲು ಅಪಾಯಕಾರಿ",          hi: "ನೌಕಾಯಾನಕ್ಕೆ ಅಪಾಯಕಾರಿ" },
  windSpeed:          { en: "Wind Speed",                  kn: "ಗಾಳಿಯ ವೇಗ",                  hi: "ಗಾಳಿಯ ವೇಗ" },
  waveHeight:         { en: "Wave Height",                 kn: "ಅಲೆಗಳ ಎತ್ತರ",                  hi: "ಅಲೆಗಳ ಎತ್ತರ" },
  locatingGps:        { en: "Locating via GPS...",         kn: "GPS ಮೂಲಕ ಹುಡುಕಲಾಗುತ್ತಿದೆ...",     hi: "GPS ಮೂಲಕ ಹುಡುಕಲಾಗುತ್ತಿದೆ..." },

  // Fish Market
  buyFish:            { en: "Buy Catch",                   kn: "ಮೀನು ಖರೀದಿ",                  hi: "ಮೀನು ಖರೀದಿ" },
  sellCatch:          { en: "Sell Catch",                  kn: "ಮೀನು ಮಾರಾಟ",                  hi: "ಮೀನು ಮಾರಾಟ" },
  availableListings:  { en: "Available Listings",          kn: "ಲಭ್ಯವಿರುವ ಪಟ್ಟಿಗಳು",           hi: "ಲಭ್ಯವಿರುವ ಪಟ್ಟಿಗಳು" },
  uploadPhoto:        { en: "Upload Catch Photo",          kn: "ಮೀನಿನ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",     hi: "ಮೀನಿನ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ" },
  fishNameSpecies:    { en: "Fish Name / Species",         kn: "ಮೀನಿನ ಹೆಸರು / ತಳಿ",             hi: "ಮೀನಿನ ಹೆಸರು / ತಳಿ" },
  fishNamePlaceholder: { en: "e.g. King Mackerel",          kn: "ಉದಾ: ಕಿಂಗ್ ಮ್ಯಾಕೆರೆಲ್",          hi: "ಉದಾ: ಕಿಂಗ್ ಮ್ಯಾಕೆರೆಲ್" },
  pricePerKg:         { en: "Price per KG (₹)",            kn: "ಕೆಜಿಗೆ ಬೆಲೆ (₹)",                 hi: "ಕೆಜಿಗೆ ಬೆಲೆ (₹)" },
  availableQty:       { en: "Available Qty (KG)",          kn: "ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣ (ಕೆಜಿ)",        hi: "ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣ (ಕೆಜಿ)" },
  listItemMarket:     { en: "List Item on Market",         kn: "ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಪಟ್ಟಿ ಮಾಡಿ",       hi: "ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಪಟ್ಟಿ ಮಾಡಿ" },
  callSeller:         { en: "Call Seller",                 kn: "ಮಾರಾಟಗಾರರಿಗೆ ಕರೆ ಮಾಡಿ",        hi: "ಮಾರಾಟಗಾರರಿಗೆ ಕರೆ ಮಾಡಿ" },
  whatsappSeller:     { en: "WhatsApp",                    kn: "WhatsApp",                    hi: "WhatsApp" },
  listingSuccess:     { en: "Listing Added Successfully!", kn: "ಯಶಸ್ವಿಯಾಗಿ ಪಟ್ಟಿಗೆ ಸೇರಿಸಲಾಗಿದೆ!", hi: "ಯಶಸ್ವಿಯಾಗಿ ಪಟ್ಟಿಗೆ ಸೇರಿಸಲಾಗಿದೆ!" },
  browseBuy:          { en: "Browse & Buy",                kn: "ಬ್ರೌಸ್ ಮತ್ತು ಖರೀದಿಸಿ",            hi: "ಬ್ರೌಸ್ ಮತ್ತು ಖರೀದಿಸಿ" },
  postListing:        { en: "Post a Listing",              kn: "ಪಟ್ಟಿಯನ್ನು ತಯಾರಿಸಿ",              hi: "ಪಟ್ಟಿಯನ್ನು ತಯಾರಿಸಿ" },
  searchMarket:       { en: "Search fish, seller, or location...", kn: "ಮೀನು, ಮಾರಾಟಗಾರ ಅಥವಾ ಸ್ಥಳವನ್ನು ಹುಡುಕಿ...", hi: "ಮೀನು, ಮಾರಾಟಗಾರ ಅಥವಾ ಸ್ಥಳವನ್ನು ಹುಡುಕಿ..." },
  allTypes:           { en: "All Types",                   kn: "ಎಲ್ಲಾ ವಿಧಗಳು",                  hi: "ಎಲ್ಲಾ ವಿಧಗಳು" },
  prawn:              { en: "Prawn",                       kn: "ಸಿಗಡಿ",                        hi: "ಸಿಗಡಿ" },
  crab:               { en: "Crab",                        kn: "ಏಡಿ",                          hi: "ಏಡಿ" },
  squid:              { en: "Squid",                       kn: "ಸ್ಕ್ವಿಡ್",                      hi: "ಸ್ಕ್ವಿಡ್" },
  lobster:            { en: "Lobster",                     kn: "ನಳ್ಳಿ",                        hi: "ನಳ್ಳಿ" },
  other:              { en: "Other",                       kn: "ಇತರೆ",                         hi: "ಇತರೆ" },
  listingsFound:      { en: "listings found",              kn: "ಪಟ್ಟಿಗಳು ಕಂಡುಬಂದಿವೆ",            hi: "ಪಟ್ಟಿಗಳು ಕಂಡುಬಂದಿವೆ" },
  activeListingsCount:{ en: "Active Listings",             kn: "ಸಕ್ರಿಯ ಪಟ್ಟಿಗಳು",                 hi: "ಸಕ್ರಿಯ ಪಟ್ಟಿಗಳು" },
  avgPrice:           { en: "Avg Price",                   kn: "ಸರಾಸರಿ ಬೆಲೆ",                  hi: "ಸರಾಸರಿ ಬೆಲೆ" },
  verified:           { en: "Verified",                    kn: "ದೃಢೀಕರಿಸಲಾಗಿದೆ",                hi: "ದೃಢೀಕರಿಸಲಾಗಿದೆ" },
  kgAvail:            { en: "kg available",                kn: "ಕೆಜಿ ಲಭ್ಯವಿದೆ",                  hi: "ಕೆಜಿ ಲಭ್ಯವಿದೆ" },
  fresh:              { en: "Fresh",                       kn: "ತಾಜಾ",                         hi: "ತಾಜಾ" },
  yourName:           { en: "Your Name *",                 kn: "ನಿಮ್ಮ ಹೆಸರು *",                  hi: "ನಿಮ್ಮ ಹೆಸರು *" },
  phoneNumberTarget:  { en: "Phone Number * (Buyers will contact here)", kn: "ಫೋನ್ ಸಂಖ್ಯೆ * (ಖರೀದಿದಾರರು ಇಲ್ಲಿ ಸಂಪರ್ಕಿಸುತ್ತಾರೆ)", hi: "ಫೋನ್ ಸಂಖ್ಯೆ *" },
  categoryTarget:     { en: "Category *",                  kn: "ವರ್ಗ *",                       hi: "ವರ್ಗ *" },
  priceTarget:        { en: "Price (₹/kg) *",              kn: "ಬೆಲೆ (₹/ಕೆಜಿ) *",                hi: "ಬೆಲೆ (₹/ಕೆಜಿ) *" },
  qtyTarget:          { en: "Quantity (kg) *",             kn: "ಪ್ರಮಾಣ (ಕೆಜಿ) *",                hi: "ಮಾಣ (ಕೆಜಿ) *" },
  descTarget:         { en: "Description (optional)",      kn: "ವಿವರಣೆ (ಐಚ್ಛಿಕ)",               hi: "ವಿವರಣೆ (ಐಚ್ಛಿಕ)" },
  gpsAutoDetect:      { en: "Your GPS location will be auto-detected when listing is posted", kn: "ಪಟ್ಟಿ ಮಾಡಿದಾಗ ನಿಮ್ಮ GPS ಸ್ಥಳವನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತದೆ", hi: "ನಿಮ್ಮ GPS ಸ್ಥಳವನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತದೆ" },
  goLive:             { en: "Post Listing — Go Live",      kn: "ಪಟ್ಟಿಮಾಡಿ — ಲೈವ್ ಮಾಡಿ",           hi: "ಪಟ್ಟಿಮಾಡಿ — ಲೈವ್ ಮಾಡಿ" },
  removeListing:      { en: "Remove my listing",           kn: "ನನ್ನ ಪಟ್ಟಿಯನ್ನು ಅಳಿಸಿ",            hi: "ಪಟ್ಟಿಯನ್ನು ಅಳಿಸಿ" },
  confirmDelete:      { en: "Confirm delete?",             kn: "ಅಳಿಸಲು ಖಚಿತಪಡಿಸಿ?",              hi: "ಅಳಿಸಲು ಖಚಿತಪಡಿಸಿ?" },
  yesRemove:          { en: "Yes, remove",                 kn: "ಹೌದು, ಅಳಿಸಿ",                  hi: "ಹೌದು, ಅಳಿಸಿ" },
  cancel:             { en: "Cancel",                      kn: "ರದ್ದುಗೊಳಿಸಿ",                    hi: "ರದ್ದುಗೊಳಿಸಿ" },
  loadingMarket:      { en: "Loading market data...",      kn: "ಮಾರುಕಟ್ಟೆ ಡೇಟಾ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",  hi: "ಲೋಡ್ ಆಗುತ್ತಿದೆ..." },
  noListings:         { en: "No listings found",           kn: "ಯಾವುದೇ ಪಟ್ಟಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ",       hi: "ಯಾವುದೇ ಪಟ್ಟಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ" },
  beTheFirst:         { en: "Be the first to post a listing!", kn: "ಪಟ್ಟಿ ಮಾಡುವಲ್ಲಿ ಮೊದಲಿಗರಾಗಿರಿ!",   hi: "ಪಟ್ಟಿ ಮಾಡುವಲ್ಲಿ ಮೊದಲಿಗರಾಗಿರಿ!" },
  tradeHub:           { en: "Live Trade Hub",              kn: "ಲೈವ್ ಟ್ರೇಡ್ ಹಬ್",                hi: "ಲೈವ್ ಟ್ರೇಡ್ ಹಬ್" },

  // PFZ / Fish Detection
  pfzFinder:          { en: "PFZ Finder",                  kn: "ಮೀನುಗಾರಿಕೆ ವಲಯ ಪತ್ತೆ",           hi: "PFZ ಫೈಂಡರ್" },
  pfzDesc:            { en: "Satellite-based Potential Fishing Zones predicted via multi-parameter modeling.", kn: "ಉಪಗ್ರಹ ಆಧಾರಿತ ಮೀನುಗಾರಿಕೆ ವಲಯಗಳು.", hi: "ಉಪಗ್ರಹ ಆಧಾರಿತ ಮೀನುಗಾರಿಕೆ ವಲಯಗಳು." },
  satelliteSync:      { en: "SATELLITE SYNC",              kn: "ಸ್ಯಾಟಲೈಟ್ ಸಿಂಕ್",                hi: "ಸ್ಯಾಟಲೈಟ್ ಸಿಂಕ್" },
  liveSatellite:      { en: "LIVE SATELLITE",              kn: "ಲೈವ್ ಸ್ಯಾಟಲೈಟ್",                hi: "ಲೈವ್ ಸ್ಯಾಟಲೈಟ್" },
  offlineEngine:      { en: "OFFLINE ENGINE",              kn: "ಆಫ್‌ಲೈನ್ ಇಂಜಿನ್",                hi: "ಆಫ್‌ಲೈನ್ ಇಂಜಿನ್" },
  syncing:            { en: "Syncing...",                  kn: "ಸಿಂಕ್ ಆಗುತ್ತಿದೆ...",            hi: "ಸಿಂಕ್ ಆಗುತ್ತಿದೆ..." },
  forceSync:          { en: "FORCE SYNC",                  kn: "ಪೋರ್ಸ್ ಸಿಂಕ್",                  hi: "ಪೋರ್ಸ್ ಸಿಂಕ್" },
  lastSyncPrefix:     { en: "LAST UPDATED",                kn: "ಕೊನೆಯ ನವೀಕರಣ",                   hi: "ಕೊನೆಯ ನವೀಕರಣ" },
  yourVessel:         { en: "YOUR VESSEL",                 kn: "ನಿಮ್ಮ ನೌಕೆ",                    hi: "ನಿಮ್ಮ ಹಡಗು" },
  pfzHotspot:         { en: "PFZ HOTSPOT",                 kn: "PFZ ಹಾಟ್‌ಸ್ಪಾಟ್",               hi: "PFZ ಹಾಟ್‌ಸ್ಪಾಟ್" },
  confidence:         { en: "CONFIDENCE",                  kn: "ವಿಶ್ವಾಸಾರ್ಹತೆ",                  hi: "ವಿಶ್ವಾಸಾರ್ಹತೆ" },
  score:              { en: "SCORE",                       kn: "ಅಂಕ",                          hi: "ಸ್ಕೋರ್" },
  vesselStatusOnline: { en: "VESSEL STATUS: ONLINE",       kn: "ನೌಕೆಯ ಸ್ಥಿತಿ: ಆನ್ಲೈನ್",          hi: "ಹಡಗಿನ ಸ್ಥಿತಿ: ಲೈವ್" },
  vesselStatusOffline: { en: "VESSEL STATUS: OFFLINE",      kn: "ನೌಕೆಯ ಸ್ಥಿತಿ: ಆಫ್ಲೈನ್",          hi: "ಹಡಗಿನ ಸ್ಥಿತಿ: ಆಫ್‌ಲೈನ್" },
  hudHotspot:         { en: "HOTSPOT",                     kn: "ಹಾಟ್‌ಸ್ಪಾಟ್",                   hi: "ಹಾಟ್‌ಸ್ಪಾಟ್" },
  hudModerate:        { en: "MODERATE",                    kn: "ಮಧ್ಯಮ",                        hi: "ಮಧ್ಯಮ" },
  hudFront:           { en: "CONVERGENCE FRONT",           kn: "ಅಲೆಗಳ ಸಂಗಮ",                    hi: "ಸಂಗಮ ಮುಂಭಾಗ" },
  zoneAnalytics:      { en: "ZONE ANALYTICS",              kn: "ವಲಯ ವಿಶ್ಲೇಷಣೆ",                 hi: "ವಲಯ ವಿಶ್ಲೇಷಣೆ" },
  targetLabel:        { en: "COORDINATES",                 kn: "ಸ್ಥಳದ ವಿವರ",                    hi: "ಸ್ಥಳದ ವಿವರ" },
  biologicalInsight:  { en: "BIOLOGICAL INSIGHT",           kn: "ಜೈವಿಕ ಒಳನೋಟ",                   hi: "ಜೈವಿಕ ಒಳನೋಟ" },
  sourceLabel:        { en: "SOURCE",                      kn: "ಮೂಲ",                          hi: "ಮೂಲ" },
  safetyFactor:       { en: "SAFETY FACTOR",               kn: "ಸುರಕ್ಷತಾ ಅಂಶ",                   hi: "ಸುರಕ್ಷತಾ ಅಂಶ" },
  safeForDeployment:  { en: "SAFE FOR DEPLOYMENT",          kn: "ನಿಯೋಜನೆಗೆ ಸುರಕ್ಷಿತ",              hi: "ಹೋಗಲು ಸುರಕ್ಷಿತ" },
  cautionWaveDrift:   { en: "CAUTION: WAVE DRIFT",         kn: "ಎಚ್ಚರಿಕೆ: ಅಲೆಗಳ ಅಲೆತ",            hi: "ಎಚ್ಚರಿಕೆ: ಅಲೆಗಳ ಅಲೆತ" },
  predictedSpecies:   { en: "PREDICTED SPECIES",           kn: "ನಿರೀಕ್ಷಿತ ಮೀನು ತಳಿಗಳು",          hi: "ನಿರೀಕ್ಷಿತ ಮೀನುಗಳು" },
  navigationTelemetry: { en: "NAVIGATION TELEMETRY",        kn: "ನೌಕಾಯಾನ ಮಾಹಿತಿ",                 hi: "ನೌಕಾಯಾನ ಮಾಹಿತಿ" },
  habitatLabel:       { en: "HABITAT",                     kn: "ವಾಸಸ್ಥಾನ",                      hi: "ವಾಸಸ್ಥಾನ" },
  travelTime:         { en: "TRAVEL TIME",                 kn: "ಪ್ರಯಾಣದ ಸಮಯ",                   hi: "ಪ್ರಯಾಣ" },
  modelConfidence:    { en: "MODEL CONFIDENCE",            kn: "ಮಾದರಿ ವಿಶ್ವಾಸಾರ್ಹತೆ",              hi: "ವಿಶ್ವಾಸಾರ್ಹತೆ" },
  selectZoneHint:     { en: "SELECT A ZONE ON THE MAP TO REVEAL DEEP ANALYTICS", kn: "ವಿಶ್ಲೇಷಣೆಗಾಗಿ ಮ್ಯಾಪ್‌ನಲ್ಲಿ ವಲಯವನ್ನು ಆರಿಸಿ", hi: "ವಿಶ್ಲೇಷಣೆಗಾಗಿ ಮ್ಯಾಪ್‌ನಲ್ಲಿ ವಲಯವನ್ನು ಆರಿಸಿ" },
  activeHotspots:     { en: "ACTIVE REGIONAL HOTSPOTS",    kn: "ಸಕ್ರಿಯ ಪ್ರಾದೇಶಿಕ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು",  hi: "ಸಕ್ರಿಯ ವಲಯಗಳು" },
  regionSync:         { en: "REAL-TIME REGION SYNC",       kn: "ಪ್ರಾದೇಶಿಕ ಸಿಂಕ್",                 hi: "ಪ್ರಾದೇಶಿಕ ಸಿಂಕ್" },
  probLabel:          { en: "FISH PROBABILITY",            kn: "ಮೀನಿನ ಸಾಧ್ಯತೆ",                  hi: "ಸಾಧ್ಯತೆ" },
  trainingLabel:      { en: "TRAINING AI...",              kn: "AI ತರಬೇತಿ...",                  hi: "ತರಬೇತಿ..." },
  scienceTitle:       { en: "THE SCIENCE OF MITRA",        kn: "ಮಿತ್ರದ ವಿಜ್ಞಾನ",                   hi: "ಜೋನ್ ವಿಜ್ಞಾನ" },
  scienceDesc:        { en: "Our AI analyzes multiple satellite parameters to predict high-yield zones.", kn: "ಹೆಚ್ಚು ಮೀನು ಸಿಗುವ ವಲಯಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಲು ನಮ್ಮ AI ಉಪಗ್ರಹ ಮಾಹಿತಿ ಬಳಸುತ್ತದೆ.", hi: "ಹೆಚ್ಚು ಮೀನು ಸಿಗುವ ವಲಯಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಲು ನಮ್ಮ AI ಉಪಗ್ರಹ ಮಾಹಿತಿ ಬಳಸುತ್ತದೆ." },
  phytoplanktonMapping: { en: "PHYTOPLANKTON MAPPING",     kn: "ಫೈಟೊಪ್ಲಾಂಕ್ಟನ್ ಮ್ಯಾಪಿಂಗ್",       hi: "ಫೈಟೊಪ್ಲಾಂಕ್ಟನ್ ಮ್ಯಾಪಿಂಗ್" },
  phytoDesc:          { en: "Chlorophyll fronts detected from space indicate food-rich waters.", kn: "ಆಕಾಶದಿಂದ ಪತ್ತೆಹಚ್ಚಲಾದ ಕ್ಲೋರೋಫಿಲ್ ಆಹಾರ ಸಮೃದ್ಧ ನೀರನ್ನು ಸೂಚಿಸುತ್ತದೆ.", hi: "ಆಕಾಶದಿಂದ ಪತ್ತೆಹಚ್ಚಲಾದ ಕ್ಲೋರೋಫಿಲ್ ಆಹಾರ ಸಮೃದ್ಧ ನೀರನ್ನು ಸೂಚಿಸುತ್ತದೆ." },
  thermalFrontsMap:   { en: "THERMAL FRONTS MAP",          kn: "ಥರ್ಮಲ್ ಫ್ರಂಟ್ಸ್ ಮ್ಯಾಪ್",            hi: "ಥರ್ಮಲ್ ಫ್ರಂಟ್ಸ್ ಮ್ಯಾಪ್" },
  thermalDesc:        { en: "Convergence of cold and warm currents create ideal habitat zones.", kn: "ತಂಪು ಮತ್ತು ಬೆಚ್ಚಗಿನ ಪ್ರವಾಹಗಳ ಸಂಗಮವು ಆದರ್ಶ ವಾಸಸ್ಥಾನಗಳನ್ನು ಸೃಷ್ಟಿಸುತ್ತದೆ.", hi: "ಪ್ರವಾಹಗಳ ಸಂಗಮವು ಆದರ್ಶ ವಾಸಸ್ಥಾನಗಳನ್ನು ಸೃಷ್ಟಿಸುತ್ತದೆ." },
  oceanColorImg:      { en: "OCEAN COLOR IMAGERY",         kn: "ಸಮುದ್ರದ ಬಣ್ಣದ ಚಿತ್ರಣ",            hi: "ಸಮುದ್ರದ ಬಣ್ಣದ ಚಿತ್ರಣ" },
  colorDesc:          { en: "Subtle color variations reveal nutrient-dense pelagic hotspots.", kn: "ಸೂಕ್ಷ್ಮ ಬಣ್ಣದ ವ್ಯತ್ಯಾಸಗಳು ಪೋಷಕಾಂಶ-ದಟ್ಟವಾದ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳನ್ನು ತೋರಿಸುತ್ತವೆ.", hi: "ಬಣ್ಣದ ವ್ಯತ್ಯಾಸಗಳು ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳನ್ನು ತೋರಿಸುತ್ತವೆ." },
  bathymetricZone:    { en: "BATHYMETRIC ZONATION",        kn: "ಸಮುದ್ರದ ಆಳದ ವಲಯ",               hi: "ಸಮುದ್ರದ ಆಳದ ವಲಯ" },
  bathyDesc:          { en: "Shelf depth analysis predicts habitat-specific multi-species catch.", kn: "ಸಮುದ್ರದ ಆಳದ ವಿಶ್ಲೇಷಣೆಯು ವಿವಿಧ ಮೀನು ತಳಿಗಳನ್ನು ಊಹಿಸುತ್ತದೆ.", hi: "ಸಮುದ್ರದ ಆಳದ ವಿಶ್ಲೇಷಣೆಯು ಮೀನು ತಳಿಗಳನ್ನು ಊಹಿಸುತ್ತದೆ." },
  filterActive:       { en: "FILTER ACTIVE",               kn: "ಫಿಲ್ಟರ್ ಸಕ್ರಿಯ",                  hi: "ಫಿಲ್ಟರ್ ಸಕ್ರಿಯ" },
  mlEngine:           { en: "MACHINE LEARNING ENGINE",     kn: "ಮೆಷಿನ್ ಲರ್ನಿಂಗ್ ಇಂಜಿನ್",          hi: "ಮೆಷಿನ್ ಲರ್ನಿಂಗ್ ಇಂಜಿನ್" },
  mlTrainingViz:      { en: "ML TRAINING VISUALIZATION",   kn: "ML ತರಬೇತಿಯ ಚಿತ್ರಣ",             hi: "ML ತರಬೇತಿಯ ಚಿತ್ರಣ" },
  step1Title:         { en: "MULTI-SPECTRAL DATA",         kn: "ಮಲ್ಟಿ-ಸ್ಪೆಕ್ಟ್ರಲ್ ಮಾಹಿತಿ",           hi: "ಮಲ್ಟಿ-ಸ್ಪೆಕ್ಟ್ರಲ್ ಮಾಹಿತಿ" },
  step1Desc:          { en: "We analyze high-resolution SST and Chlorophyll spectral bands.", kn: "ನಾವು SST ಮತ್ತು ಕ್ಲೋರೋಫಿಲ್ ಸ್ಪೆಕ್ಟ್ರಲ್ ಬ್ಯಾಂಡ್‌ಗಳನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತೇವೆ.", hi: "SST ಮತ್ತು ಕ್ಲೋರೋಫಿಲ್ ವಿಶ್ಲೇಷಿಸುತ್ತೇವೆ." },
  step2Title:         { en: "CORRELATION MAPPING",         kn: "ಸಂಬಂಧಿತ ಮ್ಯಾಪಿಂಗ್",              hi: "ಸಂಬಂಧಿತ ಮ್ಯಾಪಿಂಗ್" },
  step2Desc:          { en: "Neural networks correlate environmental data with catch logs.", kn: "ನರಮಂಡಲಗಳು ಪರಿಸರ ಮಾಹಿತಿಯನ್ನು ಕ್ಯಾಚ್ ಲಾಗ್‌ಗಳೊಂದಿಗೆ ಸಂಯೋಜಿಸುತ್ತವೆ.", hi: "ಪರಿಸರ ಮಾಹಿತಿಯನ್ನು ಲಾಗ್‌ಗಳೊಂದಿಗೆ ಸಂಯೋಜಿಸುತ್ತವೆ." },
  step3Title:         { en: "LOCALIZED REFINEMENT",        kn: "ಸ್ಥಳೀಯ ಸುಧಾರಣೆ",                hi: "ಸ್ಥಳೀಯ ಸುಧಾರಣೆ" },
  step3Desc:          { en: "Your feedback trains the model for specific regional precision.", kn: "ನಿಮ್ಮ ಫೀಡ್‌ಬ್ಯಾಕ್ ಪ್ರಾದೇಶಿಕ ನಿಖರತೆಗಾಗಿ ಮಾಡೆಲ್‌ಗೆ ತರಬೇತಿ ನೀಡುತ್ತದೆ.", hi: "ನಿಮ್ಮ ಫೀಡ್‌ಬ್ಯಾಕ್ ಮಾಡೆಲ್‌ಗೆ ತರಬೇತಿ ನೀಡುತ್ತದೆ." },
  step3Prefix:        { en: "Optimizing for local",        kn: "ಸ್ಥಳೀಯಕ್ಕಾಗಿ ಉತ್ತಮಗೊಳಿಸಲಾಗುತ್ತಿದೆ",  hi: "ಸ್ಥಳೀಯಕ್ಕಾಗಿ ಉತ್ತಮಗೊಳಿಸಲಾಗುತ್ತಿದೆ" },
  zonesRespecting:    { en: "ZONES RESPECTING CURRENT HABITAT LOGIC", kn: "ಪ್ರಸ್ತುತ ವಾಸಸ್ಥಾನದ ತರ್ಕದ ಅಡಿಯಲ್ಲಿನ ವಲಯಗಳು", hi: "ವಲಯಗಳ ಹೊಂದಾಣಿಕೆ" },
  multimodalWeighting: { en: "Multimodal Parameter Weighting", kn: "ಮಲ್ಟಿಮೋಡಲ್ ನಿಯತಾಂಕ ತೂಕ",           hi: "ಮಲ್ಟಿಮೋಡಲ್ ನಿಯತಾಂಕ ತೂಕ" },
  modelAccuracyFactor: { en: "Model Accuracy Factor",          kn: "ಮಾಡೆಲ್ ನಿಖರತೆಯ ಅಂಶ",            hi: "ಮಾಡೆಲ್ ನಿಖರತೆಯ ಅಂಶ" },
  sstLabel:           { en: "SST",                         kn: "SST",                          hi: "SST" },
  sstBasis:           { en: "Thermal Basis",               kn: "ಥರ್ಮಲ್ ಆಧಾರ",                   hi: "ಥರ್ಮಲ್ ಆಧಾರ" },
  planktonLabel:      { en: "Plankton",                    kn: "ಪ್ಲಾಂಕ್ಟನ್",                    hi: "ಪ್ಲಾಂಕ್ಟನ್" },
  planktonBasis:      { en: "Food Chain",                  kn: "ಆಹಾರ ಸರಪಳಿ",                    hi: "ಆಹಾರ ಸರಪಳಿ" },
  currentLabel:       { en: "Currents",                    kn: "ಪ್ರವಾಹ",                        hi: "ಪ್ರವಾಹ" },
  currentBasis:       { en: "Drift Logic",                 kn: "ಡ್ರಿಫ್ಟ್ ಲಾಜಿಕ್",                    hi: "ಡ್ರಿಫ್ಟ್ ಲಾಜಿಕ್" },
  colorLabel:         { en: "Water Color",                 kn: "ನೀರಿನ ಬಣ್ಣ",                      hi: "ನೀರಿನ ಬಣ್ಣ" },
  colorBasis:         { en: "Turbidity Basis",             kn: "ಟರ್ಬಿಡಿಟಿ ಆಧಾರ",                  hi: "ಟರ್ಬಿಡಿಟಿ ಆಧಾರ" },
  salinityLabel:      { en: "Salinity",                    kn: "ಲವಣಾಂಶ",                       hi: "ಲವಣಾಂಶ" },
  salinityBasis:      { en: "Habitat Logic",               kn: "ವಾಸಸ್ಥಾನದ ತರ್ಕ",                  hi: "ವಾಸಸ್ಥಾನದ ತರ್ಕ" },
  thermoclineLabel:   { en: "Thermocline",                 kn: "ಥರ್ಮೋಕ್ಲೈನ್",                  hi: "ಥರ್ಮೋಕ್ಲೈನ್" },
  thermoclineBasis:   { en: "Depth Anchor",                kn: "ಆಳದ ಮಾಹಿತಿ",                     hi: "ಆಳದ ಮಾಹಿತಿ" },
  turbidityLabel:     { en: "Turbidity",                   kn: "ಟರ್ಬಿಡಿಟಿ",                     hi: "ಟರ್ಬಿಡಿಟಿ" },
  turbidityBasis:     { en: "Optical Basis",               kn: "ಆಪ್ಟಿಕಲ್ ಆಧಾರ",                  hi: "ಆಪ್ಟಿಕಲ್ ಆಧಾರ" },
  moonPhaseLabel:     { en: "Lunar Phase",                 kn: "ಚಂದ್ರನ ಹಂತ",                    hi: "ಚಂದ್ರನ ಹಂತ" },
  moonPhaseBasis:     { en: "Gravity Logic",               kn: "ಗುರುತ್ವಾಕರ್ಷಣೆಯ ತರ್ಕ",             hi: "ಗುರುತ್ವಾಕರ್ಷಣೆಯ ತರ್ಕ" },
  justNow:            { en: "Just now",                    kn: "ಈಗ ತಾನೇ",                       hi: "ಈಗ ತಾನೇ" },
  minsAgo:            { en: "{n}m ago",                    kn: "{n} ನಿಮಿಷದ ಹಿಂದೆ",              hi: "{n} ನಿಮಿಷದ ಹಿಂದೆ" },
  hoursAgo:           { en: "{n}h ago",                    kn: "{n} ಗಂಟೆಯ ಹಿಂದೆ",               hi: "{n} ಗಂಟೆಯ ಹಿಂದೆ" },
  step:               { en: "Step",                        kn: "ಹಂತ",                          hi: "ಹಂತ" },
  trainingLabelSuffix: { en: "TRAINING...",                kn: "ತರಬೇತಿ...",                    hi: "ತರಬೇತಿ..." },
  aiPredictionActive: { en: "AI Prediction Active",        kn: "AI ಭವಿಷ್ಯವಾಣಿ ಸಕ್ರಿಯವಾಗಿದೆ",      hi: "AI ಭವಿಷ್ಯವಾಣಿ ಸಕ್ರಿಯ" },
  catchProbability:   { en: "Catch Probability",           kn: "ಮೀನು ಸಿಗುವ ಸಾಧ್ಯತೆ",             hi: "ಮೀನು ಸಿಗುವ ಸಾಧ್ಯತೆ" },
  highDensity:        { en: "High Density Hotspot",        kn: "ಹೆಚ್ಚು ಮೀನು ಸಿಗುವ ವಲಯ",          hi: "ಹೆಚ್ಚು ಮೀನು ಸಿಗುವ ವಲಯ" },
  oceanFronts:        { en: "Convergence Zone",            kn: "ಸಮುದ್ರದ ಅಲೆಗಳ ಸಂಗಮ",            hi: "ಸಮುದ್ರದ ಅಲೆಗಳ ಸಂಗಮ" },
  sst:                { en: "Sea Temp (SST)",              kn: "ಸಮುದ್ರದ ತಾಪಮಾನ",                hi: "ಸಮುದ್ರದ ತಾಪಮಾನ" },
  chlorophyll:        { en: "Chlorophyll Front",           kn: "ಕ್ಲೋರೋಫಿಲ್ ಮುಂಭಾಗ",              hi: "ಕ್ಲೋರೋಫಿಲ್ ಮುಂಭಾಗ" },
  bathymetry:         { en: "Shelf Depth",                 kn: "ಸಮುದ್ರದ ಆಳ",                    hi: "ಸಮುದ್ರದ ಆಳ" },
  currents:           { en: "Ocean Currents",              kn: "ಸಮುದ್ರದ ಪ್ರವಾಹಗಳು",             hi: "ಸಮುದ್ರದ ಪ್ರವಾಹಗಳು" },
  confirmCatch:       { en: "Confirm Catch",               kn: "ಮೀನು ಸಿಕ್ಕಿದ್ದನ್ನು ಖಚಿತಪಡಿಸಿ",   hi: "ಖಚಿತಪಡಿಸಿ" },
  trainAI:            { en: "Teach AI",                    kn: "AI ಗೆ ತರಬೇತಿ ನೀಡಿ",              hi: "AI ಗೆ ತರಬೇತಿ ನೀಡಿ" },

  // --- Native Animations: Safety Module ---
  startDrill:         { en: "Start Drill",               kn: "ತರಬೇತಿ ಪ್ರಾರಂಭಿಸಿ",             hi: "ತರಬೇತಿ ಪ್ರಾರಂಭಿಸಿ" },
  previous:           { en: "Previous",                  kn: "ಹಿಂದಿನ",                        hi: "ಹಿಂದಿನ" },
  nextStep:           { en: "Next Step",                 kn: "ಮುಂದಿನ ಹಂತ",                   hi: "ಮುಂದಿನ ಹಂತ" },
  academyRank:        { en: "Academy Rank",              kn: "ಅಕಾಡೆಮಿ ಶ್ರೇಣಿ",               hi: "ಅಕಾಡೆಮಿ ಶ್ರೇಣಿ" },
  masterMariner:      { en: "Master Mariner",            kn: "ಮಾಸ್ಟರ್ ಮ್ಯಾರಿನರ್",            hi: "ಮಾಸ್ಟರ್ ಮ್ಯಾರಿನರ್" },
  trainingHours:      { en: "Training Hours",            kn: "ತರಬೇತಿ ಅವಧಿ",                  hi: "ತರಬೇತಿ ಅವಧಿ" },
  mandatoryDrills:    { en: "Mandatory Drill Library",    kn: "ಕಡ್ಡಾಯ ತರಬೇತಿ ಸಂಗ್ರಹ",           hi: "ತರಬೇತಿ ಸಂಗ್ರಹ" },
  communication:      { en: "Communication",             kn: "ಸಂಪರ್ಕ",                        hi: "ಸಂಪರ್ಕ" },
  equipment:          { en: "Equipment",                 kn: "ಉಪಕರಣಗಳು",                     hi: "ಉಪಕರಣಗಳು" },
  drills:             { en: "Drills",                    kn: "ಅಭ್ಯಾಸ",                        hi: "ಡ್ರಿಲ್ಸ್" },
  vesselIntegrity:    { en: "Vessel Integrity",          kn: "ನೌಕೆಯ ಸುರಕ್ಷತೆ",                hi: "ನೌಕೆಯ ಸುರಕ್ಷತೆ" },
  vhfTitle:           { en: "Marine VHF Radio Mastery",    kn: "VHF ರೇಡಿಯೋ ಬಳಕೆ",             hi: "VHF ರೇಡಿಯೋ ಬಳಕೆ" },
  vhfStep1:           { en: "Tune to Emergency Channel 16",kn: "ತುರ್ತು ಚಾನೆಲ್ 16 ಗೆ ಟ್ಯೂನ್ ಮಾಡಿ",        hi: "ಚಾನೆಲ್ 16 ಗೆ ಟ್ಯೂನ್ ಮಾಡಿ" },
  vhfStep2:           { en: "Broadcast: MAYDAY, MAYDAY, MAYDAY", kn: "ಮೇಡೇ, ಮೇಡೇ ಎಂದು 3 ಬಾರಿ ಹೇಳಿ", hi: "ಮೇಡೇ ಎಂದು 3 ಬಾರಿ ಹೇಳಿ" },
  vhfStep3:           { en: "Relay exact GPS coordinates & status", kn: "ನಿಮ್ಮ GPS ಸ್ಥಳವನ್ನು ಸ್ಪಷ್ಟಪಡಿಸಿ",  hi: "GPS ಸ್ಥಳವನ್ನು ಸ್ಪಷ್ಟಪಡಿಸಿ" },

  raftTitle:          { en: "Life Raft Deployment Drill",  kn: "ಲೈಫ್ ರಾಫ್ಟ್ ಬಳಕೆ",              hi: "ಲೈಫ್ ರಾಫ್ಟ್ ಬಳಕೆ" },
  raftStep1:          { en: "Release safety pin on the canister", kn: "ರಾಫ್ಟ್ ನ ಸೇಫ್ಟಿ ಪಿನ್ ತೆಗೆಯಿರಿ",     hi: "ಸೇಫ್ಟಿ ಪಿನ್ ತೆಗೆಯಿರಿ" },
  raftStep2:          { en: "Throw canister overboard firmly", kn: "ಕ್ಯಾನಿಸ್ಟರ್ ಅನ್ನು ನೀರಿಗೆ ಎಸೆಯಿರಿ",  hi: "ನೀರಿಗೆ ಎಸೆಯಿರಿ" },
  raftStep3:          { en: "Yank painter line hard to inflate", kn: "ಗಾಳಿ ತುಂಬಲು ಹಗ್ಗವನ್ನು ಎಳೆಯಿರಿ",  hi: "ಹಗ್ಗವನ್ನು ಎಳೆಯಿರಿ" },

  mobTitle:           { en: "Man Overboard (MOB) Rescue",  kn: "ಮನುಷ್ಯ ನೀರಿನಲ್ಲಿ ಬಿದ್ದಾಗ",         hi: "ಮನುಷ್ಯ ನೀರಿನಲ್ಲಿ ಬಿದ್ದಾಗ" },
  mobStep1:           { en: "Shout 'Man Overboard!' & point constantly", kn: "'ಮನುಷ್ಯ ನೀರಿನಲ್ಲಿ' ಎಂದು ಕಿರುಚಿರಿ", hi: "ಕಿರುಚಿರಿ" },
  mobStep2:           { en: "Immediately toss life ring to victim", kn: "ಲೈಫ್ ರಿಂಗ್ ಅನ್ನು ಎಸೆಯಿರಿ",      hi: "ಲೈಫ್ ರಿಂಗ್ ಎಸೆಯಿರಿ" },
  mobStep3:           { en: "Execute Williamson Turn to retrieve", kn: "ಹಡಗನ್ನು ತಿರುಗಿಸಿ ರಕ್ಷಿಸಿ",        hi: "ಹಡಗನ್ನು ತಿರುಗಿಸಿ ರಕ್ಷಿಸಿ" },

  flareTitle:         { en: "Distress Flare Operations",   kn: "ತುರ್ತು ಫ್ಲೇರ್ ಬಳಕೆ",             hi: "ಫ್ಲೇರ್ ಬಳಕೆ" },
  flareStep1:         { en: "Twist and remove bottom strike cap", kn: "ಬಾಟಮ್ ಕ್ಯಾಪ್ ತೆಗೆಯಿರಿ",            hi: "ಕ್ಯಾಪ್ ತೆಗೆಯಿರಿ" },
  flareStep2:         { en: "Hold tightly & angle away downwind", kn: "ಗಾಳಿಯ ದಿಕ್ಕಿನಿಂದ ದೂರ ಹಿಡಿಯಿರಿ",    hi: "ಗಾಳಿಯ ದಿಕ್ಕಿನಿಂದ ದೂರ ಹಿಡಿಯಿರಿ" },
  flareStep3:         { en: "Pull striker string sharply to ignite", kn: "ಬೆಂಕಿ ಹಚ್ಚಲು ದಾರವನ್ನು ಎಳೆಯಿರಿ",     hi: "ದಾರವನ್ನು ಎಳೆಯಿರಿ" },

  // System and Map
  systemActive:       { en: "SYSTEM ACTIVE",               kn: "ವ್ಯವಸ್ಥೆ ಸಕ್ರಿಯವಾಗಿದೆ",           hi: "ಸಿಸ್ಟಮ್ ಸಕ್ರಿಯ" },
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
