import {
  openEpubPublication,
  type NarrationPreparationLanguage,
  type NarrationPreparationProfileId,
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
  buildMinimalEpubFixture,
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
  it.each(["***", "⁂"])(
    "SFA-01 retains scene metadata across batches and source windows: %s",
    async (ornament) => {
      const bytes = await buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Synthetic</title></head><body><p>${ornament}</p><p id="a">A.</p><p>${"\u00a0".repeat(4_200)}</p><p>${ornament}</p><p>${ornament}</p><p id="b">B.</p><blockquote><p>***</p></blockquote><ul><li>⁂</li></ul><p id="ellipsis">Wait...</p><p>${ornament}</p><p id="last">Last.</p><p>${ornament}</p></body></html>`,
      });
      const opened = await openEpubPublication(bytes);
      if (!opened.ok) throw new Error("synthetic-scene-open-failed");
      const publication = opened.publication;
      const before = JSON.stringify(publication.documents);
      try {
        const single = await collectPreparedSegments(
          publication,
          publication.defaultStartLocator!,
          1,
        );
        const many = await collectPreparedSegments(
          publication,
          publication.defaultStartLocator!,
          16,
        );
        expect(single.segments).toEqual(many.segments);
        expect(single.segments.map(({ text }) => text)).toEqual([
          "A.",
          "B.",
          "***",
          "⁂",
          "Wait...",
          "Last.",
        ]);
        expect(
          single.segments.map(({ boundaryReason }) => boundaryReason),
        ).toEqual([
          "scene-break",
          "paragraph",
          "paragraph",
          "paragraph",
          "scene-break",
          "scene-break",
        ]);
        for (const [index, segment] of single.segments.entries()) {
          assertPublicSegment(publication, segment, index);
          const cold = await openEpubPublication(bytes);
          if (!cold.ok) throw new Error("synthetic-scene-cold-open-failed");
          try {
            const continuation = await collectPreparedSegments(
              cold.publication,
              segment.sourceRange.end,
              1,
            );
            expect(continuation.segments).toEqual(
              single.segments.slice(index + 1),
            );
          } finally {
            await cold.publication.close();
          }
        }
        const afterScene = await collectPreparedSegments(
          publication,
          requiredBlock(publication, "b").startLocator,
          1,
        );
        expect(afterScene.segments).toEqual(single.segments.slice(1));
        expect(JSON.stringify(publication.documents)).toBe(before);
      } finally {
        await publication.close();
      }
    },
  );

  it("SFA-02 preserves Unicode numeric tokens and exact ranges in public one/many batches", async () => {
    const source = "ø8 8ø 字8 8字 𐐀8. ".repeat(50).trim();
    const opened = await openEpubPublication(
      await buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Synthetic</title></head><body><p>${source}</p></body></html>`,
      }),
    );
    if (!opened.ok) throw new Error("synthetic-unicode-open-failed");
    try {
      for (const profile of [
        "narration-piper-v2",
        "narration-chatterbox-v1",
      ] as const) {
        const one = await collectPreparedSegments(
          opened.publication,
          opened.publication.defaultStartLocator!,
          1,
          profile,
          "en",
        );
        const many = await collectPreparedSegments(
          opened.publication,
          opened.publication.defaultStartLocator!,
          16,
          profile,
          "en",
        );
        expect(one.segments).toEqual(many.segments);
        expect(one.segments.map(({ text }) => text).join("")).toBe(source);
        expect(one.segments.length).toBeGreaterThan(1);
        let offset = 0;
        for (const [index, segment] of one.segments.entries()) {
          assertPublicSegment(opened.publication, segment, index);
          expect(segment.sourceRange.start.textOffsetCodePoints).toBe(offset);
          offset += Array.from(segment.text).length;
          expect(segment.sourceRange.end.textOffsetCodePoints).toBe(offset);
        }
        expect(offset).toBe(Array.from(source).length);
      }
    } finally {
      await opened.publication.close();
    }
  });

  it("SFA-04 publicly resolves separated cells and definitions", async () => {
    const bytes = await buildMinimalEpubFixture({
      chapterDocument:
        '<html xmlns="http://www.w3.org/1999/xhtml" lang="en"><head><title>Synthetic</title></head><body><table><tr><th id="header">Values</th></tr><tr><td id="ten">10</td><td id="twenty"><em>20</em></td></tr></table><dl><dt id="term">Term</dt><dd id="definition"><p id="nested">Definition</p></dd></dl></body></html>',
    });
    const opened = await openEpubPublication(bytes);
    if (!opened.ok) throw new Error("synthetic-structure-open-failed");
    try {
      const publication = opened.publication;
      const prepared = await collectPreparedSegments(
        publication,
        publication.defaultStartLocator!,
        1,
        "narration-piper-v2",
        "en",
      );
      expect(prepared.segments.map(({ text }) => text)).toEqual([
        "Values",
        "10",
        "20",
        "Term",
        "Definition",
      ]);
      for (const [index, id] of [
        "header",
        "ten",
        "twenty",
        "term",
        "nested",
      ].entries()) {
        const block = requiredBlock(publication, id);
        expect(prepared.segments[index]?.sourceRange.start).toEqual(
          block.startLocator,
        );
        expect(prepared.segments[index]?.sourceRange.end).toEqual(
          blockEndLocator(block),
        );
        expect(
          publication.resolveTarget({
            documentId: block.documentId,
            fragment: id,
          }),
        ).toMatchObject({ status: "exact", locator: block.startLocator });
        assertPublicSegment(publication, prepared.segments[index]!, index);
      }
    } finally {
      await opened.publication.close();
    }
  });

  it("MAF-08 preserves marked numeric source across bounded public continuations", async () => {
    const source = "cafe\u03018 café8 8\u0301 か\u30998 8\u20dd. "
      .repeat(40)
      .trim();
    const opened = await openEpubPublication(
      await buildMinimalEpubFixture({
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Synthetic</title></head><body><p>' +
          source +
          "</p></body></html>",
      }),
    );
    if (!opened.ok) throw new Error("synthetic-mark-open-failed");
    const publication = opened.publication;
    const before = JSON.stringify(publication.documents);
    try {
      for (const profile of [
        "narration-piper-v2",
        "narration-chatterbox-v1",
      ] as const) {
        const single = await collectPreparedSegments(
          publication,
          publication.defaultStartLocator!,
          1,
          profile,
          "en",
        );
        const many = await collectPreparedSegments(
          publication,
          publication.defaultStartLocator!,
          16,
          profile,
          "en",
        );
        expect(single.segments).toEqual(many.segments);
        expect(single.segments.map((segment) => segment.text).join("")).toBe(
          source,
        );
        expect(single.segments.length).toBeGreaterThan(1);
        expect(
          single.segments.at(-1)?.sourceRange.end.textOffsetCodePoints,
        ).toBe(Array.from(source).length);
        for (const [index, segment] of single.segments.entries()) {
          assertPublicSegment(publication, segment, index);
          expect(/^\p{M}/u.test(segment.text)).toBe(false);
        }
      }
      expect(JSON.stringify(publication.documents)).toBe(before);
    } finally {
      await publication.close();
    }
  });

  it("SAF-10 keeps title context across warm batches and cold reconstruction", async () => {
    const source = `${"a".repeat(110)} Brown Dr. ${"Smith ".repeat(30)}.`;
    const bytes = await buildMinimalEpubFixture({
      chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Synthetic</title></head><body>${Array.from({ length: 7 }, (_, index) => `<p>Short paragraph ${index}.</p>`).join("")}<p id="context">${source}</p><p>Dr. Morgan arrived.</p><p lang="es">Dr. Morgan</p><p><code>Dr. Morgan</code></p></body></html>`,
    });
    const opened = await openEpubPublication(bytes);
    if (!opened.ok) throw new Error("synthetic-context-open-failed");
    const publication = opened.publication;
    const before = JSON.stringify(publication.documents);
    try {
      const all = [];
      for (const count of [1, 8, 16]) {
        const collected = await collectPreparedSegments(
          publication,
          publication.defaultStartLocator!,
          count,
          "narration-piper-v2",
          "en",
        );
        all.push(collected.segments);
      }
      expect(all[0]).toEqual(all[1]);
      expect(all[1]).toEqual(all[2]);
      const context = requiredBlock(publication, "context");
      const contextSegments = all[0]!.filter(
        (segment) =>
          segment.sourceRange.start.anchor.value ===
          context.startLocator.anchor.value,
      );
      expect(contextSegments[0]?.sourceRange.end.textOffsetCodePoints).toBe(
        117,
      );
      expect(
        contextSegments.some((segment) =>
          String(segment.text).includes("Doctor"),
        ),
      ).toBe(false);
      expect(
        all[0]!.some((segment) =>
          String(segment.text).includes("Doctor Morgan arrived."),
        ),
      ).toBe(true);
      expect(
        all[0]!.filter((segment) => String(segment.text) === "Dr. Morgan"),
      ).toHaveLength(2);
      const cold = await openEpubPublication(bytes);
      if (!cold.ok) throw new Error("synthetic-cold-context-open-failed");
      try {
        const atCut = await cold.publication.prepareNarration({
          startLocator: contextSegments[0]!.sourceRange.end,
          maximumSegments: 16,
          profile: "narration-piper-v2",
          defaultLanguage: "en",
        });
        if (atCut.status !== "batch" && atCut.status !== "complete")
          throw new Error("synthetic-cold-context-prepare-failed");
        expect(
          atCut.segments.filter(
            (segment) =>
              segment.sourceRange.start.anchor.value ===
              context.startLocator.anchor.value,
          ),
        ).toEqual(contextSegments.slice(1));
      } finally {
        await cold.publication.close();
      }
      for (const [index, segment] of all[0]!.entries())
        assertPublicSegment(publication, segment, index);
      expect(JSON.stringify(publication.documents)).toBe(before);
    } finally {
      await publication.close();
    }
  });

  it("SAF-12 keeps closed Spanish time articles and their source ranges", async () => {
    const opened = await openEpubPublication(
      await buildMinimalEpubFixture({
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Synthetic</title></head><body><p>las 14:30.</p><p>Las 14:30.</p><p>LAS 14:30.</p><p>14:30.</p><p>Las 14:30:12.</p></body></html>',
      }),
    );
    if (!opened.ok) throw new Error("synthetic-time-open-failed");
    try {
      const result = await collectPreparedSegments(
        opened.publication,
        opened.publication.defaultStartLocator!,
        1,
        "narration-piper-v2",
        "es",
      );
      expect(result.segments.map((segment) => String(segment.text))).toEqual([
        "las catorce treinta.",
        "Las catorce treinta.",
        "LAS catorce treinta.",
        "las catorce treinta.",
        "Las 14:30:12.",
      ]);
      for (const [index, segment] of result.segments.entries())
        assertPublicSegment(opened.publication, segment, index);
    } finally {
      await opened.publication.close();
    }
  });

  it("VAF H11 keeps complete mark sequences across public one/many batches", async () => {
    const source = `${"x".repeat(639)}か\u3099${"z".repeat(100)}e\u05b0`;
    const opened = await openEpubPublication(
      await buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Synthetic</title></head><body><p>${source}</p></body></html>`,
      }),
    );
    if (!opened.ok) throw new Error("synthetic-mark-open-failed");
    const publication = opened.publication;
    const before = JSON.stringify(publication.documents);
    try {
      for (const profile of [
        "narration-v1",
        "narration-bilingual-v2",
        "narration-piper-v2",
        "narration-chatterbox-v1",
      ] as const) {
        const start = publication.defaultStartLocator!;
        const language = profile === "narration-v1" ? "und" : "en";
        const single = await collectPreparedSegments(
          publication,
          start,
          1,
          profile,
          language,
        );
        const many = await collectPreparedSegments(
          publication,
          start,
          16,
          profile,
          language,
        );
        expect(single.segments).toEqual(many.segments);
        expect(single.segments.map((segment) => segment.text).join("")).toBe(
          source,
        );
        for (const [index, segment] of single.segments.entries()) {
          assertPublicSegment(publication, segment, index);
          expect(/^\p{M}/u.test(segment.text)).toBe(false);
        }
      }
      expect(JSON.stringify(publication.documents)).toBe(before);
    } finally {
      await publication.close();
    }
  });

  it("SAC-08 drains silent tails at segment limits without skipping the following paragraph", async () => {
    const opened = await openEpubPublication(
      await buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Synthetic</title></head><body><h1 id="opening">Opening</h1><p id="tail">A${"\u00a0".repeat(320)}</p><p id="silent">${"\u00a0".repeat(321)}</p><p id="following">After the silent tail.</p></body></html>`,
      }),
    );
    if (!opened.ok) throw new Error("synthetic-silent-tail-open-failed");
    const publication = opened.publication;
    const before = JSON.stringify(publication.documents);
    try {
      for (const profile of [
        "narration-piper-v2",
        "narration-chatterbox-v1",
      ] as const) {
        const start = publication.defaultStartLocator!;
        const single = await collectPreparedSegments(
          publication,
          start,
          1,
          profile,
          "en",
        );
        const many = await collectPreparedSegments(
          publication,
          start,
          16,
          profile,
          "en",
        );
        expect(single.segments).toEqual(many.segments);
        expect(single.segments.map((segment) => segment.text)).toEqual([
          "Opening",
          "A",
          "After the silent tail.",
        ]);
        expect(single.segments[1]?.sourceRange.end.textOffsetCodePoints).toBe(
          320,
        );
        expect(single.segments[2]?.sourceRange.start).toEqual(
          requiredBlock(publication, "following").startLocator,
        );
        for (const [sequence, segment] of single.segments.entries()) {
          assertPublicSegment(publication, segment, sequence);
          expect(segment.measurements.sourceCodePoints).toBeLessThanOrEqual(
            320,
          );
        }
        const controller = new AbortController();
        controller.abort();
        const cancelled = await publication.prepareNarration({
          startLocator: start,
          profile,
          defaultLanguage: "en",
          maximumSegments: 1,
          signal: controller.signal,
        });
        expect(cancelled.status).toBe("cancelled");
      }
      expect(JSON.stringify(publication.documents)).toBe(before);
    } finally {
      await publication.close();
    }
  });

  it.each(["es", "en"] as const)(
    "CHAT-AUDIT F04/F07 preserves explicit unknown context and numeric compounds through current %s profiles",
    async (language) => {
      const source = "0.25 % 12:14:30 0,20 EUR";
      const opened = await openEpubPublication(
        await buildMinimalEpubFixture({
          chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" lang="${language.toUpperCase()}" xml:lang="${language}"><head><title>Synthetic</title></head><body><p id="compound">${source}</p><p lang="" id="unknown">25 % <em>14:30</em></p><p lang="${language}" id="known">25 %</p></body></html>`,
        }),
      );
      expect(opened.ok).toBe(true);
      if (!opened.ok) return;
      const publication = opened.publication;
      const before = JSON.stringify(publication.documents);
      try {
        for (const profile of [
          "narration-piper-v2",
          "narration-chatterbox-v1",
          "narration-bilingual-v2",
        ] as const) {
          const prepared = await publication.prepareNarration({
            startLocator: publication.defaultStartLocator!,
            profile,
            defaultLanguage: language,
            maximumSegments: 16,
          });
          expect(prepared.status).toBe("complete");
          if (prepared.status !== "complete") continue;
          expect(prepared.segments.map((segment) => segment.text)).toEqual([
            source,
            "25 % 14:30",
            language === "es"
              ? "veinticinco por ciento"
              : "twenty-five percent",
          ]);
          for (const [index, segment] of prepared.segments.entries()) {
            expect(segment.sourceRange.start).toEqual(
              publication.locators[index]!.startLocator,
            );
            expect(segment.sourceRange.end.textOffsetCodePoints).toBe(
              [source.length, 10, 4][index],
            );
          }
        }
        expect(JSON.stringify(publication.documents)).toBe(before);
      } finally {
        await publication.close();
      }
    },
  );

  it.each(["es", "en"] as const)(
    "NLC-05 reaches current Piper and Chatterbox %s with exact source locators",
    async (language) => {
      const source = language === "es" ? "1,20 °C" : "1.20 °C";
      const opened = await openEpubPublication(
        await buildMinimalEpubFixture({
          chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${language}"><head><title>Synthetic</title></head><body><p id="temperature">${source}</p></body></html>`,
        }),
      );
      if (!opened.ok) throw new Error("synthetic-open-failed");
      const publication = opened.publication;
      const before = JSON.stringify(publication.documents);
      const start = publication.defaultStartLocator!;
      try {
        for (const profile of [
          "narration-piper-v2",
          "narration-chatterbox-v1",
          "narration-bilingual-v2",
        ] as const) {
          const result = await publication.prepareNarration({
            startLocator: start,
            profile,
            defaultLanguage: language,
            maximumSegments: 16,
          });
          if (result.status !== "complete")
            throw new Error("synthetic-preparation-failed");
          expect(result.segments).toHaveLength(1);
          const segment = result.segments[0]!;
          expect(segment.text).toBe(source);
          expect(segment.sourceRange.start).toEqual(start);
          expect(segment.sourceRange.end.textOffsetCodePoints).toBe(
            Array.from(source).length,
          );
          assertPublicSegment(publication, segment, 0);
        }
        if (language === "es") {
          for (const profile of [
            "narration-v1",
            "narration-piper-v1",
          ] as const) {
            const legacy = await publication.prepareNarration({
              startLocator: start,
              profile,
              defaultLanguage: language,
              maximumSegments: 16,
            });
            if (legacy.status !== "complete")
              throw new Error("legacy-preparation-failed");
            expect(legacy.segments[0]!.text).toBe("1,veinte grados Celsius");
          }
        }
        expect(JSON.stringify(publication.documents)).toBe(before);
      } finally {
        await publication.close();
      }
    },
  );

  it("RAC-09 preserves ordinal streets through current English profiles and source ranges", async () => {
    const source = "Walk along 8th St. North. Walk along 21st St. North.";
    const opened = await openEpubPublication(
      await buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body><p>${source}</p></body></html>`,
      }),
    );
    if (!opened.ok) throw new Error("synthetic-open-failed");
    const publication = opened.publication;
    const before = JSON.stringify(publication.documents);
    try {
      for (const profile of [
        "narration-piper-v2",
        "narration-chatterbox-v1",
      ] as const) {
        const result = await publication.prepareNarration({
          startLocator: publication.defaultStartLocator!,
          profile,
          defaultLanguage: "en",
          maximumSegments: 16,
        });
        if (result.status !== "complete")
          throw new Error("synthetic-preparation-failed");
        expect(result.segments.map((segment) => segment.text).join(" ")).toBe(
          "Walk along 8th St. North. Walk along twenty-first St. North.",
        );
        expect(result.segments[0]!.sourceRange.start).toEqual(
          publication.defaultStartLocator,
        );
        expect(
          result.segments.at(-1)!.sourceRange.end.textOffsetCodePoints,
        ).toBe(source.length);
        result.segments.forEach((segment, index) =>
          assertPublicSegment(publication, segment, index),
        );
      }
      expect(JSON.stringify(publication.documents)).toBe(before);
    } finally {
      await publication.close();
    }
  });

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
  profile: NarrationPreparationProfileId = "narration-v1",
  defaultLanguage: NarrationPreparationLanguage = "und",
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
      profile,
      defaultLanguage,
      maximumSegments,
    });
    if (result.status !== "batch" && result.status !== "complete") {
      throw new Error(`narration-matrix-public-result-failed:${result.status}`);
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
