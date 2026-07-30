import type {
  ContentDocumentId,
  PublicationLocatedBlock,
  SemanticBlock,
  SensitivePublicationText,
} from "@voxleaf/epub";
import {
  createIndex,
  decodeLocatorRangeV1,
  decodeReadingLocatorV1,
  type LocatorRangeV1,
  type ReadingLocatorV1,
} from "@voxleaf/shared";
import { VALID_SYNTHETIC_DOCUMENT_FIXTURE } from "@voxleaf/shared/testing";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  ProductNarrationAudibleProgressObservation,
  ProductNarrationFailureCode,
  ProductNarrationSnapshot,
} from "../tts/product-narration-coordinator";
import { INITIAL_OPERATIONAL_RECOVERY_SNAPSHOT_V1 } from "../tts/operational-recovery";
import { SemanticDocumentContent } from "./SemanticDocument";
import {
  SegmentHighlightController,
  type SegmentHighlightEnvironment,
  type SegmentHighlightRect,
} from "./segment-highlight-controller";
import { SemanticDomRangeMapper } from "./semantic-dom-range-mapper";
import { SYNCHRONIZATION_AUTHORITY_V1 } from "./synchronization-authority";

function sensitive(value: string): SensitivePublicationText {
  return value as SensitivePublicationText;
}

function paragraph(value: string): SemanticBlock {
  return Object.freeze({
    kind: "paragraph",
    children: Object.freeze([
      Object.freeze({ kind: "text", text: sensitive(value) }),
    ]),
  });
}

function locatedBlock(
  spineIndex: 0 | 1,
  block: SemanticBlock,
  length: number,
): PublicationLocatedBlock {
  return Object.freeze({
    documentId: `document:highlight-${String(spineIndex)}` as ContentDocumentId,
    block,
    startLocator:
      VALID_SYNTHETIC_DOCUMENT_FIXTURE.spineDocuments[spineIndex]!.blocks[0]!
        .locator,
    textLengthCodePoints: createIndex(length),
  });
}

function sourceRange(
  block: PublicationLocatedBlock,
  start: number,
  end: number,
): LocatorRangeV1 {
  return decodeLocatorRangeV1({
    schemaVersion: 1,
    start: {
      ...block.startLocator,
      textOffsetCodePoints: start,
    },
    end: {
      ...block.startLocator,
      textOffsetCodePoints: end,
    },
  });
}

function observation(
  kind: ProductNarrationAudibleProgressObservation["kind"],
  range: LocatorRangeV1,
  sequence = 0,
): ProductNarrationAudibleProgressObservation {
  return Object.freeze({
    kind,
    observedAtMs: sequence * 250,
    sessionId: "session:highlight-test",
    generationId: "generation:highlight-test",
    segmentId: `segment:highlight-test-${String(sequence)}`,
    sequence,
    sourceRange: range,
    playedSampleFrames: kind === "segment-completed" ? 24_000 : 0,
    sampleCountSamples: 24_000,
  });
}

function narrationSnapshot(
  phase: "buffering" | "failed" | "paused" | "playing" | "stopped" | undefined,
  failure?: ProductNarrationFailureCode,
): ProductNarrationSnapshot {
  return Object.freeze({
    availability: "available",
    profileId: "qwen3-tts-12hz-1-7b-customvoice-serena-cuda-bf16-v1",
    language: "es",
    selection: Object.freeze({ kind: "quick" }),
    state:
      phase === undefined
        ? undefined
        : Object.freeze({
            mode: Object.freeze({ kind: "quick" }),
            phase,
            readyMs: phase === "playing" ? 15_000 : 0,
            targetMs: 15_000,
            progressValueMs: phase === "playing" ? 15_000 : 0,
            estimatedWaitMs: undefined,
            lowBuffer: phase === "buffering",
            allRemainingAudioReady: false,
            resourceCeilingReached: false,
            pauseContinuesPreparation: phase === "paused",
            canPause: phase === "playing",
            canResume: phase === "paused",
            canStop: !["failed", "stopped"].includes(phase),
            volumePercent: 100,
            playbackRate: 1,
          }),
    failure,
    preparationFailure: undefined,
    metrics: Object.freeze({
      commandToAudibleMs: undefined,
      bufferingMs: 0,
      intentionalWaitMs: 0,
      playbackMs: 0,
      underrunCount: 0,
      acceptedAudioUnitCount: 0,
      acceptedAudioSampleFrames: 0,
      retainedAudioUnitCount: 0,
      discardedAudioUnitCount: 0,
    }),
    serviceState: phase === "playing" ? "ready" : "stopped",
    recovery: INITIAL_OPERATIONAL_RECOVERY_SNAPSHOT_V1,
    navigation: Object.freeze({
      playIntent:
        phase === "playing"
          ? "playing"
          : phase === "paused"
            ? "paused"
            : "inactive",
      settling: false,
      canGoPrevious: false,
      canGoNext: false,
    }),
  });
}

