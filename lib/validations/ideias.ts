import { z } from "zod";

export const ideiaSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  slug: z.string().nullish(),
  category_id: z.string().uuid().optional().nullable(),
  author: z.string().nullish(),
  excerpt: z.string().max(300).nullish(),
  content: z.string().nullish(),
  cover_url: z.string().url().nullish().or(z.literal("")),
  video_url: z.string().url().nullish().or(z.literal("")),
  pdf_url: z.string().url().nullish().or(z.literal("")),
  featured: z.boolean().default(false),
  seo: z
    .object({ meta_title: z.string().nullish(), meta_description: z.string().max(160).nullish() })
    .default({}),
});

export type IdeiaInput = z.infer<typeof ideiaSchema>;
