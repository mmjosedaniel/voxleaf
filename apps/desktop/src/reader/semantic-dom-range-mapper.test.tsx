import type {
  ContentDocumentId,
  PublicationLocatedBlock,
  RasterImageResourceId,
  SemanticBlock,
  SemanticDocument,
  SemanticInline,
  SensitivePublicationText,
} from "@voxleaf/epub";
import { createIndex } from "@voxleaf/shared";
import { VALID_SYNTHETIC_DOCUMENT_FIXTURE } from "@voxleaf/shared/testing";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SemanticDocumentContent } from "./SemanticDocument";
import { SemanticDomRangeMapper } from "./semantic-dom-range-mapper";

afterEach(cleanup);

function publicationText(value: string): SensitivePublicationText {
  return value as SensitivePublicationText;
}

function text(value: string): SemanticInline {
  return Object.freeze({
    kind: "text",
    text: publicationText(value),
  });
}

function documentWith(
  id: ContentDocumentId,
  blocks: readonly SemanticBlock[],
): SemanticDocument {
  return Object.freeze({
    id,
    location: Object.freeze({
      kind: "spine",
      spineItemId: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book.spine[0]!.id,
      spineItemIndex: VALID_SYNTHETIC_DOCUMENT_FIXTURE.book.spine[0]!.index,
    }),
    blocks: Object.freeze(blocks),
  });
}

function locatedBlock(
  documentId: ContentDocumentId,
  block: SemanticBlock,
  textLengthCodePoints: number,
): PublicationLocatedBlock {
  return Object.freeze({
    documentId,
    block,
    startLocator:
      VALID_SYNTHETIC_DOCUMENT_FIXTURE.spineDocuments[0]!.blocks[0]!.locator,
    textLengthCodePoints: createIndex(textLengthCodePoints),
  });
}

