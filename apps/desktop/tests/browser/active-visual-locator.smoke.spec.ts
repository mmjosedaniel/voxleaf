import { expect, test } from "@playwright/test";

import { ACTIVE_VISUAL_LOCATOR_READING_LINE_INSET_PX } from "../../src/reader/active-visual-locator";
import { closeSettings, openSettings } from "./settings-helpers";

const LOCAL_ORIGIN = "http://127.0.0.1:4173";
const READER_POSITION_STORAGE_KEY = "voxleaf.reader.positions";

async function buildVisualLocatorFixture(): Promise<Uint8Array> {
  const fixtureModuleUrl = new URL(
    "../../../../packages/epub/test-support/epub-fixture.ts",
    import.meta.url,
  );
  const fixtureModule = (await import(fixtureModuleUrl.href)) as {
    buildReaderNavigationEpubFixture(): Promise<Uint8Array>;
  };
  return fixtureModule.buildReaderNavigationEpubFixture();
}

test("tracks real top, partial, between-block, and document-end geometry without side effects", async ({
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
  await page.addInitScript((storageKey) => {
    localStorage.removeItem(storageKey);
    let caretQueryCount = 0;
    Object.defineProperty(globalThis, "__voxleafCaretQueryCount", {
      configurable: false,
      get: () => caretQueryCount,
    });
    const positionFromPoint = Document.prototype.caretPositionFromPoint;
    if (typeof positionFromPoint === "function") {
      Document.prototype.caretPositionFromPoint = function (
        x: number,
        y: number,
        options?: CaretPositionFromPointOptions,
      ): CaretPosition | null {
        caretQueryCount += 1;
        return positionFromPoint.call(this, x, y, options);
      };
    }
    const rangeFromPoint = Document.prototype.caretRangeFromPoint;
    if (typeof rangeFromPoint === "function") {
      Document.prototype.caretRangeFromPoint = function (
        x: number,
        y: number,
      ): Range | null {
        caretQueryCount += 1;
        return rangeFromPoint.call(this, x, y);
      };
    }
  }, READER_POSITION_STORAGE_KEY);

  try {
    await page.setViewportSize({ width: 800, height: 400 });
    await page.goto("/");
    const publicationBytes = await buildVisualLocatorFixture();
    await page.getByLabel("Open a book").setInputFiles({
      name: "private-visual-locator-smoke.epub",
      mimeType: "application/epub+zip",
      buffer: Buffer.from(publicationBytes),
    });
    await expect(page.getByRole("status")).toHaveText(
      "The EPUB opened successfully.",
    );
    const settings = await openSettings(page);
    await settings.getByLabel("Text size").selectOption("extra-large");
    await settings.getByLabel("Line spacing").selectOption("spacious");
    await closeSettings(page, settings);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() =>
              requestAnimationFrame(() =>
                requestAnimationFrame(() => resolve()),
              ),
            ),
          ),
        ),
    );

    const leaves = page.locator(
      ".semantic-document h1, .semantic-document h2, .semantic-document h3, .semantic-document h4, .semantic-document h5, .semantic-document h6, .semantic-document p",
    );
    expect(await leaves.count()).toBeGreaterThanOrEqual(3);
    const focusOwner = page.getByRole("button", { name: "Settings" });
    await focusOwner.focus();
    await expect(focusOwner).toBeFocused();

    const readingLineInset = ACTIVE_VISUAL_LOCATOR_READING_LINE_INSET_PX;
    const readerViewport = page.getByRole("region", {
      name: "Publication reading viewport",
    });
    const first = leaves.first();
    await first.evaluate((element, lineInset) => {
      const viewport = document.querySelector<HTMLElement>(
        '[data-reader-scroll-owner="true"]',
      )!;
      const bounds = element.getBoundingClientRect();
      const viewportBounds = viewport.getBoundingClientRect();
      viewport.scrollTop += bounds.top - (viewportBounds.top + lineInset + 12);
    }, readingLineInset);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    const topGeometry = await first.evaluate((element, lineInset) => {
      const viewport = document.querySelector<HTMLElement>(
        '[data-reader-scroll-owner="true"]',
      )!;
      const bounds = element.getBoundingClientRect();
      const viewportBounds = viewport.getBoundingClientRect();
      const line = viewportBounds.top + lineInset;
      return {
        top: bounds.top,
        bottom: bounds.bottom,
        visible:
          bounds.bottom >= viewportBounds.top &&
          bounds.top <= viewportBounds.bottom,
        line,
      };
    }, readingLineInset);
    expect(topGeometry.visible).toBe(true);
    expect(topGeometry.top).toBeGreaterThan(topGeometry.line);
    await expect(focusOwner).toBeFocused();

    const partial = leaves.nth(1);
    const caretCountBeforePartial = await page.evaluate(
      () =>
        (
          globalThis as typeof globalThis & {
            __voxleafCaretQueryCount: number;
          }
        ).__voxleafCaretQueryCount,
    );
    await partial.evaluate((element, lineInset) => {
      const viewport = document.querySelector<HTMLElement>(
        '[data-reader-scroll-owner="true"]',
      )!;
      const bounds = element.getBoundingClientRect();
      const viewportBounds = viewport.getBoundingClientRect();
      viewport.scrollTop += bounds.top - (viewportBounds.top + lineInset - 8);
    }, readingLineInset);
    await expect
      .poll(() =>
        partial.evaluate((element, lineInset) => {
          const viewport = document.querySelector<HTMLElement>(
            '[data-reader-scroll-owner="true"]',
          )!;
          const bounds = element.getBoundingClientRect();
          const line = viewport.getBoundingClientRect().top + lineInset;
          return bounds.top <= line && bounds.bottom >= line;
        }, readingLineInset),
      )
      .toBe(true);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (
              globalThis as typeof globalThis & {
                __voxleafCaretQueryCount: number;
              }
            ).__voxleafCaretQueryCount,
        ),
      )
      .toBeGreaterThan(caretCountBeforePartial);
    await expect(focusOwner).toBeFocused();

    const between = await page.evaluate((lineInset) => {
      const viewport = document.querySelector<HTMLElement>(
        '[data-reader-scroll-owner="true"]',
      )!;
      const viewportBounds = viewport.getBoundingClientRect();
      const line = viewportBounds.top + lineInset;
      const elements = Array.from(
        document.querySelectorAll<HTMLElement>(
          ".semantic-document h1, .semantic-document h2, .semantic-document h3, .semantic-document h4, .semantic-document h5, .semantic-document h6, .semantic-document p",
        ),
      );
      const maximumScroll = Math.max(
        0,
        viewport.scrollHeight - viewport.clientHeight,
      );
      let selected:
        | {
            readonly index: number;
            readonly gap: number;
            readonly scrollTop: number;
          }
        | undefined;
      for (let index = 0; index < elements.length - 1; index += 1) {
        const current = elements[index]!.getBoundingClientRect();
        const next = elements[index + 1]!.getBoundingClientRect();
        const gap = next.top - current.bottom;
        const midpoint = current.bottom + gap / 2;
        const scrollTop = viewport.scrollTop + midpoint - line;
        if (
          gap > 1 &&
          scrollTop >= 0 &&
          scrollTop <= maximumScroll &&
          (selected === undefined || gap > selected.gap)
        ) {
          selected = { index, gap, scrollTop };
        }
      }
      if (selected !== undefined) {
        viewport.scrollTop = selected.scrollTop;
      }
      return selected;
    }, readingLineInset);
    expect(between).toBeDefined();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    const betweenGeometry = await leaves.nth(between!.index).evaluate(
      (element, { line, nextIndex }) => {
        const next = document.querySelectorAll<HTMLElement>(
          ".semantic-document h1, .semantic-document h2, .semantic-document h3, .semantic-document h4, .semantic-document h5, .semantic-document h6, .semantic-document p",
        )[nextIndex]!;
        return {
          previousBottom: element.getBoundingClientRect().bottom,
          nextTop: next.getBoundingClientRect().top,
          line,
        };
      },
      {
        line: await readerViewport.evaluate(
          (element, inset) => element.getBoundingClientRect().top + inset,
          readingLineInset,
        ),
        nextIndex: between!.index + 1,
      },
    );
    expect(betweenGeometry.previousBottom).toBeLessThan(betweenGeometry.line);
    expect(betweenGeometry.nextTop).toBeGreaterThan(betweenGeometry.line);
    await expect(focusOwner).toBeFocused();

    const last = leaves.last();
    await last.evaluate((element, lineInset) => {
      const viewport = document.querySelector<HTMLElement>(
        '[data-reader-scroll-owner="true"]',
      )!;
      const bounds = element.getBoundingClientRect();
      const line = viewport.getBoundingClientRect().top + lineInset;
      viewport.scrollTop += bounds.top - (line + 8);
    }, readingLineInset);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    const endGeometry = await last.evaluate((element, lineInset) => {
      const viewport = document.querySelector<HTMLElement>(
        '[data-reader-scroll-owner="true"]',
      )!;
      const bounds = element.getBoundingClientRect();
      const viewportBounds = viewport.getBoundingClientRect();
      const line = viewportBounds.top + lineInset;
      return {
        top: bounds.top,
        bottom: bounds.bottom,
        visible:
          bounds.bottom >= viewportBounds.top &&
          bounds.top <= viewportBounds.bottom,
        line,
      };
    }, readingLineInset);
    expect(endGeometry.visible).toBe(true);
    expect(endGeometry.top).toBeGreaterThan(endGeometry.line);
    await expect(focusOwner).toBeFocused();

    await expect
      .poll(() =>
        page.evaluate((storageKey) => {
          const serialized = localStorage.getItem(storageKey);
          if (serialized === null) {
            return null;
          }
          const envelope = JSON.parse(serialized) as {
            schemaVersion?: unknown;
            states?: Array<Record<string, unknown>>;
          };
          const state = envelope.states?.[0];
          return {
            schemaVersion: envelope.schemaVersion,
            stateCount: envelope.states?.length,
            stateKeys: state === undefined ? [] : Object.keys(state).sort(),
            containsPrivateFilename: serialized.includes(
              "private-visual-locator-smoke.epub",
            ),
            containsRenderedText: serialized.includes("Repository-authored"),
          };
        }, READER_POSITION_STORAGE_KEY),
      )
      .toEqual({
        schemaVersion: 1,
        stateCount: 1,
        stateKeys: ["bookIdentity", "locator", "preferences", "schemaVersion"],
        containsPrivateFilename: false,
        containsRenderedText: false,
      });
    await expect(page).toHaveURL(`${LOCAL_ORIGIN}/`);
    expect(pageErrors).toEqual([]);
    expect(unexpectedRequestCount).toBe(0);
  } finally {
    if (!page.isClosed() && page.url().startsWith(LOCAL_ORIGIN)) {
      await page.evaluate(
        (storageKey) => localStorage.removeItem(storageKey),
        READER_POSITION_STORAGE_KEY,
      );
    }
    await context.unroute("**/*");
  }
});
