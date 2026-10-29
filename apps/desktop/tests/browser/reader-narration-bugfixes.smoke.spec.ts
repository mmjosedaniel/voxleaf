import { expect, test, type Page } from "@playwright/test";
import type { NarrationSegmentV1 } from "@voxleaf/shared";
import report from "../../../../packages/shared/fixtures/contracts/host-profile-compatibility-report/v1/valid-synthetic.json" with { type: "json" };

import { closeSettings, openSettings } from "./settings-helpers";

async function fixtures() {
  return import(
    new URL(
      "../../../../packages/epub/test-support/epub-fixture.ts",
      import.meta.url,
    ).href
  ) as Promise<{
    buildReaderRasterEpubFixture(options: {
      delayedViewport: boolean;
    }): Promise<Uint8Array>;
    syntheticStaticPngBytes(): Uint8Array;
    buildMinimalEpubFixture(options: {
      chapterDocument: string;
      packageDocument?: string;
      navigationDocument?: string;
      additionalEntries?: { name: string; content: string | Uint8Array }[];
    }): Promise<Uint8Array>;
  }>;
}

test("SAF-09 an obsolete Chatterbox selection cannot replace B's playing Piper owner", async ({
  page,
}) => {
  await installSyntheticService(page, false, false, false, true, false, true);
  await page.goto("/");
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").audioFrames = 480_000;
  });
  const open = async (book: string) =>
    page.getByLabel("Open a book").setInputFiles({
      name: `synthetic-saf-${book}.epub`,
      mimeType: "application/epub+zip",
      buffer: Buffer.from(
        await (
          await fixtures()
        ).buildMinimalEpubFixture({
          chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic ${book}</title></head><body>${`<p>Synthetic book ${book} passage with quiet paths and ordinary details.</p>`.repeat(60)}</body></html>`,
        }),
      ),
    });
  await open("A");
  const settings = await openSettings(page);
  await settings.getByRole("radio", { name: /Chatterbox/ }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () => Reflect.get(globalThis, "__rnb").optionalSelectionPending,
      ),
    )
    .toBe(true);
  await closeSettings(page, settings);
  await open("B");
  await expect(page.locator(".semantic-document p").first()).toContainText(
    "book B",
  );
  await page.locator('[data-narration-action="play"]').click();
  const narration = page.locator(".product-narration");
  await expect(narration).toHaveAttribute("data-narration-phase", "playing");
  const piper = "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1";
  await expect(narration).toHaveAttribute("data-narration-profile", piper);
  const owner = () =>
    page.evaluate(() => {
      const state = Reflect.get(globalThis, "__rnb");
      return {
        service: state.service,
        generation: state.lastGeneration,
        shutdowns: state.shutdownCalls,
        preference: localStorage.getItem("voxleaf.tts.profile-preference"),
      };
    });
  const before = await owner();
  expect(before.generation).not.toBe("");
  await page.evaluate(async () => {
    Reflect.get(globalThis, "__rnb").releaseOptionalSelection();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
  await expect
    .poll(() =>
      page.evaluate(
        () => Reflect.get(globalThis, "__rnb").optionalSelectionPending,
      ),
    )
    .toBe(false);
  expect(await owner()).toEqual(before);
  await expect(narration).toHaveAttribute("data-narration-profile", piper);
  await expect(narration).toHaveAttribute("data-narration-phase", "playing");
  await page.locator('[data-narration-action="stop"]').click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = Reflect.get(globalThis, "__rnb");
        return state.created - state.closed;
      }),
    )
    .toBe(0);
});

test("SAF-15 decorative ready and unavailable rasters have no Chromium image role", async ({
  page,
}) => {
  const fixture = await fixtures();
  await page.goto("/");
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-saf-decorative.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await fixture.buildMinimalEpubFixture({
        packageDocument:
          '<package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/" version="3.0" unique-identifier="pub-id"><metadata><dc:identifier id="pub-id">urn:synthetic:saf-decorative</dc:identifier><dc:title>Synthetic decorative images</dc:title><dc:language>en</dc:language><meta property="dcterms:modified">2026-07-22T00:00:00Z</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/><item id="image" href="images/cover.png" media-type="image/png"/><item id="broken" href="images/broken.png" media-type="image/png"/></manifest><spine><itemref idref="chapter"/></spine></package>',
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Synthetic images</title></head><body><p>Decorative <img src="../images/cover.png" alt=""/> and unavailable <img src="../images/broken.png" alt="  "/>.</p><p>Missing <img src="../images/cover.png"/> and named <img src="../images/cover.png" alt="Synthetic named image"/>.</p></body></html>',
        additionalEntries: [
          {
            name: "EPUB/images/cover.png",
            content: fixture.syntheticStaticPngBytes(),
          },
          { name: "EPUB/images/broken.png", content: Uint8Array.of(0, 1, 2) },
        ],
      }),
    ),
  });
  const reader = page.locator(".semantic-document");
  await expect(reader.locator("img")).toHaveCount(3);
  await expect(reader.locator('img[alt=""]')).toHaveCount(1);
  await expect(reader.locator(".semantic-raster-unavailable")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  await expect(reader.getByRole("img")).toHaveCount(2);
  await expect(
    reader.getByRole("img", { name: "Publication image", exact: true }),
  ).toBeVisible();
  await expect(
    reader.getByRole("img", { name: "Synthetic named image", exact: true }),
  ).toBeVisible();
  expect(
    await reader
      .locator('img[alt=""]')
      .evaluate((image) => (image as HTMLImageElement).naturalWidth),
  ).toBe(1);
});

test("RAC-01 delayed handoff starts B at the passage observed during A shutdown", async ({
  page,
}) => {
  await installSyntheticService(page, false, false, false, true);
  await page.setViewportSize({ width: 640, height: 480 });
  await page.goto("/");
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").audioFrames = 480_000;
  });
  const open = async (replacement: boolean) =>
    page.getByLabel("Open a book").setInputFiles({
      name: replacement ? "synthetic-rac-b.epub" : "synthetic-rac-a.epub",
      mimeType: "application/epub+zip",
      buffer: Buffer.from(
        await (
          await fixtures()
        ).buildMinimalEpubFixture({
          chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body>${Array.from({ length: 60 }, (_, i) => `<p>${replacement && i === 25 ? "Target passage for replacement." : `Synthetic ${replacement ? "replacement" : "original"} passage with quiet paths and ordinary details.`}</p>`).join("")}</body></html>`,
        }),
      ),
    });
  await open(false);
  await page.locator('[data-narration-action="play"]').click();
  await expect(page.locator(".product-narration")).toHaveAttribute(
    "data-narration-phase",
    "playing",
  );
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").deferShutdown = true;
  });
  await open(true);
  await expect(page.locator(".semantic-document p").nth(25)).toHaveText(
    "Target passage for replacement.",
  );
  await expect(page.locator(".semantic-reader")).not.toHaveAttribute(
    "aria-busy",
    "true",
  );
  await expect
    .poll(() =>
      page.evaluate(() => Reflect.get(globalThis, "__rnb").shutdownPending),
    )
    .toBe(true);
  await page.evaluate(async () => {
    const viewport = document.querySelector<HTMLElement>(".reader-viewport")!;
    const target = document.querySelectorAll(".semantic-document p")[25]!;
    viewport.scrollTop +=
      target.getBoundingClientRect().top -
      viewport.getBoundingClientRect().top -
      24;
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
  await expect(page.locator('[data-narration-action="play"]')).toHaveCount(0);
  await page.evaluate(() => {
    const state = Reflect.get(globalThis, "__rnb");
    state.prepared.length = 0;
    state.deferShutdown = false;
    state.releaseShutdown();
  });
  await page.locator('[data-narration-action="play"]').click();
  await expect
    .poll(() =>
      page.evaluate(() => Reflect.get(globalThis, "__rnb").prepared[0]?.text),
    )
    .toBe("Target passage for replacement.");
  await page.locator('[data-narration-action="stop"]').click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = Reflect.get(globalThis, "__rnb");
        return state.created - state.closed;
      }),
    )
    .toBe(0);
});

