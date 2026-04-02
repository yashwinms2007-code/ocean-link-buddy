import { MessageSquare, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const FloatingAIBtn = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  // Don't show the button if we are already in the Chatbot
  if (location.pathname === "/chatbot") return null;

  return (
    <div className="fixed bottom-32 right-6 z-[6000] pointer-events-none">
      <div className="relative flex flex-col items-end gap-3 pointer-events-auto">
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              className="super-glass px-6 py-3 rounded-2xl border border-primary/20 shadow-2xl mb-2"
            >
              <p className="text-[11px] font-black text-primary uppercase tracking-widest whitespace-nowrap">
                {t("aiAssistant")} • {t("chatbot")}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.15, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => navigate("/chatbot")}
          className="w-20 h-20 bg-primary text-white rounded-[2rem] flex items-center justify-center shadow-[0_15px_40px_rgba(14,165,233,0.4)] relative border-4 border-white overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <MessageSquare size={32} strokeWidth={2.5} className="z-10" />
          <div className="absolute top-2 right-2 z-10 w-3 h-3 bg-white rounded-full flex items-center justify-center animate-pulse">
             <Sparkles size={8} className="text-primary" />
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default FloatingAIBtn;
