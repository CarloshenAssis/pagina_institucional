"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { sendContact } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Renderização EXPLÍCITA do Turnstile (o modo implícito não renderiza de forma
// confiável com o <Script> do Next). Carregamos api.js com ?onload=&render=explicit,
// e no callback chamamos turnstile.render() apontando para um ref. O token chega
// pelo callback `callback`; sem ele o servidor rejeita ("Dados inválidos").
declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: (code?: string) => void;
          "expired-callback"?: () => void;
        }
      ) => string;
      reset: (id?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

export function ContactForm({ siteKey, enabled }: { siteKey: string | null; enabled: boolean }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !siteKey) return;

    function renderWidget() {
      if (renderedRef.current || !window.turnstile || !widgetRef.current) return;
      renderedRef.current = true;
      window.turnstile.render(widgetRef.current, {
        sitekey: siteKey!,
        callback: (t) => {
          setToken(t);
          setError(null);
          setStatus("idle");
        },
        "error-callback": (code) => {
          setToken(null);
          setStatus("error");
          setError(
            `A verificação de segurança falhou${code ? ` (código ${code})` : ""}. ` +
              `Confirme que o domínio deste site está autorizado no widget Turnstile e recarregue a página.`
          );
        },
        "expired-callback": () => setToken(null),
      });
    }

    window.onloadTurnstileCallback = renderWidget;
    // Se o script já carregou (ex.: navegação client-side), renderiza agora.
    if (window.turnstile) renderWidget();

    return () => {
      delete window.onloadTurnstileCallback;
    };
  }, [enabled, siteKey]);

  if (!enabled) {
    return (
      <div className="border-2 border-dashed p-8 text-center text-sm text-foreground/60">
        O formulário de contato estará disponível em breve. Enquanto isso, use os canais ao lado.
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div className="border p-8 text-center flex flex-col gap-2 bg-card">
        <span className="text-2xl" aria-hidden>✅</span>
        <p className="font-display text-xl text-primary">Mensagem enviada!</p>
        <p className="text-sm text-foreground/70">Obrigado pelo contato — retornaremos em breve.</p>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit"
        strategy="afterInteractive"
      />
      <form
        className="flex flex-col gap-4"
        action={async (formData) => {
          if (!token) {
            setStatus("error");
            setError("Aguarde a verificação de segurança concluir e tente novamente.");
            return;
          }
          setStatus("sending");
          setError(null);
          const result = await sendContact({
            name: String(formData.get("name") ?? ""),
            email: String(formData.get("email") ?? ""),
            phone: String(formData.get("phone") ?? "") || undefined,
            subject: String(formData.get("subject") ?? ""),
            message: String(formData.get("message") ?? ""),
            honeypot: String(formData.get("website") ?? ""),
            turnstileToken: token,
          });
          if (result.error) {
            setStatus("error");
            setError(result.error);
          } else {
            setStatus("sent");
          }
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Telefone (opcional)</Label>
            <Input id="phone" name="phone" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subject">Assunto</Label>
            <Input id="subject" name="subject" required />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="message">Mensagem</Label>
          <Textarea id="message" name="message" rows={6} required />
        </div>
        {/* honeypot: invisível para humanos; bots preenchem tudo */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />
        <div ref={widgetRef} className="min-h-[65px]" />
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={status === "sending" || !token}
          className="px-8 py-4 text-sm font-bold text-white w-full sm:w-fit disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--rose, #E8327C)" }}
        >
          {status === "sending"
            ? "Enviando..."
            : token
              ? "Enviar mensagem →"
              : "Verificando segurança..."}
        </button>
      </form>
    </>
  );
}
