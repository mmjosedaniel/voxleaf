import type { PublicationLocatedBlock } from "@voxleaf/epub";
import {
  useCallback,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from "react";
import type { CSSProperties, ReactElement } from "react";

import type { ReaderExperienceLeafState } from "./reader-experience-authority";
import type { SemanticDomRangeMapper } from "./semantic-dom-range-mapper";

interface ParagraphLeafPosition {
  readonly top: number;
}

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
): ParagraphLeafPosition | undefined {
  try {
    const rootRect = root.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const top = targetRect.top - rootRect.top;
    return Number.isFinite(top)
      ? Object.freeze({ top: Math.max(0, top) })
      : undefined;
  } catch {
    return undefined;
  }
}

function samePosition(
  left: ParagraphLeafPosition | undefined,
  right: ParagraphLeafPosition | undefined,
): boolean {
  return left?.top === right?.top;
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
  const [position, setPosition] = useState<ParagraphLeafPosition | undefined>(
    undefined,
  );
  const updatePosition = useCallback((): void => {
    const target =
      locatedBlock === undefined
        ? undefined
        : domRangeMapper.elementFor(locatedBlock);
    const next =
      contentRoot === null || target === undefined
        ? undefined
        : positionFor(contentRoot, target);
    setPosition((current) => (samePosition(current, next) ? current : next));
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

  if (
    locatedBlock === undefined ||
    state === undefined ||
    position === undefined
  ) {
    return null;
  }
  const style = {
    "--paragraph-leaf-top": `${String(position.top)}px`,
  } as CSSProperties;
  const visibleState = VISIBLE_STATES[state];

  return (
    <div className="paragraph-leaf-host" style={style}>
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