test("RAC-07 mid-unit Resume follows the active range once and preserves inspection", async ({
  page,
}) => {
  await installSyntheticService(page, false, false, false, true);
  await page.setViewportSize({ width: 640, height: 480 });
  await page.goto("/");
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").audioFrames = 480_000;
  });
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-rac-resume.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body>${"<p>Synthetic passage with quiet paths and ordinary details.</p>".repeat(80)}</body></html>`,
      }),
    ),
  });
  const narration = page.locator(".product-narration");
  await page.locator('[data-narration-action="play"]').click();
  await expect(narration).toHaveAttribute("data-narration-phase", "playing");
  await page.locator('[data-narration-action="pause"]').click();
  await expect(narration).toHaveAttribute("data-narration-phase", "paused");
  const focus = page.getByRole("button", {
    name: "Show table of contents",
    exact: true,
  });
  await focus.focus();
  await page.evaluate(() => {
    const range = document.createRange();
    const text = document.querySelector(".semantic-document p")!.firstChild!;
    range.setStart(text, 0);
    range.setEnd(text, 9);
    getSelection()!.removeAllRanges();
    getSelection()!.addRange(range);
    const viewport = document.querySelector<HTMLElement>(".reader-viewport")!;
    viewport.scrollTop = viewport.scrollHeight;
  });
  const visible = () =>
    page.evaluate(() => {
      const highlight = CSS.highlights.get("voxleaf-narration-active");
      const range = highlight?.values().next().value as Range | undefined;
      if (!range) return false;
      const rect = range.getBoundingClientRect();
      const viewport = document
        .querySelector(".reader-viewport")!
        .getBoundingClientRect();
      return rect.top >= viewport.top && rect.bottom <= viewport.bottom;
    });
  await expect.poll(visible).toBe(false);
  await page
    .locator('[data-narration-action="resume"]')
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(narration).toHaveAttribute("data-narration-phase", "playing");
  await expect.poll(visible).toBe(true);
  await expect(focus).toBeFocused();
  expect(await page.evaluate(() => getSelection()?.toString())).toBe(
    "Synthetic",
  );
  const playbackBefore = Number(
    await narration.getAttribute("data-narration-playback-ms"),
  );
  await page.evaluate(() => {
    const viewport = document.querySelector<HTMLElement>(".reader-viewport")!;
    viewport.scrollTop = viewport.scrollHeight;
  });
  await expect
    .poll(() =>
      narration.getAttribute("data-narration-playback-ms").then(Number),
    )
    .toBeGreaterThan(playbackBefore);
  await expect.poll(visible).toBe(false);
  await page.locator('[data-narration-action="stop"]').click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = Reflect.get(globalThis, "__rnb");
        return state.created - state.closed;
      }),
    )
    .toBe(0);
});

test("VCA-06/09 paused next and previous place exact interior offsets without audio or stale preparation", async ({
  page,
}) => {
  await installSyntheticService(page, false, false, false, true);
  await page.setViewportSize({ width: 640, height: 480 });
  await page.goto("/");
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-vca.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body><p>${"Synthetic garden 🌿 with quiet paths and ordinary details. ".repeat(140)}</p></body></html>`,
      }),
    ),
  });
  const narration = page.locator(".product-narration");
  await page.locator('[data-narration-action="play"]').click();
  await expect(narration).toHaveAttribute("data-narration-phase", "playing");
  await page.locator('[data-narration-action="pause"]').click();
  await page.locator('[data-narration-action="details-toggle"]').click();
  await expect
    .poll(() =>
      page.evaluate(() => Reflect.get(globalThis, "__rnb").prepared.length),
    )
    .toBeGreaterThan(12);
  const offsets: number[] = await page.evaluate(() =>
    Reflect.get(globalThis, "__rnb").prepared.map(
      (entry: { offset: number }) => entry.offset,
    ),
  );
  const savedCheckpoint = () =>
    page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("voxleaf.reader.positions") ?? "{}")
          .states?.[0]?.locator,
    );
  const heardCheckpoint = await savedCheckpoint();
  let previousIndex = 0;
  let stoppedCalls: number | undefined;
  const focus = page.getByRole("button", {
    name: "Show table of contents",
    exact: true,
  });
  expect(
    await page.evaluate(() => {
      const viewport = document.querySelector<HTMLElement>(".reader-viewport")!;
      return (
        document.querySelector(".semantic-document p")!.getBoundingClientRect()
          .height >
        viewport.clientHeight * 3
      );
    }),
  ).toBe(true);
  for (const index of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 11, 10]) {
    const button = page.locator(
      `[data-narration-action="${index > previousIndex ? "next" : "previous"}-passage"]`,
    );
    await focus.focus();
    await page.evaluate(() => {
      const text = document.querySelector(".semantic-document p")!.firstChild!;
      const range = document.createRange();
      range.setStart(text, 0);
      range.setEnd(text, 9);
      const selection = getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);
    });
    await button.evaluate((element: HTMLButtonElement) => element.click());
    await expect(narration).toHaveAttribute(
      "data-narration-navigation-settling",
      "false",
    );
    await expect
      .poll(() =>
        page.evaluate((offset) => {
          const viewport =
            document.querySelector<HTMLElement>(".reader-viewport")!;
          const bounds = viewport.getBoundingClientRect();
          const walker = document.createTreeWalker(
            document.querySelector(".semantic-document p")!,
            NodeFilter.SHOW_TEXT,
          );
          let remaining = offset;
          for (
            let node = walker.nextNode();
            node !== null;
            node = walker.nextNode()
          ) {
            const points = Array.from(node.textContent!);
            if (remaining >= points.length) {
              remaining -= points.length;
              continue;
            }
            const utf16 = points.slice(0, remaining).join("").length;
            const range = document.createRange();
            range.setStart(node, utf16);
            range.setEnd(node, utf16 + points[remaining]!.length);
            const rect = range.getBoundingClientRect();
            return rect.top >= bounds.top && rect.bottom <= bounds.bottom;
          }
          return false;
        }, offsets[index]!),
      )
      .toBe(true);
    expect(await savedCheckpoint()).toEqual(heardCheckpoint);
    await expect(focus).toBeFocused();
    expect(await page.evaluate(() => getSelection()?.toString())).toBe(
      "Synthetic",
    );
    await expect(narration).toHaveAttribute(
      "data-narration-play-intent",
      "paused",
    );
    await expect(narration).toHaveAttribute("data-narration-playable-ms", "0");
    await expect(narration).toHaveAttribute(
      "data-narration-retained-units",
      "0",
    );
    await expect(
      page.locator('[data-narration-action="resume"]'),
    ).toBeEnabled();
    await expect(
      page.locator('[data-narration-action="play-available"]'),
    ).toHaveCount(0);
    const calls = await page.evaluate(
      () => Reflect.get(globalThis, "__rnb").calls,
    );
    if (stoppedCalls !== undefined) expect(calls).toBe(stoppedCalls);
    stoppedCalls = calls;
    previousIndex = index;
  }
  // The fixture deliberately caps retained observations at sixteen entries.
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").prepared.length = 0;
  });
  await page.locator('[data-narration-action="resume"]').click();
  await expect
    .poll(() =>
      page.evaluate(() => Reflect.get(globalThis, "__rnb").prepared[0]?.offset),
    )
    .toBe(offsets[previousIndex]);
  await expect
    .poll(() => page.evaluate(() => Reflect.get(globalThis, "__rnb").calls))
    .toBeGreaterThan(stoppedCalls!);
  await page.locator('[data-narration-action="stop"]').click();
});

