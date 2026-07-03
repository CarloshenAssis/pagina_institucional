import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wbbqnbrhulasdttgapqw.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Fallbacks APENAS para valores públicos (a anon key é pública por design —
  // é enviada ao browser e o RLS protege os dados). Permitem deploy na Vercel
  // sem configurar env vars no dashboard; qualquer env definida lá ou em
  // .env.local tem precedência. Segredos (service role, Turnstile secret)
  // NUNCA entram aqui — só no dashboard da Vercel.
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://wbbqnbrhulasdttgapqw.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiYnFuYnJodWxhc2R0dGdhcHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NDk0NjYsImV4cCI6MjA5ODUyNTQ2Nn0.I86fWok2JFIka4FhZ_up-cTudQjcalofwajDGsfduE0",
    // Sem isso, sitemap.xml/robots.txt/JSON-LD caem no fallback "localhost:3000"
    // hardcoded nesses arquivos, mesmo em produção — vira o domínio real da Vercel
    // se NEXT_PUBLIC_SITE_URL não for setada no dashboard.
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://portaltialu.vercel.app",
  },
};

export default nextConfig;
