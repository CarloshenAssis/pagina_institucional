import { z } from "zod";

export const albumSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  slug: z.string().optional(),
  category_id: z.string().uuid().optional().nullable(),
  date: z.string().optional(),
  description: z.string().optional(),
  cover_url: z.string().url().optional().or(z.literal("")),
  gallery_urls: z.array(z.string().url()).default([]),
  video_urls: z.array(z.string().url()).default([]),
  seo: z
    .object({ meta_title: z.string().optional(), meta_description: z.string().max(160).optional() })
    .default({}),
});

export type AlbumInput = z.infer<typeof albumSchema>;
