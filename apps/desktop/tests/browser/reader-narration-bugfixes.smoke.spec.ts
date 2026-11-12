import { syntheticEarlyAnimatedWebp } from "../fixtures/webp-fixture";
import { expect, test, type Page } from "@playwright/test";
import { openEpubPublication } from "@voxleaf/epub";
import type { NarrationSegmentV1 } from "@voxleaf/shared";
import report from "../../../../packages/shared/fixtures/contracts/host-profile-compatibility-report/v1/valid-synthetic.json" with { type: "json" };

import { closeSettings, openSettings } from "./settings-helpers";

test("DCR-03/23 CCF-C02 restores placement and settles language before Play", async ({
  page,
}) => {
  const aiden = "qwen3-tts-1-7b-customvoice-cuda-bf16-aiden-en-v8";
  await installSyntheticService(
    page,
    true,
    false,
    false,
    true,
    false,
    false,
    false,
    false,
    aiden,
  );
  await page.goto("/");
  const file = {
    name: "caf-placement.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body><p id="target">${"Synthetic target passage for initial placement. ".repeat(40)}</p></body></html>`,
        navigationDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc"><ol><li><a href="text/chapter.xhtml#target">Target passage</a></li></ol></nav></body></html>',
      }),
    ),
  };
  await page.getByLabel("Open a book").setInputFiles(file);
  for (const label of ["Close contents", "Close table of contents"]) {
    await page.getByRole("button", { name: "Show table of contents" }).click();
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Show table of contents" }),
    ).toBeFocused();
  }
  await page.getByRole("button", { name: "Show table of contents" }).click();
  await page
    .getByRole("button", { name: "Target passage", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("voxleaf.reader.positions")),
    )
    .not.toBeNull();
  const stored = await page.evaluate(() => {
    const envelope = JSON.parse(
      localStorage.getItem("voxleaf.reader.positions")!,
    );
    envelope.states[0].locator.textOffsetCodePoints = 800;
    return JSON.stringify(envelope);
  });
  await page.reload();
  await page.evaluate((value) => {
    localStorage.setItem("voxleaf.reader.positions", value);
    const noLineRects = document.createRange().getClientRects();
    Range.prototype.getClientRects = () => noLineRects;
    Range.prototype.getBoundingClientRect = () =>
      new DOMRect(0, 100_000, 10, 20);
    Reflect.get(globalThis, "__rnb").deferConfiguration = true;
  }, stored);
  await page.getByLabel("Open a book").setInputFiles(file);
  await expect(
    page.getByRole("region", { name: "Publication reading viewport" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => Reflect.get(globalThis, "__rnb").configurationPending,
      ),
    )
    .toBe(true);
  await page.evaluate(() =>
    Reflect.get(globalThis, "__rnb").releaseConfiguration(),
  );
  await expect(page.locator('[data-narration-action="play"]')).toBeEnabled();
  expect(
    await page.evaluate(() => localStorage.getItem("voxleaf.reader.positions")),
  ).toBe(stored);
  const settings = await openSettings(page);
  const englishProfile = page.getByRole("radio", {
    name: "Qwen and Aiden English quality profile (Development)",
  });
  const english = page.getByRole("radio", { name: "English", exact: true });
  const spanish = page.getByRole("radio", { name: "Spanish", exact: true });
  await expect(englishProfile).toBeChecked();
  await spanish.check();
  await expect(
    page.getByRole("radio", {
      name: "Piper and davefx Spanish fast CPU profile",
    }),
  ).toBeChecked();
  await english.check();
  await expect(englishProfile).toBeChecked();
  expect(
    await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
  ).toBe(0);
  await closeSettings(page, settings);
  await expect(page.locator('[data-narration-action="play"]')).toBeEnabled();
  await page.locator('[data-narration-action="play"]').click();
  await expect
    .poll(() =>
      page.evaluate(() => Reflect.get(globalThis, "__rnb").startedProfile),
    )
    .toBe(aiden);
  await expect
    .poll(() =>
      page.evaluate(() => Reflect.get(globalThis, "__rnb").prepared[0]?.offset),
    )
    .toBe(0);
  await page.locator('[data-narration-action="stop"]').click();
  const reopened = await openSettings(page);
  const piperEnglish = page.getByRole("radio", {
    name: "Piper and joe English fast CPU profile",
  });
  await piperEnglish.click();
  await expect(piperEnglish).toBeChecked();
  await spanish.check();
  await english.check();
  await expect(piperEnglish).toBeChecked();
  expect(
    await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
  ).toBe(1);
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").failProbe = true;
  });
  await spanish.check();
  await expect(
    page.getByText(
      "No evaluated local narration profile is available for Spanish.",
    ),
  ).toBeVisible();
  await closeSettings(page, reopened);
  await expect(
    page.locator('[data-narration-action="play"]'),
  ).not.toBeEnabled();
  expect(
    await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
  ).toBe(1);
});

test("CAF-2 removal failure retries and same-book reinstall refreshes without autoplay", async ({
  page,
}) => {
  await installSyntheticService(
    page,
    false,
    false,
    false,
    true,
    false,
    true,
    true,
  );
  await page.goto("/");
  await page.evaluate(() => {
    const native = Reflect.get(window, "__TAURI_INTERNALS__");
    const invoke = native.invoke;
    const acquisition = {
      state: "installed",
      available: true,
      checks: 0,
      failRemoval: true,
      pending: false,
      release: () => {},
    };
    Reflect.set(globalThis, "__cafAcquisition", acquisition);
    native.invoke = async (command: string, args: unknown) => {
      const snapshot = async () => ({
        ...(await invoke("optional_chatterbox_snapshot")),
        state: acquisition.state,
      });
      if (command === "optional_chatterbox_snapshot") return snapshot();
      if (command === "tts_profile_configuration_available") {
        acquisition.checks += 1;
        return acquisition.available;
      }
      if (command === "remove_optional_chatterbox") {
        acquisition.state = "absent";
        acquisition.available = false;
        return snapshot();
      }
      if (command === "shutdown_tts_service" && acquisition.failRemoval) {
        acquisition.failRemoval = false;
        throw "tts-service-internal-failure";
      }
      if (command === "select_optional_chatterbox") {
        acquisition.state = "confirming";
        return snapshot();
      }
      if (command === "download_optional_chatterbox") {
        acquisition.state = "verifying";
        acquisition.pending = true;
        await new Promise<void>((resolve) => {
          acquisition.release = resolve;
        });
        acquisition.pending = false;
        acquisition.state = "installed";
        acquisition.available = true;
        return snapshot();
      }
      return invoke(command, args);
    };
  });
  const file = {
    name: "caf-reinstall.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body><p>Synthetic reinstall passage.</p></body></html>',
      }),
    ),
  };
  await page.getByLabel("Open a book").setInputFiles(file);
  await page.locator('[data-narration-action="play"]').click();
  await expect(page.locator(".product-narration")).toHaveAttribute(
    "data-narration-phase",
    "playing",
  );
  const settings = await openSettings(page);
  const remove = settings.getByRole("button", {
    name: "Remove Chatterbox",
    exact: true,
  });
  await remove.click();
  await expect(
    settings.getByText(/Chatterbox could not be removed/),
  ).toBeVisible();
  await remove.click();
  await expect(
    settings.getByRole("button", { name: "Review Chatterbox download" }),
  ).toBeVisible();
  // A successful cleanup retry does not clear the terminal recovery episode.
  // Use the existing explicit Reset before testing same-book acquisition.
  await settings
    .getByRole("button", { name: "Reset narration settings" })
    .click();
  await expect(page.locator(".product-narration")).toHaveAttribute(
    "data-narration-recovery-phase",
    "operational",
  );
  await settings
    .getByRole("button", { name: "Review Chatterbox download" })
    .click();
  await settings
    .getByRole("button", { name: "Download Chatterbox", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() => Reflect.get(globalThis, "__cafAcquisition").pending),
    )
    .toBe(true);
  const before = await page.evaluate(() => ({
    checks: Reflect.get(globalThis, "__cafAcquisition").checks,
    starts: Reflect.get(globalThis, "__rnb").service,
  }));
  await page.evaluate(() =>
    Reflect.get(globalThis, "__cafAcquisition").release(),
  );
  await expect
    .poll(() =>
      page.evaluate(() => Reflect.get(globalThis, "__cafAcquisition").checks),
    )
    .toBe(before.checks + 1);
  await closeSettings(page, settings);
  await expect(page.locator('[data-narration-action="play"]')).toBeEnabled();
  expect(
    await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
  ).toBe(before.starts);
  await page.getByLabel("Open a book").setInputFiles(file);
  await expect(page.locator('[data-narration-action="play"]')).toBeEnabled();
  expect(
    await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
  ).toBe(before.starts);
});

test("CAF-3 over-limit Reset and appearance write rejection preserve bytes and feedback", async ({
  page,
}) => {
  await installSyntheticService(page, false, false, false, true);
  await page.goto("/");
  await page.evaluate(() => {
    for (const key of [
      "voxleaf.narration.language-preference",
      "voxleaf.narration.start-preference",
      "voxleaf.narration.playback-preference",
    ])
      localStorage.setItem(key, "x".repeat(257));
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "voxleaf.reader.preferences")
        throw new Error("synthetic storage failure");
      original.call(this, key, value);
    };
  });
  await page.getByLabel("Open a book").setInputFiles({
    name: "caf-preferences.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body><p>Synthetic preference passage.</p></body></html>',
      }),
    ),
  });
  const settings = await openSettings(page);
  await settings.getByLabel("Text size").selectOption("large");
  await expect(
    settings.getByText(/Appearance settings could not be saved/),
  ).toBeVisible();
  await expect(settings.getByLabel("Text size")).toHaveValue("large");
  await settings
    .getByRole("button", { name: "Reset narration settings" })
    .click();
  await expect(
    settings.getByRole("button", { name: "Reset narration settings" }),
  ).toBeEnabled();
  expect(
    await page.evaluate(() =>
      [
        "voxleaf.narration.language-preference",
        "voxleaf.narration.start-preference",
        "voxleaf.narration.playback-preference",
      ].map((key) => localStorage.getItem(key)),
    ),
  ).toEqual(Array(3).fill("x".repeat(257)));
  await closeSettings(page, settings);
});

async function fixtures() {
  return import(
    new URL(
      "../../../../packages/epub/test-support/epub-fixture.ts",
      import.meta.url,
    ).href
  ) as Promise<{
    minimalPackageDocument(): string;
    minimalNavigationDocument(): string;
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

test("RAF-02 RCF-05/18 Settings remount and cancellation survive failed concurrent Reset", async ({
  page,
}) => {
  await installSyntheticService(page, false, false, false, true, false, true);
  await page.goto("/");
  await page.evaluate(() => {
    const native = Reflect.get(window, "__TAURI_INTERNALS__");
    const invoke = native.invoke;
    const download = { state: "confirming", calls: 0, release: () => {} };
    Reflect.set(globalThis, "__rafDownload", download);
    native.invoke = async (command: string, args: unknown) => {
      if (command === "optional_chatterbox_snapshot")
        return { ...(await invoke(command, args)), state: download.state };
      if (command === "download_optional_chatterbox") {
        download.calls += 1;
        await new Promise<void>((resolve) => {
          download.release = resolve;
        });
        return {
          ...(await invoke("optional_chatterbox_snapshot")),
          state: download.state,
        };
      }
      if (command === "cancel_optional_chatterbox") {
        download.state = "absent";
        download.release();
        return {
          ...(await invoke("optional_chatterbox_snapshot")),
          state: "absent",
        };
      }
      return invoke(command, args);
    };
  });
  await page.getByLabel("Open a book").setInputFiles({
    name: "raf-download.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body><p>Synthetic download observation.</p></body></html>',
      }),
    ),
  });
  await page.locator('[data-narration-action="play"]').click();
  await expect(page.locator(".product-narration")).toHaveAttribute(
    "data-narration-phase",
    "playing",
  );
  let settings = await openSettings(page);
  await settings
    .getByRole("button", { name: "Download Chatterbox", exact: true })
    .click();
  await expect(
    settings.getByText("Starting the Chatterbox download."),
  ).toBeVisible();
  await closeSettings(page, settings);
  settings = await openSettings(page);
  await expect(
    settings.getByRole("button", { name: "Download Chatterbox", exact: true }),
  ).toBeDisabled();
  await expect(
    settings.getByRole("button", { name: "Cancel", exact: true }),
  ).toBeEnabled();
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rafDownload").state = "downloading";
  });
  await expect(settings.getByText(/Downloading Chatterbox:/)).toBeVisible();
  await closeSettings(page, settings);
  settings = await openSettings(page);
  await expect(settings.getByText(/Downloading Chatterbox:/)).toBeVisible();
  const preferences = await page.evaluate(() =>
    Object.entries(localStorage).filter(([key]) => key.includes("preference")),
  );
  await page.evaluate(() => {
    const state = Reflect.get(globalThis, "__rnb");
    state.deferShutdown = true;
    state.shutdownFailures = 1;
  });
  await settings
    .getByRole("button", { name: "Reset narration settings" })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() => Reflect.get(globalThis, "__rnb").shutdownPending),
    )
    .toBe(true);
  await expect(
    settings.getByRole("radio", { name: /Prepared playback/ }),
  ).toBeDisabled();
  await expect(
    settings.getByRole("button", { name: "Cancel download", exact: true }),
  ).toBeEnabled();
  await settings
    .getByRole("button", { name: "Cancel download", exact: true })
    .click();
  await expect(
    settings.getByRole("button", { name: "Review Chatterbox download" }),
  ).toBeVisible();
  await page.evaluate(() => {
    const state = Reflect.get(globalThis, "__rnb");
    state.deferShutdown = false;
    state.releaseShutdown();
  });
  await expect(
    settings.getByRole("button", { name: "Reset narration settings" }),
  ).toBeEnabled();
  expect(
    await page.evaluate(() =>
      Object.entries(localStorage).filter(([key]) =>
        key.includes("preference"),
      ),
    ),
  ).toEqual(preferences);
  expect(
    await page.evaluate(() => Reflect.get(globalThis, "__rafDownload").calls),
  ).toBe(1);
  await closeSettings(page, settings);
});

