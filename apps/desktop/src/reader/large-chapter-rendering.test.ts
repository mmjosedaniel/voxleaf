import type {
  ContentDocumentId,
  SemanticBlock,
  SemanticDocument,
  SemanticInline,
} from "@voxleaf/epub";
import { describe, expect, it, vi } from "vitest";

import {
  assessSemanticDocumentRendering,
  LARGE_CHAPTER_BATCH_SIZE_BLOCKS,
  LARGE_CHAPTER_BLOCK_LIMIT,
  LARGE_CHAPTER_DOM_NODE_LIMIT,
  LargeChapterRenderScheduler,
  type ScheduleLargeChapterYield,
} from "./large-chapter-rendering";

const EMPTY_PARAGRAPH = Object.freeze({
  kind: "paragraph",
  children: Object.freeze([]),
}) satisfies SemanticBlock;
const LINE_BREAK = Object.freeze({
  kind: "line-break",
}) satisfies SemanticInline;

function documentWith(blocks: readonly SemanticBlock[]): SemanticDocument {
  return Object.freeze({
    id: "document:large-chapter-policy" as ContentDocumentId,
    location: Object.freeze({ kind: "non-spine" }),
    blocks: Object.freeze(blocks),
  });
}

describe("large-chapter capacity policy", () => {
  it("accepts the exact semantic-block limit and rejects the next block", () => {
    const exactBlocks = Object.freeze(
      Array.from({ length: LARGE_CHAPTER_BLOCK_LIMIT }, () => EMPTY_PARAGRAPH),
    );
    const aboveBlocks = Object.freeze([...exactBlocks, EMPTY_PARAGRAPH]);

    expect(assessSemanticDocumentRendering(documentWith(exactBlocks))).toEqual({
      status: "accepted",
      semanticBlockCount: 10_000,
      projectedDomNodeCount: 10_001,
    });
    expect(assessSemanticDocumentRendering(documentWith(aboveBlocks))).toEqual({
      status: "chapter-too-large",
      reason: "semantic-block-limit",
      semanticBlockCount: 10_001,
      projectedDomNodeCount: 10_001,
    });
  });

  it("counts nested semantic blocks rather than only document children", () => {
    const nested = Object.freeze({
      kind: "block-quote",
      children: Object.freeze(
        Array.from(
          { length: LARGE_CHAPTER_BLOCK_LIMIT - 1 },
          () => EMPTY_PARAGRAPH,
        ),
      ),
    }) satisfies SemanticBlock;
    const aboveNested = Object.freeze({
      kind: "block-quote",
      children: Object.freeze([...nested.children, EMPTY_PARAGRAPH]),
    }) satisfies SemanticBlock;

    expect(
      assessSemanticDocumentRendering(documentWith([nested])),
    ).toMatchObject({
      status: "accepted",
      semanticBlockCount: 10_000,
    });
    expect(
      assessSemanticDocumentRendering(documentWith([aboveNested])),
    ).toMatchObject({
      status: "chapter-too-large",
      reason: "semantic-block-limit",
      semanticBlockCount: 10_001,
    });
  });

  it("accepts exactly 80,000 projected nodes and rejects node 80,001", () => {
    const exactParagraph = Object.freeze({
      kind: "paragraph",
      children: Object.freeze(
        Array.from(
          { length: LARGE_CHAPTER_DOM_NODE_LIMIT - 2 },
          () => LINE_BREAK,
        ),
      ),
    }) satisfies SemanticBlock;
    const aboveParagraph = Object.freeze({
      kind: "paragraph",
      children: Object.freeze([...exactParagraph.children, LINE_BREAK]),
    }) satisfies SemanticBlock;

    expect(
      assessSemanticDocumentRendering(documentWith([exactParagraph])),
    ).toEqual({
      status: "accepted",
      semanticBlockCount: 1,
      projectedDomNodeCount: 80_000,
    });
    expect(
      assessSemanticDocumentRendering(documentWith([aboveParagraph])),
    ).toEqual({
      status: "chapter-too-large",
      reason: "projected-dom-node-limit",
      semanticBlockCount: 1,
      projectedDomNodeCount: 80_001,
    });
  });
});

describe("large-chapter render scheduler", () => {
  it("publishes at most 250 additional blocks after each browser yield", () => {
    const pending: Array<{
      readonly resume: () => void;
      cancelled: boolean;
    }> = [];
    const schedule: ScheduleLargeChapterYield = (resume) => {
      const entry = { resume, cancelled: false };
      pending.push(entry);
      return () => {
        entry.cancelled = true;
      };
    };
    const scheduler = new LargeChapterRenderScheduler(501, schedule);
    const listener = vi.fn();

    expect(LARGE_CHAPTER_BATCH_SIZE_BLOCKS).toBe(250);
    expect(scheduler.getSnapshot()).toBe(250);
    const unsubscribe = scheduler.subscribe(listener);
    expect(pending).toHaveLength(1);

    pending[0]!.resume();
    expect(scheduler.getSnapshot()).toBe(500);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(pending).toHaveLength(2);

    pending[1]!.resume();
    expect(scheduler.getSnapshot()).toBe(501);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(pending).toHaveLength(2);

    unsubscribe();
  });

  it("cancels pending work and ignores a stale callback after release", () => {
    const pending: Array<{
      readonly resume: () => void;
      cancelled: boolean;
    }> = [];
    const schedule: ScheduleLargeChapterYield = (resume) => {
      const entry = { resume, cancelled: false };
      pending.push(entry);
      return () => {
        entry.cancelled = true;
      };
    };
    const scheduler = new LargeChapterRenderScheduler(500, schedule);
    const listener = vi.fn();
    const unsubscribe = scheduler.subscribe(listener);

    unsubscribe();
    expect(pending[0]?.cancelled).toBe(true);
    pending[0]?.resume();
    expect(scheduler.getSnapshot()).toBe(250);
    expect(listener).not.toHaveBeenCalled();
  });
});
