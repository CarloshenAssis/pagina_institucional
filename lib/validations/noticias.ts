import { z } from "zod";

export const noticiaSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  slug: z.string().nullish(),
  category_id: z.string().uuid().optional().nullable(),
  author: z.string().nullish(),
  excerpt: z.string().max(300).nullish(),
  content: z.string().nullish(),
  cover_url: z.string().url().nullish().or(z.literal("")),
  gallery_urls: z.array(z.string().url()).default([]),
  video_url: z.string().url().nullish().or(z.literal("")),
  pdf_url: z.string().url().nullish().or(z.literal("")),
  featured: z.boolean().default(false),
  seo: z
    .object({ meta_title: z.string().nullish(), meta_description: z.string().max(160).nullish() })
    .default({}),
});

export type NoticiaInput = z.infer<typeof noticiaSchema>;
