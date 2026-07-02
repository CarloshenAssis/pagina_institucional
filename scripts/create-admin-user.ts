// Script de setup único: cria o usuário administrador em um ambiente novo.
// Uso: npx tsx scripts/create-admin-user.ts <email> <senha>
// Requer SUPABASE_SERVICE_ROLE_KEY e NEXT_PUBLIC_SUPABASE_URL no ambiente.
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.error("Uso: npx tsx scripts/create-admin-user.ts <email> <senha>");
    process.exit(1);
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  await supabase.from("admin_profiles").insert({
    id: data.user.id,
    name: "Administrador",
  });
  console.log("Admin user created:", data.user.id);
}

main();
