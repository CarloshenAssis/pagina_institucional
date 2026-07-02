import { Topbar } from "@/components/admin/topbar";
import { Inbox } from "./inbox";

export default function MensagensPage() {
  return (
    <>
      <Topbar title="Caixa de Entrada" />
      <Inbox />
    </>
  );
}
