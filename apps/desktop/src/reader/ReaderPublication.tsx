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
  FocusEvent as ReactFocusEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactElement,
  ReactNode,
} from "react";

import { useStrictModeSafeResourceCleanup } from "../strict-mode-resource-cleanup";
import {
  ActiveVisualLocatorTracker,
  type ActiveVisualLocatorEnvironment,
} from "./active-visual-locator";
import { PublicationRasterImageLoader } from "./images/publication-raster-image-loader";
import {
  DEFAULT_READER_PREFERENCES,
  type ReaderPreferencesV1,
} from "./reader-preferences";
import {
  BROWSER_READER_REFLOW_ENVIRONMENT,
  ReaderReflowRestorer,
  type ReaderReflowEnvironment,
  type ReaderReflowRestorationResult,
} from "./reader-reflow-restoration";
import {
  SegmentHighlightController,
  type ReaderNarrationSource,
  type SegmentHighlightEnvironment,
} from "./segment-highlight-controller";
import {
  ChapterTooLargeContent,
  SemanticDocumentContent,
} from "./SemanticDocument";
import {
  ReaderNavigationCoordinator,
  type ReaderTargetAvailability,
  type ReaderNavigationSettlement,
  type ReaderPlacementRequest,
} from "./reader-navigation";
import { ParagraphLeafController } from "./paragraph-leaf-controller";
import { ParagraphLeaf } from "./ParagraphLeaf";
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
  readonly onNavigationSettlement?: (
    settlement: import("./reader-navigation").ReaderNavigationSettlement,
    reason: ReaderLocatorSettlementReason,
  ) => boolean | void;
  readonly publication: OpenedPublication;
  readonly initialPreferences?: ReaderPreferencesV1;
  readonly preferences?: ReaderPreferencesV1;
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

