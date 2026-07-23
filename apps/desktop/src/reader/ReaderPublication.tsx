import type {
  OpenedPublication,
  PublicationNavigationNode,
  SemanticDocumentTarget,
} from "@voxleaf/epub";
import type { ReadingLocatorV1 } from "@voxleaf/shared";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactElement, ReactNode } from "react";

import {
  ActiveVisualLocatorTracker,
  type ActiveVisualLocatorEnvironment,
} from "./active-visual-locator";
import { PublicationRasterImageLoader } from "./publication-raster-image-loader";
import {
  DEFAULT_READER_PREFERENCES,
  type ReaderPreferenceName,
  type ReaderPreferencesV1,
} from "./reader-preferences";
import { ReaderPreferencesControls } from "./ReaderPreferences";
import {
  ChapterTooLargeContent,
  SemanticDocumentContent,
} from "./SemanticDocument";
import {
  ReaderNavigationCoordinator,
  type ReaderTargetAvailability,
} from "./reader-navigation";
import { SemanticDomRangeMapper } from "./semantic-dom-range-mapper";

function unreachable(value: never): never {
  void value;
  throw new Error("Unsupported publication navigation value.");
}

interface NavigationTreeProps {
  readonly nodes: readonly PublicationNavigationNode[];
  readonly coordinator: ReaderNavigationCoordinator;
  readonly onNavigateTarget: (target: SemanticDocumentTarget) => void;
}

function NavigationTree({
  nodes,
  coordinator,
  onNavigateTarget,
}: NavigationTreeProps): ReactElement {
  return (
    <ol className="reader-toc-list">
      {nodes.map((node, index) => (
        <NavigationNodeElement
          key={index}
          node={node}
          coordinator={coordinator}
          onNavigateTarget={onNavigateTarget}
        />
      ))}
    </ol>
  );
}

interface NavigationNodeElementProps {
  readonly node: PublicationNavigationNode;
  readonly coordinator: ReaderNavigationCoordinator;
  readonly onNavigateTarget: (target: SemanticDocumentTarget) => void;
}

function NavigationNodeElement({
  node,
  coordinator,
  onNavigateTarget,
}: NavigationNodeElementProps): ReactElement {
  let label: ReactNode;

  switch (node.kind) {
    case "group":
      label = <span className="reader-toc-group">{node.label}</span>;
      break;
    case "link": {
      const availability = coordinator.targetAvailability(node.target);
      label =
        availability.status === "available" ? (
          <button
            type="button"
            className="reader-toc-link"
            onClick={() => onNavigateTarget(node.target)}
          >
            {node.label}
          </button>
        ) : (
          <span className="reader-toc-unavailable" aria-disabled="true">
            <span>{node.label}</span>
            <span className="reader-target-explanation">
              {" "}
              — {availability.explanation}
            </span>
          </span>
        );
      break;
    }
    default:
      return unreachable(node);
  }

  return (
    <li>
      {label}
      {node.children.length > 0 ? (
        <NavigationTree
          nodes={node.children}
          coordinator={coordinator}
          onNavigateTarget={onNavigateTarget}
        />
      ) : null}
    </li>
  );
}

export interface ReaderPublicationContentProps {
  readonly publication: OpenedPublication;
  readonly initialPreferences?: ReaderPreferencesV1;
  readonly onPreferencesChange?: (preferences: ReaderPreferencesV1) => void;
  readonly onActiveLocatorChange?: (locator: ReadingLocatorV1) => void;
  readonly domRangeMapper?: SemanticDomRangeMapper;
  readonly visualLocatorEnvironment?: ActiveVisualLocatorEnvironment;
}

