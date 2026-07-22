import {
  createIndex,
  createSpineItemId,
  decodeBookV1,
  decodeReadingLocatorV1,
} from "@voxleaf/shared";
import type { ReadingLocatorV1 } from "@voxleaf/shared";
import { describe, expect, it } from "vitest";

import { EpubArchiveError } from "../archive/archive-error.js";
import type {
  ContentDocumentId,
  SemanticBlock,
  SemanticDocument,
  SensitivePublicationText,
} from "../document/document-model.js";
import type { XhtmlDocumentProjection } from "../document/xhtml-projector.js";
import { createEpubProcessingBudget } from "../security/processing-budget.js";
import {
  createBlockLocatorAtOffset,
  createPublicationLocatorIndex,
} from "./locator-index.js";
import { resolvePublicationLocator } from "./locator-resolver.js";

describe("publication locator resolution", () => {
  it("resolves every authoritative identity field and legal offset exactly", () => {
    const index = createIndexForDocuments([
      documentProjection(0, ["Alpha😀"], ["first.anchor"]),
      documentProjection(1, ["Beta"], ["second.anchor"]),
    ]);
    const target = requiredBlock(index.blocks[0]);
    const input = decodeReadingLocatorV1({
      ...createBlockLocatorAtOffset(target, 6),
      progression: 0.25,
    });

    const resolution = resolvePublicationLocator(
      index,
      input,
      createEpubProcessingBudget(),
    );

    expect(resolution).toEqual({
      status: "exact",
      reason: "exact",
      locator: createBlockLocatorAtOffset(target, 6),
      locatedBlock: target,
    });
    expect(resolution.locator.progression).toBeUndefined();
    expect(Object.isFrozen(resolution)).toBe(true);
    expect(Object.isFrozen(resolution.locator)).toBe(true);
    expect(resolution.locatedBlock).toBe(target);
  });

  it("clamps an excessive offset on an exact anchor", () => {
    const index = createIndexForDocuments([
      documentProjection(0, ["A😀e\u0301"], ["unicode.anchor"]),
    ]);
    const target = requiredBlock(index.blocks[0]);
    const input = locatorWith(target.startLocator, {
      textOffsetCodePoints: 99,
    });

    const resolution = resolvePublicationLocator(
      index,
      input,
      createEpubProcessingBudget(),
    );

    expect(resolution.status).toBe("recovered");
    expect(resolution.reason).toBe("nearest-offset");
    expect(resolution.locator.textOffsetCodePoints).toBe(4);
    expect(resolution.locatedBlock).toBe(target);
  });

  it("prefers a matching anchor value before nearest structural order", () => {
    const index = createIndexForDocuments([
      documentProjection(
        0,
        ["First", "Second", "Third"],
        ["first.anchor", "stable.anchor", "third.anchor"],
      ),
    ]);
    const stable = requiredBlock(index.blocks[1]);
    const input = locatorWith(stable.startLocator, {
      anchor: Object.freeze({
        ...stable.startLocator.anchor,
        anchorIndex: createIndex(2),
      }),
      textOffsetCodePoints: 99,
    });

    const resolution = resolvePublicationLocator(
      index,
      input,
      createEpubProcessingBudget(),
    );

    expect(resolution.status).toBe("recovered");
    expect(resolution.reason).toBe("nearest-anchor");
    expect(resolution.locatedBlock).toBe(stable);
    expect(resolution.locator.anchor.anchorIndex).toBe(1);
    expect(resolution.locator.textOffsetCodePoints).toBe(6);
  });

  it("uses the nearest anchor index when the anchor value is unavailable", () => {
    const index = createIndexForDocuments([
      documentProjection(
        0,
        ["First", "Second", "Third"],
        ["first.anchor", "second.anchor", "third.anchor"],
      ),
    ]);
    const first = requiredBlock(index.blocks[0]);
    const last = requiredBlock(index.blocks[2]);
    const input = locatorWith(first.startLocator, {
      anchor: Object.freeze({
        ...first.startLocator.anchor,
        value: "missing.anchor",
        anchorIndex: createIndex(99),
      }),
      textOffsetCodePoints: 2,
    });

    const resolution = resolvePublicationLocator(
      index,
      input,
      createEpubProcessingBudget(),
    );

    expect(resolution.status).toBe("recovered");
    expect(resolution.reason).toBe("nearest-anchor");
    expect(resolution.locatedBlock).toBe(last);
    expect(resolution.locator.textOffsetCodePoints).toBe(2);
  });

  it("moves an empty matching spine to the nearest non-empty spine with an earlier tie break", () => {
    const index = createIndexForDocuments([
      documentProjection(0, ["Before"], ["before.anchor"]),
      documentProjection(1, [], []),
      documentProjection(2, ["After"], ["after.anchor"]),
    ]);
    const input = locatorInputForSpine(index, 1, "missing.anchor", 0, 4);

    const resolution = resolvePublicationLocator(
      index,
      input,
      createEpubProcessingBudget(),
    );

    expect(resolution.status).toBe("recovered");
    expect(resolution.reason).toBe("nearest-spine");
    expect(resolution.locatedBlock).toBe(index.blocks[0]);
    expect(resolution.locator.textOffsetCodePoints).toBe(0);
  });

  it("uses book start when spine identity is inconsistent", () => {
    const index = createIndexForDocuments([
      documentProjection(0, ["Beginning"], ["begin.anchor"]),
      documentProjection(1, ["Later"], ["later.anchor"]),
    ]);
    const later = requiredBlock(index.blocks[1]);
    const input = locatorWith(later.startLocator, {
      spineItemId: createSpineItemId("spine:missing"),
      textOffsetCodePoints: 3,
    });

    const first = resolvePublicationLocator(
      index,
      input,
      createEpubProcessingBudget(),
    );
    const repeated = resolvePublicationLocator(
      index,
      input,
      createEpubProcessingBudget(),
    );

    expect(first).toEqual(repeated);
    expect(first.status).toBe("recovered");
    expect(first.reason).toBe("book-start");
    expect(first.locatedBlock).toBe(index.blocks[0]);
    expect(first.locator.textOffsetCodePoints).toBe(0);
  });

  it("never resolves a wrong-book or malformed locator", async () => {
    const index = createIndexForDocuments([
      documentProjection(0, ["private-canary"], ["private.anchor"]),
    ]);
    const target = requiredBlock(index.blocks[0]);
    const wrongBook = decodeReadingLocatorV1({
      ...target.startLocator,
      bookIdentity: {
        ...target.startLocator.bookIdentity,
        value: "1".repeat(64),
      },
    });

    await expectFixedError(
      () =>
        resolvePublicationLocator(
          index,
          wrongBook,
          createEpubProcessingBudget(),
        ),
      "locator-unresolved",
    );
    await expectFixedError(
      () =>
        resolvePublicationLocator(
          index,
          { privateText: "private-canary" },
          createEpubProcessingBudget(),
        ),
      "locator-unresolved",
    );
  });

  it("fails safely when the publication has no addressable position", async () => {
    const index = createIndexForDocuments([documentProjection(0, [], [])]);
    const input = locatorInputForSpine(index, 0, "missing.anchor", 0, 0);

    await expectFixedError(
      () =>
        resolvePublicationLocator(index, input, createEpubProcessingBudget()),
      "locator-unresolved",
    );
  });

  it("honors cancellation without returning a partial resolution", async () => {
    const index = createIndexForDocuments([
      documentProjection(0, ["private-canary"], ["private.anchor"]),
    ]);
    const controller = new AbortController();
    const budget = createEpubProcessingBudget({ signal: controller.signal });
    controller.abort("private-canary");

    await expectFixedError(
      () =>
        resolvePublicationLocator(
          index,
          requiredBlock(index.blocks[0]).startLocator,
          budget,
        ),
      "cancelled",
    );
  });

  it("honors the shared processing deadline", async () => {
    const index = createIndexForDocuments([
      documentProjection(0, ["private-canary"], ["private.anchor"]),
    ]);
    let nowMs = 0;
    const budget = createEpubProcessingBudget({
      clock: Object.freeze({ now: () => nowMs }),
    });
    nowMs = budget.policy.maxProcessingTimeMs + 1;

    await expectFixedError(
      () =>
        resolvePublicationLocator(
          index,
          requiredBlock(index.blocks[0]).startLocator,
          budget,
        ),
      "cancelled",
    );
  });
});

