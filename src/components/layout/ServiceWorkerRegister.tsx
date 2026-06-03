"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Only register in production builds — dev HMR + SW caching fight.
    if (process.env.NODE_ENV !== "production") return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((err) => {
        // Non-fatal: SW failure just means no install-to-home-screen.
        console.warn("SW registration failed:", err);
      });
  }, []);

  return null;
}
