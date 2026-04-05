import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

interface LowPowerContextType {
  isLowPowerMode: boolean;
  manualToggle: () => void;
}

const LowPowerContext = createContext<LowPowerContextType>({
  isLowPowerMode: false,
  manualToggle: () => {},
});

export const LowPowerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);
  const [isManualOverride, setIsManualOverride] = useState(false);

  useEffect(() => {
    let battery: any = null;

    const updateBattery = () => {
      if (!battery) return;
      if (!isManualOverride) {
        if (battery.level <= 0.15 && !battery.charging) {
          setIsLowPowerMode(true);
          toast.error("Battery critical. Emergency Low Power Mode active.");
        } else {
          setIsLowPowerMode(false);
        }
      }
    };

    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((b: any) => {
        battery = b;
        updateBattery();
        battery.addEventListener("levelchange", updateBattery);
        battery.addEventListener("chargingchange", updateBattery);
      });
    }

    return () => {
      if (battery) {
        battery.removeEventListener("levelchange", updateBattery);
        battery.removeEventListener("chargingchange", updateBattery);
      }
    };
  }, [isManualOverride]);

  const manualToggle = () => {
    setIsManualOverride(true);
    setIsLowPowerMode(!isLowPowerMode);
    toast.info(!isLowPowerMode ? "Emergency Low Power Mode MANUALLY engaged." : "Restoring normal operation mode.");
  };

  return (
    <LowPowerContext.Provider value={{ isLowPowerMode, manualToggle }}>
      {/* ── HIGH CONTRAST INJECTION CSS ── */}
      {isLowPowerMode && (
        <style dangerouslySetInnerHTML={{
          __html: `
            body, #root {
               background-color: #000000 !important;
               background-image: none !important;
            }
            .super-glass {
               background: #111111 !important;
               border-color: #333333 !important;
               backdrop-filter: none !important;
               box-shadow: none !important;
            }
            * {
               text-shadow: none !important;
               box-shadow: none !important;
               filter: none !important;
               transition: none !important;
               animation: none !important;
            }
            button { transform: none !important; }
          `
        }} />
      )}
      <div className={isLowPowerMode ? "low-power-active" : ""}>
        {children}
      </div>
    </LowPowerContext.Provider>
  );
};

export const useLowPower = () => useContext(LowPowerContext);
