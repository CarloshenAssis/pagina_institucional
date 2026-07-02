import { z } from "zod";

export const sobreSchema = z.object({
  title: z.string().nullish(),
  subtitle: z.string().nullish(),
  text_content: z.string().nullish(),
  photo_url: z.string().url().nullish().or(z.literal("")),
  gallery_urls: z.array(z.string().url()).default([]),
  video_url: z.string().url().nullish().or(z.literal("")),
  pdf_urls: z.array(z.string().url()).default([]),
});

export type SobreInput = z.infer<typeof sobreSchema>;
