import { expect, test, type Page } from "@playwright/test";
import report from "../../../../packages/shared/fixtures/contracts/host-profile-compatibility-report/v1/valid-synthetic.json" with { type: "json" };

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
    buildMinimalEpubFixture(options: {
      chapterDocument: string;
    }): Promise<Uint8Array>;
  }>;
}

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

async function installSyntheticService(
  page: Page,
  naturalCompletion = false,
): Promise<void> {
  await page.addInitScript(
    ({ hostReport, naturalCompletion }) => {
      if (!naturalCompletion || !sessionStorage.getItem("nlc-initialized"))
        localStorage.clear();
      sessionStorage.setItem("nlc-initialized", "true");
      if (!naturalCompletion)
        localStorage.setItem(
          "voxleaf.narration.start-preference",
          JSON.stringify({
            schemaVersion: 1,
            mode: "prepared",
            preparedTargetMs: 600_000,
          }),
        );
      const observations = {
        tailMinimum: 0,
        synthesized: 0,
        ended: 0,
        created: 0,
        closed: 0,
        service: 0,
        preparing: false,
        release: () => {},
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
      Object.assign(window, {
        __TAURI_INTERNALS__: {
          invoke: async (command: string) => {
            switch (command) {
              case "detect_host_profile_compatibility":
                return hostReport;
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
                if (!naturalCompletion) return new ArrayBuffer(24_000 * 4);
                const pcm = new Float32Array(
                  observations.synthesized++ === 0 ? 48_000 : 1_200,
                );
                if (pcm.length === 48_000) {
                  pcm.fill(0.25, 12_000, 16_000);
                  pcm.fill(-0.75, 42_000, 47_000);
                }
                return pcm.buffer;
              }
              case "shutdown_tts_service":
                return [state("stopping"), state("stopped")];
              default:
                throw "tts-service-unavailable";
            }
          },
        },
      });
    },
    { hostReport: report, naturalCompletion },
  );
}
