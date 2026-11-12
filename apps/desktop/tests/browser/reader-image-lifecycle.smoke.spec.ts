import { expect, test, type Page } from "@playwright/test";
import type { ReadingLocatorV1 } from "@voxleaf/shared";
import {
  buildReaderImageLifecycleFixture,
  readerImageLifecycleCheckpoint,
} from "../fixtures/reader-image-lifecycle-fixture.mjs";
import { openSettings, closeSettings } from "./settings-helpers";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const live = new Set<string>();
    let peak = 0;
    const create = URL.createObjectURL;
    const revoke = URL.revokeObjectURL;
    URL.createObjectURL = (blob) => {
      const url = create(blob);
      live.add(url);
      peak = Math.max(peak, live.size);
      return url;
    };
    URL.revokeObjectURL = (url) => {
      live.delete(url);
      revoke(url);
    };
    Object.defineProperty(globalThis, "__rpiImageCounts", {
      value: () => ({ live: live.size, peak }),
    });
  });
});

async function openControlledRasterBook(page: Page, holdDecode: boolean) {
  await page.addInitScript((hold) => {
    const NativeObserver = IntersectionObserver;
    const registrations: Array<{
      target: Element;
      near: boolean;
      deliver(entries: IntersectionObserverEntry[]): void;
    }> = [];
    globalThis.IntersectionObserver = class extends NativeObserver {
      constructor(
        callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit,
      ) {
        super(callback, options);
        const observe = this.observe.bind(this);
        this.observe = (target) => {
          if (!target.matches(".semantic-raster-host")) {
            observe(target);
            return;
          }
          registrations.push({
            target,
            near: options?.rootMargin === "256px 0px",
            deliver: (entries) => callback(entries, this),
          });
        };
      }
    };
    const pending: Array<() => void> = [];
    let decoded = 0;
    const nativeDecode = HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode = async function () {
      await nativeDecode.call(this);
      if (!this.src.startsWith("blob:")) return;
      decoded += 1;
      if (hold) await new Promise<void>((resolve) => pending.push(resolve));
    };
    Reflect.set(globalThis, "__auditRaster", {
      decoded: () => decoded,
      registrations,
      release: () => pending.shift()?.(),
      deliver: (
        index: number,
        near: boolean,
        entries: Array<{
          time: number;
          shown: boolean;
          ratio?: number;
          foreign?: boolean;
        }>,
      ) => {
        const owners = registrations.filter((record) => record.near === near);
        const owner = owners[index]!;
        const rect = owner.target.getBoundingClientRect();
        owner.deliver(
          entries.map(({ time, shown, ratio, foreign }) => ({
            time,
            target: foreign
              ? owners[(index + 1) % owners.length]!.target
              : owner.target,
            isIntersecting: shown,
            intersectionRatio: ratio ?? (shown ? 1 : 0),
            boundingClientRect: rect,
            intersectionRect: rect,
            rootBounds: rect,
          })),
        );
      },
    });
  }, holdDecode);
  await page.goto("/");
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-controlled-images.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(await buildReaderImageLifecycleFixture()),
  });
  const hosts = page.locator(".semantic-raster-host");
  await expect(hosts).toHaveCount(12);
  await expect
    .poll(() =>
      page.evaluate(
        () => Reflect.get(globalThis, "__auditRaster").registrations.length,
      ),
    )
    .toBe(24);
  return hosts;
}

test("five-pass 1.3 full near queue promotes the ninth visible raster first", async ({
  page,
}) => {
  const hosts = await openControlledRasterBook(page, true);
  const decoded = () =>
    page.evaluate(() => Reflect.get(globalThis, "__auditRaster").decoded());
  const release = () =>
    page.evaluate(() => Reflect.get(globalThis, "__auditRaster").release());
  try {
    await page.evaluate(() => {
      const { deliver } = Reflect.get(globalThis, "__auditRaster");
      deliver(0, true, [{ time: 1, shown: true }]);
    });
    await expect.poll(decoded).toBe(1);
    await page.evaluate(() => {
      const { deliver } = Reflect.get(globalThis, "__auditRaster");
      for (let index = 1; index < 8; index += 1)
        deliver(index, true, [{ time: 1, shown: true }]);
      deliver(8, false, [{ time: 1, shown: true }]);
    });
    expect(await decoded()).toBe(1);
    await release();
    await expect(hosts.nth(0).locator("img")).toHaveAttribute(
      "alt",
      "RPI image 1",
    );
    await expect.poll(decoded).toBe(2);
    await expect(hosts.nth(8).locator("img")).toHaveCount(0);
    await release();
    await expect(hosts.nth(8).locator("img")).toHaveAttribute(
      "alt",
      "RPI image 9",
    );
    await expect(hosts.nth(1).locator("img")).toHaveCount(0);
  } finally {
    await page.getByLabel("Open a book").setInputFiles({
      name: "synthetic-invalid.epub",
      mimeType: "application/epub+zip",
      buffer: Buffer.from("invalid"),
    });
    await expect(hosts).toHaveCount(0);
    await release();
    await expect
      .poll(() =>
        page.evaluate(() => Reflect.get(globalThis, "__rpiImageCounts")().live),
      )
      .toBe(0);
  }
});

