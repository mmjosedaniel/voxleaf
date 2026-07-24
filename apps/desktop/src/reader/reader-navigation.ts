import type {
  OpenedPublication,
  PublicationLocatedBlock,
  PublicationLocatorResolution,
  PublicationTargetResolution,
  PublicationTargetUnavailableReason,
  SemanticBlock,
  SemanticDocument,
  SemanticDocumentTarget,
} from "@voxleaf/epub";
import type { ReadingLocatorV1 } from "@voxleaf/shared";

import { assessSemanticDocumentRendering } from "./large-chapter-rendering";
import {
  DEFAULT_READER_PREFERENCES,
  updateReaderPreference,
  type ReaderPreferenceName,
  type ReaderPreferenceReflowIntent,
  type ReaderPreferencesV1,
} from "./reader-preferences";

export interface AvailableReaderTarget {
  readonly status: "available";
}

export interface UnavailableReaderTarget {
  readonly status: "unavailable";
  readonly explanation: string;
}

export type ReaderTargetAvailability =
  AvailableReaderTarget | UnavailableReaderTarget;

export interface ReaderNavigationCoordinatorOptions {
  readonly initialLocator?: ReadingLocatorV1;
  readonly preferences?: ReaderPreferencesV1;
}

export interface ReaderNavigationState {
  readonly activeDocument: SemanticDocument;
  readonly activeLocator: ReadingLocatorV1;
  readonly destinationBlock: SemanticBlock;
  readonly contentStatus: "render" | "chapter-too-large";
  readonly presentedChapterIndex: number;
  readonly navigationRevision: number;
  readonly message: string;
  readonly canGoPrevious: boolean;
  readonly canGoNext: boolean;
  readonly preferences: ReaderPreferencesV1;
  readonly preferenceReflow: ReaderPreferenceReflowIntent | undefined;
}

interface TargetRecord {
  readonly availability: ReaderTargetAvailability;
  readonly resolution?: PublicationTargetResolution;
}

const GENERIC_UNAVAILABLE_MESSAGE = "This destination is unavailable.";
const NAVIGATION_FAILURE_MESSAGE = "Navigation could not be completed.";
const EXACT_NAVIGATION_MESSAGE = "Moved to the requested reading location.";
const RECOVERED_NAVIGATION_MESSAGE =
  "The requested location was unavailable. Moved to the start of its reading section.";
export const CHAPTER_TOO_LARGE_MESSAGE =
  "This reading section is too large to display safely. Choose another section.";

function unavailableExplanation(
  reason: PublicationTargetUnavailableReason,
): string {
  switch (reason) {
    case "empty-document":
      return "This destination has no supported readable content.";
    case "invalid-target":
    case "unknown-document":
      return GENERIC_UNAVAILABLE_MESSAGE;
    case "non-spine-document":
      return "This destination is outside the readable spine.";
    default:
      return unreachable(reason);
  }
}

function unreachable(value: never): never {
  void value;
  throw new Error("Unsupported reader navigation value.");
}

function locatorsEqual(
  left: ReadingLocatorV1,
  right: ReadingLocatorV1,
): boolean {
  return (
    left.schemaVersion === right.schemaVersion &&
    left.bookIdentity.scheme === right.bookIdentity.scheme &&
    left.bookIdentity.schemeVersion === right.bookIdentity.schemeVersion &&
    left.bookIdentity.value === right.bookIdentity.value &&
    left.spineItemId === right.spineItemId &&
    left.spineItemIndex === right.spineItemIndex &&
    left.anchor.kind === right.anchor.kind &&
    left.anchor.formatVersion === right.anchor.formatVersion &&
    left.anchor.value === right.anchor.value &&
    left.anchor.anchorIndex === right.anchor.anchorIndex &&
    left.textOffsetCodePoints === right.textOffsetCodePoints &&
    left.progression === right.progression
  );
}

function documentForLocatedBlock(
  publication: OpenedPublication,
  locatedBlock: PublicationLocatedBlock,
): SemanticDocument | undefined {
  const document = publication.documents.find(
    (candidate) => candidate.id === locatedBlock.documentId,
  );
  if (
    document?.location.kind !== "spine" ||
    document.location.spineItemId !== locatedBlock.startLocator.spineItemId ||
    document.location.spineItemIndex !==
      locatedBlock.startLocator.spineItemIndex
  ) {
    return undefined;
  }
  return document;
}

