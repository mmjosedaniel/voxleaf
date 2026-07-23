import { expect, test } from "@playwright/test";

import { ACTIVE_VISUAL_LOCATOR_READING_LINE_INSET_PX } from "../../src/reader/active-visual-locator";

const LOCAL_ORIGIN = "http://127.0.0.1:4173";
const READER_POSITION_STORAGE_KEY = "voxleaf.reader.position";

async function buildVisualLocatorFixture(): Promise<Uint8Array> {
  const fixtureModuleUrl = new URL(
    "../../../../packages/epub/test-support/epub-fixture.ts",
    import.meta.url,
  );
  const fixtureModule = (await import(fixtureModuleUrl.href)) as {
    buildComprehensiveEpubFixture(): Promise<Uint8Array>;
  };
  return fixtureModule.buildComprehensiveEpubFixture();
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
    await page.getByLabel("Open a local EPUB").setInputFiles({
      name: "private-visual-locator-smoke.epub",
      mimeType: "application/epub+zip",
      buffer: Buffer.from(publicationBytes),
    });
    await expect(page.getByRole("status")).toHaveText(
      "The EPUB opened successfully.",
    );
    await page.getByLabel("Text size").selectOption("extra-large");
    await page.getByLabel("Line spacing").selectOption("spacious");
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
    const focusOwner = page.getByLabel("Theme");
    await focusOwner.focus();
    await expect(focusOwner).toBeFocused();

    const readingLine = ACTIVE_VISUAL_LOCATOR_READING_LINE_INSET_PX;
    const first = leaves.first();
    await first.evaluate((element, line) => {
      const bounds = element.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + bounds.top - (line + 12));
    }, readingLine);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    const topGeometry = await first.evaluate((element, line) => {
      const bounds = element.getBoundingClientRect();
      return {
        top: bounds.top,
        bottom: bounds.bottom,
        visible: bounds.bottom >= 0 && bounds.top <= window.innerHeight,
        line,
      };
    }, readingLine);
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
    await partial.evaluate((element, line) => {
      const bounds = element.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + bounds.top - (line - 8));
    }, readingLine);
    await expect
      .poll(() =>
        partial.evaluate((element, line) => {
          const bounds = element.getBoundingClientRect();
          return bounds.top <= line && bounds.bottom >= line;
        }, readingLine),
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

    const between = await page.evaluate((line) => {
      const elements = Array.from(
        document.querySelectorAll<HTMLElement>(
          ".semantic-document h1, .semantic-document h2, .semantic-document h3, .semantic-document h4, .semantic-document h5, .semantic-document h6, .semantic-document p",
        ),
      );
      const maximumScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
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
        const scrollTop = window.scrollY + midpoint - line;
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
        window.scrollTo(0, selected.scrollTop);
      }
      return selected;
    }, readingLine);
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
      { line: readingLine, nextIndex: between!.index + 1 },
    );
    expect(betweenGeometry.previousBottom).toBeLessThan(betweenGeometry.line);
    expect(betweenGeometry.nextTop).toBeGreaterThan(betweenGeometry.line);
    await expect(focusOwner).toBeFocused();

    const last = leaves.last();
    await last.evaluate((element, line) => {
      const bounds = element.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + bounds.bottom - (line - 4));
    }, readingLine);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    const endGeometry = await last.evaluate((element, line) => {
      const bounds = element.getBoundingClientRect();
      return {
        top: bounds.top,
        bottom: bounds.bottom,
        visible: bounds.bottom >= 0 && bounds.top <= window.innerHeight,
        line,
      };
    }, readingLine);
    expect(endGeometry.visible).toBe(true);
    expect(endGeometry.top).toBeGreaterThan(endGeometry.line);
    await expect(focusOwner).toBeFocused();

    await expect
      .poll(() =>
        page.evaluate(
          (storageKey) => localStorage.getItem(storageKey),
          READER_POSITION_STORAGE_KEY,
        ),
      )
      .toBeNull();
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
