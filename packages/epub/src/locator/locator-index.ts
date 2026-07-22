import {
  createIndex,
  decodeReadingLocatorV1,
  LocatorContractError,
} from "@voxleaf/shared";
import type {
  BookIdentityV1,
  BookV1,
  Index,
  ReadingLocatorV1,
  SpineItemId,
  SpineItemV1,
} from "@voxleaf/shared";

import { EpubArchiveError } from "../archive/archive-error.js";
import type { EpubProcessingBudget } from "../security/processing-budget.js";
import type {
  ContentDocumentId,
  SemanticBlock,
  SemanticInline,
} from "../document/document-model.js";
import type {
  ProjectedAddressableBlock,
  XhtmlDocumentProjection,
} from "../document/xhtml-projector.js";

const LOCATOR_SCHEMA_VERSION = 1;
const ANCHOR_FORMAT_VERSION = 1;
const TEXT_CHECKPOINT_INTERVAL = 4_096;

export interface LocatedSemanticBlock {
  readonly documentId: ContentDocumentId;
  readonly block: SemanticBlock;
  readonly startLocator: ReadingLocatorV1;
  readonly textLengthCodePoints: Index;
}

export interface LocatedSpineItem {
  readonly spineItemId: SpineItemId;
  readonly spineItemIndex: Index;
  readonly blocks: readonly LocatedSemanticBlock[];
}

export interface PublicationLocatorIndex {
  readonly bookIdentity: BookIdentityV1;
  readonly spines: readonly LocatedSpineItem[];
  readonly blocks: readonly LocatedSemanticBlock[];
}

function fail(code: "internal-failure" | "locator-unresolved"): never {
  throw new EpubArchiveError(code);
}

function locatorInput(
  book: BookV1,
  spineItem: SpineItemV1,
  anchorValue: string,
  anchorIndex: number,
  textOffsetCodePoints: number,
) {
  return {
    schemaVersion: LOCATOR_SCHEMA_VERSION,
    bookIdentity: book.identity,
    spineItemId: spineItem.id,
    spineItemIndex: spineItem.index,
    anchor: {
      kind: "element-id",
      formatVersion: ANCHOR_FORMAT_VERSION,
      value: anchorValue,
      anchorIndex,
    },
    textOffsetCodePoints,
  } as const;
}

function trySourceLocator(
  book: BookV1,
  spineItem: SpineItemV1,
  anchorValue: string,
  anchorIndex: number,
): ReadingLocatorV1 | undefined {
  try {
    return decodeReadingLocatorV1(
      locatorInput(book, spineItem, anchorValue, anchorIndex, 0),
    );
  } catch (error: unknown) {
    if (error instanceof LocatorContractError) {
      return undefined;
    }
    return fail("internal-failure");
  }
}

function createRequiredLocator(
  book: BookV1,
  spineItem: SpineItemV1,
  anchorValue: string,
  anchorIndex: number,
  textOffsetCodePoints: number,
): ReadingLocatorV1 {
  try {
    return decodeReadingLocatorV1(
      locatorInput(
        book,
        spineItem,
        anchorValue,
        anchorIndex,
        textOffsetCodePoints,
      ),
    );
  } catch {
    return fail("internal-failure");
  }
}

function generatedAnchorValue(
  spineItemIndex: number,
  anchorIndex: number,
  reserved: ReadonlySet<string>,
  budget: EpubProcessingBudget,
): string {
  const base = `voxleaf-s${String(spineItemIndex)}-a${String(anchorIndex)}`;
  let candidate = base;
  let collisionIndex = 0;
  while (reserved.has(candidate)) {
    budget.checkpoint();
    collisionIndex += 1;
    candidate = `${base}-${String(collisionIndex)}`;
  }
  return candidate;
}

function collectBlocks(
  blocks: readonly SemanticBlock[],
  output: SemanticBlock[],
): void {
  for (const block of blocks) {
    output.push(block);
    if (block.kind === "block-quote") {
      collectBlocks(block.children, output);
    } else if (block.kind === "list") {
      for (const item of block.items) {
        collectBlocks(item.children, output);
      }
    }
  }
}

function assertProjectionOrder(projection: XhtmlDocumentProjection): void {
  const expected: SemanticBlock[] = [];
  collectBlocks(projection.document.blocks, expected);
  if (expected.length !== projection.addressableBlocks.length) {
    return fail("internal-failure");
  }
  for (const [index, block] of expected.entries()) {
    if (projection.addressableBlocks[index]?.block !== block) {
      return fail("internal-failure");
    }
  }
}

function countTextCodePoints(
  text: string,
  budget: EpubProcessingBudget,
): number {
  let count = 0;
  for (let index = 0; index < text.length; index += 1) {
    const codePoint = text.codePointAt(index);
    if (codePoint === undefined) {
      return fail("internal-failure");
    }
    if (codePoint > 0xffff) {
      index += 1;
    }
    count += 1;
    if (count % TEXT_CHECKPOINT_INTERVAL === 0) {
      budget.checkpoint();
    }
  }
  return count;
}

function addLengths(left: number, right: number): number {
  const result = left + right;
  if (!Number.isSafeInteger(result)) {
    return fail("internal-failure");
  }
  return result;
}

