import { useLanguage, Language } from "@/contexts/LanguageContext";

const langLabels: Record<Language, string> = {
  en: "EN",
  kn: "ಕನ್ನಡ",
  hi: "हिंदी",
};

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-1 rounded-full bg-secondary p-1">
      {(Object.keys(langLabels) as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            language === lang
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {langLabels[lang]}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