test("CHAT-AUDIT shared fallback, hidden root, unknown language and loaded-session recheck", async ({
  page,
}) => {
  await installSyntheticService(page, false, false, false, true);
  await page.goto("/");
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").audioFrames = 360_000;
  });
  const packageDocument =
    '<package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/" version="3.0" unique-identifier="pub-id"><metadata><dc:identifier id="pub-id">urn:synthetic:chat-audit</dc:identifier><dc:title>Synthetic audit</dc:title><dc:language>en</dc:language><meta property="dcterms:modified">2026-07-22T00:00:00Z</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/><item id="a" href="a.bin" media-type="application/x-synthetic" fallback="chapter"/><item id="b" href="b.bin" media-type="application/x-synthetic" fallback="chapter"/><item id="hidden" href="text/hidden.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="hidden"/><itemref idref="a"/><itemref idref="b"/></spine></package>';
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-audit.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        packageDocument,
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml" lang="EN" xml:lang="en"><head><title>Synthetic</title></head><body><p id="chapter-one">0.25 % 12:14:30</p><p lang="">25 % <em>14:30</em></p></body></html>',
        additionalEntries: [
          { name: "EPUB/a.bin", content: "a" },
          { name: "EPUB/b.bin", content: "b" },
          {
            name: "EPUB/text/hidden.xhtml",
            content:
              '<html xmlns="http://www.w3.org/1999/xhtml" hidden=""><head><title>Hidden</title></head><body><p>Hidden audit sentinel</p></body></html>',
          },
        ],
      }),
    ),
  });
  await expect(page.getByRole("status")).toHaveText(
    "The EPUB opened successfully.",
  );
  await expect(page.locator(".semantic-document")).not.toContainText(
    "Hidden audit sentinel",
  );
  await page.locator('[data-narration-action="play"]').click();
  const narration = page.locator(".product-narration");
  await expect(narration).toHaveAttribute("data-narration-phase", "playing");
  await expect
    .poll(() =>
      page.evaluate(() =>
        Reflect.get(globalThis, "__rnb").prepared.map(
          (value: { text: string }) => value.text,
        ),
      ),
    )
    .toEqual([
      "0.25 % 12:14:30",
      "25 % 14:30",
      "0.25 % 12:14:30",
      "25 % 14:30",
    ]);
  expect(
    await page.evaluate(() =>
      Reflect.get(globalThis, "__rnb").prepared.map(
        (value: { spine: number }) => value.spine,
      ),
    ),
  ).toEqual([1, 1, 2, 2]);
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").hostReport.memory.availablePhysicalMiB = {
      status: "known",
      value: 1,
    };
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect
    .poll(() => page.evaluate(() => Reflect.get(globalThis, "__rnb").probes))
    .toBeGreaterThanOrEqual(2);
  await expect(narration).toHaveAttribute("data-narration-phase", "playing");
  expect(
    await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
  ).toBe(1);
  await page.locator('[data-narration-action="stop"]').click();
  await expect(narration).toHaveAttribute("data-narration-phase", "idle");
});

test("VAF optional recheck reconciles the loaded profile and traps keyboard focus while pending", async ({
  page,
}) => {
  await installSyntheticService(page, false, false, false, true, true);
  await page.goto("/");
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").audioFrames = 360_000;
  });
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-vaf.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body><p>Synthetic first passage.</p><p>Synthetic second passage.</p></body></html>',
      }),
    ),
  });
  await page.locator('[data-narration-action="play"]').click();
  const narration = page.locator(".product-narration");
  await expect(narration).toHaveAttribute("data-narration-phase", "playing");
  await expect(narration).toHaveAttribute("data-narration-profile", /piper/);
  const settings = await openSettings(page);
  for (const changed of [false, true]) {
    await page.evaluate((changed) => {
      const state = Reflect.get(globalThis, "__rnb");
      state.deferProbe = true;
      if (changed)
        state.hostReport.providers.cuda.availableDedicatedMemoryMiB.value = 9216;
    }, changed);
    await settings
      .getByRole("button", {
        name: "Recheck device compatibility",
        exact: true,
      })
      .click();
    await expect(
      settings.getByRole("button", { name: "Check compatibility again" }),
    ).toBeDisabled();
    const summary = settings.getByText("Measured profile reasons", {
      exact: true,
    });
    await summary.focus();
    await page.keyboard.press("Tab");
    await expect(
      settings.getByRole("button", { name: "Close Settings" }),
    ).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(summary).toBeFocused();
    await expect(narration).toHaveAttribute("data-narration-phase", "playing");
    await page.evaluate(() => Reflect.get(globalThis, "__rnb").releaseProbe());
    await expect(
      settings.getByRole("button", { name: "Check compatibility again" }),
    ).toBeEnabled();
    await expect(
      settings.locator(".hardware-compatibility").first(),
    ).toHaveAttribute(
      "data-compatibility-profile",
      changed ? /chatterbox/ : /piper/,
    );
    await expect(narration).toHaveAttribute(
      "data-narration-phase",
      changed ? "idle" : "playing",
    );
    await expect(narration).toHaveAttribute(
      "data-narration-profile",
      changed ? /chatterbox/ : /piper/,
    );
    expect(
      await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
    ).toBe(1);
  }
  expect(
    await page.evaluate(
      () => Reflect.get(globalThis, "__rnb").optionalMutations,
    ),
  ).toEqual([]);
  await closeSettings(page, settings);
});

for (const paused of [false, true])
  test(`CHAT-AUDIT failed synthesis removes dead controls and supports explicit recovery (paused=${paused})`, async ({
    page,
  }) => {
    await installSyntheticService(page, false, false, false, true);
    await page.goto("/");
    await page.evaluate(() => {
      const state = Reflect.get(globalThis, "__rnb");
      state.audioFrames = 360_000;
      state.holdAfter = 1;
    });
    await page.getByLabel("Open a book").setInputFiles({
      name: "synthetic-failure.epub",
      mimeType: "application/epub+zip",
      buffer: Buffer.from(
        await (
          await fixtures()
        ).buildMinimalEpubFixture({
          chapterDocument:
            '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Synthetic</title></head><body><p>First synthetic passage.</p><p>Second synthetic passage.</p></body></html>',
        }),
      ),
    });
    await page.locator('[data-narration-action="play"]').click();
    const narration = page.locator(".product-narration");
    await expect(narration).toHaveAttribute("data-narration-phase", "playing");
    await expect
      .poll(() => page.evaluate(() => Reflect.get(globalThis, "__rnb").blocked))
      .toBe(true);
    if (paused) await page.locator('[data-narration-action="pause"]').click();
    await page.evaluate(() => Reflect.get(globalThis, "__rnb").failSynthesis());
    await expect(narration).toHaveAttribute(
      "data-narration-recovery-phase",
      "recovery-available",
    );
    await expect(page.locator('[data-narration-action="pause"]')).toHaveCount(
      0,
    );
    await expect(page.locator('[data-narration-action="resume"]')).toHaveCount(
      0,
    );
    await page.evaluate(() => {
      Reflect.get(globalThis, "__rnb").holdAfter = Number.MAX_SAFE_INTEGER;
    });
    await page.locator('[data-narration-action="recover"]').click();
    await expect(narration).toHaveAttribute("data-narration-phase", "playing");
    await page.locator('[data-narration-action="stop"]').click();
    await expect(narration).toHaveAttribute("data-narration-phase", "idle");
  });

