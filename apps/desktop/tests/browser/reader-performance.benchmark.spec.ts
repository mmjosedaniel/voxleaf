import { execFile } from "node:child_process";
import { platform } from "node:process";

import {
  chromium,
  expect,
  test,
  type Browser,
  type Page,
} from "@playwright/test";

const BATCH_SIZE_BLOCKS = 250;
const SELECTED_LIVE_BLOCK_LIMIT = 10_000;
const SELECTED_LIVE_DOM_NODE_LIMIT = 80_000;
const MEBIBYTE = 1_048_576;
const SELECTED_DOM_WORKING_SET_LIMIT_BYTES = 144 * MEBIBYTE;
const SELECTED_RASTER_WORKING_SET_LIMIT_BYTES = 112 * MEBIBYTE;
const SELECTED_COMBINED_WORKING_SET_LIMIT_BYTES = 208 * MEBIBYTE;
const SELECTED_FIRST_USEFUL_LIMIT_MS = 50;
const SELECTED_BATCH_SCRIPT_LIMIT_MS = 16;
const SELECTED_TARGET_READY_LIMIT_MS = 1_000;
const SELECTED_TOTAL_RENDER_LIMIT_MS = 1_000;
const SELECTED_REFLOW_LIMIT_MS = 250;
const SELECTED_RASTER_DECODE_LIMIT_MS = 150;
const RASTER_DIMENSION_PIXELS = 1_448;

const BLOCK_CASES = Object.freeze([
  Object.freeze({ label: "small", blockCount: 250 }),
  Object.freeze({ label: "representative", blockCount: 2_000 }),
  Object.freeze({ label: "long", blockCount: 10_000 }),
  Object.freeze({ label: "stress", blockCount: 20_000 }),
  Object.freeze({ label: "ingestion-scale-sample", blockCount: 50_000 }),
]);

const IMAGE_CASES = Object.freeze([
  Object.freeze({ label: "single", imageCount: 1 }),
  Object.freeze({ label: "aggregate-near-cap", imageCount: 8 }),
]);

interface BrowserMemorySnapshot {
  readonly domNodes: number;
  readonly jsHeapBytes: number;
  readonly workingSetBytes: number;
}

interface RenderMeasurement {
  readonly renderedBlocks: number;
  readonly elementNodes: number;
  readonly textNodes: number;
  readonly firstUsefulMs: number;
  readonly targetReadyMs: number;
  readonly totalRenderMs: number;
  readonly maximumBatchScriptMs: number;
  readonly preferenceReflowMs: number;
}

interface ImageMeasurement {
  readonly decodedImages: number;
  readonly decodedPixels: number;
  readonly firstDecodeMs: number;
  readonly maximumDecodeMs: number;
  readonly totalDecodeMs: number;
}

interface ProductionRenderInstrumentation {
  active: boolean;
  paused: boolean;
  selectionStartedAt: number;
  resumeStartedAt: number;
  firstContentAt: number;
  completeAt: number;
  callbackDurations: number[];
  pendingBatchStartedAt: number;
  batchCommitDurations: number[];
}

async function buildProductionLimitFixture(): Promise<Uint8Array> {
  const fixtureModuleUrl = new URL(
    "../../../../packages/epub/test-support/epub-fixture.ts",
    import.meta.url,
  );
  const fixtureModule = (await import(fixtureModuleUrl.href)) as {
    buildReaderLongChapterEpubFixture(options: {
      readonly semanticBlockCount: number;
      readonly deepTargetBlockIndex: number;
    }): Promise<Uint8Array>;
  };
  return fixtureModule.buildReaderLongChapterEpubFixture({
    semanticBlockCount: 10_000,
    deepTargetBlockIndex: 8_999,
  });
}

function executeText(file: string, args: readonly string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(file, args, { encoding: "utf8" }, (error, stdout) => {
      if (error !== null) {
        reject(new Error("reader-benchmark-process-query-failed"));
        return;
      }
      resolve(stdout);
    });
  });
}

