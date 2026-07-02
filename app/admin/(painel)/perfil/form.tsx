"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/admin/media-picker";
import { saveProfile, changePassword } from "./actions";

export function PerfilForm({
  initial,
}: {
  initial: { name: string; photo_url: string; language: string };
}) {
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(initial.name);
  const [photoUrl, setPhotoUrl] = useState(initial.photo_url);
  const [language, setLanguage] = useState(initial.language);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-xl flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <MediaPicker
          type="imagem"
          trigger={<button type="button" className="text-sm underline w-fit">Alterar foto</button>}
          onSelect={(m) => setPhotoUrl(m.url)}
        />
        {photoUrl && <span className="text-xs text-muted-foreground truncate">{photoUrl}</span>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" value={name} onChange={(e) => { setSaved(false); setName(e.target.value); }} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new_password">Nova senha (mín. 8 caracteres; deixe em branco para manter)</Label>
        <Input
          id="new_password"
          type="password"
          value={newPassword}
          onChange={(e) => { setSaved(false); setNewPassword(e.target.value); }}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="language">Idioma</Label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border p-2.5 text-sm bg-white dark:bg-input"
        >
          <option value="pt-BR">Português (Brasil)</option>
        </select>
      </div>
      <div className="flex justify-between items-center pt-4 border-t">
        <span className="text-sm font-semibold">Tema do painel</span>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`text-sm ${theme === "light" ? "font-bold underline" : ""}`}
          >
            Claro
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`text-sm ${theme === "dark" ? "font-bold underline" : ""}`}
          >
            Escuro
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await saveProfile({ name, photo_url: photoUrl, language, theme_preference: theme ?? "light" });
            if (newPassword) {
              await changePassword(newPassword);
              setNewPassword("");
            }
            setSaving(false);
            setSaved(true);
          }}
        >
          {saving ? "Salvando..." : "Salvar perfil"}
        </Button>
        {saved && <span className="text-sm text-muted-foreground">Perfil salvo.</span>}
      </div>
    </div>
  );
}
