import type {
  PublicationLocatedBlock,
  SemanticBlock,
  SemanticInline,
} from "@voxleaf/epub";
import { createIndex } from "@voxleaf/shared";
import type { Index } from "@voxleaf/shared";

const TEXT_CHECKPOINT_INTERVAL_CODE_POINTS = 4_096;
const NOOP = (): void => undefined;

interface TextCheckpoint {
  readonly codePointOffset: number;
  readonly utf16Offset: number;
}

const ZERO_TEXT_CHECKPOINT: TextCheckpoint = Object.freeze({
  codePointOffset: 0,
  utf16Offset: 0,
});
const START_TEXT_CHECKPOINTS: readonly TextCheckpoint[] = Object.freeze([
  ZERO_TEXT_CHECKPOINT,
]);

interface TextSegment {
  readonly kind: "text";
  readonly node: Text;
  readonly startCodePointOffset: number;
  readonly endCodePointOffset: number;
  readonly utf16Length: number;
  readonly checkpoints: readonly TextCheckpoint[];
  registration: RegisteredBlock | undefined;
}

interface AtomicSegment {
  readonly kind: "atomic";
  readonly node: Element;
  readonly parent: Node;
  readonly childIndex: number;
  readonly startCodePointOffset: number;
  readonly endCodePointOffset: number;
}

type DomSegment = AtomicSegment | TextSegment;

interface ContainerBoundaries {
  readonly node: Node;
  readonly childCount: number;
  readonly codePointOffsets: readonly number[];
  registration: RegisteredBlock | undefined;
}

interface RegisteredBlock {
  readonly element: HTMLElement;
  readonly locatedBlock: PublicationLocatedBlock;
  readonly segments: readonly DomSegment[];
  readonly containerBoundaries: readonly ContainerBoundaries[];
  active: boolean;
}

interface MutableMappingBuild {
  codePointOffset: number;
  readonly segments: DomSegment[];
  readonly containerBoundaries: ContainerBoundaries[];
}

export interface SemanticDomPosition {
  readonly locatedBlock: PublicationLocatedBlock;
  readonly textOffsetCodePoints: Index;
}

function unreachable(value: never): never {
  void value;
  throw new Error("Unsupported semantic DOM mapping value.");
}

function addLength(left: number, right: number): number | undefined {
  const result = left + right;
  return Number.isSafeInteger(result) ? result : undefined;
}

function countTextCodePoints(text: string): number {
  let count = 0;
  for (let index = 0; index < text.length; index += 1) {
    const codePoint = text.codePointAt(index);
    if (codePoint !== undefined && codePoint > 0xffff) {
      index += 1;
    }
    count += 1;
  }
  return count;
}

function inlineLengthCodePoints(
  inlines: readonly SemanticInline[],
): number | undefined {
  let length = 0;
  for (const inline of inlines) {
    let inlineLength: number | undefined;
    switch (inline.kind) {
      case "text":
        inlineLength = countTextCodePoints(String(inline.text));
        break;
      case "line-break":
      case "raster-image":
        inlineLength = 1;
        break;
      case "code":
      case "emphasis":
      case "internal-link":
      case "strong":
        inlineLength = inlineLengthCodePoints(inline.children);
        break;
      default:
        return unreachable(inline);
    }
    if (inlineLength === undefined) {
      return undefined;
    }
    const nextLength = addLength(length, inlineLength);
    if (nextLength === undefined) {
      return undefined;
    }
    length = nextLength;
  }
  return length;
}

function blockLengthCodePoints(block: SemanticBlock): number | undefined {
  switch (block.kind) {
    case "heading":
    case "paragraph":
      return inlineLengthCodePoints(block.children);
    case "block-quote":
    case "list":
      return 0;
    default:
      return unreachable(block);
  }
}