async function chromiumProcessIds(
  browser: Browser,
): Promise<readonly number[]> {
  const session = await browser.newBrowserCDPSession();
  try {
    const result = await session.send("SystemInfo.getProcessInfo");
    return result.processInfo
      .map((process) => process.id)
      .filter((processId) => Number.isSafeInteger(processId) && processId > 0);
  } finally {
    await session.detach();
  }
}

async function browserWorkingSetBytes(browser: Browser): Promise<number> {
  const processIds = await chromiumProcessIds(browser);
  const processIdList = processIds.join(",");
  const workingSetQuery = [
    `$measurement = Get-Process -Id ${processIdList} -ErrorAction SilentlyContinue | Measure-Object -Property WorkingSet64 -Sum`,
    "$sum = $measurement.Sum",
    "if ($null -eq $sum) { $sum = 0 }",
    "[Console]::Out.Write([int64]$sum)",
  ].join("; ");
  const output = await executeText("powershell.exe", [
    "-NoProfile",
    "-NonInteractive",
    "-Command",
    workingSetQuery,
  ]);
  const result = Number(output.trim());
  if (!Number.isSafeInteger(result) || result <= 0) {
    throw new Error("reader-benchmark-working-set-unavailable");
  }
  return result;
}

async function pageMemorySnapshot(
  browser: Browser,
  page: Page,
): Promise<BrowserMemorySnapshot> {
  const session = await page.context().newCDPSession(page);
  try {
    await session.send("HeapProfiler.collectGarbage");
    await session.send("Performance.enable");
    const [performanceMetrics, domCounters, workingSetBytes] =
      await Promise.all([
        session.send("Performance.getMetrics"),
        session.send("Memory.getDOMCounters"),
        browserWorkingSetBytes(browser),
      ]);
    const jsHeapBytes = performanceMetrics.metrics.find(
      (metric) => metric.name === "JSHeapUsedSize",
    )?.value;
    if (jsHeapBytes === undefined || !Number.isFinite(jsHeapBytes)) {
      throw new Error("reader-benchmark-heap-unavailable");
    }
    return Object.freeze({
      domNodes: domCounters.nodes,
      jsHeapBytes: Math.round(jsHeapBytes),
      workingSetBytes,
    });
  } finally {
    await session.detach();
  }
}

