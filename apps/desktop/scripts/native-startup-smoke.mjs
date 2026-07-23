import console from "node:console";
import { once } from "node:events";
import { access, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { get } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, pathToFileURL, URL } from "node:url";

import { chromium } from "@playwright/test";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.resolve(scriptDirectory, "..");
const executablePath = path.join(
  desktopRoot,
  "src-tauri",
  "target",
  "release",
  "voxleaf-desktop.exe",
);
const STARTUP_TIMEOUT_MS = 90_000;
const OBSERVATION_WINDOW_MS = 500;
const FIXED_FAILURE_CODES = new Map([
  [
    "Native application exited before WebView startup.",
    "native-process-exited",
  ],
  [
    "Native WebView debugging endpoint did not start.",
    "debug-endpoint-timeout",
  ],
  ["Native WebView page did not become available.", "webview-page-timeout"],
  [
    "Native synthetic publication did not open.",
    "synthetic-publication-open-failed",
  ],
  [
    "Native publication raster image did not decode from a local object URL.",
    "synthetic-image-decode-failed",
  ],
  [
    "Native application did not clear the synthetic file selection.",
    "synthetic-selection-not-cleared",
  ],
  [
    "Native application exposed the synthetic fixture filename.",
    "synthetic-filename-exposed",
  ],
  [
    "Native publication raster image remained mounted after close.",
    "synthetic-image-not-released",
  ],
  ["Native application root did not mount.", "application-root-not-mounted"],
  [
    "Native application main landmark is not visible.",
    "application-main-not-visible",
  ],
  [
    "Native application emitted a page or console error.",
    "application-runtime-error",
  ],
  [
    "Native application attempted an external request.",
    "external-request-observed",
  ],
]);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function failureCode(error) {
  if (!(error instanceof Error)) {
    return "unexpected-error";
  }
  return (
    FIXED_FAILURE_CODES.get(error.message) ??
    (error.name === "TimeoutError" ? "playwright-timeout" : "unexpected-error")
  );
}

function isLocalApplicationUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return (
      url.protocol === "tauri:" ||
      url.protocol === "data:" ||
      url.protocol === "blob:" ||
      url.hostname === "tauri.localhost"
    );
  } catch {
    return false;
  }
}

async function reserveLoopbackPort() {
  const { createServer } = await import("node:net");
  const server = createServer();
  server.unref();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();

  assert(
    typeof address === "object" && address !== null,
    "Native startup smoke could not reserve a loopback port.",
  );
  const port = address.port;
  server.close();
  await once(server, "close");
  return port;
}

async function endpointIsReady(endpoint) {
  return await new Promise((resolve) => {
    const request = get(`${endpoint}/json/version`, (response) => {
      response.resume();
      resolve(response.statusCode === 200);
    });
    request.setTimeout(250, () => {
      request.destroy();
      resolve(false);
    });
    request.on("error", () => resolve(false));
  });
}

async function waitForEndpoint(endpoint, child) {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error("Native application exited before WebView startup.");
    }

    if (await endpointIsReady(endpoint)) {
      return;
    }

    await delay(100);
  }

  throw new Error("Native WebView debugging endpoint did not start.");
}

async function waitForPage(browser) {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const page = browser
      .contexts()
      .flatMap((context) => context.pages())
      .find((candidate) => isLocalApplicationUrl(candidate.url()));

    if (page !== undefined) {
      return page;
    }

    await delay(100);
  }

  throw new Error("Native WebView page did not become available.");
}

async function stopChild(child) {
  if (child.exitCode !== null) {
    return;
  }

  child.kill();
  await Promise.race([once(child, "exit"), delay(5_000)]);

  if (child.exitCode === null) {
    child.kill("SIGKILL");
    await Promise.race([once(child, "exit"), delay(5_000)]);
  }
}

