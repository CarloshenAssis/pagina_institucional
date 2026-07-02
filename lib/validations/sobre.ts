import { z } from "zod";

export const sobreSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  text_content: z.string().optional(),
  photo_url: z.string().url().optional().or(z.literal("")),
  gallery_urls: z.array(z.string().url()).default([]),
  video_url: z.string().url().optional().or(z.literal("")),
  pdf_urls: z.array(z.string().url()).default([]),
});

export type SobreInput = z.infer<typeof sobreSchema>;
