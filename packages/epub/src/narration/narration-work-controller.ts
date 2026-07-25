import { EpubArchiveError } from "../archive/archive-error.js";
import { NARRATION_V1_SOURCE_WINDOW_POLICY } from "./narration-policy.js";

export type NarrationYieldScheduler = () => Promise<void>;

export const DEFAULT_NARRATION_YIELD_SCHEDULER: NarrationYieldScheduler = () =>
  new Promise((resolve) => {
    globalThis.setTimeout(resolve, 0);
  });

function fail(): never {
  throw new EpubArchiveError("internal-failure");
}

function addSafe(left: number, right: number): number {
  const result = left + right;
  return Number.isSafeInteger(result) ? result : fail();
}

/**
 * Shared deterministic work accounting for bounded narration preparation.
 *
 * Callers charge one observation for each accepted profile work unit. The
 * controller owns cancellation checkpoints, cooperative yields, and the final
 * pre-publication cancellation check.
 */
export class NarrationWorkController {
  readonly #scheduler: NarrationYieldScheduler;
  readonly #signal: AbortSignal;
  #checkpointCount = 0;
  #sinceCheckpoint = 0;
  #sinceYield = 0;
  #workUnitCount = 0;
  #yieldCount = 0;

  public constructor(signal: AbortSignal, scheduler: NarrationYieldScheduler) {
    this.#signal = signal;
    this.#scheduler = scheduler;
    this.assertActive();
  }

  public get checkpointCount(): number {
    return this.#checkpointCount;
  }

  public get workUnitCount(): number {
    return this.#workUnitCount;
  }

  public get yieldCount(): number {
    return this.#yieldCount;
  }

  public async observe(): Promise<void> {
    this.#workUnitCount = addSafe(this.#workUnitCount, 1);
    this.#sinceCheckpoint = addSafe(this.#sinceCheckpoint, 1);
    this.#sinceYield = addSafe(this.#sinceYield, 1);

    if (
      this.#sinceCheckpoint >=
      NARRATION_V1_SOURCE_WINDOW_POLICY.workUnitsBetweenCheckpointsTarget
    ) {
      this.assertActive();
      this.#checkpointCount = addSafe(this.#checkpointCount, 1);
      this.#sinceCheckpoint = 0;
    }

    if (
      this.#sinceYield >=
      NARRATION_V1_SOURCE_WINDOW_POLICY.workUnitsBetweenYieldsTarget
    ) {
      this.assertActive();
      await this.#scheduler();
      this.#yieldCount = addSafe(this.#yieldCount, 1);
      this.#sinceYield = 0;
      this.assertActive();
    }

    if (
      this.#sinceCheckpoint >
        NARRATION_V1_SOURCE_WINDOW_POLICY.workUnitsBetweenCheckpointsHardMaximum ||
      this.#sinceYield >
        NARRATION_V1_SOURCE_WINDOW_POLICY.workUnitsBetweenYieldsHardMaximum
    ) {
      return fail();
    }
  }

  public beforePublication(): void {
    this.assertActive();
    this.#checkpointCount = addSafe(this.#checkpointCount, 1);
    this.#sinceCheckpoint = 0;
  }

  private assertActive(): void {
    if (this.#signal.aborted) {
      throw new EpubArchiveError("cancelled");
    }
  }
}
