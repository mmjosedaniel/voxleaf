import { decodeBookV1 } from "../contracts/book.js";
import { decodeReadingLocatorV1 } from "../contracts/locator.js";
import type {
  BookIdentityV1,
  BookV1,
  LocalResourcePath,
  ReadingLocatorV1,
} from "../contracts/index.js";
import { createCount } from "../primitives/index.js";
import type { Count, Index, SpineItemId } from "../primitives/index.js";

export type SyntheticDocumentBlockKind =
  "heading" | "paragraph" | "dialogue" | "scene-boundary";

interface SyntheticTextBlock {
  readonly id: string;
  readonly locator: ReadingLocatorV1;
  readonly text: string;
}

export interface SyntheticHeadingBlock extends SyntheticTextBlock {
  readonly kind: "heading";
  readonly level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface SyntheticParagraphBlock extends SyntheticTextBlock {
  readonly kind: "paragraph";
}

export interface SyntheticDialogueBlock extends SyntheticTextBlock {
  readonly kind: "dialogue";
  readonly speaker: string;
}

export interface SyntheticSceneBoundaryBlock {
  readonly kind: "scene-boundary";
  readonly id: string;
  readonly locator: ReadingLocatorV1;
}

export type SyntheticDocumentBlock =
  | SyntheticHeadingBlock
  | SyntheticParagraphBlock
  | SyntheticDialogueBlock
  | SyntheticSceneBoundaryBlock;

export interface SyntheticSpineDocument {
  readonly spineItemId: SpineItemId;
  readonly spineItemIndex: Index;
  readonly blocks: readonly SyntheticDocumentBlock[];
}

export interface SyntheticLocalImageMetadata {
  readonly id: string;
  readonly resourcePath: LocalResourcePath;
  readonly altText: string;
}

export interface SyntheticDocumentFixture {
  readonly provenance: "synthetic";
  readonly name: string;
  readonly book: BookV1;
  readonly spineDocuments: readonly SyntheticSpineDocument[];
  readonly images: readonly SyntheticLocalImageMetadata[];
}

export interface InvalidSyntheticDocumentFixture {
  readonly provenance: "synthetic";
  readonly name:
    | "duplicate-spine-id"
    | "broken-navigation"
    | "invalid-locator-reference"
    | "remote-resource"
    | "malformed-book-structure";
  readonly bookInput?: unknown;
  readonly locatorInput?: unknown;
}

export type FakeDocumentSourceStep =
  | {
      readonly kind: "success";
      readonly fixture: SyntheticDocumentFixture;
    }
  | {
      readonly kind: "failure";
      readonly code: "scripted-failure";
    };

export type FakeDocumentSourceErrorCode =
  "scripted-failure" | "script-exhausted";

export class FakeDocumentSourceError extends Error {
  public readonly code: FakeDocumentSourceErrorCode;

