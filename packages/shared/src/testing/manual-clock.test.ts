import { describe, expect, it } from "vitest";

import { createManualClock, ManualClockError } from "./manual-clock.js";

describe("manually advanced clock", () => {
  it("starts at its explicit test-controlled instant", () => {
    const clock = createManualClock(250);

    expect(clock.nowMs).toBe(250);
    expect(clock.getPendingTasks()).toEqual([]);
  });

  it("advances only when a test explicitly advances it", () => {
    const clock = createManualClock(100);
    const events: string[] = [];
    clock.schedule(25, () => events.push("due"));

    expect(clock.nowMs).toBe(100);
    expect(events).toEqual([]);

    clock.advanceBy(24);
    expect(clock.nowMs).toBe(124);
    expect(events).toEqual([]);

    clock.advanceBy(1);
    expect(clock.nowMs).toBe(125);
    expect(events).toEqual(["due"]);
  });

  it("runs equal-time tasks in first-scheduled, first-run order", () => {
    const clock = createManualClock(0);
    const events: string[] = [];
    clock.schedule(10, () => events.push("first"));
    clock.schedule(10, () => {
      events.push("second");
      clock.schedule(0, () => events.push("third"));
    });

    clock.advanceBy(10);

    expect(events).toEqual(["first", "second", "third"]);
    expect(clock.nowMs).toBe(10);
  });

  it("runs tasks due within an advancement and leaves later work pending", () => {
    const clock = createManualClock(100);
    const events: string[] = [];
    clock.schedule(5, () => events.push("105"));
    clock.schedule(15, () => events.push("115"));

    clock.advanceBy(10);

    expect(events).toEqual(["105"]);
    expect(clock.nowMs).toBe(110);
    expect(clock.getPendingTasks()).toEqual([
      { dueAtMs: 115, insertionOrder: 1 },
    ]);
  });

  it("exposes immutable pending metadata and clears pending work", () => {
    const clock = createManualClock(0);
    clock.schedule(20, () => undefined);
    clock.schedule(10, () => undefined);

    const pendingTasks = clock.getPendingTasks();
    expect(pendingTasks).toEqual([
      { dueAtMs: 10, insertionOrder: 1 },
      { dueAtMs: 20, insertionOrder: 0 },
    ]);
    expect(Object.isFrozen(pendingTasks)).toBe(true);
    expect(Object.isFrozen(pendingTasks[0]!)).toBe(true);
    expect(clock.clearPendingTasks()).toBe(2);
    expect(clock.getPendingTasks()).toEqual([]);

    clock.advanceBy(20);
    expect(clock.nowMs).toBe(20);
  });

  it.each([
    [() => createManualClock(-1), "invalid-start-time"],
    [() => createManualClock(Number.NaN), "invalid-start-time"],
    [() => createManualClock(0).advanceBy(-1), "invalid-advance"],
    [
      () => createManualClock(0).advanceBy(Number.POSITIVE_INFINITY),
      "invalid-advance",
    ],
    [() => createManualClock(0).schedule(-1, () => undefined), "invalid-delay"],
    [
      () => createManualClock(0).schedule(Number.NaN, () => undefined),
      "invalid-delay",
    ],
    [
      () => createManualClock(0).schedule(0, null as unknown as () => void),
      "invalid-callback",
    ],
  ] as const)("rejects %s immediately", (action, expectedCode) => {
    expect(action).toThrowError(
      expect.objectContaining({
        code: expectedCode,
      }),
    );
  });

  it("rejects time arithmetic beyond JSON-safe millisecond values", () => {
    const clock = createManualClock(Number.MAX_SAFE_INTEGER);

    expect(() => clock.advanceBy(1)).toThrowError(
      expect.objectContaining({ code: "time-overflow" }),
    );
    expect(() => clock.schedule(1, () => undefined)).toThrowError(
      expect.objectContaining({ code: "time-overflow" }),
    );
  });

  it("uses stable errors without relying on wall-clock information", () => {
    expect(() => createManualClock(-1)).toThrow(ManualClockError);
  });
});
