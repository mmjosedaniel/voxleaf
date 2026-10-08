import {
  openEpubPublication,
  type OpenedPublication,
  type PreparedNarrationSegment,
  type PublicationLocatedBlock,
} from "@voxleaf/epub";
import {
  decodeNarrationSegmentV1,
  type ReadingLocatorV1,
} from "@voxleaf/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildEpubVersionEquivalenceFixture,
  buildNarrationIntegrationEpubFixture,
  NARRATION_INTEGRATION_FIXTURE_EXPECTATIONS,
  NARRATION_INTEGRATION_FIXTURE_PROVENANCE,
} from "../../test-support/epub-fixture.js";

const encoder = new TextEncoder();
const MAXIMUM_MATRIX_REQUESTS = 64;

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("public synthetic EPUB-to-narration integration matrix", () => {
  it("keeps the dedicated fixture provenance explicit and deterministic", async () => {
    expect(NARRATION_INTEGRATION_FIXTURE_PROVENANCE).toEqual({
      kind: "repository-authored-synthetic",
      source: "packages/epub/test-support/epub-fixture.ts",
    });
    expect(Object.isFrozen(NARRATION_INTEGRATION_FIXTURE_PROVENANCE)).toBe(
      true,
    );
    expect(
      contentFreeDeepEqual(
        await buildNarrationIntegrationEpubFixture(),
        await buildNarrationIntegrationEpubFixture(),
      ),
    ).toBe(true);
  });

  it("keeps EPUB 2 and EPUB 3 narration ranges, continuation, cancellation, and output equivalent", async () => {
    const capabilities = installExternalCapabilitySpies();
    const [epub2Result, epub3Result] = await Promise.all([
      openEpubPublication(await buildEpubVersionEquivalenceFixture("2.0")),
      openEpubPublication(await buildEpubVersionEquivalenceFixture("3.0")),
    ]);
    if (!epub2Result.ok || !epub3Result.ok) {
      throw new Error("narration-version-equivalence-open-failed");
    }

    const epub2 = epub2Result.publication;
    const epub3 = epub3Result.publication;
    const epub2DisplayedBefore = structuredClone(epub2.documents);
    const epub3DisplayedBefore = structuredClone(epub3.documents);
    const resourceRead = spyOnPublicResourceReads(epub2);

    try {
      expect(epub2.book.identity).not.toEqual(epub3.book.identity);
      const epub2Start = requiredBlock(epub2, "opening").startLocator;
      const epub3Start = requiredBlock(epub3, "opening").startLocator;
      const [epub2Segments, epub3Segments] = await Promise.all([
        collectPreparedSegments(epub2, epub2Start, 2),
        collectPreparedSegments(epub3, epub3Start, 2),
      ]);

      expect(epub2Segments.requestCount).toBe(epub3Segments.requestCount);
      expect(
        identityIndependentValue(comparableSegments(epub2Segments.segments)),
      ).toEqual(
        identityIndependentValue(comparableSegments(epub3Segments.segments)),
      );
      for (const [sequence, segment] of epub2Segments.segments.entries()) {
        assertPublicSegment(epub2, segment, sequence);
      }
      for (const [sequence, segment] of epub3Segments.segments.entries()) {
        assertPublicSegment(epub3, segment, sequence);
      }
      assertSourceOrdered(epub2Segments.segments);
      assertSourceOrdered(epub3Segments.segments);

      const controller = new AbortController();
      controller.abort("private-cancellation-reason");
      const cancelled = await epub2.prepareNarration({
        startLocator: epub2Start,
        profile: "narration-v1",
        defaultLanguage: "und",
        maximumSegments: 1,
        signal: controller.signal,
      });
      expect(cancelled).toMatchObject({
        status: "cancelled",
        error: { code: "operation-cancelled" },
      });
      expect(JSON.stringify(cancelled)).not.toContain(
        "private-cancellation-reason",
      );

      const retry = await epub2.prepareNarration({
        startLocator: epub2Start,
        profile: "narration-v1",
        defaultLanguage: "und",
        maximumSegments: 1,
      });
      expect(retry.status).toBe("batch");
      if (retry.status !== "batch") {
        throw new Error("narration-version-equivalence-retry-failed");
      }
      expect(
        identityIndependentValue(comparableSegments(retry.segments)),
      ).toEqual(
        identityIndependentValue(
          comparableSegments(epub2Segments.segments.slice(0, 1)),
        ),
      );

      expect(contentFreeDeepEqual(epub2.documents, epub2DisplayedBefore)).toBe(
        true,
      );
      expect(contentFreeDeepEqual(epub3.documents, epub3DisplayedBefore)).toBe(
        true,
      );
      expect(resourceRead).not.toHaveBeenCalled();
      assertNoExternalCapability(capabilities);
    } finally {
      await Promise.all([epub2.close(), epub3.close()]);
    }
  });

  it("prepares deterministic neutral and Spanish segments through only the public boundary", async () => {
    const capabilities = installExternalCapabilitySpies();
    const bytes = await buildNarrationIntegrationEpubFixture();
    const firstOpen = await openEpubPublication(bytes);
    const secondOpen = await openEpubPublication(bytes);
    if (!firstOpen.ok || !secondOpen.ok) {
      throw new Error("narration-matrix-open-failed");
    }

    const first = firstOpen.publication;
    const second = secondOpen.publication;
    const firstDisplayedBefore = structuredClone(first.documents);
    const secondDisplayedBefore = structuredClone(second.documents);
    const resourceRead = spyOnPublicResourceReads(first);

    try {
      const firstStart = requiredBlock(
        first,
        NARRATION_INTEGRATION_FIXTURE_EXPECTATIONS.anchors.neutralHeading,
      ).startLocator;
      const secondStart = requiredBlock(
        second,
        NARRATION_INTEGRATION_FIXTURE_EXPECTATIONS.anchors.neutralHeading,
      ).startLocator;
      const oneAtATime = await collectPreparedSegments(first, firstStart, 1);
      const fourAtATime = await collectPreparedSegments(second, secondStart, 4);

      expect(oneAtATime.requestCount).toBeGreaterThan(1);
      expect(fourAtATime.requestCount).toBeLessThan(oneAtATime.requestCount);
      expect(
        contentFreeDeepEqual(
          comparableSegments(oneAtATime.segments),
          comparableSegments(fourAtATime.segments),
        ),
      ).toBe(true);

      const narrationTexts = oneAtATime.segments.map((segment) =>
        String(segment.text),
      );
      for (const [expectation, expectedText] of Object.entries(
        NARRATION_INTEGRATION_FIXTURE_EXPECTATIONS.narrationText,
      )) {
        const dialogueTurn = expectation.toLowerCase().includes("dialogueturn");
        expect(
          narrationTexts.some(
            (text) =>
              text === expectedText ||
              text.trim() === expectedText ||
              (dialogueTurn && text.includes(expectedText)),
          ),
          `missing-synthetic-expectation:${expectation}`,
        ).toBe(true);
      }
      expect(
        narrationTexts.some((text) =>
          text.includes(
            NARRATION_INTEGRATION_FIXTURE_EXPECTATIONS.omittedText.sceneBreak,
          ),
        ),
      ).toBe(false);
      expect(
        narrationTexts.some((text) =>
          text.includes(
            NARRATION_INTEGRATION_FIXTURE_EXPECTATIONS.omittedText
              .imageAlternative,
          ),
        ),
      ).toBe(false);

      const longSegments = oneAtATime.segments.filter(
        (segment) =>
          segment.sourceRange.start.anchor.value ===
          NARRATION_INTEGRATION_FIXTURE_EXPECTATIONS.anchors.neutralLong,
      );
      expect(longSegments.length).toBeGreaterThan(1);

      for (const [sequence, segment] of oneAtATime.segments.entries()) {
        assertPublicSegment(first, segment, sequence);
      }
      assertSourceOrdered(oneAtATime.segments);
      expect(contentFreeDeepEqual(first.documents, firstDisplayedBefore)).toBe(
        true,
      );
      expect(
        contentFreeDeepEqual(second.documents, secondDisplayedBefore),
      ).toBe(true);
      expect(resourceRead).not.toHaveBeenCalled();
      assertNoExternalCapability(capabilities);
    } finally {
      await Promise.all([first.close(), second.close()]);
    }
  });

  it("covers exact and recovered starts, structural gaps, spine transitions, and publication end", async () => {
    const capabilities = installExternalCapabilitySpies();
    const result = await openEpubPublication(
      await buildNarrationIntegrationEpubFixture(),
    );
    if (!result.ok) {
      throw new Error("narration-matrix-open-failed");
    }

    const { publication } = result;
    const displayedBefore = structuredClone(publication.documents);
    const resourceRead = spyOnPublicResourceReads(publication);

    try {
      const exactBlock = requiredBlock(
        publication,
        NARRATION_INTEGRATION_FIXTURE_EXPECTATIONS.anchors.neutralInline,
      );
      const exact = await publication.prepareNarration({
        startLocator: exactBlock.startLocator,
        profile: "narration-v1",
        defaultLanguage: "und",
        maximumSegments: 1,
      });
      if (exact.status !== "batch") {
        throw new Error("narration-matrix-exact-start-failed");
      }
      expect(exact.start).toMatchObject({
        resolutionStatus: "exact",
        resolutionReason: "exact",
        segmentRelation: "at-segment-start",
      });
      expect(
        exact.segments[0]?.text ===
          NARRATION_INTEGRATION_FIXTURE_EXPECTATIONS.narrationText
            .neutralInline,
      ).toBe(true);

      const recoveredBlock = requiredBlock(
        publication,
        NARRATION_INTEGRATION_FIXTURE_EXPECTATIONS.anchors.spanishForms,
      );
      const recovered = await publication.prepareNarration({
        startLocator: {
          ...recoveredBlock.startLocator,
          anchor: {
            ...recoveredBlock.startLocator.anchor,
            value: "missing-synthetic-anchor",
          },
        },
        profile: "narration-v1",
        defaultLanguage: "und",
        maximumSegments: 1,
      });
      if (recovered.status !== "batch") {
        throw new Error("narration-matrix-recovered-start-failed");
      }
      expect(recovered.start).toMatchObject({
        canonicalLocator: recoveredBlock.startLocator,
        resolutionStatus: "recovered",
        resolutionReason: "nearest-anchor",
        segmentRelation: "at-segment-start",
      });
      expect(
        recovered.segments[0]?.text ===
          NARRATION_INTEGRATION_FIXTURE_EXPECTATIONS.narrationText.spanishForms,
      ).toBe(true);

      const neutralEnd = await publication.prepareNarration({
        startLocator: blockEndLocator(
          requiredBlock(
            publication,
            NARRATION_INTEGRATION_FIXTURE_EXPECTATIONS.anchors.neutralLong,
          ),
        ),
        profile: "narration-v1",
        defaultLanguage: "und",
        maximumSegments: 1,
      });
      if (neutralEnd.status !== "batch") {
        throw new Error("narration-matrix-spine-transition-failed");
      }
      expect(neutralEnd.start.segmentRelation).toBe("before-next-segment");
      expect(neutralEnd.segments[0]?.sourceRange.start.anchor.value).toBe(
        NARRATION_INTEGRATION_FIXTURE_EXPECTATIONS.anchors.spanishHeading,
      );
      expect(neutralEnd.segments[0]?.sourceRange.start.spineItemIndex).toBe(1);

      const sceneGap = await publication.prepareNarration({
        startLocator: requiredBlock(
          publication,
          NARRATION_INTEGRATION_FIXTURE_EXPECTATIONS.anchors.neutralScene,
        ).startLocator,
        profile: "narration-v1",
        defaultLanguage: "und",
        maximumSegments: 1,
      });
      if (sceneGap.status !== "batch") {
        throw new Error("narration-matrix-scene-gap-failed");
      }
      expect(sceneGap.start.segmentRelation).toBe("before-next-segment");
      expect(sceneGap.segments[0]?.sourceRange.start.anchor.value).toBe(
        NARRATION_INTEGRATION_FIXTURE_EXPECTATIONS.anchors.neutralLong,
      );

      const imageGap = await publication.prepareNarration({
        startLocator: requiredBlock(
          publication,
          NARRATION_INTEGRATION_FIXTURE_EXPECTATIONS.anchors.spanishImage,
        ).startLocator,
        profile: "narration-v1",
        defaultLanguage: "und",
        maximumSegments: 1,
      });
      if (imageGap.status !== "batch") {
        throw new Error("narration-matrix-image-gap-failed");
      }
      expect(imageGap.start.segmentRelation).toBe("before-next-segment");
      expect(imageGap.segments[0]?.sourceRange.start.anchor.value).toBe(
        NARRATION_INTEGRATION_FIXTURE_EXPECTATIONS.anchors.finalHeading,
      );
      expect(
        String(imageGap.segments[0]?.text).includes(
          NARRATION_INTEGRATION_FIXTURE_EXPECTATIONS.omittedText
            .imageAlternative,
        ),
      ).toBe(false);

      const publicationEnd = await publication.prepareNarration({
        startLocator: blockEndLocator(
          requiredBlock(
            publication,
            NARRATION_INTEGRATION_FIXTURE_EXPECTATIONS.anchors.finalParagraph,
          ),
        ),
        profile: "narration-v1",
        defaultLanguage: "und",
        maximumSegments: 16,
      });
      if (publicationEnd.status !== "complete") {
        throw new Error("narration-matrix-publication-end-failed");
      }
      expect(publicationEnd.start.segmentRelation).toBe("publication-end");
      expect(publicationEnd.segments).toEqual([]);

      expect(contentFreeDeepEqual(publication.documents, displayedBefore)).toBe(
        true,
      );
      expect(resourceRead).not.toHaveBeenCalled();
      assertNoExternalCapability(capabilities);
    } finally {
      await publication.close();
    }
  });
});