function readableChapterStarts(
  publication: OpenedPublication,
): readonly PublicationLocatedBlock[] {
  return Object.freeze(
    publication.book.spine.flatMap((spineItem) => {
      const locatedBlock = publication.locators.find(
        (candidate) =>
          candidate.startLocator.spineItemId === spineItem.id &&
          candidate.startLocator.spineItemIndex === spineItem.index,
      );
      return locatedBlock === undefined ||
        documentForLocatedBlock(publication, locatedBlock) === undefined
        ? []
        : [locatedBlock];
    }),
  );
}

function targetRecord(
  publication: OpenedPublication,
  target: SemanticDocumentTarget,
): TargetRecord {
  let resolution: PublicationTargetResolution;
  try {
    resolution = publication.resolveTarget(target);
  } catch {
    return Object.freeze({
      availability: Object.freeze({
        status: "unavailable",
        explanation: GENERIC_UNAVAILABLE_MESSAGE,
      }),
    });
  }

  switch (resolution.status) {
    case "exact":
    case "recovered":
      return Object.freeze({
        availability: Object.freeze({ status: "available" }),
        resolution,
      });
    case "unavailable":
      return Object.freeze({
        availability: Object.freeze({
          status: "unavailable",
          explanation: unavailableExplanation(resolution.reason),
        }),
        resolution,
      });
    default:
      return unreachable(resolution);
  }
}

export class ReaderNavigationCoordinator {
  readonly #publication: OpenedPublication;
  readonly #chapterStarts: readonly PublicationLocatedBlock[];
  readonly #targetRecords = new WeakMap<SemanticDocumentTarget, TargetRecord>();
  readonly #listeners = new Set<() => void>();
  #preferences: ReaderPreferencesV1;
  #preferenceReflow: ReaderPreferenceReflowIntent | undefined;
  #preferenceReflowRevision = 0;
  #state: ReaderNavigationState;