test("CHAT-AUDIT real bundled worklet preserves FIFO ownership through an ended/Pause race", async ({
  page,
}) => {
  await installSyntheticService(page, true, false, true);
  await page.goto("/");
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-worklet-race.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Synthetic</title></head><body><p>${"synthetic ".repeat(160)}</p></body></html>`,
      }),
    ),
  });
  await page.getByLabel("Playback speed", { exact: true }).selectOption("75");
  await page.locator('[data-narration-action="play"]').click();
  await expect
    .poll(() =>
      page.evaluate(() => Reflect.get(globalThis, "__rnb").workletEnded),
    )
    .toBe(true);
  await page.locator('[data-narration-action="pause"]').click();
  await expect
    .poll(() =>
      page.evaluate(() => Reflect.get(globalThis, "__rnb").workletFailed),
    )
    .toBe(true);
  await page.locator('[data-narration-action="resume"]').click();
  const order = await page.evaluate(() => {
    const state = Reflect.get(globalThis, "__rnb");
    const order = state.workletMessages.slice();
    state.releaseWorkletMessages();
    return order;
  });
  expect(order.indexOf("ended")).toBeLessThan(order.indexOf("failed"));
  expect(
    await page.evaluate(
      () => Reflect.get(globalThis, "__rnb").failedDeliveredToSequence,
    ),
  ).toBeGreaterThan(0);
  const narration = page.locator(".product-narration");
  await expect(narration).toHaveAttribute("data-narration-phase", "playing");
  await expect(narration).toHaveAttribute(
    "data-narration-recovery-phase",
    "operational",
  );
  await page.locator('[data-narration-action="stop"]').click();
  await expect(narration).toHaveAttribute("data-narration-phase", "idle");
});

test("SAC-01 completed materialized narration releases chapter navigation without returning to its highlight", async ({
  page,
}) => {
  await installSyntheticService(page, true);
  await page.goto("/");
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-completed-navigation.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        packageDocument:
          '<package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/" version="3.0" unique-identifier="pub-id"><metadata><dc:identifier id="pub-id">urn:synthetic:sac-navigation</dc:identifier><dc:title>Synthetic navigation</dc:title><dc:language>en</dc:language><meta property="dcterms:modified">2026-07-22T00:00:00Z</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/><item id="final" href="text/final.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="chapter"/><itemref idref="final"/></spine></package>',
        navigationDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc"><ol><li><a href="text/chapter.xhtml#chapter-one">Opening</a></li><li><a href="text/final.xhtml#chapter-two">Final</a></li></ol></nav></body></html>',
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Opening</title></head><body><h1 id="chapter-one">Opening</h1><p>Synthetic opening.</p></body></html>',
        additionalEntries: [
          {
            name: "EPUB/text/final.xhtml",
            content:
              '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Final</title></head><body><h1 id="chapter-two">Final</h1><p>Synthetic final narration.</p></body></html>',
          },
        ],
      }),
    ),
  });
  // Start in an already materialized final chapter, so the last range has
  // never acquired a chapter-materialization request of its own.
  await page.getByRole("button", { name: "Next chapter" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Final" }),
  ).toBeVisible();
  await page.locator('[data-narration-action="play"]').click();
  const narration = page.locator(".product-narration");
  await expect(narration).toHaveAttribute("data-narration-phase", "complete");
  const completedSettings = await openSettings(page);
  await completedSettings
    .getByRole("radio", { name: /Prepared playback/ })
    .check();
  await expect(
    completedSettings.getByRole("radio", { name: /Prepared playback/ }),
  ).toBeChecked();
  await completedSettings.getByRole("radio", { name: /Quick start/ }).check();
  await expect(
    completedSettings.getByRole("radio", { name: /Quick start/ }),
  ).toBeChecked();
  await closeSettings(page, completedSettings);
  const highlightText = () =>
    page.evaluate(() =>
      Array.from(
        CSS.highlights.get("voxleaf-narration-active") ?? [],
        (range) => range.toString(),
      ).join(""),
    );
  await expect.poll(highlightText).toBe("Synthetic final narration.");
  const saved = () =>
    page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("voxleaf.reader.positions") ?? "{}")
          .states?.[0]?.locator,
    );
  await expect.poll(saved).toMatchObject({
    spineItemIndex: 1,
    textOffsetCodePoints: "Synthetic final narration.".length,
  });
  await page.getByRole("button", { name: "Previous chapter" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Opening" }),
  ).toBeVisible();
  await expect.poll(highlightText).toBe("");
  await expect.poll(saved).toMatchObject({ spineItemIndex: 0 });
  await expect(narration).toHaveAttribute(
    "data-narration-play-intent",
    "inactive",
  );
  expect(
    await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
  ).toBe(1);
  await page.locator('[data-narration-action="stop"]').click();
});

for (const persistent of [false, true])
  test(`SAC-06 same-profile Recheck settles retained Stop owners (persistent=${persistent})`, async ({
    page,
  }) => {
    await installSyntheticService(page, false, false, false, true);
    await page.goto("/");
    await page.evaluate(() => {
      Reflect.get(globalThis, "__rnb").audioFrames = 360_000;
    });
    await page.getByLabel("Open a book").setInputFiles({
      name: "synthetic-recheck.epub",
      mimeType: "application/epub+zip",
      buffer: Buffer.from(
        await (
          await fixtures()
        ).buildMinimalEpubFixture({
          chapterDocument:
            '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Synthetic</title></head><body><p>Synthetic retained-owner passage.</p></body></html>',
        }),
      ),
    });
    const narration = page.locator(".product-narration");
    await page.locator('[data-narration-action="play"]').click();
    await expect(narration).toHaveAttribute("data-narration-phase", "playing");
    const profile = await narration.getAttribute("data-narration-profile");
    await page.evaluate((persistent) => {
      Reflect.get(globalThis, "__rnb").shutdownFailures = persistent ? 4 : 2;
    }, persistent);
    await page.locator('[data-narration-action="stop"]').click();
    await expect(narration).toHaveAttribute(
      "data-narration-recovery-phase",
      "contained",
    );
    await expect(narration).toHaveAttribute(
      "data-narration-recovery-code",
      "cleanup-failed",
    );
    await expect(page.locator('[data-narration-action="play"]')).toHaveCount(0);
    const settings = await openSettings(page);
    await settings
      .getByRole("button", { name: "Check compatibility again" })
      .click();
    await expect
      .poll(() =>
        page.evaluate(() => Reflect.get(globalThis, "__rnb").shutdownCalls),
      )
      .toBeGreaterThanOrEqual(3);
    await expect(narration).toHaveAttribute("data-narration-profile", profile!);
    if (persistent) {
      await expect
        .poll(() =>
          page.evaluate(() => Reflect.get(globalThis, "__rnb").shutdownCalls),
        )
        .toBe(4);
      await expect(narration).toHaveAttribute(
        "data-narration-recovery-phase",
        "contained",
      );
      await expect(narration).toHaveAttribute(
        "data-narration-failure",
        "tts-service-failed",
      );
      await expect(page.locator('[data-narration-action="play"]')).toHaveCount(
        0,
      );
      await expect(
        settings.getByRole("button", { name: "Check compatibility again" }),
      ).toBeEnabled();
      expect(
        await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
      ).toBe(1);
    } else {
      await expect(narration).toHaveAttribute(
        "data-narration-recovery-phase",
        "operational",
      );
      await closeSettings(page, settings);
      await expect(
        page.locator('[data-narration-action="play"]'),
      ).toBeEnabled();
      await page.locator('[data-narration-action="play"]').click();
      await expect(narration).toHaveAttribute(
        "data-narration-phase",
        "playing",
      );
      expect(
        await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
      ).toBe(2);
      await page.locator('[data-narration-action="stop"]').click();
      await expect(narration).toHaveAttribute("data-narration-phase", "idle");
    }
  });

test("SAC-15 future appearance preferences stay protected through hydration and book opening", async ({
  page,
}) => {
  const future = '{"schemaVersion":99,"futureAppearance":"synthetic-sentinel"}';
  await page.addInitScript((future) => {
    localStorage.setItem("voxleaf.reader.preferences", future);
    const setItem = Storage.prototype.setItem;
    Reflect.set(globalThis, "__sacPreferenceWrites", 0);
    Storage.prototype.setItem = function (key, value) {
      if (this === localStorage && key === "voxleaf.reader.preferences")
        Reflect.set(
          globalThis,
          "__sacPreferenceWrites",
          Reflect.get(globalThis, "__sacPreferenceWrites") + 1,
        );
      setItem.call(this, key, value);
    };
  }, future);
  await page.goto("/");
  const verifyBytes = async () => {
    expect(
      await page.evaluate(() =>
        localStorage.getItem("voxleaf.reader.preferences"),
      ),
    ).toBe(future);
    expect(
      await page.evaluate(() =>
        Reflect.get(globalThis, "__sacPreferenceWrites"),
      ),
    ).toBe(0);
  };
  await expect(page.getByRole("status")).toHaveText("No local EPUB is open.");
  await expect(page.getByRole("button", { name: "Settings" })).toHaveCount(0);
  await verifyBytes();
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-future-preferences.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Synthetic</title></head><body><p>Synthetic preference restoration.</p></body></html>',
      }),
    ),
  });
  await expect(page.getByRole("status")).toHaveText(
    "The EPUB opened successfully.",
  );
  const settings = await openSettings(page);
  for (const label of ["Text size", "Line spacing", "Content width", "Theme"])
    await expect(
      settings.getByRole("combobox", { name: label, exact: true }),
    ).toBeDisabled();
  await verifyBytes();
  await closeSettings(page, settings);
});

test("renders a local raster first encountered after thirty seconds of real reading time", async ({
  page,
}) => {
  test.setTimeout(50_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.name));
  await page.goto("/");
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-late-image.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildReaderRasterEpubFixture({ delayedViewport: true }),
    ),
  });
  await expect(page.getByRole("status")).toHaveText(
    "The EPUB opened successfully.",
  );
  await expect(page.locator(".semantic-document img")).toHaveCount(0);
  const elapsed = await page.evaluate(async () => {
    const start = performance.now();
    await new Promise((resolve) => setTimeout(resolve, 30_150));
    const viewport = document.querySelector<HTMLElement>(
      '[data-reader-scroll-owner="true"]',
    )!;
    viewport.scrollTop = viewport.scrollHeight;
    return performance.now() - start;
  });
  expect(elapsed).toBeGreaterThan(30_000);
  await expect(
    page.getByRole("img", { name: "Synthetic reader image" }),
  ).toBeVisible();
  expect(
    await page
      .locator(".semantic-document img")
      .evaluate((image) => (image as HTMLImageElement).naturalWidth),
  ).toBe(1);
  expect(errors).toEqual([]);
});

test("keeps prepared navigation and closes real Chromium audio contexts through repeated product Stop", async ({
  page,
}) => {
  test.setTimeout(30_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.name));
  await installSyntheticService(page);
  await page.goto("/");
  const chapterDocument = `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body>${Array.from({ length: 320 }, (_, i) => `<p id="passage-${i}">Synthetic passage number ${i}.</p>`).join("")}</body></html>`;
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-prepared.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (await fixtures()).buildMinimalEpubFixture({ chapterDocument }),
    ),
  });
  const narration = page.locator(".product-narration");
  await page.locator('[data-narration-action="details-toggle"]').click();
  for (const rate of ["100", "75", "100"]) {
    await page.getByLabel("Playback speed", { exact: true }).selectOption(rate);
    await page.locator('[data-narration-action="play"]').click();
    await expect
      .poll(async () =>
        Number(await narration.getAttribute("data-narration-accepted-units")),
      )
      .toBeGreaterThan(64);
    await expect(
      page.locator('[data-narration-action="play-available"]'),
    ).toBeEnabled();
    await page.locator('[data-narration-action="play-available"]').click();
    if (rate === "75") {
      await expect
        .poll(() =>
          page.evaluate(() => Reflect.get(globalThis, "__rnb").preparing),
        )
        .toBe(true);
      await page.locator('[data-narration-action="pause"]').click();
      await expect(narration).toHaveAttribute("data-narration-phase", "paused");
      await page.evaluate(() => Reflect.get(globalThis, "__rnb").release());
      await expect
        .poll(() =>
          page.evaluate(() => Reflect.get(globalThis, "__rnb").preparing),
        )
        .toBe(false);
      await expect(narration).toHaveAttribute("data-narration-phase", "paused");
      await page.locator('[data-narration-action="resume"]').click();
    }
    await expect(narration).toHaveAttribute("data-narration-phase", "playing");
    await expect(
      page.locator('[data-narration-action="next-passage"]'),
    ).toBeEnabled();
    if (rate === "75") {
      await page.locator('[data-narration-action="next-passage"]').click();
      await expect(
        page.locator('[data-narration-action="play-available"]'),
      ).toBeEnabled();
      await page.locator('[data-narration-action="play-available"]').click();
      await expect
        .poll(() =>
          page.evaluate(() => Reflect.get(globalThis, "__rnb").preparing),
        )
        .toBe(true);
      await page.evaluate(() => Reflect.get(globalThis, "__rnb").release());
      await expect(narration).toHaveAttribute(
        "data-narration-phase",
        "playing",
      );
      await expect
        .poll(() =>
          page.evaluate(() => {
            const registry = CSS.highlights;
            return Array.from(
              registry.get("voxleaf-narration-active") ?? [],
              (range) => range.toString(),
            ).join("");
          }),
        )
        .toContain("Synthetic passage number 1.");
    }
    await page.locator('[data-narration-action="stop"]').click();
    await expect(narration).toHaveAttribute("data-narration-phase", "idle");
    await expect
      .poll(() =>
        page.evaluate(() => {
          const value = Reflect.get(globalThis, "__rnb") as {
            created: number;
            closed: number;
          };
          return value.created - value.closed;
        }),
      )
      .toBe(0);
  }
  expect(
    await page.evaluate(
      () => (Reflect.get(globalThis, "__rnb") as { created: number }).created,
    ),
  ).toBe(4);
  expect(errors).toEqual([]);
});

test("NLC real worklet retains the tail and natural completion releases manual save/reopen", async ({
  page,
}) => {
  test.setTimeout(45_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.name));
  await installSyntheticService(page, true);
  await page.setViewportSize({ width: 800, height: 500 });
  await page.goto("/");
  const chapterDocument = `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body>${Array.from({ length: 24 }, (_, i) => `<p id="passage-${i}">Synthetic passage number ${i}.</p>`).join("")}</body></html>`;
  const file = {
    name: "synthetic-nlc.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (await fixtures()).buildMinimalEpubFixture({ chapterDocument }),
    ),
  };
  await page.getByLabel("Open a book").setInputFiles(file);
  await page.getByLabel("Playback speed", { exact: true }).selectOption("75");
  await page.locator('[data-narration-action="play"]').click();
  await expect(page.locator(".product-narration")).toHaveAttribute(
    "data-narration-phase",
    "complete",
    { timeout: 30_000 },
  );
  const observation = await page.evaluate(() => {
    const value = Reflect.get(globalThis, "__rnb");
    return {
      tailMinimum: value.tailMinimum,
      ended: value.ended,
      synthesized: value.synthesized,
    };
  });
  expect(observation.tailMinimum).toBeLessThan(-0.6);
  expect(observation.ended).toBe(observation.synthesized);
  const savedPosition = () =>
    page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("voxleaf.reader.positions") ?? "{}")
          .states?.[0]?.locator,
    );
  await expect
    .poll(async () => (await savedPosition())?.anchor.anchorIndex)
    .toBe(23);
  const heardEnd = await savedPosition();
  const viewport = page.getByRole("region", {
    name: "Publication reading viewport",
  });
  await viewport.hover();
  await page.mouse.wheel(0, -20_000);
  await expect
    .poll(async () => (await savedPosition())?.anchor.anchorIndex)
    .toBe(0);
  const manual = await savedPosition();
  expect(manual).not.toEqual(heardEnd);
  await page.waitForTimeout(750);
  expect(await savedPosition()).toEqual(manual);
  // Reflow refreshes the retained final highlight, but must keep manual reading.
  const settings = await openSettings(page);
  await settings.getByLabel("Text size").selectOption("large");
  await closeSettings(page, settings);
  await page.setViewportSize({ width: 780, height: 520 });
  await expect
    .poll(async () => (await savedPosition())?.anchor.anchorIndex)
    .toBe(0);
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollTop))
    .toBeLessThan(60);
  expect((await savedPosition())?.anchor).toEqual(manual.anchor);
  await page.reload();
  await page.getByLabel("Open a book").setInputFiles(file);
  await expect(page.getByRole("status")).toHaveText(
    "Reading position restored.",
  );
  expect(await savedPosition()).toEqual(manual);
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollTop))
    .toBeLessThan(60);
  expect(errors).toEqual([]);
});

test("LCF completed narration restarts from visible passage and paragraph leaf", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.name));
  await installSyntheticService(page, true);
  await page.setViewportSize({ width: 800, height: 500 });
  await page.goto("/");
  const chapterDocument = `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body>${Array.from({ length: 24 }, (_, i) => `<p id="passage-${i}">Synthetic passage number ${i}.</p>`).join("")}</body></html>`;
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-lcf.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (await fixtures()).buildMinimalEpubFixture({ chapterDocument }),
    ),
  });
  await page.getByLabel("Playback speed", { exact: true }).selectOption("75");
  await page.locator('[data-narration-action="details-toggle"]').click();
  await page.locator('[data-narration-action="play"]').click();
  const narration = page.locator(".product-narration");
  const observation = () =>
    page.evaluate(() => {
      const value = Reflect.get(globalThis, "__rnb");
      return {
        service: value.service as number,
        created: value.created as number,
        closed: value.closed as number,
        synthesized: value.synthesized as number,
        ended: value.ended as number,
        requests: value.requests as Array<{
          service: number;
          generation: string;
          anchor: number;
        }>,
      };
    });
  const savedAnchor = () =>
    page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("voxleaf.reader.positions") ?? "{}")
          .states?.[0]?.locator.anchor.anchorIndex,
    );
  const viewport = page.getByRole("region", {
    name: "Publication reading viewport",
  });
  for (const [index, action] of ["visible", "leaf"].entries()) {
    await expect(narration).toHaveAttribute(
      "data-narration-phase",
      "complete",
      { timeout: 25_000 },
    );
    await expect.poll(savedAnchor).toBe(23);
    const before = await observation();
    expect(before.ended).toBe(before.synthesized);
    await viewport.hover();
    await page.mouse.wheel(0, -20_000);
    await expect.poll(savedAnchor).toBe(0);
    const target = action === "visible" ? 0 : 2;
    if (action === "visible")
      await page.locator('[data-narration-action="visible-passage"]').click();
    else {
      await page.locator(".semantic-document p").nth(target).hover();
      await page.locator(".paragraph-leaf").click();
    }
    await expect
      .poll(async () => (await observation()).service)
      .toBe(index + 2);
    await expect
      .poll(async () => (await observation()).ended)
      .toBeGreaterThan(before.ended);
    const after = await observation();
    const restarted = after.requests.slice(before.requests.length);
    expect(restarted[0]?.anchor).toBe(target);
    expect(new Set(restarted.map((request) => request.generation)).size).toBe(
      1,
    );
    expect(restarted[0]?.generation).not.toBe(
      before.requests.at(-1)?.generation,
    );
    expect(restarted.every((request) => request.service === index + 2)).toBe(
      true,
    );
    expect(after.created).toBe(index + 2);
    expect(after.closed).toBe(index + 1);
  }
  await expect(narration).toHaveAttribute("data-narration-phase", "complete", {
    timeout: 25_000,
  });
  const final = await observation();
  expect(final.service).toBe(3);
  expect(final.ended).toBe(final.synthesized);
  await page.locator('[data-narration-action="stop"]').click();
  await expect.poll(async () => (await observation()).closed).toBe(3);
  expect(errors).toEqual([]);
});

test("NCC final device counter precedes completion delivery, then saves exact end and manual reopen at direct and slow rates", async ({
  browser,
}) => {
  test.setTimeout(90_000);
  const chapterDocument = `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body>${Array.from({ length: 24 }, (_, i) => `<p id="passage-${i}">Synthetic passage number ${i}.</p>`).join("")}</body></html>`;
  const file = {
    name: "synthetic-ncc.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (await fixtures()).buildMinimalEpubFixture({ chapterDocument }),
    ),
  };
  for (const rate of ["100", "75"]) {
    const context = await browser.newContext({
      viewport: { width: 800, height: 500 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.name));
    try {
      await installSyntheticService(page, true, true);
      await page.goto("/");
      await page.getByLabel("Open a book").setInputFiles(file);
      await page
        .getByLabel("Playback speed", { exact: true })
        .selectOption(rate);
      await page.locator('[data-narration-action="play"]').click();
      const narration = page.locator(".product-narration");
      const saved = () =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("voxleaf.reader.positions") ?? "{}")
              .states?.[0]?.locator,
        );
      await expect
        .poll(
          () =>
            page.evaluate(
              () => Reflect.get(globalThis, "__rnb").completionPending,
            ),
          { timeout: 30_000 },
        )
        .toBe(true);
      // Device completion is real; only delivery is held across coordinator ticks.
      await page.waitForTimeout(600);
      await expect(narration).toHaveAttribute(
        "data-narration-phase",
        "playing",
      );
      await expect.poll(saved).toMatchObject({
        anchor: { anchorIndex: 23 },
        textOffsetCodePoints: 0,
      });
      expect(
        await page.evaluate(() => Reflect.get(globalThis, "__rnb").deviceEnded),
      ).toBe(24);
      await page.evaluate(() =>
        Reflect.get(globalThis, "__rnb").releaseCompletion(),
      );
      await expect(narration).toHaveAttribute(
        "data-narration-phase",
        "complete",
      );
      await expect.poll(saved).toMatchObject({
        anchor: { anchorIndex: 23 },
        textOffsetCodePoints: "Synthetic passage number 23.".length,
      });
      const viewport = page.getByRole("region", {
        name: "Publication reading viewport",
      });
      await viewport.hover();
      await page.mouse.wheel(0, -20_000);
      await expect
        .poll(async () => (await saved())?.anchor.anchorIndex)
        .toBe(0);
      const manual = await saved();
      await page.reload();
      await page.getByLabel("Open a book").setInputFiles(file);
      await expect(page.getByRole("status")).toHaveText(
        "Reading position restored.",
      );
      expect(await saved()).toEqual(manual);
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  }
});

async function installSyntheticService(
  page: Page,
  naturalCompletion = false,
  holdFinalCompletion = false,
  auditWorkletFIFO = false,
  quickStart = false,
  optionalRecheck = false,
  optionalSelection = false,
): Promise<void> {
  await page.addInitScript(
    ({
      hostReport,
      naturalCompletion,
      holdFinalCompletion,
      auditWorkletFIFO,
      quickStart,
      optionalRecheck,
      optionalSelection,
    }) => {
      if (!naturalCompletion || !sessionStorage.getItem("nlc-initialized"))
        localStorage.clear();
      sessionStorage.setItem("nlc-initialized", "true");
      if (optionalSelection) {
        Object.assign(hostReport, {
          cudaComputeCapability: { status: "known", major: 12, minor: 0 },
        });
        localStorage.setItem(
          "voxleaf.tts.profile-preference",
          JSON.stringify({
            schemaVersion: 1,
            profileId: "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1",
          }),
        );
      }
      if (optionalRecheck) {
        Object.assign(hostReport, {
          cudaComputeCapability: { status: "known", major: 12, minor: 0 },
        });
        localStorage.setItem(
          "voxleaf.tts.profile-preference",
          JSON.stringify({
            schemaVersion: 1,
            profileId: "chatterbox-multilingual-v3-cuda-bf16-default-v4",
          }),
        );
        hostReport.providers.cuda.availableDedicatedMemoryMiB.value = 0;
      }
      if (!naturalCompletion && !quickStart)
        localStorage.setItem(
          "voxleaf.narration.start-preference",
          JSON.stringify({
            schemaVersion: 1,
            mode: "prepared",
            preparedTargetMs: 600_000,
          }),
        );
      const observations = {
        hostReport,
        probes: 0,
        deferProbe: false,
        releaseProbe: () => {},
        optionalMutations: [] as string[],
        optionalSelectionPending: false,
        releaseOptionalSelection: () => {},
        lastGeneration: "",
        audioFrames: 24_000,
        holdAfter: Number.MAX_SAFE_INTEGER,
        calls: 0,
        blocked: false,
        failSynthesis: () => {},
        prepared: [] as Array<{ text: string; spine: number; offset: number }>,
        workletEnded: false,
        workletFailed: false,
        workletMessages: [] as string[],
        failedDeliveredToSequence: -1,
        releaseWorkletMessages: () => {},
        tailMinimum: 0,
        synthesized: 0,
        ended: 0,
        created: 0,
        closed: 0,
        service: 0,
        shutdownFailures: 0,
        shutdownCalls: 0,
        deferShutdown: false,
        shutdownPending: false,
        releaseShutdown: () => {},
        requests: [] as Array<{
          service: number;
          generation: string;
          anchor: number;
        }>,
        preparing: false,
        release: () => {},
        deviceEnded: 0,
        completionPending: false,
        releaseCompletion: () => {},
      };
      const deliverCompletion = (deliver: () => void) => {
        observations.deviceEnded += 1;
        if (holdFinalCompletion && observations.deviceEnded === 24) {
          observations.completionPending = true;
          observations.releaseCompletion = () => {
            observations.completionPending = false;
            observations.releaseCompletion = () => {};
            deliver();
          };
        } else deliver();
      };
      Object.assign(globalThis, { __rnb: observations });
      const Original = globalThis.AudioContext;
      globalThis.AudioContext = class extends Original {
        constructor(options?: AudioContextOptions) {
          super(options);
          observations.created += 1;
          const addModule = this.audioWorklet.addModule.bind(this.audioWorklet);
          this.audioWorklet.addModule = async (...args) => {
            observations.preparing = true;
            if (!naturalCompletion)
              await new Promise<void>((resolve) => {
                observations.release = resolve;
              });
            await addModule(...args);
            observations.preparing = false;
          };
        }
        override createGain() {
          const gain = super.createGain();
          if (naturalCompletion) {
            const tap = this.createScriptProcessor(256, 1, 1);
            tap.onaudioprocess = (event) => {
              for (const sample of event.inputBuffer.getChannelData(0))
                observations.tailMinimum = Math.min(
                  observations.tailMinimum,
                  sample,
                );
            };
            gain.connect(tap);
            tap.connect(this.destination);
          }
          return gain;
        }
        override createBufferSource() {
          const source = super.createBufferSource();
          if (holdFinalCompletion) {
            const descriptor = Object.getOwnPropertyDescriptor(
              AudioScheduledSourceNode.prototype,
              "onended",
            )!;
            Object.defineProperty(source, "onended", {
              configurable: true,
              get: () => descriptor.get!.call(source),
              set: (callback: ((event: Event) => void) | null) =>
                descriptor.set!.call(
                  source,
                  callback === null
                    ? null
                    : (event: Event) =>
                        deliverCompletion(() => callback.call(source, event)),
                ),
            });
          }
          return source;
        }
        override async close() {
          await super.close();
          observations.closed += 1;
        }
      };
      if (naturalCompletion) {
        const OriginalNode = globalThis.AudioWorkletNode;
        globalThis.AudioWorkletNode = class extends OriginalNode {
          constructor(
            context: BaseAudioContext,
            name: string,
            options?: AudioWorkletNodeOptions,
          ) {
            super(context, name, options);
            this.port.addEventListener("message", (event) => {
              if (event.data.type === "ended") observations.ended += 1;
            });
            this.port.start();
            if (auditWorkletFIFO) {
              const port = this.port;
              let consumer: ((event: MessageEvent) => void) | null = null;
              let armedSequence = -1;
              const postMessage = port.postMessage.bind(port);
              port.postMessage = (message, transfer = []) => {
                if (message.type === "arm")
                  armedSequence = message.unitSequence;
                if (Array.isArray(transfer)) postMessage(message, transfer);
                else postMessage(message, transfer);
              };
              let holding = true;
              const queued: MessageEvent[] = [];
              const descriptor = Object.getOwnPropertyDescriptor(
                MessagePort.prototype,
                "onmessage",
              )!;
              descriptor.set!.call(port, (event: MessageEvent) => {
                if (holding) {
                  queued.push(event);
                  observations.workletMessages.push(event.data.type);
                  if (event.data.type === "ended")
                    observations.workletEnded = true;
                  if (event.data.type === "failed")
                    observations.workletFailed = true;
                } else consumer?.(event);
              });
              Object.defineProperty(port, "onmessage", {
                configurable: true,
                get: () => consumer,
                set: (value) => {
                  consumer = value;
                },
              });
              observations.releaseWorkletMessages = () => {
                holding = false;
                while (queued.length) {
                  const event = queued.shift()!;
                  if (consumer && event.data.type === "failed")
                    observations.failedDeliveredToSequence = armedSequence;
                  consumer?.(event);
                }
              };
            }
            if (holdFinalCompletion) {
              const port = this.port;
              const descriptor = Object.getOwnPropertyDescriptor(
                MessagePort.prototype,
                "onmessage",
              )!;
              Object.defineProperty(port, "onmessage", {
                configurable: true,
                get: () => descriptor.get!.call(port),
                set: (callback: ((event: MessageEvent) => void) | null) =>
                  descriptor.set!.call(
                    port,
                    callback === null
                      ? null
                      : (event: MessageEvent) => {
                          if (event.data.type === "ended")
                            deliverCompletion(() => callback.call(port, event));
                          else callback.call(port, event);
                        },
                  ),
              });
            }
          }
        };
      }
      const state = (value: string) => ({
        schemaVersion: 1,
        protocolVersion: 1,
        kind: "state",
        serviceInstanceId: `service:browser-${observations.service}`,
        state: value,
      });
      const capabilities = () => ({
        schemaVersion: 1,
        protocolVersion: 1,
        kind: "capabilities",
        serviceInstanceId: `service:browser-${observations.service}`,
        report: {
          schemaVersion: 1,
          capabilities: {
            localSpeechGeneration: "unknown",
            streamingGeneration: "unsupported",
            generationCancellation: "unsupported",
            hardwareAcceleration: "unknown",
            cpuFallback: "unsupported",
          },
        },
        cancellationContainment:
          "identity-invalidation-then-worker-termination",
      });
      const installedOptional = () => ({
        profileId: "chatterbox-multilingual-v3-cuda-bf16-default-v4",
        state: "installed",
        failure: null,
        downloadedBytes: 0,
        downloadBytes: 1_073_741_824,
        installedBytes: 2_147_483_648,
        temporaryBytes: 3_221_225_472,
        minimumFreeBytes: 4_294_967_296,
        coldStartSeconds: 31,
        minimumLogicalProcessors: 8,
        minimumTotalRamMiB: 24_576,
        minimumAvailableRamMiB: 4_096,
        measuredPeakDedicatedVramMiB: 3_644,
        minimumTotalDedicatedVramMiB: 5_632,
        minimumAvailableDedicatedVramMiB: 4_668,
        recommendedTotalDedicatedVramMiB: 7_680,
        licenseSummary: "Synthetic fixture",
      });
      Object.assign(window, {
        __TAURI_INTERNALS__: {
          invoke: async (
            command: string,
            args?: { segment: NarrationSegmentV1 },
          ) => {
            switch (command) {
              case "detect_host_profile_compatibility":
                observations.probes += 1;
                if (observations.deferProbe)
                  await new Promise<void>((resolve) => {
                    observations.releaseProbe = () => {
                      observations.deferProbe = false;
                      resolve();
                    };
                  });
                return observations.hostReport;
              case "optional_chatterbox_snapshot":
                if (optionalSelection) return installedOptional();
                if (!optionalRecheck) throw "tts-service-unavailable";
                return {
                  profileId: "chatterbox-multilingual-v3-cuda-bf16-default-v4",
                  state: "failed",
                  failure: "tts-optional-profile-incompatible-host",
                  downloadedBytes: 0,
                  downloadBytes: null,
                  installedBytes: null,
                  temporaryBytes: null,
                  minimumFreeBytes: null,
                  coldStartSeconds: null,
                  minimumLogicalProcessors: 8,
                  minimumTotalRamMiB: 24_576,
                  minimumAvailableRamMiB: 4_096,
                  measuredPeakDedicatedVramMiB: 3_644,
                  minimumTotalDedicatedVramMiB: 5_632,
                  minimumAvailableDedicatedVramMiB: 4_668,
                  recommendedTotalDedicatedVramMiB: 7_680,
                  licenseSummary: "Synthetic fixture",
                };
              case "select_optional_chatterbox":
                if (optionalSelection) {
                  observations.optionalMutations.push(command);
                  observations.optionalSelectionPending = true;
                  await new Promise<void>((resolve) => {
                    observations.releaseOptionalSelection = resolve;
                  });
                  observations.optionalSelectionPending = false;
                  return installedOptional();
                }
                observations.optionalMutations.push(command);
                throw "tts-service-unavailable";
              case "download_optional_chatterbox":
              case "remove_optional_chatterbox":
                observations.optionalMutations.push(command);
                throw "tts-service-unavailable";
              case "tts_profile_configuration_available":
                return true;
              case "exact_tts_demo_available":
                return false;
              case "start_tts_service":
                observations.service += 1;
                return [
                  state("handshaking"),
                  {
                    schemaVersion: 1,
                    protocolVersion: 1,
                    kind: "handshakeAccepted",
                    serviceInstanceId: `service:browser-${observations.service}`,
                  },
                  state("unloaded"),
                  capabilities(),
                ];
              case "prepare_tts_service":
                return [
                  state("loading"),
                  state("warming"),
                  state("ready"),
                  capabilities(),
                ];
              case "synthesize_tts_segment": {
                const segment = args!.segment;
                observations.lastGeneration = segment.generationId;
                if (observations.prepared.length < 16)
                  observations.prepared.push({
                    text: segment.text,
                    spine: segment.sourceRange.start.spineItemIndex,
                    offset: segment.sourceRange.start.textOffsetCodePoints,
                  });
                if (observations.calls++ >= observations.holdAfter)
                  return new Promise((_resolve, reject) => {
                    observations.blocked = true;
                    observations.failSynthesis = () => {
                      observations.blocked = false;
                      reject("tts-service-internal-failure");
                    };
                  });
                if (!naturalCompletion)
                  return new ArrayBuffer(observations.audioFrames * 4);
                observations.requests.push({
                  service: observations.service,
                  generation: segment.generationId,
                  anchor: segment.sourceRange.start.anchor.anchorIndex,
                });
                const pcm = new Float32Array(
                  observations.synthesized++ === 0 || auditWorkletFIFO
                    ? 48_000
                    : 1_200,
                );
                if (pcm.length === 48_000) {
                  pcm.fill(0.25, 12_000, 16_000);
                  pcm.fill(-0.75, 42_000, 47_000);
                }
                return pcm.buffer;
              }
              case "shutdown_tts_service":
                observations.shutdownCalls += 1;
                if (observations.deferShutdown) {
                  observations.shutdownPending = true;
                  await new Promise<void>((resolve) => {
                    observations.releaseShutdown = resolve;
                  });
                  observations.shutdownPending = false;
                }
                if (observations.shutdownFailures > 0) {
                  observations.shutdownFailures -= 1;
                  throw "tts-service-internal-failure";
                }
                return [state("stopping"), state("stopped")];
              default:
                throw "tts-service-unavailable";
            }
          },
        },
      });
    },
    {
      hostReport: report,
      naturalCompletion,
      holdFinalCompletion,
      auditWorkletFIFO,
      quickStart,
      optionalRecheck,
      optionalSelection,
    },
  );
}
