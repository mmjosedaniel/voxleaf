import type {
  SemanticBlock,
  SemanticDocument,
  SemanticDocumentTarget,
  SemanticHeadingBlock,
  SemanticInline,
  SemanticTextContext,
  SemanticTextDirection,
} from "@voxleaf/epub";
import type { MouseEventHandler, ReactElement, ReactNode, Ref } from "react";

import type { ReaderTargetAvailability } from "./reader-navigation";

interface EffectiveTextContext {
  readonly language?: string;
  readonly direction?: SemanticTextDirection;
}

interface TextContextAttributes {
  readonly lang?: string;
  readonly dir?: SemanticTextDirection;
}

const EMPTY_TEXT_CONTEXT: EffectiveTextContext = Object.freeze({});
const DEFAULT_TARGET_EXPLANATION = "Internal navigation is unavailable.";
const DEFAULT_TARGET_AVAILABILITY: ReaderTargetAvailability = Object.freeze({
  status: "unavailable",
  explanation: DEFAULT_TARGET_EXPLANATION,
});

interface SemanticNavigation {
  readonly targetAvailability:
    ((target: SemanticDocumentTarget) => ReaderTargetAvailability) | undefined;
  readonly onActivateTarget:
    ((target: SemanticDocumentTarget) => void) | undefined;
}

interface SemanticDestination {
  readonly block: SemanticBlock | undefined;
  readonly ref: ((element: HTMLElement | null) => void) | undefined;
}

function unreachable(value: never): never {
  void value;
  throw new Error("Unsupported semantic reader value.");
}

function effectiveTextContext(
  value: SemanticTextContext,
  inherited: EffectiveTextContext,
): EffectiveTextContext {
  return {
    ...(value.language === undefined
      ? inherited.language === undefined
        ? {}
        : { language: inherited.language }
      : { language: value.language }),
    ...(value.direction === undefined
      ? inherited.direction === undefined
        ? {}
        : { direction: inherited.direction }
      : { direction: value.direction }),
  };
}

function textContextAttributes(
  current: EffectiveTextContext,
  inherited: EffectiveTextContext,
): TextContextAttributes {
  return {
    ...(current.language === undefined ||
    current.language === inherited.language
      ? {}
      : { lang: current.language }),
    ...(current.direction === undefined ||
    current.direction === inherited.direction
      ? {}
      : { dir: current.direction }),
  };
}

function renderInlineChildren(
  children: readonly SemanticInline[],
  inherited: EffectiveTextContext,
  navigation: SemanticNavigation,
): ReactNode {
  return children.map((inline, index) => (
    <SemanticInlineElement
      key={index}
      inline={inline}
      inherited={inherited}
      navigation={navigation}
    />
  ));
}

interface SemanticInlineElementProps {
  readonly inline: SemanticInline;
  readonly inherited: EffectiveTextContext;
  readonly navigation: SemanticNavigation;
}

function SemanticInlineElement({
  inline,
  inherited,
  navigation,
}: SemanticInlineElementProps): ReactNode {
  switch (inline.kind) {
    case "code": {
      const current = effectiveTextContext(inline, inherited);
      return (
        <code {...textContextAttributes(current, inherited)}>
          {renderInlineChildren(inline.children, current, navigation)}
        </code>
      );
    }
    case "emphasis": {
      const current = effectiveTextContext(inline, inherited);
      return (
        <em {...textContextAttributes(current, inherited)}>
          {renderInlineChildren(inline.children, current, navigation)}
        </em>
      );
    }
    case "internal-link": {
      const current = effectiveTextContext(inline, inherited);
      const availability =
        navigation.targetAvailability?.(inline.target) ??
        DEFAULT_TARGET_AVAILABILITY;
      const children = renderInlineChildren(
        inline.children,
        current,
        navigation,
      );
      if (
        availability.status === "available" &&
        navigation.onActivateTarget !== undefined
      ) {
        const activate: MouseEventHandler<HTMLButtonElement> = () =>
          navigation.onActivateTarget?.(inline.target);
        return (
          <button
            type="button"
            className="semantic-internal-link"
            {...textContextAttributes(current, inherited)}
            onClick={activate}
          >
            {children}
          </button>
        );
      }
      return (
        <span
          className="semantic-internal-link"
          role="link"
          aria-disabled="true"
          {...textContextAttributes(current, inherited)}
        >
          <span>{children}</span>
          <span className="visually-hidden">
            {" "}
            {availability.status === "unavailable"
              ? availability.explanation
              : DEFAULT_TARGET_EXPLANATION}
          </span>
        </span>
      );
    }
    case "line-break":
      return <br />;
    case "raster-image": {
      const current = effectiveTextContext(inline, inherited);
      return (
        <span
          className="semantic-raster-placeholder"
          role="img"
          aria-label="Publication image placeholder"
          {...textContextAttributes(current, inherited)}
        />
      );
    }
    case "strong": {
      const current = effectiveTextContext(inline, inherited);
      return (
        <strong {...textContextAttributes(current, inherited)}>
          {renderInlineChildren(inline.children, current, navigation)}
        </strong>
      );
    }
    case "text": {
      const current = effectiveTextContext(inline, inherited);
      const attributes = textContextAttributes(current, inherited);
      if (attributes.lang === undefined && attributes.dir === undefined) {
        return inline.text;
      }
      return <span {...attributes}>{inline.text}</span>;
    }
    default:
      return unreachable(inline);
  }
}

