"use client";

import { useState } from "react";
import Script from "next/script";
import { sendContact } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// O widget do Turnstile (renderização implícita) preenche um input oculto
// name="cf-turnstile-response" dentro do form.
export function ContactForm({ siteKey, enabled }: { siteKey: string | null; enabled: boolean }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!enabled) {
    return (
      <div className="border-2 border-dashed p-8 text-center text-sm text-foreground/60">
        O formulário de contato estará disponível em breve. Enquanto isso, use os canais ao lado.
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div className="border p-8 text-center flex flex-col gap-2 bg-white">
        <span className="text-2xl" aria-hidden>✅</span>
        <p className="font-display text-xl text-primary">Mensagem enviada!</p>
        <p className="text-sm text-foreground/70">Obrigado pelo contato — retornaremos em breve.</p>
      </div>
    );
  }

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/api.js" async defer />
      <form
        className="flex flex-col gap-4"
        action={async (formData) => {
          setStatus("sending");
          setError(null);
          const result = await sendContact({
            name: String(formData.get("name") ?? ""),
            email: String(formData.get("email") ?? ""),
            phone: String(formData.get("phone") ?? "") || undefined,
            subject: String(formData.get("subject") ?? ""),
            message: String(formData.get("message") ?? ""),
            honeypot: String(formData.get("website") ?? ""),
            turnstileToken: String(formData.get("cf-turnstile-response") ?? ""),
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
        {siteKey && <div className="cf-turnstile" data-sitekey={siteKey} />}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={status === "sending"}
          className="px-8 py-4 text-sm font-bold text-white w-full sm:w-fit disabled:opacity-60"
          style={{ backgroundColor: "var(--rose, #E8327C)" }}
        >
          {status === "sending" ? "Enviando..." : "Enviar mensagem →"}
        </button>
      </form>
    </>
  );
}
