import type {
  OpenedPublication,
  PublicationLocatedBlock,
  PublicationNavigationNode,
  SemanticDocumentTarget,
} from "@voxleaf/epub";
import type { ReadingLocatorV1 } from "@voxleaf/shared";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type {
  MouseEvent as ReactMouseEvent,
  ReactElement,
  ReactNode,
} from "react";

import { useStrictModeSafeResourceCleanup } from "../strict-mode-resource-cleanup";
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
import {
  ReaderReflowRestorer,
  type ReaderReflowEnvironment,
} from "./reader-reflow-restoration";
import {
  SegmentHighlightController,
  type ReaderNarrationSource,
  type SegmentHighlightEnvironment,
} from "./segment-highlight-controller";
import { ReaderPreferencesControls } from "./ReaderPreferences";
import {
  ChapterTooLargeContent,
  SemanticDocumentContent,
} from "./SemanticDocument";
import {
  ReaderNavigationCoordinator,
  type ReaderTargetAvailability,
} from "./reader-navigation";
import { ParagraphLeafController } from "./paragraph-leaf-controller";
import { ParagraphLeaf } from "./ParagraphLeaf";
import { SemanticDomRangeMapper } from "./semantic-dom-range-mapper";
import { SYNCHRONIZATION_AUTHORITY_V1 } from "./synchronization-authority";

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
  readonly initialLocator?: ReadingLocatorV1;
  readonly restoreInitialLocator?: boolean;
  readonly onPreferencesChange?: (preferences: ReaderPreferencesV1) => void;
  readonly onActiveLocatorChange?: (locator: ReadingLocatorV1) => void;
  readonly onNavigationIntent?: (
    event: ReaderUserNavigationEvent,
  ) => void | Promise<void>;
  readonly onSettledLocatorChange?: (
    locator: ReadingLocatorV1,
    reason: ReaderLocatorSettlementReason,
  ) => void;
  readonly onInitialRestorationSettled?: (
    settlement: ReaderInitialRestorationSettlement,
  ) => void;
  readonly domRangeMapper?: SemanticDomRangeMapper;
  readonly visualLocatorEnvironment?: ActiveVisualLocatorEnvironment;
  readonly reflowEnvironment?: ReaderReflowEnvironment;
  readonly narrationSource?: ReaderNarrationSource;
  readonly segmentHighlightEnvironment?: SegmentHighlightEnvironment;
}

export type ReaderUserNavigationEvent =
  "chapter-navigation" | "narration-boundary";

export type ReaderLocatorSettlementReason =
  ReaderUserNavigationEvent | "reflow";

export interface ReaderInitialRestorationSettlement {
  readonly status: "settled" | "superseded" | "unavailable";
  readonly locator: ReadingLocatorV1;
}

class UserVisualNavigationIntentGate {
  #active = false;
  #timeout: number | undefined;

  public mark(): void {
    this.clear();
    this.#active = true;
    this.#timeout = window.setTimeout(
      () => this.clear(),
      SYNCHRONIZATION_AUTHORITY_V1.manualNavigation.settlementMs,
    );
  }

  public accept(narrationActive: boolean): boolean {
    if (narrationActive && !this.#active) {
      return false;
    }
    this.clear();
    return true;
  }

  public clear(): void {
    this.#active = false;
    if (this.#timeout !== undefined) {
      window.clearTimeout(this.#timeout);
      this.#timeout = undefined;
    }
  }
}