function inlineTextLengthCodePoints(
  inlines: readonly SemanticInline[],
  budget: EpubProcessingBudget,
): number {
  let count = 0;
  for (const inline of inlines) {
    budget.checkpoint();
    switch (inline.kind) {
      case "text":
        count = addLengths(
          count,
          countTextCodePoints(String(inline.text), budget),
        );
        break;
      case "line-break":
      case "raster-image":
        // The final text representation uses one newline or object-replacement
        // position respectively; alternative text does not redefine position.
        count = addLengths(count, 1);
        break;
      case "code":
      case "emphasis":
      case "internal-link":
      case "strong":
        count = addLengths(
          count,
          inlineTextLengthCodePoints(inline.children, budget),
        );
        break;
    }
  }
  return count;
}

function blockTextLengthCodePoints(
  block: SemanticBlock,
  budget: EpubProcessingBudget,
): Index {
  const length =
    block.kind === "heading" || block.kind === "paragraph"
      ? inlineTextLengthCodePoints(block.children, budget)
      : // Structural containers have a start position only. Their child blocks
        // own all descendant text offsets.
        0;
  return createIndex(length);
}

function sourceCandidateCounts(
  blocks: readonly ProjectedAddressableBlock[],
): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();
  for (const block of blocks) {
    if (block.sourceElementId !== undefined) {
      counts.set(
        block.sourceElementId,
        (counts.get(block.sourceElementId) ?? 0) + 1,
      );
    }
  }
  return counts;
}

function locateDocumentBlocks(
  book: BookV1,
  spineItem: SpineItemV1,
  projection: XhtmlDocumentProjection,
  budget: EpubProcessingBudget,
): readonly LocatedSemanticBlock[] {
  assertProjectionOrder(projection);
  const counts = sourceCandidateCounts(projection.addressableBlocks);
  const locators: (ReadingLocatorV1 | undefined)[] = [];
  const reserved = new Set<string>();

  for (const [
    anchorIndex,
    projected,
  ] of projection.addressableBlocks.entries()) {
    budget.checkpoint();
    const candidate = projected.sourceElementId;
    const locator =
      candidate !== undefined && counts.get(candidate) === 1
        ? trySourceLocator(book, spineItem, candidate, anchorIndex)
        : undefined;
    locators.push(locator);
    if (locator !== undefined) {
      reserved.add(String(locator.anchor.value));
    }
  }

  return Object.freeze(
    projection.addressableBlocks.map((projected, anchorIndex) => {
      budget.checkpoint();
      let locator = locators[anchorIndex];
      if (locator === undefined) {
        const generated = generatedAnchorValue(
          spineItem.index,
          anchorIndex,
          reserved,
          budget,
        );
        reserved.add(generated);
        locator = createRequiredLocator(
          book,
          spineItem,
          generated,
          anchorIndex,
          0,
        );
      }
      return Object.freeze({
        documentId: projection.document.id,
        block: projected.block,
        startLocator: locator,
        textLengthCodePoints: blockTextLengthCodePoints(
          projected.block,
          budget,
        ),
      });
    }),
  );
}

export function createPublicationLocatorIndex(
  book: BookV1,
  projections: readonly XhtmlDocumentProjection[],
  budget: EpubProcessingBudget,
): PublicationLocatorIndex {
  const projectionsBySpineIndex = new Map<number, XhtmlDocumentProjection>();

  for (const projection of projections) {
    budget.checkpoint();
    assertProjectionOrder(projection);
    const location = projection.document.location;
    if (location.kind === "non-spine") {
      continue;
    }
    const spineItem = book.spine[location.spineItemIndex];
    if (
      spineItem === undefined ||
      spineItem.index !== location.spineItemIndex ||
      spineItem.id !== location.spineItemId ||
      projectionsBySpineIndex.has(location.spineItemIndex)
    ) {
      return fail("internal-failure");
    }
    projectionsBySpineIndex.set(location.spineItemIndex, projection);
  }

  const located: LocatedSemanticBlock[] = [];
  const locatedSpines: LocatedSpineItem[] = [];
  for (const spineItem of book.spine) {
    budget.checkpoint();
    const projection = projectionsBySpineIndex.get(spineItem.index);
    if (projection === undefined) {
      return fail("internal-failure");
    }
    const blocks = locateDocumentBlocks(book, spineItem, projection, budget);
    locatedSpines.push(
      Object.freeze({
        spineItemId: spineItem.id,
        spineItemIndex: spineItem.index,
        blocks,
      }),
    );
    located.push(...blocks);
  }

  return Object.freeze({
    bookIdentity: book.identity,
    spines: Object.freeze(locatedSpines),
    blocks: Object.freeze(located),
  });
}

export function createBlockLocatorAtOffset(
  located: LocatedSemanticBlock,
  textOffsetCodePoints: number,
): ReadingLocatorV1 {
  if (
    !Number.isSafeInteger(textOffsetCodePoints) ||
    textOffsetCodePoints < 0 ||
    textOffsetCodePoints > located.textLengthCodePoints
  ) {
    return fail("locator-unresolved");
  }
  if (textOffsetCodePoints === 0) {
    return located.startLocator;
  }
  try {
    return decodeReadingLocatorV1({
      ...located.startLocator,
      textOffsetCodePoints,
    });
  } catch {
    return fail("internal-failure");
  }
}
