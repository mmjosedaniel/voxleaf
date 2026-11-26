import {
  useCallback,
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
  type RefObject,
  type TouchEvent,
  type UIEvent,
} from "react";

import type { ActiveVisualLocatorTracker } from "./active-visual-locator";
import type { ReaderReflowRestorer } from "./reader-reflow-restoration";
import type { SegmentHighlightController } from "./segment-highlight-controller";

const SCROLL_KEYS = [
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
];

export function useReaderViewportInput(
  viewportRef: RefObject<HTMLDivElement | null>,
  visualLocatorTracker: ActiveVisualLocatorTracker,
  reflowRestorer: ReaderReflowRestorer,
  segmentHighlightController: SegmentHighlightController,
) {
  const releaseScrollbarGesture = useRef<(() => void) | undefined>(undefined);
  const recordManualScrollIntent = useCallback((): void => {
    visualLocatorTracker.noteManualScrollIntent();
    reflowRestorer.cancelViewportRestoration();
  }, [reflowRestorer, visualLocatorTracker]);

  const admitManualMovement = useCallback((): void => {
    if (visualLocatorTracker.admitManualScrollMovement()) {
      segmentHighlightController.manualInspection();
      visualLocatorTracker.requestSample();
    }
  }, [segmentHighlightController, visualLocatorTracker]);

  const recordWheelIntent = useCallback(
    (event: WheelEvent): void => {
      const root = viewportRef.current;
      if (
        root !== null &&
        event.isTrusted &&
        !event.defaultPrevented &&
        !event.ctrlKey &&
        !event.metaKey &&
        // A wheel facing a hard boundary cannot own a later restoration
        // scroll. Account for subpixel scrollTop and integer viewport bounds.
        ((event.deltaY < 0 && root.scrollTop > 0.5) ||
          (event.deltaY > 0 &&
            root.scrollTop + root.clientHeight < root.scrollHeight - 0.5))
      )
        recordManualScrollIntent();
    },
    [recordManualScrollIntent, viewportRef],
  );

  const recordScrollbarIntent = useCallback(
    (event: PointerEvent): void => {
      const root = viewportRef.current;
      if (
        !event.isTrusted ||
        event.button !== 0 ||
        event.pointerType !== "mouse" ||
        root === null ||
        event.target !== root ||
        root.scrollHeight <= root.clientHeight
      )
        return;
      const rect = root.getBoundingClientRect();
      const contentLeft = rect.left + root.clientLeft;
      const contentRight = contentLeft + root.clientWidth;
      // Native vertical scrollbar only; content selection/padding is not intent.
      if (
        event.clientX < rect.left ||
        event.clientX >= rect.right ||
        (event.clientX >= contentLeft && event.clientX < contentRight) ||
        event.clientY < rect.top + root.clientTop ||
        event.clientY >= rect.top + root.clientTop + root.clientHeight
      )
        return;
      releaseScrollbarGesture.current?.();
      visualLocatorTracker.noteManualScrollIntent(true);
      reflowRestorer.cancelViewportRestoration();
      const view = root.ownerDocument.defaultView;
      const release = (): void => {
        root.ownerDocument.removeEventListener("pointerup", finish, true);
        root.ownerDocument.removeEventListener("pointercancel", finish, true);
        view?.removeEventListener("blur", release);
        releaseScrollbarGesture.current = undefined;
        admitManualMovement();
        visualLocatorTracker.clearManualScrollIntent(true);
      };
      const finish = (ended: PointerEvent): void => {
        if (ended.pointerId === event.pointerId) release();
      };
      releaseScrollbarGesture.current = release;
      root.ownerDocument.addEventListener("pointerup", finish, true);
      root.ownerDocument.addEventListener("pointercancel", finish, true);
      view?.addEventListener("blur", release);
    },
    [admitManualMovement, reflowRestorer, viewportRef, visualLocatorTracker],
  );
  useLayoutEffect(() => () => releaseScrollbarGesture.current?.(), []);

  const bindViewportInput = useCallback(
    (element: HTMLDivElement | null): void => {
      const previous = viewportRef.current;
      if (previous === element) return;
      // Finish the gesture while its original root still owns movement.
      releaseScrollbarGesture.current?.();
      previous?.removeEventListener("wheel", recordWheelIntent);
      previous?.removeEventListener("pointerdown", recordScrollbarIntent);
      // Read scrollTop before Chromium can scroll on the compositor.
      element?.addEventListener("wheel", recordWheelIntent, { passive: false });
      element?.addEventListener("pointerdown", recordScrollbarIntent);
    },
    [recordScrollbarIntent, recordWheelIntent, viewportRef],
  );

  function onTouchMove(event: TouchEvent<HTMLDivElement>): void {
    if (event.isTrusted && event.touches.length === 1)
      recordManualScrollIntent();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (
      event.isTrusted &&
      !event.defaultPrevented &&
      (!event.ctrlKey || event.key === "Home" || event.key === "End") &&
      !event.metaKey &&
      !event.altKey &&
      (!event.shiftKey || event.key === " ") &&
      event.target instanceof HTMLElement &&
      (event.target.closest(
        "a,button,input,select,textarea,summary,[contenteditable=true],[role=button]",
      ) === null ||
        ((event.key === "PageUp" || event.key === "PageDown") &&
          event.target.closest("button.semantic-internal-link") !== null)) &&
      event.currentTarget.ownerDocument.getSelection()?.isCollapsed !== false &&
      SCROLL_KEYS.includes(event.key)
    )
      recordManualScrollIntent();
  }

  function onScroll(event: UIEvent<HTMLDivElement>): void {
    if (event.target !== event.currentTarget) return;
    admitManualMovement();
  }

  return { bindViewportInput, onTouchMove, onKeyDown, onScroll };
}
