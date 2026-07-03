export function pageRange(page: number, perPage: number): { from: number; to: number } {
  const p = Math.max(1, page);
  const from = (p - 1) * perPage;
  return { from, to: from + perPage - 1 };
}

export function totalPages(count: number, perPage: number): number {
  return Math.max(1, Math.ceil(count / perPage));
}
