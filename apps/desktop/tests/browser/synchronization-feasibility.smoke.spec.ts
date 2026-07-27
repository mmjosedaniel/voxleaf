import { expect, test } from "@playwright/test";

import { SYNCHRONIZATION_AUTHORITY_V1 } from "../../src/reader/synchronization-authority";

const LOCAL_ORIGIN = "http://127.0.0.1:4173";
const POSITION_STORAGE_KEY = "voxleaf.reader.positions";

async function buildSynchronizationFixture(): Promise<Uint8Array> {
  const fixtureModuleUrl = new URL(
    "../../../../packages/epub/test-support/epub-fixture.ts",
    import.meta.url,
  );
  const fixtureModule = (await import(fixtureModuleUrl.href)) as {
    buildReaderNavigationEpubFixture(): Promise<Uint8Array>;
  };
  return fixtureModule.buildReaderNavigationEpubFixture();
}

test("proves segment decoration and focus-safe following without DOM or selection mutation", async ({
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
  }, POSITION_STORAGE_KEY);

  try {
    await page.setViewportSize({ width: 800, height: 400 });
    await page.goto("/");
    const publicationBytes = await buildSynchronizationFixture();
    await page.getByLabel("Open a local EPUB").setInputFiles({
      name: "private-synchronization-feasibility.epub",
      mimeType: "application/epub+zip",
      buffer: Buffer.from(publicationBytes),
    });
    await expect(page.getByRole("status")).toHaveText(
      "The EPUB opened successfully.",
    );
    await page.getByLabel("Text size").selectOption("extra-large");
    await page.getByLabel("Line spacing").selectOption("spacious");

    const focusOwner = page.getByLabel("Theme");
    await focusOwner.focus();
    await expect(focusOwner).toBeFocused();
    const initialUrl = page.url();

    const proof = await page.evaluate(
      ({ comfortInsetPx, highlightName }) => {
        const highlights = (
          CSS as typeof CSS & {
            highlights?: HighlightRegistry;
          }
        ).highlights;
        if (
          highlights === undefined ||
          typeof globalThis.Highlight !== "function"
        ) {
          return { supported: false as const };
        }
        const styleSheet = Array.from(document.styleSheets).find((sheet) => {
          try {
            return sheet.cssRules !== undefined;
          } catch {
            return false;
          }
        });
        const leaves = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".semantic-document h1, .semantic-document h2, .semantic-document h3, .semantic-document h4, .semantic-document h5, .semantic-document h6, .semantic-document p",
          ),
        );
        const selectionOwner = leaves[0];
        const target = leaves[1];
        if (selectionOwner === undefined || target === undefined) {
          return { supported: true as const, fixtureReady: false as const };
        }
        const textNode = (element: HTMLElement): Text | undefined => {
          const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
          );
          const node = walker.nextNode();
          return node instanceof Text ? node : undefined;
        };
        const selectionText = textNode(selectionOwner);
        const targetText = textNode(target);
        if (
          selectionText === undefined ||
          targetText === undefined ||
          selectionText.data.length < 2 ||
          targetText.data.length < 2
        ) {
          return { supported: true as const, fixtureReady: false as const };
        }

        const selection = document.getSelection();
        if (selection === null || styleSheet === undefined) {
          return { supported: true as const, fixtureReady: false as const };
        }
        const selected = document.createRange();
        selected.setStart(selectionText, 0);
        selected.setEnd(selectionText, 1);
        selection.removeAllRanges();
        selection.addRange(selected);
        const selectionBefore = selection.toString();
        const article = target.closest(".semantic-document");
        const descendantCountBefore = article?.querySelectorAll("*").length;
        const textNodeCountBefore = article?.textContent?.length;

        const range = document.createRange();
        range.setStart(targetText, 0);
        range.setEnd(targetText, targetText.data.length);
        const highlight = new Highlight(range);
        const ruleIndex = styleSheet.insertRule(
          `::highlight(${highlightName}) { background-color: rgb(255 214 64); color: rgb(20 20 20); }`,
          styleSheet.cssRules.length,
        );
        highlights.set(highlightName, highlight);

        window.scrollTo(0, document.documentElement.scrollHeight);
        const beforeFollow = range.getBoundingClientRect();
        const comfortTop = comfortInsetPx;
        const comfortBottom = window.innerHeight - comfortInsetPx;
        const outsideBefore =
          beforeFollow.bottom < comfortTop || beforeFollow.top > comfortBottom;
        if (outsideBefore) {
          window.scrollBy({
            top: beforeFollow.top - comfortTop,
            left: 0,
            behavior: "auto",
          });
        }
        const afterFollow = range.getBoundingClientRect();
        const activeElement = document.activeElement;
        const result = {
          supported: true as const,
          fixtureReady: true as const,
          registered: highlights.has(highlightName) && highlight.has(range),
          styleRegistered:
            styleSheet.cssRules[ruleIndex]?.cssText.includes(
              `::highlight(${highlightName})`,
            ) === true,
          rangeConnected: target.isConnected && !range.collapsed,
          followed:
            outsideBefore &&
            afterFollow.bottom >= comfortTop - 1 &&
            afterFollow.top <= comfortBottom + 1,
          focusPreserved: activeElement?.getAttribute("name") === "theme",
          selectionPreserved:
            selection.rangeCount === 1 &&
            selection.toString() === selectionBefore &&
            selection.getRangeAt(0) === selected,
          publicationDomUnchanged:
            article?.querySelectorAll("*").length === descendantCountBefore &&
            article?.textContent?.length === textNodeCountBefore,
          contentFreeUrl: !window.location.href.includes(
            "private-synchronization-feasibility",
          ),
        };
        highlights.delete(highlightName);
        styleSheet.deleteRule(ruleIndex);
        selection.removeAllRanges();
        return result;
      },
      {
        comfortInsetPx: SYNCHRONIZATION_AUTHORITY_V1.following.comfortInsetPx,
        highlightName: SYNCHRONIZATION_AUTHORITY_V1.highlighting.name,
      },
    );
    expect(proof).toEqual({
      supported: true,
      fixtureReady: true,
      registered: true,
      styleRegistered: true,
      rangeConnected: true,
      followed: true,
      focusPreserved: true,
      selectionPreserved: true,
      publicationDomUnchanged: true,
      contentFreeUrl: true,
    });

    await page.setViewportSize({ width: 360, height: 640 });
    await expect(focusOwner).toBeFocused();
    await expect(page).toHaveURL(initialUrl);
    await expect
      .poll(() =>
        page.evaluate(
          (highlightName) =>
            !(
              CSS as typeof CSS & { highlights?: HighlightRegistry }
            ).highlights?.has(highlightName),
          SYNCHRONIZATION_AUTHORITY_V1.highlighting.name,
        ),
      )
      .toBe(true);
    const storedStateIsContentFree = await page.evaluate((storageKey) => {
      const serialized = localStorage.getItem(storageKey) ?? "";
      return (
        !serialized.includes("private-synchronization-feasibility") &&
        !serialized.includes("Repository-authored")
      );
    }, POSITION_STORAGE_KEY);
    expect(storedStateIsContentFree).toBe(true);
    expect(pageErrors).toEqual([]);
    expect(unexpectedRequestCount).toBe(0);
  } finally {
    if (!page.isClosed() && page.url().startsWith(LOCAL_ORIGIN)) {
      await page.evaluate(
        (storageKey) => localStorage.removeItem(storageKey),
        POSITION_STORAGE_KEY,
      );
    }
    await context.unroute("**/*");
  }
});
