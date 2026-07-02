import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RichTextEditor } from "./rich-text-editor";

describe("RichTextEditor", () => {
  it("renders the toolbar buttons", async () => {
    render(<RichTextEditor value="" onChange={() => {}} />);
    expect(await screen.findByTitle("Negrito")).toBeInTheDocument();
    expect(screen.getByTitle("Itálico")).toBeInTheDocument();
    expect(screen.getByTitle("Link")).toBeInTheDocument();
    expect(screen.getByTitle("Lista")).toBeInTheDocument();
    expect(screen.getByTitle("Tabela")).toBeInTheDocument();
    expect(screen.getByTitle("Citação")).toBeInTheDocument();
    expect(screen.getByTitle("Separador")).toBeInTheDocument();
  });

  it("calls onChange with HTML when the content changes", async () => {
    const onChange = vi.fn();
    render(<RichTextEditor value="" onChange={onChange} />);
    const editable = await screen.findByRole("textbox");
    await userEvent.type(editable, "Olá");
    expect(onChange).toHaveBeenCalled();
  });
});
