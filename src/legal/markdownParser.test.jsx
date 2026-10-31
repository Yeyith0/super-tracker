import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Markdown from "./Markdown";
import { parseInline, parseMarkdown } from "./markdownParser";

describe("parseMarkdown", () => {
  it("parses headings, paragraphs and both list types", () => {
    const blocks = parseMarkdown("# Title\n\nFirst line\nsame paragraph\n\n- one\n- two\n  continued\n1. first\n2. second");
    expect(blocks).toEqual([
      { type: "heading", level: 1, text: "Title" },
      { type: "paragraph", text: "First line same paragraph" },
      { type: "list", ordered: false, items: ["one", "two continued"] },
      { type: "list", ordered: true, items: ["first", "second"] },
    ]);
  });

  it("parses bold text and allows only https, mailto and internal links", () => {
    expect(parseInline("**Bold** [site](https://x.dev) [mail](mailto:a@b.c) [doc](#/legal/terms) [bad](javascript:alert)")).toEqual([
      { type: "bold", text: "Bold" },
      { type: "text", text: " " },
      { type: "link", kind: "external", text: "site", href: "https://x.dev" },
      { type: "text", text: " " },
      { type: "link", kind: "external", text: "mail", href: "mailto:a@b.c" },
      { type: "text", text: " " },
      { type: "link", kind: "internal", text: "doc", href: "#/legal/terms" },
      { type: "text", text: " " },
      { type: "text", text: "[bad](javascript:alert)" },
    ]);
  });
});

describe("<Markdown>", () => {
  it("shows raw HTML as text instead of rendering it", () => {
    const { container } = render(
      <MemoryRouter>
        <Markdown source={'<script>alert(1)</script>\n\n<img src=x onerror="alert(1)"> **safe**'} />
      </MemoryRouter>,
    );
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container).toHaveTextContent("<script>alert(1)</script>");
    expect(screen.getByText("safe").tagName).toBe("STRONG");
  });

  it("renders internal links as router links and external links with a hint", () => {
    render(
      <MemoryRouter>
        <Markdown source="See the [rules](#/legal/roleplay) or [mail us](mailto:hq@super.earth)." />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "rules" })).toHaveAttribute("href", "/legal/roleplay");
    expect(screen.getByRole("link", { name: /mail us/ })).toHaveAttribute("href", "mailto:hq@super.earth");
  });
});
