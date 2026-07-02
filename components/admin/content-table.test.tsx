import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContentTable } from "./content-table";

const rows = [
  { id: "1", title: "Escola Nova Geração", status: "publicado" as const, extra: "Educação", date: "12 mar 2026" },
  { id: "2", title: "Corredor Verde", status: "rascunho" as const, extra: "Infraestrutura", date: "—" },
];

describe("ContentTable", () => {
  it("renders all rows initially", () => {
    render(
      <ContentTable
        rows={rows}
        titleKey="title"
        columns={[{ key: "extra", label: "Categoria" }, { key: "date", label: "Data" }]}
        onEdit={() => {}}
        onDuplicate={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText("Escola Nova Geração")).toBeInTheDocument();
    expect(screen.getByText("Corredor Verde")).toBeInTheDocument();
  });

  it("filters rows by title as the user types", async () => {
    render(
      <ContentTable
        rows={rows}
        titleKey="title"
        columns={[{ key: "extra", label: "Categoria" }, { key: "date", label: "Data" }]}
        onEdit={() => {}}
        onDuplicate={() => {}}
        onDelete={() => {}}
      />
    );
    await userEvent.type(screen.getByPlaceholderText("Pesquisar..."), "Corredor");
    expect(screen.queryByText("Escola Nova Geração")).not.toBeInTheDocument();
    expect(screen.getByText("Corredor Verde")).toBeInTheDocument();
  });

  it("shows an inline confirm before calling onDelete", async () => {
    const onDelete = vi.fn();
    render(
      <ContentTable
        rows={rows}
        titleKey="title"
        columns={[{ key: "extra", label: "Categoria" }, { key: "date", label: "Data" }]}
        onEdit={() => {}}
        onDuplicate={() => {}}
        onDelete={onDelete}
      />
    );
    const [firstDeleteLink] = screen.getAllByText("Excluir");
    await userEvent.click(firstDeleteLink);
    expect(screen.getByText("Excluir?")).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText("Sim"));
    expect(onDelete).toHaveBeenCalledWith("1");
  });
});
