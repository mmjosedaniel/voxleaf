import { createIndex, createSpineItemId, decodeBookV1 } from "@voxleaf/shared";
import { describe, expect, it } from "vitest";

import { EpubArchiveError } from "../archive/archive-error.js";
import type {
  ContentDocumentId,
  PublicationLocatedBlock,
  SemanticBlock,
  SemanticDocument,
  SensitivePublicationText,
} from "../document/document-model.js";
import type { XhtmlDocumentProjection } from "../document/xhtml-projector.js";
import { createEpubProcessingBudget } from "../security/processing-budget.js";
import { createPublicationLocatorIndex } from "./locator-index.js";
import {
  createPublicationTargetIndex,
  resolvePublicationTarget,
} from "./target-resolver.js";

const PRIVATE_FRAGMENT = "private fragment outside locator grammar";

describe("semantic publication target resolution", () => {
  it("resolves document starts and unique source fragments to canonical locators", () => {
    const projections = Object.freeze([
      spineProjection(
        0,
        ["Document start", "Exact target", "Generated locator target"],
        [undefined, "exact.anchor", PRIVATE_FRAGMENT],
      ),
      spineProjection(1, [], []),
      nonSpineProjection(9, ["Non-spine content"], ["nonspine.anchor"]),
    ]);
    const { locatorIndex, targetIndex } = indexes(projections, 2);
    const first = requiredBlock(locatorIndex.spines[0]?.blocks[0]);
    const exactTarget = requiredBlock(locatorIndex.spines[0]?.blocks[1]);
    const generatedTarget = requiredBlock(locatorIndex.spines[0]?.blocks[2]);

    const documentStart = resolvePublicationTarget(
      targetIndex,
      { documentId: "document:0" },
      createEpubProcessingBudget(),
    );
    expect(documentStart).toEqual({
      status: "exact",
      reason: "document-start",
      locator: first.startLocator,
      locatedBlock: first,
    });

    const fragment = resolvePublicationTarget(
      targetIndex,
      { documentId: "document:0", fragment: "exact.anchor" },
      createEpubProcessingBudget(),
    );
    expect(fragment).toEqual({
      status: "exact",
      reason: "fragment",
      locator: exactTarget.startLocator,
      locatedBlock: exactTarget,
    });

    const generated = resolvePublicationTarget(
      targetIndex,
      { documentId: "document:0", fragment: PRIVATE_FRAGMENT },
      createEpubProcessingBudget(),
    );
    expect(generated).toEqual({
      status: "exact",
      reason: "fragment",
      locator: generatedTarget.startLocator,
      locatedBlock: generatedTarget,
    });
    if (generated.status === "unavailable") {
      throw new Error("expected exact generated-locator target");
    }
    expect(generated.locator.anchor.value).not.toBe(PRIVATE_FRAGMENT);
    expect(JSON.stringify(generated)).not.toContain(PRIVATE_FRAGMENT);

    for (const resolution of [documentStart, fragment, generated]) {
      expect(Object.isFrozen(resolution)).toBe(true);
      if (resolution.status === "unavailable") {
        throw new Error("expected an available target resolution");
      }
      expect(resolution.locator).toBe(resolution.locatedBlock.startLocator);
    }
  });

  it("recovers an unresolved fragment only to the same document start", () => {
    const projections = Object.freeze([
      spineProjection(0, ["First start", "Later"], ["first", undefined]),
      spineProjection(1, ["Other document"], ["other"]),
    ]);
    const { locatorIndex, targetIndex } = indexes(projections, 2);
    const first = requiredBlock(locatorIndex.spines[0]?.blocks[0]);

    const resolution = resolvePublicationTarget(
      targetIndex,
      { documentId: "document:0", fragment: "missing-private-fragment" },
      createEpubProcessingBudget(),
    );

    expect(resolution).toEqual({
      status: "recovered",
      reason: "fragment-unresolved",
      locator: first.startLocator,
      locatedBlock: first,
    });
    if (resolution.status === "unavailable") {
      throw new Error("expected recovered target resolution");
    }
    expect(resolution.locatedBlock.documentId).toBe("document:0");
    expect(Object.isFrozen(resolution)).toBe(true);
  });

  it("returns fixed unavailable outcomes without target details or fabricated locators", () => {
    const projections = Object.freeze([
      spineProjection(0, ["Available"], ["available"]),
      spineProjection(1, [], []),
      nonSpineProjection(9, ["Private non-spine prose"], ["private.anchor"]),
    ]);
    const { targetIndex } = indexes(projections, 2);

    const cases = [
      {
        input: { documentId: "document:missing" },
        reason: "unknown-document",
      },
      { input: { documentId: "document:9" }, reason: "non-spine-document" },
      { input: { documentId: "document:1" }, reason: "empty-document" },
      { input: null, reason: "invalid-target" },
      { input: {}, reason: "invalid-target" },
      { input: { documentId: 1 }, reason: "invalid-target" },
      {
        input: { documentId: "document:0", fragment: 1 },
        reason: "invalid-target",
      },
      {
        input: {
          documentId: "document:0",
          privateText: "private-unavailable-canary",
        },
        reason: "invalid-target",
      },
      {
        input: Object.create({ documentId: "document:0" }),
        reason: "invalid-target",
      },
    ] as const;

    for (const { input, reason } of cases) {
      const resolution = resolvePublicationTarget(
        targetIndex,
        input,
        createEpubProcessingBudget(),
      );
      expect(resolution).toEqual({ status: "unavailable", reason });
      expect(Object.keys(resolution)).toEqual(["status", "reason"]);
      expect(JSON.stringify(resolution)).not.toContain("private");
      expect(Object.isFrozen(resolution)).toBe(true);
    }
  });

  it("rejects accessor and hostile proxy inputs without exposing thrown values", () => {
    const { targetIndex } = indexes(
      Object.freeze([spineProjection(0, ["Available"], ["available"])]),
      1,
    );
    const accessor = {};
    Object.defineProperty(accessor, "documentId", {
      enumerable: true,
      get: () => {
        throw new Error("private-accessor-canary");
      },
    });
    const proxy = new Proxy(
      {},
      {
        ownKeys: () => {
          throw new Error("private-proxy-canary");
        },
      },
    );

    for (const input of [accessor, proxy]) {
      const resolution = resolvePublicationTarget(
        targetIndex,
        input,
        createEpubProcessingBudget(),
      );
      expect(resolution).toEqual({
        status: "unavailable",
        reason: "invalid-target",
      });
      expect(JSON.stringify(resolution)).not.toContain("canary");
    }
  });

  it("honors operation cancellation without returning a partial resolution", async () => {
    const { targetIndex } = indexes(
      Object.freeze([spineProjection(0, ["Private prose"], ["target"])]),
      1,
    );
    const controller = new AbortController();
    controller.abort("private-cancellation-canary");

    await expectFixedError(
      () =>
        resolvePublicationTarget(
          targetIndex,
          { documentId: "document:0" },
          createEpubProcessingBudget({ signal: controller.signal }),
        ),
      "cancelled",
    );
  });
});

