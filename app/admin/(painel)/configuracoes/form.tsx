"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { saveSettings, saveTheme } from "./actions";
import { metaDescriptionLength } from "./settings-utils";
import { MediaPicker } from "@/components/admin/media-picker";
import { HEX, type ThemeRow } from "@/lib/content/theme";

const THEME_FIELDS: { key: keyof ThemeRow; label: string }[] = [
  { key: "primary_color", label: "Cor primária (header, fundos escuros)" },
  { key: "secondary_color", label: "Cor secundária (dourado, destaques)" },
  { key: "accent_color", label: "Cor de destaque (botões de ação)" },
  { key: "background_color", label: "Cor de fundo" },
  { key: "text_primary_color", label: "Texto principal" },
  { key: "text_secondary_color", label: "Texto secundário" },
];

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const valid = HEX.test(value);
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2.5">
        <input
          type="color"
          value={valid ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 shrink-0 rounded-md border border-input p-0.5"
          aria-label={`${label} (seletor)`}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!valid}
          className="max-w-40"
        />
      </div>
      {!valid && <span className="text-xs text-destructive">Hex inválido (ex.: #1B2D6B)</span>}
    </div>
  );
}

export function SettingsForm({
  initial,
  initialTheme,
}: {
  initial: Record<string, string | null>;
  initialTheme: ThemeRow;
}) {
  const [values, setValues] = useState(initial);
  const [theme, setTheme] = useState(initialTheme);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [themeError, setThemeError] = useState<string | null>(null);

  function set(key: string, value: string) {
    setSaved(false);
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function setColor(key: keyof ThemeRow, value: string) {
    setSaved(false);
    setTheme((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    const invalid = THEME_FIELDS.find(({ key }) => !HEX.test(theme[key] ?? ""));
    if (invalid) {
      setThemeError(`Corrija a cor "${invalid.label}" antes de salvar.`);
      return;
    }
    setThemeError(null);
    setSaving(true);
    await Promise.all([
      saveSettings(Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v ?? ""]))),
      saveTheme(theme),
    ]);
    setSaving(false);
    setSaved(true);
  }

  const metaDesc = metaDescriptionLength(values.seo_meta_description ?? "");

  return (
    <Tabs defaultValue="geral">
      <TabsList className="max-w-full overflow-x-auto">
        <TabsTrigger value="geral">Geral</TabsTrigger>
        <TabsTrigger value="aparencia">Aparência</TabsTrigger>
        <TabsTrigger value="contato">Contato</TabsTrigger>
        <TabsTrigger value="redes">Redes Sociais</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
      </TabsList>

      <TabsContent value="geral" className="flex flex-col gap-4 max-w-2xl pt-4">
        <Input placeholder="Nome do portal" value={values.site_name ?? ""} onChange={(e) => set("site_name", e.target.value)} />
        <Input placeholder="Descrição curta" value={values.short_description ?? ""} onChange={(e) => set("short_description", e.target.value)} />
        <MediaPicker
          type="imagem"
          trigger={<button type="button" className="text-sm underline w-fit">Selecionar logo</button>}
          onSelect={(m) => set("logo_url", m.url)}
        />
        <MediaPicker
          type="imagem"
          trigger={<button type="button" className="text-sm underline w-fit">Selecionar favicon</button>}
          onSelect={(m) => set("favicon_url", m.url)}
        />
        <Input placeholder="Texto — Política de Privacidade" value={values.footer_privacy_text ?? ""} onChange={(e) => set("footer_privacy_text", e.target.value)} />
        <Input placeholder="Texto — Termos de Uso" value={values.footer_terms_text ?? ""} onChange={(e) => set("footer_terms_text", e.target.value)} />
      </TabsContent>

      <TabsContent value="aparencia" className="flex flex-col gap-4 max-w-2xl pt-4">
        <p className="text-sm text-muted-foreground">
          Cores usadas em todo o portal público. Alterações aparecem no site assim que salvas.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          {THEME_FIELDS.map(({ key, label }) => (
            <ColorField
              key={key}
              label={label}
              value={theme[key] ?? ""}
              onChange={(v) => setColor(key, v)}
            />
          ))}
        </div>
        {themeError && (
          <p className="text-sm text-destructive" role="alert">
            {themeError}
          </p>
        )}
      </TabsContent>

      <TabsContent value="contato" className="flex flex-col gap-4 max-w-2xl pt-4">
        <Input placeholder="E-mail" value={values.contact_email ?? ""} onChange={(e) => set("contact_email", e.target.value)} />
        <Input placeholder="Telefone" value={values.contact_phone ?? ""} onChange={(e) => set("contact_phone", e.target.value)} />
        <Input placeholder="Endereço" value={values.address ?? ""} onChange={(e) => set("address", e.target.value)} />
        <Input placeholder="URL do mapa incorporado" value={values.map_embed_url ?? ""} onChange={(e) => set("map_embed_url", e.target.value)} />
      </TabsContent>

      <TabsContent value="redes" className="flex flex-col gap-4 max-w-2xl pt-4">
        <Input placeholder="Instagram" value={values.instagram_url ?? ""} onChange={(e) => set("instagram_url", e.target.value)} />
        <Input placeholder="Facebook" value={values.facebook_url ?? ""} onChange={(e) => set("facebook_url", e.target.value)} />
        <Input placeholder="WhatsApp" value={values.whatsapp_url ?? ""} onChange={(e) => set("whatsapp_url", e.target.value)} />
      </TabsContent>

      <TabsContent value="seo" className="flex flex-col gap-4 max-w-2xl pt-4">
        <Input placeholder="Meta Title" value={values.seo_meta_title ?? ""} onChange={(e) => set("seo_meta_title", e.target.value)} />
        <Input placeholder="Meta Description" value={values.seo_meta_description ?? ""} onChange={(e) => set("seo_meta_description", e.target.value)} />
        <span className="text-xs text-muted-foreground">
          {metaDesc.count}/{metaDesc.max} caracteres
        </span>
        <MediaPicker
          type="imagem"
          trigger={<button type="button" className="text-sm underline w-fit">Selecionar imagem Open Graph (1200×630px)</button>}
          onSelect={(m) => set("seo_og_image_url", m.url)}
        />
      </TabsContent>

      <div className="flex items-center gap-3 mt-6">
        <Button onClick={save} disabled={saving}>
          {saving ? "Salvando..." : "Salvar configurações"}
        </Button>
        {saved && <span className="text-sm text-muted-foreground">Configurações salvas.</span>}
      </div>
    </Tabs>
  );
}