test("RAF-03/06/07 rejected replacement clears reader and compact speed reports write failure", async ({
  page,
}) => {
  await installSyntheticService(page, false, false, false, true);
  await page.goto("/");
  const build = (await fixtures()).buildMinimalEpubFixture;
  const open = async (body: string, name: string) =>
    page.getByLabel("Open a book").setInputFiles({
      name,
      mimeType: "application/epub+zip",
      buffer: Buffer.from(
        await build({
          chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body>${body}</body></html>`,
        }),
      ),
    });
  await open("<p>First synthetic publication.</p>", "raf-first.epub");
  await expect(page.locator(".semantic-document")).toContainText(
    "First synthetic publication.",
  );
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Reflect.set(globalThis, "__rafRestoreStorage", () => {
      Storage.prototype.setItem = original;
    });
    Storage.prototype.setItem = function (key, value) {
      if (key === "voxleaf.narration.playback-preference")
        throw new Error("synthetic denied write");
      original.call(this, key, value);
    };
  });
  const speed = page.getByLabel("Playback speed", { exact: true });
  await speed.selectOption("75");
  await expect(
    page.getByText(/Playback speed could not be saved/),
  ).toBeVisible();
  await expect(speed).toHaveValue("75");
  await page.evaluate(() => Reflect.get(globalThis, "__rafRestoreStorage")());
  await speed.selectOption("100");
  await expect(page.getByText(/Playback speed could not be saved/)).toHaveCount(
    0,
  );
  await open("", "raf-empty.epub");
  await expect(
    page.getByRole("heading", { name: "No readable content" }),
  ).toBeVisible();
  await expect(page.locator(".semantic-document")).toHaveCount(0);
  await expect(page.locator(".product-narration")).toHaveCount(0);
  await open("<p>Replacement synthetic publication.</p>", "raf-next.epub");
  await expect(page.locator(".semantic-document")).toContainText(
    "Replacement synthetic publication.",
  );
  await expect(page.locator(".product-narration")).toBeVisible();
  expect(
    await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
  ).toBe(0);
});

test("MPA-01/03 real worklet slow/direct/slow reuse and paused-navigation labels", async ({
  page,
}) => {
  test.setTimeout(45_000);
  await installSyntheticService(
    page,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
  );
  await page.goto("/");
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-mpa.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body>${"<p>Synthetic playback passage.</p>".repeat(24)}</body></html>`,
      }),
    ),
  });
  const narration = page.locator(".product-narration");
  const speed = page.getByLabel("Playback speed", { exact: true });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.name));
  await speed.selectOption("75");
  await page.locator('[data-narration-action="play"]').click();
  try {
    for (let cycle = 1; cycle <= 2; cycle += 1) {
      await expect(narration).toHaveAttribute(
        "data-narration-active-rate-percent",
        "75",
      );
      await speed.selectOption("100");
      await expect(narration).toHaveAttribute(
        "data-narration-active-rate-percent",
        "100",
      );
      expect(
        await page.evaluate(
          () => Reflect.get(globalThis, "__rnb").workletLifecycle,
        ),
      ).toEqual(Array.from({ length: cycle }, () => ["dispose", "close"]));
      await speed.selectOption("75");
    }
    await expect(narration).toHaveAttribute(
      "data-narration-active-rate-percent",
      "75",
    );
    expect(
      await page.evaluate(() => Reflect.get(globalThis, "__rnb").created),
    ).toBe(1);
    await page.locator('[data-narration-action="pause"]').click();
    await page.locator('[data-narration-action="details-toggle"]').click();
    await page.locator('[data-narration-action="next-passage"]').click();
    await expect(narration).toHaveAttribute(
      "data-narration-navigation-settling",
      "false",
    );
    const service = await page.evaluate(
      () => Reflect.get(globalThis, "__rnb").service,
    );
    await speed.selectOption("100");
    await expect(page.locator(".product-narration-loaded")).toContainText(
      "0 seconds ready at 1.00×",
    );
    await speed.selectOption("75");
    await expect(page.locator(".product-narration-loaded")).toContainText(
      "0 seconds ready at 0.75×",
    );
    await expect(narration).toHaveAttribute("data-narration-phase", "paused");
    expect(
      await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
    ).toBe(service);
    await page.locator('[data-narration-action="resume"]').click();
    await expect(narration).toHaveAttribute(
      "data-narration-active-rate-percent",
      "75",
    );
  } finally {
    await page.locator('[data-narration-action="stop"]').click();
  }
  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = Reflect.get(globalThis, "__rnb");
        return state.created - state.closed;
      }),
    )
    .toBe(0);
  expect(errors).toEqual([]);
});

test("RCF-02/07/09 inactive incremental list placement gates Play", async ({
  page,
}) => {
  await installSyntheticService(page, false, false, false, true);
  await page.goto("/");
  const items = Array.from(
    { length: 600 },
    (_, index) =>
      `<li${index === 450 ? ' id="target" value="900"' : ""}>Synthetic item ${index}.</li>`,
  ).join("");
  await page.getByLabel("Open a book").setInputFiles({
    name: "rcf-placement.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>List</title></head><body><ol start="-2">${items}</ol></body></html>`,
        navigationDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Navigation</title></head><body><nav epub:type="toc"><ol><li><a href="text/chapter.xhtml#target">Distant item</a></li></ol></nav></body></html>',
      }),
    ),
  });
  await page
    .getByRole("button", { name: "Show table of contents", exact: true })
    .click();
  await page.evaluate(() => {
    const original = HTMLElement.prototype.scrollIntoView;
    Reflect.set(globalThis, "__rcfPlacementPlayAttempts", 0);
    HTMLElement.prototype.scrollIntoView = function (...args) {
      if (this.textContent === "Synthetic item 450.") {
        Reflect.set(
          globalThis,
          "__rcfPlacementPlayAttempts",
          Reflect.get(globalThis, "__rcfPlacementPlayAttempts") + 1,
        );
        document
          .querySelector<HTMLButtonElement>('[data-narration-action="play"]')!
          .click();
      }
      original.apply(this, args);
    };
  });
  await page.getByRole("button", { name: "Distant item", exact: true }).click();
  const narration = page.locator(".product-narration");
  expect(
    await page.evaluate(() =>
      Reflect.get(globalThis, "__rcfPlacementPlayAttempts"),
    ),
  ).toBeGreaterThan(0);
  expect(
    await page.evaluate(() => Reflect.get(globalThis, "__rnb").calls),
  ).toBe(0);
  await expect(narration).toHaveAttribute(
    "data-narration-navigation-settling",
    "false",
  );
  await expect(
    page.locator('.semantic-document li[value="900"]'),
  ).toContainText("Synthetic item 450.");
  await page.locator('[data-narration-action="play"]').click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          Reflect.get(globalThis, "__rnb").prepared[0]?.sourceRange.start.anchor
            .anchorIndex,
      ),
    )
    // The list itself owns anchor 0; its item 450 owns anchor 451.
    .toBe(451);
  await page.locator('[data-narration-action="stop"]').click();
});

test("RCF-17 paused manual inspection survives typography and Resume follows", async ({
  page,
}) => {
  await installSyntheticService(page, false, false, false, true);
  await page.setViewportSize({ width: 700, height: 500 });
  await page.goto("/");
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").audioFrames = 360_000;
  });
  await page.getByLabel("Open a book").setInputFiles({
    name: "rcf-inspection.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Inspection</title></head><body>${Array.from({ length: 60 }, (_, index) => `<p>Synthetic inspection paragraph ${index}. Ordinary text for stable reading.</p>`).join("")}</body></html>`,
      }),
    ),
  });
  await page.locator('[data-narration-action="play"]').click();
  await expect(page.locator(".product-narration")).toHaveAttribute(
    "data-narration-phase",
    "playing",
  );
  await page.locator('[data-narration-action="pause"]').click();
  const viewport = page.locator(".reader-viewport");
  await viewport.hover();
  await page.mouse.wheel(0, 900);
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(500);
  await page.waitForTimeout(150);
  const visibleParagraph = () =>
    page.evaluate(() => {
      const top = document
        .querySelector(".reader-viewport")!
        .getBoundingClientRect().top;
      return [...document.querySelectorAll(".semantic-document p")].find(
        (element) => element.getBoundingClientRect().bottom > top + 10,
      )?.textContent;
    });
  const inspected = await visibleParagraph();
  const settings = await openSettings(page);
  await settings.getByLabel("Text size").selectOption("large");
  await closeSettings(page, settings);
  await expect.poll(visibleParagraph).toBe(inspected);
  await page.locator('[data-narration-action="resume"]').click();
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollTop))
    .toBeLessThan(100);
  await page.locator('[data-narration-action="stop"]').click();
});

test("RCF-19 future idle worklet failure keeps direct audio and recovers the next rate", async ({
  page,
}) => {
  await installSyntheticService(
    page,
    true,
    true,
    false,
    true,
    false,
    false,
    false,
    true,
  );
  await page.goto("/");
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").naturalAudioFrames = 240_000;
  });
  await page.getByLabel("Open a book").setInputFiles({
    name: "rcf-future-speed.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body><p>First synthetic passage.</p><p>Second synthetic passage.</p></body></html>',
      }),
    ),
  });
  const narration = page.locator(".product-narration");
  await page.locator('[data-narration-action="play"]').click();
  await expect(narration).toHaveAttribute(
    "data-narration-active-rate-percent",
    "100",
  );
  await page.getByLabel("Playback speed", { exact: true }).selectOption("75");
  await expect
    .poll(() =>
      page.evaluate(() => Reflect.get(globalThis, "__rnb").workletNodes.length),
    )
    .toBe(1);
  await page.evaluate(() =>
    Reflect.get(globalThis, "__rnb").workletNodes[0].dispatchEvent(
      new ErrorEvent("error"),
    ),
  );
  await expect(
    narration.getByText(/The next playback speed could not be prepared/),
  ).toBeVisible();
  await expect(page.getByLabel("Playback speed", { exact: true })).toHaveValue(
    "100",
  );
  await expect(narration).toHaveAttribute("data-narration-phase", "playing");
  expect(
    await page.evaluate(() => {
      const s = Reflect.get(globalThis, "__rnb");
      return {
        service: s.service,
        closed: s.closed,
        ended: s.deviceEnded,
        lifecycle: s.workletLifecycle,
      };
    }),
  ).toEqual({
    service: 1,
    closed: 0,
    ended: 0,
    lifecycle: [["dispose", "close"]],
  });
  await expect
    .poll(
      () => page.evaluate(() => Reflect.get(globalThis, "__rnb").deviceEnded),
      { timeout: 15_000 },
    )
    .toBeGreaterThanOrEqual(1);
  await expect(narration).toHaveAttribute(
    "data-narration-active-rate-percent",
    "100",
  );
  await page.locator('[data-narration-action="stop"]').click();
  await expect
    .poll(() => page.evaluate(() => Reflect.get(globalThis, "__rnb").closed))
    .toBe(1);
});