function elementMatchesBlock(
  element: HTMLElement,
  block: SemanticBlock,
): boolean {
  switch (block.kind) {
    case "heading":
      return element.tagName === `H${String(block.level)}`;
    case "paragraph":
      return element.tagName === "P";
    case "block-quote":
      return element.tagName === "BLOCKQUOTE";
    case "list":
      return element.tagName === (block.ordered ? "OL" : "UL");
    default:
      return unreachable(block);
  }
}

function buildTextCheckpoints(text: string): {
  readonly codePointLength: number;
  readonly checkpoints: readonly TextCheckpoint[];
} {
  let checkpoints: TextCheckpoint[] | undefined;
  let codePointOffset = 0;
  let utf16Offset = 0;

  while (utf16Offset < text.length) {
    const codePoint = text.codePointAt(utf16Offset);
    utf16Offset += codePoint !== undefined && codePoint > 0xffff ? 2 : 1;
    codePointOffset += 1;
    if (
      codePointOffset % TEXT_CHECKPOINT_INTERVAL_CODE_POINTS === 0 &&
      utf16Offset < text.length
    ) {
      checkpoints ??= [ZERO_TEXT_CHECKPOINT];
      checkpoints.push(Object.freeze({ codePointOffset, utf16Offset }));
    }
  }

  return Object.freeze({
    codePointLength: codePointOffset,
    checkpoints:
      checkpoints === undefined
        ? START_TEXT_CHECKPOINTS
        : Object.freeze(checkpoints),
  });
}

function isIgnoredApplicationSubtree(element: Element): boolean {
  return element.classList.contains("visually-hidden");
}

function isRasterReplacement(element: Element): boolean {
  return element.classList.contains("semantic-raster-host");
}

function childIndex(node: Node): number | undefined {
  const parent = node.parentNode;
  if (parent === null) {
    return undefined;
  }
  const index = Array.prototype.indexOf.call(parent.childNodes, node) as number;
  return index >= 0 ? index : undefined;
}

function appendAtomicSegment(
  node: Element,
  build: MutableMappingBuild,
): boolean {
  const parent = node.parentNode;
  const index = childIndex(node);
  if (parent === null || index === undefined) {
    return false;
  }
  const endCodePointOffset = addLength(build.codePointOffset, 1);
  if (endCodePointOffset === undefined) {
    return false;
  }
  build.segments.push(
    Object.freeze({
      kind: "atomic",
      node,
      parent,
      childIndex: index,
      startCodePointOffset: build.codePointOffset,
      endCodePointOffset,
    }),
  );
  build.codePointOffset = endCodePointOffset;
  return true;
}

function appendTextSegment(node: Text, build: MutableMappingBuild): boolean {
  if (node.data.length === 0) {
    return true;
  }
  const text = buildTextCheckpoints(node.data);
  const endCodePointOffset = addLength(
    build.codePointOffset,
    text.codePointLength,
  );
  if (endCodePointOffset === undefined) {
    return false;
  }
  const segment: TextSegment = {
    kind: "text",
    node,
    startCodePointOffset: build.codePointOffset,
    endCodePointOffset,
    utf16Length: node.data.length,
    checkpoints: text.checkpoints,
    registration: undefined,
  };
  build.segments.push(segment);
  build.codePointOffset = endCodePointOffset;
  return true;
}

function visitContainer(container: Node, build: MutableMappingBuild): boolean {
  const boundaries: number[] = [build.codePointOffset];
  const children = Array.from(container.childNodes);

  for (const child of children) {
    if (child.nodeType === 3) {
      if (!appendTextSegment(child as Text, build)) {
        return false;
      }
    } else if (child.nodeType === 1) {
      const element = child as Element;
      if (isIgnoredApplicationSubtree(element)) {
        // Application accessibility explanations do not redefine EPUB text.
      } else if (element.tagName === "BR" || isRasterReplacement(element)) {
        if (!appendAtomicSegment(element, build)) {
          return false;
        }
      } else if (!visitContainer(element, build)) {
        return false;
      }
    }
    boundaries.push(build.codePointOffset);
  }

  build.containerBoundaries.push({
    node: container,
    childCount: children.length,
    codePointOffsets: boundaries,
    registration: undefined,
  });
  return true;
}