async function settlePage(page: Page): Promise<void> {
  await page.setContent(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body></body></html>',
  );
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

async function measureRender(
  page: Page,
  blockCount: number,
  mode: "complete" | "incremental",
): Promise<RenderMeasurement> {
  return page.evaluate(
    async ({ batchSizeBlocks, blockCount, mode }) => {
      const nextFrame = (): Promise<void> =>
        new Promise((resolve) => requestAnimationFrame(() => resolve()));
      const createBlock = (index: number): HTMLElement => {
        if (index % 32 === 0) {
          const heading = document.createElement("h2");
          heading.dataset.benchmarkBlock = String(index);
          heading.textContent = "Synthetic benchmark heading";
          return heading;
        }

        const paragraph = document.createElement("p");
        paragraph.dataset.benchmarkBlock = String(index);
        paragraph.append("Synthetic benchmark sentence ");
        const emphasis = document.createElement("em");
        emphasis.textContent = "with emphasis";
        paragraph.append(emphasis, " and ");
        const strong = document.createElement("strong");
        strong.textContent = "strong text";
        paragraph.append(strong, ".");
        return paragraph;
      };
      const appendRange = (
        container: HTMLElement,
        start: number,
        end: number,
      ): number => {
        const startedAt = performance.now();
        const fragment = document.createDocumentFragment();
        for (let index = start; index < end; index += 1) {
          fragment.append(createBlock(index));
        }
        container.append(fragment);
        void container.offsetHeight;
        return performance.now() - startedAt;
      };

      const reader = document.createElement("main");
      reader.setAttribute("aria-label", "Synthetic reader benchmark");
      reader.style.cssText =
        "box-sizing:border-box;margin:0 auto;max-width:42rem;padding:2rem;font:18px/1.6 system-ui;";
      document.body.style.margin = "0";
      document.body.replaceChildren(reader);

      const targetIndex = Math.max(0, Math.floor(blockCount * 0.9) - 1);
      const startedAt = performance.now();
      let firstUsefulMs = 0;
      let targetReadyMs = 0;
      let maximumBatchScriptMs = 0;

      if (mode === "complete") {
        maximumBatchScriptMs = appendRange(reader, 0, blockCount);
        await nextFrame();
        firstUsefulMs = performance.now() - startedAt;
        const target = reader.querySelector<HTMLElement>(
          `[data-benchmark-block="${targetIndex}"]`,
        );
        target?.scrollIntoView({ block: "start" });
        await nextFrame();
        targetReadyMs = performance.now() - startedAt;
      } else {
        for (let start = 0; start < blockCount; start += batchSizeBlocks) {
          const end = Math.min(blockCount, start + batchSizeBlocks);
          maximumBatchScriptMs = Math.max(
            maximumBatchScriptMs,
            appendRange(reader, start, end),
          );
          await nextFrame();
          if (start === 0) {
            firstUsefulMs = performance.now() - startedAt;
          }
          if (targetReadyMs === 0 && end > targetIndex) {
            const target = reader.querySelector<HTMLElement>(
              `[data-benchmark-block="${targetIndex}"]`,
            );
            target?.scrollIntoView({ block: "start" });
            await nextFrame();
            targetReadyMs = performance.now() - startedAt;
          }
        }
      }

      const totalRenderMs = performance.now() - startedAt;
      const target = reader.querySelector<HTMLElement>(
        `[data-benchmark-block="${targetIndex}"]`,
      );
      const reflowStartedAt = performance.now();
      reader.style.fontSize = "125%";
      reader.style.lineHeight = "1.8";
      reader.style.maxWidth = "36rem";
      target?.scrollIntoView({ block: "start" });
      void reader.offsetHeight;
      await nextFrame();
      await nextFrame();
      const preferenceReflowMs = performance.now() - reflowStartedAt;

      const textWalker = document.createTreeWalker(
        reader,
        NodeFilter.SHOW_TEXT,
      );
      let textNodes = 0;
      while (textWalker.nextNode() !== null) {
        textNodes += 1;
      }

      return {
        renderedBlocks: reader.querySelectorAll("[data-benchmark-block]")
          .length,
        elementNodes: reader.querySelectorAll("*").length,
        textNodes,
        firstUsefulMs,
        targetReadyMs,
        totalRenderMs,
        maximumBatchScriptMs,
        preferenceReflowMs,
      };
    },
    { batchSizeBlocks: BATCH_SIZE_BLOCKS, blockCount, mode },
  );
}

async function measureRenderCase(
  blockCount: number,
  mode: "complete" | "incremental",
): Promise<
  Readonly<{
    measurement: RenderMeasurement;
    baseline: BrowserMemorySnapshot;
    final: BrowserMemorySnapshot;
  }>
> {
  const browser = await chromium.launch({
    headless: true,
    args: ["--enable-precise-memory-info"],
  });
  try {
    const context = await browser.newContext({
      locale: "en-US",
      reducedMotion: "reduce",
      viewport: { width: 1_280, height: 720 },
    });
    const page = await context.newPage();
    await settlePage(page);
    const baseline = await pageMemorySnapshot(browser, page);
    const measurement = await measureRender(page, blockCount, mode);
    const final = await pageMemorySnapshot(browser, page);
    return Object.freeze({ baseline, final, measurement });
  } finally {
    await browser.close();
  }
}

async function prepareSyntheticRasterUrls(
  page: Page,
  imageCount: number,
): Promise<readonly string[]> {
  return page.evaluate(
    async ({ dimensionPixels, imageCount }) => {
      const urls: string[] = [];
      for (let index = 0; index < imageCount; index += 1) {
        const canvas = document.createElement("canvas");
        canvas.width = dimensionPixels;
        canvas.height = dimensionPixels;
        const context = canvas.getContext("2d");
        if (context === null) {
          throw new Error("reader-benchmark-canvas-unavailable");
        }
        context.fillStyle = `rgb(${index + 1}, 32, 64)`;
        context.fillRect(0, 0, dimensionPixels, dimensionPixels);
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((value) => {
            if (value === null) {
              reject(new Error("reader-benchmark-raster-encode-failed"));
              return;
            }
            resolve(value);
          }, "image/png");
        });
        urls.push(URL.createObjectURL(blob));
        canvas.width = 1;
        canvas.height = 1;
      }
      return urls;
    },
    { dimensionPixels: RASTER_DIMENSION_PIXELS, imageCount },
  );
}

