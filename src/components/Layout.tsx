import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import TopHeader from "./TopHeader";
import FloatingAIBtn from "./FloatingAIBtn";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const noNavPaths = ["/", "/login", "/register", "/sos"];
  const shouldHideNav = noNavPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-primary/10 selection:text-primary overflow-x-hidden">
      {!shouldHideNav && <TopHeader />}
      
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={shouldHideNav ? "h-full" : "pt-32 pb-40"}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      
      {!shouldHideNav && <FloatingAIBtn />}
      {!shouldHideNav && <BottomNav />}
    </div>
  );
};

export default Layout;
