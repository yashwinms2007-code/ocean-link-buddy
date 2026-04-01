import { useLanguage, Language } from "@/contexts/LanguageContext";

const langLabels: Record<Language, string> = {
  en: "EN",
  kn: "ಕನ್ನಡ",
  hi: "हिंदी",
};

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-1 rounded-2xl bg-white/5 p-1 border border-white/10">
      {(Object.keys(langLabels) as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            language === lang
              ? "bg-primary text-white shadow-lg"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {langLabels[lang]}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