interface CollectedSegments {
  readonly requestCount: number;
  readonly segments: readonly PreparedNarrationSegment[];
}

async function collectPreparedSegments(
  publication: OpenedPublication,
  startLocator: ReadingLocatorV1,
  maximumSegments: number,
): Promise<CollectedSegments> {
  const segments: PreparedNarrationSegment[] = [];
  let nextStart = startLocator;

  for (
    let requestCount = 1;
    requestCount <= MAXIMUM_MATRIX_REQUESTS;
    requestCount += 1
  ) {
    const result = await publication.prepareNarration({
      startLocator: nextStart,
      profile: "narration-v1",
      defaultLanguage: "und",
      maximumSegments,
    });
    if (result.status !== "batch" && result.status !== "complete") {
      throw new Error("narration-matrix-public-result-failed");
    }
    segments.push(...result.segments);
    if (result.status === "complete") {
      return Object.freeze({
        requestCount,
        segments: Object.freeze(segments),
      });
    }

    const finalSegment = result.segments.at(-1);
    if (
      finalSegment === undefined ||
      !contentFreeDeepEqual(result.continuation, finalSegment.sourceRange.end)
    ) {
      throw new Error("narration-matrix-continuation-invalid");
    }
    nextStart = result.continuation;
  }

  throw new Error("narration-matrix-request-limit");
}