function buildRegistration(
  element: HTMLElement,
  locatedBlock: PublicationLocatedBlock,
): RegisteredBlock | undefined {
  if (
    !elementMatchesBlock(element, locatedBlock.block) ||
    !Number.isSafeInteger(locatedBlock.textLengthCodePoints)
  ) {
    return undefined;
  }
  const semanticLength = blockLengthCodePoints(locatedBlock.block);
  if (
    semanticLength === undefined ||
    semanticLength !== locatedBlock.textLengthCodePoints
  ) {
    return undefined;
  }

  const build: MutableMappingBuild = {
    codePointOffset: 0,
    segments: [],
    containerBoundaries: [],
  };

  if (
    locatedBlock.block.kind === "heading" ||
    locatedBlock.block.kind === "paragraph"
  ) {
    if (!visitContainer(element, build)) {
      return undefined;
    }
  } else {
    build.containerBoundaries.push({
      node: element,
      childCount: element.childNodes.length,
      codePointOffsets: Array.from(
        { length: element.childNodes.length + 1 },
        () => 0,
      ),
      registration: undefined,
    });
  }

  if (build.codePointOffset !== semanticLength) {
    return undefined;
  }

  return {
    element,
    locatedBlock,
    segments: build.segments,
    containerBoundaries: build.containerBoundaries,
    active: true,
  };
}

function checkpointForCodePoint(
  checkpoints: readonly TextCheckpoint[],
  target: number,
): TextCheckpoint {
  let low = 0;
  let high = checkpoints.length - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (checkpoints[middle]!.codePointOffset <= target) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }
  return checkpoints[low]!;
}

function checkpointForUtf16(
  checkpoints: readonly TextCheckpoint[],
  target: number,
): TextCheckpoint {
  let low = 0;
  let high = checkpoints.length - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (checkpoints[middle]!.utf16Offset <= target) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }
  return checkpoints[low]!;
}

function utf16OffsetForCodePoint(
  segment: TextSegment,
  localCodePointOffset: number,
): number | undefined {
  const localLength = segment.endCodePointOffset - segment.startCodePointOffset;
  if (
    !Number.isSafeInteger(localCodePointOffset) ||
    localCodePointOffset < 0 ||
    localCodePointOffset > localLength ||
    segment.node.data.length !== segment.utf16Length
  ) {
    return undefined;
  }
  const checkpoint = checkpointForCodePoint(
    segment.checkpoints,
    localCodePointOffset,
  );
  let codePointOffset = checkpoint.codePointOffset;
  let utf16Offset = checkpoint.utf16Offset;

  while (codePointOffset < localCodePointOffset) {
    const codePoint = segment.node.data.codePointAt(utf16Offset);
    if (codePoint === undefined) {
      return undefined;
    }
    utf16Offset += codePoint > 0xffff ? 2 : 1;
    codePointOffset += 1;
  }
  return utf16Offset;
}

function codePointOffsetForUtf16(
  segment: TextSegment,
  targetUtf16Offset: number,
): number | undefined {
  if (
    !Number.isSafeInteger(targetUtf16Offset) ||
    targetUtf16Offset < 0 ||
    targetUtf16Offset > segment.utf16Length ||
    segment.node.data.length !== segment.utf16Length
  ) {
    return undefined;
  }
  const checkpoint = checkpointForUtf16(segment.checkpoints, targetUtf16Offset);
  let codePointOffset = checkpoint.codePointOffset;
  let utf16Offset = checkpoint.utf16Offset;

  while (utf16Offset < targetUtf16Offset) {
    const codePoint = segment.node.data.codePointAt(utf16Offset);
    if (codePoint === undefined) {
      return undefined;
    }
    const width = codePoint > 0xffff ? 2 : 1;
    if (utf16Offset + width > targetUtf16Offset) {
      return undefined;
    }
    utf16Offset += width;
    codePointOffset += 1;
  }
  return codePointOffset;
}