async function decodeSyntheticRasters(
  page: Page,
  urls: readonly string[],
): Promise<ImageMeasurement> {
  return page.evaluate(
    async ({ dimensionPixels, urls }) => {
      const container = document.createElement("main");
      container.setAttribute("aria-label", "Synthetic image benchmark");
      document.body.append(container);
      const startedAt = performance.now();
      let firstDecodeMs = 0;
      let maximumDecodeMs = 0;

      for (const [index, url] of urls.entries()) {
        const image = new Image();
        image.alt = "";
        image.decoding = "async";
        image.src = url;
        const decodeStartedAt = performance.now();
        await image.decode();
        const decodeMs = performance.now() - decodeStartedAt;
        if (index === 0) {
          firstDecodeMs = decodeMs;
        }
        maximumDecodeMs = Math.max(maximumDecodeMs, decodeMs);
        container.append(image);
      }

      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      return {
        decodedImages: urls.length,
        decodedPixels: urls.length * dimensionPixels * dimensionPixels,
        firstDecodeMs,
        maximumDecodeMs,
        totalDecodeMs: performance.now() - startedAt,
      };
    },
    { dimensionPixels: RASTER_DIMENSION_PIXELS, urls },
  );
}

async function measureImageCase(imageCount: number): Promise<
  Readonly<{
    measurement: ImageMeasurement;
    baseline: BrowserMemorySnapshot;
    final: BrowserMemorySnapshot;
  }>
> {
  const browser = await chromium.launch({
    headless: true,
    args: ["--enable-precise-memory-info"],
  });
  try {
    const context = await browser.newContext({
      locale: "en-US",
      reducedMotion: "reduce",
      viewport: { width: 1_280, height: 720 },
    });
    const page = await context.newPage();
    await settlePage(page);
    const urls = await prepareSyntheticRasterUrls(page, imageCount);
    const baseline = await pageMemorySnapshot(browser, page);
    const measurement = await decodeSyntheticRasters(page, urls);
    const final = await pageMemorySnapshot(browser, page);
    await page.evaluate((ownedUrls) => {
      document.body.replaceChildren();
      for (const url of ownedUrls) {
        URL.revokeObjectURL(url);
      }
    }, urls);
    return Object.freeze({ baseline, final, measurement });
  } finally {
    await browser.close();
  }
}

async function measureCombinedLimitCase(): Promise<
  Readonly<{
    render: RenderMeasurement;
    images: ImageMeasurement;
    baseline: BrowserMemorySnapshot;
    final: BrowserMemorySnapshot;
  }>
> {
  const browser = await chromium.launch({
    headless: true,
    args: ["--enable-precise-memory-info"],
  });
  try {
    const context = await browser.newContext({
      locale: "en-US",
      reducedMotion: "reduce",
      viewport: { width: 1_280, height: 720 },
    });
    const page = await context.newPage();
    await settlePage(page);
    const urls = await prepareSyntheticRasterUrls(page, 8);
    const baseline = await pageMemorySnapshot(browser, page);
    const render = await measureRender(
      page,
      SELECTED_LIVE_BLOCK_LIMIT,
      "incremental",
    );
    const images = await decodeSyntheticRasters(page, urls);
    const final = await pageMemorySnapshot(browser, page);
    await page.evaluate((ownedUrls) => {
      document.body.replaceChildren();
      for (const url of ownedUrls) {
        URL.revokeObjectURL(url);
      }
    }, urls);
    return Object.freeze({ baseline, final, images, render });
  } finally {
    await browser.close();
  }
}

function rounded(value: number): number {
  return Math.round(value * 100) / 100;
}

function memoryDelta(
  baseline: BrowserMemorySnapshot,
  final: BrowserMemorySnapshot,
): Readonly<{
  domNodes: number;
  jsHeapBytes: number;
  workingSetBytes: number;
}> {
  return Object.freeze({
    domNodes: final.domNodes - baseline.domNodes,
    jsHeapBytes: Math.max(0, final.jsHeapBytes - baseline.jsHeapBytes),
    workingSetBytes: Math.max(
      0,
      final.workingSetBytes - baseline.workingSetBytes,
    ),
  });
}

