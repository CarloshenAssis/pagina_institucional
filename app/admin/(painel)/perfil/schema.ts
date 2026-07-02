import { z } from "zod";

export const passwordChangeSchema = z.object({ password: z.string().min(8) });