class ManualHighlightEnvironment implements SegmentHighlightEnvironment {
  viewport: SegmentHighlightRect | undefined = { top: 0, bottom: 100 };
  range: SegmentHighlightRect | undefined = { top: 140, bottom: 160 };
  highlighted: Range | undefined;
  readonly scrolls: number[] = [];
  readonly scheduled: Array<() => void> = [];
  clearCount = 0;

  public replaceHighlight(_name: string, range: Range): boolean {
    this.highlighted = range;
    return true;
  }

  public clearHighlight(): void {
    this.highlighted = undefined;
    this.clearCount += 1;
  }

  public viewportRect(): SegmentHighlightRect | undefined {
    return this.viewport;
  }

  public rangeRect(): SegmentHighlightRect | undefined {
    return this.range;
  }

  public scrollBy(_root: HTMLElement, top: number): void {
    this.scrolls.push(top);
    if (this.range !== undefined) {
      this.range = {
        top: this.range.top - top,
        bottom: this.range.bottom - top,
      };
    }
  }

  public schedule(_root: HTMLElement, callback: () => void): () => void {
    this.scheduled.push(callback);
    return () => {
      const index = this.scheduled.indexOf(callback);
      if (index >= 0) {
        this.scheduled.splice(index, 1);
      }
    };
  }

  public flush(): void {
    this.scheduled.shift()?.();
  }
}

afterEach(() => {
  cleanup();
});