describe("semantic DOM range mapping", () => {
  it("round-trips every legal code-point offset through nested rendered DOM", () => {
    const documentId = "document:dom-mapper-inline" as ContentDocumentId;
    const paragraph = Object.freeze({
      kind: "paragraph",
      children: Object.freeze([
        text("A😀e\u0301"),
        Object.freeze({
          kind: "emphasis",
          children: Object.freeze([text("nested")]),
        }),
        Object.freeze({
          kind: "strong",
          children: Object.freeze([
            Object.freeze({
              kind: "code",
              children: Object.freeze([text("Z")]),
            }),
          ]),
        }),
        Object.freeze({ kind: "line-break" }),
        Object.freeze({
          kind: "raster-image",
          resourceId: "raster:mapper" as RasterImageResourceId,
          alternativeText: publicationText(
            "Alternative text is not a logical offset.",
          ),
        }),
        Object.freeze({
          kind: "internal-link",
          target: Object.freeze({ documentId }),
          children: Object.freeze([text("go")]),
        }),
      ]),
    }) satisfies SemanticBlock;
    const located = locatedBlock(documentId, paragraph, 15);
    const mapper = new SemanticDomRangeMapper();

    const { container } = render(
      <SemanticDocumentContent
        document={documentWith(documentId, [paragraph])}
        domRangeMapper={mapper}
        locatedBlocks={[located]}
      />,
    );

    expect(mapper.registrationCount).toBe(1);
    for (let offset = 0; offset <= 15; offset += 1) {
      const range = mapper.rangeFor(located, offset);
      expect(range, `missing range for offset ${String(offset)}`).toBeDefined();
      const position = mapper.positionFor(range!);
      expect(position?.locatedBlock).toBe(located);
      expect(position?.textOffsetCodePoints).toBe(offset);
      expect(Object.isFrozen(position)).toBe(true);
    }

    const paragraphElement = container.querySelector("p");
    const firstText = paragraphElement?.firstChild;
    if (!(firstText instanceof Text)) {
      throw new Error("expected the initial publication text node");
    }
    expect(firstText.data).toBe("A😀e\u0301");
    expect(mapper.rangeFor(located, 1)?.startOffset).toBe(1);
    expect(mapper.rangeFor(located, 2)?.startOffset).toBe(3);
    expect(mapper.rangeFor(located, 4)?.startOffset).toBe(5);

    const insideSurrogate = document.createRange();
    insideSurrogate.setStart(firstText, 2);
    insideSurrogate.collapse(true);
    expect(mapper.positionFor(insideSurrogate)).toBeUndefined();

    const emphasis = screen.getByText("nested");
    const emphasisStart = document.createRange();
    emphasisStart.setStart(emphasis, 0);
    emphasisStart.collapse(true);
    expect(mapper.positionFor(emphasisStart)?.textOffsetCodePoints).toBe(4);
    const emphasisEnd = document.createRange();
    emphasisEnd.setStart(emphasis, emphasis.childNodes.length);
    emphasisEnd.collapse(true);
    expect(mapper.positionFor(emphasisEnd)?.textOffsetCodePoints).toBe(10);

    const lineBreak = paragraphElement?.querySelector("br");
    const rasterHost = paragraphElement?.querySelector(".semantic-raster-host");
    expect(lineBreak).not.toBeNull();
    expect(rasterHost).not.toBeNull();
    const afterLineBreak = mapper.rangeFor(located, 12);
    const afterRaster = mapper.rangeFor(located, 13);
    expect(afterLineBreak?.startContainer).toBe(paragraphElement);
    expect(afterLineBreak?.startOffset).toBe(
      Array.from(paragraphElement!.childNodes).indexOf(lineBreak!) + 1,
    );
    expect(afterRaster?.startContainer).toBe(paragraphElement);
    expect(afterRaster?.startOffset).toBe(
      Array.from(paragraphElement!.childNodes).indexOf(rasterHost!) + 1,
    );

    expect(
      screen.getByRole("img", {
        name: "Alternative text is not a logical offset.. Image unavailable.",
      }),
    ).toBeInTheDocument();
    expect(paragraphElement).toHaveTextContent(
      "Internal navigation is unavailable.",
    );
    expect(mapper.positionFor(mapper.rangeFor(located, 15)!)).toEqual({
      locatedBlock: located,
      textOffsetCodePoints: 15,
    });
  });

  it("maps structural and zero-length blocks only at offset zero", () => {
    const documentId = "document:dom-mapper-structure" as ContentDocumentId;
    const quotedParagraph = Object.freeze({
      kind: "paragraph",
      children: Object.freeze([text("Quoted")]),
    }) satisfies SemanticBlock;
    const quote = Object.freeze({
      kind: "block-quote",
      children: Object.freeze([quotedParagraph]),
    }) satisfies SemanticBlock;
    const listedParagraph = Object.freeze({
      kind: "paragraph",
      children: Object.freeze([text("Listed")]),
    }) satisfies SemanticBlock;
    const list = Object.freeze({
      kind: "list",
      ordered: false,
      items: Object.freeze([
        Object.freeze({ children: Object.freeze([listedParagraph]) }),
      ]),
    }) satisfies SemanticBlock;
    const emptyParagraph = Object.freeze({
      kind: "paragraph",
      children: Object.freeze([]),
    }) satisfies SemanticBlock;
    const locatedQuote = locatedBlock(documentId, quote, 0);
    const locatedQuotedParagraph = locatedBlock(documentId, quotedParagraph, 6);
    const locatedList = locatedBlock(documentId, list, 0);
    const locatedListedParagraph = locatedBlock(documentId, listedParagraph, 6);
    const locatedEmpty = locatedBlock(documentId, emptyParagraph, 0);
    const mapper = new SemanticDomRangeMapper();

    render(
      <SemanticDocumentContent
        document={documentWith(documentId, [quote, list, emptyParagraph])}
        domRangeMapper={mapper}
        locatedBlocks={[
          locatedQuote,
          locatedQuotedParagraph,
          locatedList,
          locatedListedParagraph,
          locatedEmpty,
        ]}
      />,
    );

    expect(mapper.registrationCount).toBe(5);
    for (const structural of [locatedQuote, locatedList, locatedEmpty]) {
      const range = mapper.rangeFor(structural, 0);
      expect(range).toBeDefined();
      expect(mapper.positionFor(range!)?.locatedBlock).toBe(structural);
      expect(mapper.positionFor(range!)?.textOffsetCodePoints).toBe(0);
      expect(mapper.rangeFor(structural, 1)).toBeUndefined();
    }

    const quotedText = screen.getByText("Quoted").firstChild;
    if (!(quotedText instanceof Text)) {
      throw new Error("expected quoted publication text");
    }
    const quotedMiddle = document.createRange();
    quotedMiddle.setStart(quotedText, 3);
    quotedMiddle.collapse(true);
    expect(mapper.positionFor(quotedMiddle)).toEqual({
      locatedBlock: locatedQuotedParagraph,
      textOffsetCodePoints: 3,
    });
  });

  it("converts astral boundaries across sparse text checkpoints", () => {
    const documentId = "document:dom-mapper-checkpoint" as ContentDocumentId;
    const longText = `${"a".repeat(4_096)}😀b`;
    const paragraph = Object.freeze({
      kind: "paragraph",
      children: Object.freeze([text(longText)]),
    }) satisfies SemanticBlock;
    const located = locatedBlock(documentId, paragraph, 4_098);
    const mapper = new SemanticDomRangeMapper();

    render(
      <SemanticDocumentContent
        document={documentWith(documentId, [paragraph])}
        domRangeMapper={mapper}
        locatedBlocks={[located]}
      />,
    );

    expect(mapper.rangeFor(located, 4_096)?.startOffset).toBe(4_096);
    expect(mapper.rangeFor(located, 4_097)?.startOffset).toBe(4_098);
    expect(mapper.rangeFor(located, 4_098)?.startOffset).toBe(4_099);

    const textNode = screen.getByText(longText).firstChild;
    if (!(textNode instanceof Text)) {
      throw new Error("expected checkpoint publication text");
    }
    const insideAstral = document.createRange();
    insideAstral.setStart(textNode, 4_097);
    insideAstral.collapse(true);
    expect(mapper.positionFor(insideAstral)).toBeUndefined();
  });

  it("rejects malformed ranges, mismatched registrations, and stale nodes", () => {
    const documentId = "document:dom-mapper-stale" as ContentDocumentId;
    const paragraph = Object.freeze({
      kind: "paragraph",
      children: Object.freeze([text("Stable")]),
    }) satisfies SemanticBlock;
    const located = locatedBlock(documentId, paragraph, 6);
    const mapper = new SemanticDomRangeMapper();
    const rendered = render(
      <SemanticDocumentContent
        document={documentWith(documentId, [paragraph])}
        domRangeMapper={mapper}
        locatedBlocks={[located]}
      />,
    );

    expect(mapper.rangeFor(located, -1)).toBeUndefined();
    expect(mapper.rangeFor(located, 1.5)).toBeUndefined();
    expect(mapper.rangeFor(located, 7)).toBeUndefined();

    const external = document.createElement("p");
    external.textContent = "External";
    document.body.append(external);
    const externalRange = document.createRange();
    externalRange.setStart(external.firstChild!, 1);
    externalRange.collapse(true);
    expect(mapper.positionFor(externalRange)).toBeUndefined();
    external.remove();

    const nonCollapsed = mapper.rangeFor(located, 0)!;
    const paragraphText = screen.getByText("Stable").firstChild;
    if (!(paragraphText instanceof Text)) {
      throw new Error("expected stable publication text");
    }
    nonCollapsed.setEnd(paragraphText, 1);
    expect(mapper.positionFor(nonCollapsed)).toBeUndefined();

    const wrongElement = document.createElement("h1");
    wrongElement.textContent = "Stable";
    document.body.append(wrongElement);
    const unregisterWrong = mapper.registerBlock(wrongElement, located);
    expect(mapper.registrationCount).toBe(1);
    unregisterWrong();
    wrongElement.remove();

    const wrongLength = locatedBlock(documentId, paragraph, 5);
    const unregisterWrongLength = mapper.registerBlock(
      screen.getByText("Stable"),
      wrongLength,
    );
    expect(mapper.registrationCount).toBe(1);
    expect(mapper.rangeFor(wrongLength, 0)).toBeUndefined();
    unregisterWrongLength();

    const staleRange = mapper.rangeFor(located, 3)!;
    rendered.unmount();
    expect(mapper.registrationCount).toBe(0);
    expect(mapper.rangeFor(located, 3)).toBeUndefined();
    expect(mapper.positionFor(staleRange)).toBeUndefined();

    mapper.clear();
    mapper.clear();
    mapper.close();
    mapper.close();
    expect(mapper.registrationCount).toBe(0);
  });

  it("clears replaced registrations without removing the current block", () => {
    const documentId = "document:dom-mapper-replace" as ContentDocumentId;
    const paragraph = Object.freeze({
      kind: "paragraph",
      children: Object.freeze([text("Replace")]),
    }) satisfies SemanticBlock;
    const located = locatedBlock(documentId, paragraph, 7);
    const first = document.createElement("p");
    const second = document.createElement("p");
    first.textContent = "Replace";
    second.textContent = "Replace";
    document.body.append(first, second);
    const mapper = new SemanticDomRangeMapper();

    const unregisterFirst = mapper.registerBlock(first, located);
    const unregisterSecond = mapper.registerBlock(second, located);
    expect(mapper.registrationCount).toBe(1);
    expect(mapper.rangeFor(located, 7)?.startContainer).toBe(second.firstChild);

    unregisterFirst();
    expect(mapper.registrationCount).toBe(1);
    unregisterSecond();
    expect(mapper.registrationCount).toBe(0);

    first.remove();
    second.remove();
  });
});