function indexes(
  projections: readonly XhtmlDocumentProjection[],
  spineCount: number,
) {
  const locatorIndex = createPublicationLocatorIndex(
    bookWithSpines(spineCount),
    projections,
    createEpubProcessingBudget(),
  );
  return Object.freeze({
    locatorIndex,
    targetIndex: createPublicationTargetIndex(
      projections,
      locatorIndex,
      createEpubProcessingBudget(),
    ),
  });
}

function spineProjection(
  spineIndex: number,
  values: readonly string[],
  sourceElementIds: readonly (string | undefined)[],
): XhtmlDocumentProjection {
  return projection(
    `document:${String(spineIndex)}`,
    Object.freeze({
      kind: "spine" as const,
      spineItemId: createSpineItemId(`spine:${String(spineIndex)}`),
      spineItemIndex: createIndex(spineIndex),
    }),
    values,
    sourceElementIds,
  );
}

function nonSpineProjection(
  documentIndex: number,
  values: readonly string[],
  sourceElementIds: readonly (string | undefined)[],
): XhtmlDocumentProjection {
  return projection(
    `document:${String(documentIndex)}`,
    Object.freeze({ kind: "non-spine" as const }),
    values,
    sourceElementIds,
  );
}

function projection(
  documentId: string,
  location: SemanticDocument["location"],
  values: readonly string[],
  sourceElementIds: readonly (string | undefined)[],
): XhtmlDocumentProjection {
  if (values.length !== sourceElementIds.length) {
    throw new Error("test source IDs must match block count");
  }
  const blocks = Object.freeze(values.map(paragraph));
  const document = Object.freeze({
    id: documentId as ContentDocumentId,
    location,
    blocks,
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

function requiredBlock(
  block: PublicationLocatedBlock | undefined,
): PublicationLocatedBlock {
  if (block === undefined) {
    throw new Error("expected located block");
  }
  return block;
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
    metadata: { title: "Synthetic target book", authors: [] },
    resources,
    spine: resources.map((resource, index) => ({
      id: `spine:${String(index)}`,
      index,
      resourcePath: resource.path,
    })),
    navigation: [],
  });
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
  expect(JSON.stringify(captured)).not.toContain("private");
}
