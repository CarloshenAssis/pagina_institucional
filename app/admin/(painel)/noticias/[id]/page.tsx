import { getNoticia } from "../actions";
import { NoticiaForm } from "./form";

export default async function EditNoticiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getNoticia(id);
  return <NoticiaForm id={id} initial={item} savedSlug={item.slug} savedStatus={item.status} />;
}
