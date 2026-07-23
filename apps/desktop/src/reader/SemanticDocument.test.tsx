import type {
  ContentDocumentId,
  RasterImageResourceId,
  SemanticBlock,
  SemanticDocument,
  SemanticInline,
  SensitivePublicationText,
  SourceFragment,
} from "@voxleaf/epub";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SemanticDocumentContent } from "./SemanticDocument";

afterEach(cleanup);

function publicationText(value: string): SensitivePublicationText {
  return value as SensitivePublicationText;
}

function text(
  value: string,
  context: {
    readonly direction?: "auto" | "ltr" | "rtl";
    readonly language?: string;
  } = {},
): SemanticInline {
  return Object.freeze({
    kind: "text",
    text: publicationText(value),
    ...context,
  });
}

function documentWith(
  blocks: readonly SemanticBlock[],
  context: {
    readonly direction?: "auto" | "ltr" | "rtl";
    readonly language?: string;
  } = {},
): SemanticDocument {
  return Object.freeze({
    id: "document:synthetic" as ContentDocumentId,
    location: Object.freeze({ kind: "non-spine" }),
    blocks: Object.freeze(blocks),
    ...context,
  });
}

describe("semantic document rendering", () => {
  it("renders every supported text structure in source order", () => {
    const blocks: readonly SemanticBlock[] = Object.freeze([
      ...([1, 2, 3, 4, 5, 6] as const).map(
        (level) =>
          Object.freeze({
            kind: "heading",
            level,
            children: Object.freeze([text(`Heading ${level}`)]),
          }) satisfies SemanticBlock,
      ),
      Object.freeze({
        kind: "paragraph",
        children: Object.freeze([
          text("Paragraph start "),
          Object.freeze({
            kind: "emphasis",
            children: Object.freeze([text("emphasis")]),
          }),
          text(" then "),
          Object.freeze({
            kind: "strong",
            children: Object.freeze([text("strong")]),
          }),
          text(" and "),
          Object.freeze({
            kind: "code",
            children: Object.freeze([text("const value = 1;")]),
          }),
          Object.freeze({ kind: "line-break" }),
          text("Paragraph end"),
        ]),
      }),
      Object.freeze({
        kind: "block-quote",
        children: Object.freeze([
          Object.freeze({
            kind: "paragraph",
            children: Object.freeze([text("Quoted paragraph")]),
          }),
        ]),
      }),
      Object.freeze({
        kind: "list",
        ordered: true,
        items: Object.freeze([
          Object.freeze({
            children: Object.freeze([
              Object.freeze({
                kind: "paragraph",
                children: Object.freeze([text("Ordered first")]),
              }),
            ]),
          }),
          Object.freeze({
            children: Object.freeze([
              Object.freeze({
                kind: "paragraph",
                children: Object.freeze([text("Ordered second")]),
              }),
            ]),
          }),
        ]),
      }),
      Object.freeze({
        kind: "list",
        ordered: false,
        items: Object.freeze([
          Object.freeze({
            children: Object.freeze([
              Object.freeze({
                kind: "paragraph",
                children: Object.freeze([text("Unordered item")]),
              }),
            ]),
          }),
        ]),
      }),
    ]);

    render(<SemanticDocumentContent document={documentWith(blocks)} />);

    for (const level of [1, 2, 3, 4, 5, 6] as const) {
      expect(
        screen.getByRole("heading", { level, name: `Heading ${level}` }),
      ).toBeInTheDocument();
    }
    expect(screen.getByText("emphasis").tagName).toBe("EM");
    expect(screen.getByText("strong").tagName).toBe("STRONG");
    expect(screen.getByText("const value = 1;").tagName).toBe("CODE");
    const paragraph = screen.getByText("emphasis").closest("p");
    const lineBreak = paragraph?.querySelector("br");
    expect(lineBreak).not.toBeNull();
    expect(lineBreak?.nextSibling?.textContent).toBe("Paragraph end");

    const quote = screen.getByText("Quoted paragraph").closest("blockquote");
    expect(quote).not.toBeNull();
    expect(within(quote!).getByText("Quoted paragraph").tagName).toBe("P");

    const lists = screen.getAllByRole("list");
    const ordered = lists[0]!;
    expect(ordered.tagName).toBe("OL");
    expect(within(ordered).getAllByRole("listitem")).toHaveLength(2);
    expect(lists[1]?.tagName).toBe("UL");

    const content =
      screen.getByRole("article", { name: "Current reading section" })
        .textContent ?? "";
    expect(content.indexOf("Heading 1")).toBeLessThan(
      content.indexOf("Heading 6"),
    );
    expect(content.indexOf("Heading 6")).toBeLessThan(
      content.indexOf("Paragraph start"),
    );
    expect(content.indexOf("Ordered second")).toBeLessThan(
      content.indexOf("Unordered item"),
    );
  });

  it("preserves document, block, and inline language and direction", () => {
    const document = documentWith(
      [
        Object.freeze({
          kind: "paragraph",
          language: "ar",
          direction: "rtl",
          children: Object.freeze([
            text("Inherited Arabic context"),
            Object.freeze({
              kind: "emphasis",
              language: "fr",
              direction: "ltr",
              children: Object.freeze([text("Contexte français")]),
            }),
            text("Texto localizado", { language: "es", direction: "auto" }),
          ]),
        }),
      ],
      { language: "en", direction: "ltr" },
    );

    render(<SemanticDocumentContent document={document} />);

    const article = screen.getByRole("article", {
      name: "Current reading section",
    });
    expect(article).toHaveAttribute("lang", "en");
    expect(article).toHaveAttribute("dir", "ltr");

    const paragraph = screen.getByText("Inherited Arabic context").closest("p");
    expect(paragraph).toHaveAttribute("lang", "ar");
    expect(paragraph).toHaveAttribute("dir", "rtl");

    const emphasis = screen.getByText("Contexte français");
    expect(emphasis.tagName).toBe("EM");
    expect(emphasis).toHaveAttribute("lang", "fr");
    expect(emphasis).toHaveAttribute("dir", "ltr");

    const localizedText = screen.getByText("Texto localizado");
    expect(localizedText.tagName).toBe("SPAN");
    expect(localizedText).toHaveAttribute("lang", "es");
    expect(localizedText).toHaveAttribute("dir", "auto");
  });

  it("keeps target and raster identities out of inert application markup", () => {
    const sourceFragment = "private-publisher-fragment" as SourceFragment;
    const resourceId = "private-raster-resource" as RasterImageResourceId;
    const hostileText = "<script>publisherText()</script>";
    const publisherAttributedParagraph = Object.freeze({
      kind: "paragraph",
      id: "private-publisher-id",
      className: "private-publisher-class",
      style: Object.freeze({ backgroundImage: "url(private-publisher-url)" }),
      children: Object.freeze([
        text(hostileText),
        Object.freeze({
          kind: "internal-link",
          target: Object.freeze({
            documentId: "private-target-document" as ContentDocumentId,
            fragment: sourceFragment,
          }),
          children: Object.freeze([text("Inert link label")]),
        }),
        Object.freeze({
          kind: "raster-image",
          resourceId,
          alternativeText: publicationText("Private raster alternative"),
        }),
      ]),
    }) as unknown as SemanticBlock;
    const document = Object.freeze({
      id: "private-document-identity" as ContentDocumentId,
      location: Object.freeze({ kind: "non-spine" }),
      blocks: Object.freeze([publisherAttributedParagraph]),
    } satisfies SemanticDocument);

    const { container } = render(
      <SemanticDocumentContent document={document} />,
    );

    expect(screen.getByText(hostileText)).toBeInTheDocument();
    expect(screen.getByText("Inert link label").tagName).toBe("SPAN");
    expect(
      screen.getByRole("img", { name: "Publication image placeholder" }),
    ).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("[id]")).toBeNull();
    expect(container.querySelector("[href]")).toBeNull();
    expect(container.querySelector("[src]")).toBeNull();
    expect(container.querySelector("[style]")).toBeNull();
    expect(container.innerHTML).not.toContain("private-document-identity");
    expect(container.innerHTML).not.toContain("private-target-document");
    expect(container.innerHTML).not.toContain(sourceFragment);
    expect(container.innerHTML).not.toContain(resourceId);
    expect(container.innerHTML).not.toContain("private-publisher-id");
    expect(container.innerHTML).not.toContain("private-publisher-class");
    expect(container.innerHTML).not.toContain("private-publisher-url");
    expect(container.innerHTML).not.toContain("Private raster alternative");
  });
});
