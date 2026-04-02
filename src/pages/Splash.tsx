import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import mitraLogo from "@/assets/mitra-logo.png";
import { motion } from "framer-motion";

const Splash = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // "Make it fast" — Auto-navigates to login after 1.8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 1800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-10 text-center relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-50/50 rounded-full blur-[100px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 space-y-12"
      >
        {/* REFINED LOGO CONTAINER (WHITE/GLASS FOR TEAL VISIBILITY) */}
        <div className="w-44 h-44 bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-center mx-auto border-2 border-slate-100 p-8">
           <motion.img 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ delay: 0.3 }}
             src={mitraLogo} 
             alt="Mitra Official Logo" 
             className="w-full h-full object-contain drop-shadow-xl" 
           />
        </div>

        <div className="space-y-4">
           <motion.h1 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
             className="text-7xl font-black text-slate-950 tracking-tighter uppercase leading-none"
           >
             mitra
           </motion.h1>
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: "120px" }}
             transition={{ delay: 0.7, duration: 0.6 }}
             className="h-2.5 bg-primary mx-auto rounded-full shadow-sm" 
           />
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1.0 }}
             className="text-slate-500 text-[16px] font-black tracking-[0.5em] uppercase mt-4"
           >
             Professional Marine OS
           </motion.p>
        </div>
      </motion.div>

      {/* Progress bar to signal speed */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: "100%" }}
           transition={{ duration: 1.8, ease: "linear" }}
           className="h-full bg-primary"
         />
      </div>
    </div>
  );
};

export default Splash;
