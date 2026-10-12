import { useCallback, useSyncExternalStore } from "react";

import type {
  ProductNarrationCoordinator,
  ProductNarrationSnapshot,
} from "./product-narration-coordinator";

type ProductNarrationSnapshotSource = Pick<
  ProductNarrationCoordinator,
  "subscribe" | "observe"
>;

export function useProductNarrationSnapshot(
  source: ProductNarrationSnapshotSource,
): ProductNarrationSnapshot {
  const subscribe = useCallback(
    (listener: () => void) => source.subscribe(listener),
    [source],
  );
  const observe = useCallback(() => source.observe(), [source]);
  return useSyncExternalStore(subscribe, observe, observe);
}
