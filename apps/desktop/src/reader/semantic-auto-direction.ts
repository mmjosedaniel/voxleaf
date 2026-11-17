import type {
  SemanticBlock,
  SemanticDocument,
  SemanticInline,
} from "@voxleaf/epub";
import type { ScheduleLargeChapterYield } from "./large-chapter-rendering";

export type ResolvedTextDirection = "ltr" | "rtl";
export const AUTO_DIRECTION_PROBE_NODE_COUNT = 2;
export const AUTO_DIRECTION_CHUNK_UNITS = 4096;
export const AUTO_DIRECTION_NODES_PER_TURN = 512;
export const AUTO_DIRECTION_CHECKS_PER_TURN = 16;

export interface AutoDirectionProbe {
  measure(text: string): ResolvedTextDirection | undefined;
  close(): void;
}

/** Native first-strong classification without a Unicode table or live DOM insertion. */
export function createNativeAutoDirectionProbe(): AutoDirectionProbe {
  const element = globalThis.document.createElement("span");
  element.dir = "auto";
  element.hidden = true;
  element.setAttribute("aria-hidden", "true");
  const direction = (): ResolvedTextDirection => {
    if (element.matches(":dir(ltr)")) return "ltr";
    if (element.matches(":dir(rtl)")) return "rtl";
    throw new Error("Automatic text direction is unavailable.");
  };
  return {
    measure(text) {
      try {
        // Different trailing strong characters distinguish a neutral chunk.
        // A real first strong character makes both results identical.
        element.textContent = `${text}A`;
        const left = direction();
        element.textContent = `${text}א`;
        const right = direction();
        return left === right ? left : undefined;
      } finally {
        element.textContent = "";
      }
    },
    close() {
      element.textContent = "";
      element.remove();
    },
  };
}

type SourceNode = SemanticBlock | SemanticInline;

function* sourceNodes(
  nodes: readonly SourceNode[],
): Generator<SourceNode | undefined> {
  for (const node of nodes) {
    yield node;
    if ("children" in node) yield* sourceNodes(node.children);
    else if (node.kind === "list") {
      for (const item of node.items) {
        yield undefined; // List-item work is counted even when the item is empty.
        yield* sourceNodes(item.children);
      }
    }
  }
}

type DirectionSnapshot =
  | Readonly<{ status: "pending" | "failed" }>
  | Readonly<{
      status: "ready";
      directions: ReadonlyMap<number, ResolvedTextDirection>;
    }>;

const PENDING: DirectionSnapshot = Object.freeze({ status: "pending" });
const FAILED: DirectionSnapshot = Object.freeze({ status: "failed" });
const EMPTY_READY: DirectionSnapshot = Object.freeze({
  status: "ready",
  directions: new Map(),
});

/** One document-owned, cancellable scan; never retains a second copy of its text. */
export class SemanticAutoDirectionResolver {
  readonly #document: SemanticDocument;
  readonly #maximumNodes: number;
  readonly #schedule: ScheduleLargeChapterYield;
  readonly #createProbe: () => AutoDirectionProbe;
  readonly #listeners = new Set<() => void>();
  #snapshot: DirectionSnapshot;
  #nodes: Generator<SourceNode | undefined> | undefined;
  #pending:
    | { readonly text: string; readonly scope: number; offset: number }
    | undefined;
  #probe: AutoDirectionProbe | undefined;
  #directions = new Map<number, ResolvedTextDirection>();
  #visitedNodes = 0;
  #revision = 0;
  #cancelScheduled: (() => void) | undefined;

  public constructor(
    document: SemanticDocument,
    maximumNodes: number,
    schedule: ScheduleLargeChapterYield,
    createProbe = createNativeAutoDirectionProbe,
  ) {
    this.#document = document;
    this.#maximumNodes = maximumNodes;
    this.#schedule = schedule;
    this.#createProbe = createProbe;
    this.#snapshot =
      (document.autoDirectionScopeCount ?? 0) === 0 ? EMPTY_READY : PENDING;
  }

  public readonly getSnapshot = (): DirectionSnapshot => this.#snapshot;

  public readonly subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    if (this.#snapshot.status === "pending" && this.#nodes === undefined) {
      this.#nodes = sourceNodes(this.#document.blocks);
      this.#visitedNodes = 0;
      this.#directions = new Map();
      this.scheduleNext();
    }
    return () => {
      this.#listeners.delete(listener);
      if (this.#listeners.size === 0) this.retire();
    };
  };

  private retire(): void {
    this.#revision += 1;
    this.#cancelScheduled?.();
    this.#cancelScheduled = undefined;
    this.#nodes?.return(undefined);
    this.#nodes = undefined;
    this.#pending = undefined;
    this.#probe?.close();
    this.#probe = undefined;
    if (this.#snapshot.status !== "ready") this.#directions.clear();
  }

  private scheduleNext(): void {
    const revision = ++this.#revision;
    this.#cancelScheduled = this.#schedule(() => {
      if (revision !== this.#revision || this.#listeners.size === 0) return;
      this.#cancelScheduled = undefined;
      this.advance();
    });
  }

  private advance(): void {
    let nodes = 0;
    let checks = 0;
    try {
      while (
        nodes < AUTO_DIRECTION_NODES_PER_TURN &&
        checks < AUTO_DIRECTION_CHECKS_PER_TURN
      ) {
        if (this.#pending !== undefined) {
          const pending = this.#pending;
          let end = Math.min(
            pending.offset + AUTO_DIRECTION_CHUNK_UNITS,
            pending.text.length,
          );
          const last = pending.text.charCodeAt(end - 1);
          if (end < pending.text.length && last >= 0xd800 && last <= 0xdbff)
            end -= 1;
          this.#probe ??= this.#createProbe();
          const direction = this.#probe.measure(
            pending.text.slice(pending.offset, end),
          );
          checks += 1;
          pending.offset = end;
          if (direction !== undefined)
            this.#directions.set(pending.scope, direction);
          if (direction !== undefined || end === pending.text.length)
            this.#pending = undefined;
          continue;
        }
        const next = this.#nodes?.next();
        if (next === undefined || next.done) {
          this.#snapshot = Object.freeze({
            status: "ready",
            directions: this.#directions,
          });
          this.retire();
          for (const listener of this.#listeners) listener();
          return;
        }
        nodes += 1;
        this.#visitedNodes += 1;
        if (this.#visitedNodes > this.#maximumNodes)
          throw new Error("Reading layout work limit exceeded.");
        const node = next.value;
        if (
          node?.kind === "text" &&
          node.direction === "auto" &&
          node.autoDirectionScope !== undefined &&
          !this.#directions.has(node.autoDirectionScope) &&
          node.text.length > 0
        ) {
          this.#pending = {
            text: node.text,
            scope: node.autoDirectionScope,
            offset: 0,
          };
        }
      }
      this.scheduleNext();
    } catch {
      this.#snapshot = FAILED;
      this.retire();
      for (const listener of this.#listeners) listener();
    }
  }
}