export function ReaderPublicationContent({
  publication,
  initialPreferences = DEFAULT_READER_PREFERENCES,
  onPreferencesChange,
  onActiveLocatorChange,
  domRangeMapper,
  visualLocatorEnvironment,
}: ReaderPublicationContentProps): ReactElement {
  const [coordinator] = useState(
    () =>
      new ReaderNavigationCoordinator(publication, {
        preferences: initialPreferences,
      }),
  );
  const rasterImageLoader = useMemo(
    () => new PublicationRasterImageLoader(publication),
    [publication],
  );
  const [ownedDomRangeMapper] = useState(() => new SemanticDomRangeMapper());
  const activeDomRangeMapper = domRangeMapper ?? ownedDomRangeMapper;
  const [visualLocatorTracker] = useState(
    () =>
      new ActiveVisualLocatorTracker(publication, activeDomRangeMapper, {
        ...(visualLocatorEnvironment === undefined
          ? {}
          : { environment: visualLocatorEnvironment }),
        initialLocator: coordinator.state.activeLocator,
        onLocator: (locator) => {
          if (coordinator.updateActiveVisualLocator(locator)) {
            onActiveLocatorChange?.(locator);
          }
        },
      }),
  );
  const subscribe = useCallback(
    (listener: () => void) => coordinator.subscribe(listener),
    [coordinator],
  );
  const getSnapshot = useCallback(() => coordinator.state, [coordinator]);
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const activeLocatedBlocks = useMemo(
    () =>
      publication.locators.filter(
        (locatedBlock) => locatedBlock.documentId === state.activeDocument.id,
      ),
    [publication.locators, state.activeDocument.id],
  );
  const readerRef = useRef<HTMLElement | null>(null);
  const destinationRef = useRef<HTMLElement | null>(null);
  const handledNavigationRevision = useRef(0);
  const resumeProgrammaticNavigationRef = useRef<(() => void) | undefined>(
    undefined,
  );
  const setReaderRef = useCallback(
    (element: HTMLElement | null): void => {
      readerRef.current = element;
      visualLocatorTracker.setRoot(element);
    },
    [visualLocatorTracker],
  );
  const finishProgrammaticNavigation = useCallback((): void => {
    visualLocatorTracker.setCurrentLocator(coordinator.state.activeLocator);
    const resume = resumeProgrammaticNavigationRef.current;
    resumeProgrammaticNavigationRef.current = undefined;
    resume?.();
  }, [coordinator, visualLocatorTracker]);
  const focusDestination = useCallback(
    (destination: HTMLElement): void => {
      destination.scrollIntoView?.({ block: "start" });
      if (state.destinationBlock.kind === "heading") {
        destination.focus({ preventScroll: true });
        return;
      }
      readerRef.current?.focus({ preventScroll: true });
    },
    [state.destinationBlock.kind],
  );
  const setDestinationRef = useCallback(
    (element: HTMLElement | null) => {
      destinationRef.current = element;
      if (
        element !== null &&
        state.navigationRevision > 0 &&
        handledNavigationRevision.current !== state.navigationRevision
      ) {
        handledNavigationRevision.current = state.navigationRevision;
        focusDestination(element);
        finishProgrammaticNavigation();
      }
    },
    [finishProgrammaticNavigation, focusDestination, state.navigationRevision],
  );
  const targetAvailability = useCallback(
    (target: SemanticDocumentTarget): ReaderTargetAvailability =>
      coordinator.targetAvailability(target),
    [coordinator],
  );
  const runProgrammaticNavigation = useCallback(
    (navigate: () => void): void => {
      resumeProgrammaticNavigationRef.current?.();
      const resume = visualLocatorTracker.suspend();
      resumeProgrammaticNavigationRef.current = resume;
      const revision = coordinator.state.navigationRevision;
      navigate();
      if (coordinator.state.navigationRevision === revision) {
        finishProgrammaticNavigation();
      }
    },
    [coordinator, finishProgrammaticNavigation, visualLocatorTracker],
  );
  const activateTarget = useCallback(
    (target: SemanticDocumentTarget) =>
      runProgrammaticNavigation(() => coordinator.navigateToTarget(target)),
    [coordinator, runProgrammaticNavigation],
  );
  const updatePreference = useCallback(
    (preference: ReaderPreferenceName, value: string): void => {
      const intent = coordinator.setPreference(preference, value);
      if (intent !== undefined) {
        onPreferencesChange?.(intent.next);
      }
    },
    [coordinator, onPreferencesChange],
  );

  useEffect(
    () => () => {
      void rasterImageLoader.close();
    },
    [rasterImageLoader],
  );
  useEffect(
    () => () => {
      resumeProgrammaticNavigationRef.current?.();
      resumeProgrammaticNavigationRef.current = undefined;
      visualLocatorTracker.close();
    },
    [visualLocatorTracker],
  );
  useEffect(
    () => () => {
      if (domRangeMapper === undefined) {
        ownedDomRangeMapper.close();
      }
    },
    [domRangeMapper, ownedDomRangeMapper],
  );

  useLayoutEffect(() => {
    if (
      state.navigationRevision === 0 ||
      handledNavigationRevision.current === state.navigationRevision
    ) {
      return;
    }

    if (state.contentStatus === "chapter-too-large") {
      handledNavigationRevision.current = state.navigationRevision;
      readerRef.current?.focus({ preventScroll: true });
      finishProgrammaticNavigation();
      return;
    }

    const destination = destinationRef.current;
    if (destination !== null) {
      handledNavigationRevision.current = state.navigationRevision;
      focusDestination(destination);
      finishProgrammaticNavigation();
    }
  }, [
    finishProgrammaticNavigation,
    focusDestination,
    state.contentStatus,
    state.navigationRevision,
  ]);

  return (
    <div
      className="semantic-reader"
      data-reader-mode="continuous"
      data-reader-text-scale={state.preferences.textScale}
      data-reader-line-spacing={state.preferences.lineSpacing}
      data-reader-content-width={state.preferences.contentWidth}
      data-reader-theme={state.preferences.theme}
    >
      <ReaderPreferencesControls
        preferences={state.preferences}
        onChange={updatePreference}
      />
      <div className="reader-layout">
        <nav className="reader-toc" aria-label="Table of contents">
          <h3>Table of contents</h3>
          {publication.navigation.length === 0 ? (
            <p className="reader-toc-empty">
              No table of contents is available.
            </p>
          ) : (
            <NavigationTree
              nodes={publication.navigation}
              coordinator={coordinator}
              onNavigateTarget={activateTarget}
            />
          )}
        </nav>
        <div className="reader-reading-pane">
          <div
            className="reader-chapter-controls"
            aria-label="Chapter navigation"
          >
            <button
              type="button"
              disabled={!state.canGoPrevious}
              onClick={() =>
                runProgrammaticNavigation(() => coordinator.goPrevious())
              }
            >
              Previous chapter
            </button>
            <button
              type="button"
              disabled={!state.canGoNext}
              onClick={() =>
                runProgrammaticNavigation(() => coordinator.goNext())
              }
            >
              Next chapter
            </button>
          </div>
          <p
            className="reader-navigation-status"
            aria-live="polite"
            aria-atomic="true"
          >
            {state.message}
          </p>
          <div className="reader-content">
            {state.contentStatus === "chapter-too-large" ? (
              <ChapterTooLargeContent readerRef={setReaderRef} />
            ) : (
              <SemanticDocumentContent
                key={state.activeLocator.spineItemIndex}
                document={state.activeDocument}
                targetAvailability={targetAvailability}
                onActivateTarget={activateTarget}
                destinationBlock={state.destinationBlock}
                destinationRef={setDestinationRef}
                readerRef={setReaderRef}
                rasterImageLoader={rasterImageLoader}
                domRangeMapper={activeDomRangeMapper}
                visualLocatorTracker={visualLocatorTracker}
                locatedBlocks={activeLocatedBlocks}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