function createIndexForDocuments(
  projections: readonly XhtmlDocumentProjection[],
) {
  return createPublicationLocatorIndex(
    bookWithSpines(projections.length),
    projections,
    createEpubProcessingBudget(),
  );
}

function documentProjection(
  spineIndex: number,
  values: readonly string[],
  sourceElementIds: readonly string[],
): XhtmlDocumentProjection {
  const blocks = values.map((value) => paragraph(value));
  const document = Object.freeze({
    id: `document:${String(spineIndex)}` as ContentDocumentId,
    location: Object.freeze({
      kind: "spine" as const,
      spineItemId: createSpineItemId(`spine:${String(spineIndex)}`),
      spineItemIndex: createIndex(spineIndex),
    }),
    blocks: Object.freeze(blocks),
  } satisfies SemanticDocument);
  return Object.freeze({
    document,
    addressableBlocks: Object.freeze(
      blocks.map((block, index) =>
        Object.freeze({
          block,
          ...(sourceElementIds[index] === undefined
            ? {}
            : { sourceElementId: sourceElementIds[index] }),
        }),
      ),
    ),
  });
}

function paragraph(value: string): SemanticBlock {
  return Object.freeze({
    kind: "paragraph",
    children: Object.freeze([
      Object.freeze({
        kind: "text",
        text: value as SensitivePublicationText,
      }),
    ]),
  });
}

