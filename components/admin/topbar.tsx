export function Topbar({ title }: { title: string }) {
  return (
    <div className="h-[74px] shrink-0 bg-card border-b flex items-center justify-between px-9 sticky top-0 z-10">
      <span className="font-display font-semibold text-xl">{title}</span>
    </div>
  );
}
