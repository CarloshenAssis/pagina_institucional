"use client";

import { useForm } from "react-hook-form";
import { saveHero } from "./actions";
import { ImageField } from "@/components/admin/image-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type HeroInput = Parameters<typeof saveHero>[0];

// O plano define a action saveHero mas não desenha a UI do hero;
// este form simples cobre os 8 campos da tabela home_config.
export function HeroForm({ initial }: { initial: Partial<HeroInput> }) {
  const { register, handleSubmit, setValue, watch, formState } = useForm<HeroInput>({
    defaultValues: {
      hero_photo_url: initial.hero_photo_url ?? "",
      hero_title: initial.hero_title ?? "",
      hero_subtitle: initial.hero_subtitle ?? "",
      hero_slogan: initial.hero_slogan ?? "",
      hero_btn1_text: initial.hero_btn1_text ?? "",
      hero_btn1_url: initial.hero_btn1_url ?? "",
      hero_btn2_text: initial.hero_btn2_text ?? "",
      hero_btn2_url: initial.hero_btn2_url ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (data) => saveHero(data))}
      className="max-w-3xl flex flex-col gap-4 bg-card border p-6"
    >
      <span className="text-xs font-bold uppercase text-muted-foreground">Hero (banner principal)</span>
      <ImageField
        label="Foto do hero (retrato)"
        hint="1000×1250px, retrato (proporção 4:5)"
        url={watch("hero_photo_url") ?? ""}
        onSelect={(url) => setValue("hero_photo_url", url)}
        onClear={() => setValue("hero_photo_url", "")}
      />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="hero_title">Título</Label>
        <Input id="hero_title" {...register("hero_title")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="hero_subtitle">Subtítulo</Label>
        <Input id="hero_subtitle" {...register("hero_subtitle")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="hero_slogan">Slogan</Label>
        <Input id="hero_slogan" {...register("hero_slogan")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hero_btn1_text">Botão 1 — texto</Label>
          <Input id="hero_btn1_text" {...register("hero_btn1_text")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hero_btn1_url">Botão 1 — URL</Label>
          <Input id="hero_btn1_url" {...register("hero_btn1_url")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hero_btn2_text">Botão 2 — texto</Label>
          <Input id="hero_btn2_text" {...register("hero_btn2_text")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hero_btn2_url">Botão 2 — URL</Label>
          <Input id="hero_btn2_url" {...register("hero_btn2_url")} />
        </div>
      </div>
      <Button type="submit" className="w-fit" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? "Salvando..." : "Salvar hero"}
      </Button>
    </form>
  );
}
