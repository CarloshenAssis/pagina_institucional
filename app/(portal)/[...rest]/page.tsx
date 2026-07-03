import { notFound } from "next/navigation";

// Catch-all: URLs desconhecidas caem aqui e disparam o not-found DO GRUPO
// (portal), que renderiza a 404 customizada dentro do layout público.
// Sem isso, rotas inexistentes usariam o 404 padrão da raiz, sem Header/Footer.
export default function CatchAll() {
  notFound();
}