test("MPA-02 injected native processorerror reaches explicit product recovery", async ({
  page,
}) => {
  await installSyntheticService(
    page,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
  );
  await page.goto("/");
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-mpa-error.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body>${"<p>Synthetic recovery passage.</p>".repeat(24)}</body></html>`,
      }),
    ),
  });
  const narration = page.locator(".product-narration");
  await page.getByLabel("Playback speed", { exact: true }).selectOption("75");
  await page.locator('[data-narration-action="play"]').click();
  await expect(narration).toHaveAttribute(
    "data-narration-active-rate-percent",
    "75",
  );
  await expect(narration).toHaveAttribute("data-narration-phase", "playing");
  const injection = await page.evaluate(() => {
    const state = Reflect.get(globalThis, "__rnb");
    const node = state.workletNodes[0];
    // Pinned Chromium dispatches ErrorEvent('error') through onprocessorerror.
    const handlerBefore = typeof node.onprocessorerror;
    node.dispatchEvent(new ErrorEvent("error"));
    node.dispatchEvent(new ErrorEvent("error"));
    return {
      handlerBefore,
      handlerAfter: typeof node.onprocessorerror,
      lifecycle: state.workletLifecycle,
    };
  });
  expect(injection).toEqual({
    handlerBefore: "function",
    handlerAfter: "object",
    lifecycle: [["dispose", "close"]],
  });
  await expect(narration).toHaveAttribute(
    "data-narration-recovery-phase",
    "recovery-available",
  );
  await expect(narration).toHaveAttribute(
    "data-narration-failure",
    "audio-playback-failed",
  );
  await expect(narration).toHaveAttribute("data-narration-retained-units", "0");
  expect(
    await page.evaluate(() => {
      const state = Reflect.get(globalThis, "__rnb");
      return { service: state.service, contexts: state.created - state.closed };
    }),
  ).toEqual({ service: 1, contexts: 0 });
  await page.locator('[data-narration-action="recover"]').click();
  await expect(narration).toHaveAttribute("data-narration-phase", "playing");
  await page.evaluate(() =>
    Reflect.get(globalThis, "__rnb").workletNodes[0].dispatchEvent(
      new ErrorEvent("error"),
    ),
  );
  await expect(narration).toHaveAttribute(
    "data-narration-recovery-phase",
    "operational",
  );
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

test("EFC-07 successful Settings recheck clears obsolete native preflight failure", async ({
  page,
}) => {
  await installSyntheticService(page, false, false, false, true, true);
  await page.goto("/");
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-efc-recheck.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Synthetic</title></head><body><p>Local synthetic compatibility passage.</p></body></html>',
      }),
    ),
  });
  const settings = await openSettings(page);
  const recheck = settings.getByRole("button", {
    name: "Recheck device compatibility",
    exact: true,
  });
  await expect(recheck).toBeVisible();
  await page.evaluate(() => {
    const state = Reflect.get(globalThis, "__rnb");
    state.hostReport.providers.cuda.availableDedicatedMemoryMiB.value = 9216;
    state.optionalRecovered = true;
  });
  await recheck.click();
  await expect(
    settings.getByRole("button", { name: "Review Chatterbox download" }),
  ).toBeEnabled();
  await expect(recheck).toHaveCount(0);
  expect(
    await page.evaluate(
      () => Reflect.get(globalThis, "__rnb").optionalMutations,
    ),
  ).toEqual([]);
  await closeSettings(page, settings);
});

test("SFA-EPUB renders and narrates separate table cells and definition entries in order", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.name));
  await installSyntheticService(page, true);
  await page.goto("/");
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-sfa-structure.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml" lang="en"><head><title>Synthetic</title></head><body><table><tr><td id="ten">10</td><td id="twenty"><em>20</em></td></tr></table><dl><dt id="term">Term</dt><dd id="definition">Definition</dd></dl></body></html>',
      }),
    ),
  });
  const viewport = page.getByRole("region", {
    name: "Publication reading viewport",
  });
  await expect(viewport.locator("p")).toHaveText([
    "10",
    "20",
    "Term",
    "Definition",
  ]);
  await expect(viewport.locator("em")).toHaveText("20");
  await page.locator('[data-narration-action="play"]').click();
  try {
    await expect
      .poll(() =>
        page.evaluate(() =>
          Reflect.get(globalThis, "__rnb").prepared.map(
            (entry: { text: string }) => entry.text,
          ),
        ),
      )
      .toEqual(["10", "20", "Term", "Definition"]);
    expect(
      await page.evaluate(() =>
        Reflect.get(globalThis, "__rnb").requests.map(
          (entry: { anchor: number }) => entry.anchor,
        ),
      ),
    ).toEqual([0, 1, 2, 3]);
    expect(errors).toEqual([]);
  } finally {
    await page.locator('[data-narration-action="stop"]').click();
  }
  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = Reflect.get(globalThis, "__rnb");
        return state.created - state.closed;
      }),
    )
    .toBe(0);
});

for (const replaceBook of [false, true])
  test(`MAF-04 / R8-05 blocks Play during removal across replacement=${replaceBook}`, async ({
    page,
  }) => {
    await installSyntheticService(page, false, false, false, true, false, true);
    await page.goto("/");
    await page.getByLabel("Open a book").setInputFiles({
      name: "synthetic-maf-removal.epub",
      mimeType: "application/epub+zip",
      buffer: Buffer.from(
        await (
          await fixtures()
        ).buildMinimalEpubFixture({
          chapterDocument:
            '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Synthetic</title></head><body><p>Synthetic removal passage.</p></body></html>',
        }),
      ),
    });
    await page.evaluate(() => {
      Reflect.get(globalThis, "__rnb").deferRemoval = true;
    });
    const settings = await openSettings(page);
    await settings.getByRole("button", { name: "Remove Chatterbox" }).click();
    await expect
      .poll(() =>
        page.evaluate(() => Reflect.get(globalThis, "__rnb").removalPending),
      )
      .toBe(true);
    try {
      await closeSettings(page, settings);
      if (replaceBook) {
        await page.getByLabel("Open a book").setInputFiles({
          name: "synthetic-r8-b.epub",
          mimeType: "application/epub+zip",
          buffer: Buffer.from(
            await (
              await fixtures()
            ).buildMinimalEpubFixture({
              chapterDocument:
                '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>B</title></head><body><p>Replacement book passage.</p></body></html>',
            }),
          ),
        });
        await expect(page.locator(".semantic-document")).toContainText(
          "Replacement book passage.",
        );
        await expect(
          page.locator('[data-narration-action="play"]'),
        ).toHaveCount(0);
      }
      const play = page.locator('[data-narration-action="play"]');
      if (!replaceBook) {
        await expect(play).toBeDisabled();
        await play.evaluate((button: HTMLButtonElement) => button.click());
      }
      expect(
        await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
      ).toBe(0);
    } finally {
      await page.evaluate(() =>
        Reflect.get(globalThis, "__rnb").releaseRemoval(),
      );
    }
    await expect(page.locator('[data-narration-action="play"]')).toBeEnabled();
    expect(
      await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
    ).toBe(0);
    if (replaceBook) {
      await page.locator('[data-narration-action="play"]').click();
      await expect
        .poll(() =>
          page.evaluate(
            () => Reflect.get(globalThis, "__rnb").prepared[0]?.text,
          ),
        )
        .toBe("Replacement book passage.");
      await page.locator('[data-narration-action="stop"]').click();
    }
  });

test("MAF-10 selecting the checked healthy Chatterbox radio preserves its admitted owner", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.name));
  await installSyntheticService(
    page,
    false,
    false,
    false,
    true,
    false,
    true,
    true,
  );
  await page.goto("/");
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").audioFrames = 480_000;
  });
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-maf-reselection.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body>' +
          "<p>Synthetic healthy loaded narration passage.</p>".repeat(60) +
          "</body></html>",
      }),
    ),
  });
  const narration = page.locator(".product-narration");
  await page.locator('[data-narration-action="play"]').click();
  await expect(narration).toHaveAttribute("data-narration-phase", "playing");
  await expect(narration).toHaveAttribute(
    "data-narration-profile",
    "chatterbox-multilingual-v3-cuda-bf16-default-v4",
  );
  const owner = () =>
    page.evaluate(() => {
      const state = Reflect.get(globalThis, "__rnb");
      return {
        service: state.service,
        generation: state.lastGeneration,
        shutdowns: state.shutdownCalls,
        mutations: state.optionalMutations,
      };
    });
  const before = await owner();
  await page.evaluate(() => {
    Reflect.get(
      globalThis,
      "__rnb",
    ).hostReport.providers.cuda.availableDedicatedMemoryMiB.value = 0;
  });
  try {
    const settings = await openSettings(page);
    const radio = settings.getByRole("radio", { name: /Chatterbox/ });
    await expect(radio).toBeChecked();
    await radio.click();
    await expect(radio).toBeEnabled();
    expect(await owner()).toEqual(before);
    await closeSettings(page, settings);
    await expect(narration).toHaveAttribute("data-narration-phase", "playing");
    expect(errors).toEqual([]);
  } finally {
    await page.evaluate(() =>
      Reflect.get(globalThis, "__rnb").releaseOptionalSelection(),
    );
    await page.locator('[data-narration-action="stop"]').click();
  }
  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = Reflect.get(globalThis, "__rnb");
        return state.created - state.closed;
      }),
    )
    .toBe(0);
});

test("SPM-01/02 Settings reset completes contained recovery and reports partial writes", async ({
  page,
}) => {
  await installSyntheticService(page);
  await page.goto("/");
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").holdAfter = 0;
  });
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-spm.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body><p>Synthetic reset passage.</p></body></html>',
      }),
    ),
  });
  const initialSettings = await openSettings(page);
  await initialSettings
    .getByRole("radio", { name: "Spanish", exact: true })
    .click();
  await expect(
    initialSettings.getByRole("radio", { name: "Spanish", exact: true }),
  ).toBeChecked();
  await closeSettings(page, initialSettings);
  await page.locator('[data-narration-action="play"]').click();
  await expect
    .poll(() => page.evaluate(() => Reflect.get(globalThis, "__rnb").blocked))
    .toBe(true);
  await page.evaluate(() => Reflect.get(globalThis, "__rnb").failSynthesis());
  const narration = page.locator(".product-narration");
  await expect(narration).toHaveAttribute(
    "data-narration-recovery-phase",
    "recovery-available",
  );
  const settings = await openSettings(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Reflect.get(globalThis, "__rnb").restoreStorage = () => {
      Storage.prototype.setItem = original;
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === "voxleaf.narration.start-preference")
        throw new Error("synthetic denied write");
      original.call(this, key, value);
    };
  });
  await settings
    .getByRole("button", { name: "Reset narration settings" })
    .click();
  await expect(
    settings.getByText(
      "Not all narration settings were reset. Review the current values and try again.",
    ),
  ).toBeVisible();
  await expect(
    settings.getByRole("radio", { name: "English", exact: true }),
  ).toBeChecked();
  await expect(
    settings.getByRole("radio", { name: /Prepared playback/ }),
  ).toBeChecked();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("voxleaf.narration.start-preference")!)
          .mode,
    ),
  ).toBe("prepared");
  await page.evaluate(() => Reflect.get(globalThis, "__rnb").restoreStorage());
  await settings
    .getByRole("button", { name: "Reset narration settings" })
    .click();
  await expect(
    settings.getByRole("radio", { name: /Quick start/ }),
  ).toBeChecked();
  await expect(
    settings.getByText(
      "Not all narration settings were reset. Review the current values and try again.",
    ),
  ).toHaveCount(0);
  await expect(narration).toHaveAttribute(
    "data-narration-recovery-phase",
    "operational",
  );
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("voxleaf.narration.start-preference")!)
          .mode,
    ),
  ).toBe("quick");
  expect(
    await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
  ).toBe(1);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = Reflect.get(globalThis, "__rnb");
        return state.created - state.closed;
      }),
    )
    .toBe(0);
});

async function openNslBook(page: Page, name = "settings"): Promise<void> {
  await page.getByLabel("Open a book").setInputFiles({
    name: `synthetic-nsl-${name}.epub`,
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body><p>Synthetic settings passage.</p></body></html>',
      }),
    ),
  });
}

test("NSL-03 Stop finishes containment before Prepared-120000 changes to Quick", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.name));
  await installSyntheticService(page, false, false, false, true);
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem(
      "voxleaf.narration.start-preference",
      JSON.stringify({
        schemaVersion: 1,
        mode: "prepared",
        preparedTargetMs: 120_000,
      }),
    ),
  );
  await openNslBook(page);
  await page.locator('[data-narration-action="play"]').click();
  await expect(page.locator(".product-narration")).toHaveAttribute(
    "data-narration-phase",
    "playing",
  );
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").deferShutdown = true;
  });
  await page.locator('[data-narration-action="stop"]').click();
  await expect
    .poll(() =>
      page.evaluate(() => Reflect.get(globalThis, "__rnb").shutdownPending),
    )
    .toBe(true);
  const settings = await openSettings(page);
  await settings.getByRole("radio", { name: /Quick start/ }).click();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("voxleaf.narration.start-preference")!)
          .preparedTargetMs,
    ),
  ).toBe(120_000);
  await page.evaluate(() => {
    const state = Reflect.get(globalThis, "__rnb");
    state.deferShutdown = false;
    state.releaseShutdown();
  });
  await expect(
    settings.getByRole("radio", { name: /Quick start/ }),
  ).toBeChecked();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("voxleaf.narration.start-preference")!)
          .mode,
    ),
  ).toBe("quick");
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(() => {
      const s = Reflect.get(globalThis, "__rnb");
      return s.created - s.closed;
    }),
  ).toBe(0);
});

test("CCF-C12 / NSL-04 pending Reset protects mode, compact speed, and the current book", async ({
  page,
}) => {
  await installSyntheticService(page, false, false, false, true);
  await page.goto("/");
  await openNslBook(page);
  await page.locator('[data-narration-action="play"]').click();
  await expect(page.locator(".product-narration")).toHaveAttribute(
    "data-narration-phase",
    "playing",
  );
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").deferShutdown = true;
  });
  let settings = await openSettings(page);
  await settings
    .getByRole("button", { name: "Reset narration settings" })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() => Reflect.get(globalThis, "__rnb").shutdownPending),
    )
    .toBe(true);
  await closeSettings(page, settings);
  const bookPicker = page.getByLabel("Open a book");
  await expect(bookPicker).toBeDisabled();
  await bookPicker.evaluate((input: HTMLInputElement) => {
    const files = new DataTransfer();
    files.items.add(
      new File(["synthetic blocked replacement"], "blocked.epub"),
    );
    input.files = files.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await expect(page.locator(".product-narration")).toHaveCount(1);
  await expect(
    page.getByRole("combobox", { name: "Playback speed" }),
  ).toBeDisabled();
  settings = await openSettings(page);
  await expect(
    settings.getByRole("radio", { name: /Prepared playback/ }),
  ).toBeDisabled();
  await expect(
    settings.getByRole("button", { name: "Reset narration settings" }),
  ).toBeDisabled();
  await page.evaluate(() => {
    const state = Reflect.get(globalThis, "__rnb");
    state.deferShutdown = false;
    state.releaseShutdown();
  });
  await expect(
    settings.getByRole("radio", { name: /Prepared playback/ }),
  ).toBeEnabled();
  await settings.getByRole("radio", { name: /Prepared playback/ }).click();
  await expect(
    settings.getByRole("radio", { name: /Prepared playback/ }),
  ).toBeChecked();
  await closeSettings(page, settings);
  await expect(bookPicker).toBeEnabled();
  await page
    .getByRole("combobox", { name: "Playback speed" })
    .selectOption("75");
  await expect(
    page.getByRole("combobox", { name: "Playback speed" }),
  ).toHaveValue("75");
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("voxleaf.narration.start-preference")!)
          .preparedTargetMs,
    ),
  ).toBe(60_000);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(
          localStorage.getItem("voxleaf.narration.playback-preference")!,
        ).playbackRatePercent,
    ),
  ).toBe(75);
  expect(
    await page.evaluate(() => {
      const s = Reflect.get(globalThis, "__rnb");
      return s.created - s.closed;
    }),
  ).toBe(0);
});

test("NSL-01/02 absent-owner activation rejects after narrator attachment and permits explicit retry", async ({
  page,
}) => {
  await installSyntheticService(page, false, false, false, true, false, true);
  await page.goto("/");
  await openNslBook(page, "A");
  await page.locator('[data-narration-action="play"]').click();
  await expect(page.locator(".product-narration")).toHaveAttribute(
    "data-narration-phase",
    "playing",
  );
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").deferShutdown = true;
  });
  await openNslBook(page, "B");
  await expect
    .poll(() =>
      page.evaluate(() => Reflect.get(globalThis, "__rnb").shutdownPending),
    )
    .toBe(true);
  await expect(page.locator(".product-narration")).toHaveCount(0);
  const settings = await openSettings(page);
  await settings.getByRole("button", { name: "Activate Chatterbox" }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () => Reflect.get(globalThis, "__rnb").optionalSelectionPending,
      ),
    )
    .toBe(true);
  await page.evaluate(() => {
    const s = Reflect.get(globalThis, "__rnb");
    s.deferShutdown = false;
    s.releaseShutdown();
  });
  await expect(page.locator(".product-narration")).toHaveCount(1);
  const before = await page.evaluate(() => ({
    shutdowns: Reflect.get(globalThis, "__rnb").shutdownCalls,
    preference: localStorage.getItem("voxleaf.tts.profile-preference"),
  }));
  await page.evaluate(() =>
    Reflect.get(globalThis, "__rnb").releaseOptionalSelection(),
  );
  const message = settings.getByText(
    "Chatterbox could not be activated. Review the current narration settings and try again.",
  );
  await expect(message).toBeVisible();
  expect(
    await page.evaluate(() => ({
      shutdowns: Reflect.get(globalThis, "__rnb").shutdownCalls,
      preference: localStorage.getItem("voxleaf.tts.profile-preference"),
    })),
  ).toEqual(before);
  await settings.getByRole("button", { name: "Activate Chatterbox" }).click();
  await expect(message).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(
        () => Reflect.get(globalThis, "__rnb").optionalSelectionPending,
      ),
    )
    .toBe(true);
  await page.evaluate(() =>
    Reflect.get(globalThis, "__rnb").releaseOptionalSelection(),
  );
  await expect(settings.getByText("Chatterbox is active.")).toBeVisible();
  expect(
    await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
  ).toBe(1);
  expect(
    await page.evaluate(() => {
      const s = Reflect.get(globalThis, "__rnb");
      return s.created - s.closed;
    }),
  ).toBe(0);
});

for (const targetMs of [120_000, 300_000, 600_000]) {
  test(`MAF-11 completed Prepared ${targetMs} switches to Quick and restarts explicitly`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.name));
    await installSyntheticService(page, true);
    await page.goto("/");
    await page.evaluate(
      (target) =>
        localStorage.setItem(
          "voxleaf.narration.start-preference",
          JSON.stringify({
            schemaVersion: 1,
            mode: "prepared",
            preparedTargetMs: target,
          }),
        ),
      targetMs,
    );
    await page.getByLabel("Open a book").setInputFiles({
      name: "synthetic-maf-completion.epub",
      mimeType: "application/epub+zip",
      buffer: Buffer.from(
        await (
          await fixtures()
        ).buildMinimalEpubFixture({
          chapterDocument:
            '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body><p>Synthetic final short passage.</p></body></html>',
        }),
      ),
    });
    const narration = page.locator(".product-narration");
    await page.locator('[data-narration-action="play"]').click();
    await expect(narration).toHaveAttribute("data-narration-phase", "complete");
    const heard = await page.evaluate(() =>
      localStorage.getItem("voxleaf.reader.positions"),
    );
    const settings = await openSettings(page);
    await expect(
      settings.getByRole("radio", { name: /Prepared playback/ }),
    ).toBeChecked();
    await settings.getByRole("radio", { name: /Quick start/ }).click();
    await expect(
      settings.getByRole("radio", { name: /Quick start/ }),
    ).toBeChecked();
    await closeSettings(page, settings);
    expect(
      await page.evaluate(() =>
        localStorage.getItem("voxleaf.reader.positions"),
      ),
    ).toBe(heard);
    expect(
      await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
    ).toBe(1);
    await page.locator('[data-narration-action="details-toggle"]').click();
    await page.locator('[data-narration-action="visible-passage"]').click();
    await expect
      .poll(() => page.evaluate(() => Reflect.get(globalThis, "__rnb").service))
      .toBe(2);
    await expect(narration).toHaveAttribute("data-narration-phase", "complete");
    expect(errors).toEqual([]);
    const cleanupSettings = await openSettings(page);
    await cleanupSettings
      .getByRole("radio", { name: /Prepared playback/ })
      .click();
    await expect(
      cleanupSettings.getByRole("radio", { name: /Prepared playback/ }),
    ).toBeChecked();
    await closeSettings(page, cleanupSettings);
    await expect
      .poll(() =>
        page.evaluate(() => {
          const state = Reflect.get(globalThis, "__rnb");
          return state.created - state.closed;
        }),
      )
      .toBe(0);
  });
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

test("DCR-15 SAF-15 decorative ready and unavailable rasters have no Chromium image role", async ({
  page,
}) => {
  const fixture = await fixtures();
  await page.addInitScript(() => {
    const createObjectURL = URL.createObjectURL.bind(URL);
    let webpObjectUrls = 0;
    URL.createObjectURL = (object) => {
      if (object instanceof Blob && object.type === "image/webp")
        webpObjectUrls += 1;
      return createObjectURL(object);
    };
    Reflect.set(globalThis, "__dcrWebpObjectUrls", () => webpObjectUrls);
  });
  await page.goto("/");
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-saf-decorative.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await fixture.buildMinimalEpubFixture({
        packageDocument:
          '<package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/" version="3.0" unique-identifier="pub-id"><metadata><dc:identifier id="pub-id">urn:synthetic:saf-decorative</dc:identifier><dc:title>Synthetic decorative images</dc:title><dc:language>en</dc:language><meta property="dcterms:modified">2026-07-22T00:00:00Z</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/><item id="image" href="images/cover.png" media-type="image/png"/><item id="broken" href="images/broken.png" media-type="image/png"/><item id="early-webp" href="images/early.webp" media-type="image/webp"/></manifest><spine><itemref idref="chapter"/></spine></package>',
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Synthetic images</title></head><body><p>Decorative <img src="../images/cover.png" alt=""/> and unavailable <img src="../images/broken.png" alt="  "/>.</p><p>Missing <img src="../images/cover.png"/> and named <img src="../images/cover.png" alt="Synthetic named image"/>.</p><p><img src="../images/early.webp" alt="Synthetic unsupported WebP"/></p></body></html>',
        additionalEntries: [
          {
            name: "EPUB/images/cover.png",
            content: fixture.syntheticStaticPngBytes(),
          },
          { name: "EPUB/images/broken.png", content: Uint8Array.of(0, 1, 2) },
          {
            name: "EPUB/images/early.webp",
            content: syntheticEarlyAnimatedWebp("ANIM"),
          },
        ],
      }),
    ),
  });
  const reader = page.locator(".semantic-document");
  await expect(reader.locator("img")).toHaveCount(3);
  await expect(reader.locator('img[alt=""]')).toHaveCount(1);
  await expect(
    reader.locator('.semantic-raster-unavailable[aria-hidden="true"]'),
  ).toHaveAttribute("aria-hidden", "true");
  await expect(reader.getByRole("img")).toHaveCount(3);
  await expect(
    reader.getByRole("img", {
      name: "Synthetic unsupported WebP. Image unavailable.",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => Reflect.get(globalThis, "__dcrWebpObjectUrls")()),
  ).toBe(0);
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

test("DCR-01/06/10 output and recovery cancel stay inside the active playback owner", async ({
  page,
}) => {
  await installSyntheticService(page, true, false, true, true);
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.name));
  await page.goto("/");
  await page.evaluate(() => {
    const createBuffer = AudioContext.prototype.createBuffer;
    let fail = true;
    AudioContext.prototype.createBuffer = function (...args) {
      if (fail) {
        fail = false;
        throw new DOMException(
          "synthetic PCM allocation failure",
          "NotSupportedError",
        );
      }
      return createBuffer.apply(this, args);
    };
    const state = Reflect.get(globalThis, "__rnb");
    state.naturalAudioFrames = 360_000;
    const native = Reflect.get(globalThis, "__TAURI_INTERNALS__");
    const invoke = native.invoke;
    native.invoke = async (command: string, args: unknown) => {
      if (command === "prepare_tts_service" && state.service === 2) {
        state.recoveryWarmPending = true;
        await new Promise<void>((resolve) => {
          state.releaseRecoveryWarm = resolve;
        });
      }
      return invoke(command, args);
    };
  });
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-output-recovery.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body><p>${"Synthetic audio fixture for playback ownership. ".repeat(30)}</p></body></html>`,
      }),
    ),
  });
  const narration = page.locator(".product-narration");
  const play = page.locator('[data-narration-action="play"]');
  await play.click();
  await expect(narration).toHaveAttribute(
    "data-narration-failure",
    "audio-playback-failed",
  );
  expect(pageErrors).toEqual([]);
  await page.getByRole("button", { name: "Restart local narration" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => Reflect.get(globalThis, "__rnb").recoveryWarmPending),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Cancel start" }).click();
  await page.evaluate(() =>
    Reflect.get(globalThis, "__rnb").releaseRecoveryWarm(),
  );
  await expect(narration).toHaveAttribute(
    "data-narration-service-state",
    "stopped",
  );
  await expect(narration).toHaveAttribute(
    "data-narration-play-intent",
    "inactive",
  );
  await expect(
    narration.locator('[data-narration-action="recover"]'),
  ).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Playback speed" })
    .selectOption("75");
  await play.click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        Reflect.get(globalThis, "__rnb").workletMessages.includes("rendered"),
      ),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        Reflect.get(globalThis, "__rnb").releasePausedReceipt(),
      ),
    )
    .toBeGreaterThan(0);
  await expect(narration).toHaveAttribute("data-narration-phase", "paused");
  await expect(
    narration.getByRole("button", { name: "Stop", exact: true }),
  ).toBeVisible();
  await expect(narration).not.toHaveAttribute(
    "data-narration-command-to-audible-ms",
    "",
  );
  await narration.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(narration).toHaveAttribute(
    "data-narration-service-state",
    "stopped",
  );
  expect(pageErrors).toEqual([]);
});

