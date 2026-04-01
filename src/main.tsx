import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
<<<<<<< HEAD

// Register Offline Service Worker (PWA Core)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(
      (registration) => {
        console.log("ServiceWorker registration successful with scope: ", registration.scope);
      },
      (err) => {
        console.log("ServiceWorker registration failed: ", err);
      }
    );
  });
}
=======
>>>>>>> 787debecd21f798eb73c617c68c700a69263cbb5
