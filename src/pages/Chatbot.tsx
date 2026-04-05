import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Mic, MicOff, VolumeX, Fish, Waves, Compass, Wind, AlertTriangle, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { fetchSatelliteData, getOceanStats } from "@/services/oceanDataService";
import { fetchMarineWeather } from "@/services/marineWeatherService";

// ── Quick Action Buttons ──────────────────────────────────────────────────────
const QUICK_ACTIONS = (t: any) => [
  { icon: Fish,          label: t("bestFishingZones"), query: "best fishing zones" },
  { icon: Waves,         label: t("seaConditions"),    query: "sea conditions today" },
  { icon: AlertTriangle, label: t("safetyTips"),       query: "safety tips for fishing" },
  { icon: Wind,          label: t("weatherUpdate"),    query: "current weather and wind" },
  { icon: Compass,       label: t("navigationHelp"),   query: "navigate safely in rough seas" },
  { icon: Phone,         label: t("emergencySteps"),   query: "maritime emergency help" },
];

// ── Rich Offline Knowledge Base ───────────────────────────────────────────────
interface KBEntry { en: string; hi: string; kn: string; keywords: string[] }

const KB: KBEntry[] = [
  {
    keywords: ["emergency","sos","danger","distress","help","mayday","sinking","ಅಪಾಯ","ತುರ್ತು","ಮೇಡೇ","आपात","खतरा","डूब","मदद","मेडे"],
    en: "🚨 EMERGENCY PROTOCOL:\n1. Press the SOS button immediately — your GPS location is transmitted.\n2. Call India Coast Guard: ☎️ 1554 (24/7).\n3. Broadcast MAYDAY on VHF Channel 16.\n4. Deploy life jackets for ALL crew.\n5. Stay with the vessel unless it is sinking.",
    hi: "🚨 आपातकालीन प्रोटोकॉल:\n1. तुरंत SOS बटन दबाएं — आपका GPS स्थान प्रेषित होता है।\n2. भारतीय तटरक्षक बल को कॉल करें: ☎️ 1554 (24/7)।\n3. VHF चैनल 16 पर मेडे प्रसारित करें।\n4. सभी चालक दल के लिए लाइफ जैकेट पहनें।\n5. जहाज के साथ तब तक रहें जब तक वह डूब न रहा हो।",
    kn: "🚨 ತುರ್ತು ಸಂದರ್ಭ:\n1. SOS ಬಟನ್ ತಕ್ಷಣ ಒತ್ತಿರಿ — GPS ಸ್ಥಳ ರವಾನೆಯಾಗುತ್ತದೆ.\n2. ಭಾರತ ಕೋಸ್ಟ್ ಗಾರ್ಡ್‌ಗೆ ಕರೆ ಮಾಡಿ: ☎️ 1554.\n3. VHF ಚಾನೆಲ್ 16 ರಲ್ಲಿ MAYDAY ಪ್ರಸಾರ ಮಾಡಿ.\n4. ಎಲ್ಲಾ ಸಿಬ್ಬಂದಿಗೆ ಲೈಫ್ ಜಾಕೆಟ್ ಧರಿಸಿ.\n5. ಹಡಗು ಮುಳುಗದ ಹೊರತು ಅದರ ಜೊತೆ ಇರಿ.",
  },
  {
    keywords: ["safety","safe","tip","precaution","equipment","jacket","life","lifejacket","ಸುರಕ್ಷ","ಜಾಕೆಟ್","ಸಲಹೆ","सुरक्षा","जैकेट","सुझाव","सावधानी"],
    en: "⛑️ SAFETY ESSENTIALS:\n• Always wear a life jacket — mandatory for all crew.\n• Carry a fully charged VHF radio on Channel 16.\n• Check weather forecast BEFORE departing.\n• Bring first-aid kit, flares, and spare fuel.\n• Inform someone on shore of your route and ETA.\n• Never go at sea alone — minimum 2 crew.",
    hi: "⛑️ सुरक्षा अनिवार्य:\n• हमेशा लाइफ जैकेट पहनें — सभी के लिए अनिवार्य।\n• पूरी तरह चार्ज VHF रेडियो चैनल 16 पर रखें।\n• निकलने से पहले मौसम की जांच करें।\n• प्राथमिक चिकित्सा किट, फ्लेयर और अतिरिक्त ईंधन साथ रखें।\n• किनारे पर किसी को अपना रास्ता और ETA बताएं।\n• अकेले कभी समुद्र में न जाएं — कम से कम 2 चालक दल।",
    kn: "⛑️ ಸುರಕ್ಷತಾ ಕ್ರಮಗಳು:\n• ಯಾವಾಗಲೂ ಲೈಫ್ ಜಾಕೆಟ್ ಧರಿಸಿ — ಎಲ್ಲರಿಗೂ ಕಡ್ಡಾಯ.\n• ಚಾರ್ಜ್ ಆದ VHF ರೇಡಿಯೋ ಚಾನೆಲ್ 16 ರಲ್ಲಿ ಇಟ್ಟುಕೊಳ್ಳಿ.\n• ಹೊರಡುವ ಮೊದಲು ಹವಾಮಾನ ಪರಿಶೀಲಿಸಿ.\n• ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ ಕಿಟ್, ಫ್ಲೇರ್ ಮತ್ತು ಹೆಚ್ಚುವರಿ ಇಂಧನ ತನ್ನಿ.\n• ತೀರದಲ್ಲಿ ಯಾರಿಗಾದರೂ ನಿಮ್ಮ ಮಾರ್ಗ ತಿಳಿಸಿ.\n• ಒಬ್ಬರೇ ಸಮುದ್ರಕ್ಕೆ ಹೋಗಬೇಡಿ — ಕನಿಷ್ಠ 2 ಮಂದಿ.",
  },
  {
    keywords: ["navigate","navigation","route","direction","gps","chart","bearing","course","steer","ಮಾರ್ಗ","ದಿಕ್ಕು","ನ್ಯಾವಿಗೇ","नेविगेशन","दिशा","रास्ता","मार्ग","जीपीएस"],
    en: "🧭 NAVIGATION GUIDANCE:\n• Use GPS and cross-reference with nautical charts.\n• Set waypoints before departing — don't navigate blind.\n• Avoid shipping lanes without AIS transponder.\n• Follow lighthouse signals and buoy markers.\n• In poor visibility: reduce speed, use radar, sound horn every 2 min.\n• Rule of thumb: seas above 2m → stay close to coast.",
    hi: "🧭 नेविगेशन मार्गदर्शन:\n• GPS का उपयोग करें और नॉटिकल चार्ट से क्रॉस-रेफरेंस करें।\n• निकलने से पहले वेपॉइंट सेट करें।\n• AIS ट्रांसपोंडर के बिना शिपिंग लेन से बचें।\n• लाइटहाउस और बुआ मार्करों का पालन करें।\n• कम दृश्यता में: गति कम करें, रडार उपयोग करें, हर 2 मिनट में हॉर्न बजाएं।\n• 2m से ऊपर लहरें → तट के करीब रहें।",
    kn: "🧭 ನೌಕಾಯಾನ ಮಾರ್ಗದರ್ಶನ:\n• GPS ಬಳಸಿ ಮತ್ತು ನಾಟಿಕಲ್ ಚಾರ್ಟ್‌ಗಳೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ.\n• ಹೊರಡುವ ಮೊದಲು ವೇಪಾಯಿಂಟ್‌ಗಳನ್ನು ಹೊಂದಿಸಿ.\n• AIS ಇಲ್ಲದೆ ಹಡಗು ಹಾದಿಗಳನ್ನು ತಪ್ಪಿಸಿ.\n• ಲೈಟ್‌ಹೌಸ್ ಸಂಕೇತಗಳನ್ನು ಅನುಸರಿಸಿ.\n• ಕಡಿಮೆ ಗೋಚರತೆ: ವೇಗ ಕಡಿಮೆ ಮಾಡಿ, ರಾಡಾರ್ ಬಳಸಿ.\n• 2m ಮೇಲಿನ ಅಲೆಗಳು → ತೀರದ ಹತ್ತಿರ ಇರಿ.",
  },
  {
    keywords: ["fish","catch","zone","pfz","best spot","fishing zone","mackerel","tuna","sardine","prawn","ಮೀನ","ಮೀನು","ವಲಯ","मछली","मछलियां","क्षेत्र","टूना","मैकेरल","झींगा"],
    en: "🐟 FISHING INTELLIGENCE:\nI'm pulling live satellite data for your area. For best results:\n• Fish during DAWN (5–7 AM) or DUSK (6–8 PM) — peak feeding hours.\n• Target Continental Shelf zones (30–200m depth).\n• Look for thermal fronts — where warm meets cold water.\n• High chlorophyll = dense plankton = high fish density.\n• Use the PFZ Finder on the Map tab for real-time hotspots!\n• Current season: Post-Monsoon → Excellent conditions for Mackerel, Seerfish & Pomfret.",
    hi: "🐟 मछली पकड़ने की जानकारी:\nमैं आपके क्षेत्र के लिए लाइव सैटेलाइट डेटा खींच रहा हूं। सर्वोत्तम परिणामों के लिए:\n• भोर (5–7 AM) या शाम (6–8 PM) में मछली पकड़ें — चरम फीडिंग घंटे।\n• कॉन्टिनेंटल शेल्फ जोन (30–200m गहराई) को लक्ष्य करें।\n• थर्मल फ्रंट देखें — जहां गर्म और ठंडा पानी मिलता है।\n• उच्च क्लोरोफिल = घना प्लैंकटन = उच्च मछली घनत्व।\n• रियल-टाइम हॉटस्पॉट के लिए Map टैब पर PFZ Finder का उपयोग करें!\n• वर्तमान मौसम: Post-Monsoon → मैकेरल, सीरफ़िश और पॉमफ्रेट के लिए उत्कृष्ट।",
    kn: "🐟 ಮೀನುಗಾರಿಕೆ ಮಾಹಿತಿ:\n• ಬೆಳಗ್ಗೆ (5–7) ಅಥವಾ ಸಂಜೆ (6–8) ಮೀನು ಹಿಡಿಯಿರಿ — ಉತ್ತಮ ಸಮಯ.\n• ಕಾಂಟಿನೆಂಟಲ್ ಶೆಲ್ಫ್ (30–200m ಆಳ) ಗುರಿ ಮಾಡಿ.\n• ಥರ್ಮಲ್ ಫ್ರಂಟ್‌ಗಳನ್ನು ಹುಡುಕಿ — ಬೆಚ್ಚನೆ ಮತ್ತು ತಂಪು ನೀರು ಸೇರುವ ಸ್ಥಳ.\n• ಹೆಚ್ಚು ಕ್ಲೋರೋಫಿಲ್ = ಹೆಚ್ಚು ಪ್ಲಾಂಕ್ಟನ್ = ಹೆಚ್ಚು ಮೀನು.\n• Map ಟ್ಯಾಬ್‌ನಲ್ಲಿ PFZ Finder ಬಳಸಿ!\n• ಪ್ರಸ್ತುತ ಋತು: Post-Monsoon → ಮ್ಯಾಕೆರೆಲ್, ಸೀರ್‌ಫಿಶ್ & ಪಾಮ್‌ಫ್ರೆಟ್‌ಗೆ ಉತ್ತಮ.",
  },
  {
    keywords: ["weather","wind","wave","storm","rain","cyclone","monsoon","cloud","forecast","ಹವಾ","ಗಾಳಿ","ಬಿರುಗಾಳಿ","ಮಳೆ","ಮೋಡ","मौसम","हवा","तूफान","बारिश","चक्रवात"],
    en: "🌊 WEATHER & SEA CONDITIONS:\nI'm fetching live data now. General safety thresholds:\n• Wave Height > 3m → DO NOT sail.\n• Wind Speed > 25 km/h → Extreme caution.\n• Wind Speed > 40 km/h → Return to port immediately.\n• Check INCOIS alerts at incois.gov.in before every trip.\n• During monsoon (Jun–Sep): Restrict to inshore fishing only.\n• Pre-cyclone signs: Sudden drop in pressure, swells from unusual directions.",
    hi: "🌊 मौसम और समुद्री स्थिति:\nमैं अभी लाइव डेटा प्राप्त कर रहा हूं। सुरक्षा सीमाएं:\n• लहर की ऊंचाई > 3m → बिल्कुल नहीं जाएं।\n• हवा की गति > 25 km/h → अत्यधिक सावधानी।\n• हवा की गति > 40 km/h → तुरंत बंदरगाह लौटें।\n• हर यात्रा से पहले incois.gov.in पर INCOIS अलर्ट जांचें।\n• मानसून (जून–सितंबर): केवल तटीय मछली पकड़ने तक सीमित रहें।",
    kn: "🌊 ಹವಾಮಾನ ಮತ್ತು ಸಮುದ್ರ ಸ್ಥಿತಿ:\n• ಅಲೆಯ ಎತ್ತರ > 3m → ಹೋಗಲೇ ಬೇಡಿ.\n• ಗಾಳಿ ವೇಗ > 25 km/h → ಎಚ್ಚರಿಕೆಯಿಂದ ಇರಿ.\n• ಗಾಳಿ ವೇಗ > 40 km/h → ತಕ್ಷಣ ಬಂದರಿಗೆ ಮರಳಿ.\n• ಪ್ರತಿ ಪ್ರಯಾಣದ ಮೊದಲು incois.gov.in ನಲ್ಲಿ INCOIS ಎಚ್ಚರಿಕೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.\n• ಮಾನ್ಸೂನ್ (ಜೂನ್–ಸೆಪ್ಟೆಂ): ತೀರದ ಮೀನುಗಾರಿಕೆಗೆ ಮಾತ್ರ ಸೀಮಿತ ಮಾಡಿ.",
  },
  {
    keywords: ["hello","hi","namaste","hey","good morning","good evening","ನಮಸ್ಕಾರ","ಹಾಯ್","नमस्ते","हेलो","सुप्रभात"],
    en: "👋 Greetings, Captain! I am MITRA — your Marine Intelligence & Safety Assistant.\n\nI can help you with:\n• 🌊 Live weather & sea conditions\n• 🐟 Best fishing zones & PFZ data\n• ⛑️ Safety tips & emergency protocols\n• 🧭 Navigation guidance\n• 📡 Coast Guard contacts\n\nWhat would you like to know today?",
    hi: "👋 नमस्ते, कप्तान! मैं MITRA हूं — आपका समुद्री खुफिया और सुरक्षा सहायक।\n\nमैं इनमें मदद कर सकता हूं:\n• 🌊 लाइव मौसम और समुद्री स्थिति\n• 🐟 सर्वोत्तम मछली पकड़ने के क्षेत्र\n• ⛑️ सुरक्षा सुझाव और आपातकालीन प्रोटोकॉल\n• 🧭 नेविगेशन मार्गदर्शन\n• 📡 तटरक्षक संपर्क\n\nआज आप क्या जानना चाहते हैं?",
    kn: "👋 ನಮಸ್ಕಾರ, ಕ್ಯಾಪ್ಟನ್! ನಾನು MITRA — ನಿಮ್ಮ ಸಮುದ್ರ ಗುಪ್ತಚರ ಮತ್ತು ಸುರಕ್ಷಾ ಸಹಾಯಕ.\n\nನಾನು ಈ ವಿಷಯಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n• 🌊 ನೇರ ಹವಾಮಾನ ಮತ್ತು ಸಮುದ್ರ ಸ್ಥಿತಿ\n• 🐟 ಉತ್ತಮ ಮೀನುಗಾರಿಕೆ ವಲಯಗಳು\n• ⛑️ ಸುರಕ್ಷತಾ ಸಲಹೆಗಳು\n• 🧭 ನ್ಯಾವಿಗೇಷನ್ ಮಾರ್ಗದರ್ಶನ\n• 📡 ಕೋಸ್ಟ್ ಗಾರ್ಡ್ ಸಂಪರ್ಕ\n\nಇಂದು ನೀವು ಏನು ತಿಳಿಯಬೇಕು?",
  },
  {
    keywords: ["coast guard","coastguard","contact","number","phone","call","rescue","help number","ಕೋಸ್ಟ್","ಫೋನ್","ಕರೆ","संपर्क","नंबर","फोन","बचाव"],
    en: "📡 EMERGENCY CONTACTS:\n• India Coast Guard: ☎️ 1554 (24/7 free)\n• National Emergency: 112\n• Fisheries Dept (Mangalore): 0824-2220230\n• MRCC Mumbai: +91-22-22617532\n• MRCC Chennai: +91-44-25364024\n\nAlways save these numbers before going to sea!",
    hi: "📡 आपातकालीन संपर्क:\n• भारतीय तटरक्षक: ☎️ 1554 (24/7 निःशुल्क)\n• राष्ट्रीय आपातकाल: 112\n• मत्स्य विभाग (मंगलुरू): 0824-2220230\n• MRCC मुंबई: +91-22-22617532\n• MRCC चेन्नई: +91-44-25364024\n\nसमुद्र में जाने से पहले हमेशा ये नंबर सहेजें!",
    kn: "📡 ತುರ್ತು ಸಂಪರ್ಕಗಳು:\n• ಭಾರತ ಕೋಸ್ಟ್ ಗಾರ್ಡ್: ☎️ 1554 (24/7 ಉಚಿತ)\n• ರಾಷ್ಟ್ರೀಯ ತುರ್ತು: 112\n• ಮೀನುಗಾರಿಕೆ ಇಲಾಖೆ (ಮಂಗಳೂರು): 0824-2220230\n• MRCC ಮುಂಬೈ: +91-22-22617532\n\nಸಮುದ್ರಕ್ಕೆ ಹೋಗುವ ಮೊದಲು ಈ ಸಂಖ್ಯೆಗಳನ್ನು ಉಳಿಸಿ!",
  },
  {
    keywords: ["market","price","sell","buy","fish price","rate","ಮಾರುಕಟ್ಟೆ","ಬೆಲೆ","ಮಾರಾಟ","ಖರೀದಿ","बाजार","कीमत","बेचना","खरीदना"],
    en: "🛒 FISH MARKET:\nFor live fish prices and listings, visit the Fish Market tab in the app.\n\nCurrent approximate rates (Mangalore region):\n• King Mackerel (Anjal): ₹250–350/kg\n• Pomfret: ₹400–600/kg\n• Prawns (Tiger): ₹300–500/kg\n• Oil Sardine: ₹40–80/kg\n• Yellowfin Tuna: ₹200–350/kg\n\nPrices vary by season and catch volume.",
    hi: "🛒 मछली बाजार:\nलाइव मछली की कीमतों और लिस्टिंग के लिए, ऐप में Fish Market टैब पर जाएं।\n\nवर्तमान अनुमानित दरें (मंगलुरू क्षेत्र):\n• किंग मैकेरल (अंजल): ₹250–350/किलो\n• पॉमफ्रेट: ₹400–600/किलो\n• झींगा (टाइगर): ₹300–500/किलो\n• ऑयल सार्डिन: ₹40–80/किलो\n• येलोफिन टूना: ₹200–350/किलो",
    kn: "🛒 ಮೀನು ಮಾರುಕಟ್ಟೆ:\nನೈಜ ಕ್ಷಣದ ಮೀನು ಬೆಲೆಗಳಿಗೆ, ಆಪ್‌ನಲ್ಲಿ Fish Market ಟ್ಯಾಬ್ ತೆರೆಯಿರಿ.\n\nಪ್ರಸ್ತುತ ಅಂದಾಜು ದರಗಳು (ಮಂಗಳೂರು):\n• ಕಿಂಗ್ ಮ್ಯಾಕೆರೆಲ್ (ಅಂಜಲ್): ₹250–350/ಕೆಜಿ\n• ಪಾಮ್‌ಫ್ರೆಟ್: ₹400–600/ಕೆಜಿ\n• ಸಿಗಡಿ (ಟೈಗರ್): ₹300–500/ಕೆಜಿ\n• ಎಣ್ಣೆ ಮೀನು: ₹40–80/ಕೆಜಿ",
  },
  {
    keywords: ["manoverboard","man overboard","mob","fell","fallen","overboard","drowning","drown","ನೀರಿಗೆ ಬಿದ್ದ","ಮುಳುಗು","पानी में गिरा","डूब रहा","डूबना"],
    en: "🛟 MAN OVERBOARD PROTOCOL:\n1. Shout 'MAN OVERBOARD!' and point continuously.\n2. Throw life ring immediately — don't wait.\n3. Assign one crew to ONLY watch the victim.\n4. Execute Williamson Turn to return to victim.\n5. Deploy ladder or rope for recovery.\n6. Call Coast Guard: 1554 if unable to recover.\n7. Begin CPR if victim is unconscious.",
    hi: "🛟 मैन ओवरबोर्ड प्रोटोकॉल:\n1. 'मैन ओवरबोर्ड!' चिल्लाएं और लगातार इशारा करें।\n2. तुरंत लाइफ रिंग फेंकें — इंतजार न करें।\n3. एक क्रू को केवल पीड़ित को देखने के लिए नियुक्त करें।\n4. पीड़ित के पास वापस आने के लिए विलियमसन टर्न करें।\n5. वापसी के लिए सीढ़ी या रस्सी तैनात करें।\n6. यदि बचाव न हो सके तो कोस्ट गार्ड को कॉल करें: 1554।",
    kn: "🛟 ನೀರಿಗೆ ಬಿದ್ದ ವ್ಯಕ್ತಿ:\n1. 'ಮ್ಯಾನ್ ಓವರ್‌ಬೋರ್ಡ್!' ಎಂದು ಕೂಗಿ ಮತ್ತು ತೋರಿಸಿ.\n2. ತಕ್ಷಣ ಲೈಫ್ ರಿಂಗ್ ಎಸೆಯಿರಿ.\n3. ಒಬ್ಬ ಸಿಬ್ಬಂದಿ ನಿಂತು ನೋಡಲಿ.\n4. ವಿಲಿಯಮ್ಸನ್ ಟರ್ನ್ ಮಾಡಿ ಮರಳಿ ಬನ್ನಿ.\n5. ಏಣಿ ಅಥವಾ ಹಗ್ಗ ಇಳಿಸಿ.\n6. ತೀರ ರಕ್ಷಿಸಲು ಆಗದಿದ್ದರೆ ಕೋಸ್ಟ್ ಗಾರ್ಡ್ 1554 ಕರೆ ಮಾಡಿ.",
  },
  {
    keywords: ["tide","tidal","high tide","low tide","tides","ಉಬ್ಬರ","ಇಳಿತ","ಉಬ್ಬರವಿಳಿತ","ज्वार","भाटा","ज्वारभाटा"],
    en: "🌊 TIDE INFORMATION:\n• Tides change approximately every 6 hours.\n• High tides: Best for entering/exiting harbors.\n• Low tides: Expose rocks — navigate carefully in shallow areas.\n• Spring tides (Full/New Moon): Higher than normal — extra caution.\n• Neap tides (Half Moon): Calmer — safer for smaller vessels.\n• Check the Weather tab for today's tide prediction.",
    hi: "🌊 ज्वार-भाटा जानकारी:\n• ज्वार लगभग हर 6 घंटे में बदलता है।\n• हाई टाइड: बंदरगाह छोड़ने/प्रवेश करने के लिए सर्वोत्तम।\n• लो टाइड: चट्टानें उजागर होती हैं — उथले क्षेत्रों में सावधानी से नेविगेट करें।\n• स्प्रिंग टाइड (पूर्णिमा/अमावस्या): सामान्य से अधिक — अतिरिक्त सावधानी।",
    kn: "🌊 ಉಬ್ಬರವಿಳಿತ ಮಾಹಿತಿ:\n• ಉಬ್ಬರವಿಳಿತ ಪ್ರತಿ 6 ಗಂಟೆಗೆ ಬದಲಾಗುತ್ತದೆ.\n• ಹೈ ಟೈಡ್: ಬಂದರು ಪ್ರವೇಶ/ನಿರ್ಗಮನಕ್ಕೆ ಸೂಕ್ತ.\n• ಲೋ ಟೈಡ್: ಬಂಡೆಗಳು ಕಾಣಿಸುತ್ತವೆ — ಎಚ್ಚರಿಕೆಯಿಂದ ಇರಿ.\n• ಹುಣ್ಣಿಮೆ/ಅಮಾವಾಸ್ಯೆ: ಸಾಮಾನ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚು ಉಬ್ಬರ — ಹೆಚ್ಚಿನ ಎಚ್ಚರಿಕೆ.",
  },
];

