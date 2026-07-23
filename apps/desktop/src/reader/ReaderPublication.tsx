import type {
  OpenedPublication,
  PublicationNavigationNode,
  SemanticDocumentTarget,
} from "@voxleaf/epub";
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import type { ReactElement, ReactNode } from "react";

import { SemanticDocumentContent } from "./SemanticDocument";
import {
  ReaderNavigationCoordinator,
  type ReaderTargetAvailability,
} from "./reader-navigation";

function unreachable(value: never): never {
  void value;
  throw new Error("Unsupported publication navigation value.");
}

interface NavigationTreeProps {
  readonly nodes: readonly PublicationNavigationNode[];
  readonly coordinator: ReaderNavigationCoordinator;
}

function NavigationTree({
  nodes,
  coordinator,
}: NavigationTreeProps): ReactElement {
  return (
    <ol className="reader-toc-list">
      {nodes.map((node, index) => (
        <NavigationNodeElement
          key={index}
          node={node}
          coordinator={coordinator}
        />
      ))}
    </ol>
  );
}

interface NavigationNodeElementProps {
  readonly node: PublicationNavigationNode;
  readonly coordinator: ReaderNavigationCoordinator;
}

function NavigationNodeElement({
  node,
  coordinator,
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
            onClick={() => coordinator.navigateToTarget(node.target)}
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
        <NavigationTree nodes={node.children} coordinator={coordinator} />
      ) : null}
    </li>
  );
}

export interface ReaderPublicationContentProps {
  readonly publication: OpenedPublication;
}

export function ReaderPublicationContent({
  publication,
}: ReaderPublicationContentProps): ReactElement {
  const coordinator = useMemo(
    () => new ReaderNavigationCoordinator(publication),
    [publication],
  );
  const subscribe = useCallback(
    (listener: () => void) => coordinator.subscribe(listener),
    [coordinator],
  );
  const getSnapshot = useCallback(() => coordinator.state, [coordinator]);
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const readerRef = useRef<HTMLElement | null>(null);
  const destinationRef = useRef<HTMLElement | null>(null);
  const setDestinationRef = useCallback((element: HTMLElement | null) => {
    destinationRef.current = element;
  }, []);
  const targetAvailability = useCallback(
    (target: SemanticDocumentTarget): ReaderTargetAvailability =>
      coordinator.targetAvailability(target),
    [coordinator],
  );
  const activateTarget = useCallback(
    (target: SemanticDocumentTarget) => coordinator.navigateToTarget(target),
    [coordinator],
  );

  useLayoutEffect(() => {
    if (state.navigationRevision === 0) {
      return;
    }

    const destination = destinationRef.current;
    destination?.scrollIntoView?.({ block: "start" });
    if (state.destinationBlock.kind === "heading" && destination !== null) {
      destination.focus({ preventScroll: true });
      return;
    }
    readerRef.current?.focus({ preventScroll: true });
  }, [state.destinationBlock, state.navigationRevision]);

  return (
    <div className="semantic-reader">
      <nav className="reader-toc" aria-label="Table of contents">
        <h3>Table of contents</h3>
        {publication.navigation.length === 0 ? (
          <p className="reader-toc-empty">No table of contents is available.</p>
        ) : (
          <NavigationTree
            nodes={publication.navigation}
            coordinator={coordinator}
          />
        )}
      </nav>
      <div className="reader-chapter-controls" aria-label="Chapter navigation">
        <button
          type="button"
          disabled={!state.canGoPrevious}
          onClick={() => coordinator.goPrevious()}
        >
          Previous chapter
        </button>
        <button
          type="button"
          disabled={!state.canGoNext}
          onClick={() => coordinator.goNext()}
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
      <SemanticDocumentContent
        key={state.activeLocator.spineItemIndex}
        document={state.activeDocument}
        targetAvailability={targetAvailability}
        onActivateTarget={activateTarget}
        destinationBlock={state.destinationBlock}
        destinationRef={setDestinationRef}
        readerRef={readerRef}
      />
    </div>
  );
}