function bookWithSpines(spineCount: number) {
  const resources = Array.from({ length: spineCount }, (_, index) => ({
    path: `chapter-${String(index)}.xhtml`,
    mediaType: "application/xhtml+xml",
    role: "content-document",
  }));
  return decodeBookV1({
    schemaVersion: 1,
    identity: {
      scheme: "sha256",
      schemeVersion: 1,
      value: "0".repeat(64),
    },
    metadata: { title: "Synthetic locator book", authors: [] },
    resources,
    spine: resources.map((resource, index) => ({
      id: `spine:${String(index)}`,
      index,
      resourcePath: resource.path,
    })),
    navigation: [],
  });
}

function locatorWith(
  locator: ReadingLocatorV1,
  overrides: Readonly<Record<string, unknown>>,
): ReadingLocatorV1 {
  return decodeReadingLocatorV1({ ...locator, ...overrides });
}

function locatorInputForSpine(
  index: ReturnType<typeof createIndexForDocuments>,
  spineItemIndex: number,
  anchorValue: string,
  anchorIndex: number,
  textOffsetCodePoints: number,
): ReadingLocatorV1 {
  const spine = index.spines[spineItemIndex];
  if (spine === undefined) {
    throw new Error("expected located spine");
  }
  return decodeReadingLocatorV1({
    schemaVersion: 1,
    bookIdentity: index.bookIdentity,
    spineItemId: spine.spineItemId,
    spineItemIndex: spine.spineItemIndex,
    anchor: {
      kind: "element-id",
      formatVersion: 1,
      value: anchorValue,
      anchorIndex,
    },
    textOffsetCodePoints,
  });
}

function requiredBlock(
  block:
    ReturnType<typeof createIndexForDocuments>["blocks"][number] | undefined,
) {
  if (block === undefined) {
    throw new Error("expected located block");
  }
  return block;
}

async function expectFixedError(
  action: () => unknown,
  code: EpubArchiveError["code"],
): Promise<void> {
  let captured: unknown;
  try {
    await action();
  } catch (error: unknown) {
    captured = error;
  }
  expect(captured).toBeInstanceOf(EpubArchiveError);
  expect(captured).toMatchObject({ code, message: code });
  expect(captured).not.toHaveProperty("cause");
  expect(JSON.stringify(captured)).not.toContain("private-canary");
}
