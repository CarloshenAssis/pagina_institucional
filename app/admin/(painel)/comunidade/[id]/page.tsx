import { getAlbum } from "../actions";
import { AlbumForm } from "./form";

export default async function EditAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getAlbum(id);
  return <AlbumForm id={id} initial={item} />;
}