describe("segment highlight controller", () => {
  it("highlights and follows one range without changing focus, selection, or publication DOM", () => {
    const block = paragraph("Synthetic audible passage.");
    const located = locatedBlock(0, block, 26);
    const mapper = new SemanticDomRangeMapper();
    const rendered = render(
      <>
        <input aria-label="Focus owner" />
        <SemanticDocumentContent
          document={Object.freeze({
            id: located.documentId,
            location: Object.freeze({
              kind: "spine",
              spineItemId: located.startLocator.spineItemId,
              spineItemIndex: located.startLocator.spineItemIndex,
            }),
            blocks: Object.freeze([block]),
          })}
          domRangeMapper={mapper}
          locatedBlocks={[located]}
        />
      </>,
    );
    const root = rendered.container.querySelector(".semantic-document");
    const focusOwner = rendered.getByLabelText("Focus owner");
    const textNode = rendered.getByText(
      "Synthetic audible passage.",
    ).firstChild;
    if (!(root instanceof HTMLElement) || !(textNode instanceof Text)) {
      throw new Error("synthetic highlight fixture is unavailable");
    }
    focusOwner.focus();
    const selection = document.getSelection()!;
    const selected = document.createRange();
    selected.setStart(textNode, 10);
    selected.setEnd(textNode, 17);
    selection.removeAllRanges();
    selection.addRange(selected);
    const descendantCount = root.querySelectorAll("*").length;
    const textContent = root.textContent;
    const environment = new ManualHighlightEnvironment();
    const settled: number[] = [];
    const resume = vi.fn();
    const controller = new SegmentHighlightController(
      [located],
      mapper,
      {
        navigateToLocator: vi.fn(),
        settleLocator: (locator) => {
          settled.push(locator.textOffsetCodePoints);
        },
        suspendVisualSampling: () => resume,
      },
      environment,
    );
    controller.setRoot(root);
    const range = sourceRange(located, 0, 9);

    controller.accept(observation("segment-started", range));

    expect(environment.highlighted?.collapsed).toBe(false);
    expect(environment.highlighted?.toString()).toBe("Synthetic");
    expect(environment.scrolls).toEqual([
      140 - SYNCHRONIZATION_AUTHORITY_V1.following.comfortInsetPx,
    ]);
    expect(settled).toEqual([]);
    expect(document.activeElement).toBe(focusOwner);
    expect(selection.rangeCount).toBe(1);
    expect(selection.getRangeAt(0).toString()).toBe("audible");
    expect(selection.getRangeAt(0).startContainer).toBe(textNode);
    expect(selection.getRangeAt(0).startOffset).toBe(10);
    expect(selection.getRangeAt(0).endContainer).toBe(textNode);
    expect(selection.getRangeAt(0).endOffset).toBe(17);
    expect(root.querySelectorAll("*")).toHaveLength(descendantCount);
    expect(root.textContent).toBe(textContent);

    environment.flush();
    expect(settled).toEqual([0]);
    expect(resume).toHaveBeenCalledWith({ requestSample: false });

    controller.accept(observation("progress", range));
    controller.accept(observation("segment-completed", range));
    expect(environment.highlighted?.toString()).toBe("Synthetic");
    expect(settled).toEqual([0, 9]);

    environment.range = { top: 24, bottom: 40 };
    controller.accept(
      observation("segment-started", sourceRange(located, 10, 17), 1),
    );
    expect(environment.highlighted?.toString()).toBe("audible");
    expect(settled).toEqual([0, 9, 10]);
    expect(document.activeElement).toBe(focusOwner);
    expect(selection.getRangeAt(0).toString()).toBe("audible");

    controller.clear();
    expect(environment.highlighted).toBeUndefined();
    controller.close();
    mapper.close();
  });

  it("holds sampling across chapter rendering and suppresses stale transitions", () => {
    const opening = locatedBlock(0, paragraph("Opening"), 7);
    const continuationBlock = paragraph("Continuation");
    const continuation = locatedBlock(1, continuationBlock, 12);
    const mapper = new SemanticDomRangeMapper();
    const environment = new ManualHighlightEnvironment();
    environment.range = { top: 24, bottom: 40 };
    const navigated: number[] = [];
    const settled: number[] = [];
    const resume = vi.fn();
    const controller = new SegmentHighlightController(
      [opening, continuation],
      mapper,
      {
        navigateToLocator: (locator) => {
          navigated.push(locator.spineItemIndex);
        },
        settleLocator: (locator) => {
          settled.push(locator.spineItemIndex);
        },
        suspendVisualSampling: () => resume,
      },
      environment,
    );
    const root = document.createElement("article");
    const continuationElement = document.createElement("p");
    continuationElement.textContent = "Continuation";
    document.body.append(root);
    controller.setRoot(root);
    const range = sourceRange(continuation, 0, 12);
    controller.accept(observation("segment-started", range, 1));
    controller.refresh();

    expect(navigated).toEqual([1]);
    expect(settled).toEqual([]);

    root.append(continuationElement);
    const unsubscribe = mapper.subscribe(() => controller.refresh());
    const unregister = mapper.registerBlock(continuationElement, continuation);

    expect(environment.highlighted?.toString()).toBe("Continuation");
    expect(settled).toEqual([1]);
    expect(resume).toHaveBeenCalledWith({ requestSample: false });

    controller.accept(
      observation("segment-completed", sourceRange(opening, 0, 7), 0),
    );
    expect(environment.highlighted?.toString()).toBe("Continuation");

    unregister();
    unsubscribe();
    controller.close();
    mapper.close();
    root.remove();
  });

  it("requests materialization when an audible range is missing in the current chapter", () => {
    const block = paragraph("Later passage");
    const located = locatedBlock(0, block, 13);
    const mapper = new SemanticDomRangeMapper();
    const environment = new ManualHighlightEnvironment();
    environment.range = { top: 24, bottom: 40 };
    const navigated: ReadingLocatorV1[] = [];
    const settled: ReadingLocatorV1[] = [];
    const resume = vi.fn();
    const controller = new SegmentHighlightController(
      [located],
      mapper,
      {
        navigateToLocator: (locator) => navigated.push(locator),
        settleLocator: (locator) => settled.push(locator),
        suspendVisualSampling: () => resume,
      },
      environment,
    );
    const root = document.createElement("article");
    const paragraphElement = document.createElement("p");
    paragraphElement.textContent = "Later passage";
    document.body.append(root);
    controller.setRoot(root);
    const unsubscribe = mapper.subscribe(() => controller.refresh());

    controller.accept(
      observation("segment-started", sourceRange(located, 0, 13)),
    );

    expect(navigated).toEqual([located.startLocator]);
    expect(environment.highlighted).toBeUndefined();
    expect(settled).toEqual([]);

    root.append(paragraphElement);
    const unregister = mapper.registerBlock(paragraphElement, located);

    expect(environment.highlighted?.toString()).toBe("Later passage");
    expect(settled).toEqual([located.startLocator]);
    expect(resume).toHaveBeenCalledWith({ requestSample: false });

    unregister();
    unsubscribe();
    controller.close();
    mapper.close();
    root.remove();
  });

  it("retains the latest heard highlight while paused or buffering and clears every terminal path", () => {
    const block = paragraph("Lifecycle");
    const located = locatedBlock(0, block, 9);
    const mapper = new SemanticDomRangeMapper();
    const element = document.createElement("p");
    element.textContent = "Lifecycle";
    document.body.append(element);
    mapper.registerBlock(element, located);
    const environment = new ManualHighlightEnvironment();
    environment.range = { top: 24, bottom: 40 };
    const controller = new SegmentHighlightController(
      [located],
      mapper,
      {
        navigateToLocator: vi.fn(),
        settleLocator: vi.fn(),
        suspendVisualSampling: vi.fn(),
      },
      environment,
    );
    controller.setRoot(element);
    const range = sourceRange(located, 0, 9);

    controller.accept(observation("segment-started", range));
    controller.reconcile(narrationSnapshot("paused"));
    expect(environment.highlighted?.toString()).toBe("Lifecycle");
    controller.reconcile(narrationSnapshot("buffering"));
    expect(environment.highlighted?.toString()).toBe("Lifecycle");

    controller.reconcile(narrationSnapshot("failed"));
    expect(environment.highlighted).toBeUndefined();

    controller.accept(observation("segment-started", range, 1));
    controller.reconcile(narrationSnapshot("stopped"));
    expect(environment.highlighted).toBeUndefined();

    controller.accept(observation("segment-started", range, 2));
    controller.reconcile(
      narrationSnapshot("playing", "narration-preparation-failed"),
    );
    expect(environment.highlighted).toBeUndefined();

    controller.accept(observation("segment-started", range, 3));
    controller.reconcile(narrationSnapshot(undefined));
    expect(environment.highlighted).toBeUndefined();

    controller.close();
    mapper.close();
    element.remove();
  });

  it("keeps highlight-only behavior when usable geometry is unavailable", () => {
    const block = paragraph("Geometry");
    const located = locatedBlock(0, block, 8);
    const mapper = new SemanticDomRangeMapper();
    const element = document.createElement("p");
    element.textContent = "Geometry";
    document.body.append(element);
    mapper.registerBlock(element, located);
    const environment = new ManualHighlightEnvironment();
    environment.range = undefined;
    const settled: ReadingLocatorV1[] = [];
    const controller = new SegmentHighlightController(
      [located],
      mapper,
      {
        navigateToLocator: vi.fn(),
        settleLocator: (locator) => settled.push(locator),
        suspendVisualSampling: vi.fn(),
      },
      environment,
    );
    controller.setRoot(element);

    controller.accept(
      observation("segment-started", sourceRange(located, 0, 8)),
    );

    expect(environment.highlighted?.toString()).toBe("Geometry");
    expect(environment.scrolls).toEqual([]);
    expect(settled).toEqual([decodeReadingLocatorV1(located.startLocator)]);
    controller.close();
    mapper.close();
    element.remove();
  });
});
