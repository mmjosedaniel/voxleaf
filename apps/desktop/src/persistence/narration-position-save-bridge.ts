import type {
  ProductNarrationAudibleProgressObservation,
  ProductNarrationCoordinator,
} from "../tts/product-narration-coordinator";
import type {
  HeardPositionCheckpoint,
  ReaderPositionSaveCoordinator,
} from "./reader-position-save-coordinator";

export type NarrationPositionSource = Pick<
  ProductNarrationCoordinator,
  "observe" | "subscribe" | "subscribeAudibleProgress"
>;

export type NarrationPositionSaveSink = Pick<
  ReaderPositionSaveCoordinator,
  "beginNarration" | "finishNarration" | "flush" | "recordHeardCheckpoint"
>;

const FLUSH_PHASES = new Set(["buffering", "paused"]);

function checkpointFrom(
  observation: ProductNarrationAudibleProgressObservation,
): HeardPositionCheckpoint | undefined {
  switch (observation.kind) {
    case "segment-started":
      return Object.freeze({
        kind: observation.kind,
        segmentId: observation.segmentId,
        locator: observation.sourceRange.start,
      });
    case "segment-completed":
      return Object.freeze({
        kind: observation.kind,
        segmentId: observation.segmentId,
        locator: observation.sourceRange.end,
      });
    case "progress":
      return undefined;
  }
}

/**
 * Connects one narration owner to one bounded reader-position owner.
 *
 * Only exact audible boundaries enter persistence. React snapshots, periodic
 * played-frame observations, narration text, PCM, and rendered geometry do
 * not cross this bridge.
 */
export function bindNarrationPositionPersistence(
  source: NarrationPositionSource,
  sink: NarrationPositionSaveSink,
): () => void {
  let narrationActive = false;
  let lastPhase: string | undefined;

  const reconcile = (): void => {
    const snapshot = source.observe();
    const active = snapshot.navigation.playIntent !== "inactive";
    if (active && !narrationActive) {
      narrationActive = true;
      sink.beginNarration();
    } else if (!active && narrationActive) {
      narrationActive = false;
      lastPhase = undefined;
      void sink.finishNarration();
      return;
    }

    const phase = snapshot.state?.phase;
    if (
      active &&
      phase !== lastPhase &&
      phase !== undefined &&
      FLUSH_PHASES.has(phase)
    ) {
      void sink.flush();
    }
    lastPhase = phase;
  };

  const acceptAudibleProgress = (
    observation: ProductNarrationAudibleProgressObservation,
  ): void => {
    const checkpoint = checkpointFrom(observation);
    if (checkpoint !== undefined) {
      sink.recordHeardCheckpoint(checkpoint);
    }
  };

  const unsubscribeState = source.subscribe(reconcile);
  const unsubscribeAudible = source.subscribeAudibleProgress(
    acceptAudibleProgress,
  );
  reconcile();

  return () => {
    unsubscribeAudible();
    unsubscribeState();
    if (narrationActive) {
      narrationActive = false;
      void sink.finishNarration();
    }
  };
}
