import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);


// Service Worker Disabled to clear legacy caching
console.log("ServiceWorker Registration Disabled for Mitra V2 Redesign Sync.");
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}
