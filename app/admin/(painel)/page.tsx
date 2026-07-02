import Link from "next/link";
import { getDashboardSummary } from "@/lib/content/dashboard-queries";
import { Topbar } from "@/components/admin/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const { counts, unreadMessages, publishedThisMonth } = await getDashboardSummary();

  const cards = [
    { label: "Projetos", value: counts.projects },
    { label: "Notícias", value: counts.news },
    { label: "Ideias", value: counts.ideas },
    { label: "Eventos", value: counts.events },
    { label: "Mensagens", value: unreadMessages },
  ];

  const quickActions = [
    { label: "+ Novo Projeto", href: "/admin/projetos/novo", primary: true },
    { label: "+ Nova Notícia", href: "/admin/noticias/novo" },
    { label: "+ Nova Ideia", href: "/admin/ideias/novo" },
    { label: "+ Novo Evento", href: "/admin/agenda/novo" },
    { label: "+ Nova Etapa", href: "/admin/trajetoria/novo" },
    { label: "+ Nova Galeria", href: "/admin/comunidade/novo" },
  ];

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="p-9">
        <h2 className="font-display text-2xl mb-6">Bem-vindo de volta.</h2>
        <div className="grid grid-cols-6 gap-4 mb-8">
          {cards.map((c) => (
            <Card key={c.label} className="p-5">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">{c.label}</span>
              <div className="font-display text-2xl">{c.value}</div>
            </Card>
          ))}
          <Card className="p-5 bg-primary text-primary-foreground">
            <span className="text-[10px] font-bold uppercase text-secondary">Publicados no mês</span>
            <div className="font-display text-2xl">{publishedThisMonth}</div>
          </Card>
        </div>
        <div className="flex gap-3 flex-wrap mb-8">
          {quickActions.map((action) => (
            <Button
              key={action.href}
              variant={action.primary ? "default" : "outline"}
              nativeButton={false}
              render={<Link href={action.href} />}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}