function selectedCapacityFor(
  blockCount: number,
  projectedDomNodes: number,
): "chapter-too-large" | "render" {
  return blockCount <= SELECTED_LIVE_BLOCK_LIMIT &&
    projectedDomNodes <= SELECTED_LIVE_DOM_NODE_LIMIT
    ? "render"
    : "chapter-too-large";
}

test("measures complete and incremental synthetic reader profiles", async () => {
  test.skip(platform !== "win32", "The accepted benchmark host is Windows.");

  const report: unknown[] = [];
  for (const fixture of BLOCK_CASES) {
    for (const mode of ["complete", "incremental"] as const) {
      const result = await measureRenderCase(fixture.blockCount, mode);
      expect(result.measurement.renderedBlocks).toBe(fixture.blockCount);
      const delta = memoryDelta(result.baseline, result.final);
      if (fixture.label === "long" && mode === "incremental") {
        expect(result.measurement.firstUsefulMs).toBeLessThanOrEqual(
          SELECTED_FIRST_USEFUL_LIMIT_MS,
        );
        expect(result.measurement.maximumBatchScriptMs).toBeLessThanOrEqual(
          SELECTED_BATCH_SCRIPT_LIMIT_MS,
        );
        expect(result.measurement.targetReadyMs).toBeLessThanOrEqual(
          SELECTED_TARGET_READY_LIMIT_MS,
        );
        expect(result.measurement.totalRenderMs).toBeLessThanOrEqual(
          SELECTED_TOTAL_RENDER_LIMIT_MS,
        );
        expect(result.measurement.preferenceReflowMs).toBeLessThanOrEqual(
          SELECTED_REFLOW_LIMIT_MS,
        );
        expect(delta.domNodes).toBeLessThanOrEqual(
          SELECTED_LIVE_DOM_NODE_LIMIT,
        );
        expect(delta.workingSetBytes).toBeLessThanOrEqual(
          SELECTED_DOM_WORKING_SET_LIMIT_BYTES,
        );
      }
      report.push({
        fixture: fixture.label,
        blockCount: fixture.blockCount,
        mode,
        batchSizeBlocks: mode === "incremental" ? BATCH_SIZE_BLOCKS : null,
        elementNodes: result.measurement.elementNodes,
        textNodes: result.measurement.textNodes,
        firstUsefulMs: rounded(result.measurement.firstUsefulMs),
        targetReadyMs: rounded(result.measurement.targetReadyMs),
        totalRenderMs: rounded(result.measurement.totalRenderMs),
        maximumBatchScriptMs: rounded(result.measurement.maximumBatchScriptMs),
        preferenceReflowMs: rounded(result.measurement.preferenceReflowMs),
        memoryDelta: delta,
      });
    }
  }

  console.info(`READER_BLOCK_BENCHMARK ${JSON.stringify(report)}`);
});

test("measures the accepted live raster envelope sequentially", async () => {
  test.skip(platform !== "win32", "The accepted benchmark host is Windows.");

  const report: unknown[] = [];
  for (const fixture of IMAGE_CASES) {
    const result = await measureImageCase(fixture.imageCount);
    expect(result.measurement.decodedImages).toBe(fixture.imageCount);
    const delta = memoryDelta(result.baseline, result.final);
    if (fixture.label === "aggregate-near-cap") {
      expect(result.measurement.totalDecodeMs).toBeLessThanOrEqual(
        SELECTED_RASTER_DECODE_LIMIT_MS,
      );
      expect(delta.workingSetBytes).toBeLessThanOrEqual(
        SELECTED_RASTER_WORKING_SET_LIMIT_BYTES,
      );
    }
    report.push({
      fixture: fixture.label,
      imageCount: fixture.imageCount,
      imageDimensionPixels: RASTER_DIMENSION_PIXELS,
      decodedPixels: result.measurement.decodedPixels,
      firstDecodeMs: rounded(result.measurement.firstDecodeMs),
      maximumDecodeMs: rounded(result.measurement.maximumDecodeMs),
      totalDecodeMs: rounded(result.measurement.totalDecodeMs),
      memoryDelta: delta,
    });
  }

  console.info(`READER_IMAGE_BENCHMARK ${JSON.stringify(report)}`);
});

