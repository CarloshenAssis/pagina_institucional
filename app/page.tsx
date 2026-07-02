import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl">Portal Institucional</h1>
      <p className="text-text-secondary">
        Portal público em construção — o conteúdo é gerenciado pelo painel
        administrativo.
      </p>
      <Button render={<a href="/admin" />}>Acessar painel</Button>
    </main>
  );
}