export function ReaderPublicationContent({
  publication,
  initialPreferences = DEFAULT_READER_PREFERENCES,
  initialLocator,
  restoreInitialLocator = false,
  onPreferencesChange,
  onActiveLocatorChange,
  onNavigationIntent,
  onSettledLocatorChange,
  onInitialRestorationSettled,
  domRangeMapper,
  visualLocatorEnvironment,
  reflowEnvironment,
  narrationSource,
  segmentHighlightEnvironment,
}: ReaderPublicationContentProps): ReactElement {
  const [coordinator] = useState(
    () =>
      new ReaderNavigationCoordinator(publication, {
        ...(initialLocator === undefined ? {} : { initialLocator }),
        preferences: initialPreferences,
      }),
  );
  const rasterImageLoader = useMemo(
    () => new PublicationRasterImageLoader(publication),
    [publication],
  );
  useStrictModeSafeResourceCleanup(rasterImageLoader);
  const [ownedDomRangeMapper] = useState(() => new SemanticDomRangeMapper());
  const activeDomRangeMapper = domRangeMapper ?? ownedDomRangeMapper;
  const [paragraphLeafController] = useState(
    () => new ParagraphLeafController(publication, initialLocator),
  );
  useStrictModeSafeResourceCleanup(paragraphLeafController);
  const initialRestorationRequired =
    restoreInitialLocator && initialLocator !== undefined;
  const [visualNavigationIntent] = useState(
    () => new UserVisualNavigationIntentGate(),
  );
  const [visualLocatorTracker] = useState(
    () =>
      new ActiveVisualLocatorTracker(publication, activeDomRangeMapper, {
        ...(visualLocatorEnvironment === undefined
          ? {}
          : { environment: visualLocatorEnvironment }),
        initialLocator: coordinator.state.activeLocator,
        onLocator: (locator) => {
          if (
            !visualNavigationIntent.accept(
              narrationSource !== undefined &&
                narrationSource.observe().navigation.playIntent !== "inactive",
            )
          ) {
            return;
          }
          if (coordinator.updateActiveVisualLocator(locator)) {
            onActiveLocatorChange?.(locator);
          }
        },
      }),
  );
  useStrictModeSafeResourceCleanup(visualLocatorTracker);
  const [initialVisualLocatorResume] = useState(() =>
    initialRestorationRequired ? visualLocatorTracker.suspend() : undefined,
  );
  const initialVisualLocatorResumeRef = useRef(initialVisualLocatorResume);
  const initialRestorationStatus = useRef<
    "pending" | ReaderInitialRestorationSettlement["status"]
  >(initialRestorationRequired ? "pending" : "settled");
  const initialRestorationStarted = useRef(false);
  const [initialRestorationPending, setInitialRestorationPending] = useState(
    initialRestorationRequired,
  );
  const completeInitialRestoration = useCallback(
    (settlement: ReaderInitialRestorationSettlement): void => {
      if (initialRestorationStatus.current !== "pending") {
        return;
      }
      initialRestorationStatus.current = settlement.status;
      setInitialRestorationPending(false);
      const resume = initialVisualLocatorResumeRef.current;
      initialVisualLocatorResumeRef.current = undefined;
      resume?.({ requestSample: false });
      onInitialRestorationSettled?.(settlement);
    },
    [onInitialRestorationSettled],
  );
  const [pendingInitialSettlement, setPendingInitialSettlement] = useState<
    ReaderInitialRestorationSettlement | undefined
  >(undefined);
  const [reflowRestorer] = useState(
    () =>
      new ReaderReflowRestorer(
        publication,
        activeDomRangeMapper,
        visualLocatorTracker,
        {
          ...(reflowEnvironment === undefined
            ? {}
            : { environment: reflowEnvironment }),
          currentLocator: () => coordinator.state.activeLocator,
          onRestored: (result) => {
            if (result.reason === "preference") {
              onSettledLocatorChange?.(result.locator, "reflow");
            } else if (result.reason === "restoration") {
              setPendingInitialSettlement(
                Object.freeze({
                  status:
                    result.placement === "unavailable"
                      ? "unavailable"
                      : "settled",
                  locator: result.locator,
                }),
              );
            }
          },
        },
      ),
  );
  useStrictModeSafeResourceCleanup(reflowRestorer);
  useLayoutEffect(() => {
    if (pendingInitialSettlement !== undefined) {
      completeInitialRestoration(pendingInitialSettlement);
    }
  }, [completeInitialRestoration, pendingInitialSettlement]);
  const subscribe = useCallback(
    (listener: () => void) => coordinator.subscribe(listener),
    [coordinator],
  );
  const getSnapshot = useCallback(() => coordinator.state, [coordinator]);
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const leafSnapshot = useSyncExternalStore(
    paragraphLeafController.subscribe,
    paragraphLeafController.getSnapshot,
    paragraphLeafController.getSnapshot,
  );
  const navigationId = useId();
  const contentId = useId();
  const activeLocatedBlocks = useMemo(
    () =>
      publication.locators.filter(
        (locatedBlock) => locatedBlock.documentId === state.activeDocument.id,
      ),
    [publication.locators, state.activeDocument.id],
  );
  const readerDocumentRef = useRef<HTMLElement | null>(null);
  const readerViewportRef = useRef<HTMLDivElement | null>(null);
  const [readerContentRoot, setReaderContentRoot] =
    useState<HTMLDivElement | null>(null);
  const navigationRef = useRef<HTMLElement | null>(null);
  const destinationRef = useRef<HTMLElement | null>(null);
  const handledNavigationRevision = useRef(0);
  const pendingPositionSaveRevision = useRef<number | undefined>(undefined);
  const pendingNavigationReason = useRef<ReaderUserNavigationEvent | undefined>(
    undefined,
  );
  const programmaticNavigationRequest = useRef(0);
  const resumeProgrammaticNavigationRef = useRef<(() => void) | undefined>(
    undefined,
  );
  const [segmentHighlightController] = useState(
    () =>
      new SegmentHighlightController(
        publication.locators,
        activeDomRangeMapper,
        undefined,
        segmentHighlightEnvironment,
      ),
  );
  useStrictModeSafeResourceCleanup(segmentHighlightController);
  useStrictModeSafeResourceCleanup(
    domRangeMapper === undefined ? ownedDomRangeMapper : undefined,
  );
  useLayoutEffect(() => {
    const callbacks = {
      navigateToLocator: (locator: ReadingLocatorV1) => {
        visualNavigationIntent.clear();
        reflowRestorer.cancel();
        completeInitialRestoration(
          Object.freeze({
            status: "superseded",
            locator: coordinator.state.activeLocator,
          }),
        );
        pendingPositionSaveRevision.current = undefined;
        const previousRevision = coordinator.state.navigationRevision;
        coordinator.navigateToLocator(locator);
        if (coordinator.state.navigationRevision !== previousRevision) {
          handledNavigationRevision.current =
            coordinator.state.navigationRevision;
        }
      },
      settleLocator: (locator: ReadingLocatorV1) => {
        visualNavigationIntent.clear();
        visualLocatorTracker.setCurrentLocator(locator);
        coordinator.updateActiveVisualLocator(locator);
      },
      suspendVisualSampling: () => visualLocatorTracker.suspend(),
    };
    segmentHighlightController.setCallbacks(callbacks);
    return () => segmentHighlightController.setCallbacks(undefined);
  }, [
    completeInitialRestoration,
    coordinator,
    reflowRestorer,
    segmentHighlightController,
    visualNavigationIntent,
    visualLocatorTracker,
  ]);
  const attemptInitialRestoration = useCallback((): void => {
    if (
      initialRestorationStatus.current !== "pending" ||
      initialRestorationStarted.current ||
      readerDocumentRef.current === null ||
      readerViewportRef.current === null ||
      destinationRef.current === null
    ) {
      return;
    }
    initialRestorationStarted.current = true;
    if (
      !reflowRestorer.preserve(coordinator.state.activeLocator, "restoration")
    ) {
      completeInitialRestoration(
        Object.freeze({
          status: "unavailable",
          locator: coordinator.state.activeLocator,
        }),
      );
    }
  }, [completeInitialRestoration, coordinator, reflowRestorer]);
  const setReaderViewportRef = useCallback(
    (element: HTMLDivElement | null): void => {
      readerViewportRef.current = element;
      visualLocatorTracker.setRoot(element);
      reflowRestorer.setRoot(element);
      segmentHighlightController.setRoot(element);
      attemptInitialRestoration();
    },
    [
      attemptInitialRestoration,
      reflowRestorer,
      segmentHighlightController,
      visualLocatorTracker,
    ],
  );
  const setReaderDocumentRef = useCallback(
    (element: HTMLElement | null): void => {
      readerDocumentRef.current = element;
      attemptInitialRestoration();
    },
    [attemptInitialRestoration],
  );
  const finishProgrammaticNavigation = useCallback((): void => {
    visualLocatorTracker.setCurrentLocator(coordinator.state.activeLocator);
    if (
      pendingPositionSaveRevision.current ===
      coordinator.state.navigationRevision
    ) {
      pendingPositionSaveRevision.current = undefined;
      const reason = pendingNavigationReason.current;
      pendingNavigationReason.current = undefined;
      if (reason !== undefined) {
        onSettledLocatorChange?.(coordinator.state.activeLocator, reason);
      }
    }
    const resume = resumeProgrammaticNavigationRef.current;
    resumeProgrammaticNavigationRef.current = undefined;
    resume?.();
  }, [coordinator, onSettledLocatorChange, visualLocatorTracker]);
  const focusDestination = useCallback(
    (destination: HTMLElement): void => {
      destination.scrollIntoView?.({ block: "start" });
      if (state.destinationBlock.kind === "heading") {
        destination.focus({ preventScroll: true });
        return;
      }
      readerDocumentRef.current?.focus({ preventScroll: true });
    },
    [state.destinationBlock.kind],
  );
  const setDestinationRef = useCallback(
    (element: HTMLElement | null) => {
      destinationRef.current = element;
      attemptInitialRestoration();
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
    [
      attemptInitialRestoration,
      finishProgrammaticNavigation,
      focusDestination,
      state.navigationRevision,
    ],
  );
  const targetAvailability = useCallback(
    (target: SemanticDocumentTarget): ReaderTargetAvailability =>
      coordinator.targetAvailability(target),
    [coordinator],
  );
  const runProgrammaticNavigation = useCallback(
    (navigate: () => void, reason: ReaderUserNavigationEvent): void => {
      const request = programmaticNavigationRequest.current + 1;
      programmaticNavigationRequest.current = request;
      const continueNavigation = (): void => {
        if (programmaticNavigationRequest.current !== request) {
          return;
        }
        reflowRestorer.cancel();
        completeInitialRestoration(
          Object.freeze({
            status: "superseded",
            locator: coordinator.state.activeLocator,
          }),
        );
        resumeProgrammaticNavigationRef.current?.();
        const resume = visualLocatorTracker.suspend();
        resumeProgrammaticNavigationRef.current = resume;
        const revision = coordinator.state.navigationRevision;
        pendingPositionSaveRevision.current = revision + 1;
        pendingNavigationReason.current = reason;
        navigate();
        const nextRevision = coordinator.state.navigationRevision;
        if (nextRevision === revision) {
          pendingPositionSaveRevision.current = undefined;
          pendingNavigationReason.current = undefined;
          finishProgrammaticNavigation();
          onSettledLocatorChange?.(coordinator.state.activeLocator, reason);
        } else if (handledNavigationRevision.current !== nextRevision) {
          pendingPositionSaveRevision.current = nextRevision;
        }
      };
      let invalidation: void | Promise<void>;
      try {
        invalidation = onNavigationIntent?.(reason);
      } catch {
        return;
      }
      if (invalidation === undefined) {
        continueNavigation();
      } else {
        void invalidation.then(continueNavigation).catch(() => undefined);
      }
    },
    [
      coordinator,
      completeInitialRestoration,
      finishProgrammaticNavigation,
      onNavigationIntent,
      onSettledLocatorChange,
      reflowRestorer,
      visualLocatorTracker,
    ],
  );
  const activateTarget = useCallback(
    (target: SemanticDocumentTarget) => {
      runProgrammaticNavigation(
        () => coordinator.navigateToTarget(target),
        "chapter-navigation",
      );
    },
    [coordinator, runProgrammaticNavigation],
  );
  const activateParagraphLeaf = useCallback(
    (locatedBlock: PublicationLocatedBlock): void => {
      const target = locatedBlock.startLocator;
      if (narrationSource?.startAtLocator?.(target) === true) {
        paragraphLeafController.beginPreparation(target);
      }
    },
    [narrationSource, paragraphLeafController],
  );
  const updatePreference = useCallback(
    (preference: ReaderPreferenceName, value: string): void => {
      if (initialRestorationPending) {
        return;
      }
      const intent = coordinator.setPreference(preference, value);
      if (intent !== undefined) {
        reflowRestorer.preserve(intent.locator, "preference");
        onPreferencesChange?.(intent.next);
      }
    },
    [
      coordinator,
      initialRestorationPending,
      onPreferencesChange,
      reflowRestorer,
    ],
  );
  const focusReaderContent = useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement>): void => {
      event.preventDefault();
      readerDocumentRef.current?.focus({ preventScroll: true });
    },
    [],
  );
  const focusTableOfContents = useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement>): void => {
      event.preventDefault();
      navigationRef.current?.focus({ preventScroll: true });
    },
    [],
  );

  useEffect(() => {
    const unsubscribe = activeDomRangeMapper.subscribe(() => {
      segmentHighlightController.refresh();
    });
    segmentHighlightController.refresh();
    return unsubscribe;
  }, [activeDomRangeMapper, segmentHighlightController]);
  useLayoutEffect(() => {
    paragraphLeafController.setPreviewLocator(state.activeLocator);
  }, [paragraphLeafController, state.activeLocator]);
  useEffect(() => {
    if (narrationSource === undefined) {
      return;
    }
    const reconcile = (): void => {
      paragraphLeafController.reconcile(narrationSource.observe());
    };
    const unsubscribeState = narrationSource.subscribe(reconcile);
    const unsubscribeProgress = narrationSource.subscribeAudibleProgress(
      (observation) => paragraphLeafController.accept(observation),
    );
    reconcile();
    return () => {
      unsubscribeProgress();
      unsubscribeState();
    };
  }, [narrationSource, paragraphLeafController]);
  useEffect(() => {
    if (narrationSource === undefined) {
      segmentHighlightController.clear();
      return;
    }
    const reconcile = (): void => {
      segmentHighlightController.reconcile(narrationSource.observe());
    };
    const unsubscribeState = narrationSource.subscribe(reconcile);
    const unsubscribeProgress = narrationSource.subscribeAudibleProgress(
      (observation) => {
        segmentHighlightController.accept(observation);
      },
    );
    reconcile();
    return () => {
      unsubscribeProgress();
      unsubscribeState();
      segmentHighlightController.clear();
    };
  }, [narrationSource, segmentHighlightController]);
  useEffect(() => {
    if (narrationSource?.subscribeNavigationRequests === undefined) {
      return;
    }
    return narrationSource.subscribeNavigationRequests((request) => {
      runProgrammaticNavigation(
        () => coordinator.navigateToLocator(request.locator),
        "narration-boundary",
      );
    });
  }, [coordinator, narrationSource, runProgrammaticNavigation]);
  useLayoutEffect(() => {
    segmentHighlightController.refresh();
  }, [
    segmentHighlightController,
    state.activeDocument.id,
    state.contentStatus,
    state.preferences,
  ]);
  useEffect(
    () => () => {
      visualNavigationIntent.clear();
      programmaticNavigationRequest.current += 1;
      initialVisualLocatorResumeRef.current?.({ requestSample: false });
      initialVisualLocatorResumeRef.current = undefined;
      resumeProgrammaticNavigationRef.current?.();
      resumeProgrammaticNavigationRef.current = undefined;
    },
    [visualNavigationIntent],
  );

  useLayoutEffect(() => {
    if (
      initialRestorationStatus.current === "pending" &&
      state.contentStatus === "chapter-too-large"
    ) {
      completeInitialRestoration(
        Object.freeze({
          status: "unavailable",
          locator: state.activeLocator,
        }),
      );
      return;
    }
    if (
      state.navigationRevision === 0 ||
      handledNavigationRevision.current === state.navigationRevision
    ) {
      return;
    }

    if (state.contentStatus === "chapter-too-large") {
      handledNavigationRevision.current = state.navigationRevision;
      readerDocumentRef.current?.focus({ preventScroll: true });
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
    completeInitialRestoration,
    finishProgrammaticNavigation,
    focusDestination,
    state.contentStatus,
    state.activeLocator,
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
      aria-busy={initialRestorationPending || undefined}
    >
      <a
        className="reader-skip-link"
        href={`#${contentId}`}
        onClick={focusReaderContent}
      >
        Skip to reader content
      </a>
      <div
        ref={setReaderViewportRef}
        className="reader-viewport"
        data-reader-scroll-owner="true"
        role="region"
        tabIndex={-1}
        aria-label="Publication reading viewport"
        onWheelCapture={() => visualNavigationIntent.mark()}
        onTouchStartCapture={() => visualNavigationIntent.mark()}
        onPointerDownCapture={() => visualNavigationIntent.mark()}
        onKeyDownCapture={(event) => {
          if (
            [
              "ArrowDown",
              "ArrowUp",
              "End",
              "Home",
              "PageDown",
              "PageUp",
              " ",
            ].includes(event.key)
          ) {
            visualNavigationIntent.mark();
          }
        }}
      >
        <ReaderPreferencesControls
          disabled={initialRestorationPending}
          preferences={state.preferences}
          onChange={updatePreference}
        />
        <div className="reader-layout">
          <nav
            ref={navigationRef}
            id={navigationId}
            className="reader-toc"
            aria-label="Table of contents"
            tabIndex={-1}
          >
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
                data-reader-action="previous-chapter"
                disabled={!state.canGoPrevious}
                onClick={() =>
                  runProgrammaticNavigation(
                    () => coordinator.goPrevious(),
                    "chapter-navigation",
                  )
                }
              >
                Previous chapter
              </button>
              <button
                type="button"
                data-reader-action="next-chapter"
                disabled={!state.canGoNext}
                onClick={() =>
                  runProgrammaticNavigation(
                    () => coordinator.goNext(),
                    "chapter-navigation",
                  )
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
            <a
              className="reader-return-link"
              href={`#${navigationId}`}
              onClick={focusTableOfContents}
            >
              Back to table of contents
            </a>
            <div
              ref={setReaderContentRoot}
              id={contentId}
              className="reader-content"
            >
              <ParagraphLeaf
                contentRoot={readerContentRoot}
                domRangeMapper={activeDomRangeMapper}
                locatedBlock={leafSnapshot.locatedBlock}
                state={leafSnapshot.state}
                layoutRevision={[
                  state.activeDocument.id,
                  state.preferences.textScale,
                  state.preferences.lineSpacing,
                  state.preferences.contentWidth,
                ].join(":")}
                onActivate={activateParagraphLeaf}
              />
              {state.contentStatus === "chapter-too-large" ? (
                <ChapterTooLargeContent readerRef={setReaderDocumentRef} />
              ) : (
                <SemanticDocumentContent
                  key={state.activeLocator.spineItemIndex}
                  document={state.activeDocument}
                  targetAvailability={targetAvailability}
                  onActivateTarget={activateTarget}
                  destinationBlock={state.destinationBlock}
                  destinationRef={setDestinationRef}
                  readerRef={setReaderDocumentRef}
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
    </div>
  );
}
