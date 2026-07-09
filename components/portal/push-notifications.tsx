"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { subscribeToPush } from "@/app/push-actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type Status = "checking" | "available" | "subscribing" | "subscribed" | "denied" | "unsupported";

// Botão flutuante de opt-in para "notificações de atualizações exclusivas".
// Não renderiza nada se as chaves VAPID não estiverem configuradas ou se o
// navegador não suportar Push API (mesmo padrão de degradação do Turnstile).
export function PushNotifications({ vapidPublicKey }: { vapidPublicKey: string | null }) {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (!vapidPublicKey || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        if (!cancelled) setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setStatus("denied");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!cancelled) setStatus(sub ? "subscribed" : "available");
      } catch {
        if (!cancelled) setStatus("available");
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [vapidPublicKey]);

  async function subscribe() {
    if (!vapidPublicKey) return;
    setStatus("subscribing");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      const { error } = await subscribeToPush(sub.toJSON());
      if (error) throw new Error(error);
      setStatus("subscribed");
    } catch {
      setStatus(Notification.permission === "denied" ? "denied" : "available");
    }
  }

  if (status === "unsupported" || status === "checking") return null;

  const label =
    status === "subscribed"
      ? "Notificações de atualizações exclusivas ativas"
      : status === "denied"
        ? "Notificações bloqueadas nas configurações do navegador"
        : "Ativar notificações de atualizações exclusivas";

  return (
    <button
      type="button"
      onClick={status === "available" ? subscribe : undefined}
      disabled={status !== "available"}
      aria-label={label}
      title={label}
      className="fixed bottom-5 left-5 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-80 motion-reduce:transition-none"
    >
      {status === "denied" ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
    </button>
  );
}
