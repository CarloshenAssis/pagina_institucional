import { z } from "zod";

export const trajetoriaSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  title: z.string().min(1, "Título obrigatório"),
  description: z.string().nullish(),
  image_url: z.string().url().nullish().or(z.literal("")),
  video_url: z.string().url().nullish().or(z.literal("")),
  document_url: z.string().url().nullish().or(z.literal("")),
  order_index: z.number().int().default(0),
});

export type TrajetoriaInput = z.infer<typeof trajetoriaSchema>;
