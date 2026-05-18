import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Nuke all Service Workers and caches (old SW returned 504 on fetch failure)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((r) => r.forEach((s) => s.unregister()));
}
if ("caches" in window) {
  caches.keys().then((k) => k.forEach((n) => caches.delete(n)));
}

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
