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

export interface AvailableReaderTarget {
  readonly status: "available";
}

export interface UnavailableReaderTarget {
  readonly status: "unavailable";
  readonly explanation: string;
}

export type ReaderTargetAvailability =
  AvailableReaderTarget | UnavailableReaderTarget;

export interface ReaderNavigationState {
  readonly activeDocument: SemanticDocument;
  readonly activeLocator: ReadingLocatorV1;
  readonly destinationBlock: SemanticBlock;
  readonly navigationRevision: number;
  readonly message: string;
  readonly canGoPrevious: boolean;
  readonly canGoNext: boolean;
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
  #state: ReaderNavigationState;

  public constructor(publication: OpenedPublication) {
    const firstLocatedBlock = publication.locators[0];
    if (firstLocatedBlock === undefined) {
      throw new Error("Readable spine document is unavailable.");
    }
    const activeDocument = documentForLocatedBlock(
      publication,
      firstLocatedBlock,
    );
    if (activeDocument === undefined) {
      throw new Error("Readable spine document is unavailable.");
    }

    this.#publication = publication;
    this.#chapterStarts = readableChapterStarts(publication);
    this.#state = this.createState(
      activeDocument,
      firstLocatedBlock.startLocator,
      firstLocatedBlock.block,
      0,
      "",
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
    const currentIndex = this.chapterIndex(this.#state.activeLocator);
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

    this.#state = this.createState(
      activeDocument,
      resolution.locator,
      resolution.locatedBlock.block,
      this.#state.navigationRevision + 1,
      resolution.status === "recovered"
        ? RECOVERED_NAVIGATION_MESSAGE
        : EXACT_NAVIGATION_MESSAGE,
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
  ): ReaderNavigationState {
    const chapterIndex = this.chapterIndex(activeLocator);
    return Object.freeze({
      activeDocument,
      activeLocator,
      destinationBlock,
      navigationRevision,
      message,
      canGoPrevious: chapterIndex > 0,
      canGoNext:
        chapterIndex >= 0 && chapterIndex < this.#chapterStarts.length - 1,
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
