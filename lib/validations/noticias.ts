import { z } from "zod";

export const noticiaSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  slug: z.string().optional(),
  category_id: z.string().uuid().optional().nullable(),
  author: z.string().optional(),
  excerpt: z.string().max(300).optional(),
  content: z.string().optional(),
  cover_url: z.string().url().optional().or(z.literal("")),
  gallery_urls: z.array(z.string().url()).default([]),
  video_url: z.string().url().optional().or(z.literal("")),
  pdf_url: z.string().url().optional().or(z.literal("")),
  featured: z.boolean().default(false),
  seo: z
    .object({ meta_title: z.string().optional(), meta_description: z.string().max(160).optional() })
    .default({}),
});

export type NoticiaInput = z.infer<typeof noticiaSchema>;
