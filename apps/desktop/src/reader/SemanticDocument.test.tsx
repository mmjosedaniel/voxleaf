import type {
  ContentDocumentId,
  RasterImageResourceId,
  SemanticBlock,
  SemanticDocument,
  SemanticInline,
  SensitivePublicationText,
  SourceFragment,
} from "@voxleaf/epub";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ScheduleLargeChapterYield } from "./large-chapter-rendering";
import {
  SemanticDocumentContent,
  type SemanticDocumentContentProps,
} from "./SemanticDocument";

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

function comparisonFixture(list: boolean) {
  const paragraphs = Array.from(
    { length: 501 },
    (_, index) =>
      Object.freeze({
        kind: "paragraph",
        children: Object.freeze([
          Object.freeze({
            kind: "internal-link",
            target: Object.freeze({
              documentId: "document:sentinel" as ContentDocumentId,
              fragment: `sentinel-${index}` as SourceFragment,
            }),
            children: Object.freeze([text(`Sentinel ${index}`)]),
          }),
        ]),
      }) satisfies SemanticBlock,
  );
  const blocks: readonly SemanticBlock[] = list
    ? [
        Object.freeze({
          kind: "list",
          ordered: true,
          items: Object.freeze(
            paragraphs.map((paragraph) =>
              Object.freeze({ children: Object.freeze([paragraph]) }),
            ),
          ),
        }),
      ]
    : paragraphs;
  const document = documentWith(blocks, { language: "en", direction: "ltr" });
  const pending: Array<() => void> = [];
  const scheduleRenderYield: ScheduleLargeChapterYield = (resume) => {
    pending.push(resume);
    return () => {
      const index = pending.indexOf(resume);
      if (index !== -1) pending.splice(index, 1);
    };
  };
  const targetAvailability = vi.fn(() => ({
    status: "unavailable" as const,
    explanation: "Synthetic destination unavailable.",
  }));
  const destinationRef = vi.fn();
  const content = (overrides: Partial<SemanticDocumentContentProps> = {}) => (
    <SemanticDocumentContent
      document={document}
      targetAvailability={targetAvailability}
      scheduleRenderYield={scheduleRenderYield}
      destinationRef={destinationRef}
      {...overrides}
    />
  );
  return {
    paragraphs,
    document,
    pending,
    targetAvailability,
    destinationRef,
    content,
  };
}

