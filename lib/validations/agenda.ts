import { z } from "zod";

export const eventoSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  description: z.string().optional(),
  date: z.string().min(1, "Data obrigatória"),
  location: z.string().optional(),
  external_url: z.string().url().optional().or(z.literal("")),
  map_embed_url: z.string().url().optional().or(z.literal("")),
  image_url: z.string().url().optional().or(z.literal("")),
});

export type EventoInput = z.infer<typeof eventoSchema>;
