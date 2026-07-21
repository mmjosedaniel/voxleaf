import {
  createCount,
  createIndex,
  createMilliseconds,
} from "../primitives/index.js";
import type { Count, Index, Milliseconds } from "../primitives/index.js";

export type ManualClockErrorCode =
  | "invalid-start-time"
  | "invalid-advance"
  | "invalid-delay"
  | "invalid-callback"
  | "time-overflow"
  | "task-order-overflow";

export class ManualClockError extends Error {
  public readonly code: ManualClockErrorCode;

  public constructor(code: ManualClockErrorCode) {
    super("Manual clock input is invalid.");
    this.name = "ManualClockError";
    this.code = code;
  }
}

export interface PendingManualClockTask {
  readonly dueAtMs: Milliseconds;
  readonly insertionOrder: Index;
}

export interface ManualClock {
  readonly nowMs: Milliseconds;

  /**
   * Schedules work relative to the current manual instant. Tasks due at the
   * same instant run in first-scheduled, first-run order.
   */
  schedule(delayMs: number, callback: () => void): void;
  advanceBy(durationMs: number): void;
  getPendingTasks(): readonly PendingManualClockTask[];
  clearPendingTasks(): Count;
}

interface ScheduledManualClockTask extends PendingManualClockTask {
  readonly callback: () => void;
}

function createClockMilliseconds(
  value: number,
  code: ManualClockErrorCode,
): Milliseconds {
  try {
    return createMilliseconds(value);
  } catch {
    throw new ManualClockError(code);
  }
}

function addMilliseconds(
  left: Milliseconds,
  right: Milliseconds,
): Milliseconds {
  if (right > Number.MAX_SAFE_INTEGER - left) {
    throw new ManualClockError("time-overflow");
  }

  return createMilliseconds(left + right);
}

function compareTasks(
  left: ScheduledManualClockTask,
  right: ScheduledManualClockTask,
): number {
  return (
    left.dueAtMs - right.dueAtMs || left.insertionOrder - right.insertionOrder
  );
}

class ManuallyAdvancedClock implements ManualClock {
  #nowMs: Milliseconds;
  #nextInsertionOrder = 0;
  #pendingTasks: ScheduledManualClockTask[] = [];

  public constructor(startAtMs: Milliseconds) {
    this.#nowMs = startAtMs;
  }

  public get nowMs(): Milliseconds {
    return this.#nowMs;
  }

  public schedule(delayMs: number, callback: () => void): void {
    const validatedDelayMs = createClockMilliseconds(delayMs, "invalid-delay");

    if (typeof callback !== "function") {
      throw new ManualClockError("invalid-callback");
    }

    if (this.#nextInsertionOrder > Number.MAX_SAFE_INTEGER) {
      throw new ManualClockError("task-order-overflow");
    }

    this.#pendingTasks.push({
      dueAtMs: addMilliseconds(this.#nowMs, validatedDelayMs),
      insertionOrder: createIndex(this.#nextInsertionOrder),
      callback,
    });
    this.#nextInsertionOrder += 1;
  }

  public advanceBy(durationMs: number): void {
    const validatedDurationMs = createClockMilliseconds(
      durationMs,
      "invalid-advance",
    );
    const targetMs = addMilliseconds(this.#nowMs, validatedDurationMs);

    while (true) {
      this.#pendingTasks.sort(compareTasks);
      const nextTask = this.#pendingTasks[0];

      if (nextTask === undefined || nextTask.dueAtMs > targetMs) {
        this.#nowMs = targetMs;
        return;
      }

      this.#pendingTasks.shift();
      this.#nowMs = nextTask.dueAtMs;
      nextTask.callback();
    }
  }

  public getPendingTasks(): readonly PendingManualClockTask[] {
    return Object.freeze(
      [...this.#pendingTasks].sort(compareTasks).map((task) =>
        Object.freeze({
          dueAtMs: task.dueAtMs,
          insertionOrder: task.insertionOrder,
        }),
      ),
    );
  }

  public clearPendingTasks(): Count {
    const clearedTaskCount = createCount(this.#pendingTasks.length);
    this.#pendingTasks = [];
    return clearedTaskCount;
  }
}

/**
 * Creates a test-only clock whose time changes solely through `advanceBy`.
 * It never reads the system clock or schedules real asynchronous work.
 */
export function createManualClock(startAtMs: number): ManualClock {
  return new ManuallyAdvancedClock(
    createClockMilliseconds(startAtMs, "invalid-start-time"),
  );
}
