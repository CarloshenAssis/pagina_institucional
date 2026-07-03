import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectCard, NewsCard, IdeaCard, EventCard } from "./cards";

describe("ProjectCard", () => {
  it("renders title, stage label and category", () => {
    render(
      <ProjectCard
        project={{
          slug: "escola",
          title: "Escola Nova Geração",
          excerpt: "resumo",
          cover_url: null,
          project_stage: "em_andamento",
          category_name: "Educação",
        }}
      />
    );
    expect(screen.getByText("Escola Nova Geração")).toBeInTheDocument();
    expect(screen.getByText("Em andamento")).toBeInTheDocument();
    expect(screen.getByText("Educação")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/projetos/escola");
  });
});

describe("NewsCard", () => {
  it("renders title and formatted date", () => {
    render(
      <NewsCard
        news={{
          slug: "nota",
          title: "Nota oficial",
          excerpt: null,
          cover_url: null,
          published_at: "2026-07-01T10:00:00Z",
          category_name: null,
        }}
      />
    );
    expect(screen.getByText("Nota oficial")).toBeInTheDocument();
    expect(screen.getByText("01/07/2026")).toBeInTheDocument();
  });
});

describe("IdeaCard", () => {
  it("renders author when present", () => {
    render(
      <IdeaCard idea={{ slug: "x", title: "Formação docente", excerpt: null, category_name: null, author: "Tia Lu" }} />
    );
    expect(screen.getByText("Por Tia Lu")).toBeInTheDocument();
  });
});

describe("EventCard", () => {
  it("renders day, title and location", () => {
    render(
      <EventCard event={{ id: "1", title: "Audiência pública", date: "2026-07-08T19:00:00Z", location: "Câmara" }} />
    );
    expect(screen.getByText("Audiência pública")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText(/Câmara/)).toBeInTheDocument();
  });
});
