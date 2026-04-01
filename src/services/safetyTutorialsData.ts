export interface TutorialModule {
  id: string;
  category: "PREPARATION" | "EMERGENCY" | "NAVIGATION";
  lottieUrl: string;
  en: { title: string; desc: string };
  kn: { title: string; desc: string };
  hi: { title: string; desc: string };
}

export const SAFETY_TUTORIALS: TutorialModule[] = [
  {
    id: "lifejacket",
    category: "PREPARATION",
    lottieUrl: "https://lottie.host/7e008b89-219e-4e6c-a8e5-33e5c9a1758f/mC3p6H0pWb.json", // Wear Life Jacket
    en: {
      title: "Wear Life Jacket",
      desc: "Always wear a certified life jacket before the vessel leaves the port. It is your primary survival tool."
    },
    kn: {
      title: "ಲೈಫ್ ಜಾಕೆಟ್ ಧರಿಸಿ",
      desc: "ದೋಣಿ ಬಂದರು ಬಿಡುವ ಮೊದಲು ಯಾವಾಗಲೂ ಲೈಫ್ ಜಾಕೆಟ್ ಧರಿಸಿ. ಇದು ನಿಮ್ಮ ಜೀವ ಉಳಿಸುವ ಮುಖ್ಯ ಸಾಧನ."
    },
    hi: {
      title: "लाइफ जैकेट पहनें",
      desc: "समुद्र में जाने से पहले हमेशा लाइफ जैकेट पहनें। यह आपकी सुरक्षा के लिए बहुत महत्वपूर्ण है।"
    }
  },
  {
    id: "waves",
    category: "EMERGENCY",
    lottieUrl: "https://lottie.host/0209c154-8c8c-4a3e-8692-0b70c8e036f4/7oJvQZfH8I.json", // High Waves
    en: {
      title: "Storm & High Waves",
      desc: "When waves exceed 2.5m, rotate the vessel to face waves at 45 degrees. Do not take waves broadside."
    },
    kn: {
      title: "ಹೆಚ್ಚಿನ ಅಲೆಗಳು ಮತ್ತು ಬಿರುಗಾಳಿ",
      desc: "ಅಲೆಗಳು 2.5 ಮೀಟರ್ ಮೀರಿದಾಗ, ದೋಣಿಯ ಮುಂಭಾಗವನ್ನು ಅಲೆಗಳಿಗೆ 45 ಡಿಗ್ರಿ ಕೋನದಲ್ಲಿ ಇರಿಸಿ."
    },
    hi: {
      title: "ऊंची लहरें और तूफान",
      desc: "जब लहरें 2.5 मीटर से अधिक हों, तो नाव को लहरों के सामने 45 डिग्री के कोण पर रखें।"
    }
  },
  {
    id: "sos",
    category: "EMERGENCY",
    lottieUrl: "https://lottie.host/ff57f864-4688-4623-a5c8-10363259b3a0/0YxH2pG3vH.json", // SOS Alert
    en: {
      title: "Using SOS Rescue Link",
      desc: "In distress, activate SOS. Your location is sent via Mesh nodes and SMS fallback even without internet."
    },
    kn: {
      title: "SOS ತುರ್ತು ಸೇವೆ ಬಳಸುವುದು",
      desc: "ತೊಂದರೆಯಲ್ಲಿದ್ದಾಗ SOS ಒತ್ತಿರಿ. ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದಿದ್ದರೂ ನಿಮ್ಮ ಸ್ಥಳವು ಮೆಶ್ ಮತ್ತು SMS ಮೂಲಕ ತಲುಪುತ್ತದೆ."
    },
    hi: {
      title: "SOS आपातकालीन सेवा",
      desc: "संकट के समय SOS दबाएं। इंटरनेट के बिना भी आपकी लोकेशन मेश और SMS के जरिए भेज दी जाएगी।"
    }
  },
  {
    id: "nav",
    category: "NAVIGATION",
    lottieUrl: "https://lottie.host/6e001851-9f20-4f51-912f-6119f180735d/Y9q7vH6o3P.json", // Navigation/Compass
    en: {
      title: "Dead Reckoning Safety",
      desc: "If GPS fails, use the Dead Reckoning tool to estimate your path based on speed and heading."
    },
    kn: {
      title: "ಜಿಪಿಎಸ್ ಇಲ್ಲದಿದ್ದಾಗ ದಾರಿ ಪತ್ತೆ",
      desc: "ಜಿಪಿಎಸ್ ಕೆಲಸ ಮಾಡದಿದ್ದರೆ, ಡೆಡ್ ರೆಕನಿಂಗ್ ಬಳಸಿ ನಿಮ್ಮ ವೇಗ ಮತ್ತು ದಿಕ್ಕಿನ ಆಧಾರದ ಮೇಲೆ ದಾರಿ ತಿಳಿಯಿರಿ."
    },
    hi: {
      title: "जीपीएस के बिना दिशा",
      desc: "यदि जीपीएस काम नहीं करता है, तो अपनी गति और दिशा के आधार पर रास्ते का अनुमान लगाने के लिए ಡೆಡ್ ರೆಕನಿಂಗ್ का उपयोग करें।"
    }
  }
];