function renderHeading(
  block: SemanticHeadingBlock,
  inherited: EffectiveTextContext,
  navigation: SemanticNavigation,
  destinationRef?: (element: HTMLElement | null) => void,
): ReactElement {
  const current = effectiveTextContext(block, inherited);
  const attributes = textContextAttributes(current, inherited);
  const children = renderInlineChildren(block.children, current, navigation);
  const destinationAttributes =
    destinationRef === undefined
      ? {}
      : { ref: destinationRef, tabIndex: -1 as const };

  switch (block.level) {
    case 1:
      return (
        <h1 {...attributes} {...destinationAttributes}>
          {children}
        </h1>
      );
    case 2:
      return (
        <h2 {...attributes} {...destinationAttributes}>
          {children}
        </h2>
      );
    case 3:
      return (
        <h3 {...attributes} {...destinationAttributes}>
          {children}
        </h3>
      );
    case 4:
      return (
        <h4 {...attributes} {...destinationAttributes}>
          {children}
        </h4>
      );
    case 5:
      return (
        <h5 {...attributes} {...destinationAttributes}>
          {children}
        </h5>
      );
    case 6:
      return (
        <h6 {...attributes} {...destinationAttributes}>
          {children}
        </h6>
      );
    default:
      return unreachable(block.level);
  }
}

function renderBlockChildren(
  children: readonly SemanticBlock[],
  inherited: EffectiveTextContext,
  navigation: SemanticNavigation,
  destination: SemanticDestination,
): ReactNode {
  return children.map((block, index) => (
    <SemanticBlockElement
      key={index}
      block={block}
      inherited={inherited}
      navigation={navigation}
      destination={destination}
    />
  ));
}

interface SemanticBlockElementProps {
  readonly block: SemanticBlock;
  readonly inherited: EffectiveTextContext;
  readonly navigation: SemanticNavigation;
  readonly destination: SemanticDestination;
}

function SemanticBlockElement({
  block,
  inherited,
  navigation,
  destination,
}: SemanticBlockElementProps): ReactElement {
  const destinationRef =
    block === destination.block ? destination.ref : undefined;
  switch (block.kind) {
    case "block-quote": {
      const current = effectiveTextContext(block, inherited);
      return (
        <blockquote
          ref={destinationRef}
          {...textContextAttributes(current, inherited)}
        >
          {renderBlockChildren(
            block.children,
            current,
            navigation,
            destination,
          )}
        </blockquote>
      );
    }
    case "heading":
      return renderHeading(block, inherited, navigation, destinationRef);
    case "list": {
      const current = effectiveTextContext(block, inherited);
      const attributes = textContextAttributes(current, inherited);
      const items = block.items.map((item, index) => (
        <li key={index}>
          {renderBlockChildren(item.children, current, navigation, destination)}
        </li>
      ));
      return block.ordered ? (
        <ol ref={destinationRef} {...attributes}>
          {items}
        </ol>
      ) : (
        <ul ref={destinationRef} {...attributes}>
          {items}
        </ul>
      );
    }
    case "paragraph": {
      const current = effectiveTextContext(block, inherited);
      return (
        <p ref={destinationRef} {...textContextAttributes(current, inherited)}>
          {renderInlineChildren(block.children, current, navigation)}
        </p>
      );
    }
    default:
      return unreachable(block);
  }
}

export interface SemanticDocumentContentProps {
  readonly document: SemanticDocument;
  readonly targetAvailability?: (
    target: SemanticDocumentTarget,
  ) => ReaderTargetAvailability;
  readonly onActivateTarget?: (target: SemanticDocumentTarget) => void;
  readonly destinationBlock?: SemanticBlock;
  readonly destinationRef?: (element: HTMLElement | null) => void;
  readonly readerRef?: Ref<HTMLElement>;
}

export function SemanticDocumentContent({
  document,
  targetAvailability,
  onActivateTarget,
  destinationBlock,
  destinationRef,
  readerRef,
}: SemanticDocumentContentProps): ReactElement {
  const current = effectiveTextContext(document, EMPTY_TEXT_CONTEXT);
  const navigation = { targetAvailability, onActivateTarget };
  const destination = { block: destinationBlock, ref: destinationRef };
  return (
    <article
      ref={readerRef}
      tabIndex={-1}
      className="semantic-document"
      aria-label="Current reading section"
      {...textContextAttributes(current, EMPTY_TEXT_CONTEXT)}
    >
      {renderBlockChildren(document.blocks, current, navigation, destination)}
    </article>
  );
}
