import { getProjeto } from "../actions";
import { ProjetoForm } from "./form";

export default async function EditProjetoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getProjeto(id);
  return <ProjetoForm id={id} initial={item} />;
}
