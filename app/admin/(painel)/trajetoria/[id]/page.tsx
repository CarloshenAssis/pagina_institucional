import { getTrajetoriaItem } from "../actions";
import { TrajetoriaForm } from "./form";

export default async function EditTrajetoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getTrajetoriaItem(id);
  return <TrajetoriaForm id={id} initial={item} />;
}
