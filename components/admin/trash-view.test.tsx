import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrashView } from "./trash-view";

describe("TrashView", () => {
  it("lists soft-deleted rows and calls onRestore", async () => {
    const onRestore = vi.fn();
    render(
      <TrashView
        rows={[{ id: "1", title: "Projeto X", deleted_at: "2026-06-01T00:00:00Z" }]}
        titleKey="title"
        onRestore={onRestore}
      />
    );
    expect(screen.getByText("Projeto X")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Restaurar"));
    expect(onRestore).toHaveBeenCalledWith("1");
  });

  it("shows an empty state with no rows", () => {
    render(<TrashView rows={[]} titleKey="title" onRestore={() => {}} />);
    expect(screen.getByText("A lixeira está vazia.")).toBeInTheDocument();
  });
});
