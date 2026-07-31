import { expect, test } from "@playwright/test";

import { READER_EXPERIENCE_AUTHORITY_V1 } from "../../src/reader/reader-experience-authority";
import { MAX_REFLOW_SETTLE_FRAMES } from "../../src/reader/reader-reflow-restoration";
import { SYNCHRONIZATION_AUTHORITY_V1 } from "../../src/reader/synchronization-authority";
import { closeSettings, openSettings } from "./settings-helpers";

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
    await page.getByLabel("Open a book").setInputFiles({
      name: "private-synchronization-feasibility.epub",
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

    const focusOwner = page.getByRole("button", { name: "Settings" });
    await focusOwner.focus();
    await expect(focusOwner).toBeFocused();
    const initialUrl = page.url();

    const proof = await page.evaluate(
      async ({
        comfortInsetPx,
        highlightName,
        minimumAnimationFrames,
        minimumTextContrastRatio,
        reflowSettleFrames,
      }) => {
        const focusOwnerBeforeProof = document.activeElement;
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
        const styleRule = Array.from(document.styleSheets)
          .flatMap((sheet) => {
            try {
              return Array.from(sheet.cssRules);
            } catch {
              return [];
            }
          })
          .find(
            (rule): rule is CSSStyleRule =>
              rule instanceof CSSStyleRule &&
              rule.selectorText === `::highlight(${highlightName})`,
          );
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
        if (selection === null) {
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
        highlights.set(highlightName, highlight);
        const rangeAcceptedBeforePaint =
          highlights.has(highlightName) && highlight.has(range);
        const highlightPerceivableBeforePaint = false;

        const readerViewport = document.querySelector<HTMLElement>(
          '[data-reader-scroll-owner="true"]',
        );
        if (readerViewport === null) {
          return { supported: true as const, fixtureReady: false as const };
        }
        await new Promise<void>((resolve) => {
          let observed = 0;
          const observe = (): void => {
            observed += 1;
            if (observed >= reflowSettleFrames) {
              resolve();
              return;
            }
            requestAnimationFrame(observe);
          };
          requestAnimationFrame(observe);
        });
        readerViewport.scrollTop = readerViewport.scrollHeight;
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
        const readerViewportBounds = readerViewport.getBoundingClientRect();
        const beforeFollow = range.getBoundingClientRect();
        const comfortTop = readerViewportBounds.top + comfortInsetPx;
        const comfortBottom = readerViewportBounds.bottom - comfortInsetPx;
        const outsideBefore =
          beforeFollow.bottom < comfortTop || beforeFollow.top > comfortBottom;
        if (outsideBefore) {
          readerViewport.scrollTop += beforeFollow.top - comfortTop;
        }
        const registeredAnimationFrames = await new Promise<number>(
          (resolve) => {
            let observed = 0;
            const observe = (): void => {
              observed += 1;
              if (observed >= minimumAnimationFrames) {
                resolve(observed);
                return;
              }
              requestAnimationFrame(observe);
            };
            requestAnimationFrame(observe);
          },
        );
        let afterFollow = range.getBoundingClientRect();
        for (let corrections = 0; corrections < 3; corrections += 1) {
          if (
            afterFollow.bottom >= comfortTop &&
            afterFollow.top <= comfortBottom
          ) {
            break;
          }
          readerViewport.scrollTop += afterFollow.top - comfortTop;
          await new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          );
          afterFollow = range.getBoundingClientRect();
        }
        const renderedStyle = getComputedStyle(
          target,
          `::highlight(${highlightName})`,
        );
        const parseColor = (
          value: string,
        ): readonly [number, number, number] | undefined => {
          const rgb = value.match(
            /^rgba?\(\s*(\d+(?:\.\d+)?)\s*,?\s*(\d+(?:\.\d+)?)\s*,?\s*(\d+(?:\.\d+)?)/u,
          );
          if (rgb !== null) {
            return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])] as const;
          }
          const hex = value.match(/^#([\da-f]{6})$/iu);
          if (hex === null) {
            return undefined;
          }
          const hexValue = hex[1];
          if (hexValue === undefined) {
            return undefined;
          }
          const packed = Number.parseInt(hexValue, 16);
          return [
            (packed >> 16) & 255,
            (packed >> 8) & 255,
            packed & 255,
          ] as const;
        };
        const luminance = (
          color: readonly [number, number, number],
        ): number => {
          const channelLuminance = (channel: number): number => {
            const normalized = channel / 255;
            return normalized <= 0.04045
              ? normalized / 12.92
              : ((normalized + 0.055) / 1.055) ** 2.4;
          };
          return (
            channelLuminance(color[0]) * 0.2126 +
            channelLuminance(color[1]) * 0.7152 +
            channelLuminance(color[2]) * 0.0722
          );
        };
        const foreground = parseColor(renderedStyle.color);
        const background = parseColor(renderedStyle.backgroundColor);
        const foregroundLuminance =
          foreground === undefined ? undefined : luminance(foreground);
        const backgroundLuminance =
          background === undefined ? undefined : luminance(background);
        const textContrastRatio =
          foregroundLuminance === undefined || backgroundLuminance === undefined
            ? 0
            : (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
              (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
        const hasNonzeroClientGeometry =
          afterFollow.width > 0 && afterFollow.height > 0;
        const insideReaderViewport =
          afterFollow.bottom >= comfortTop - 1 &&
          afterFollow.top <= comfortBottom + 1;
        const hasNonColorUnderline =
          renderedStyle.textDecorationLine.includes("underline") ||
          renderedStyle.textDecoration.includes("underline") ||
          styleRule?.style.textDecorationLine.includes("underline") === true ||
          styleRule?.style.textDecoration.includes("underline") === true;
        const hasExplicitForegroundAndBackground =
          styleRule?.style.color.length !== 0 &&
          styleRule?.style.backgroundColor.length !== 0 &&
          foreground !== undefined &&
          background !== undefined;
        const highlightVisiblyPerceivable =
          rangeAcceptedBeforePaint &&
          highlights.has(highlightName) &&
          highlight.has(range) &&
          registeredAnimationFrames >= minimumAnimationFrames &&
          hasNonzeroClientGeometry &&
          insideReaderViewport &&
          hasExplicitForegroundAndBackground &&
          textContrastRatio >= minimumTextContrastRatio &&
          hasNonColorUnderline;
        const result = {
          supported: true as const,
          fixtureReady: true as const,
          rangeAcceptedBeforePaint,
          highlightPerceivableBeforePaint,
          registeredAcrossRenderingOpportunity:
            highlights.has(highlightName) && highlight.has(range),
          registeredAnimationFrames,
          styleRegistered: styleRule !== undefined,
          rangeConnected: target.isConnected && !range.collapsed,
          hasNonzeroClientGeometry,
          insideReaderViewport,
          hasExplicitForegroundAndBackground,
          textContrastRatio,
          hasNonColorUnderline,
          highlightVisiblyPerceivable,
          followed: outsideBefore && insideReaderViewport,
          focusPreserved: document.activeElement === focusOwnerBeforeProof,
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
        selection.removeAllRanges();
        return result;
      },
      {
        comfortInsetPx: SYNCHRONIZATION_AUTHORITY_V1.following.comfortInsetPx,
        highlightName: SYNCHRONIZATION_AUTHORITY_V1.highlighting.name,
        minimumAnimationFrames:
          READER_EXPERIENCE_AUTHORITY_V1.highlightProof.minimumAnimationFrames,
        minimumTextContrastRatio:
          READER_EXPERIENCE_AUTHORITY_V1.highlightProof
            .minimumTextContrastRatio,
        reflowSettleFrames: MAX_REFLOW_SETTLE_FRAMES + 2,
      },
    );
    expect(proof).toEqual({
      supported: true,
      fixtureReady: true,
      rangeAcceptedBeforePaint: true,
      highlightPerceivableBeforePaint: false,
      registeredAcrossRenderingOpportunity: true,
      registeredAnimationFrames: 2,
      styleRegistered: true,
      rangeConnected: true,
      hasNonzeroClientGeometry: true,
      insideReaderViewport: true,
      hasExplicitForegroundAndBackground: true,
      textContrastRatio: expect.any(Number),
      hasNonColorUnderline: true,
      highlightVisiblyPerceivable: true,
      followed: true,
      focusPreserved: true,
      selectionPreserved: true,
      publicationDomUnchanged: true,
      contentFreeUrl: true,
    });
    if (
      !("textContrastRatio" in proof) ||
      typeof proof.textContrastRatio !== "number"
    ) {
      throw new Error("The highlight contrast observation was unavailable.");
    }
    expect(proof.textContrastRatio).toBeGreaterThanOrEqual(
      READER_EXPERIENCE_AUTHORITY_V1.highlightProof.minimumTextContrastRatio,
    );

    const selectedPassage = page.locator(".semantic-document p").first();
    await expect(selectedPassage).toBeVisible();
    const proveSelectedTextDecoration = async (): Promise<void> => {
      const registered = await page.evaluate(
        async ({ highlightName, minimumAnimationFrames }) => {
          const highlights = (
            CSS as typeof CSS & {
              highlights?: HighlightRegistry;
            }
          ).highlights;
          const target = document.querySelector<HTMLElement>(
            ".semantic-document p",
          );
          if (
            highlights === undefined ||
            typeof globalThis.Highlight !== "function" ||
            target === null
          ) {
            return false;
          }
          const walker = document.createTreeWalker(
            target,
            NodeFilter.SHOW_TEXT,
          );
          const textNode = walker.nextNode();
          const selection = document.getSelection();
          if (!(textNode instanceof Text) || selection === null) {
            return false;
          }
          const range = document.createRange();
          range.setStart(textNode, 0);
          range.setEnd(textNode, textNode.data.length);
          selection.removeAllRanges();
          selection.addRange(range.cloneRange());
          const highlight = new Highlight(range);
          highlights.set(highlightName, highlight);
          await new Promise<void>((resolve) => {
            let observed = 0;
            const observe = (): void => {
              observed += 1;
              if (observed >= minimumAnimationFrames) {
                resolve();
                return;
              }
              requestAnimationFrame(observe);
            };
            requestAnimationFrame(observe);
          });
          return highlights.has(highlightName) && highlight.has(range);
        },
        {
          highlightName: SYNCHRONIZATION_AUTHORITY_V1.highlighting.name,
          minimumAnimationFrames:
            READER_EXPERIENCE_AUTHORITY_V1.highlightProof
              .minimumAnimationFrames,
        },
      );
      expect(registered).toBe(true);
      const highlightedSelection = await selectedPassage.screenshot({
        animations: "disabled",
      });
      await page.evaluate(
        async ({ highlightName, minimumAnimationFrames }) => {
          (
            CSS as typeof CSS & {
              highlights?: HighlightRegistry;
            }
          ).highlights?.delete(highlightName);
          await new Promise<void>((resolve) => {
            let observed = 0;
            const observe = (): void => {
              observed += 1;
              if (observed >= minimumAnimationFrames) {
                resolve();
                return;
              }
              requestAnimationFrame(observe);
            };
            requestAnimationFrame(observe);
          });
        },
        {
          highlightName: SYNCHRONIZATION_AUTHORITY_V1.highlighting.name,
          minimumAnimationFrames:
            READER_EXPERIENCE_AUTHORITY_V1.highlightProof
              .minimumAnimationFrames,
        },
      );
      const selectionOnly = await selectedPassage.screenshot({
        animations: "disabled",
      });
      expect(Buffer.compare(highlightedSelection, selectionOnly)).not.toBe(0);
      await expect(focusOwner).toBeFocused();
    };

    const darkSettings = await openSettings(page);
    await darkSettings.getByLabel("Theme").selectOption("dark");
    await closeSettings(page, darkSettings);
    await proveSelectedTextDecoration();
    await page.emulateMedia({ forcedColors: "active" });
    await proveSelectedTextDecoration();
    await page.emulateMedia({ forcedColors: "none" });
    await page.evaluate(() => document.getSelection()?.removeAllRanges());

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
