import { useEffect, useRef } from "react";

/**
 * React StrictMode immediately probes an effect with setup-cleanup-setup in
 * development. Deferring close by one microtask lets the second setup
 * supersede that probe while a real unmount still releases the resource.
 */
export function useStrictModeSafeResourceCleanup<
  Resource extends { readonly close: () => void | Promise<void> },
>(resource: Resource | undefined): void {
  const activeResource = useRef<Resource | undefined>(undefined);
  const cleanupToken = useRef<{ superseded: boolean } | undefined>(undefined);

  useEffect(() => {
    if (cleanupToken.current !== undefined) {
      cleanupToken.current.superseded = true;
    }
    const currentCleanup = { superseded: false };
    cleanupToken.current = currentCleanup;
    const previous = activeResource.current;
    if (previous !== undefined && previous !== resource) {
      activeResource.current = undefined;
      void previous.close();
    }
    activeResource.current = resource;

    return () => {
      queueMicrotask(() => {
        if (currentCleanup.superseded || activeResource.current !== resource) {
          return;
        }
        activeResource.current = undefined;
        void resource?.close();
      });
    };
  }, [resource]);
}
