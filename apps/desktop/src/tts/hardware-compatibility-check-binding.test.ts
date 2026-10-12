import { describe, expect, it, vi } from "vitest";

import { bindHardwareCompatibilityChecks } from "./hardware-compatibility-check-binding";
import type {
  HardwareCompatibilitySnapshotV1,
  HardwareProfileCompatibilityCoordinator,
} from "./hardware-profile-compatibility";

const pendingCheck = new Promise<HardwareCompatibilitySnapshotV1>(() => {});

function createTarget() {
  return {
    ensureChecked: vi.fn<
      HardwareProfileCompatibilityCoordinator["ensureChecked"]
    >(() => pendingCheck),
    check: vi.fn<HardwareProfileCompatibilityCoordinator["check"]>(
      () => pendingCheck,
    ),
  };
}

function createVisibilitySource(initial: DocumentVisibilityState = "visible") {
  let visibility = initial;
  const listeners = new Set<() => void>();
  const setup: string[] = [];
  return {
    setup,
    get visibilityState() {
      setup.push("visibility");
      return visibility;
    },
    addEventListener: vi.fn(
      (_type: "visibilitychange", listener: () => void) => {
        setup.push("listen");
        listeners.add(listener);
      },
    ),
    removeEventListener: vi.fn(
      (_type: "visibilitychange", listener: () => void) => {
        listeners.delete(listener);
      },
    ),
    setVisibility(next: DocumentVisibilityState) {
      visibility = next;
    },
    dispatch() {
      for (const listener of listeners) {
        listener();
      }
    },
  };
}

describe("hardware compatibility check binding", () => {
  it("checks before reading visibility and subscribes without awaiting, preserving receivers", () => {
    const source = createVisibilitySource();
    const target = createTarget();
    target.ensureChecked.mockImplementation(() => {
      source.setup.push("ensure");
      return pendingCheck;
    });
    const disconnect = bindHardwareCompatibilityChecks(target, source);
    expect(source.setup).toEqual(["ensure", "visibility", "listen"]);
    expect(target.ensureChecked.mock.contexts).toEqual([target]);
    expect(source.addEventListener.mock.contexts).toEqual([source]);
    source.dispatch();
    expect(target.check).not.toHaveBeenCalled();
    source.setVisibility("hidden");
    source.dispatch();
    source.setVisibility("visible");
    source.dispatch();
    expect(target.check.mock.contexts).toEqual([target]);
    disconnect();
    expect(source.removeEventListener.mock.contexts).toEqual([source]);
    expect(source.removeEventListener).toHaveBeenCalledExactlyOnceWith(
      "visibilitychange",
      source.addEventListener.mock.calls[0]![1],
    );
    source.setVisibility("hidden");
    source.dispatch();
    source.setVisibility("visible");
    source.dispatch();
    expect(target.check).toHaveBeenCalledTimes(1);
  });

  it.each(["visible", "hidden"] as const)(
    "consumes each hidden period once when initially %s, before a reentrant event",
    (initial) => {
      const source = createVisibilitySource(initial);
      const target = createTarget();
      target.check.mockImplementation(() => {
        if (target.check.mock.calls.length === 1) {
          source.dispatch();
        }
        return pendingCheck;
      });
      const disconnect = bindHardwareCompatibilityChecks(target, source);
      source.dispatch();
      source.dispatch();
      expect(target.check).not.toHaveBeenCalled();
      source.setVisibility("hidden");
      source.dispatch();
      source.dispatch();
      expect(target.check).not.toHaveBeenCalled();
      source.setVisibility("visible");
      source.dispatch();
      source.dispatch();
      expect(target.check).toHaveBeenCalledExactlyOnceWith(
        "operating-system-resume",
      );
      source.setVisibility("hidden");
      source.dispatch();
      source.setVisibility("visible");
      source.dispatch();
      expect(target.check).toHaveBeenCalledTimes(2);
      disconnect();
    },
  );

  it("keeps flags and disconnection independent across bindings", () => {
    const source = createVisibilitySource("hidden");
    const first = createTarget();
    const second = createTarget();
    const disconnectFirst = bindHardwareCompatibilityChecks(first, source);
    source.setVisibility("visible");
    const disconnectSecond = bindHardwareCompatibilityChecks(second, source);
    source.dispatch();
    expect(first.check).toHaveBeenCalledTimes(1);
    expect(second.check).not.toHaveBeenCalled();
    disconnectFirst();
    source.setVisibility("hidden");
    source.dispatch();
    source.setVisibility("visible");
    source.dispatch();
    expect(first.check).toHaveBeenCalledTimes(1);
    expect(second.check).toHaveBeenCalledExactlyOnceWith(
      "operating-system-resume",
    );
    disconnectSecond();
  });
});