async function run() {
  assert(
    process.platform === "win32",
    "Native startup smoke must run on Windows.",
  );
  await access(executablePath);

  const temporaryDirectory = await mkdtemp(
    path.join(tmpdir(), "voxleaf-native-startup-"),
  );
  const profileDirectory = path.join(temporaryDirectory, "webview-profile");
  const fixturePath = path.join(temporaryDirectory, "synthetic.epub");
  const fixtureModuleUrl = pathToFileURL(
    path.resolve(
      desktopRoot,
      "..",
      "..",
      "packages",
      "epub",
      "test-support",
      "epub-fixture.ts",
    ),
  );
  const { buildComprehensiveEpubFixture } = await import(fixtureModuleUrl.href);
  await mkdir(profileDirectory);
  await writeFile(fixturePath, await buildComprehensiveEpubFixture(), {
    flag: "wx",
  });
  const debugPort = await reserveLoopbackPort();
  const endpoint = `http://127.0.0.1:${debugPort}`;
  const child = spawn(executablePath, [], {
    cwd: desktopRoot,
    env: {
      ...process.env,
      WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${debugPort} --remote-debugging-address=127.0.0.1 --enable-features=msEdgeDevToolsWdpRemoteDebugging`,
      WEBVIEW2_USER_DATA_FOLDER: profileDirectory,
    },
    stdio: "ignore",
    windowsHide: true,
  });
  let browser;
  let stage = "WebView startup";
  let cleanupFailed = false;

  try {
    await waitForEndpoint(endpoint, child);
    stage = "CDP attachment";
    browser = await chromium.connectOverCDP(endpoint);
    const page = await waitForPage(browser);
    const context = page.context();
    let consoleErrorCount = 0;
    let pageErrorCount = 0;
    let logErrorCount = 0;
    let externalRequestCount = 0;

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrorCount += 1;
      }
    });
    page.on("pageerror", () => {
      pageErrorCount += 1;
    });
    page.on("request", (request) => {
      if (!isLocalApplicationUrl(request.url())) {
        externalRequestCount += 1;
      }
    });

    const cdp = await context.newCDPSession(page);
    cdp.on("Log.entryAdded", ({ entry }) => {
      if (entry.level === "error") {
        logErrorCount += 1;
      }
    });
    cdp.on("Runtime.exceptionThrown", () => {
      pageErrorCount += 1;
    });
    cdp.on("Network.requestWillBeSent", ({ request }) => {
      if (!isLocalApplicationUrl(request.url)) {
        externalRequestCount += 1;
      }
    });
    await Promise.all([
      cdp.send("Log.enable"),
      cdp.send("Runtime.enable"),
      cdp.send("Network.enable"),
    ]);

    stage = "application mount";
    const root = page.locator("#root");
    await root.waitFor({ state: "attached", timeout: STARTUP_TIMEOUT_MS });
    await page
      .getByRole("main")
      .waitFor({ state: "visible", timeout: STARTUP_TIMEOUT_MS });
    const rootMounted = await root.evaluate(
      (element) => element.childElementCount > 0,
    );

    stage = "synthetic file injection";
    const fileInput = page.getByLabel("Open a local EPUB");
    await fileInput.setInputFiles(fixturePath);
    stage = "synthetic publication settlement";
    await page.waitForFunction(
      () =>
        globalThis.document.querySelector('[role="status"]')?.textContent !==
        "Validating and opening the selected EPUB.",
      undefined,
      { timeout: STARTUP_TIMEOUT_MS },
    );
    const openStatus = await page.getByRole("status").textContent();
    const failureStageByStatus = Object.freeze({
      "That EPUB exceeds VoxLeaf's safe processing limits.":
        "synthetic resource-limit result",
      "That EPUB uses features VoxLeaf does not support yet.":
        "synthetic unsupported result",
      "That file is not a valid supported EPUB.": "synthetic invalid result",
      "This EPUB has no supported readable content.": "synthetic empty result",
      "VoxLeaf could not open that EPUB because of an internal failure.":
        "synthetic internal-failure result",
      "VoxLeaf could not read that local file.":
        "synthetic read-failure result",
    });

    if (openStatus !== "The EPUB opened successfully.") {
      stage = failureStageByStatus[openStatus] ?? "synthetic unexpected result";
      throw new Error("Native synthetic publication did not open.");
    }

    stage = "synthetic publication readiness";
    await page
      .getByRole("heading", {
        level: 2,
        name: "Synthetic comprehensive publication",
      })
      .waitFor({ state: "visible", timeout: STARTUP_TIMEOUT_MS });
    stage = "synthetic raster image presentation";
    await page
      .locator(".semantic-raster-host")
      .first()
      .scrollIntoViewIfNeeded();
    const publicationImage = page.getByRole("img", {
      name: "Synthetic cover",
      exact: true,
    });
    await publicationImage.waitFor({
      state: "visible",
      timeout: STARTUP_TIMEOUT_MS,
    });
    const imageObservation = await publicationImage.evaluate((image) => ({
      sourceIsLocalObjectUrl: image.src.startsWith("blob:"),
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    }));
    assert(
      imageObservation.sourceIsLocalObjectUrl &&
        imageObservation.naturalWidth === 1 &&
        imageObservation.naturalHeight === 1,
      "Native publication raster image did not decode from a local object URL.",
    );
    stage = "synthetic selection cleanup";
    assert(
      (await fileInput.inputValue()) === "",
      "Native application did not clear the synthetic file selection.",
    );
    assert(
      (await page.getByText("synthetic.epub").count()) === 0,
      "Native application exposed the synthetic fixture filename.",
    );

    stage = "synthetic publication close";
    await page.getByRole("button", { name: "Close EPUB" }).click();
    await page
      .getByText("No local EPUB is open.", { exact: true })
      .waitFor({ state: "visible", timeout: STARTUP_TIMEOUT_MS });
    assert(
      (await publicationImage.count()) === 0,
      "Native publication raster image remained mounted after close.",
    );

    const externalLoadedResourceCount = await page.evaluate(
      () =>
        globalThis.performance.getEntriesByType("resource").filter((entry) => {
          try {
            const url = new globalThis.URL(entry.name);
            return !(
              url.protocol === "tauri:" ||
              url.protocol === "data:" ||
              url.protocol === "blob:" ||
              url.hostname === "tauri.localhost"
            );
          } catch {
            return true;
          }
        }).length,
    );

    await delay(OBSERVATION_WINDOW_MS);

    stage = "startup assertions";
    assert(rootMounted, "Native application root did not mount.");
    assert(
      (await page.getByRole("main").isVisible()) === true,
      "Native application main landmark is not visible.",
    );
    assert(
      consoleErrorCount === 0 && pageErrorCount === 0 && logErrorCount === 0,
      "Native application emitted a page or console error.",
    );
    assert(
      externalLoadedResourceCount === 0 && externalRequestCount === 0,
      "Native application attempted an external request.",
    );

    console.log(
      "Native startup smoke passed: root mounted, synthetic EPUB image decoded locally, publication closed, no errors, no external requests.",
    );
  } catch (error) {
    console.error(
      `Native startup smoke failed during ${stage} [${failureCode(error)}].`,
    );
    process.exitCode = 1;
  } finally {
    try {
      if (browser !== undefined) {
        await browser.close();
      }
      await stopChild(child);
      await rm(temporaryDirectory, {
        force: true,
        maxRetries: 5,
        recursive: true,
        retryDelay: 200,
      });
    } catch {
      cleanupFailed = true;
    }

    if (cleanupFailed) {
      console.error("Native startup smoke cleanup failed.");
      process.exitCode = 1;
    }
  }
}

await run();