describe("semantic document rendering", () => {
  it.each([false, true])(
    "reuses completed descendants during later yields (list=%s)",
    (list) => {
      const fixture = comparisonFixture(list);
      render(fixture.content());
      const article = screen.getByRole("article", {
        name: "Current reading section",
      });
      const initialCount = list ? 249 : 250;
      function expectRendered(count: number) {
        expect(
          Array.from(
            article.querySelectorAll("p"),
            (paragraph) =>
              paragraph.querySelector(".semantic-internal-link > span")
                ?.textContent,
          ),
        ).toEqual(
          Array.from({ length: count }, (_, index) => `Sentinel ${index}`),
        );
        expect(fixture.targetAvailability).toHaveBeenCalledTimes(count);
      }
      expectRendered(initialCount);
      expect(article).toHaveAttribute("aria-busy", "true");
      expect(fixture.pending).toHaveLength(1);
      act(() => fixture.pending.shift()!());
      expectRendered(initialCount + 250);
      expect(article).toHaveAttribute("aria-busy", "true");
      expect(fixture.pending).toHaveLength(1);
      act(() => fixture.pending.shift()!());
      expectRendered(501);
      expect(article).not.toHaveAttribute("aria-busy");
      expect(fixture.pending).toHaveLength(0);
    },
  );

  it.each([false, true])(
    "updates affected destinations and replacement inputs (list=%s)",
    (list) => {
      const fixture = comparisonFixture(list);
      const subject = render(fixture.content());
      act(() => fixture.pending.shift()!());
      act(() => fixture.pending.shift()!());
      expect(fixture.targetAvailability).toHaveBeenCalledTimes(501);
      expect(fixture.destinationRef).not.toHaveBeenCalled();
      const article = screen.getByRole("article", {
        name: "Current reading section",
      });
      const elements = article.querySelectorAll("p");
      function moveDestination(
        block: SemanticBlock | undefined,
        calls: number,
      ) {
        fixture.targetAvailability.mockClear();
        fixture.destinationRef.mockClear();
        subject.rerender(
          fixture.content(
            block === undefined ? {} : { destinationBlock: block },
          ),
        );
        expect(fixture.targetAvailability).toHaveBeenCalledTimes(calls);
      }
      moveDestination(fixture.paragraphs[0], list ? 1 : 250);
      expect(fixture.destinationRef).toHaveBeenLastCalledWith(elements[0]);
      // Paragraph 250 starts the next flat or list-item group, outside the first range.
      moveDestination(fixture.paragraphs[250], list ? 2 : 500);
      expect(fixture.destinationRef).toHaveBeenLastCalledWith(elements[250]);
      moveDestination(fixture.paragraphs[249], list ? 2 : 500);
      expect(fixture.destinationRef).toHaveBeenLastCalledWith(elements[249]);
      const absent = Object.freeze({
        kind: "paragraph",
        children: Object.freeze([text("Absent")]),
      }) satisfies SemanticBlock;
      moveDestination(absent, list ? 1 : 250);
      expect(fixture.destinationRef).toHaveBeenLastCalledWith(null);
      moveDestination(Object.freeze({ ...absent }), 0);
      expect(fixture.destinationRef).not.toHaveBeenCalled();
      moveDestination(undefined, 0);
      expect(fixture.destinationRef).not.toHaveBeenCalled();
      const replacementAvailability = vi.fn(() => ({
        status: "unavailable" as const,
        explanation: "Replacement service unavailable.",
      }));
      subject.rerender(
        fixture.content({ targetAvailability: replacementAvailability }),
      );
      expect(replacementAvailability).toHaveBeenCalledTimes(501);
      expect(
        screen.getAllByText("Replacement service unavailable."),
      ).toHaveLength(501);
      replacementAvailability.mockClear();
      subject.rerender(
        fixture.content({
          targetAvailability: replacementAvailability,
          document: documentWith(fixture.document.blocks, {
            language: "en",
            direction: "ltr",
          }),
        }),
      );
      expect(replacementAvailability).toHaveBeenCalledTimes(501);
      replacementAvailability.mockClear();
      subject.rerender(
        fixture.content({
          targetAvailability: replacementAvailability,
          document: documentWith(fixture.document.blocks, {
            language: "fr",
            direction: "rtl",
          }),
        }),
      );
      expect(replacementAvailability).toHaveBeenCalledTimes(501);
      expect(article).toHaveAttribute("lang", "fr");
      expect(article).toHaveAttribute("dir", "rtl");
      expect(fixture.pending).toHaveLength(0);
    },
  );

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
      screen.getByRole("img", {
        name: "Private raster alternative. Image unavailable.",
      }),
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
    expect(container.innerHTML).toContain("Private raster alternative");
  });

  it("activates only available internal targets and explains inert destinations", () => {
    const availableTarget = Object.freeze({
      documentId: "document:available" as ContentDocumentId,
      fragment: "private-available-fragment" as SourceFragment,
    });
    const unavailableTarget = Object.freeze({
      documentId: "document:unavailable" as ContentDocumentId,
      fragment: "private-unavailable-fragment" as SourceFragment,
    });
    const activateTarget = vi.fn();
    const document = documentWith([
      Object.freeze({
        kind: "paragraph",
        children: Object.freeze([
          Object.freeze({
            kind: "internal-link",
            target: availableTarget,
            children: Object.freeze([text("Available destination")]),
          }),
          text(" "),
          Object.freeze({
            kind: "internal-link",
            target: unavailableTarget,
            children: Object.freeze([text("Unavailable destination")]),
          }),
        ]),
      }),
    ]);

    const { container } = render(
      <SemanticDocumentContent
        document={document}
        targetAvailability={(target) =>
          target === availableTarget
            ? { status: "available" }
            : {
                status: "unavailable",
                explanation: "This destination is unavailable.",
              }
        }
        onActivateTarget={activateTarget}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Available destination" }),
    );
    expect(activateTarget).toHaveBeenCalledWith(availableTarget);
    expect(
      screen.getByRole("link", {
        name: /Unavailable destination.*This destination is unavailable\./u,
      }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelector("[href]")).toBeNull();
    expect(container.innerHTML).not.toContain("private-available-fragment");
    expect(container.innerHTML).not.toContain("private-unavailable-fragment");
  });

  it("renders accepted content in browser-yielding batches of at most 250 blocks", () => {
    const pending: Array<{
      readonly resume: () => void;
      cancelled: boolean;
    }> = [];
    const scheduleRenderYield: ScheduleLargeChapterYield = (resume) => {
      const entry = { resume, cancelled: false };
      pending.push(entry);
      return () => {
        entry.cancelled = true;
      };
    };
    const blocks = Object.freeze(
      Array.from(
        { length: 251 },
        (_, index) =>
          Object.freeze({
            kind: "paragraph",
            children: Object.freeze([text(`Synthetic block ${index}`)]),
          }) satisfies SemanticBlock,
      ),
    );

    render(
      <SemanticDocumentContent
        document={documentWith(blocks)}
        scheduleRenderYield={scheduleRenderYield}
      />,
    );

    const article = screen.getByRole("article", {
      name: "Current reading section",
    });
    expect(article).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Synthetic block 249")).toBeInTheDocument();
    expect(screen.queryByText("Synthetic block 250")).not.toBeInTheDocument();
    expect(
      screen.getByRole("status", {
        name: "",
      }),
    ).toHaveTextContent("Loading more of this reading section.");
    expect(pending).toHaveLength(1);

    act(() => pending[0]!.resume());

    expect(screen.getByText("Synthetic block 250")).toBeInTheDocument();
    expect(article).not.toHaveAttribute("aria-busy");
    expect(
      screen.queryByText("Loading more of this reading section."),
    ).not.toBeInTheDocument();
  });

  it("preserves nested quote and list order across two browser yields", () => {
    const pending: Array<() => void> = [];
    const scheduleRenderYield: ScheduleLargeChapterYield = (resume) => {
      pending.push(resume);
      return () => {
        const index = pending.indexOf(resume);
        if (index !== -1) {
          pending.splice(index, 1);
        }
      };
    };
    const paragraphTexts = Array.from(
      { length: 500 },
      (_, index) => `Nested paragraph ${index}`,
    );
    const quote = Object.freeze({
      kind: "block-quote",
      children: Object.freeze([
        Object.freeze({
          kind: "list",
          ordered: true,
          items: Object.freeze(
            paragraphTexts.map((value) =>
              Object.freeze({
                children: Object.freeze([
                  Object.freeze({
                    kind: "paragraph",
                    children: Object.freeze([text(value)]),
                  }),
                ]),
              }),
            ),
          ),
        }),
      ]),
    }) satisfies SemanticBlock;

    render(
      <SemanticDocumentContent
        document={documentWith([quote])}
        scheduleRenderYield={scheduleRenderYield}
      />,
    );

    const article = screen.getByRole("article", {
      name: "Current reading section",
    });
    expect(article.querySelectorAll("p")).toHaveLength(248);
    expect(
      Array.from(
        article.querySelectorAll("blockquote > ol > li > p"),
        (paragraph) => paragraph.textContent,
      ),
    ).toEqual(paragraphTexts.slice(0, 248));
    expect(article).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading more of this reading section.",
    );
    expect(pending).toHaveLength(1);

    act(() => pending.shift()!());

    expect(article.querySelectorAll("p")).toHaveLength(498);
    expect(
      Array.from(
        article.querySelectorAll("blockquote > ol > li > p"),
        (paragraph) => paragraph.textContent,
      ),
    ).toEqual(paragraphTexts.slice(0, 498));
    expect(article).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading more of this reading section.",
    );
    expect(pending).toHaveLength(1);

    act(() => pending.shift()!());

    expect(article.querySelectorAll("p")).toHaveLength(500);
    expect(
      Array.from(
        article.querySelectorAll("blockquote > ol > li > p"),
        (paragraph) => paragraph.textContent,
      ),
    ).toEqual(paragraphTexts);
    expect(article).not.toHaveAttribute("aria-busy");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(pending).toHaveLength(0);
  });

  it("rejects an over-limit chapter before rendering publisher content", () => {
    const rejectedParagraph = Object.freeze({
      kind: "paragraph",
      children: Object.freeze([text("Must never render")]),
    }) satisfies SemanticBlock;
    const blocks = Object.freeze(
      Array.from({ length: 10_001 }, () => rejectedParagraph),
    );

    render(<SemanticDocumentContent document={documentWith(blocks)} />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Reading section unavailable",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("This reading section is too large to display safely."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Must never render")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Loading more of this reading section."),
    ).not.toBeInTheDocument();
  });
});