test("DCR-20 RAC-01 verified close admits C at its observed passage after A fails", async ({
  page,
}) => {
  await installSyntheticService(page, false, false, false, true);
  await page.setViewportSize({ width: 640, height: 480 });
  await page.goto("/");
  await page.evaluate(() => {
    const state = Reflect.get(globalThis, "__rnb");
    state.audioFrames = 480_000;
    state.holdAfter = 1;
  });
  const open = async (book: "A" | "B" | "C") =>
    page.getByLabel("Open a book").setInputFiles({
      name: `synthetic-rac-${book}.epub`,
      mimeType: "application/epub+zip",
      buffer: Buffer.from(
        await (
          await fixtures()
        ).buildMinimalEpubFixture({
          chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body>${Array.from({ length: 60 }, (_, i) => `<p>${book === "C" && i === 25 ? "Target passage for replacement." : `Synthetic ${book} passage with quiet paths and ordinary details.`}</p>`).join("")}</body></html>`,
        }),
      ),
    });
  await open("A");
  await page.locator('[data-narration-action="play"]').click();
  await expect(page.locator(".product-narration")).toHaveAttribute(
    "data-narration-phase",
    "playing",
  );
  await expect
    .poll(() => page.evaluate(() => Reflect.get(globalThis, "__rnb").blocked))
    .toBe(true);
  await page.evaluate(() => {
    const state = Reflect.get(globalThis, "__rnb");
    state.deferShutdown = true;
    state.failSynthesis();
  });
  await expect(page.locator(".product-narration")).toHaveAttribute(
    "data-narration-failure",
    "tts-service-failed",
  );
  await open("B");
  await expect(page.locator(".semantic-document p").first()).toHaveText(
    "Synthetic B passage with quiet paths and ordinary details.",
  );
  await open("C");
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
    state.holdAfter = Number.MAX_SAFE_INTEGER;
    state.deferShutdown = false;
    state.releaseShutdown();
  });
  expect(
    await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
  ).toBe(1);
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

test("PSC-03 primary Play after Stop starts at the passively inspected paragraph", async ({
  page,
}) => {
  await installSyntheticService(page, false, false, false, true);
  await page.goto("/");
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").audioFrames = 480_000;
  });
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-psc-stop-play.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body>${Array.from({ length: 60 }, (_, i) => `<p>${i === 25 ? "Target passage B for fresh Play." : "Synthetic passage A with quiet paths and ordinary details."}</p>`).join("")}</body></html>`,
      }),
    ),
  });
  const narration = page.locator(".product-narration");
  await page.locator('[data-narration-action="play"]').click();
  await expect(narration).toHaveAttribute("data-narration-phase", "playing");
  await page.locator('[data-narration-action="pause"]').click();
  await expect(narration).toHaveAttribute("data-narration-phase", "paused");
  await page.evaluate(async () => {
    // Finish the initial highlight/follow settlement before passive inspection.
    for (let frame = 0; frame < 4; frame += 1)
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
    const viewport = document.querySelector<HTMLElement>(".reader-viewport")!;
    const target = document.querySelectorAll(".semantic-document p")[25]!;
    viewport.scrollTop +=
      target.getBoundingClientRect().top -
      viewport.getBoundingClientRect().top -
      24;
    // Scroll delivery plus the visual-locator tracker's scheduled sample.
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
  await expect(page.locator(".semantic-document p").nth(25)).toBeInViewport();
  await expect(narration).toHaveAttribute("data-narration-phase", "paused");
  await page.locator('[data-narration-action="stop"]').click();
  await expect(page.locator('[data-narration-action="play"]')).toBeEnabled();
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").prepared.length = 0;
  });
  // No further scroll or navigation action supplies another visible sample.
  await page.locator('[data-narration-action="play"]').click();
  await expect
    .poll(() =>
      page.evaluate(() => Reflect.get(globalThis, "__rnb").prepared[0]?.text),
    )
    .toBe("Target passage B for fresh Play.");
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

test("VUC-01 Resume follow then Stop and fresh Play uses the visible heard passage", async ({
  page,
}) => {
  await installSyntheticService(page, false, false, false, true);
  await page.goto("/");
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").audioFrames = 480_000;
  });
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-vuc-resume.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body>${Array.from({ length: 60 }, (_, i) => `<p>${i === 25 ? "Inspected passage B for fresh Play." : "Synthetic passage A with quiet paths and ordinary details."}</p>`).join("")}</body></html>`,
      }),
    ),
  });
  const narration = page.locator(".product-narration");
  const settleFrames = () =>
    page.evaluate(async () => {
      for (let frame = 0; frame < 4; frame += 1)
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
    });
  const savedCheckpoint = () =>
    page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("voxleaf.reader.positions") ?? "{}")
          .states?.[0]?.locator,
    );
  await page.locator('[data-narration-action="play"]').click();
  try {
    await expect(narration).toHaveAttribute("data-narration-phase", "playing");
    await settleFrames();
    await page.locator('[data-narration-action="pause"]').click();
    await expect(narration).toHaveAttribute("data-narration-phase", "paused");
    await settleFrames();
    const firstRange = await page.evaluate(
      () => Reflect.get(globalThis, "__rnb").prepared[0].sourceRange,
    );
    await expect.poll(savedCheckpoint).toEqual(firstRange.start);
    const created = await page.evaluate(
      () => Reflect.get(globalThis, "__rnb").created,
    );
    await page.mouse.move(0, 0);
    await page.evaluate(() => {
      const viewport = document.querySelector<HTMLElement>(".reader-viewport")!;
      const target = document.querySelectorAll(".semantic-document p")[25]!;
      viewport.scrollTop +=
        target.getBoundingClientRect().top -
        viewport.getBoundingClientRect().top -
        24;
    });
    await settleFrames();
    await expect(page.locator(".semantic-document p").nth(25)).toBeInViewport();
    // The preview leaf follows the sampled locator, not merely scroll geometry.
    await expect(page.locator(".paragraph-leaf")).toHaveAttribute(
      "data-leaf-state",
      "preview",
    );
    await expect
      .poll(() =>
        page.evaluate(() => {
          const host = document.querySelector<HTMLElement>(
            ".paragraph-leaf-host",
          )!;
          const root = host.parentElement!;
          const target = document.querySelectorAll(".semantic-document p")[25]!;
          return Math.abs(
            Number.parseFloat(
              host.style.getPropertyValue("--paragraph-leaf-top"),
            ) -
              (target.getBoundingClientRect().top -
                root.getBoundingClientRect().top),
          );
        }),
      )
      .toBeLessThan(1);
    await page.locator('[data-narration-action="resume"]').click();
    await expect(narration).toHaveAttribute("data-narration-phase", "playing");
    await settleFrames();
    await expect(page.locator(".semantic-document p").first()).toBeInViewport();
    expect(
      await page.evaluate(() => Reflect.get(globalThis, "__rnb").created),
    ).toBe(created);
    await page.locator('[data-narration-action="stop"]').click();
    await expect(page.locator('[data-narration-action="play"]')).toBeEnabled();
    // No successor segment or inspected B may replace the heard checkpoint.
    expect(await savedCheckpoint()).toEqual(firstRange.start);
    await page.evaluate(() => {
      Reflect.get(globalThis, "__rnb").prepared.length = 0;
    });
    // No new scroll/sample repairs the product locator between Stop and Play.
    await page.locator('[data-narration-action="play"]').click();
    await expect
      .poll(() =>
        page.evaluate(
          () => Reflect.get(globalThis, "__rnb").prepared[0]?.sourceRange,
        ),
      )
      .toEqual(firstRange);
  } finally {
    await page.locator('[data-narration-action="stop"]').click();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const state = Reflect.get(globalThis, "__rnb");
          return state.created - state.closed;
        }),
      )
      .toBe(0);
  }
});

test("five-pass 5.1 preserves the heard checkpoint when Stop precedes follow settlement", async ({
  page,
}) => {
  await installSyntheticService(page, true, false, false, true);
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/");
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").naturalAudioFrames = 480_000;
  });
  const chapterDocument = `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body><p>${"The quiet reader follows the path through the garden and remembers each ordinary detail. ".repeat(100)}</p>${"<p>Separate synthetic inspection passage.</p>".repeat(50)}</body></html>`;
  const bytes = await (
    await fixtures()
  ).buildMinimalEpubFixture({ chapterDocument });
  const opened = await openEpubPublication(bytes);
  if (!opened.ok) throw new Error("synthetic-follow-fixture-open-failed");
  const start = opened.publication.resolveLocator({
    ...opened.publication.locators[0]!.startLocator,
    textOffsetCodePoints: 2_000,
  });
  expect(start.locator.textOffsetCodePoints).toBe(2_000);
  await opened.publication.close();
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
  }, start.locator);
  const file = {
    name: "synthetic-five-pass-follow.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(bytes),
  };
  const saved = () =>
    page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("voxleaf.reader.positions") ?? "{}")
          .states?.[0]?.locator,
    );
  const settleFrames = () =>
    page.evaluate(async () => {
      for (let frame = 0; frame < 4; frame += 1)
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
    });
  const viewport = page.getByRole("region", {
    name: "Publication reading viewport",
  });
  const passages = page.locator(".semantic-document p");
  const narration = page.locator(".product-narration");
  const play = page.locator('[data-narration-action="play"]');
  const pause = page.locator('[data-narration-action="pause"]');
  const resume = page.locator('[data-narration-action="resume"]');
  const stop = page.locator('[data-narration-action="stop"]');
  await page.getByLabel("Open a book").setInputFiles(file);
  await expect(page.getByRole("status")).toHaveText(
    "Reading position restored.",
  );
  await expect(play).toBeEnabled();
  await play.click();
  await expect(narration).toHaveAttribute("data-narration-phase", "playing");
  const heard = await page.evaluate(
    () => Reflect.get(globalThis, "__rnb").prepared[0].sourceRange.start,
  );
  expect(heard.textOffsetCodePoints).toBeGreaterThan(0);
  await expect.poll(saved).toEqual(heard);
  await settleFrames();
  await pause.click();
  await expect(narration).toHaveAttribute("data-narration-phase", "paused");
  await page.mouse.move(0, 0);
  await passages.nth(25).evaluate((target) => {
    const root = target.closest<HTMLElement>(".reader-viewport")!;
    const readingLine = root.getBoundingClientRect().top + root.clientTop + 24;
    root.scrollTop += target.getBoundingClientRect().top - readingLine;
  });
  await expect(page.locator(".paragraph-leaf")).toHaveAttribute(
    "data-leaf-state",
    "preview",
  );
  await expect
    .poll(() =>
      passages.nth(25).evaluate((target) => {
        const host = target
          .closest(".reader-content")!
          .querySelector<HTMLElement>(".paragraph-leaf-host")!;
        return Math.abs(
          Number.parseFloat(
            host.style.getPropertyValue("--paragraph-leaf-top"),
          ) -
            (target.getBoundingClientRect().top -
              host.parentElement!.getBoundingClientRect().top),
        );
      }),
    )
    .toBeLessThan(1);

  await viewport.evaluate((root) => {
    const view = root.ownerDocument.defaultView!;
    const scrollBy = root.scrollBy.bind(root);
    const raf = view.requestAnimationFrame;
    const cancel = view.cancelAnimationFrame;
    const heldFrame = -51;
    const sampledPlacement = () => {
      const passage = root.querySelector(".semantic-document p")!;
      const block = passage.getBoundingClientRect();
      const bounds = root.getBoundingClientRect();
      const y = bounds.top + root.clientTop + 24;
      const x = Math.max(bounds.left + root.clientLeft, block.left) + 1;
      const caret = document.caretPositionFromPoint?.(x, y);
      let offset = 0;
      if (
        caret !== null &&
        caret !== undefined &&
        passage.contains(caret.offsetNode)
      ) {
        const prefix = document.createRange();
        prefix.selectNodeContents(passage);
        prefix.setEnd(caret.offsetNode, caret.offset);
        offset = Array.from(prefix.toString()).length;
      }
      return {
        scrollTop: root.scrollTop,
        viewportWidth: root.clientWidth,
        viewportHeight: root.clientHeight,
        compactHeight: document
          .querySelector(".product-narration-compact")!
          .getBoundingClientRect().height,
        summaryHeight: document
          .querySelector(".product-narration-summary")!
          .getBoundingClientRect().height,
        actionsHeight: document
          .querySelector(".product-narration-compact-actions")!
          .getBoundingClientRect().height,
        blockTop: block.top - bounds.top,
        crossing: block.top <= y && block.bottom >= y,
        offset,
      };
    };
    const trace = {
      before: 0,
      after: 0,
      scheduled: false,
      cancelled: false,
      event: undefined as Event | undefined,
      delivered: false,
      caretReads: 0,
      rangeReads: 0,
      writes: [] as number[],
      atStop: undefined as ReturnType<typeof sampledPlacement> | undefined,
      cancelledAtRelease: false,
    };
    const capture = (event: Event) => {
      if (!trace.scheduled || event.target !== root || !event.isTrusted) return;
      trace.event ??= event;
      event.stopImmediatePropagation();
    };
    root.addEventListener("scroll", capture, true);
    Object.defineProperty(root, "scrollBy", {
      configurable: true,
      value: (options: ScrollToOptions) => {
        trace.before = root.scrollTop;
        scrollBy(options);
        trace.after = root.scrollTop;
        if (trace.before === trace.after) return;
        // The follow controller schedules settlement directly after this native scroll.
        view.requestAnimationFrame = () => {
          view.requestAnimationFrame = raf;
          trace.scheduled = true;
          return heldFrame;
        };
      },
    });
    view.cancelAnimationFrame = (id) => {
      if (id === heldFrame) trace.cancelled = true;
      else cancel.call(view, id);
    };
    const caret = document.caretPositionFromPoint;
    const range = document.caretRangeFromPoint;
    const write = Storage.prototype.setItem;
    const narration = document.querySelector(".product-narration")!;
    const stopSettlement = new MutationObserver(() => {
      const play = narration.querySelector<HTMLButtonElement>(
        '[data-narration-action="play"]',
      );
      if (
        play === null ||
        play.disabled ||
        narration.getAttribute("data-narration-play-intent") !== "inactive"
      )
        return;
      stopSettlement.disconnect();
      trace.atStop = sampledPlacement();
      trace.cancelledAtRelease = trace.cancelled;
      root.removeEventListener("scroll", capture, true);
      Reflect.deleteProperty(root, "scrollBy");
      view.requestAnimationFrame = raf;
      view.cancelAnimationFrame = cancel;
      root.addEventListener(
        "scroll",
        () => {
          trace.delivered = true;
        },
        { once: true },
      );
      document.caretPositionFromPoint = (...args) => {
        trace.caretReads += 1;
        return caret.call(document, ...args);
      };
      document.caretRangeFromPoint = (...args) => {
        trace.rangeReads += 1;
        return range.call(document, ...args);
      };
      Storage.prototype.setItem = function (key, value) {
        if (key === "voxleaf.reader.positions") {
          trace.writes.push(
            JSON.parse(value).states[0].locator.textOffsetCodePoints,
          );
        }
        write.call(this, key, value);
      };
      root.dispatchEvent(new Event("scroll"));
    });
    stopSettlement.observe(narration, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    Reflect.set(globalThis, "__fivePassFollow", {
      trace,
      sampledPlacement,
      summarize: () => {
        document.caretPositionFromPoint = caret;
        document.caretRangeFromPoint = range;
        Storage.prototype.setItem = write;
        return {
          atStop: trace.atStop,
          cancelledAtRelease: trace.cancelledAtRelease,
          delivered: trace.delivered,
          caretReads: trace.caretReads,
          rangeReads: trace.rangeReads,
          writes: trace.writes,
        };
      },
    });
  });
  const beforeFollow = await page.evaluate(() =>
    Reflect.get(globalThis, "__fivePassFollow").sampledPlacement(),
  );
  await resume.click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          Reflect.get(globalThis, "__fivePassFollow").trace.event?.isTrusted ??
          false,
      ),
    )
    .toBe(true);
  const automatic = await page.evaluate(() => {
    const control = Reflect.get(globalThis, "__fivePassFollow");
    return {
      ...control.sampledPlacement(),
      before: control.trace.before,
      after: control.trace.after,
    };
  });
  expect(automatic.before - automatic.after).toBeGreaterThan(100);
  expect(automatic.crossing).toBe(true);
  expect(automatic.offset).not.toBe(heard.textOffsetCodePoints);
  await stop.click();
  await expect(play).toBeEnabled();
  await expect(narration).toHaveAttribute(
    "data-narration-play-intent",
    "inactive",
  );
  await settleFrames();
  await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  await settleFrames();
  const delivered = await page.evaluate(() =>
    Reflect.get(globalThis, "__fivePassFollow").summarize(),
  );
  const afterReplay = await page.evaluate(() =>
    Reflect.get(globalThis, "__fivePassFollow").sampledPlacement(),
  );
  console.log("five-pass 5.1 controlled delivery", {
    heard: heard.textOffsetCodePoints,
    beforeFollow,
    automatic,
    delivered,
    afterReplay,
  });
  expect(delivered.cancelledAtRelease).toBe(true);
  expect(delivered.delivered).toBe(true);
  expect(delivered.atStop.crossing).toBe(true);
  expect(delivered.atStop.offset).not.toBe(heard.textOffsetCodePoints);
  for (const placement of [automatic, delivered.atStop, afterReplay]) {
    expect(placement.viewportWidth).toBe(beforeFollow.viewportWidth);
    expect(placement.viewportHeight).toBe(beforeFollow.viewportHeight);
  }
  expect(await saved()).toEqual(heard);

  const reopen = async () => {
    await page.reload();
    await page.getByLabel("Open a book").setInputFiles(file);
    await expect(page.getByRole("status")).toHaveText(
      "Reading position restored.",
    );
    await expect(play).toBeEnabled();
  };
  await reopen();
  expect(await saved()).toEqual(heard);
  await viewport.hover();
  await page.mouse.wheel(0, 700);
  await expect.poll(saved).not.toEqual(heard);
  const manual = await saved();
  await reopen();
  expect(await saved()).toEqual(manual);
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
  await page.evaluate(async () => {
    // Drain the two-frame follow settlement and its one allowed correction;
    // visible=true alone only observes the initial synchronous scroll.
    for (let frame = 0; frame < 4; frame += 1) {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
    }
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

test("BNC-01 rejected navigation settles manual saves and requires explicit Play after compatibility", async ({
  page,
}) => {
  await installSyntheticService(page, false, false, false, true);
  await page.goto("/");
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").audioFrames = 360_000;
  });
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-bnc.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        packageDocument:
          '<package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/" version="3.0" unique-identifier="pub-id"><metadata><dc:identifier id="pub-id">urn:synthetic:bnc</dc:identifier><dc:title>Synthetic navigation</dc:title><dc:language>en</dc:language><meta property="dcterms:modified">2026-07-22T00:00:00Z</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/><item id="final" href="text/final.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="chapter"/><itemref idref="final"/></spine></package>',
        navigationDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc"><ol><li><a href="text/chapter.xhtml">Opening</a></li><li><a href="text/final.xhtml">Final</a></li></ol></nav></body></html>',
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml" lang="en"><head><title>Opening</title></head><body><p>Synthetic opening passage.</p></body></html>',
        additionalEntries: [
          {
            name: "EPUB/text/final.xhtml",
            content: `<html xmlns="http://www.w3.org/1999/xhtml" lang="en"><head><title>Final</title></head><body>${"<p>Synthetic final passage with quiet paths and ordinary details.</p>".repeat(60)}</body></html>`,
          },
        ],
      }),
    ),
  });
  const narration = page.locator(".product-narration");
  await page.locator('[data-narration-action="play"]').click();
  await expect(narration).toHaveAttribute("data-narration-phase", "playing");
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").deferConfiguration = true;
    for (const value of ["hidden", "visible"]) {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    }
  });
  await expect
    .poll(() =>
      page.evaluate(
        () => Reflect.get(globalThis, "__rnb").configurationPending,
      ),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Next chapter", exact: true }).click();
  await expect(narration).toHaveAttribute(
    "data-narration-navigation-settling",
    "false",
  );
  await expect(narration).toHaveAttribute(
    "data-narration-play-intent",
    "inactive",
  );
  await expect(page.locator(".semantic-document")).toContainText(
    "Synthetic final passage",
  );
  await page
    .locator(".semantic-document p")
    .nth(25)
    .evaluate((element) => element.scrollIntoView({ block: "start" }));
  const saved = () =>
    page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("voxleaf.reader.positions") ?? "{}")
          .states?.[0]?.locator,
    );
  await expect.poll(async () => (await saved())?.spineItemIndex).toBe(1);
  await expect
    .poll(async () => (await saved())?.anchor?.anchorIndex)
    .toBeGreaterThan(0);
  const target = await saved();
  expect(
    await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
  ).toBe(1);
  await page.evaluate(() =>
    Reflect.get(globalThis, "__rnb").releaseConfiguration(),
  );
  await expect(page.locator('[data-narration-action="play"]')).toBeEnabled();
  expect(
    await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
  ).toBe(1);
  const preparedBeforeRestart = await page.evaluate(
    () => Reflect.get(globalThis, "__rnb").prepared.length,
  );
  await page.locator('[data-narration-action="play"]').click();
  await expect(narration).toHaveAttribute("data-narration-phase", "playing");
  await expect
    .poll(() => page.evaluate(() => Reflect.get(globalThis, "__rnb").service))
    .toBe(2);
  const prepared = await page.evaluate(
    (start) =>
      Reflect.get(globalThis, "__rnb")
        .prepared.slice(start)
        .find((entry: { spine: number }) => entry.spine === 1),
    preparedBeforeRestart,
  );
  expect(prepared.sourceRange.start.anchor).toEqual(target.anchor);
  await page.locator('[data-narration-action="stop"]').click();
  await expect(narration).toHaveAttribute("data-narration-phase", "idle");
});

test("RAF-04 VCA-06/09 paused navigation survives passive scroll and reflow before Resume and Stop Play", async ({
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
  await page.setViewportSize({ width: 720, height: 520 });
  await page.locator(".reader-viewport").evaluate(async (element) => {
    element.scrollTop = 0;
    element.dispatchEvent(new Event("scroll"));
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
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
  await expect(narration).toHaveAttribute("data-narration-phase", "idle");
  await page.locator(".reader-viewport").evaluate(async (element) => {
    element.scrollTop = 0;
    element.dispatchEvent(new Event("scroll"));
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").prepared.length = 0;
  });
  await page.locator('[data-narration-action="play"]').click();
  await expect
    .poll(() =>
      page.evaluate(() => Reflect.get(globalThis, "__rnb").prepared[0]?.offset),
    )
    .toBe(0);
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
        navigationDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc"><ol><li><a href="a.bin">First fallback</a></li><li><a href="b.bin">Second fallback</a></li></ol></nav></body></html>',
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
  await page.getByRole("button", { name: "Show table of contents" }).click();
  await page
    .getByRole("button", { name: "Second fallback", exact: true })
    .click();
  await expect(page.locator(".semantic-document")).toContainText(
    "0.25 % 12:14:30",
  );
  await page.getByRole("button", { name: "Show table of contents" }).click();
  await page
    .getByRole("button", { name: "First fallback", exact: true })
    .click();
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
  test(`R8-08 / CHAT-AUDIT failed synthesis removes dead controls and supports explicit recovery (paused=${paused})`, async ({
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
    const previousServices = await page.evaluate(
      () => Reflect.get(globalThis, "__rnb").service,
    );
    await page.evaluate(() => {
      const state = Reflect.get(globalThis, "__rnb");
      state.originalAvailableRam = state.hostReport.memory.availablePhysicalMiB;
      state.hostReport.memory.availablePhysicalMiB = {
        status: "known",
        value: 1,
      };
      for (const value of ["hidden", "visible"]) {
        Object.defineProperty(document, "visibilityState", {
          configurable: true,
          value,
        });
        document.dispatchEvent(new Event("visibilitychange"));
      }
    });
    await expect(narration).toHaveAttribute(
      "data-narration-availability",
      "unavailable",
    );
    await expect(
      page.locator('[data-narration-action="recover"]'),
    ).toBeDisabled();
    await page
      .locator('[data-narration-action="recover"]')
      .evaluate((button: HTMLButtonElement) => button.click());
    expect(
      await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
    ).toBe(previousServices);
    await page.evaluate(() => {
      const state = Reflect.get(globalThis, "__rnb");
      state.hostReport.memory.availablePhysicalMiB = state.originalAvailableRam;
      for (const value of ["hidden", "visible"]) {
        Object.defineProperty(document, "visibilityState", {
          configurable: true,
          value,
        });
        document.dispatchEvent(new Event("visibilitychange"));
      }
    });
    await expect(
      page.locator('[data-narration-action="recover"]'),
    ).toBeEnabled();
    expect(
      await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
    ).toBe(previousServices);
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
    .click();
  await expect(
    completedSettings.getByRole("radio", { name: /Prepared playback/ }),
  ).toBeChecked();
  await completedSettings.getByRole("radio", { name: /Quick start/ }).click();
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

test("NCC final RCF-16 device completion retains newer inspected viewport and exact heard checkpoint", async ({
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
      const inspectedViewport = page.getByRole("region", {
        name: "Publication reading viewport",
      });
      await inspectedViewport.hover();
      await page.mouse.wheel(0, -20_000);
      await expect
        .poll(() => inspectedViewport.evaluate((element) => element.scrollTop))
        .toBe(0);
      await page.waitForTimeout(150);
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
      await expect(page.locator(".semantic-document p").first()).toBeInViewport(
        { ratio: 0.5 },
      );
      const viewport = page.getByRole("region", {
        name: "Publication reading viewport",
      });
      await viewport.hover();
      await page.mouse.wheel(0, 200);
      await page.waitForTimeout(150);
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

for (const rate of [100, 75] as const) {
  test(`CCF-C07/C09/C20 / RIA-03 preflight cancellation and confirmed rendering at ${rate}%`, ({
    page,
  }) => exerciseConfirmedRendering(page, rate));
}

async function exerciseConfirmedRendering(
  page: Page,
  rate: 100 | 75,
): Promise<void> {
  await installSyntheticService(
    page,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
  );
  await page.addInitScript(() => {
    const Original = globalThis.AudioContext;
    const gate = {
      pending: false,
      suspended: false,
      release: () => {},
      reject: () => {},
    };
    Object.assign(globalThis, { __ria: gate });
    globalThis.AudioContext = class extends Original {
      override resume(): Promise<void> {
        gate.pending = true;
        return new Promise<void>((resolve, reject) => {
          gate.release = () => {
            gate.pending = false;
            void super.resume().then(resolve, reject);
          };
          gate.reject = () => {
            gate.pending = false;
            reject(new Error("synthetic device rejection"));
          };
        });
      }
      override async suspend(): Promise<void> {
        await super.suspend();
        gate.suspended = true;
      }
    };
  });
  await page.goto("/");
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-ria.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body>${"<p>Synthetic playback passage.</p>".repeat(24)}</body></html>`,
      }),
    ),
  });
  const narration = page.locator(".product-narration");
  const saved = () =>
    page.evaluate(() => localStorage.getItem("voxleaf.reader.positions"));
  const play = page.locator('[data-narration-action="play"]');
  await expect(play).toBeEnabled();
  if (rate === 75) {
    await page
      .getByRole("combobox", { name: "Playback speed" })
      .selectOption("75");
    await page.evaluate(() => {
      Reflect.get(globalThis, "__rnb").deferConfiguration = true;
    });
    await play.click();
    await expect
      .poll(() =>
        page.evaluate(
          () => Reflect.get(globalThis, "__rnb").configurationPending,
        ),
      )
      .toBe(true);
    await page.getByRole("button", { name: "Cancel start" }).click();
    await expect(play).toBeEnabled();
    expect(
      await page.evaluate(() => Reflect.get(globalThis, "__rnb").service),
    ).toBe(0);
    await page.evaluate(() =>
      Reflect.get(globalThis, "__rnb").releaseConfiguration(),
    );
  }
  await play.click();
  await expect
    .poll(() => page.evaluate(() => Reflect.get(globalThis, "__ria").pending))
    .toBe(true);
  const before = await saved();
  await expect(
    page.getByRole("button", { name: "Cancel start" }),
  ).toBeVisible();
  await expect(narration.getByText("Preparing audio playback.")).toBeVisible();
  await page.waitForTimeout(400);
  await expect(narration).toHaveAttribute(
    "data-narration-command-to-audible-ms",
    "",
  );
  await expect(narration).toHaveAttribute("data-narration-playback-ms", "0");
  expect(
    await page.evaluate(() => CSS.highlights.has("voxleaf-narration-active")),
  ).toBe(false);
  expect(await saved()).toBe(before);
  await page.evaluate(() => Reflect.get(globalThis, "__ria").release());
  await expect
    .poll(() =>
      page.evaluate(() => CSS.highlights.has("voxleaf-narration-active")),
    )
    .toBe(true);
  await expect(
    page.getByRole("button", { name: "Stop", exact: true }),
  ).toBeVisible();
  await page.locator('[data-narration-action="pause"]').click();
  await expect
    .poll(() => page.evaluate(() => Reflect.get(globalThis, "__ria").suspended))
    .toBe(true);
  if (rate === 75)
    await expect
      .poll(() =>
        page.evaluate(() => Reflect.get(globalThis, "__rnb").workletPaused),
      )
      .toBe(true);
  await page.locator('[data-narration-action="resume"]').click();
  await expect
    .poll(() => page.evaluate(() => Reflect.get(globalThis, "__ria").pending))
    .toBe(true);
  const paused = Number(
    await narration.getAttribute("data-narration-playback-ms"),
  );
  await page.waitForTimeout(400);
  expect(
    Number(await narration.getAttribute("data-narration-playback-ms")),
  ).toBe(paused);
  await page.locator('[data-narration-action="stop"]').click();
  // Successful cleanup releases the player and returns to idle. Deliver the
  // obsolete rejection only after Play is available again, not during Stop.
  await expect(page.locator('[data-narration-action="play"]')).toBeEnabled();
  await page.evaluate(() => Reflect.get(globalThis, "__ria").reject());
  await expect(narration).toHaveAttribute("data-narration-phase", "idle");
  await expect(narration).toHaveAttribute(
    "data-narration-service-state",
    "stopped",
  );
  await expect(narration).toHaveAttribute("data-narration-failure", "none");
  await expect(narration).toHaveAttribute(
    "data-narration-recovery-phase",
    "operational",
  );
  await expect(page.locator('[data-narration-action="play"]')).toBeEnabled();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = Reflect.get(globalThis, "__rnb");
        return state.created - state.closed;
      }),
    )
    .toBe(0);

  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").naturalAudioFrames = 120;
  });
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-ccf-short.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(
      await (
        await fixtures()
      ).buildMinimalEpubFixture({
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Synthetic</title></head><body><p>Short synthetic passage.</p></body></html>',
      }),
    ),
  });
  await expect(play).toBeEnabled();
  await play.click();
  await expect
    .poll(() => page.evaluate(() => Reflect.get(globalThis, "__ria").pending))
    .toBe(true);
  await page.evaluate(() => Reflect.get(globalThis, "__ria").release());
  await expect(narration).toHaveAttribute("data-narration-phase", "complete");
  await expect(narration).toHaveAttribute(
    "data-narration-playback-ms",
    String(Math.ceil(12_000 / rate) / 24),
  );
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(play).toBeEnabled();
}