function requiredBlock(
  publication: OpenedPublication,
  anchorValue: string,
): PublicationLocatedBlock {
  const block = publication.locators.find(
    (candidate) => candidate.startLocator.anchor.value === anchorValue,
  );
  if (block === undefined) {
    throw new Error("narration-matrix-anchor-missing");
  }
  return block;
}

function blockEndLocator(block: PublicationLocatedBlock): ReadingLocatorV1 {
  return Object.freeze({
    ...block.startLocator,
    textOffsetCodePoints: block.textLengthCodePoints,
  });
}

function comparableSegments(
  segments: readonly PreparedNarrationSegment[],
): readonly unknown[] {
  return segments.map((segment) => ({
    text: String(segment.text),
    sourceRange: segment.sourceRange,
    boundaryReason: segment.boundaryReason,
    measurements: segment.measurements,
  }));
}

function identityIndependentValue(value: unknown): unknown {
  return JSON.parse(
    JSON.stringify(value, (key, current) =>
      key === "bookIdentity"
        ? { algorithm: "sha256", value: "<exact-byte-identity>" }
        : current,
    ),
  ) as unknown;
}

function assertPublicSegment(
  publication: OpenedPublication,
  segment: PreparedNarrationSegment,
  sequence: number,
): void {
  expect(isDeepFrozen(segment)).toBe(true);
  expect(String(segment.text).length).toBeGreaterThan(0);
  expect([...String(segment.text)].length).toBe(
    segment.measurements.narrationCodePoints,
  );
  expect(encoder.encode(segment.text).byteLength).toBe(
    segment.measurements.narrationUtf8Bytes,
  );
  expect(segment.sourceRange.start.bookIdentity).toEqual(
    segment.sourceRange.end.bookIdentity,
  );
  expect(segment.sourceRange.start.spineItemId).toBe(
    segment.sourceRange.end.spineItemId,
  );
  expect(segment.sourceRange.start.anchor).toEqual(
    segment.sourceRange.end.anchor,
  );
  expect(
    segment.sourceRange.end.textOffsetCodePoints -
      segment.sourceRange.start.textOffsetCodePoints,
  ).toBe(segment.measurements.sourceCodePoints);
  expect(publication.resolveLocator(segment.sourceRange.start).status).toBe(
    "exact",
  );
  expect(publication.resolveLocator(segment.sourceRange.end).status).toBe(
    "exact",
  );

  const wrapped = decodeNarrationSegmentV1({
    schemaVersion: 1,
    segmentId: `segment:narration-matrix-${String(sequence)}`,
    bookIdentity: segment.sourceRange.start.bookIdentity,
    sessionId: "session:narration-matrix",
    generationId: "generation:narration-matrix",
    sequence,
    sourceRange: segment.sourceRange,
    text: segment.text,
  });
  expect(wrapped.text === segment.text).toBe(true);
  expect(contentFreeDeepEqual(wrapped.sourceRange, segment.sourceRange)).toBe(
    true,
  );
}