  public constructor(
    publication: OpenedPublication,
    options: ReaderNavigationCoordinatorOptions = {},
  ) {
    const firstLocatedBlock = publication.locators[0];
    if (firstLocatedBlock === undefined) {
      throw new Error("Readable spine document is unavailable.");
    }
    let initialLocatedBlock = firstLocatedBlock;
    let initialLocator = firstLocatedBlock.startLocator;
    if (options.initialLocator !== undefined) {
      let resolution: PublicationLocatorResolution;
      try {
        resolution = publication.resolveLocator(options.initialLocator);
      } catch {
        throw new Error("Initial reading locator is unavailable.");
      }
      initialLocatedBlock = resolution.locatedBlock;
      initialLocator = resolution.locator;
    }
    const activeDocument = documentForLocatedBlock(
      publication,
      initialLocatedBlock,
    );
    if (activeDocument === undefined) {
      throw new Error("Readable spine document is unavailable.");
    }

    this.#publication = publication;
    this.#preferences = options.preferences ?? DEFAULT_READER_PREFERENCES;
    this.#chapterStarts = readableChapterStarts(publication);
    const initialContentStatus =
      assessSemanticDocumentRendering(activeDocument).status;
    this.#state = this.createState(
      activeDocument,
      initialLocator,
      initialLocatedBlock.block,
      0,
      initialContentStatus === "accepted" ? "" : CHAPTER_TOO_LARGE_MESSAGE,
      initialContentStatus === "accepted" ? "render" : "chapter-too-large",
    );
  }

  public get state(): ReaderNavigationState {
    return this.#state;
  }

  public subscribe(listener: () => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  public targetAvailability(
    target: SemanticDocumentTarget,
  ): ReaderTargetAvailability {
    return this.getTargetRecord(target).availability;
  }

  public navigateToTarget(target: SemanticDocumentTarget): void {
    const record = this.getTargetRecord(target);
    const resolution = record.resolution;
    if (resolution === undefined || resolution.status === "unavailable") {
      this.announce(
        record.availability.status === "unavailable"
          ? record.availability.explanation
          : GENERIC_UNAVAILABLE_MESSAGE,
      );
      return;
    }

    this.commitResolution(resolution);
  }

  public goPrevious(): void {
    this.navigateByChapter(-1);
  }

  public goNext(): void {
    this.navigateByChapter(1);
  }

  public updateActiveVisualLocator(locator: ReadingLocatorV1): boolean {
    const location = this.#state.activeDocument.location;
    if (
      location.kind !== "spine" ||
      location.spineItemId !== locator.spineItemId ||
      location.spineItemIndex !== locator.spineItemIndex ||
      locatorsEqual(this.#state.activeLocator, locator)
    ) {
      return false;
    }
    this.#state = Object.freeze({
      ...this.#state,
      activeLocator: locator,
    });
    this.emit();
    return true;
  }

  public setPreference(
    preference: ReaderPreferenceName,
    value: unknown,
  ): ReaderPreferenceReflowIntent | undefined {
    const next = updateReaderPreference(this.#preferences, preference, value);
    if (next === undefined || next === this.#preferences) {
      return undefined;
    }

    const previous = this.#preferences;
    this.#preferences = next;
    this.#preferenceReflowRevision += 1;
    this.#preferenceReflow = Object.freeze({
      kind: "reader-preference-reflow",
      revision: this.#preferenceReflowRevision,
      preference,
      locator: this.#state.activeLocator,
      previous,
      next,
    });
    this.#state = Object.freeze({
      ...this.#state,
      preferences: this.#preferences,
      preferenceReflow: this.#preferenceReflow,
    });
    this.emit();
    return this.#preferenceReflow;
  }

  private getTargetRecord(target: SemanticDocumentTarget): TargetRecord {
    const cached = this.#targetRecords.get(target);
    if (cached !== undefined) {
      return cached;
    }
    const record = targetRecord(this.#publication, target);
    this.#targetRecords.set(target, record);
    return record;
  }

  private navigateByChapter(delta: -1 | 1): void {
    const currentIndex = this.#state.presentedChapterIndex;
    const chapter = this.#chapterStarts[currentIndex + delta];
    if (currentIndex < 0 || chapter === undefined) {
      return;
    }

    let resolution: PublicationLocatorResolution;
    try {
      resolution = this.#publication.resolveLocator(chapter.startLocator);
    } catch {
      this.announce(NAVIGATION_FAILURE_MESSAGE);
      return;
    }
    this.commitResolution(resolution);
  }

  private commitResolution(
    resolution: PublicationLocatorResolution | PublicationTargetResolution,
  ): void {
    if (resolution.status === "unavailable") {
      this.announce(unavailableExplanation(resolution.reason));
      return;
    }

    const activeDocument = documentForLocatedBlock(
      this.#publication,
      resolution.locatedBlock,
    );
    if (activeDocument === undefined) {
      this.announce(NAVIGATION_FAILURE_MESSAGE);
      return;
    }

    const chapterIndex = this.chapterIndex(resolution.locator);
    if (chapterIndex < 0) {
      this.announce(NAVIGATION_FAILURE_MESSAGE);
      return;
    }
    if (
      assessSemanticDocumentRendering(activeDocument).status ===
      "chapter-too-large"
    ) {
      this.#state = Object.freeze({
        ...this.#state,
        contentStatus: "chapter-too-large",
        presentedChapterIndex: chapterIndex,
        navigationRevision: this.#state.navigationRevision + 1,
        message: CHAPTER_TOO_LARGE_MESSAGE,
        canGoPrevious: chapterIndex > 0,
        canGoNext: chapterIndex < this.#chapterStarts.length - 1,
      });
      this.emit();
      return;
    }

    this.#state = this.createState(
      activeDocument,
      resolution.locator,
      resolution.locatedBlock.block,
      this.#state.navigationRevision + 1,
      resolution.status === "recovered"
        ? RECOVERED_NAVIGATION_MESSAGE
        : EXACT_NAVIGATION_MESSAGE,
      "render",
    );
    this.emit();
  }

  private announce(message: string): void {
    if (this.#state.message === message) {
      return;
    }
    this.#state = Object.freeze({ ...this.#state, message });
    this.emit();
  }

  private createState(
    activeDocument: SemanticDocument,
    activeLocator: ReadingLocatorV1,
    destinationBlock: SemanticBlock,
    navigationRevision: number,
    message: string,
    contentStatus: "render" | "chapter-too-large",
  ): ReaderNavigationState {
    const chapterIndex = this.chapterIndex(activeLocator);
    return Object.freeze({
      activeDocument,
      activeLocator,
      destinationBlock,
      contentStatus,
      presentedChapterIndex: chapterIndex,
      navigationRevision,
      message,
      canGoPrevious: chapterIndex > 0,
      canGoNext:
        chapterIndex >= 0 && chapterIndex < this.#chapterStarts.length - 1,
      preferences: this.#preferences,
      preferenceReflow: this.#preferenceReflow,
    });
  }

  private chapterIndex(locator: ReadingLocatorV1): number {
    return this.#chapterStarts.findIndex(
      (chapter) =>
        chapter.startLocator.spineItemId === locator.spineItemId &&
        chapter.startLocator.spineItemIndex === locator.spineItemIndex,
    );
  }

  private emit(): void {
    for (const listener of this.#listeners) {
      listener();
    }
  }
}