async function installSyntheticService(
  page: Page,
  naturalCompletion = false,
  holdFinalCompletion = false,
  auditWorkletFIFO = false,
  quickStart = false,
  optionalRecheck = false,
  optionalSelection = false,
  selectedChatterbox = false,
  mpaPlayback = false,
  syntheticDevelopmentProfile?: string,
  preparedTargetMs = 600_000,
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
      selectedChatterbox,
      mpaPlayback,
      syntheticDevelopmentProfile,
      preparedTargetMs,
    }) => {
      if (!naturalCompletion || !sessionStorage.getItem("nlc-initialized"))
        localStorage.clear();
      sessionStorage.setItem("nlc-initialized", "true");
      if (syntheticDevelopmentProfile !== undefined) {
        localStorage.setItem(
          "voxleaf.tts.profile-preference",
          JSON.stringify({
            schemaVersion: 1,
            profileId: syntheticDevelopmentProfile,
          }),
        );
      }
      if (optionalSelection) {
        Object.assign(hostReport, {
          cudaComputeCapability: { status: "known", major: 12, minor: 0 },
        });
        localStorage.setItem(
          "voxleaf.tts.profile-preference",
          JSON.stringify({
            schemaVersion: 1,
            profileId: selectedChatterbox
              ? "chatterbox-multilingual-v3-cuda-bf16-default-v4"
              : "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1",
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
            preparedTargetMs,
          }),
        );
      const observations = {
        hostReport,
        probes: 0,
        failProbe: false,
        deferProbe: false,
        releaseProbe: () => {},
        deferConfiguration: false,
        configurationPending: false,
        startedProfile: undefined as string | undefined,
        releaseConfiguration: () => {},
        optionalMutations: [] as string[],
        optionalRecovered: false,
        optionalSelectionPending: false,
        releaseOptionalSelection: () => {},
        deferRemoval: false,
        removalPending: false,
        releaseRemoval: () => {},
        lastGeneration: "",
        audioFrames: 24_000,
        naturalAudioFrames: undefined as number | undefined,
        holdAfter: Number.MAX_SAFE_INTEGER,
        calls: 0,
        blocked: false,
        failSynthesis: () => {},
        prepared: [] as Array<{
          text: string;
          sourceRange: NarrationSegmentV1["sourceRange"];
          spine: number;
          offset: number;
        }>,
        workletEnded: false,
        workletPaused: false,
        workletFailed: false,
        workletMessages: [] as string[],
        workletNodes: [] as AudioWorkletNode[],
        workletLifecycle: [] as string[][],
        failedDeliveredToSequence: -1,
        releaseWorkletMessages: () => {},
        releasePausedReceipt: () => 0,
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
            if (mpaPlayback) {
              observations.workletNodes.push(this);
              const lifecycle: string[] = [];
              observations.workletLifecycle.push(lifecycle);
              const postMessage = this.port.postMessage.bind(this.port);
              this.port.postMessage = (message, transfer = []) => {
                if (message.type === "dispose") lifecycle.push("dispose");
                if (Array.isArray(transfer)) postMessage(message, transfer);
                else postMessage(message, transfer);
              };
              const close = this.port.close.bind(this.port);
              this.port.close = () => {
                lifecycle.push("close");
                close();
              };
            }
            this.port.addEventListener("message", (event) => {
              if (event.data.type === "ended") observations.ended += 1;
              if (event.data.type === "paused")
                observations.workletPaused = true;
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
              observations.releasePausedReceipt = () => {
                const index = queued.findIndex(
                  (event) => event.data.type === "paused",
                );
                if (index < 0) return 0;
                const event = queued.splice(index, 1)[0]!;
                consumer?.(event);
                return event.data.renderedFrames as number;
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
            args?: { segment: NarrationSegmentV1; profileId?: string },
          ) => {
            switch (command) {
              case "detect_host_profile_compatibility":
                observations.probes += 1;
                if (observations.failProbe) throw "tts-service-unavailable";
                if (observations.deferProbe)
                  await new Promise<void>((resolve) => {
                    observations.releaseProbe = () => {
                      observations.deferProbe = false;
                      resolve();
                    };
                  });
                return observations.hostReport;
              case "optional_chatterbox_snapshot":
                if (observations.optionalRecovered)
                  return { ...installedOptional(), state: "absent" };
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
                  if (
                    observations.hostReport.providers.cuda
                      .availableDedicatedMemoryMiB.value === 0
                  )
                    throw "tts-optional-profile-incompatible-host";
                  observations.optionalSelectionPending = true;
                  await new Promise<void>((resolve) => {
                    observations.releaseOptionalSelection = resolve;
                  });
                  observations.optionalSelectionPending = false;
                  return installedOptional();
                }
                observations.optionalMutations.push(command);
                throw "tts-service-unavailable";
              case "remove_optional_chatterbox":
                if (observations.deferRemoval) {
                  observations.removalPending = true;
                  await new Promise<void>((resolve) => {
                    observations.releaseRemoval = resolve;
                  });
                  observations.removalPending = false;
                }
                observations.optionalMutations.push(command);
                throw "tts-optional-profile-cleanup-failed";
              case "download_optional_chatterbox":
                observations.optionalMutations.push(command);
                throw "tts-service-unavailable";
              case "tts_profile_configuration_available":
                if (observations.deferConfiguration) {
                  observations.configurationPending = true;
                  await new Promise<void>((resolve) => {
                    observations.releaseConfiguration = () => {
                      observations.deferConfiguration = false;
                      observations.configurationPending = false;
                      resolve();
                    };
                  });
                }
                return true;
              case "exact_tts_demo_available":
                return syntheticDevelopmentProfile !== undefined;
              case "start_tts_service":
                observations.startedProfile = args?.profileId;
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
                    sourceRange: segment.sourceRange,
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
                  observations.naturalAudioFrames ??
                    (observations.synthesized++ === 0 ||
                    auditWorkletFIFO ||
                    mpaPlayback
                      ? 48_000
                      : 1_200),
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
      selectedChatterbox,
      mpaPlayback,
      syntheticDevelopmentProfile,
      preparedTargetMs,
    },
  );
}

function auditPassages(count: number): string {
  return Array.from(
    { length: count },
    (_, index) =>
      `<p id="audit-${index}">Synthetic audit passage ${index}. Quiet readers inspect this ordinary paragraph.</p>`,
  ).join("");
}

async function openAuditPassages(
  page: Page,
  count: number,
  nextChapter = false,
) {
  const fixture = await fixtures();
  const bytes = await fixture.buildMinimalEpubFixture({
    chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Audit passages</title></head><body>${auditPassages(count)}</body></html>`,
    ...(nextChapter
      ? {
          packageDocument: fixture
            .minimalPackageDocument()
            .replace(
              "</manifest>",
              '<item id="final" href="text/final.xhtml" media-type="application/xhtml+xml"/></manifest>',
            )
            .replace("</spine>", '<itemref idref="final"/></spine>'),
          navigationDocument: fixture
            .minimalNavigationDocument()
            .replace("#chapter-one", ""),
          additionalEntries: [
            {
              name: "EPUB/text/final.xhtml",
              content:
                '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Final audit</title></head><body><h1>Final audit chapter</h1><p>Final audit content.</p></body></html>',
            },
          ],
        }
      : {
          navigationDocument: fixture
            .minimalNavigationDocument()
            .replace("#chapter-one", ""),
        }),
  });
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-audit-passages.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(bytes),
  });
  await expect(page.locator('[data-narration-action="play"]')).toBeEnabled();
}

async function sampleAuditPassage(page: Page, index: number) {
  await page.mouse.move(0, 0);
  await page.locator(".reader-viewport").evaluate((root, targetIndex) => {
    const target = root.querySelectorAll(".semantic-document p")[targetIndex]!;
    root.scrollTop +=
      target.getBoundingClientRect().top -
      root.getBoundingClientRect().top -
      24;
  }, index);
  await expectAuditLeafAt(page, index);
}

async function expectAuditLeafAt(page: Page, index: number) {
  await expect
    .poll(() =>
      page.evaluate((targetIndex) => {
        const host = document.querySelector<HTMLElement>(
          ".paragraph-leaf-host",
        )!;
        const target = document.querySelectorAll(".semantic-document p")[
          targetIndex
        ]!;
        return Math.abs(
          Number.parseFloat(
            host.style.getPropertyValue("--paragraph-leaf-top"),
          ) -
            (target.getBoundingClientRect().top -
              host.parentElement!.getBoundingClientRect().top),
        );
      }, index),
    )
    .toBeLessThan(1);
}

for (const intent of ["playing boundary", "paused leaf"] as const) {
  test(`five-pass 1.1 latest chapter owns playback over a delayed ${intent}`, async ({
    page,
  }) => {
    await installSyntheticService(page, false, false, false, true);
    await page.goto("/");
    await page.evaluate(() => {
      const state = Reflect.get(globalThis, "__rnb");
      state.audioFrames = 480_000;
      state.auditSynthesisPending = 0;
      state.auditSynthesis = [];
      const native = Reflect.get(globalThis, "__TAURI_INTERNALS__");
      const invoke = native.invoke;
      native.invoke = async (
        command: string,
        args?: { segment?: NarrationSegmentV1 },
      ) => {
        if (command !== "synthesize_tts_segment" || args?.segment === undefined)
          return invoke(command, args);
        const { generationId, sourceRange } = args.segment;
        state.auditSynthesis.push({
          generationId,
          spine: sourceRange.start.spineItemIndex,
        });
        state.auditSynthesisPending += 1;
        try {
          return await invoke(command, args);
        } finally {
          state.auditSynthesisPending -= 1;
        }
      };
    });
    await openAuditPassages(page, 3, true);
    const narration = page.locator(".product-narration");
    await page.locator('[data-narration-action="details-toggle"]').click();
    await page.locator('[data-narration-action="play"]').click();
    await expect(narration).toHaveAttribute("data-narration-phase", "playing");
    await expect
      .poll(async () =>
        Number(await narration.getAttribute("data-narration-accepted-units")),
      )
      .toBeGreaterThanOrEqual(3);
    await expect
      .poll(() =>
        page.evaluate(
          () => Reflect.get(globalThis, "__rnb").auditSynthesisPending,
        ),
      )
      .toBe(0);
    const initial = await page.evaluate(() => {
      const state = Reflect.get(globalThis, "__rnb");
      state.deferShutdown = true;
      return { generation: state.lastGeneration };
    });
    try {
      if (intent === "paused leaf") {
        await page.locator('[data-narration-action="pause"]').click();
        await expect(narration).toHaveAttribute(
          "data-narration-phase",
          "paused",
        );
        await page.locator(".semantic-document p").nth(1).hover();
        await page.locator(".paragraph-leaf").click();
      } else
        await page.locator('[data-narration-action="next-passage"]').click();
      await expect
        .poll(() =>
          page.evaluate(() => Reflect.get(globalThis, "__rnb").shutdownPending),
        )
        .toBe(true);
      await page.getByRole("button", { name: "Next chapter" }).click();
      await expect(page.locator(".semantic-document p").first()).toHaveText(
        /Synthetic audit passage 0/,
      );
    } finally {
      await page.evaluate(() => {
        const state = Reflect.get(globalThis, "__rnb");
        state.deferShutdown = false;
        state.releaseShutdown();
      });
    }
    await expect(
      page.getByRole("heading", { name: "Final audit chapter", exact: true }),
    ).toBeVisible();
    if (intent === "paused leaf") {
      await expect(narration).toHaveAttribute(
        "data-narration-play-intent",
        "paused",
      );
      await page.locator('[data-narration-action="resume"]').click();
    }
    await expect(narration).toHaveAttribute("data-narration-phase", "playing");
    const final = await page.evaluate((initialGeneration) => {
      const state = Reflect.get(globalThis, "__rnb");
      return {
        shutdowns: state.shutdownCalls,
        generation: state.lastGeneration,
        next: state.auditSynthesis.filter(
          (record: { generationId: string }) =>
            record.generationId !== initialGeneration,
        ) as Array<{ generationId: string; spine: number }>,
      };
    }, initial.generation);
    expect(final.shutdowns).toBe(1);
    expect(final.generation).not.toBe(initial.generation);
    expect(final.next.length).toBeGreaterThan(0);
    expect(new Set(final.next.map(({ spine }) => spine))).toEqual(new Set([1]));
    expect(new Set(final.next.map(({ generationId }) => generationId))).toEqual(
      new Set([final.generation]),
    );
    await page.locator('[data-narration-action="stop"]').click();
  });
}

test("five-pass 3.1 first failed playback recovers from the attempted visible passage", async ({
  page,
}) => {
  await installSyntheticService(page, true, false, false, true);
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/");
  await page.evaluate(() => {
    const nativeBuffer = AudioContext.prototype.createBuffer;
    let fail = true;
    AudioContext.prototype.createBuffer = function (...args) {
      if (fail) {
        fail = false;
        throw new DOMException(
          "synthetic first allocation failure",
          "NotSupportedError",
        );
      }
      return nativeBuffer.apply(this, args);
    };
    Reflect.get(globalThis, "__rnb").naturalAudioFrames = 480_000;
  });
  await openAuditPassages(page, 80);
  const narration = page.locator(".product-narration");
  await sampleAuditPassage(page, 25);
  await page.locator('[data-narration-action="play"]').click();
  await expect(narration).toHaveAttribute(
    "data-narration-failure",
    "audio-playback-failed",
  );
  await expect(narration).toHaveAttribute(
    "data-narration-command-to-audible-ms",
    "",
  );
  const firstAnchor = (service: number) =>
    page.evaluate((target) => {
      const state = Reflect.get(globalThis, "__rnb");
      return state.requests.find(
        (request: { service: number }) => request.service === target,
      )?.anchor;
    }, service);
  expect(await firstAnchor(1)).toBe(25);
  const recover = page.locator('[data-narration-action="recover"]');
  await expect(recover).toBeEnabled();
  // The recovery notice can resize the viewport and restore B. Deliver the
  // inspection after ResizeObserver and the restorer's 12-frame bound.
  const geometry = await page
    .locator(".reader-viewport")
    .evaluate(async (root) => {
      const nextFrame = () =>
        new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const measure = () => [
        root.clientWidth,
        root.clientHeight,
        root.scrollTop,
      ];
      for (let frame = 0; frame < 14; frame += 1) await nextFrame();
      const before = measure();
      await nextFrame();
      return { before, after: measure() };
    });
  expect(geometry.after).toEqual(geometry.before);
  await expectAuditLeafAt(page, 25);
  await sampleAuditPassage(page, 45);
  await recover.click();
  await expect.poll(() => firstAnchor(2)).toBe(25);
  await expect(narration).toHaveAttribute("data-narration-phase", "playing");
  await page.locator('[data-narration-action="stop"]').click();
});

for (const moveAgain of [false, true]) {
  test(`five-pass 4.1 cancelled recovery preserves the manual visible passage (move again=${moveAgain})`, async ({
    page,
  }) => {
    await installSyntheticService(
      page,
      true,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
    );
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto("/");
    await page.evaluate(() => {
      const state = Reflect.get(globalThis, "__rnb");
      state.naturalAudioFrames = 480_000;
      const native = Reflect.get(globalThis, "__TAURI_INTERNALS__");
      const invoke = native.invoke;
      native.invoke = async (command: string, args: unknown) => {
        if (command === "prepare_tts_service" && state.service === 2) {
          state.auditWarmPending = true;
          await new Promise<void>((resolve) => {
            state.releaseAuditWarm = resolve;
          });
        }
        return invoke(command, args);
      };
    });
    await openAuditPassages(page, 80);
    const narration = page.locator(".product-narration");
    await page.getByLabel("Playback speed", { exact: true }).selectOption("75");
    await page.locator('[data-narration-action="play"]').click();
    await expect(narration).toHaveAttribute(
      "data-narration-command-to-audible-ms",
      /^\d+$/,
    );
    await sampleAuditPassage(page, 25);
    await page.evaluate(() =>
      Reflect.get(globalThis, "__rnb").workletNodes[0].dispatchEvent(
        new ErrorEvent("error"),
      ),
    );
    await expect(narration).toHaveAttribute(
      "data-narration-recovery-phase",
      "recovery-available",
    );
    await page.locator('[data-narration-action="recover"]').click();
    try {
      await expect
        .poll(() =>
          page.evaluate(
            () => Reflect.get(globalThis, "__rnb").auditWarmPending,
          ),
        )
        .toBe(true);
      if (moveAgain) await sampleAuditPassage(page, 45);
      await page.getByRole("button", { name: "Cancel start" }).click();
    } finally {
      await page.evaluate(() =>
        Reflect.get(globalThis, "__rnb").releaseAuditWarm?.(),
      );
    }
    await expect(narration).toHaveAttribute(
      "data-narration-play-intent",
      "inactive",
    );
    const play = page.locator('[data-narration-action="play"]');
    await expect(play).toBeEnabled();
    await play.click();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const state = Reflect.get(globalThis, "__rnb");
          return state.requests.find(
            (request: { service: number }) => request.service === 3,
          )?.anchor;
        }),
      )
      .toBe(moveAgain ? 45 : 25);
    await expect(narration).toHaveAttribute("data-narration-phase", "playing");
    await page.locator('[data-narration-action="stop"]').click();
  });
}

test("five-pass 3.2 rechecks Prepared lead before first source allocation", async ({
  page,
}) => {
  await installSyntheticService(
    page,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    undefined,
    60_000,
  );
  await page.goto("/");
  await page.evaluate(() => {
    const state = Reflect.get(globalThis, "__rnb");
    state.audioFrames = 360_000;
    state.auditSourceStarts = 0;
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...args) {
      state.auditSourceStarts += 1;
      return start.apply(this, args);
    };
    const native = Reflect.get(globalThis, "__TAURI_INTERNALS__");
    const invoke = native.invoke;
    let synthesis = 0;
    native.invoke = async (command: string, args: unknown) => {
      const result = await invoke(command, args);
      if (command === "synthesize_tts_segment" && ++synthesis === 4) {
        state.auditFourthPending = true;
        await new Promise<void>((resolve) => {
          state.releaseAuditFourth = resolve;
        });
        state.auditFourthPending = false;
      }
      return result;
    };
  });
  await openAuditPassages(page, 6);
  const narration = page.locator(".product-narration");
  const speed = page.getByLabel("Playback speed", { exact: true });
  try {
    await speed.selectOption("75");
    await page.locator('[data-narration-action="play"]').click();
    await expect(narration).toHaveAttribute(
      "data-narration-target-ms",
      "60000",
    );
    await expect(narration).toHaveAttribute(
      "data-narration-accepted-sample-frames",
      "1080000",
    );
    await expect
      .poll(() =>
        page.evaluate(() => Reflect.get(globalThis, "__rnb").preparing),
      )
      .toBe(true);
    await speed.selectOption("100");
    await expect
      .poll(() =>
        page.evaluate(
          () => Reflect.get(globalThis, "__rnb").auditFourthPending,
        ),
      )
      .toBe(true);
    await expect(narration).toHaveAttribute(
      "data-narration-phase",
      "preparing",
    );
    await expect(narration).toHaveAttribute(
      "data-narration-playable-ms",
      "45000",
    );
    await expect(narration).toHaveAttribute(
      "data-narration-active-rate-percent",
      "none",
    );
    await page.evaluate(() => Reflect.get(globalThis, "__rnb").release());
    await expect
      .poll(() =>
        page.evaluate(() => Reflect.get(globalThis, "__rnb").preparing),
      )
      .toBe(false);
    expect(
      await page.evaluate(
        () => Reflect.get(globalThis, "__rnb").auditSourceStarts,
      ),
    ).toBe(0);
    await page.evaluate(() =>
      Reflect.get(globalThis, "__rnb").releaseAuditFourth(),
    );
    await expect(narration).toHaveAttribute("data-narration-phase", "playing");
    await expect(narration).toHaveAttribute(
      "data-narration-active-rate-percent",
      "100",
    );
    await expect
      .poll(() =>
        page.evaluate(() => Reflect.get(globalThis, "__rnb").auditSourceStarts),
      )
      .toBeGreaterThan(0);
    await expect(narration).toHaveAttribute(
      "data-narration-command-to-audible-ms",
      /^\d+$/,
    );
  } finally {
    await page.evaluate(() => {
      const state = Reflect.get(globalThis, "__rnb");
      state.release();
      state.releaseAuditFourth?.();
    });
  }
  await page.locator('[data-narration-action="stop"]').click();
});

for (const owner of ["pointer", "focus"] as const) {
  test(`five-pass 5.2 ${owner} leaf retains its paragraph through audible progress`, async ({
    page,
  }) => {
    await installSyntheticService(page, true, false, false, true);
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto("/");
    await page.evaluate(() => {
      const state = Reflect.get(globalThis, "__rnb");
      state.naturalAudioFrames = 480_000;
      const native = Reflect.get(globalThis, "__TAURI_INTERNALS__");
      const invoke = native.invoke;
      let synthesis = 0;
      native.invoke = async (command: string, args: unknown) => {
        const result = await invoke(command, args);
        if (command === "synthesize_tts_segment" && ++synthesis === 1)
          return new Float32Array(48_000).buffer;
        return result;
      };
      const create = AudioContext.prototype.createBufferSource;
      let firstSource = true;
      AudioContext.prototype.createBufferSource = function () {
        const source = create.call(this);
        if (!firstSource) return source;
        firstSource = false;
        const onended = Object.getOwnPropertyDescriptor(
          AudioScheduledSourceNode.prototype,
          "onended",
        )!;
        Object.defineProperty(source, "onended", {
          configurable: true,
          get: () => onended.get!.call(source),
          set: (callback: ((event: Event) => void) | null) =>
            onended.set!.call(
              source,
              callback === null
                ? null
                : (event: Event) => {
                    state.auditCompletionPending = true;
                    state.releaseAuditCompletion = () => {
                      state.auditCompletionPending = false;
                      callback.call(source, event);
                    };
                  },
            ),
        });
        return source;
      };
    });
    const fixture = await fixtures();
    await page.getByLabel("Open a book").setInputFiles({
      name: "synthetic-leaf-ownership.epub",
      mimeType: "application/epub+zip",
      buffer: Buffer.from(
        await fixture.buildMinimalEpubFixture({
          navigationDocument: fixture
            .minimalNavigationDocument()
            .replace("#chapter-one", ""),
          chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Leaf ownership</title></head><body><p>${"The listener reads this quiet passage while the paragraph stays within the viewport. ".repeat(4)}</p><p>Inspected paragraph B.</p><p>Separate synthetic passage C.</p></body></html>`,
        }),
      ),
    });
    const narration = page.locator(".product-narration");
    const viewport = page.locator(".reader-viewport");
    const passageB = page.locator(".semantic-document p").nth(1);
    const leaf = page.locator(".paragraph-leaf");
    const highlightOffset = () =>
      page.evaluate(
        () =>
          [...(CSS.highlights.get("voxleaf-narration-active") ?? [])][0]
            ?.startOffset,
      );
    await page.locator('[data-narration-action="play"]').click();
    try {
      await expect(narration).toHaveAttribute(
        "data-narration-phase",
        "playing",
      );
      await expect.poll(highlightOffset).toBe(0);
      const next = await page.evaluate(
        () => Reflect.get(globalThis, "__rnb").prepared[1].sourceRange.start,
      );
      expect(next.anchor.anchorIndex).toBe(0);
      expect(next.textOffsetCodePoints).toBeGreaterThan(0);
      await expect(passageB).toBeInViewport({ ratio: 1 });
      const scroll = await viewport.evaluate((element) => element.scrollTop);
      await passageB.hover();
      await expectAuditLeafAt(page, 1);
      if (owner === "focus") {
        await leaf.focus();
        await page.mouse.move(0, 0);
        await expect(leaf).toBeFocused();
      }
      expect(await viewport.evaluate((element) => element.scrollTop)).toBe(
        scroll,
      );
      await expect
        .poll(() =>
          page.evaluate(
            () => Reflect.get(globalThis, "__rnb").auditCompletionPending,
          ),
        )
        .toBe(true);
      await page.evaluate(() =>
        Reflect.get(globalThis, "__rnb").releaseAuditCompletion(),
      );
      await expect.poll(highlightOffset).toBe(next.textOffsetCodePoints);
      await expectAuditLeafAt(page, 1);
      expect(await viewport.evaluate((element) => element.scrollTop)).toBe(
        scroll,
      );
      if (owner === "focus")
        await leaf.evaluate((element) => (element as HTMLElement).blur());
      else await page.mouse.move(0, 0);
      await expectAuditLeafAt(page, 0);
      await passageB.hover();
      await expectAuditLeafAt(page, 1);
      await leaf.click();
      await expect
        .poll(() =>
          page.evaluate(() => {
            const state = Reflect.get(globalThis, "__rnb");
            return state.requests.find(
              (request: { service: number }) => request.service === 2,
            )?.anchor;
          }),
        )
        .toBe(1);
    } finally {
      await page.evaluate(() => {
        const state = Reflect.get(globalThis, "__rnb");
        if (state.auditCompletionPending) state.releaseAuditCompletion();
      });
    }
    await page.locator('[data-narration-action="stop"]').click();
  });
}

