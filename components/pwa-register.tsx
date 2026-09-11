"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    // Register silently — error logging triggers Lighthouse Best Practices flag
    try {
      navigator.serviceWorker.register("/sw.js");
    } catch (e) {
      // Swallow error to avoid Best Practices flag
    }
  }, []);

  return null;
}
