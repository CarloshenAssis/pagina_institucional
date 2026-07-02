import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SocialShareButtons } from "./social-share-buttons";

describe("SocialShareButtons", () => {
  it("does not render when the item is not published", () => {
    render(<SocialShareButtons slug="nota-oficial" status="rascunho" />);
    expect(screen.queryByText("Compartilhar")).not.toBeInTheDocument();
  });
  it("renders WhatsApp/Facebook/copy links when published", () => {
    render(<SocialShareButtons slug="nota-oficial" status="publicado" />);
    expect(screen.getByText("Compartilhar")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("Facebook")).toBeInTheDocument();
    expect(screen.getByText("Copiar link")).toBeInTheDocument();
  });
});
