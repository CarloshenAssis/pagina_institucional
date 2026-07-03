"use server";

import { headers } from "next/headers";
import { submitContactForm } from "@/app/contact-actions";

export async function sendContact(input: unknown) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return submitContactForm(input, ip);
}
