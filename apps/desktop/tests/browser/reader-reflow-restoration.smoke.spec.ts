import { expect, test, type Page } from "@playwright/test";

import { ACTIVE_VISUAL_LOCATOR_READING_LINE_INSET_PX } from "../../src/reader/active-visual-locator";

const LOCAL_ORIGIN = "http://127.0.0.1:4173";
const POSITION_STORAGE_KEY = "voxleaf.reader.positions";
const PREFERENCE_STORAGE_KEY = "voxleaf.reader.preferences";

interface PassageSignature {
  readonly blockIndex: number;
  readonly textOffsetCodePoints: number;
}

interface ReflowRangeSample {
  readonly textOffsetCodePoints: number;
  readonly top: number;
}

async function buildReflowFixture(): Promise<Uint8Array> {
  const fixtureModuleUrl = new URL(
    "../../../../packages/epub/test-support/epub-fixture.ts",
    import.meta.url,
  );
  const fixtureModule = (await import(fixtureModuleUrl.href)) as {
    buildMinimalEpubFixture(options?: {
      readonly chapterDocument?: string;
    }): Promise<Uint8Array>;
  };
  const paragraphs = Array.from({ length: 36 }, (_, index) =>
    index === 18
      ? `<p>Preserved synthetic passage with enough words to wrap across several visual lines while preferences and viewport geometry change.</p>`
      : `<p>Repository-authored reflow filler ${index + 1} with deterministic local text.</p>`,
  ).join("");
  return fixtureModule.buildMinimalEpubFixture({
    chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Reflow</title></head><body><h1 id="chapter-one">Reflow fixture</h1>${paragraphs}</body></html>`,
  });
}

async function passageAtReadingLine(
  page: Page,
): Promise<PassageSignature | undefined> {
  return page.evaluate((readingLine) => {
    const blocks = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".semantic-document h1, .semantic-document h2, .semantic-document h3, .semantic-document h4, .semantic-document h5, .semantic-document h6, .semantic-document p",
      ),
    );
    const passage = blocks.find((block) =>
      block.textContent?.includes("Preserved synthetic passage"),
    );
    if (passage === undefined) {
      return undefined;
    }
    const bounds = passage.getBoundingClientRect();
    const x = Math.min(bounds.right - 1, bounds.left + 1);
    const position = document.caretPositionFromPoint?.(x, readingLine);
    const range =
      position === null || position === undefined
        ? document.caretRangeFromPoint?.(x, readingLine)
        : undefined;
    const node = position?.offsetNode ?? range?.startContainer;
    const offset = position?.offset ?? range?.startOffset;
    if (node === undefined || offset === undefined || !passage.contains(node)) {
      return undefined;
    }
    const prefix = document.createRange();
    prefix.selectNodeContents(passage);
    try {
      prefix.setEnd(node, offset);
    } catch {
      return undefined;
    }
    return {
      blockIndex: blocks.indexOf(passage),
      textOffsetCodePoints: Array.from(prefix.toString()).length,
    };
  }, ACTIVE_VISUAL_LOCATOR_READING_LINE_INSET_PX);
}

async function clearReflowRangeSamples(page: Page): Promise<void> {
  await page.evaluate(() => {
    (
      globalThis as typeof globalThis & {
        __voxleafReflowRangeSamples: ReflowRangeSample[];
      }
    ).__voxleafReflowRangeSamples.length = 0;
  });
}

async function restoredRangeSample(page: Page): Promise<ReflowRangeSample> {
  let sample: ReflowRangeSample | undefined;
  await expect
    .poll(async () => {
      sample = await page.evaluate((readingLine) => {
        const samples = (
          globalThis as typeof globalThis & {
            __voxleafReflowRangeSamples: ReflowRangeSample[];
          }
        ).__voxleafReflowRangeSamples;
        return [...samples]
          .reverse()
          .find((candidate) => Math.abs(candidate.top - readingLine) <= 0.75);
      }, ACTIVE_VISUAL_LOCATOR_READING_LINE_INSET_PX);
      return sample;
    })
    .toBeDefined();
  return sample!;
}

test("preserves one canonical passage across preferences, rapid changes, viewport resize, and zoom", async ({
  context,
  page,
}) => {
  let unexpectedRequestCount = 0;
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.name));
  await context.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.origin === LOCAL_ORIGIN) {
      await route.continue();
      return;
    }
    unexpectedRequestCount += 1;
    await route.abort("blockedbyclient");
  });
  await page.addInitScript(
    (keys) => {
      const marker = "voxleaf-test-reader-state-cleared";
      if (sessionStorage.getItem(marker) === "true") {
        return;
      }
      for (const key of keys) {
        localStorage.removeItem(key);
      }
      sessionStorage.setItem(marker, "true");
    },
    [POSITION_STORAGE_KEY, PREFERENCE_STORAGE_KEY],
  );
  await page.addInitScript(() => {
    const samples: ReflowRangeSample[] = [];
    Object.defineProperty(globalThis, "__voxleafReflowRangeSamples", {
      configurable: false,
      value: samples,
    });
    const getClientRects = Range.prototype.getClientRects;
    Range.prototype.getClientRects = function (): DOMRectList {
      const rects = getClientRects.call(this);
      if (!this.collapsed) {
        return rects;
      }
      const element =
        this.startContainer.nodeType === Node.ELEMENT_NODE
          ? (this.startContainer as Element)
          : this.startContainer.parentElement;
      const block = element?.closest("p");
      if (
        block === null ||
        block === undefined ||
        !block.textContent?.includes("Preserved synthetic passage")
      ) {
        return rects;
      }
      const prefix = document.createRange();
      prefix.selectNodeContents(block);
      try {
        prefix.setEnd(this.startContainer, this.startOffset);
      } catch {
        return rects;
      }
      const rect = rects.item(0) ?? this.getBoundingClientRect();
      samples.push({
        textOffsetCodePoints: Array.from(prefix.toString()).length,
        top: rect.top,
      });
      return rects;
    };
  });

  try {
    await page.setViewportSize({ width: 900, height: 500 });
    await page.goto("/");
    const publicationBytes = await buildReflowFixture();
    await page.getByLabel("Open a local EPUB").setInputFiles({
      name: "private-reflow-smoke.epub",
      mimeType: "application/epub+zip",
      buffer: Buffer.from(publicationBytes),
    });
    await expect(page.getByRole("status")).toHaveText(
      "The EPUB opened successfully.",
    );

    const passage = page
      .locator(".semantic-document p")
      .filter({ hasText: "Preserved synthetic passage" });
    await expect(passage).toBeVisible();
    await passage.evaluate((element, readingLine) => {
      const bounds = element.getBoundingClientRect();
      const lineHeight = Number.parseFloat(
        getComputedStyle(element).lineHeight,
      );
      const desiredTop = readingLine - lineHeight * 1.25;
      window.scrollTo(0, window.scrollY + bounds.top - desiredTop);
    }, ACTIVE_VISUAL_LOCATOR_READING_LINE_INSET_PX);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );

    const initialPassage = await passageAtReadingLine(page);
    expect(initialPassage).toBeDefined();
    expect(initialPassage!.textOffsetCodePoints).toBeGreaterThan(0);

    let canonicalOffset: number | undefined;
    for (const [label, value] of [
      ["Text size", "extra-large"],
      ["Line spacing", "spacious"],
      ["Content width", "narrow"],
      ["Theme", "dark"],
    ] as const) {
      const control = page.getByLabel(label);
      await clearReflowRangeSamples(page);
      await control.evaluate((element: HTMLSelectElement, nextValue) => {
        element.focus({ preventScroll: true });
        element.value = nextValue;
        element.dispatchEvent(new Event("change", { bubbles: true }));
      }, value);
      const sample = await restoredRangeSample(page);
      canonicalOffset ??= sample.textOffsetCodePoints;
      expect(sample.textOffsetCodePoints).toBe(canonicalOffset);
      await expect(control).toBeFocused();
    }
    expect(canonicalOffset).toBeGreaterThan(0);

    const focusOwner = page.getByLabel("Theme");
    await focusOwner.evaluate((element: HTMLSelectElement) =>
      element.focus({ preventScroll: true }),
    );
    await clearReflowRangeSamples(page);
    await page.evaluate(() => {
      const textScale = document.querySelector<HTMLSelectElement>(
        'select[name="textScale"]',
      );
      const lineSpacing = document.querySelector<HTMLSelectElement>(
        'select[name="lineSpacing"]',
      );
      if (textScale === null || lineSpacing === null) {
        throw new Error("Reader preference controls are unavailable.");
      }
      textScale.value = "standard";
      textScale.dispatchEvent(new Event("change", { bubbles: true }));
      lineSpacing.value = "compact";
      lineSpacing.dispatchEvent(new Event("change", { bubbles: true }));
      textScale.value = "large";
      textScale.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect((await restoredRangeSample(page)).textOffsetCodePoints).toBe(
      canonicalOffset,
    );
    await expect(focusOwner).toBeFocused();
    await expect(page.getByLabel("Text size")).toHaveValue("large");
    await expect(page.getByLabel("Line spacing")).toHaveValue("compact");

    await clearReflowRangeSamples(page);
    await page.setViewportSize({ width: 680, height: 420 });
    expect((await restoredRangeSample(page)).textOffsetCodePoints).toBe(
      canonicalOffset,
    );
    await expect(focusOwner).toBeFocused();

    await clearReflowRangeSamples(page);
    await page.evaluate(() => {
      document.documentElement.style.zoom = "125%";
      window.dispatchEvent(new Event("resize"));
    });
    expect((await restoredRangeSample(page)).textOffsetCodePoints).toBe(
      canonicalOffset,
    );
    await expect(focusOwner).toBeFocused();

    await expect
      .poll(() =>
        page.evaluate(
          ([positionKey, preferenceKey]) => {
            const serializedPosition = localStorage.getItem(positionKey);
            const serializedPreferences = localStorage.getItem(preferenceKey);
            if (serializedPosition === null || serializedPreferences === null) {
              return null;
            }
            const positions = JSON.parse(serializedPosition) as {
              schemaVersion: number;
              states: Array<{
                locator: { textOffsetCodePoints: number };
                preferences: Record<string, unknown>;
              }>;
            };
            return {
              positionSchemaVersion: positions.schemaVersion,
              stateCount: positions.states.length,
              textOffsetCodePoints:
                positions.states[0]?.locator.textOffsetCodePoints,
              readingPreferences: positions.states[0]?.preferences,
              displayPreferences: JSON.parse(serializedPreferences),
              containsRenderedPassage: serializedPosition.includes(
                "Preserved synthetic passage",
              ),
              containsPrivateFilename: serializedPosition.includes(
                "private-reflow-smoke.epub",
              ),
            };
          },
          [POSITION_STORAGE_KEY, PREFERENCE_STORAGE_KEY] as const,
        ),
      )
      .toEqual({
        positionSchemaVersion: 1,
        stateCount: 1,
        textOffsetCodePoints: canonicalOffset,
        readingPreferences: {},
        displayPreferences: {
          schemaVersion: 1,
          textScale: "large",
          lineSpacing: "compact",
          contentWidth: "narrow",
          theme: "dark",
        },
        containsRenderedPassage: false,
        containsPrivateFilename: false,
      });

    await page.reload();
    const exactRestoreInput = page.getByLabel("Open a local EPUB");
    await exactRestoreInput.focus();
    await exactRestoreInput.setInputFiles({
      name: "private-reflow-smoke.epub",
      mimeType: "application/epub+zip",
      buffer: Buffer.from(publicationBytes),
    });
    await expect(page.getByRole("status")).toHaveText(
      "Reading position restored.",
    );
    await expect(page.getByLabel("Text size")).toHaveValue("large");
    await expect(page.getByLabel("Line spacing")).toHaveValue("compact");
    await expect(page.getByLabel("Content width")).toHaveValue("narrow");
    await expect(page.getByLabel("Theme")).toHaveValue("dark");
    expect((await restoredRangeSample(page)).textOffsetCodePoints).toBe(
      canonicalOffset,
    );
    await expect(exactRestoreInput).toBeFocused();

    await page.evaluate((positionKey) => {
      const serialized = localStorage.getItem(positionKey);
      if (serialized === null) {
        throw new Error("Synthetic position state is unavailable.");
      }
      const envelope = JSON.parse(serialized) as {
        states: Array<{
          locator: { textOffsetCodePoints: number };
        }>;
      };
      const state = envelope.states[0];
      if (state === undefined) {
        throw new Error("Synthetic position entry is unavailable.");
      }
      state.locator.textOffsetCodePoints = 999_999;
      localStorage.setItem(positionKey, JSON.stringify(envelope));
    }, POSITION_STORAGE_KEY);

    await page.reload();
    const recoveredRestoreInput = page.getByLabel("Open a local EPUB");
    await recoveredRestoreInput.focus();
    await recoveredRestoreInput.setInputFiles({
      name: "private-reflow-smoke.epub",
      mimeType: "application/epub+zip",
      buffer: Buffer.from(publicationBytes),
    });
    await expect(page.getByRole("status")).toHaveText(
      "Reading position restored to the nearest available passage.",
    );
    await expect(
      page.getByText(
        "The saved reading position was adjusted to the nearest available passage.",
      ),
    ).toBeVisible();
    const recoveredSample = await restoredRangeSample(page);
    expect(recoveredSample.textOffsetCodePoints).toBeGreaterThan(0);
    expect(recoveredSample.textOffsetCodePoints).toBeLessThan(999_999);
    await expect
      .poll(() =>
        page.evaluate((positionKey) => {
          const serialized = localStorage.getItem(positionKey);
          if (serialized === null) {
            return undefined;
          }
          const envelope = JSON.parse(serialized) as {
            states: Array<{
              locator: { textOffsetCodePoints: number };
            }>;
          };
          return envelope.states[0]?.locator.textOffsetCodePoints;
        }, POSITION_STORAGE_KEY),
      )
      .toBe(recoveredSample.textOffsetCodePoints);
    await expect(recoveredRestoreInput).toBeFocused();
    await expect(page).toHaveURL(`${LOCAL_ORIGIN}/`);
    expect(pageErrors).toEqual([]);
    expect(unexpectedRequestCount).toBe(0);
  } finally {
    if (!page.isClosed() && page.url().startsWith(LOCAL_ORIGIN)) {
      await page.evaluate(
        (keys) => {
          for (const key of keys) {
            localStorage.removeItem(key);
          }
        },
        [POSITION_STORAGE_KEY, PREFERENCE_STORAGE_KEY],
      );
    }
    await context.unroute("**/*");
  }
});
