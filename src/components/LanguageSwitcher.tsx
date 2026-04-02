import { useLanguage, Language } from "@/contexts/LanguageContext";

const langLabels: Record<Language, string> = {
  en: "EN",
  kn: "ಕನ್ನಡ",
  hi: "हिंदी",
};

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-1.5 rounded-full bg-slate-100 p-1 border border-slate-200">
      {(Object.keys(langLabels) as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`px-5 py-2 rounded-full text-[10px] font-black transition-all ${
            language === lang
              ? "bg-slate-900 text-white shadow-lg scale-105"
              : "text-slate-400 hover:text-slate-900 hover:bg-white"
          }`}
        >
          {langLabels[lang]}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
