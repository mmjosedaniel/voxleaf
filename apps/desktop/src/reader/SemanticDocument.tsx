import type {
  PublicationLocatedBlock,
  SemanticBlock,
  SemanticDocument,
  SemanticDocumentTarget,
  SemanticInline,
  SemanticTextContext,
  SemanticTextDirection,
} from "@voxleaf/epub";
import { memo, useCallback, useMemo, useSyncExternalStore } from "react";
import type {
  MouseEventHandler,
  ReactElement,
  ReactNode,
  Ref,
  RefCallback,
} from "react";

import {
  assessSemanticDocumentRendering,
  LARGE_CHAPTER_BATCH_SIZE_BLOCKS,
  LargeChapterRenderScheduler,
  type ScheduleLargeChapterYield,
} from "./large-chapter-rendering";
import type { ActiveVisualLocatorTracker } from "./active-visual-locator";
import type { PublicationRasterImageLoadPort } from "./publication-raster-image-loader";
import type { ReaderTargetAvailability } from "./reader-navigation";
import type { SemanticDomRangeMapper } from "./semantic-dom-range-mapper";
import {
  SemanticRasterImageElement,
  type ObserveRasterImageVisibility,
} from "./SemanticRasterImage";

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

interface SemanticRenderServices {
  readonly targetAvailability:
    ((target: SemanticDocumentTarget) => ReaderTargetAvailability) | undefined;
  readonly onActivateTarget:
    ((target: SemanticDocumentTarget) => void) | undefined;
  readonly rasterImageLoader: PublicationRasterImageLoadPort | undefined;
  readonly observeRasterImageVisibility:
    ObserveRasterImageVisibility | undefined;
  readonly domRangeMapper: SemanticDomRangeMapper | undefined;
  readonly visualLocatorTracker: ActiveVisualLocatorTracker | undefined;
  readonly locatedBlocksByBlock:
    WeakMap<SemanticBlock, PublicationLocatedBlock> | undefined;
}

interface SemanticDestination {
  readonly block: SemanticBlock | undefined;
  readonly ref: ((element: HTMLElement | null) => void) | undefined;
  readonly blockIndex: number | undefined;
}

interface SemanticBlockPlan {
  readonly block: SemanticBlock;
  readonly startIndex: number;
  readonly endIndex: number;
  readonly children: SemanticBlockSequencePlan | undefined;
  readonly listItemGroups: readonly SemanticListItemGroupPlan[] | undefined;
}

interface SemanticListItemPlan {
  readonly startIndex: number;
  readonly endIndex: number;
  readonly children: SemanticBlockSequencePlan;
}

interface SemanticBlockGroupPlan {
  readonly startIndex: number;
  readonly endIndex: number;
  readonly blocks: readonly SemanticBlockPlan[];
}

interface SemanticListItemGroupPlan {
  readonly startIndex: number;
  readonly endIndex: number;
  readonly items: readonly SemanticListItemPlan[];
}

interface SemanticBlockSequencePlan {
  readonly groups: readonly SemanticBlockGroupPlan[];
}

interface SemanticDocumentRenderPlan {
  readonly blocks: SemanticBlockSequencePlan;
  readonly blockIndexes: WeakMap<SemanticBlock, number>;
  readonly semanticBlockCount: number;
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
  services: SemanticRenderServices,
): ReactNode {
  return children.map((inline, index) => (
    <SemanticInlineElement
      key={index}
      inline={inline}
      inherited={inherited}
      services={services}
    />
  ));
}

interface SemanticInlineElementProps {
  readonly inline: SemanticInline;
  readonly inherited: EffectiveTextContext;
  readonly services: SemanticRenderServices;
}

