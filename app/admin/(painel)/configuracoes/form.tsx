"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveSettings } from "./actions";
import { metaDescriptionLength } from "./settings-utils";
import { MediaPicker } from "@/components/admin/media-picker";

export function SettingsForm({ initial }: { initial: Record<string, string | null> }) {
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(key: string, value: string) {
    setSaved(false);
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    await saveSettings(
      Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v ?? ""]))
    );
    setSaving(false);
    setSaved(true);
  }

  const metaDesc = metaDescriptionLength(values.seo_meta_description ?? "");

  return (
    <Tabs defaultValue="geral">
      <TabsList>
        <TabsTrigger value="geral">Geral</TabsTrigger>
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
