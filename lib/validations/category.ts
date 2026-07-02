import { z } from "zod";

export const categoryNameSchema = z.string().min(1);

export type CategoryModule = "projetos" | "ideias" | "noticias" | "comunidade";
