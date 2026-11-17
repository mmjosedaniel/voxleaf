import type {
  ContentDocumentId,
  SemanticDocument,
  SensitivePublicationText,
} from "@voxleaf/epub";
import { describe, expect, it, vi } from "vitest";
import {
  AUTO_DIRECTION_CHECKS_PER_TURN,
  AUTO_DIRECTION_CHUNK_UNITS,
  SemanticAutoDirectionResolver,
  type AutoDirectionProbe,
} from "./semantic-auto-direction";

function documentWith(
  values: readonly (readonly [number, string])[],
): SemanticDocument {
  return {
    id: "synthetic-auto" as ContentDocumentId,
    location: { kind: "non-spine" },
    autoDirectionScopeCount: values.length,
    blocks: [
      {
        kind: "paragraph",
        children: values.map(([scope, text]) => ({
          kind: "text",
          direction: "auto",
          autoDirectionScope: scope,
          text: text as SensitivePublicationText,
        })),
      },
    ],
  };
}

function scheduler() {
  const pending: (() => void)[] = [];
  const cancelled = vi.fn();
  return {
    schedule: (resume: () => void) => {
      pending.push(resume);
      return cancelled;
    },
    next: () => {
      const resume = pending.shift();
      expect(resume).toBeDefined();
      resume!();
    },
    finish: () => {
      for (let turns = 0; pending.length > 0; turns++) {
        expect(turns).toBeLessThan(100);
        pending.shift()!();
      }
    },
    pending,
    cancelled,
  };
}

describe("FSF-CR1 shared Auto direction ownership", () => {
  it("bounds chunks and checks, preserves surrogate pairs and shares a later strong result", () => {
    const clock = scheduler();
    const measure = vi.fn((value: string) =>
      value.includes("\u{1e900}") ? ("rtl" as const) : undefined,
    );
    const close = vi.fn();
    const source =
      ".".repeat(AUTO_DIRECTION_CHUNK_UNITS * 18 - 1) + "\u{1e900}";
    const resolver = new SemanticAutoDirectionResolver(
      documentWith([
        [1, source],
        [1, "English sibling"],
        [2, "123"],
      ]),
      10,
      clock.schedule,
      () => ({ measure, close }),
    );
    const listener = vi.fn();
    const unsubscribe = resolver.subscribe(listener);
    clock.next();
    expect(resolver.getSnapshot().status).toBe("pending");
    expect(measure).toHaveBeenCalledTimes(AUTO_DIRECTION_CHECKS_PER_TURN);
    clock.finish();
    const result = resolver.getSnapshot();
    expect(result.status).toBe("ready");
    if (result.status !== "ready")
      throw new Error("expected completed direction scan");
    expect([...result.directions]).toEqual([[1, "rtl"]]);
    expect(
      measure.mock.calls.some(([value]) => value.includes("English sibling")),
    ).toBe(false);
    for (const [value] of measure.mock.calls) {
      expect(value.length).toBeLessThanOrEqual(AUTO_DIRECTION_CHUNK_UNITS);
      expect(/[\ud800-\udbff]$/u.test(value)).toBe(false);
    }
    expect(listener).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
    unsubscribe();
    expect(close).toHaveBeenCalledOnce();
  });

  it("retires pending work and ignores stale callbacks before a fresh subscription", () => {
    const clock = scheduler();
    const probes: AutoDirectionProbe[] = [];
    const factory = () => {
      const probe = { measure: vi.fn(() => undefined), close: vi.fn() };
      probes.push(probe);
      return probe;
    };
    const resolver = new SemanticAutoDirectionResolver(
      documentWith([[1, ".".repeat(100000)]]),
      5,
      clock.schedule,
      factory,
    );
    const first = vi.fn();
    const unsubscribe = resolver.subscribe(first);
    clock.next();
    unsubscribe();
    expect(probes[0]!.close).toHaveBeenCalledOnce();
    const second = vi.fn();
    const stop = resolver.subscribe(second);
    clock.next(); // Cancelled callback deliberately delivered late.
    expect(probes).toHaveLength(1);
    expect(first).not.toHaveBeenCalled();
    clock.finish();
    expect(probes).toHaveLength(2);
    expect(second).toHaveBeenCalledOnce();
    expect(probes[1]!.close).toHaveBeenCalledOnce();
    stop();
  });

  it("fails closed on probe or traversal failure and releases the owned probe", () => {
    for (const maximum of [0, 10]) {
      const clock = scheduler();
      const close = vi.fn();
      const resolver = new SemanticAutoDirectionResolver(
        documentWith([[1, "Synthetic"]]),
        maximum,
        clock.schedule,
        () => ({
          measure() {
            throw new Error("private-canary");
          },
          close,
        }),
      );
      const stop = resolver.subscribe(vi.fn());
      clock.finish();
      expect(resolver.getSnapshot()).toEqual({ status: "failed" });
      expect(close).toHaveBeenCalledTimes(maximum === 0 ? 0 : 1);
      stop();
    }
  });

  it("adds no scheduled scan for a document without Auto declarations", () => {
    const clock = scheduler();
    const factory = vi.fn();
    const source = { ...documentWith([]), autoDirectionScopeCount: 0 };
    const resolver = new SemanticAutoDirectionResolver(
      source,
      1,
      clock.schedule,
      factory,
    );
    const stop = resolver.subscribe(vi.fn());
    expect(resolver.getSnapshot().status).toBe("ready");
    expect(clock.pending).toHaveLength(0);
    expect(factory).not.toHaveBeenCalled();
    stop();
  });
});
