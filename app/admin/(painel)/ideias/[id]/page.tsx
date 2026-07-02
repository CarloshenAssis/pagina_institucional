import { getIdeia } from "../actions";
import { IdeiaForm } from "./form";

export default async function EditIdeiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getIdeia(id);
  return <IdeiaForm id={id} initial={item} />;
}