function isCurrent(registration: RegisteredBlock): boolean {
  return registration.active && registration.element.isConnected;
}

function createRangeAtOffset(
  registration: RegisteredBlock,
  textOffsetCodePoints: number,
): Range | undefined {
  if (
    !isCurrent(registration) ||
    !Number.isSafeInteger(textOffsetCodePoints) ||
    textOffsetCodePoints < 0 ||
    textOffsetCodePoints > registration.locatedBlock.textLengthCodePoints
  ) {
    return undefined;
  }

  const range = registration.element.ownerDocument.createRange();
  if (registration.segments.length === 0) {
    range.setStart(registration.element, 0);
    range.collapse(true);
    return range;
  }

  for (const segment of registration.segments) {
    if (textOffsetCodePoints > segment.endCodePointOffset) {
      continue;
    }
    if (segment.kind === "text") {
      if (!registration.element.contains(segment.node)) {
        return undefined;
      }
      const utf16Offset = utf16OffsetForCodePoint(
        segment,
        textOffsetCodePoints - segment.startCodePointOffset,
      );
      if (utf16Offset === undefined) {
        return undefined;
      }
      range.setStart(segment.node, utf16Offset);
      range.collapse(true);
      return range;
    }
    if (
      segment.node.parentNode !== segment.parent ||
      segment.parent.childNodes[segment.childIndex] !== segment.node ||
      !registration.element.contains(segment.node)
    ) {
      return undefined;
    }
    range.setStart(
      segment.parent,
      textOffsetCodePoints === segment.startCodePointOffset
        ? segment.childIndex
        : segment.childIndex + 1,
    );
    range.collapse(true);
    return range;
  }
  return undefined;
}

function offsetForRange(
  registration: RegisteredBlock,
  range: Range,
  textSegmentsByNode: WeakMap<Text, TextSegment>,
  containerBoundariesByNode: WeakMap<Node, ContainerBoundaries>,
): number | undefined {
  if (!range.collapsed || !isCurrent(registration)) {
    return undefined;
  }
  const container = range.startContainer;
  if (
    container !== registration.element &&
    !registration.element.contains(container)
  ) {
    return undefined;
  }

  if (container.nodeType === 3) {
    const segment = textSegmentsByNode.get(container as Text);
    if (segment === undefined || segment.registration !== registration) {
      return undefined;
    }
    const localOffset = codePointOffsetForUtf16(segment, range.startOffset);
    if (localOffset === undefined) {
      return undefined;
    }
    return segment.startCodePointOffset + localOffset;
  }

  const boundaries = containerBoundariesByNode.get(container);
  if (
    boundaries === undefined ||
    boundaries.registration !== registration ||
    container.childNodes.length !== boundaries.childCount ||
    range.startOffset < 0 ||
    range.startOffset > boundaries.childCount
  ) {
    return undefined;
  }
  return boundaries.codePointOffsets[range.startOffset];
}

/**
 * Owns content-free associations between rendered semantic blocks and their
 * immutable package locators. It performs no geometry, navigation, or storage.
 */
export class SemanticDomRangeMapper {
  #registrations = new Set<RegisteredBlock>();
  #registrationsByBlock = new WeakMap<
    PublicationLocatedBlock,
    RegisteredBlock
  >();
  #registrationsByElement = new WeakMap<HTMLElement, RegisteredBlock>();
  #textSegmentsByNode = new WeakMap<Text, TextSegment>();
  #containerBoundariesByNode = new WeakMap<Node, ContainerBoundaries>();
  #closed = false;

  public get registrationCount(): number {
    return this.#registrations.size;
  }

