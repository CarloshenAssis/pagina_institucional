import { Topbar } from "@/components/admin/topbar";
import { MediaGallery } from "./gallery";

export default function MidiasPage() {
  return (
    <>
      <Topbar title="Mídias" />
      <div className="p-9">
        <MediaGallery />
      </div>
    </>
  );
}