function assertSourceOrdered(
  segments: readonly PreparedNarrationSegment[],
): void {
  for (let index = 1; index < segments.length; index += 1) {
    const previous = segments[index - 1];
    const current = segments[index];
    if (previous === undefined || current === undefined) {
      throw new Error("narration-matrix-order-invariant");
    }
    expect(
      compareLocators(previous.sourceRange.end, current.sourceRange.start),
    ).toBeLessThanOrEqual(0);
  }
}

function compareLocators(
  left: ReadingLocatorV1,
  right: ReadingLocatorV1,
): number {
  return (
    left.spineItemIndex - right.spineItemIndex ||
    left.anchor.anchorIndex - right.anchor.anchorIndex ||
    left.textOffsetCodePoints - right.textOffsetCodePoints
  );
}

function spyOnPublicResourceReads(publication: OpenedPublication) {
  const prototype = Object.getPrototypeOf(publication) as {
    readResource: OpenedPublication["readResource"];
  };
  return vi.spyOn(prototype, "readResource");
}

function installExternalCapabilitySpies() {
  const fetch = vi.fn(() => {
    throw new Error("external-capability-used");
  });
  const worker = vi.fn(() => {
    throw new Error("external-capability-used");
  });
  const webSocket = vi.fn(() => {
    throw new Error("external-capability-used");
  });
  const openFilePicker = vi.fn(() => {
    throw new Error("external-capability-used");
  });
  const createElement = vi.fn(() => {
    throw new Error("external-capability-used");
  });
  const storageGet = vi.fn(() => {
    throw new Error("external-capability-used");
  });
  const storageSet = vi.fn(() => {
    throw new Error("external-capability-used");
  });
  const audioContext = vi.fn(() => {
    throw new Error("external-capability-used");
  });
  const speech = vi.fn(() => {
    throw new Error("external-capability-used");
  });

  vi.stubGlobal("fetch", fetch);
  vi.stubGlobal("Worker", worker);
  vi.stubGlobal("WebSocket", webSocket);
  vi.stubGlobal("showOpenFilePicker", openFilePicker);
  vi.stubGlobal("document", Object.freeze({ createElement }));
  vi.stubGlobal(
    "localStorage",
    Object.freeze({
      getItem: storageGet,
      setItem: storageSet,
    }),
  );
  vi.stubGlobal("AudioContext", audioContext);
  vi.stubGlobal("speechSynthesis", Object.freeze({ speak: speech }));

  return Object.freeze({
    audioContext,
    createElement,
    fetch,
    openFilePicker,
    speech,
    storageGet,
    storageSet,
    webSocket,
    worker,
  });
}