function SemanticInlineElement({
  inline,
  inherited,
  services,
}: SemanticInlineElementProps): ReactNode {
  switch (inline.kind) {
    case "code": {
      const current = effectiveTextContext(inline, inherited);
      return (
        <code {...textContextAttributes(current, inherited)}>
          {renderInlineChildren(inline.children, current, services)}
        </code>
      );
    }
    case "emphasis": {
      const current = effectiveTextContext(inline, inherited);
      return (
        <em {...textContextAttributes(current, inherited)}>
          {renderInlineChildren(inline.children, current, services)}
        </em>
      );
    }
    case "internal-link": {
      const current = effectiveTextContext(inline, inherited);
      const availability =
        services.targetAvailability?.(inline.target) ??
        DEFAULT_TARGET_AVAILABILITY;
      const children = renderInlineChildren(inline.children, current, services);
      if (
        availability.status === "available" &&
        services.onActivateTarget !== undefined
      ) {
        const activate: MouseEventHandler<HTMLButtonElement> = () =>
          services.onActivateTarget?.(inline.target);
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
      const attributes = textContextAttributes(current, inherited);
      return (
        <SemanticRasterImageElement
          resourceId={inline.resourceId}
          alternativeText={inline.alternativeText}
          loader={services.rasterImageLoader}
          observeVisibility={services.observeRasterImageVisibility}
          language={attributes.lang}
          direction={attributes.dir}
        />
      );
    }
    case "strong": {
      const current = effectiveTextContext(inline, inherited);
      return (
        <strong {...textContextAttributes(current, inherited)}>
          {renderInlineChildren(inline.children, current, services)}
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

interface MutableBlockIndex {
  value: number;
}

function buildBlockPlan(
  block: SemanticBlock,
  index: MutableBlockIndex,
  blockIndexes: WeakMap<SemanticBlock, number>,
): SemanticBlockPlan {
  const startIndex = index.value;
  blockIndexes.set(block, startIndex);
  index.value += 1;

  let children: SemanticBlockSequencePlan | undefined;
  let listItemGroups: readonly SemanticListItemGroupPlan[] | undefined;

  switch (block.kind) {
    case "block-quote":
      children = buildBlockSequencePlan(block.children, index, blockIndexes);
      break;
    case "heading":
    case "paragraph":
      break;
    case "list":
      listItemGroups = groupListItemPlans(
        block.items.map((item) => {
          const itemStartIndex = index.value;
          const itemChildren = buildBlockSequencePlan(
            item.children,
            index,
            blockIndexes,
          );
          return Object.freeze({
            startIndex:
              itemStartIndex === index.value ? startIndex : itemStartIndex,
            endIndex: index.value,
            children: itemChildren,
          });
        }),
      );
      break;
    default:
      return unreachable(block);
  }

  return Object.freeze({
    block,
    startIndex,
    endIndex: index.value,
    children,
    listItemGroups,
  });
}

function groupBlockPlans(
  blocks: readonly SemanticBlockPlan[],
): readonly SemanticBlockGroupPlan[] {
  const groups: SemanticBlockGroupPlan[] = [];
  let current: SemanticBlockPlan[] = [];
  let currentBlockCount = 0;

  const flush = (): void => {
    const first = current[0];
    const last = current.at(-1);
    if (first === undefined || last === undefined) {
      return;
    }
    groups.push(
      Object.freeze({
        startIndex: first.startIndex,
        endIndex: last.endIndex,
        blocks: Object.freeze(current),
      }),
    );
    current = [];
    currentBlockCount = 0;
  };

  for (const block of blocks) {
    const blockCount = block.endIndex - block.startIndex;
    if (
      current.length > 0 &&
      currentBlockCount + blockCount > LARGE_CHAPTER_BATCH_SIZE_BLOCKS
    ) {
      flush();
    }
    current.push(block);
    currentBlockCount += blockCount;
    if (currentBlockCount >= LARGE_CHAPTER_BATCH_SIZE_BLOCKS) {
      flush();
    }
  }
  flush();
  return Object.freeze(groups);
}

function buildBlockSequencePlan(
  blocks: readonly SemanticBlock[],
  index: MutableBlockIndex,
  blockIndexes: WeakMap<SemanticBlock, number>,
): SemanticBlockSequencePlan {
  const plans = blocks.map((block) =>
    buildBlockPlan(block, index, blockIndexes),
  );
  return Object.freeze({ groups: groupBlockPlans(plans) });
}

function buildDocumentRenderPlan(
  document: SemanticDocument,
): SemanticDocumentRenderPlan {
  const index = { value: 0 };
  const blockIndexes = new WeakMap<SemanticBlock, number>();
  const blocks = buildBlockSequencePlan(document.blocks, index, blockIndexes);
  return Object.freeze({
    blocks,
    blockIndexes,
    semanticBlockCount: index.value,
  });
}

function effectiveContextEqual(
  left: EffectiveTextContext,
  right: EffectiveTextContext,
): boolean {
  return left.language === right.language && left.direction === right.direction;
}

function destinationAffectsRange(
  destination: SemanticDestination,
  range: Readonly<{ startIndex: number; endIndex: number }>,
): boolean {
  return (
    destination.blockIndex !== undefined &&
    destination.blockIndex >= range.startIndex &&
    destination.blockIndex < range.endIndex
  );
}

interface SemanticBlockGroupElementProps {
  readonly group: SemanticBlockGroupPlan;
  readonly renderedBlockCount: number;
  readonly inherited: EffectiveTextContext;
  readonly services: SemanticRenderServices;
  readonly destination: SemanticDestination;
}

function blockGroupPropsEqual(
  previous: SemanticBlockGroupElementProps,
  next: SemanticBlockGroupElementProps,
): boolean {
  if (
    previous.group !== next.group ||
    previous.services !== next.services ||
    !effectiveContextEqual(previous.inherited, next.inherited)
  ) {
    return false;
  }
  if (
    previous.destination !== next.destination &&
    (destinationAffectsRange(previous.destination, previous.group) ||
      destinationAffectsRange(next.destination, next.group))
  ) {
    return false;
  }
  return (
    previous.renderedBlockCount === next.renderedBlockCount ||
    (previous.renderedBlockCount >= previous.group.endIndex &&
      next.renderedBlockCount >= next.group.endIndex)
  );
}

function renderBlockSequence(
  sequence: SemanticBlockSequencePlan,
  renderedBlockCount: number,
  inherited: EffectiveTextContext,
  services: SemanticRenderServices,
  destination: SemanticDestination,
): ReactNode {
  return sequence.groups
    .filter((group) => group.startIndex < renderedBlockCount)
    .map((group, index) => (
      <MemoizedSemanticBlockGroupElement
        key={index}
        group={group}
        renderedBlockCount={renderedBlockCount}
        inherited={inherited}
        services={services}
        destination={destination}
      />
    ));
}

function SemanticBlockGroupElement({
  group,
  renderedBlockCount,
  inherited,
  services,
  destination,
}: SemanticBlockGroupElementProps): ReactNode {
  return group.blocks
    .filter((plan) => plan.startIndex < renderedBlockCount)
    .map((plan, index) => (
      <SemanticBlockElement
        key={index}
        plan={plan}
        renderedBlockCount={renderedBlockCount}
        inherited={inherited}
        services={services}
        destination={destination}
      />
    ));
}

const MemoizedSemanticBlockGroupElement = memo(
  SemanticBlockGroupElement,
  blockGroupPropsEqual,
);

interface SemanticListItemGroupElementProps {
  readonly group: SemanticListItemGroupPlan;
  readonly renderedBlockCount: number;
  readonly inherited: EffectiveTextContext;
  readonly services: SemanticRenderServices;
  readonly destination: SemanticDestination;
}

function listItemGroupPropsEqual(
  previous: SemanticListItemGroupElementProps,
  next: SemanticListItemGroupElementProps,
): boolean {
  if (
    previous.group !== next.group ||
    previous.services !== next.services ||
    !effectiveContextEqual(previous.inherited, next.inherited)
  ) {
    return false;
  }
  if (
    previous.destination !== next.destination &&
    (destinationAffectsRange(previous.destination, previous.group) ||
      destinationAffectsRange(next.destination, next.group))
  ) {
    return false;
  }
  return (
    previous.renderedBlockCount === next.renderedBlockCount ||
    (previous.renderedBlockCount >= previous.group.endIndex &&
      next.renderedBlockCount >= next.group.endIndex)
  );
}

function groupListItemPlans(
  items: readonly SemanticListItemPlan[],
): readonly SemanticListItemGroupPlan[] {
  const groups: SemanticListItemGroupPlan[] = [];
  let current: SemanticListItemPlan[] = [];
  let currentBlockCount = 0;

  const flush = (): void => {
    const first = current[0];
    const last = current.at(-1);
    if (first === undefined || last === undefined) {
      return;
    }
    groups.push(
      Object.freeze({
        startIndex: first.startIndex,
        endIndex: last.endIndex,
        items: Object.freeze(current),
      }),
    );
    current = [];
    currentBlockCount = 0;
  };

  for (const item of items) {
    const blockCount = item.endIndex - item.startIndex;
    if (
      current.length > 0 &&
      currentBlockCount + blockCount > LARGE_CHAPTER_BATCH_SIZE_BLOCKS
    ) {
      flush();
    }
    current.push(item);
    currentBlockCount += blockCount;
    if (currentBlockCount >= LARGE_CHAPTER_BATCH_SIZE_BLOCKS) {
      flush();
    }
  }
  flush();
  return Object.freeze(groups);
}

function SemanticListItemGroupElement({
  group,
  renderedBlockCount,
  inherited,
  services,
  destination,
}: SemanticListItemGroupElementProps): ReactNode {
  return group.items
    .filter((item) => item.startIndex < renderedBlockCount)
    .map((item, index) => (
      <li key={index}>
        {renderBlockSequence(
          item.children,
          renderedBlockCount,
          inherited,
          services,
          destination,
        )}
      </li>
    ));
}

const MemoizedSemanticListItemGroupElement = memo(
  SemanticListItemGroupElement,
  listItemGroupPropsEqual,
);

function renderListItems(
  groups: readonly SemanticListItemGroupPlan[],
  renderedBlockCount: number,
  inherited: EffectiveTextContext,
  services: SemanticRenderServices,
  destination: SemanticDestination,
): ReactNode {
  return groups
    .filter((group) => group.startIndex < renderedBlockCount)
    .map((group, index) => (
      <MemoizedSemanticListItemGroupElement
        key={index}
        group={group}
        renderedBlockCount={renderedBlockCount}
        inherited={inherited}
        services={services}
        destination={destination}
      />
    ));
}

interface SemanticBlockElementProps {
  readonly plan: SemanticBlockPlan;
  readonly renderedBlockCount: number;
  readonly inherited: EffectiveTextContext;
  readonly services: SemanticRenderServices;
  readonly destination: SemanticDestination;
}

function useSemanticBlockElementRef(
  destinationRef: ((element: HTMLElement | null) => void) | undefined,
  domRangeMapper: SemanticDomRangeMapper | undefined,
  visualLocatorTracker: ActiveVisualLocatorTracker | undefined,
  locatedBlock: PublicationLocatedBlock | undefined,
): RefCallback<HTMLElement> | undefined {
  const elementRef = useCallback(
    (element: HTMLElement | null) => {
      if (element === null) {
        destinationRef?.(null);
        return;
      }
      destinationRef?.(element);
      const unregister =
        domRangeMapper === undefined || locatedBlock === undefined
          ? undefined
          : domRangeMapper.registerBlock(element, locatedBlock);
      const unregisterVisualLocator =
        visualLocatorTracker === undefined || locatedBlock === undefined
          ? undefined
          : visualLocatorTracker.registerBlock(element, locatedBlock);
      return () => {
        unregisterVisualLocator?.();
        unregister?.();
        destinationRef?.(null);
      };
    },
    [destinationRef, domRangeMapper, locatedBlock, visualLocatorTracker],
  );

  return destinationRef === undefined &&
    (domRangeMapper === undefined || locatedBlock === undefined) &&
    (visualLocatorTracker === undefined || locatedBlock === undefined)
    ? undefined
    : elementRef;
}

function SemanticBlockElement({
  plan,
  renderedBlockCount,
  inherited,
  services,
  destination,
}: SemanticBlockElementProps): ReactElement {
  const { block } = plan;
  const destinationRef =
    block === destination.block ? destination.ref : undefined;
  const locatedBlock = services.locatedBlocksByBlock?.get(block);
  const elementRef = useSemanticBlockElementRef(
    destinationRef,
    services.domRangeMapper,
    services.visualLocatorTracker,
    locatedBlock,
  );
  switch (block.kind) {
    case "block-quote": {
      const current = effectiveTextContext(block, inherited);
      if (plan.children === undefined) {
        throw new Error("Semantic reader plan is invalid.");
      }
      return (
        <blockquote
          ref={elementRef}
          {...textContextAttributes(current, inherited)}
        >
          {renderBlockSequence(
            plan.children,
            renderedBlockCount,
            current,
            services,
            destination,
          )}
        </blockquote>
      );
    }
    case "heading": {
      const current = effectiveTextContext(block, inherited);
      const attributes = textContextAttributes(current, inherited);
      const children = renderInlineChildren(block.children, current, services);
      const destinationAttributes =
        destinationRef === undefined ? {} : { tabIndex: -1 as const };
      switch (block.level) {
        case 1:
          return (
            <h1 ref={elementRef} {...attributes} {...destinationAttributes}>
              {children}
            </h1>
          );
        case 2:
          return (
            <h2 ref={elementRef} {...attributes} {...destinationAttributes}>
              {children}
            </h2>
          );
        case 3:
          return (
            <h3 ref={elementRef} {...attributes} {...destinationAttributes}>
              {children}
            </h3>
          );
        case 4:
          return (
            <h4 ref={elementRef} {...attributes} {...destinationAttributes}>
              {children}
            </h4>
          );
        case 5:
          return (
            <h5 ref={elementRef} {...attributes} {...destinationAttributes}>
              {children}
            </h5>
          );
        case 6:
          return (
            <h6 ref={elementRef} {...attributes} {...destinationAttributes}>
              {children}
            </h6>
          );
        default:
          return unreachable(block.level);
      }
    }
    case "list": {
      const current = effectiveTextContext(block, inherited);
      const attributes = textContextAttributes(current, inherited);
      if (plan.listItemGroups === undefined) {
        throw new Error("Semantic reader plan is invalid.");
      }
      const items = renderListItems(
        plan.listItemGroups,
        renderedBlockCount,
        current,
        services,
        destination,
      );
      return block.ordered ? (
        <ol ref={elementRef} {...attributes}>
          {items}
        </ol>
      ) : (
        <ul ref={elementRef} {...attributes}>
          {items}
        </ul>
      );
    }
    case "paragraph": {
      const current = effectiveTextContext(block, inherited);
      return (
        <p ref={elementRef} {...textContextAttributes(current, inherited)}>
          {renderInlineChildren(block.children, current, services)}
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
  readonly rasterImageLoader?: PublicationRasterImageLoadPort;
  readonly observeRasterImageVisibility?: ObserveRasterImageVisibility;
  readonly scheduleRenderYield?: ScheduleLargeChapterYield;
  readonly domRangeMapper?: SemanticDomRangeMapper;
  readonly visualLocatorTracker?: ActiveVisualLocatorTracker;
  readonly locatedBlocks?: readonly PublicationLocatedBlock[];
}

interface AcceptedSemanticDocumentContentProps extends SemanticDocumentContentProps {
  readonly semanticBlockCount: number;
}

function AcceptedSemanticDocumentContent({
  document,
  targetAvailability,
  onActivateTarget,
  destinationBlock,
  destinationRef,
  readerRef,
  rasterImageLoader,
  observeRasterImageVisibility,
  scheduleRenderYield,
  domRangeMapper,
  visualLocatorTracker,
  locatedBlocks,
  semanticBlockCount,
}: AcceptedSemanticDocumentContentProps): ReactElement {
  const plan = useMemo(() => buildDocumentRenderPlan(document), [document]);
  if (plan.semanticBlockCount !== semanticBlockCount) {
    throw new Error("Semantic reader capacity changed.");
  }
  const scheduler = useMemo(
    () =>
      new LargeChapterRenderScheduler(semanticBlockCount, scheduleRenderYield),
    [scheduleRenderYield, semanticBlockCount],
  );
  const renderedBlockCount = useSyncExternalStore(
    scheduler.subscribe,
    scheduler.getSnapshot,
    scheduler.getSnapshot,
  );
  const current = useMemo(
    () => effectiveTextContext(document, EMPTY_TEXT_CONTEXT),
    [document],
  );
  const locatedBlocksByBlock = useMemo(() => {
    if (
      (domRangeMapper === undefined && visualLocatorTracker === undefined) ||
      locatedBlocks === undefined
    ) {
      return undefined;
    }
    const result = new WeakMap<SemanticBlock, PublicationLocatedBlock>();
    for (const locatedBlock of locatedBlocks) {
      if (
        locatedBlock.documentId === document.id &&
        plan.blockIndexes.has(locatedBlock.block)
      ) {
        result.set(locatedBlock.block, locatedBlock);
      }
    }
    return result;
  }, [
    document.id,
    domRangeMapper,
    locatedBlocks,
    plan.blockIndexes,
    visualLocatorTracker,
  ]);
  const services = useMemo(
    () => ({
      targetAvailability,
      onActivateTarget,
      rasterImageLoader,
      observeRasterImageVisibility,
      domRangeMapper,
      visualLocatorTracker,
      locatedBlocksByBlock,
    }),
    [
      domRangeMapper,
      locatedBlocksByBlock,
      onActivateTarget,
      observeRasterImageVisibility,
      rasterImageLoader,
      targetAvailability,
      visualLocatorTracker,
    ],
  );
  const destination = useMemo(
    () => ({
      block: destinationBlock,
      ref: destinationRef,
      blockIndex:
        destinationBlock === undefined
          ? undefined
          : plan.blockIndexes.get(destinationBlock),
    }),
    [destinationBlock, destinationRef, plan.blockIndexes],
  );
  const complete = renderedBlockCount >= semanticBlockCount;

  return (
    <>
      {complete ? null : (
        <p
          className="reader-rendering-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          Loading more of this reading section.
        </p>
      )}
      <article
        ref={readerRef}
        tabIndex={-1}
        className="semantic-document"
        aria-label="Current reading section"
        aria-busy={complete ? undefined : "true"}
        {...textContextAttributes(current, EMPTY_TEXT_CONTEXT)}
      >
        {renderBlockSequence(
          plan.blocks,
          renderedBlockCount,
          current,
          services,
          destination,
        )}
      </article>
    </>
  );
}

export interface ChapterTooLargeContentProps {
  readonly readerRef?: Ref<HTMLElement> | undefined;
}

export function ChapterTooLargeContent({
  readerRef,
}: ChapterTooLargeContentProps): ReactElement {
  return (
    <article
      ref={readerRef}
      tabIndex={-1}
      className="semantic-document reader-chapter-too-large"
      aria-label="Current reading section"
    >
      <h2>Reading section unavailable</h2>
      <p>This reading section is too large to display safely.</p>
      <p>Choose another section from the table of contents.</p>
    </article>
  );
}

export function SemanticDocumentContent(
  props: SemanticDocumentContentProps,
): ReactElement {
  const capacity = useMemo(
    () => assessSemanticDocumentRendering(props.document),
    [props.document],
  );

  if (capacity.status === "chapter-too-large") {
    return <ChapterTooLargeContent readerRef={props.readerRef} />;
  }

  return (
    <AcceptedSemanticDocumentContent
      {...props}
      semanticBlockCount={capacity.semanticBlockCount}
    />
  );
}
