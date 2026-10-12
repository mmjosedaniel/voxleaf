import type { HardwareProfileCompatibilityCoordinator } from "./hardware-profile-compatibility";

type HardwareCompatibilityCheckTarget = Pick<
  HardwareProfileCompatibilityCoordinator,
  "ensureChecked" | "check"
>;

interface HardwareCheckVisibilitySource {
  readonly visibilityState: DocumentVisibilityState;
  addEventListener(type: "visibilitychange", listener: () => void): void;
  removeEventListener(type: "visibilitychange", listener: () => void): void;
}

export function bindHardwareCompatibilityChecks(
  target: HardwareCompatibilityCheckTarget,
  visibilitySource: HardwareCheckVisibilitySource,
): () => void {
  void target.ensureChecked();
  let observedHidden = visibilitySource.visibilityState === "hidden";
  const handleVisibilityChange = (): void => {
    if (visibilitySource.visibilityState === "hidden") {
      observedHidden = true;
      return;
    }
    if (observedHidden) {
      observedHidden = false;
      void target.check("operating-system-resume");
    }
  };
  visibilitySource.addEventListener("visibilitychange", handleVisibilityChange);
  return () => {
    visibilitySource.removeEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );
  };
}