export function ReaderPublicationContent({
  publication,
  initialPreferences = DEFAULT_READER_PREFERENCES,
  preferences,
  initialLocator,
  restoreInitialLocator = false,
  onActiveLocatorChange,
  onNavigationIntent,
  onSettledLocatorChange,
  onNavigationSettlement,
  onInitialRestorationSettled,
  domRangeMapper,
  visualLocatorEnvironment,
  reflowEnvironment,
  narrationSource,
  segmentHighlightEnvironment,
}: ReaderPublicationContentProps): ReactElement {
  const externalCallbacks = useRef({
    narrationSource,
    onActiveLocatorChange,
    onNavigationSettlement,
    onSettledLocatorChange,
    onInitialRestorationSettled,
  });
  useLayoutEffect(() => {
    externalCallbacks.current = {
      narrationSource,
      onActiveLocatorChange,
      onNavigationSettlement,
      onSettledLocatorChange,
      onInitialRestorationSettled,
    };
  });
  const [coordinator] = useState(
    () =>
      new ReaderNavigationCoordinator(publication, {
        ...(initialLocator === undefined ? {} : { initialLocator }),
        preferences: initialPreferences,
      }),
  );
  const placementPending = useRef(false);
  const placementRequest = useRef<ReaderPlacementRequest | undefined>(
    undefined,
  );
  const settlePlacement = useCallback(
    (
      settlement: ReaderNavigationSettlement,
      reason: ReaderLocatorSettlementReason,
    ): boolean | void => {
      const callbacks = externalCallbacks.current;
      return callbacks.onNavigationSettlement !== undefined
        ? callbacks.onNavigationSettlement(settlement, reason)
        : callbacks.narrationSource?.settleReaderPlacement?.(settlement);
    },
    [],
  );
  const notifySettlement = useCallback(
    (
      reason: ReaderLocatorSettlementReason,
      locator = coordinator.state.activeLocator,
      outcome?: ReaderNavigationSettlement,
    ): void => {
      if (reason === "reflow" && placementPending.current) return;
      placementPending.current = false;
      const request =
        reason === "reflow" ? undefined : placementRequest.current;
      const settlement: ReaderNavigationSettlement = {
        ...(outcome ??
          (coordinator.state.contentStatus === "chapter-too-large"
            ? { status: "unavailable", reason: "chapter-too-large" }
            : { status: "settled", locator })),
        ...(request === undefined ? {} : { request }),
      };
      if (reason !== "reflow") placementRequest.current = undefined;
      const accepted = settlePlacement(settlement, reason);
      if (accepted === false) return;
      if (settlement.status === "settled")
        externalCallbacks.current.onSettledLocatorChange?.(
          settlement.locator,
          reason,
        );
    },
    [coordinator, settlePlacement],
  );
  useEffect(() => {
    if (
      coordinator.state.navigationRevision === 0 &&
      coordinator.state.contentStatus === "chapter-too-large"
    ) {
      notifySettlement("reflow");
    }
  }, [coordinator, notifySettlement]);
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
  const [visualLocatorTracker] = useState(
    () =>
      new ActiveVisualLocatorTracker(publication, activeDomRangeMapper, {
        ...(visualLocatorEnvironment === undefined
          ? {}
          : { environment: visualLocatorEnvironment }),
        initialLocator: coordinator.state.activeLocator,
        onLocator: () => undefined,
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
      const narration = externalCallbacks.current.narrationSource;
      if (settlement.status === "settled")
        narration?.updateVisibleLocator?.(settlement.locator);
      if (settlement.status !== "superseded")
        narration?.settleReaderPlacement?.(
          settlement.status === "unavailable"
            ? { status: "unavailable", reason: "chapter-too-large" }
            : { status: "settled", locator: settlement.locator },
        );
      setInitialRestorationPending(false);
      const resume = initialVisualLocatorResumeRef.current;
      initialVisualLocatorResumeRef.current = undefined;
      resume?.({ requestSample: false });
      externalCallbacks.current.onInitialRestorationSettled?.(settlement);
    },
    [],
  );
  const [pendingRestoration, setPendingRestoration] = useState<
    | {
        readonly result: ReaderReflowRestorationResult;
        readonly navigationRevision: number;
      }
    | undefined
  >(undefined);
  const pendingPositionSaveRevision = useRef<number | undefined>(undefined);
  const pendingNavigationReason = useRef<ReaderUserNavigationEvent | undefined>(
    undefined,
  );
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
        },
      ),
  );
  const readerViewportRef = useRef<HTMLDivElement | null>(null);
  const recordManualScrollIntent = useCallback((): void => {
    visualLocatorTracker.noteManualScrollIntent();
    reflowRestorer.cancelViewportRestoration();
  }, [reflowRestorer, visualLocatorTracker]);
  const recordWheelIntent = useCallback(
    (event: WheelEvent): void => {
      if (
        event.isTrusted &&
        !event.ctrlKey &&
        !event.metaKey &&
        event.deltaY !== 0
      )
        recordManualScrollIntent();
    },
    [recordManualScrollIntent],
  );
  const destinationRef = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    reflowRestorer.setOnRestored((result) => {
      if (result.reason === "preference") {
        if (result.placement === "unavailable") return;
        if (!result.aligned) {
          const environment =
            reflowEnvironment ?? BROWSER_READER_REFLOW_ENVIRONMENT;
          const root = readerViewportRef.current;
          const viewport =
            root === null ? undefined : environment.viewportRect(root);
          const resolved = publication.resolveLocator(result.locator);
          const range =
            resolved === undefined
              ? undefined
              : activeDomRangeMapper.rangeFor(
                  resolved.locatedBlock,
                  result.locator.textOffsetCodePoints,
                );
          const block = destinationRef.current;
          const rect =
            result.placement === "block-start"
              ? block === null
                ? undefined
                : environment.elementRect(block)
              : range === undefined
                ? undefined
                : environment.rangeRect(range);
          if (
            rect === undefined ||
            viewport === undefined ||
            rect.bottom <= viewport.top ||
            rect.top >= viewport.bottom
          )
            return;
        }
        notifySettlement("reflow", result.locator);
      } else if (result.reason === "restoration") {
        setPendingRestoration({
          result,
          navigationRevision: coordinator.state.navigationRevision,
        });
      }
    });
  }, [
    activeDomRangeMapper,
    coordinator,
    notifySettlement,
    publication,
    reflowEnvironment,
    reflowRestorer,
  ]);
  useStrictModeSafeResourceCleanup(reflowRestorer);
  const subscribe = useCallback(
    (listener: () => void) => coordinator.subscribe(listener),
    [coordinator],
  );
  const getSnapshot = useCallback(() => coordinator.state, [coordinator]);
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  useLayoutEffect(() => {
    if (narrationSource === undefined) return;
    if (
      initialRestorationStatus.current === "pending" ||
      placementPending.current ||
      pendingPositionSaveRevision.current !== undefined
    ) {
      narrationSource.beginReaderPlacement?.(placementRequest.current);
      return;
    }
    // Attachment replays the visible start before making Play available.
    if (coordinator.state.contentStatus === "render") {
      narrationSource.updateVisibleLocator?.(coordinator.state.activeLocator);
    }
    settlePlacement(
      coordinator.state.contentStatus === "chapter-too-large"
        ? { status: "unavailable", reason: "chapter-too-large" }
        : { status: "settled", locator: coordinator.state.activeLocator },
      "reflow",
    );
  }, [coordinator, narrationSource, settlePlacement]);
  const leafSnapshot = useSyncExternalStore(
    paragraphLeafController.subscribe,
    paragraphLeafController.getSnapshot,
    paragraphLeafController.getSnapshot,
  );
  const navigationId = useId();
  const contentId = useId();
  const [contentsOpen, setContentsOpen] = useState(false);
  const activeLocatedBlocks = useMemo(
    () =>
      publication.locators.filter(
        (locatedBlock) => locatedBlock.documentId === state.activeDocument.id,
      ),
    [publication.locators, state.activeDocument.id],
  );
  const readerDocumentRef = useRef<HTMLElement | null>(null);
  const [readerContentRoot, setReaderContentRoot] =
    useState<HTMLDivElement | null>(null);
  const paragraphLeafPlacement = useRef<{
    hovered: PublicationLocatedBlock | undefined;
    focused: PublicationLocatedBlock | undefined;
  }>({ hovered: undefined, focused: undefined });
  const setReaderContentRef = useCallback((root: HTMLDivElement | null) => {
    paragraphLeafPlacement.current = { hovered: undefined, focused: undefined };
    setReaderContentRoot(root);
  }, []);
  const navigationRef = useRef<HTMLElement | null>(null);
  const contentsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const closeContents = useCallback(() => {
    setContentsOpen(false);
    contentsTriggerRef.current?.focus({ preventScroll: true });
  }, []);
  const focusContentsAfterOpen = useRef(false);
  const handledNavigationRevision = useRef(0);
  const programmaticNavigationRequest = useRef(0);
  const resumeProgrammaticNavigationRef = useRef<
    ReturnType<ActiveVisualLocatorTracker["suspend"]> | undefined
  >(undefined);
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
  useLayoutEffect(() => {
    visualLocatorTracker.setOnLocator((locator, measuredManual) => {
      if (measuredManual && !placementPending.current) {
        externalCallbacks.current.narrationSource?.updateVisibleLocator?.(
          locator,
          true,
        );
      }
      if (coordinator.updateActiveVisualLocator(locator)) {
        segmentHighlightController.manualInspection();
        externalCallbacks.current.onActiveLocatorChange?.(locator);
      }
    });
  }, [coordinator, visualLocatorTracker, segmentHighlightController]);
  useStrictModeSafeResourceCleanup(
    domRangeMapper === undefined ? ownedDomRangeMapper : undefined,
  );
  useLayoutEffect(() => {
    const callbacks = {
      navigateToLocator: (locator: ReadingLocatorV1) => {
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
        if (coordinator.state.contentStatus === "chapter-too-large") {
          notifySettlement("narration-boundary");
        }
      },
      settleLocator: (locator: ReadingLocatorV1) => {
        // Audible settlement supersedes the older preference capture. Hold
        // sampling while cancel() releases its own suspension.
        const resume = visualLocatorTracker.suspend();
        const current = coordinator.state.activeLocator;
        if (
          current.spineItemIndex !== locator.spineItemIndex ||
          current.anchor.anchorIndex !== locator.anchor.anchorIndex ||
          current.textOffsetCodePoints !== locator.textOffsetCodePoints
        ) {
          reflowRestorer.cancel();
        }
        visualLocatorTracker.setCurrentLocator(locator);
        coordinator.updateActiveVisualLocator(locator);
        narrationSource?.updateVisibleLocator?.(locator);
        resume({ requestSample: false });
      },
      recordAutomaticFollowPlacement: (locator: ReadingLocatorV1) =>
        visualLocatorTracker.recordAutomaticFollowPlacement(locator),
      admitManualScrollMovement: () => {
        const moved = visualLocatorTracker.admitManualScrollMovement();
        if (moved) visualLocatorTracker.requestSample();
        return moved;
      },
      suspendVisualSampling: () => visualLocatorTracker.suspend(),
    };
    segmentHighlightController.setCallbacks(callbacks);
    return () => segmentHighlightController.setCallbacks(undefined);
  }, [
    completeInitialRestoration,
    coordinator,
    narrationSource,
    notifySettlement,
    reflowRestorer,
    segmentHighlightController,
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
      const previous = readerViewportRef.current;
      if (previous !== element) {
        previous?.removeEventListener("wheel", recordWheelIntent);
        // Read scrollTop before Chromium can scroll on the compositor.
        element?.addEventListener("wheel", recordWheelIntent, {
          passive: false,
        });
      }
      if (
        element === null &&
        initialRestorationStatus.current === "pending" &&
        reflowRestorer.restoring
      ) {
        // Detaching the viewport cancels this placement. A ref replay can
        // retry it when the viewport, document and destination reconnect.
        initialRestorationStarted.current = false;
      }
      readerViewportRef.current = element;
      visualLocatorTracker.setRoot(element);
      reflowRestorer.setRoot(element);
      segmentHighlightController.setRoot(element);
      attemptInitialRestoration();
    },
    [
      attemptInitialRestoration,
      recordWheelIntent,
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
  const finishProgrammaticNavigation = useCallback(
    (outcome?: ReaderNavigationSettlement): void => {
      visualLocatorTracker.setCurrentLocator(coordinator.state.activeLocator);
      if (
        pendingPositionSaveRevision.current ===
        coordinator.state.navigationRevision
      ) {
        pendingPositionSaveRevision.current = undefined;
        const reason = pendingNavigationReason.current;
        pendingNavigationReason.current = undefined;
        if (reason !== undefined) {
          notifySettlement(reason, coordinator.state.activeLocator, outcome);
        }
      }
      const resume = resumeProgrammaticNavigationRef.current;
      resumeProgrammaticNavigationRef.current = undefined;
      resume?.({ requestSample: false });
    },
    [coordinator, notifySettlement, visualLocatorTracker],
  );
  useLayoutEffect(() => {
    if (pendingRestoration === undefined) return;
    const { result, navigationRevision } = pendingRestoration;
    if (navigationRevision !== coordinator.state.navigationRevision) return;
    if (
      navigationRevision !== 0 &&
      pendingPositionSaveRevision.current !== navigationRevision
    )
      return;
    // A mounted block is not proof of exact placement. Preserve a visible
    // interior range even when bottom-of-document clamping prevents alignment.
    const resolved = publication.resolveLocator(result.locator);
    const range =
      resolved === undefined
        ? undefined
        : activeDomRangeMapper.rangeFor(
            resolved.locatedBlock,
            result.locator.textOffsetCodePoints,
          );
    const environment = reflowEnvironment ?? BROWSER_READER_REFLOW_ENVIRONMENT;
    const rect = range === undefined ? undefined : environment.rangeRect(range);
    const root = readerViewportRef.current;
    const viewport = root === null ? undefined : environment.viewportRect(root);
    const visible =
      rect !== undefined &&
      viewport !== undefined &&
      rect.top >= viewport.top &&
      rect.bottom <= viewport.bottom;
    if (
      resolved !== undefined &&
      (result.placement !== "exact-range" || (!result.aligned && !visible))
    ) {
      coordinator.updateActiveVisualLocator(resolved.locatedBlock.startLocator);
      // The restorer already aligned a successful block fallback to the reading
      // line. A second element scroll would replace that measured placement.
      if (!result.aligned)
        destinationRef.current?.scrollIntoView?.({ block: "start" });
    }
    if (navigationRevision === 0) {
      visualLocatorTracker.setCurrentLocator(coordinator.state.activeLocator);
      completeInitialRestoration({
        status: result.placement === "unavailable" ? "unavailable" : "settled",
        locator: coordinator.state.activeLocator,
      });
      return;
    }
    const relative = placementRequest.current?.narration;
    const exact =
      result.placement === "exact-range" && (result.aligned || visible);
    const block = destinationRef.current;
    const blockRect =
      block === null ? undefined : environment.elementRect(block);
    const blockVisible =
      blockRect !== undefined &&
      viewport !== undefined &&
      blockRect.bottom >= viewport.top &&
      blockRect.top <= viewport.bottom;
    const atBlockStart = result.locator.textOffsetCodePoints === 0;
    finishProgrammaticNavigation(
      relative === undefined || relative.event === "paragraph-leaf"
        ? undefined
        : exact ||
            (atBlockStart &&
              result.placement === "block-start" &&
              (result.aligned || blockVisible))
          ? { status: "settled", locator: coordinator.state.activeLocator }
          : result.placement !== "unavailable" && blockVisible
            ? {
                status: "approximate",
                locator: coordinator.state.activeLocator,
              }
            : { status: "unavailable", reason: "placement" },
    );
  }, [
    activeDomRangeMapper,
    completeInitialRestoration,
    coordinator,
    finishProgrammaticNavigation,
    pendingRestoration,
    publication,
    reflowEnvironment,
    visualLocatorTracker,
  ]);
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
        const relative = placementRequest.current?.narration;
        const strictPassage =
          relative !== undefined && relative.event !== "paragraph-leaf";
        if (
          strictPassage &&
          coordinator.state.activeLocator.textOffsetCodePoints === 0
        )
          focusDestination(element);
        if (
          coordinator.state.activeLocator.textOffsetCodePoints > 0 ||
          strictPassage
        ) {
          if (
            reflowRestorer.preserve(
              coordinator.state.activeLocator,
              "restoration",
            )
          )
            return;
          if (strictPassage) {
            finishProgrammaticNavigation({
              status: "unavailable",
              reason: "placement",
            });
            return;
          }
        }
        focusDestination(element);
        finishProgrammaticNavigation();
      }
    },
    [
      attemptInitialRestoration,
      finishProgrammaticNavigation,
      focusDestination,
      coordinator,
      reflowRestorer,
      state.navigationRevision,
    ],
  );
  const targetAvailability = useCallback(
    (target: SemanticDocumentTarget): ReaderTargetAvailability =>
      coordinator.targetAvailability(target),
    [coordinator],
  );
  const runProgrammaticNavigation = useCallback(
    (
      navigate: () => void,
      reason: ReaderUserNavigationEvent,
      narration?: import("../tts/product-narration-coordinator").ProductNarrationNavigationRequest,
    ): void => {
      if (reason === "chapter-navigation") {
        segmentHighlightController.clear();
      }
      const request = programmaticNavigationRequest.current + 1;
      programmaticNavigationRequest.current = request;
      placementPending.current = true;
      visualLocatorTracker.clearManualScrollIntent();
      placementRequest.current = {
        publication: publication.book.identity,
        revision: request,
        ...(narration === undefined ? {} : { narration }),
      };
      narrationSource?.beginReaderPlacement?.(placementRequest.current);
      // Retire the older reader operation at admission, even if containing the
      // new intent subsequently fails. Its delayed restoration cannot succeed.
      const resume = visualLocatorTracker.suspend();
      reflowRestorer.cancel();
      completeInitialRestoration({
        status: "superseded",
        locator: coordinator.state.activeLocator,
      });
      resumeProgrammaticNavigationRef.current?.({ requestSample: false });
      resumeProgrammaticNavigationRef.current = resume;
      pendingPositionSaveRevision.current = undefined;
      pendingNavigationReason.current = undefined;
      const rejectNavigation = (): void => {
        notifySettlement(reason, coordinator.state.activeLocator, {
          status: "rejected",
        });
        const release = resumeProgrammaticNavigationRef.current;
        resumeProgrammaticNavigationRef.current = undefined;
        release?.({ requestSample: false });
      };
      const continueNavigation = (): void => {
        if (programmaticNavigationRequest.current !== request) {
          return;
        }
        // Layout can start another reflow while audio containment is awaited.
        // It belongs to the old document and must release sampling before commit.
        reflowRestorer.cancel();
        const revision = coordinator.state.navigationRevision;
        pendingPositionSaveRevision.current = revision + 1;
        pendingNavigationReason.current = reason;
        navigate();
        const nextRevision = coordinator.state.navigationRevision;
        if (nextRevision === revision) {
          pendingPositionSaveRevision.current = undefined;
          pendingNavigationReason.current = undefined;
          finishProgrammaticNavigation();
          notifySettlement(reason, coordinator.state.activeLocator, {
            status: "rejected",
          });
        } else if (handledNavigationRevision.current !== nextRevision) {
          pendingPositionSaveRevision.current = nextRevision;
        }
      };
      let invalidation: void | Promise<void>;
      try {
        invalidation = onNavigationIntent?.(reason);
      } catch {
        rejectNavigation();
        return;
      }
      if (invalidation === undefined) {
        continueNavigation();
      } else {
        void invalidation.then(continueNavigation).catch(() => {
          if (programmaticNavigationRequest.current === request)
            rejectNavigation();
        });
      }
    },
    [
      coordinator,
      completeInitialRestoration,
      finishProgrammaticNavigation,
      onNavigationIntent,
      narrationSource,
      notifySettlement,
      reflowRestorer,
      segmentHighlightController,
      visualLocatorTracker,
      publication,
    ],
  );
  const activateTarget = useCallback(
    (target: SemanticDocumentTarget) => {
      if (contentsOpen) closeContents();
      runProgrammaticNavigation(
        () => coordinator.navigateToTarget(target),
        "chapter-navigation",
      );
    },
    [coordinator, runProgrammaticNavigation, contentsOpen, closeContents],
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
  const projectParagraphLeafPreview = useCallback((): void => {
    const current = coordinator.state;
    const placement = paragraphLeafPlacement.current;
    const ownsCurrentOccurrence = (
      block: PublicationLocatedBlock | undefined,
    ): boolean =>
      block !== undefined &&
      current.contentStatus !== "chapter-too-large" &&
      block.documentId === current.activeDocument.id &&
      block.startLocator.spineItemIndex ===
        current.activeLocator.spineItemIndex;
    if (!ownsCurrentOccurrence(placement.hovered))
      placement.hovered = undefined;
    if (!ownsCurrentOccurrence(placement.focused))
      placement.focused = undefined;
    paragraphLeafController.setPreviewLocator(
      (placement.focused ?? placement.hovered)?.startLocator ??
        current.activeLocator,
    );
  }, [coordinator, paragraphLeafController]);
  const releaseParagraphLeafHover = useCallback((): void => {
    paragraphLeafPlacement.current.hovered = undefined;
    projectParagraphLeafPreview();
  }, [projectParagraphLeafPreview]);
  const updateParagraphLeafFocus = useCallback(
    (event: ReactFocusEvent<HTMLDivElement>): void => {
      if (!event.target.classList.contains("paragraph-leaf")) return;
      paragraphLeafPlacement.current.focused =
        event.type === "focus"
          ? paragraphLeafController.getSnapshot().locatedBlock
          : undefined;
      projectParagraphLeafPreview();
    },
    [paragraphLeafController, projectParagraphLeafPreview],
  );
  const previewParagraphLeafAtPointer = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>): void => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      const targetElement =
        target instanceof Element ? target : target.parentElement;
      if (
        targetElement !== null &&
        targetElement.closest(".paragraph-leaf-host") !== null
      ) {
        return;
      }
      const locatedBlock = activeDomRangeMapper.locatedBlockForNode(target);
      if (
        locatedBlock?.block.kind === "heading" ||
        locatedBlock?.block.kind === "paragraph"
      ) {
        paragraphLeafPlacement.current.hovered = locatedBlock;
        projectParagraphLeafPreview();
      }
    },
    [activeDomRangeMapper, projectParagraphLeafPreview],
  );
  useLayoutEffect(() => {
    if (initialRestorationPending || preferences === undefined) return;
    const intent = coordinator.setPreferences(preferences);
    if (intent !== undefined) {
      visualLocatorTracker.clearManualScrollIntent();
      // Reflow replaces the pending placement, so retain its navigation
      // settlement and sampling release when a passage is still settling.
      reflowRestorer.preserve(
        intent.locator,
        pendingPositionSaveRevision.current ===
          coordinator.state.navigationRevision
          ? "restoration"
          : "preference",
      );
    }
  }, [
    coordinator,
    initialRestorationPending,
    preferences,
    reflowRestorer,
    visualLocatorTracker,
  ]);
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
      if (contentsOpen) {
        navigationRef.current?.focus({ preventScroll: true });
      } else {
        focusContentsAfterOpen.current = true;
        setContentsOpen(true);
      }
    },
    [contentsOpen],
  );
  useLayoutEffect(() => {
    if (contentsOpen && focusContentsAfterOpen.current) {
      focusContentsAfterOpen.current = false;
      navigationRef.current?.focus({ preventScroll: true });
    }
  }, [contentsOpen]);

  useEffect(() => {
    const unsubscribe = activeDomRangeMapper.subscribe(() => {
      segmentHighlightController.refresh();
    });
    segmentHighlightController.refresh();
    return unsubscribe;
  }, [activeDomRangeMapper, segmentHighlightController]);
  useLayoutEffect(() => {
    projectParagraphLeafPreview();
  }, [
    projectParagraphLeafPreview,
    readerContentRoot,
    state.activeDocument.id,
    state.activeLocator,
    state.contentStatus,
  ]);
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
        request,
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
      programmaticNavigationRequest.current += 1;
      initialVisualLocatorResumeRef.current?.({ requestSample: false });
      initialVisualLocatorResumeRef.current = undefined;
      resumeProgrammaticNavigationRef.current?.();
      resumeProgrammaticNavigationRef.current = undefined;
    },
    [],
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
      <div className="reader-toolbar">
        <button
          type="button"
          aria-expanded={contentsOpen}
          ref={contentsTriggerRef}
          aria-controls={navigationId}
          onClick={() => setContentsOpen((open) => !open)}
        >
          {contentsOpen ? "Hide table of contents" : "Show table of contents"}
        </button>
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
      </div>
      <div className="reader-workspace">
        {contentsOpen ? (
          <button
            type="button"
            className="reader-toc-backdrop"
            aria-label="Close table of contents"
            onClick={closeContents}
          />
        ) : null}
        <nav
          ref={navigationRef}
          id={navigationId}
          className="reader-toc"
          data-open={contentsOpen || undefined}
          aria-label="Table of contents"
          tabIndex={-1}
          hidden={!contentsOpen}
        >
          <div className="reader-toc-heading">
            <h3>Table of contents</h3>
            <button type="button" onClick={closeContents}>
              Close contents
            </button>
          </div>
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
        <div
          ref={setReaderViewportRef}
          className="reader-viewport"
          data-reader-scroll-owner="true"
          role="region"
          tabIndex={-1}
          aria-label="Publication reading viewport"
          onTouchMove={(event) => {
            if (event.isTrusted && event.touches.length === 1)
              recordManualScrollIntent();
          }}
          onKeyDown={(event) => {
            if (
              event.isTrusted &&
              !event.defaultPrevented &&
              !event.ctrlKey &&
              !event.metaKey &&
              !event.altKey &&
              !event.shiftKey &&
              event.target instanceof HTMLElement &&
              event.target.closest(
                "a,button,input,select,textarea,summary,[contenteditable=true],[role=button]",
              ) === null &&
              event.currentTarget.ownerDocument.getSelection()?.isCollapsed !==
                false &&
              [
                "ArrowUp",
                "ArrowDown",
                "PageUp",
                "PageDown",
                "Home",
                "End",
                " ",
              ].includes(event.key)
            )
              recordManualScrollIntent();
          }}
          onScroll={(event) => {
            if (event.target !== event.currentTarget) return;
            if (visualLocatorTracker.admitManualScrollMovement()) {
              segmentHighlightController.manualInspection();
              visualLocatorTracker.requestSample();
            }
          }}
        >
          <div className="reader-layout">
            <div className="reader-reading-pane">
              <div
                ref={setReaderContentRef}
                id={contentId}
                className="reader-content"
                onPointerOver={previewParagraphLeafAtPointer}
                onPointerLeave={releaseParagraphLeafHover}
                onPointerCancel={releaseParagraphLeafHover}
                onFocus={updateParagraphLeafFocus}
                onBlur={updateParagraphLeafFocus}
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
    </div>
  );
}
