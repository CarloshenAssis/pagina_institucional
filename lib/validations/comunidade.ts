import { z } from "zod";

export const albumSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  slug: z.string().nullish(),
  category_id: z.string().uuid().optional().nullable(),
  date: z.string().nullish(),
  description: z.string().nullish(),
  cover_url: z.string().url().nullish().or(z.literal("")),
  gallery_urls: z.array(z.string().url()).default([]),
  video_urls: z.array(z.string().url()).default([]),
  seo: z
    .object({ meta_title: z.string().nullish(), meta_description: z.string().max(160).nullish() })
    .default({}),
});

export type AlbumInput = z.infer<typeof albumSchema>;