function assertNoExternalCapability(
  capabilities: ReturnType<typeof installExternalCapabilitySpies>,
): void {
  for (const capability of Object.values(capabilities)) {
    expect(capability).not.toHaveBeenCalled();
  }
}

function isDeepFrozen(value: unknown): boolean {
  if (value === null || typeof value !== "object") {
    return true;
  }
  if (!Object.isFrozen(value)) {
    return false;
  }
  return Object.values(value).every(isDeepFrozen);
}

function contentFreeDeepEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }
  if (
    left === null ||
    right === null ||
    typeof left !== "object" ||
    typeof right !== "object"
  ) {
    return false;
  }
  if (ArrayBuffer.isView(left) || ArrayBuffer.isView(right)) {
    if (!(left instanceof Uint8Array) || !(right instanceof Uint8Array)) {
      return false;
    }
    return (
      left.byteLength === right.byteLength &&
      left.every((value, index) => value === right[index])
    );
  }
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) {
      return false;
    }
    return (
      left.length === right.length &&
      left.every((value, index) => contentFreeDeepEqual(value, right[index]))
    );
  }

  const leftRecord = left as Readonly<Record<string, unknown>>;
  const rightRecord = right as Readonly<Record<string, unknown>>;
  const leftKeys = Object.keys(leftRecord).sort();
  const rightKeys = Object.keys(rightRecord).sort();
  return (
    contentFreeDeepEqual(leftKeys, rightKeys) &&
    leftKeys.every((key) =>
      contentFreeDeepEqual(leftRecord[key], rightRecord[key]),
    )
  );
}
