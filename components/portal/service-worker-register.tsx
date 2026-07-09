"use client";

import { useEffect } from "react";

// Registra o service worker para permitir instalar o site como app (PWA)
// e receber notificações push. Não faz nada visível — sem UI própria.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
