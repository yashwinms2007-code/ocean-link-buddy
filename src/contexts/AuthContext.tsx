import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getLocalSession, clearLocalSession } from "@/services/localDb";

// Defining lightweight local user/session objects instead of Supabase types
export interface LocalUser {
  id: string;
  email: string;
  full_name?: string;
}

export interface LocalSession {
  user: LocalUser | null;
}

interface AuthContextType {
  session: LocalSession | null;
  user: LocalUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<LocalSession | null>(null);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthChange = () => {
      const localUser = getLocalSession();
      if (localUser) {
        setUser(localUser);
        setSession({ user: localUser });
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    };

    handleAuthChange();
    
    // Listen for cross-tab login/logout events
    window.addEventListener("storage", handleAuthChange);
    // Custom event for same-tab login
    window.addEventListener("mitra-auth-change", handleAuthChange);
    
    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("mitra-auth-change", handleAuthChange);
    };
  }, []);

  const signOut = async () => {
    clearLocalSession();
    window.dispatchEvent(new Event("mitra-auth-change"));
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

