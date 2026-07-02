import { getEvento } from "../actions";
import { EventoForm } from "./form";

export default async function EditEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getEvento(id);
  return <EventoForm id={id} initial={item} />;
}
