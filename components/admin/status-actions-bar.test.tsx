import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusActionsBar } from "./status-actions-bar";

describe("StatusActionsBar", () => {
  it("calls onAction with 'publicar' and no date when publishing immediately", async () => {
    const onAction = vi.fn();
    render(<StatusActionsBar scheduledAt={null} onAction={onAction} />);
    await userEvent.click(screen.getByText("Publicar →"));
    expect(onAction).toHaveBeenCalledWith("publicar", null);
  });

  it("shows 'Agendar' instead of 'Publicar' when a future date is set", () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    render(<StatusActionsBar scheduledAt={future} onAction={() => {}} />);
    expect(screen.getByText("Agendar →")).toBeInTheDocument();
  });
});