test("five-pass 2.4 latest matching raster entries govern acquisition and release", async ({
  page,
}) => {
  const hosts = await openControlledRasterBook(page, false);
  await page.evaluate(() => {
    const { deliver } = Reflect.get(globalThis, "__auditRaster");
    deliver(0, false, [
      { time: 20, shown: false },
      { time: 10, shown: true },
      { time: 30, shown: true, foreign: true },
    ]);
    deliver(0, true, [
      { time: 10, shown: true },
      { time: 20, shown: false },
    ]);
    deliver(1, false, [
      { time: 20, shown: true },
      { time: 10, shown: false },
    ]);
    deliver(1, true, [
      { time: 20, shown: false },
      { time: 10, shown: true },
    ]);
  });
  await expect(hosts.nth(1).locator("img")).toHaveAttribute(
    "alt",
    "RPI image 2",
  );
  const decoded = () =>
    page.evaluate(() => Reflect.get(globalThis, "__auditRaster").decoded());
  expect(await decoded()).toBe(1);
  await expect(hosts.nth(0).locator("img")).toHaveCount(0);
  await page.evaluate(() => {
    const { deliver } = Reflect.get(globalThis, "__auditRaster");
    deliver(1, false, [
      { time: 30, shown: true },
      { time: 30, shown: false },
    ]);
    deliver(0, true, [
      { time: 30, shown: false },
      { time: 30, shown: false, ratio: 0.25 },
    ]);
  });
  await expect(hosts.nth(1).locator("img")).toHaveCount(0);
  await expect(hosts.nth(0).locator("img")).toHaveAttribute(
    "alt",
    "RPI image 1",
  );
  expect(await decoded()).toBe(2);
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-invalid.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from("invalid"),
  });
  await expect(hosts).toHaveCount(0);
  await page.evaluate(async () => {
    const { deliver } = Reflect.get(globalThis, "__auditRaster");
    deliver(1, false, [{ time: 50, shown: true }]);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
  });
  expect(await decoded()).toBe(2);
  expect(
    await page.evaluate(
      () => Reflect.get(globalThis, "__rpiImageCounts")().live,
    ),
  ).toBe(0);
});

test("RPI-02 loads later images and reloads released earlier occurrences", async ({
  page,
  context,
}) => {
  let externalRequests = 0;
  let errors = 0;
  page.on("pageerror", () => {
    errors += 1;
  });
  await context.route("**/*", async (route) => {
    if (new URL(route.request().url()).origin === "http://127.0.0.1:4173")
      await route.continue();
    else {
      externalRequests += 1;
      await route.abort();
    }
  });
  await page.goto("/");
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-image-lifecycle.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(await buildReaderImageLifecycleFixture()),
  });
  await expect(page.locator(".semantic-raster-host")).toHaveCount(12);
  let firstSource: string | null = null;
  for (let index = 0; index < 12; index += 1) {
    const host = page.locator(".semantic-raster-host").nth(index);
    await host.evaluate((element) =>
      element.scrollIntoView({ block: "center" }),
    );
    const image = host.locator("img");
    await expect(image).toBeVisible();
    await expect
      .poll(() =>
        image.evaluate(
          (element) =>
            element instanceof HTMLImageElement &&
            element.complete &&
            element.naturalWidth > 0,
        ),
      )
      .toBe(true);
    if (index === 0) firstSource = await image.getAttribute("src");
  }
  const first = page.locator(".semantic-raster-host").first();
  await expect(first.locator("img")).toHaveCount(0);
  await first.evaluate((element) =>
    element.scrollIntoView({ block: "center" }),
  );
  await expect(first.locator("img")).toBeVisible();
  expect(await first.locator("img").getAttribute("src")).not.toBe(firstSource);
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-invalid.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from("invalid"),
  });
  await expect(page.locator(".semantic-raster-host")).toHaveCount(0);
  const counts = await page.evaluate(() =>
    (
      globalThis as typeof globalThis & {
        __rpiImageCounts(): { live: number; peak: number };
      }
    ).__rpiImageCounts(),
  );
  expect(counts.live).toBe(0);
  expect(counts.peak).toBeLessThanOrEqual(8);
  expect(externalRequests).toBe(0);
  expect(errors).toBe(0);
});