// ── Match KB entry by keywords ────────────────────────────────────────────────
const matchKB = (msg: string): KBEntry | null => {
  const lower = msg.toLowerCase();
  let best: KBEntry | null = null;
  let bestCount = 0;
  for (const entry of KB) {
    const count = entry.keywords.filter(k => lower.includes(k)).length;
    if (count > bestCount) { bestCount = count; best = entry; }
  }
  return bestCount > 0 ? best : null;
};

// ── Chatbot Component ─────────────────────────────────────────────────────────
const Chatbot = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [history, setHistory] = useState([{
    role: "ai",
    text: t("chatbotIntro"),
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }]);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
      window.speechSynthesis.getVoices();
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      const langMap: Record<Language, string> = { en: "en-US", hi: "hi-IN", kn: "kn-IN" };
      recognitionRef.current.lang = langMap[language];
      recognitionRef.current.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setMsg(transcript);
        setIsListening(false);
        handleSend(transcript);
      };
      recognitionRef.current.onerror = (e: any) => {
        setIsListening(false);
        if (e.error === "not-allowed") toast.error("Microphone access denied.");
        else toast.error("Voice recognition error. Try typing.");
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [language]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history, isThinking]);

  const toggleListening = () => {
    if (isListening) { recognitionRef.current?.stop(); return; }
    if (!recognitionRef.current) { toast.error("Speech recognition not supported. Please type."); return; }
    stopSpeaking();
    try {
      recognitionRef.current.start();
      setIsListening(true);
      toast.info("🎙️ Listening...");
    } catch { toast.error("Allow microphone permissions first."); }
  };

  const speak = (text: string) => {
    const voiceEnabled = localStorage.getItem("mitra_voiceGuide") !== "false";
    if (!voiceEnabled || !window.speechSynthesis) return;
    const cleaned = text.replace(/[*#🚨⛑️🧭🛟📡👋🐟🌊🛒]/gu, "");
    const utterance = new SpeechSynthesisUtterance(cleaned);
    const langMap: Record<Language, string> = { en: "en-US", hi: "hi-IN", kn: "kn-IN" };
    utterance.lang = langMap[language];
    utterance.rate = 0.95;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const best = voices.find(v => v.lang.startsWith(utterance.lang.split("-")[0])) || voices.find(v => v.lang.startsWith("en")) || voices[0];
      if (best) utterance.voice = best;
    }
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    setTimeout(() => window.speechSynthesis.speak(utterance), 50);
  };

  const stopSpeaking = () => { window.speechSynthesis?.cancel(); setIsSpeaking(false); };

  const addAIMessage = (text: string) => {
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setHistory(prev => [...prev, { role: "ai", text, timestamp: ts }]);
    setIsThinking(false);
    speak(text);
  };

  const handleSend = async (textToSend?: string) => {
    const finalMsg = (textToSend || msg).trim();
    if (!finalMsg) return;
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setHistory(prev => [...prev, { role: "user", text: finalMsg, timestamp: ts }]);
    setMsg("");
    setIsThinking(true);

    // 1. Check rich knowledge base
    const kbEntry = matchKB(finalMsg);
    if (kbEntry) {
      const reply = language === "hi" ? kbEntry.hi : language === "kn" ? kbEntry.kn : kbEntry.en;
      setTimeout(() => addAIMessage(reply), 600);
      return;
    }

    // 2. Try live API for weather/fish queries
    const tryGPS = () => new Promise<GeolocationCoordinates | null>(resolve => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(p => resolve(p.coords), () => resolve(null), { timeout: 5000 });
    });

    try {
      const coords = await tryGPS();
      const lat = coords?.latitude ?? 12.91;
      const lon = coords?.longitude ?? 74.85;

      const [{ current: marine, safety }, satResponse] = await Promise.all([
        fetchMarineWeather(lat, lon),
        fetchSatelliteData(lat, lon),
      ]);
      const satStats = getOceanStats(satResponse.points);

      const lm = finalMsg.toLowerCase();
      let responseText = "";

      if (lm.includes("fish") || lm.includes("catch") || lm.includes("zone") || lm.includes("मछली") || lm.includes("ಮೀನ")) {
        responseText = language === "kn"
          ? `🐟 ಮೀನುಗಾರಿಕೆ ಮಾಹಿತಿ:\n• ಉತ್ತಮ ಪ್ರದೇಶ: ${satStats.bestFishingZone}\n• ಸಮುದ್ರ ತಾಪಮಾನ: ${satStats.averageSST}°C\n• ಹೆಚ್ಚು ವಿಶ್ವಾಸ ವಲಯಗಳು: ${satStats.highConfidenceZones}\n• ಸ್ಥಿತಿ: ${safety.status === "SAFE" ? "✅ ಸುರಕ್ಷಿತ" : "⚠️ ಎಚ್ಚರಿಕೆ"}`
          : language === "hi"
          ? `🐟 मछली पकड़ने की जानकारी:\n• सर्वोत्तम क्षेत्र: ${satStats.bestFishingZone}\n• समुद्री तापमान: ${satStats.averageSST}°C\n• उच्च विश्वास क्षेत्र: ${satStats.highConfidenceZones}\n• स्थिति: ${safety.status === "SAFE" ? "✅ सुरक्षित" : "⚠️ सावधानी"}`
          : `🐟 LIVE FISHING INTELLIGENCE:\n• Best Zone: ${satStats.bestFishingZone}\n• Sea Surface Temp: ${satStats.averageSST}°C\n• High-Confidence Zones: ${satStats.highConfidenceZones}\n• Active Fronts: ${satStats.activeFronts}\n• Best Time: ${satStats.bestTimeToFish}\n• Status: ${safety.status === "SAFE" ? "✅ Favorable" : `⚠️ ${safety.advice}`}`;
      } else if (lm.includes("weather") || lm.includes("wind") || lm.includes("wave") || lm.includes("sea") || lm.includes("मौसम") || lm.includes("ಹವಾಮಾನ")) {
        responseText = language === "kn"
          ? `🌊 ಲೈವ್ ಸಮುದ್ರ ಸ್ಥಿತಿ:\n• ಅಲೆಯ ಎತ್ತರ: ${marine.waveHeight}m\n• ಗಾಳಿ ವೇಗ: ${marine.windSpeed} km/h\n• ಸಮುದ್ರ ತಾಪಮಾನ: ${marine.sst}°C\n• ತೇವಾಂಶ: ${marine.humidity}%\n• ಸ್ಥಿತಿ: ${safety.status === "SAFE" ? "✅ ಸುರಕ್ಷಿತ" : safety.status === "MODERATE" ? "⚠️ ಎಚ್ಚರಿಕೆ" : "🚨 ಅಪಾಯ"}`
          : language === "hi"
          ? `🌊 लाइव समुद्री स्थिति:\n• लहर की ऊंचाई: ${marine.waveHeight}m\n• हवा की गति: ${marine.windSpeed} km/h\n• समुद्री तापमान: ${marine.sst}°C\n• आर्द्रता: ${marine.humidity}%\n• स्थिति: ${safety.status === "SAFE" ? "✅ सुरक्षित" : safety.status === "MODERATE" ? "⚠️ सावधानी" : "🚨 खतरा"}`
          : `🌊 LIVE MARITIME CONDITIONS:\n• Wave Height: ${marine.waveHeight}m\n• Wind Speed: ${marine.windSpeed} km/h\n• Wind Direction: ${marine.windDirection}°\n• Sea Temp: ${marine.sst}°C\n• Humidity: ${marine.humidity}%\n• Current: ${marine.currentVelocity}m/s\n\nStatus: **${safety.status}** — ${safety.advice}`;
      } else {
        // Intelligent fallback with suggestions
        responseText = language === "kn"
          ? "🤖 ನಾನು ಈ ಕೆಳಗಿನ ವಿಷಯಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n• ಮೀನು ಹಿಡಿಯಲು ಉತ್ತಮ ವಲಯ\n• ಹವಾಮಾನ ಮತ್ತು ಸಮುದ್ರ ಸ್ಥಿತಿ\n• ಸುರಕ್ಷತಾ ಸಲಹೆ\n• ತುರ್ತು ಕ್ರಮಗಳು\n• ಕೋಸ್ಟ್ ಗಾರ್ಡ್ ಸಂಪರ್ಕ\n\nದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಕೇಳಿ!"
          : language === "hi"
          ? "🤖 मैं इन विषयों में मदद कर सकता हूं:\n• मछली पकड़ने के सर्वोत्तम क्षेत्र\n• मौसम और समुद्री स्थिति\n• सुरक्षा सुझाव\n• आपातकालीन कदम\n• तटरक्षक संपर्क\n\nकृपया दोबारा पूछें!"
          : "🤖 I specialize in:\n• Best fishing zones & PFZ data\n• Live weather & sea conditions\n• Safety tips & equipment\n• Emergency protocols & SOS\n• Coast Guard contacts\n\nTry asking: 'What's the weather like?' or 'Where are the best fishing zones?' 🎣";
      }

      addAIMessage(responseText);
    } catch {
      addAIMessage(
        language === "kn"
          ? "ಸರ್ವರ್ ಸಂಪರ್ಕ ತಪ್ಪಿದೆ. ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ ಕೋಸ್ಟ್ ಗಾರ್ಡ್‌ಗೆ 1554 ಕರೆ ಮಾಡಿ."
          : language === "hi"
          ? "सर्वर कनेक्शन विफल। आपातकाल में Coast Guard: 1554 पर कॉल करें।"
          : "Satellite data link interrupted. For emergencies, call Coast Guard: 1554."
      );
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-slate-950">
      {/* HEADER */}
      <div className="bg-slate-900 border-b border-white/10 px-6 py-5 flex items-center gap-4 relative z-20 flex-shrink-0">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-[60px] rounded-full pointer-events-none" />
        <button onClick={() => navigate(-1)} className="p-3 glass-dark rounded-2xl hover:bg-white/10 transition-all border border-white/10 text-white relative z-10">
          <ArrowLeft size={20} />
        </button>
        <div className="relative z-10">
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            MITRA <span className="text-primary font-black px-2 py-0.5 bg-primary/10 rounded-lg text-[10px] leading-none border border-primary/20">AI</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]" />
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">{t("aiOnline")}</p>
          </div>
        </div>
        {isSpeaking && (
          <button onClick={stopSpeaking} className="ml-auto p-3 bg-red-500/10 text-red-400 rounded-full border border-red-500/20 animate-pulse relative z-10">
            <VolumeX size={16} />
          </button>
        )}
      </div>

      {/* MESSAGE STREAM */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-6 pb-4 space-y-6 scroll-smooth scrollbar-hide">
        {history.map((h, i) => (
          <div key={i} className={`flex flex-col ${h.role === "ai" ? "items-start" : "items-end"} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <div className="flex items-center gap-2 mb-1.5 px-2">
              <span className="text-[7px] font-black uppercase tracking-widest text-slate-600">{h.role === "ai" ? "Mitra AI" : "You"}</span>
              <span className="text-[7px] font-bold text-slate-700">{h.timestamp}</span>
            </div>
            <div className={`max-w-[90%] px-5 py-4 rounded-[2rem] shadow-xl relative overflow-hidden ${
              h.role === "ai"
                ? "bg-slate-800 border border-white/10 text-slate-100 rounded-tl-none"
                : "bg-primary text-slate-900 rounded-tr-none font-black"
            }`}>
              {h.role === "ai" && <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />}
              <p className="text-sm leading-relaxed relative z-10 whitespace-pre-wrap">{h.text}</p>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 px-5 py-3.5 bg-white/5 rounded-full border border-white/5 w-fit animate-pulse">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("aiThinking")}</span>
          </div>
        )}

        {history.length <= 1 && (
          <div className="grid grid-cols-2 gap-3 pt-4">
            {QUICK_ACTIONS(t).map((action) => (
              <button
                key={action.query}
                onClick={() => handleSend(action.query)}
                className="flex items-center gap-3 p-4 glass-dark rounded-2xl border border-white/10 hover:border-primary/40 hover:bg-white/5 transition-all text-left group active:scale-95"
              >
                <div className="p-2 bg-primary/10 rounded-xl flex-shrink-0">
                  <action.icon size={14} className="text-primary" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider group-hover:text-white transition-colors">{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* INPUT BAR */}
      <div className="flex-shrink-0 px-4 py-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
        <div className="flex items-center gap-3 bg-slate-800 rounded-[3rem] border border-white/10 px-4 py-2 shadow-2xl max-w-2xl ml-auto">
          <input
            ref={inputRef}
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder={isListening ? t("syncing") : t("askMitra")}
            className="flex-1 bg-transparent text-white placeholder:text-slate-600 font-medium text-sm outline-none min-w-0 px-2"
          />
          <button
            onClick={toggleListening}
            className={`p-3 rounded-full transition-all flex-shrink-0 ${
              isListening
                ? "bg-red-500 text-white scale-110 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                : "bg-white/5 text-slate-400 hover:text-primary hover:bg-white/10"
            }`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button
            onClick={() => handleSend()}
            disabled={!msg.trim()}
            className={`p-3 rounded-full transition-all flex-shrink-0 ${
              msg.trim()
                ? "bg-primary text-slate-950 shadow-lg shadow-primary/30 hover:scale-105 active:scale-95"
                : "bg-white/5 text-slate-700 cursor-not-allowed"
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
