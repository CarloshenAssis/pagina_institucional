import { listAllCategories } from "@/app/admin/category-actions";
import { Topbar } from "@/components/admin/topbar";
import { CategoriasPanel } from "./categorias-panel";

export default async function CategoriasPage() {
  const categories = await listAllCategories();
  return (
    <>
      <Topbar title="Categorias" />
      <div className="p-9">
        <CategoriasPanel initial={categories} />
      </div>
    </>
  );
}