test("RPI-02 preserves the responsive footprint through eviction and real reload", async ({
  page,
}) => {
  await page.goto("/");
  const png = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 240;
    canvas.getContext("2d")!.fillRect(0, 0, 480, 240);
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((value) => resolve(value!), "image/png"),
    );
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-geometry.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await buildReaderImageLifecycleFixture(Uint8Array.from(png)),
    ),
  });
  const first = page.locator(".semantic-raster-host").first();
  await expect(first.locator("img")).toBeVisible();
  const measure = () =>
    first.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return {
        width: bounds.width,
        height: bounds.height,
        passageDistance:
          element.parentElement!.nextElementSibling!.getBoundingClientRect()
            .top - bounds.top,
      };
    });
  const original = await measure();
  expect(original.width).toBe(480);
  await page
    .locator(".semantic-raster-host")
    .last()
    .evaluate((element) => element.scrollIntoView({ block: "center" }));
  await expect(first.locator("img")).toHaveCount(0);
  const evicted = await measure();
  expect(evicted.width).toBe(original.width);
  expect(evicted.height).toBe(original.height);
  expect(evicted.passageDistance).toBeCloseTo(original.passageDistance, 0);
  await page.setViewportSize({ width: 360, height: 640 });
  await expect
    .poll(async () => (await measure()).width)
    .toBeLessThan(original.width);
  const narrow = await measure();
  expect(narrow.width / narrow.height).toBeCloseTo(2, 1);
  // Let the viewport-preservation transaction settle before the next explicit
  // test scroll; otherwise the test competes with its own resize operation.
  await page.waitForTimeout(650);
  await first.evaluate((element) =>
    element.scrollIntoView({ block: "center" }),
  );
  await expect(first.locator("img")).toBeVisible();
  const reloaded = await measure();
  expect(reloaded.width).toBeCloseTo(narrow.width, 1);
  expect(reloaded.height).toBeCloseTo(narrow.height, 1);
  expect(reloaded.passageDistance).toBeCloseTo(narrow.passageDistance, 0);
});

