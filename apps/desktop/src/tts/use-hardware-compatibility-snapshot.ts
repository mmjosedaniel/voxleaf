import { useCallback, useSyncExternalStore } from "react";

import type {
  HardwareCompatibilitySnapshotV1,
  HardwareProfileCompatibilityCoordinator,
} from "./hardware-profile-compatibility";

type HardwareCompatibilitySnapshotSource = Pick<
  HardwareProfileCompatibilityCoordinator,
  "subscribe" | "observe"
>;

export function useHardwareCompatibilitySnapshot(
  source: HardwareCompatibilitySnapshotSource,
): HardwareCompatibilitySnapshotV1 {
  const subscribe = useCallback(
    (listener: () => void) => source.subscribe(listener),
    [source],
  );
  const observe = useCallback(() => source.observe(), [source]);
  return useSyncExternalStore(subscribe, observe, observe);
}
