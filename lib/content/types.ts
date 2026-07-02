import type { ContentStatus } from "./status";

export interface BaseContentRow {
  id: string;
  status: ContentStatus;
  scheduled_at: string | null;
  published_at: string | null;
  deleted_at: string | null;
  created_at: string;
}

export interface ModuleConfig<TRow extends BaseContentRow> {
  table: string;
  labelSingular: string;
  labelPlural: string;
  titleColumn: keyof TRow & string;
  extraColumns: { key: keyof TRow & string; label: string }[];
  hasSlug: boolean;
  detailPath: (id: string) => string;
}