for (const [forcedFallback, delayedImages] of [
  [false, false],
  [true, false],
  [false, true],
] as const) {
  test(`RPI-01/C1 preserves canonical progress through image and appearance layout (forced fallback: ${forcedFallback}, delayed images: ${delayedImages})`, async ({
    page,
    context,
  }) => {
    test.setTimeout(30_000);
    let externalRequests = 0;
    let errors = 0;
    page.on("pageerror", () => {
      errors += 1;
    });
    await context.route("**/*", async (route) => {
      if (new URL(route.request().url()).origin === "http://127.0.0.1:4173")
        await route.continue();
      else {
        externalRequests += 1;
        await route.abort();
      }
    });
    const bytes = await buildReaderImageLifecycleFixture();
    const initial = await readerImageLifecycleCheckpoint(bytes);
    await page.addInitScript(
      ({ force, delayImages }) => {
        let releaseImages = () => {};
        const imageGate = delayImages
          ? new Promise<void>((resolve) => {
              releaseImages = resolve;
            })
          : Promise.resolve();
        Object.defineProperty(globalThis, "__rpiReleaseImages", {
          value: releaseImages,
        });
        const decode = HTMLImageElement.prototype.decode;
        HTMLImageElement.prototype.decode = async function () {
          await decode.call(this);
          await imageGate;
        };
        const state = { force, observations: 0 };
        Object.defineProperty(globalThis, "__rpiRange", { value: state });
        const original = Range.prototype.getClientRects;
        Range.prototype.getClientRects = function () {
          if (
            state.force &&
            this.startContainer.parentElement
              ?.closest("p")
              ?.textContent?.startsWith("RPI passage 8.")
          ) {
            state.observations += 1;
            throw new Error("synthetic-rpi-range-unavailable");
          }
          return original.call(this);
        };
      },
      { force: forcedFallback, delayImages: delayedImages },
    );
    await page.goto("/");
    await page.evaluate((locator) => {
      localStorage.setItem(
        "voxleaf.reader.positions",
        JSON.stringify({
          schemaVersion: 1,
          states: [
            {
              schemaVersion: 1,
              bookIdentity: locator.bookIdentity,
              locator,
              preferences: {},
            },
          ],
        }),
      );
    }, initial);
    const select = async () => {
      await page.getByLabel("Open a book").setInputFiles({
        name: "synthetic-rpi.epub",
        mimeType: "application/epub+zip",
        buffer: Buffer.from(bytes),
      });
      await expect(page.locator(".semantic-reader")).toBeVisible();
      await expect(page.locator(".semantic-reader")).not.toHaveAttribute(
        "aria-busy",
        "true",
      );
      await page.evaluate(() =>
        (
          globalThis as typeof globalThis & { __rpiReleaseImages(): void }
        ).__rpiReleaseImages(),
      );
    };
    const saved = (): Promise<ReadingLocatorV1> =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("voxleaf.reader.positions")!)
            .states[0].locator,
      );
    const settle = async () => {
      // Observe beyond the existing passive debounce, so an unwanted delayed
      // write cannot pass just because the prior checkpoint is still stored.
      await page.waitForTimeout(650);
    };
    await select();
    await settle();
    if (forcedFallback)
      expect(
        await page.evaluate(
          () =>
            (
              globalThis as typeof globalThis & {
                __rpiRange: { observations: number };
              }
            ).__rpiRange.observations,
        ),
      ).toBeGreaterThan(0);
    expect(await saved()).toEqual(initial);
    const settings = await openSettings(page);
    for (const [label, value] of [
      ["Text size", "large"],
      ["Line spacing", "spacious"],
      ["Content width", "wide"],
      ["Theme", "dark"],
    ]) {
      await settings.getByLabel(label!).selectOption(value!);
      await settle();
      expect(await saved()).toEqual(initial);
    }
    await closeSettings(page, settings);
    await page.setViewportSize({ width: 760, height: 560 });
    await settle();
    await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
    expect(await saved()).toEqual(initial);
    await page.reload();
    await select();
    await settle();
    expect(await saved()).toEqual(initial);
    await page.evaluate(() => {
      (
        globalThis as typeof globalThis & { __rpiRange: { force: boolean } }
      ).__rpiRange.force = false;
    });
    const viewport = page.locator('[data-reader-scroll-owner="true"]');
    // These fixture paragraphs have consecutive canonical anchors. Place the
    // reading line inside the next one: a fixed wheel distance can land in a
    // gap whose nearest block is still the original visual fallback.
    const nextParagraph = page
      .locator(".semantic-document p")
      .filter({ hasText: "RPI passage 8." })
      .nth(1);
    const wheelDistance = await nextParagraph.evaluate((element) => {
      const root = element.closest<HTMLElement>(
        '[data-reader-scroll-owner="true"]',
      )!;
      const readingLine =
        root.getBoundingClientRect().top + root.clientTop + 24;
      return element.getBoundingClientRect().top - readingLine + 24;
    });
    await viewport.hover();
    await page.mouse.wheel(0, wheelDistance);
    await expect
      .poll(() =>
        nextParagraph.evaluate((element) => {
          const root = element.closest<HTMLElement>(
            '[data-reader-scroll-owner="true"]',
          )!;
          const line = root.getBoundingClientRect().top + root.clientTop + 24;
          const bounds = element.getBoundingClientRect();
          return bounds.top < line && bounds.bottom > line;
        }),
      )
      .toBe(true);
    await expect.poll(saved).toMatchObject({
      anchor: { anchorIndex: initial.anchor.anchorIndex + 1 },
    });
    await settle();
    const intentional = await saved();
    await page.reload();
    await select();
    await settle();
    expect(await saved()).toEqual(intentional);
    expect(externalRequests).toBe(0);
    expect(errors).toBe(0);
  });
}