test("five-pass 4.2 empty EPUB fragments are exact reader destinations", async ({
  page,
}) => {
  const fixture = await fixtures();
  const bytes = await fixture.buildMinimalEpubFixture({
    packageDocument: fixture
      .minimalPackageDocument()
      .replace(
        "</manifest>",
        '<item id="alias" href="text/alias.xhtml" media-type="application/xhtml+xml" properties="scripted" fallback="final"/><item id="final" href="text/final.xhtml" media-type="application/xhtml+xml"/></manifest>',
      )
      .replace(
        "</spine>",
        '<itemref idref="alias"/><itemref idref="final"/></spine>',
      ),
    chapterDocument:
      '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Opening</title></head><body><h1>Opening</h1><p><a href="alias.xhtml#">Inline alias start</a> <a href="final.xhtml#">Inline direct start</a></p></body></html>',
    navigationDocument:
      '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc"><ol><li><a href="text/alias.xhtml">Alias without fragment</a></li><li><a href="text/alias.xhtml#">Alias empty fragment</a></li><li><a href="text/final.xhtml#">Direct empty fragment</a></li><li><a href="text/alias.xhtml#missing">Alias missing fragment</a></li></ol></nav></body></html>',
    additionalEntries: [
      { name: "EPUB/text/alias.xhtml", content: "unused fallback source" },
      {
        name: "EPUB/text/final.xhtml",
        content:
          '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Final</title></head><body><h1>Final start</h1><p>Synthetic final passage.</p></body></html>',
      },
    ],
  });
  const opened = await openEpubPublication(bytes);
  if (!opened.ok) throw new Error("synthetic empty-fragment fixture failed");
  const start = opened.publication.locators.find(
    (block) => block.startLocator.spineItemIndex === 1,
  )!.startLocator;
  await opened.publication.close();
  await page.goto("/");
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-empty-fragment.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(bytes),
  });
  const saved = () =>
    page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("voxleaf.reader.positions") ?? "{}")
          .states?.[0]?.locator,
    );
  const status = page.locator(".reader-navigation-status");
  const exact = "Moved to the requested reading location.";
  const recovered =
    "The requested location was unavailable. Moved to the start of its reading section.";
  for (const [label, message] of [
    ["Alias without fragment", exact],
    ["Alias empty fragment", exact],
    ["Direct empty fragment", exact],
    ["Alias missing fragment", recovered],
  ] as const) {
    await page.getByRole("button", { name: "Show table of contents" }).click();
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(status).toHaveText(message);
    await expect.poll(saved).toEqual(start);
  }
  for (const label of ["Inline alias start", "Inline direct start"]) {
    await page.getByRole("button", { name: "Previous chapter" }).click();
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(status).toHaveText(exact);
    await expect.poll(saved).toEqual(start);
  }
});

test("R8-06 late chapter navigation preserves Settings focus", async ({
  page,
}) => {
  await installSyntheticService(page, false, false, false, true);
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
  await page.locator('[data-narration-action="play"]').click();
  await expect(page.locator(".product-narration")).toHaveAttribute(
    "data-narration-phase",
    "playing",
  );
  await page.evaluate(() => {
    Reflect.get(globalThis, "__rnb").deferShutdown = true;
  });
  await page.getByRole("button", { name: "Next chapter" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => Reflect.get(globalThis, "__rnb").shutdownPending),
    )
    .toBe(true);
  const settings = await openSettings(page);
  await page.evaluate(() => {
    const state = Reflect.get(globalThis, "__rnb");
    state.deferShutdown = false;
    state.releaseShutdown();
  });
  await expect(
    page.getByRole("heading", { level: 1, name: "Final" }),
  ).toBeAttached();
  await expect(
    settings.getByRole("button", { name: "Close Settings" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(settings.getByLabel("Text size")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(settings).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Settings", exact: true }),
  ).toBeFocused();
});
