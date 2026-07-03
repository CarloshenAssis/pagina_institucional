export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col gap-2 mb-8">
      <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gold">
        <span className="inline-block w-8 h-px bg-secondary" aria-hidden />
        {eyebrow}
      </span>
      <h2 className="font-display text-3xl md:text-4xl text-primary">{title}</h2>
      {subtitle && <p className="text-foreground/70 max-w-xl">{subtitle}</p>}
    </div>
  );
}
