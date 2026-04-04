import { useState, useEffect } from "react";

// Extend Window interface for the experimental beforeinstallprompt event
declare global {
  interface Window {
    deferredPWAInstallPrompt: any;
    isPWAInstalled: boolean;
  }
}

export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const [installed, setInstalled] = useState<boolean>(false);

  useEffect(() => {
    const handleReady = () => {
      setCanInstall(!!window.deferredPWAInstallPrompt);
      setInstalled(
        window.isPWAInstalled || 
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true // iOS Safari
      );
    };

    window.addEventListener("pwa-prompt-ready", handleReady);
    // Double check on mount
    handleReady();

    return () => {
      window.removeEventListener("pwa-prompt-ready", handleReady);
    };
  }, []);

  const promptInstall = async () => {
    if (!window.deferredPWAInstallPrompt) return false;

    try {
      // Show the install prompt
      await window.deferredPWAInstallPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await window.deferredPWAInstallPrompt.userChoice;
      
      // We've used the prompt, and can't use it again, throw it away
      window.deferredPWAInstallPrompt = null;
      setCanInstall(false);

      return outcome === 'accepted';
    } catch (err) {
      console.warn("PWA install prompt failed", err);
      return false;
    }
  };

  return { canInstall, installed, promptInstall };
}