test("measures the combined selected reader capacity", async () => {
  test.skip(platform !== "win32", "The accepted benchmark host is Windows.");

  const result = await measureCombinedLimitCase();
  expect(result.render.renderedBlocks).toBe(SELECTED_LIVE_BLOCK_LIMIT);
  expect(result.images.decodedImages).toBe(8);
  const delta = memoryDelta(result.baseline, result.final);
  expect(delta.domNodes).toBeLessThanOrEqual(SELECTED_LIVE_DOM_NODE_LIMIT);
  expect(delta.workingSetBytes).toBeLessThanOrEqual(
    SELECTED_COMBINED_WORKING_SET_LIMIT_BYTES,
  );
  console.info(
    `READER_COMBINED_BENCHMARK ${JSON.stringify({
      blockCount: SELECTED_LIVE_BLOCK_LIMIT,
      imageCount: result.images.decodedImages,
      decodedPixels: result.images.decodedPixels,
      elementNodes: result.render.elementNodes,
      textNodes: result.render.textNodes,
      firstUsefulMs: rounded(result.render.firstUsefulMs),
      targetReadyMs: rounded(result.render.targetReadyMs),
      totalRenderMs: rounded(result.render.totalRenderMs),
      maximumBatchScriptMs: rounded(result.render.maximumBatchScriptMs),
      preferenceReflowMs: rounded(result.render.preferenceReflowMs),
      totalDecodeMs: rounded(result.images.totalDecodeMs),
      memoryDelta: delta,
    })}`,
  );
});

