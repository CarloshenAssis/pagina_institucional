import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 flex flex-col items-start gap-4">
      <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gold">
        <span className="inline-block w-8 h-px bg-secondary" aria-hidden />
        Erro 404
      </span>
      <h1 className="font-display text-4xl md:text-5xl text-primary">Página não encontrada</h1>
      <p className="text-foreground/70 max-w-lg">
        O conteúdo que você procura pode ter sido movido, despublicado ou nunca existiu.
      </p>
      <Link href="/" className="mt-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold">
        Voltar para o início
      </Link>
    </section>
  );
}
