import { decodeReadingLocatorV1, LocatorContractError } from "@voxleaf/shared";
import type { BookIdentityV1, ReadingLocatorV1 } from "@voxleaf/shared";

import { EpubArchiveError } from "../archive/archive-error.js";
import type { EpubProcessingBudget } from "../security/processing-budget.js";
import {
  createBlockLocatorAtOffset,
  type LocatedSemanticBlock,
  type LocatedSpineItem,
  type PublicationLocatorIndex,
} from "./locator-index.js";

export type LocatorRecoveryReason =
  "nearest-anchor" | "nearest-offset" | "nearest-spine" | "book-start";

export interface ExactLocatorResolution {
  readonly status: "exact";
  readonly reason: "exact";
  readonly locator: ReadingLocatorV1;
  readonly locatedBlock: LocatedSemanticBlock;
}

export interface RecoveredLocatorResolution {
  readonly status: "recovered";
  readonly reason: LocatorRecoveryReason;
  readonly locator: ReadingLocatorV1;
  readonly locatedBlock: LocatedSemanticBlock;
}

export type LocatorResolution =
  ExactLocatorResolution | RecoveredLocatorResolution;

function fail(code: "internal-failure" | "locator-unresolved"): never {
  throw new EpubArchiveError(code);
}

function decodeLocator(input: unknown): ReadingLocatorV1 {
  try {
    return decodeReadingLocatorV1(input);
  } catch (error: unknown) {
    if (error instanceof LocatorContractError) {
      return fail("locator-unresolved");
    }
    return fail("internal-failure");
  }
}

function bookIdentitiesMatch(
  left: BookIdentityV1,
  right: BookIdentityV1,
): boolean {
  return (
    left.scheme === right.scheme &&
    left.schemeVersion === right.schemeVersion &&
    left.value === right.value
  );
}

function findMatchingSpine(
  index: PublicationLocatorIndex,
  locator: ReadingLocatorV1,
  budget: EpubProcessingBudget,
): LocatedSpineItem | undefined {
  for (const spine of index.spines) {
    budget.checkpoint();
    if (
      spine.spineItemId === locator.spineItemId &&
      spine.spineItemIndex === locator.spineItemIndex
    ) {
      return spine;
    }
  }
  return undefined;
}

function findAnchorByValue(
  spine: LocatedSpineItem,
  locator: ReadingLocatorV1,
  budget: EpubProcessingBudget,
): LocatedSemanticBlock | undefined {
  for (const block of spine.blocks) {
    budget.checkpoint();
    if (block.startLocator.anchor.value === locator.anchor.value) {
      return block;
    }
  }
  return undefined;
}

function nearestAnchorByIndex(
  spine: LocatedSpineItem,
  locator: ReadingLocatorV1,
): LocatedSemanticBlock {
  const finalIndex = spine.blocks.length - 1;
  const targetIndex = Math.min(locator.anchor.anchorIndex, finalIndex);
  const block = spine.blocks[targetIndex];
  if (block === undefined) {
    return fail("internal-failure");
  }
  return block;
}

function firstAddressableBlock(
  index: PublicationLocatorIndex,
  budget: EpubProcessingBudget,
): LocatedSemanticBlock | undefined {
  for (const spine of index.spines) {
    budget.checkpoint();
    const block = spine.blocks[0];
    if (block !== undefined) {
      return block;
    }
  }
  return undefined;
}

function nearestAddressableSpine(
  index: PublicationLocatorIndex,
  spineItemIndex: number,
  budget: EpubProcessingBudget,
): LocatedSpineItem | undefined {
  let nearest: LocatedSpineItem | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const spine of index.spines) {
    budget.checkpoint();
    if (spine.blocks.length === 0) {
      continue;
    }
    const distance = Math.abs(spine.spineItemIndex - spineItemIndex);
    if (distance < nearestDistance) {
      nearest = spine;
      nearestDistance = distance;
    }
  }
  return nearest;
}

function resolvedLocator(
  locatedBlock: LocatedSemanticBlock,
  requestedOffset: number,
  preserveNearestOffset: boolean,
): ReadingLocatorV1 {
  const offset = preserveNearestOffset
    ? Math.min(requestedOffset, locatedBlock.textLengthCodePoints)
    : 0;
  return createBlockLocatorAtOffset(locatedBlock, offset);
}

function exactResolution(
  locatedBlock: LocatedSemanticBlock,
  requestedOffset: number,
): ExactLocatorResolution {
  return Object.freeze({
    status: "exact",
    reason: "exact",
    locator: resolvedLocator(locatedBlock, requestedOffset, true),
    locatedBlock,
  });
}

function recoveredResolution(
  locatedBlock: LocatedSemanticBlock,
  requestedOffset: number,
  reason: LocatorRecoveryReason,
  preserveNearestOffset: boolean,
): RecoveredLocatorResolution {
  return Object.freeze({
    status: "recovered",
    reason,
    locator: resolvedLocator(
      locatedBlock,
      requestedOffset,
      preserveNearestOffset,
    ),
    locatedBlock,
  });
}

/**
 * Resolves one untrusted locator against the immutable semantic locator index.
 * Recovery uses only structural identities and indexes; it never searches prose,
 * rendered pages, layout state, metadata, or publisher paths.
 */
export function resolvePublicationLocator(
  index: PublicationLocatorIndex,
  input: unknown,
  budget: EpubProcessingBudget,
): LocatorResolution {
  budget.checkpoint();
  const locator = decodeLocator(input);
  if (!bookIdentitiesMatch(index.bookIdentity, locator.bookIdentity)) {
    return fail("locator-unresolved");
  }

  const spine = findMatchingSpine(index, locator, budget);
  if (spine === undefined) {
    const bookStart = firstAddressableBlock(index, budget);
    if (bookStart === undefined) {
      return fail("locator-unresolved");
    }
    budget.checkpoint();
    return recoveredResolution(
      bookStart,
      locator.textOffsetCodePoints,
      "book-start",
      false,
    );
  }

  if (spine.blocks.length === 0) {
    const nearestSpine = nearestAddressableSpine(
      index,
      spine.spineItemIndex,
      budget,
    );
    const nearestBlock = nearestSpine?.blocks[0];
    if (nearestBlock === undefined) {
      return fail("locator-unresolved");
    }
    budget.checkpoint();
    return recoveredResolution(
      nearestBlock,
      locator.textOffsetCodePoints,
      "nearest-spine",
      false,
    );
  }

  const indexedAnchor = spine.blocks[locator.anchor.anchorIndex];
  const exactAnchor =
    indexedAnchor !== undefined &&
    indexedAnchor.startLocator.anchor.anchorIndex ===
      locator.anchor.anchorIndex &&
    indexedAnchor.startLocator.anchor.value === locator.anchor.value
      ? indexedAnchor
      : undefined;

  if (exactAnchor !== undefined) {
    budget.checkpoint();
    if (locator.textOffsetCodePoints <= exactAnchor.textLengthCodePoints) {
      return exactResolution(exactAnchor, locator.textOffsetCodePoints);
    }
    return recoveredResolution(
      exactAnchor,
      locator.textOffsetCodePoints,
      "nearest-offset",
      true,
    );
  }

  const matchingAnchor = findAnchorByValue(spine, locator, budget);
  const nearestAnchor = matchingAnchor ?? nearestAnchorByIndex(spine, locator);
  budget.checkpoint();
  return recoveredResolution(
    nearestAnchor,
    locator.textOffsetCodePoints,
    "nearest-anchor",
    true,
  );
}
