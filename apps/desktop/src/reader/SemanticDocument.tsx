import type {
  OpenedPublication,
  SemanticBlock,
  SemanticDocument,
  SemanticHeadingBlock,
  SemanticInline,
  SemanticTextContext,
  SemanticTextDirection,
} from "@voxleaf/epub";
import type { ReactElement, ReactNode } from "react";

interface EffectiveTextContext {
  readonly language?: string;
  readonly direction?: SemanticTextDirection;
}

interface TextContextAttributes {
  readonly lang?: string;
  readonly dir?: SemanticTextDirection;
}

const EMPTY_TEXT_CONTEXT: EffectiveTextContext = Object.freeze({});

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
): ReactNode {
  return children.map((inline, index) => (
    <SemanticInlineElement key={index} inline={inline} inherited={inherited} />
  ));
}

interface SemanticInlineElementProps {
  readonly inline: SemanticInline;
  readonly inherited: EffectiveTextContext;
}

function SemanticInlineElement({
  inline,
  inherited,
}: SemanticInlineElementProps): ReactNode {
  switch (inline.kind) {
    case "code": {
      const current = effectiveTextContext(inline, inherited);
      return (
        <code {...textContextAttributes(current, inherited)}>
          {renderInlineChildren(inline.children, current)}
        </code>
      );
    }
    case "emphasis": {
      const current = effectiveTextContext(inline, inherited);
      return (
        <em {...textContextAttributes(current, inherited)}>
          {renderInlineChildren(inline.children, current)}
        </em>
      );
    }
    case "internal-link": {
      const current = effectiveTextContext(inline, inherited);
      return (
        <span
          className="semantic-internal-link"
          {...textContextAttributes(current, inherited)}
        >
          {renderInlineChildren(inline.children, current)}
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
          {renderInlineChildren(inline.children, current)}
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
): ReactElement {
  const current = effectiveTextContext(block, inherited);
  const attributes = textContextAttributes(current, inherited);
  const children = renderInlineChildren(block.children, current);

  switch (block.level) {
    case 1:
      return <h1 {...attributes}>{children}</h1>;
    case 2:
      return <h2 {...attributes}>{children}</h2>;
    case 3:
      return <h3 {...attributes}>{children}</h3>;
    case 4:
      return <h4 {...attributes}>{children}</h4>;
    case 5:
      return <h5 {...attributes}>{children}</h5>;
    case 6:
      return <h6 {...attributes}>{children}</h6>;
    default:
      return unreachable(block.level);
  }
}

function renderBlockChildren(
  children: readonly SemanticBlock[],
  inherited: EffectiveTextContext,
): ReactNode {
  return children.map((block, index) => (
    <SemanticBlockElement key={index} block={block} inherited={inherited} />
  ));
}

interface SemanticBlockElementProps {
  readonly block: SemanticBlock;
  readonly inherited: EffectiveTextContext;
}

function SemanticBlockElement({
  block,
  inherited,
}: SemanticBlockElementProps): ReactElement {
  switch (block.kind) {
    case "block-quote": {
      const current = effectiveTextContext(block, inherited);
      return (
        <blockquote {...textContextAttributes(current, inherited)}>
          {renderBlockChildren(block.children, current)}
        </blockquote>
      );
    }
    case "heading":
      return renderHeading(block, inherited);
    case "list": {
      const current = effectiveTextContext(block, inherited);
      const attributes = textContextAttributes(current, inherited);
      const items = block.items.map((item, index) => (
        <li key={index}>{renderBlockChildren(item.children, current)}</li>
      ));
      return block.ordered ? (
        <ol {...attributes}>{items}</ol>
      ) : (
        <ul {...attributes}>{items}</ul>
      );
    }
    case "paragraph": {
      const current = effectiveTextContext(block, inherited);
      return (
        <p {...textContextAttributes(current, inherited)}>
          {renderInlineChildren(block.children, current)}
        </p>
      );
    }
    default:
      return unreachable(block);
  }
}

export interface SemanticDocumentContentProps {
  readonly document: SemanticDocument;
}

export function SemanticDocumentContent({
  document,
}: SemanticDocumentContentProps): ReactElement {
  const current = effectiveTextContext(document, EMPTY_TEXT_CONTEXT);
  return (
    <article
      className="semantic-document"
      aria-label="Current reading section"
      {...textContextAttributes(current, EMPTY_TEXT_CONTEXT)}
    >
      {renderBlockChildren(document.blocks, current)}
    </article>
  );
}

function startingSpineDocument(
  publication: OpenedPublication,
): SemanticDocument {
  const firstLocatedBlock = publication.locators[0];
  if (firstLocatedBlock === undefined) {
    throw new Error("Readable spine document is unavailable.");
  }

  const document = publication.documents.find(
    (candidate) => candidate.id === firstLocatedBlock.documentId,
  );
  if (document === undefined || document.location.kind !== "spine") {
    throw new Error("Readable spine document is unavailable.");
  }
  return document;
}

export interface SemanticPublicationContentProps {
  readonly publication: OpenedPublication;
}

export function SemanticPublicationContent({
  publication,
}: SemanticPublicationContentProps): ReactElement {
  return (
    <div className="semantic-reader">
      <SemanticDocumentContent document={startingSpineDocument(publication)} />
    </div>
  );
}
