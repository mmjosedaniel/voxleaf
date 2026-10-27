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
  reconcile: () => Promise<void> = async () => undefined,
): () => void {
  void target.ensureChecked();
  let active = true;
  let revision = 0;
  let observedHidden = visibilitySource.visibilityState === "hidden";
  const handleVisibilityChange = (): void => {
    if (visibilitySource.visibilityState === "hidden") {
      observedHidden = true;
      return;
    }
    if (observedHidden) {
      observedHidden = false;
      const current = ++revision;
      void target.check("operating-system-resume").then(async () => {
        if (active && current === revision) await reconcile();
      });
    }
  };
  visibilitySource.addEventListener("visibilitychange", handleVisibilityChange);
  return () => {
    active = false;
    visibilitySource.removeEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );
  };
}