test("measures the production React renderer at the accepted chapter limit", async ({
  browser,
  context,
  page,
}) => {
  test.skip(platform !== "win32", "The accepted benchmark host is Windows.");
  test.setTimeout(180_000);

  let unexpectedRequestCount = 0;
  await context.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.origin === "http://127.0.0.1:4174") {
      await route.continue();
      return;
    }
    unexpectedRequestCount += 1;
    await route.abort("blockedbyclient");
  });
  await page.addInitScript(() => {
    const instrumentation: ProductionRenderInstrumentation = {
      active: false,
      paused: true,
      selectionStartedAt: 0,
      resumeStartedAt: 0,
      firstContentAt: 0,
      completeAt: 0,
      callbackDurations: [],
      pendingBatchStartedAt: 0,
      batchCommitDurations: [],
    };
    Object.defineProperty(
      globalThis,
      "__voxleafProductionRenderInstrumentation",
      {
        configurable: false,
        value: instrumentation,
      },
    );
    const originalRequestAnimationFrame =
      globalThis.requestAnimationFrame.bind(globalThis);
    const originalCancelAnimationFrame =
      globalThis.cancelAnimationFrame.bind(globalThis);
    const pendingCallbacks = new Map<number, FrameRequestCallback>();
    let pendingHandle = -1;
    const invoke = (callback: FrameRequestCallback) => (timestamp: number) => {
      const startedAt = performance.now();
      if (instrumentation.active) {
        instrumentation.pendingBatchStartedAt = startedAt;
      }
      callback(timestamp);
      if (instrumentation.active) {
        instrumentation.callbackDurations.push(performance.now() - startedAt);
      }
    };
    globalThis.requestAnimationFrame = (callback): number => {
      if (instrumentation.active && instrumentation.paused) {
        const handle = pendingHandle;
        pendingHandle -= 1;
        pendingCallbacks.set(handle, callback);
        return handle;
      }
      return originalRequestAnimationFrame(invoke(callback));
    };
    globalThis.cancelAnimationFrame = (handle): void => {
      if (!pendingCallbacks.delete(handle)) {
        originalCancelAnimationFrame(handle);
      }
    };
    Object.defineProperty(globalThis, "__voxleafReleaseReaderBenchmarkFrames", {
      configurable: false,
      value: () => {
        instrumentation.paused = false;
        instrumentation.resumeStartedAt = performance.now();
        const callbacks = [...pendingCallbacks.values()];
        pendingCallbacks.clear();
        for (const callback of callbacks) {
          originalRequestAnimationFrame(invoke(callback));
        }
      },
    });
  });

  try {
    await page.goto("/");
    const baseline = await pageMemorySnapshot(browser, page);
    const fixture = await buildProductionLimitFixture();
    await page.evaluate(() => {
      const instrument = (
        globalThis as typeof globalThis & {
          __voxleafProductionRenderInstrumentation: ProductionRenderInstrumentation;
        }
      ).__voxleafProductionRenderInstrumentation;
      instrument.active = true;
      instrument.paused = true;
      instrument.selectionStartedAt = performance.now();
      let previousRenderedBlocks = 0;
      const observeProgress = (): void => {
        const article = document.querySelector(".semantic-document");
        const renderedBlocks = article?.children.length ?? 0;
        if (renderedBlocks > 0 && instrument.firstContentAt === 0) {
          instrument.firstContentAt = performance.now();
        }
        if (
          renderedBlocks === 10_000 &&
          document.querySelector(".reader-rendering-status") === null
        ) {
          instrument.completeAt = performance.now();
        }
        if (
          renderedBlocks > previousRenderedBlocks &&
          previousRenderedBlocks > 0 &&
          instrument.pendingBatchStartedAt > 0
        ) {
          instrument.batchCommitDurations.push(
            performance.now() - instrument.pendingBatchStartedAt,
          );
          instrument.pendingBatchStartedAt = 0;
        }
        previousRenderedBlocks = renderedBlocks;
      };
      const observer = new MutationObserver(observeProgress);
      observer.observe(document.body, { childList: true, subtree: true });
      Object.defineProperty(globalThis, "__voxleafProductionRenderObserver", {
        configurable: true,
        value: observer,
      });
    });

    await page.getByLabel("Open a local EPUB").setInputFiles({
      name: "private-production-limit.epub",
      mimeType: "application/epub+zip",
      buffer: Buffer.from(fixture),
    });
    const article = page.getByRole("article", {
      name: "Current reading section",
    });
    await expect
      .poll(() => article.locator(":scope > *").count())
      .toBe(BATCH_SIZE_BLOCKS);
    const firstBatch = await pageMemorySnapshot(browser, page);
    await page.evaluate(() => {
      (
        globalThis as typeof globalThis & {
          __voxleafReleaseReaderBenchmarkFrames: () => void;
        }
      ).__voxleafReleaseReaderBenchmarkFrames();
    });

    const targetStartedAt = await page.evaluate(() => performance.now());
    await page
      .getByRole("navigation", { name: "Table of contents" })
      .getByRole("button", { name: "Deep target" })
      .click();
    const deepTarget = page.getByRole("heading", {
      level: 2,
      name: "Deep target",
    });
    await expect(deepTarget).toBeFocused({ timeout: 1_000 });
    const targetReadyMs =
      (await page.evaluate(() => performance.now())) - targetStartedAt;

    await expect
      .poll(() => article.locator(":scope > *").count(), {
        timeout: 2_000,
      })
      .toBe(10_000);
    await expect(page.locator(".reader-rendering-status")).toHaveCount(0);
    const instrumentation = await page.evaluate(() => {
      const instrument = (
        globalThis as typeof globalThis & {
          __voxleafProductionRenderInstrumentation: ProductionRenderInstrumentation;
          __voxleafProductionRenderObserver?: MutationObserver;
        }
      ).__voxleafProductionRenderInstrumentation;
      instrument.active = false;
      (
        globalThis as typeof globalThis & {
          __voxleafProductionRenderObserver?: MutationObserver;
        }
      ).__voxleafProductionRenderObserver?.disconnect();
      return {
        selectionStartedAt: instrument.selectionStartedAt,
        resumeStartedAt: instrument.resumeStartedAt,
        firstContentAt: instrument.firstContentAt,
        completeAt: instrument.completeAt,
        callbackDurations: [...instrument.callbackDurations],
        batchCommitDurations: [...instrument.batchCommitDurations],
      };
    });
    const final = await pageMemorySnapshot(browser, page);
    const fullDelta = memoryDelta(baseline, final);
    const incrementalDelta = memoryDelta(firstBatch, final);
    const maximumBatchScriptMs = Math.max(
      0,
      ...instrumentation.batchCommitDurations,
    );
    const maximumSchedulerCallbackMs = Math.max(
      0,
      ...instrumentation.callbackDurations,
    );
    const selectionToFirstContentMs =
      instrumentation.firstContentAt - instrumentation.selectionStartedAt;
    const incrementalAppendMs =
      instrumentation.completeAt - instrumentation.resumeStartedAt;

    const preferenceReflowMs = await page.evaluate(
      () =>
        new Promise<number>((resolve, reject) => {
          const select = document.querySelector<HTMLSelectElement>(
            'select[name="textScale"]',
          );
          if (select === null) {
            reject(new Error("reader-benchmark-preference-unavailable"));
            return;
          }
          const startedAt = performance.now();
          select.value = "large";
          select.dispatchEvent(new Event("change", { bubbles: true }));
          requestAnimationFrame(() =>
            requestAnimationFrame(() => resolve(performance.now() - startedAt)),
          );
        }),
    );

    expect(instrumentation.firstContentAt).toBeGreaterThan(0);
    expect(instrumentation.completeAt).toBeGreaterThan(
      instrumentation.firstContentAt,
    );
    expect(instrumentation.batchCommitDurations).toHaveLength(
      SELECTED_LIVE_BLOCK_LIMIT / BATCH_SIZE_BLOCKS - 1,
    );
    expect(maximumBatchScriptMs).toBeLessThanOrEqual(
      SELECTED_BATCH_SCRIPT_LIMIT_MS,
    );
    expect(targetReadyMs).toBeLessThanOrEqual(SELECTED_TARGET_READY_LIMIT_MS);
    expect(incrementalAppendMs).toBeLessThanOrEqual(
      SELECTED_TOTAL_RENDER_LIMIT_MS,
    );
    expect(preferenceReflowMs).toBeLessThanOrEqual(SELECTED_REFLOW_LIMIT_MS);
    expect(fullDelta.domNodes).toBeLessThanOrEqual(
      SELECTED_LIVE_DOM_NODE_LIMIT,
    );
    expect(incrementalDelta.workingSetBytes).toBeLessThanOrEqual(
      SELECTED_DOM_WORKING_SET_LIMIT_BYTES,
    );
    expect(fullDelta.workingSetBytes).toBeLessThanOrEqual(
      SELECTED_COMBINED_WORKING_SET_LIMIT_BYTES,
    );
    await expect(page.locator(".semantic-document [id]")).toHaveCount(0);
    await expect(page.getByText("private-production-limit.epub")).toHaveCount(
      0,
    );
    expect(unexpectedRequestCount).toBe(0);

    console.info(
      `READER_PRODUCTION_BENCHMARK ${JSON.stringify({
        blockCount: SELECTED_LIVE_BLOCK_LIMIT,
        batchSizeBlocks: BATCH_SIZE_BLOCKS,
        selectionToFirstContentMs: rounded(selectionToFirstContentMs),
        maximumSchedulerCallbackMs: rounded(maximumSchedulerCallbackMs),
        maximumBatchScriptMs: rounded(maximumBatchScriptMs),
        targetReadyMs: rounded(targetReadyMs),
        incrementalAppendMs: rounded(incrementalAppendMs),
        preferenceReflowMs: rounded(preferenceReflowMs),
        incrementalMemoryDelta: incrementalDelta,
        fullApplicationMemoryDelta: fullDelta,
      })}`,
    );
  } finally {
    await context.unroute("**/*");
  }
});

test("records exact selected reader-side capacity boundaries", () => {
  expect(BATCH_SIZE_BLOCKS).toBe(250);
  expect(SELECTED_LIVE_BLOCK_LIMIT).toBe(10_000);
  expect(SELECTED_LIVE_DOM_NODE_LIMIT).toBe(80_000);
  expect(selectedCapacityFor(10_000, 80_000)).toBe("render");
  expect(selectedCapacityFor(10_001, 80_000)).toBe("chapter-too-large");
  expect(selectedCapacityFor(10_000, 80_001)).toBe("chapter-too-large");
});