  public constructor(code: FakeDocumentSourceErrorCode) {
    super("Fake document source could not provide a fixture.");
    this.name = "FakeDocumentSourceError";
    this.code = code;
  }
}

export interface FakeDocumentSource {
  load(): SyntheticDocumentFixture;
  getLoadCount(): Count;
  getRemainingStepCount(): Count;
}

const SYNTHETIC_BOOK_IDENTITY = Object.freeze({
  scheme: "synthetic-test",
  schemeVersion: 1,
  value: "synthetic-document-fixture",
});

function createSyntheticBookInput() {
  return {
    schemaVersion: 1,
    identity: { ...SYNTHETIC_BOOK_IDENTITY },
    metadata: {
      title: "Synthetic Navigation Exercise",
      authors: ["VoxLeaf Test Suite"],
    },
    resources: [
      {
        path: "text/arrival.xhtml",
        mediaType: "application/xhtml+xml",
        role: "content-document",
      },
      {
        path: "text/departure.xhtml",
        mediaType: "application/xhtml+xml",
        role: "content-document",
      },
      {
        path: "images/lantern.svg",
        mediaType: "image/svg+xml",
        role: "image",
      },
    ],
    spine: [
      {
        id: "spine:arrival",
        index: 0,
        resourcePath: "text/arrival.xhtml",
      },
      {
        id: "spine:departure",
        index: 1,
        resourcePath: "text/departure.xhtml",
      },
    ],
    navigation: [
      { label: "Arrival", targetSpineItemId: "spine:arrival" },
      { label: "Departure", targetSpineItemId: "spine:departure" },
    ],
  };
}

function createSyntheticLocatorInput(
  spineItemId: string,
  spineItemIndex: number,
  anchorValue: string,
  anchorIndex: number,
  progression: number,
) {
  return {
    schemaVersion: 1,
    bookIdentity: { ...SYNTHETIC_BOOK_IDENTITY },
    spineItemId,
    spineItemIndex,
    anchor: {
      kind: "element-id",
      formatVersion: 1,
      value: anchorValue,
      anchorIndex,
    },
    textOffsetCodePoints: 0,
    progression,
  };
}

function createLocator(
  spineItemId: string,
  spineItemIndex: number,
  anchorValue: string,
  anchorIndex: number,
  progression: number,
): ReadingLocatorV1 {
  return decodeReadingLocatorV1(
    createSyntheticLocatorInput(
      spineItemId,
      spineItemIndex,
      anchorValue,
      anchorIndex,
      progression,
    ),
  );
}

function freezeBlock<TBlock extends SyntheticDocumentBlock>(
  block: TBlock,
): TBlock {
  return Object.freeze(block);
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

const SYNTHETIC_BOOK = decodeBookV1(createSyntheticBookInput());
const SYNTHETIC_IMAGE_RESOURCE = SYNTHETIC_BOOK.resources.find(
  (resource) => resource.path === "images/lantern.svg",
);

if (SYNTHETIC_IMAGE_RESOURCE === undefined) {
  throw new Error("Synthetic fixture image resource is missing.");
}

export const VALID_SYNTHETIC_DOCUMENT_FIXTURE: SyntheticDocumentFixture =
  Object.freeze({
    provenance: "synthetic",
    name: "multi-spine-navigation-exercise",
    book: SYNTHETIC_BOOK,
    spineDocuments: Object.freeze([
      Object.freeze({
        spineItemId: SYNTHETIC_BOOK.spine[0]!.id,
        spineItemIndex: SYNTHETIC_BOOK.spine[0]!.index,
        blocks: Object.freeze([
          freezeBlock({
            kind: "heading",
            id: "arrival-title",
            level: 1,
            locator: createLocator("spine:arrival", 0, "arrival-title", 0, 0),
            text: "Arrival",
          }),
          freezeBlock({
            kind: "paragraph",
            id: "arrival-paragraph",
            locator: createLocator(
              "spine:arrival",
              0,
              "arrival-paragraph",
              1,
              0.2,
            ),
            text: "A test traveler reaches a quiet station.",
          }),
          freezeBlock({
            kind: "dialogue",
            id: "arrival-dialogue",
            speaker: "Guide",
            locator: createLocator(
              "spine:arrival",
              0,
              "arrival-dialogue",
              2,
              0.35,
            ),
            text: "The platform is ready.",
          }),
          freezeBlock({
            kind: "scene-boundary",
            id: "arrival-scene-boundary",
            locator: createLocator(
              "spine:arrival",
              0,
              "arrival-scene-boundary",
              3,
              0.5,
            ),
          }),
        ]),
      }),
      Object.freeze({
        spineItemId: SYNTHETIC_BOOK.spine[1]!.id,
        spineItemIndex: SYNTHETIC_BOOK.spine[1]!.index,
        blocks: Object.freeze([
          freezeBlock({
            kind: "heading",
            id: "departure-title",
            level: 1,
            locator: createLocator(
              "spine:departure",
              1,
              "departure-title",
              0,
              0.6,
            ),
            text: "Departure",
          }),
          freezeBlock({
            kind: "paragraph",
            id: "departure-paragraph",
            locator: createLocator(
              "spine:departure",
              1,
              "departure-paragraph",
              1,
              0.8,
            ),
            text: "The synthetic journey continues beyond this page.",
          }),
        ]),
      }),
    ]),
    images: Object.freeze([
      Object.freeze({
        id: "lantern-image",
        resourcePath: SYNTHETIC_IMAGE_RESOURCE.path,
        altText: "Synthetic lantern illustration",
      }),
    ]),
  });

const duplicateSpineIdInput = createSyntheticBookInput();
duplicateSpineIdInput.spine[1]!.id = duplicateSpineIdInput.spine[0]!.id;

const brokenNavigationInput = createSyntheticBookInput();
brokenNavigationInput.navigation[1]!.targetSpineItemId = "spine:missing";

const remoteResourceInput = createSyntheticBookInput();
remoteResourceInput.resources[2]!.path = "https://example.invalid/lantern.svg";

export const INVALID_SYNTHETIC_DOCUMENT_FIXTURES: readonly InvalidSyntheticDocumentFixture[] =
  Object.freeze([
    Object.freeze({
      provenance: "synthetic",
      name: "duplicate-spine-id",
      bookInput: duplicateSpineIdInput,
    }),
    Object.freeze({
      provenance: "synthetic",
      name: "broken-navigation",
      bookInput: brokenNavigationInput,
    }),
    Object.freeze({
      provenance: "synthetic",
      name: "invalid-locator-reference",
      locatorInput: createSyntheticLocatorInput(
        "spine:missing",
        2,
        "missing-anchor",
        0,
        1,
      ),
    }),
    Object.freeze({
      provenance: "synthetic",
      name: "remote-resource",
      bookInput: remoteResourceInput,
    }),
    Object.freeze({
      provenance: "synthetic",
      name: "malformed-book-structure",
      bookInput: { schemaVersion: 1, identity: { ...SYNTHETIC_BOOK_IDENTITY } },
    }),
  ]);

/**
 * Finds the synthetic structural block identified by a locator. This is test
 * support only; real EPUB locator resolution remains an ingestion concern.
 */
export function findSyntheticDocumentBlock(
  fixture: SyntheticDocumentFixture,
  locator: ReadingLocatorV1,
): SyntheticDocumentBlock | undefined {
  if (!bookIdentitiesMatch(fixture.book.identity, locator.bookIdentity)) {
    return undefined;
  }

  const spineDocument = fixture.spineDocuments.find(
    (document) =>
      document.spineItemId === locator.spineItemId &&
      document.spineItemIndex === locator.spineItemIndex,
  );

  return spineDocument?.blocks.find(
    (block) =>
      block.locator.anchor.value === locator.anchor.value &&
      block.locator.anchor.anchorIndex === locator.anchor.anchorIndex,
  );
}

class ScriptedFakeDocumentSource implements FakeDocumentSource {
  #steps: readonly FakeDocumentSourceStep[];
  #loadCount = 0;

  public constructor(steps: readonly FakeDocumentSourceStep[]) {
    this.#steps = Object.freeze([...steps]);
  }

  public load(): SyntheticDocumentFixture {
    const step = this.#steps[this.#loadCount];
    this.#loadCount += 1;

    if (step === undefined) {
      throw new FakeDocumentSourceError("script-exhausted");
    }

    if (step.kind === "failure") {
      throw new FakeDocumentSourceError(step.code);
    }

    return step.fixture;
  }

  public getLoadCount(): Count {
    return createCount(this.#loadCount);
  }

  public getRemainingStepCount(): Count {
    return createCount(Math.max(0, this.#steps.length - this.#loadCount));
  }
}

/**
 * Creates a deterministic, in-memory source of prebuilt synthetic document
 * fixtures. It does not read files, archives, the network, or a DOM.
 */
export function createFakeDocumentSource(
  steps: readonly FakeDocumentSourceStep[],
): FakeDocumentSource {
  return new ScriptedFakeDocumentSource(steps);
}
