"use client";

import { useActionState } from "react";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form
      action={formAction}
      className="w-full max-w-sm bg-card p-10 flex flex-col gap-5 rounded-lg"
    >
      <span className="text-xs font-bold uppercase tracking-wide text-gold">
        Painel administrativo
      </span>
      <h1 className="font-display text-2xl">Entrar</h1>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Entrando..." : "Entrar no painel →"}
      </Button>
    </form>
  );
}
