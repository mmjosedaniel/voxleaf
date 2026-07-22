import { describe, expect, it } from "vitest";

import { EpubArchiveError } from "../archive/archive-error.js";
import { createEpubProcessingBudget } from "./processing-budget.js";

describe("EPUB processing budget", () => {
  it("allows exact declared maxima and rejects the first excess", () => {
    const budget = createEpubProcessingBudget({
      policy: {
        maxCompressedEpubBytes: 10,
        maxArchiveEntries: 2,
        maxEntryUncompressedBytes: 6,
        maxTotalUncompressedBytes: 10,
      },
    });

    budget.registerArchiveInput(10);
    budget.registerArchiveEntryDeclaration(4, 4);
    budget.registerArchiveEntryDeclaration(6, 6);

    expect(budget.getSnapshot()).toMatchObject({
      archiveEntryCount: 2,
      declaredUncompressedBytes: 10,
    });
    expect(() => budget.registerArchiveEntryDeclaration(0, 0)).toThrowError(
      expect.objectContaining({ code: "resource-limit-exceeded" }),
    );
  });

  it("rejects compressed input at maximum plus one", () => {
    const budget = createEpubProcessingBudget({
      policy: { maxCompressedEpubBytes: 10 },
    });

    expect(() => budget.registerArchiveInput(11)).toThrowError(
      expect.objectContaining({ code: "resource-limit-exceeded" }),
    );
  });

  it("counts exact observed per-entry bytes before rejecting the next byte", () => {
    const budget = createEpubProcessingBudget({
      policy: {
        maxEntryUncompressedBytes: 4,
        maxTotalUncompressedBytes: 10,
      },
    });
    const entry = budget.beginArchiveEntryRead(4, 4);

    entry.observe(4);

    expect(entry.observedBytes).toBe(4);
    expect(budget.getSnapshot().observedUncompressedBytes).toBe(4);
    expect(() => entry.observe(1)).toThrowError(
      expect.objectContaining({ code: "resource-limit-exceeded" }),
    );
    expect(entry.observedBytes).toBe(4);
  });

  it("counts aggregate observed bytes across reads", () => {
    const budget = createEpubProcessingBudget({
      policy: {
        maxEntryUncompressedBytes: 6,
        maxTotalUncompressedBytes: 10,
      },
    });
    const first = budget.beginArchiveEntryRead(5, 5);
    const second = budget.beginArchiveEntryRead(6, 6);

    first.observe(5);
    second.observe(5);

    expect(budget.getSnapshot().observedUncompressedBytes).toBe(10);
    expect(() => second.observe(1)).toThrowError(
      expect.objectContaining({ code: "resource-limit-exceeded" }),
    );
  });

  it("allows an exact entry ratio and rejects ratio plus one after grace", () => {
    const budget = createEpubProcessingBudget({
      policy: {
        compressionRatioGraceBytes: 4,
        maxCompressionRatio: 2,
        maxEntryUncompressedBytes: 20,
        maxTotalUncompressedBytes: 20,
      },
    });
    const entry = budget.beginArchiveEntryRead(3, 6);

    entry.observe(6);

    expect(entry.observedBytes).toBe(6);
    expect(() => entry.observe(1)).toThrowError(
      expect.objectContaining({ code: "resource-limit-exceeded" }),
    );
  });

  it("preflights declared per-entry and aggregate compression ratios", () => {
    const exact = createEpubProcessingBudget({
      policy: {
        compressionRatioGraceBytes: 4,
        maxCompressionRatio: 2,
        maxEntryUncompressedBytes: 20,
        maxTotalUncompressedBytes: 20,
      },
    });
    exact.registerArchiveEntryDeclaration(3, 6);

    const aboveEntryRatio = createEpubProcessingBudget({
      policy: {
        compressionRatioGraceBytes: 4,
        maxCompressionRatio: 2,
        maxEntryUncompressedBytes: 20,
        maxTotalUncompressedBytes: 20,
      },
    });
    expect(() =>
      aboveEntryRatio.registerArchiveEntryDeclaration(3, 7),
    ).toThrowError(
      expect.objectContaining({ code: "resource-limit-exceeded" }),
    );

    const aboveAggregateRatio = createEpubProcessingBudget({
      policy: {
        compressionRatioGraceBytes: 4,
        maxCompressionRatio: 2,
        maxEntryUncompressedBytes: 20,
        maxTotalUncompressedBytes: 20,
      },
    });
    aboveAggregateRatio.registerArchiveEntryDeclaration(1, 4);
    expect(() =>
      aboveAggregateRatio.registerArchiveEntryDeclaration(1, 4),
    ).toThrowError(
      expect.objectContaining({ code: "resource-limit-exceeded" }),
    );
  });

  it("rejects nonempty output declared with zero compressed bytes", () => {
    const budget = createEpubProcessingBudget();

    expect(() => budget.beginArchiveEntryRead(0, 1)).toThrowError(
      expect.objectContaining({ code: "resource-limit-exceeded" }),
    );

    const falsified = budget.beginArchiveEntryRead(0, 0);
    expect(() => falsified.observe(1)).toThrowError(
      expect.objectContaining({ code: "resource-limit-exceeded" }),
    );
  });

  it("enforces aggregate ratio after individually grace-exempt reads", () => {
    const budget = createEpubProcessingBudget({
      policy: {
        compressionRatioGraceBytes: 4,
        maxCompressionRatio: 2,
        maxEntryUncompressedBytes: 10,
        maxTotalUncompressedBytes: 20,
      },
    });
    const first = budget.beginArchiveEntryRead(1, 4);

    first.observe(4);
    first.complete();
    const second = budget.beginArchiveEntryRead(1, 4);

    expect(() => second.observe(4)).toThrowError(
      expect.objectContaining({ code: "resource-limit-exceeded" }),
    );
    const retry = budget.beginArchiveEntryRead(1, 4);
    expect(() => retry.observe(4)).toThrowError(
      expect.objectContaining({ code: "resource-limit-exceeded" }),
    );
    expect(budget.getSnapshot().observedUncompressedBytes).toBe(4);
    expect(budget.getSnapshot().compressedReadBytes).toBe(1);
  });

  it("does not credit compressed bytes for an incomplete read", () => {
    const budget = createEpubProcessingBudget();
    const incomplete = budget.beginArchiveEntryRead(10, 5);

    expect(() => incomplete.complete()).toThrowError(
      expect.objectContaining({ code: "internal-failure" }),
    );
    expect(budget.getSnapshot().compressedReadBytes).toBe(0);
  });

  it("allows the exact deadline and cancels at deadline plus one", () => {
    let nowMs = 100;
    const budget = createEpubProcessingBudget({
      policy: { maxProcessingTimeMs: 10 },
      clock: { now: () => nowMs },
    });

    nowMs = 110;
    expect(() => budget.checkpoint()).not.toThrow();

    nowMs = 111;
    expect(() => budget.checkpoint()).toThrowError(
      expect.objectContaining({ code: "cancelled" }),
    );
  });

  it("maps caller aborts to the fixed cancellation code", () => {
    const controller = new AbortController();
    const budget = createEpubProcessingBudget({ signal: controller.signal });

    controller.abort("private-canary");

    expect(() => budget.checkpoint()).toThrowError(
      expect.objectContaining({
        code: "cancelled",
        message: "cancelled",
      }),
    );
  });

  it("stops observed accounting at an abort checkpoint between chunks", () => {
    const controller = new AbortController();
    const budget = createEpubProcessingBudget({ signal: controller.signal });
    const entry = budget.beginArchiveEntryRead(4, 4);
    entry.observe(2);

    controller.abort();

    expect(() => entry.observe(2)).toThrowError(
      expect.objectContaining({ code: "cancelled" }),
    );
    expect(entry.observedBytes).toBe(2);
    expect(budget.getSnapshot().observedUncompressedBytes).toBe(2);
  });

  it("stops observed accounting at a deadline checkpoint between chunks", () => {
    let nowMs = 0;
    const budget = createEpubProcessingBudget({
      policy: { maxProcessingTimeMs: 10 },
      clock: { now: () => nowMs },
    });
    const entry = budget.beginArchiveEntryRead(4, 4);
    nowMs = 10;
    entry.observe(2);

    nowMs = 11;

    expect(() => entry.observe(2)).toThrowError(
      expect.objectContaining({ code: "cancelled" }),
    );
    expect(entry.observedBytes).toBe(2);
    expect(budget.getSnapshot().observedUncompressedBytes).toBe(2);
  });

  it("rejects a non-monotonic or invalid clock without exposing its value", () => {
    let nowMs = 100;
    const budget = createEpubProcessingBudget({
      clock: { now: () => nowMs },
    });
    nowMs = 99;

    const error = captureBudgetError(() => budget.checkpoint());

    expect(error).toMatchObject({
      code: "internal-failure",
      message: "internal-failure",
    });
    expect(error.cause).toBeUndefined();
  });

  it("returns an immutable content-free snapshot", () => {
    const budget = createEpubProcessingBudget();

    const snapshot = budget.getSnapshot();

    expect(snapshot).toEqual({
      archiveEntryCount: 0,
      declaredCompressedBytes: 0,
      declaredUncompressedBytes: 0,
      observedUncompressedBytes: 0,
      compressedReadBytes: 0,
    });
    expect(Object.isFrozen(snapshot)).toBe(true);
  });
});

function captureBudgetError(action: () => void): EpubArchiveError {
  try {
    action();
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(EpubArchiveError);
    return error as EpubArchiveError;
  }

  throw new Error("expected processing budget to fail");
}
