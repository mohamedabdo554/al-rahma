import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary";

// Version check — just persist version, no destructive operations
if (localStorage.getItem("vet_version") !== "3") {
  localStorage.setItem("vet_version", "3");
}
// Clear stale fresh-start flag (was set by old destructive wipe)
localStorage.removeItem("vet_fresh_start");

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
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
    </StrictMode>
  );
}
