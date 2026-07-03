"use client";

export function TrashView<T extends { id: string; deleted_at: string | null }>({
  rows,
  titleKey,
  onRestore,
}: {
  rows: T[];
  titleKey: keyof T & string;
  onRestore: (id: string) => void;
}) {
  if (rows.length === 0) {
    return <p className="py-16 text-center text-sm text-muted-foreground">A lixeira está vazia.</p>;
  }
  return (
    <div className="bg-card border">
      {rows.map((row) => (
        <div key={row.id} className="flex justify-between items-center px-6 py-4 border-t">
          <span>{String(row[titleKey])}</span>
          <span className="text-xs text-muted-foreground">
            Excluído em {new Date(row.deleted_at!).toLocaleDateString("pt-BR")}
          </span>
          <button className="text-xs font-bold underline" onClick={() => onRestore(row.id)}>
            Restaurar
          </button>
        </div>
      ))}
    </div>
  );
}
