import type { SemanticBlock, SemanticDocument } from "@voxleaf/epub";

import { LARGE_CHAPTER_BATCH_SIZE_BLOCKS } from "./large-chapter-rendering";

export interface SemanticBlockPlan {
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

export interface SemanticBlockGroupPlan {
  readonly startIndex: number;
  readonly endIndex: number;
  readonly blocks: readonly SemanticBlockPlan[];
}

export interface SemanticListItemGroupPlan {
  readonly startIndex: number;
  readonly endIndex: number;
  readonly items: readonly SemanticListItemPlan[];
}

export interface SemanticBlockSequencePlan {
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

export function buildDocumentRenderPlan(
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