  public registerBlock(
    element: HTMLElement,
    locatedBlock: PublicationLocatedBlock,
  ): () => void {
    if (this.#closed || !element.isConnected) {
      return NOOP;
    }
    const registration = buildRegistration(element, locatedBlock);
    if (registration === undefined) {
      return NOOP;
    }

    const priorForBlock = this.#registrationsByBlock.get(locatedBlock);
    if (priorForBlock !== undefined) {
      this.#remove(priorForBlock);
    }
    const priorForElement = this.#registrationsByElement.get(element);
    if (priorForElement !== undefined) {
      this.#remove(priorForElement);
    }

    this.#registrations.add(registration);
    this.#registrationsByBlock.set(locatedBlock, registration);
    this.#registrationsByElement.set(element, registration);
    for (const segment of registration.segments) {
      if (segment.kind === "text") {
        segment.registration = registration;
        this.#textSegmentsByNode.set(segment.node, segment);
      }
    }
    for (const boundaries of registration.containerBoundaries) {
      boundaries.registration = registration;
      this.#containerBoundariesByNode.set(boundaries.node, boundaries);
    }

    return () => this.#remove(registration);
  }

  public rangeFor(
    locatedBlock: PublicationLocatedBlock,
    textOffsetCodePoints: number,
  ): Range | undefined {
    const registration = this.#registrationsByBlock.get(locatedBlock);
    return registration === undefined
      ? undefined
      : createRangeAtOffset(registration, textOffsetCodePoints);
  }

  public elementFor(
    locatedBlock: PublicationLocatedBlock,
  ): HTMLElement | undefined {
    const registration = this.#registrationsByBlock.get(locatedBlock);
    return registration?.active === true && registration.element.isConnected
      ? registration.element
      : undefined;
  }

  public positionFor(range: Range): SemanticDomPosition | undefined {
    if (this.#closed || !range.collapsed) {
      return undefined;
    }
    let element =
      range.startContainer.nodeType === 1
        ? (range.startContainer as Element)
        : range.startContainer.parentElement;
    while (element !== null) {
      if (element instanceof HTMLElement) {
        const registration = this.#registrationsByElement.get(element);
        if (registration !== undefined) {
          const offset = offsetForRange(
            registration,
            range,
            this.#textSegmentsByNode,
            this.#containerBoundariesByNode,
          );
          return offset === undefined
            ? undefined
            : Object.freeze({
                locatedBlock: registration.locatedBlock,
                textOffsetCodePoints: createIndex(offset),
              });
        }
      }
      element = element.parentElement;
    }
    return undefined;
  }

  public clear(): void {
    for (const registration of this.#registrations) {
      registration.active = false;
    }
    this.#registrations.clear();
    this.#registrationsByBlock = new WeakMap();
    this.#registrationsByElement = new WeakMap();
    this.#textSegmentsByNode = new WeakMap();
    this.#containerBoundariesByNode = new WeakMap();
  }

  public close(): void {
    if (this.#closed) {
      return;
    }
    this.#closed = true;
    this.clear();
  }

  #remove(registration: RegisteredBlock): void {
    if (!registration.active) {
      return;
    }
    registration.active = false;
    this.#registrations.delete(registration);
    if (
      this.#registrationsByBlock.get(registration.locatedBlock) === registration
    ) {
      this.#registrationsByBlock.delete(registration.locatedBlock);
    }
    if (
      this.#registrationsByElement.get(registration.element) === registration
    ) {
      this.#registrationsByElement.delete(registration.element);
    }
    for (const segment of registration.segments) {
      if (segment.kind === "text" && segment.registration === registration) {
        if (this.#textSegmentsByNode.get(segment.node) === segment) {
          this.#textSegmentsByNode.delete(segment.node);
        }
        segment.registration = undefined;
      }
    }
    for (const boundaries of registration.containerBoundaries) {
      if (boundaries.registration === registration) {
        if (
          this.#containerBoundariesByNode.get(boundaries.node) === boundaries
        ) {
          this.#containerBoundariesByNode.delete(boundaries.node);
        }
        boundaries.registration = undefined;
      }
    }
  }
}
