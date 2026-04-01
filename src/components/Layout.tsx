import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-primary selection:text-white">
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="pb-28"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
};

export default Layout;

