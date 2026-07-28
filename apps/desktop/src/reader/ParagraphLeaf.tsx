import type { PublicationLocatedBlock } from "@voxleaf/epub";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import type { ReactElement } from "react";

import type { ReaderExperienceLeafState } from "./reader-experience-authority";
import type { SemanticDomRangeMapper } from "./semantic-dom-range-mapper";

export interface ParagraphLeafProps {
  readonly contentRoot: HTMLElement | null;
  readonly domRangeMapper: SemanticDomRangeMapper;
  readonly locatedBlock: PublicationLocatedBlock | undefined;
  readonly state: ReaderExperienceLeafState | undefined;
  readonly layoutRevision: string;
  readonly onActivate: (locatedBlock: PublicationLocatedBlock) => void;
}

const LABELS: Readonly<Record<ReaderExperienceLeafState, string>> =
  Object.freeze({
    preview: "Start narration at this paragraph",
    preparing: "Preparing narration at this paragraph",
    audible: "Narrating this paragraph",
    checkpoint: "Resume narration at saved checkpoint",
  });

const VISIBLE_STATES: Readonly<
  Partial<Record<ReaderExperienceLeafState, string>>
> = Object.freeze({
  preparing: "Preparing",
  audible: "Current",
  checkpoint: "Saved",
});

function positionFor(
  root: HTMLElement,
  target: HTMLElement,
): number | undefined {
  try {
    const rootRect = root.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const top = targetRect.top - rootRect.top;
    return Number.isFinite(top) ? Math.max(0, top) : undefined;
  } catch {
    return undefined;
  }
}

export function ParagraphLeaf({
  contentRoot,
  domRangeMapper,
  locatedBlock,
  state,
  layoutRevision,
  onActivate,
}: ParagraphLeafProps): ReactElement | null {
  const subscribeRegistrations = useCallback(
    (listener: () => void) => domRangeMapper.subscribe(listener),
    [domRangeMapper],
  );
  const getRegistrationCount = useCallback(
    () => domRangeMapper.registrationCount,
    [domRangeMapper],
  );
  const registrationCount = useSyncExternalStore(
    subscribeRegistrations,
    getRegistrationCount,
    () => 0,
  );
  const hostRef = useRef<HTMLDivElement>(null);
  const updatePosition = useCallback((): void => {
    const host = hostRef.current;
    if (host === null) {
      return;
    }
    const target =
      locatedBlock === undefined
        ? undefined
        : domRangeMapper.elementFor(locatedBlock);
    const next =
      contentRoot === null || target === undefined
        ? undefined
        : positionFor(contentRoot, target);
    if (next === undefined) {
      host.hidden = true;
      host.style.removeProperty("--paragraph-leaf-top");
      return;
    }
    host.style.setProperty("--paragraph-leaf-top", `${String(next)}px`);
    host.hidden = false;
  }, [contentRoot, domRangeMapper, locatedBlock]);

  useLayoutEffect(() => {
    void registrationCount;
    void layoutRevision;
    updatePosition();
    if (contentRoot === null || locatedBlock === undefined) {
      return;
    }
    const target = domRangeMapper.elementFor(locatedBlock);
    if (target === undefined) {
      return;
    }
    const handleLayout = (): void => updatePosition();
    window.addEventListener("resize", handleLayout);
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(handleLayout);
    observer?.observe(contentRoot);
    observer?.observe(target);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", handleLayout);
    };
  }, [
    contentRoot,
    domRangeMapper,
    layoutRevision,
    locatedBlock,
    registrationCount,
    updatePosition,
  ]);

  if (locatedBlock === undefined || state === undefined) {
    return null;
  }
  const visibleState = VISIBLE_STATES[state];

  return (
    <div ref={hostRef} className="paragraph-leaf-host" hidden>
      <button
        type="button"
        className="paragraph-leaf"
        data-leaf-state={state}
        aria-label={LABELS[state]}
        aria-current={state === "audible" ? "true" : undefined}
        onClick={() => onActivate(locatedBlock)}
      >
        <svg
          className="paragraph-leaf-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M20.4 3.1C13.7 3.3 7.8 5.8 4.7 10.4c-2 3-1.6 6.1-.7 8.2 2.2-3.5 5.4-6.4 9.5-8.7-3.3 2.9-5.8 6.3-7.4 10.2 2.1.7 5 .8 7.5-1 4.5-3.2 6.6-9.4 6.8-16Z" />
        </svg>
        {visibleState === undefined ? null : (
          <span className="paragraph-leaf-state">{visibleState}</span>
        )}
      </button>
    </div>
  );
}
