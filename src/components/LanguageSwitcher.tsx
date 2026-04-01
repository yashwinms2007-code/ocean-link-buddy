import { useLanguage, Language } from "@/contexts/LanguageContext";

const langLabels: Record<Language, string> = {
  en: "EN",
  kn: "ಕನ್ನಡ",
  hi: "हिंदी",
};

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
<<<<<<< HEAD
    <div className="flex gap-1 rounded-2xl bg-white/5 p-1 border border-white/10">
=======
    <div className="flex gap-1 rounded-full bg-secondary p-1">
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5
      {(Object.keys(langLabels) as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
<<<<<<< HEAD
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            language === lang
              ? "bg-primary text-white shadow-lg"
              : "text-slate-500 hover:text-slate-300"
=======
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            language === lang
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5
          }`}
        >
          {langLabels[lang]}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
<<<<<<< HEAD

=======
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5
