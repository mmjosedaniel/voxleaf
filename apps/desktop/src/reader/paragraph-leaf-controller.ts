import type { OpenedPublication, PublicationLocatedBlock } from "@voxleaf/epub";
import type { ReadingLocatorV1 } from "@voxleaf/shared";

import type {
  ProductNarrationAudibleProgressObservation,
  ProductNarrationSnapshot,
} from "../tts/product-narration-coordinator";
import type { AdaptivePreparationUiPhase } from "../tts/adaptive-preparation";
import type { ReaderExperienceLeafState } from "./reader-experience-authority";

export interface ParagraphLeafSnapshot {
  readonly locatedBlock: PublicationLocatedBlock | undefined;
  readonly state: ReaderExperienceLeafState | undefined;
}

function sameBook(
  left: ReadingLocatorV1["bookIdentity"],
  right: ReadingLocatorV1["bookIdentity"],
): boolean {
  return (
    left.scheme === right.scheme &&
    left.schemeVersion === right.schemeVersion &&
    left.value === right.value
  );
}

function sameBlock(
  left: PublicationLocatedBlock | undefined,
  right: PublicationLocatedBlock | undefined,
): boolean {
  return left === right;
}

function frozenSnapshot(
  locatedBlock: PublicationLocatedBlock | undefined,
  state: ReaderExperienceLeafState | undefined,
): ParagraphLeafSnapshot {
  return Object.freeze({ locatedBlock, state });
}

function segmentKey(
  observation: Pick<
    ProductNarrationAudibleProgressObservation,
    "generationId" | "segmentId" | "sequence" | "sessionId"
  >,
): string {
  return `${observation.sessionId}\u0000${observation.generationId}\u0000${observation.segmentId}\u0000${String(observation.sequence)}`;
}

/**
 * Keeps the paragraph leaf projection bounded to one canonical block per
 * authority state. It stores no text, rendered coordinates, or second
 * persisted reading position.
 */
export class ParagraphLeafController {
  readonly #publication: OpenedPublication;
  readonly #listeners = new Set<() => void>();
  #available = false;
  #preview: PublicationLocatedBlock | undefined;
  #preparing: PublicationLocatedBlock | undefined;
  #audible: PublicationLocatedBlock | undefined;
  #checkpoint: PublicationLocatedBlock | undefined;
  #phase: AdaptivePreparationUiPhase | "inactive" = "inactive";
  #activeSegmentKey: string | undefined;
  #snapshot: ParagraphLeafSnapshot = frozenSnapshot(undefined, undefined);
  #closed = false;

  public constructor(
    publication: OpenedPublication,
    initialCheckpoint?: ReadingLocatorV1,
  ) {
    this.#publication = publication;
    this.#checkpoint =
      initialCheckpoint === undefined
        ? undefined
        : this.#canonicalBlock(initialCheckpoint);
  }

  public subscribe = (listener: () => void): (() => void) => {
    if (this.#closed) {
      return () => undefined;
    }
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  };

  public getSnapshot = (): ParagraphLeafSnapshot => this.#snapshot;

  public setPreviewLocator(locator: ReadingLocatorV1): void {
    if (this.#closed) {
      return;
    }
    const preview = this.#canonicalBlock(locator);
    if (sameBlock(preview, this.#preview)) {
      return;
    }
    this.#preview = preview;
    this.#project();
  }

  public beginPreparation(locator: ReadingLocatorV1): boolean {
    if (this.#closed || !this.#available) {
      return false;
    }
    const preparing = this.#canonicalBlock(locator);
    if (preparing === undefined) {
      return false;
    }
    this.#preparing = preparing;
    this.#audible = undefined;
    this.#activeSegmentKey = undefined;
    this.#phase = "preparing";
    this.#project();
    return true;
  }

  public reconcile(snapshot: ProductNarrationSnapshot): void {
    if (this.#closed) {
      return;
    }
    this.#available = snapshot.availability === "available";
    const phase =
      snapshot.navigation.playIntent === "inactive"
        ? "inactive"
        : (snapshot.state?.phase ?? "preparing");
    this.#phase = phase;
    if (phase === "preparing") {
      this.#audible = undefined;
      this.#activeSegmentKey = undefined;
    }
    if (
      snapshot.navigation.playIntent !== "inactive" &&
      this.#preparing === undefined
    ) {
      this.#preparing = this.#preview;
    }
    if (
      phase === "inactive" ||
      phase === "complete" ||
      phase === "failed" ||
      phase === "paused" ||
      phase === "stopped"
    ) {
      this.#preparing = undefined;
      this.#activeSegmentKey = undefined;
    }
    this.#project();
  }

  public accept(observation: ProductNarrationAudibleProgressObservation): void {
    if (this.#closed) {
      return;
    }
    if (observation.kind === "progress") {
      return;
    }
    const key = segmentKey(observation);
    if (
      observation.kind === "segment-completed" &&
      key !== this.#activeSegmentKey
    ) {
      return;
    }
    const checkpointLocator =
      observation.kind === "segment-started"
        ? observation.sourceRange.start
        : observation.sourceRange.end;
    const checkpoint = this.#canonicalBlock(checkpointLocator);
    if (checkpoint === undefined) {
      return;
    }
    this.#checkpoint = checkpoint;
    if (observation.kind === "segment-started") {
      this.#activeSegmentKey = key;
      this.#audible = checkpoint;
      this.#preparing = undefined;
    } else {
      this.#activeSegmentKey = undefined;
    }
    this.#project();
  }

  public close(): void {
    if (this.#closed) {
      return;
    }
    this.#closed = true;
    this.#available = false;
    this.#preview = undefined;
    this.#preparing = undefined;
    this.#audible = undefined;
    this.#checkpoint = undefined;
    this.#activeSegmentKey = undefined;
    this.#snapshot = frozenSnapshot(undefined, undefined);
    this.#listeners.clear();
  }

  #canonicalBlock(
    locator: ReadingLocatorV1,
  ): PublicationLocatedBlock | undefined {
    if (!sameBook(locator.bookIdentity, this.#publication.book.identity)) {
      return undefined;
    }
    try {
      return this.#publication.resolveLocator(locator).locatedBlock;
    } catch {
      return undefined;
    }
  }

  #project(): void {
    let state: ReaderExperienceLeafState | undefined;
    let locatedBlock: PublicationLocatedBlock | undefined;
    if (!this.#available || this.#preview === undefined) {
      state = undefined;
      locatedBlock = undefined;
    } else if (this.#phase === "preparing" && this.#preparing !== undefined) {
      state = "preparing";
      locatedBlock = this.#preparing;
    } else if (
      (this.#phase === "playing" || this.#phase === "intentional-wait") &&
      this.#audible !== undefined
    ) {
      state = "audible";
      locatedBlock = this.#audible;
    } else if (
      this.#checkpoint !== undefined &&
      sameBlock(this.#checkpoint, this.#preview)
    ) {
      state = "checkpoint";
      locatedBlock = this.#checkpoint;
    } else {
      state = "preview";
      locatedBlock = this.#preview;
    }

    if (
      this.#snapshot.state === state &&
      sameBlock(this.#snapshot.locatedBlock, locatedBlock)
    ) {
      return;
    }
    this.#snapshot = frozenSnapshot(locatedBlock, state);
    for (const listener of this.#listeners) {
      listener();
    }
  }
}
