import { act, cleanup, renderHook } from "@testing-library/react";
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  HardwareProfileCompatibilityCoordinator,
  type HardwareCompatibilitySnapshotV1,
} from "./hardware-profile-compatibility";
import { INITIAL_OPERATIONAL_RECOVERY_SNAPSHOT_V1 } from "./operational-recovery";
import type { ProductNarrationSnapshot } from "./product-narration-coordinator";
import { useHardwareCompatibilitySnapshot } from "./use-hardware-compatibility-snapshot";
import { useProductNarrationSnapshot } from "./use-product-narration-snapshot";

afterEach(() => cleanup());

class SnapshotSource<Snapshot> {
  readonly listeners = new Set<() => void>();
  readonly close = vi.fn();
  readonly check = vi.fn();
  readonly checkAvailability = vi.fn();
  readonly start = vi.fn();
  readonly stop = vi.fn();
  readonly setSelection = vi.fn();

  constructor(public current: Snapshot) {}

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  observe(): Snapshot {
    return this.current;
  }

  publish(snapshot: Snapshot): void {
    this.current = snapshot;
    this.listeners.forEach((listener) => listener());
  }
}

function subscriptionSuite<Snapshot>(
  name: string,
  useSnapshot: (source: SnapshotSource<Snapshot>) => Snapshot,
  initial: Snapshot,
  updated: Snapshot,
): void {
  describe(name, () => {
    it("returns cached identities on notification without resubscribing to the same source", () => {
      const source = new SnapshotSource(initial);
      const subscribe = vi.spyOn(source, "subscribe");
      const subject = renderHook(() => useSnapshot(source));
      expect(subject.result.current).toBe(initial);
      subject.rerender();
      expect(subject.result.current).toBe(initial);
      expect(subscribe).toHaveBeenCalledOnce();
      act(() => source.publish(updated));
      expect(subject.result.current).toBe(updated);
      expect(subscribe).toHaveBeenCalledOnce();
      act(() => source.publish(updated));
      expect(subject.result.current).toBe(updated);
    });

    it("replaces the source and ignores old notifications, including a captured stale listener", () => {
      const source = new SnapshotSource(initial);
      const replacement = new SnapshotSource(updated);
      const subject = renderHook(({ source }) => useSnapshot(source), {
        initialProps: { source },
      });
      const stale = [...source.listeners][0]!;
      subject.rerender({ source: replacement });
      expect(source.listeners.size).toBe(0);
      expect(replacement.listeners.size).toBe(1);
      expect(subject.result.current).toBe(updated);
      act(() => replacement.publish(initial));
      expect(subject.result.current).toBe(initial);
      act(() => {
        source.publish(updated);
        stale();
      });
      expect(subject.result.current).toBe(initial);
      subject.unmount();
      expect(replacement.listeners.size).toBe(0);
    });

    it("keeps simultaneous consumers independent and only unsubscribes during Strict Mode cleanup", () => {
      const source = new SnapshotSource(initial);
      const subscribe = vi.spyOn(source, "subscribe");
      const first = renderHook(() => useSnapshot(source), {
        wrapper: StrictMode,
      });
      const second = renderHook(() => useSnapshot(source));
      expect(source.listeners.size).toBe(2);
      expect(subscribe.mock.calls.length).toBeGreaterThanOrEqual(3);
      first.unmount();
      expect(source.listeners.size).toBe(1);
      act(() => source.publish(updated));
      expect(second.result.current).toBe(updated);
      second.unmount();
      expect(source.listeners.size).toBe(0);
      for (const action of [
        source.close,
        source.check,
        source.checkAvailability,
        source.start,
        source.stop,
        source.setSelection,
      ]) {
        expect(action).not.toHaveBeenCalled();
      }
    });

    it("reads the exact cached server snapshot with its receiver without subscribing", () => {
      const source = new SnapshotSource(initial);
      const subscribe = vi.spyOn(source, "subscribe");
      function ServerConsumer() {
        expect(useSnapshot(source)).toBe(initial);
        return <span>Snapshot available</span>;
      }
      expect(renderToString(<ServerConsumer />)).toContain(
        "Snapshot available",
      );
      expect(subscribe).not.toHaveBeenCalled();
    });
  });
}

const narration: ProductNarrationSnapshot = Object.freeze({
  availability: "available",
  profileId: "synthetic-profile",
  language: "en",
  selection: Object.freeze({ kind: "quick" }),
  startPreferenceStatus: "ready",
  canPersistStartPreference: true,
  playbackRatePercent: 100,
  playbackPreferenceStatus: "ready",
  canPersistPlaybackPreference: true,
  state: undefined,
  failure: undefined,
  preparationFailure: undefined,
  metrics: Object.freeze({
    commandToAudibleMs: undefined,
    bufferingMs: 0,
    intentionalWaitMs: 0,
    playbackMs: 0,
    underrunCount: 0,
    acceptedAudioUnitCount: 0,
    acceptedAudioSampleFrames: 0,
    retainedAudioUnitCount: 0,
    discardedAudioUnitCount: 0,
  }),
  serviceState: "stopped",
  recovery: INITIAL_OPERATIONAL_RECOVERY_SNAPSHOT_V1,
  navigation: Object.freeze({
    playIntent: "inactive",
    settling: false,
    canGoPrevious: false,
    canGoNext: false,
  }),
});
const hardware = new HardwareProfileCompatibilityCoordinator().observe();

subscriptionSuite<ProductNarrationSnapshot>(
  "product narration snapshot hook",
  useProductNarrationSnapshot,
  narration,
  Object.freeze({ ...narration, availability: "unavailable" }),
);
subscriptionSuite<HardwareCompatibilitySnapshotV1>(
  "hardware compatibility snapshot hook",
  useHardwareCompatibilitySnapshot,
  hardware,
  Object.freeze({ ...hardware, status: "unavailable" }),
);
