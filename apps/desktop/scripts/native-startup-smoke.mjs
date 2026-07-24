import console from "node:console";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { access, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, pathToFileURL, URL } from "node:url";

import {
  WebDriverClient,
  WebDriverClientError,
} from "./native-webdriver-client.mjs";

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
  ["Tauri WebDriver exited before startup.", "tauri-driver-exited"],
  ["Tauri WebDriver did not become ready.", "tauri-driver-timeout"],
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
  [
    "Native application did not persist the synthetic continuation locator.",
    "synthetic-position-not-persisted",
  ],
  [
    "Native application did not restore the synthetic continuation locator.",
    "synthetic-position-not-restored",
  ],
  [
    "Native saved-position restoration moved keyboard focus.",
    "synthetic-restoration-focus-moved",
  ],
  [
    "Native saved-position restoration remained pending.",
    "synthetic-restoration-pending",
  ],
  [
    "Native saved-position restoration reached an unexpected safe state.",
    "synthetic-restoration-unexpected-state",
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
  ["Native driver logs were invalid.", "native-driver-log-invalid"],
]);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function failureCode(error) {
  if (error instanceof WebDriverClientError) {
    return error.code;
  }
  if (!(error instanceof Error)) {
    return "unexpected-error";
  }
  return FIXED_FAILURE_CODES.get(error.message) ?? "unexpected-error";
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

async function waitForDriver(endpoint, child, spawnState) {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  const readinessClient = new WebDriverClient(endpoint, {
    requestTimeoutMs: 500,
  });

  while (Date.now() < deadline) {
    if (spawnState.failed || child.exitCode !== null) {
      throw new Error("Tauri WebDriver exited before startup.");
    }

    if (await readinessClient.isReady()) {
      return;
    }

    await delay(100);
  }

  throw new Error("Tauri WebDriver did not become ready.");
}

async function waitForCondition(driver, script) {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if ((await driver.execute(script)) === true) {
      return;
    }
    await delay(100);
  }

  throw new WebDriverClientError("webdriver-condition-timeout");
}

async function observeSavedPositionRestoration(driver) {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  let observation;

  while (Date.now() < deadline) {
    observation = await driver.execute(
      `const statusText =
         document.querySelector(".open-status")?.textContent ?? "";
       const serialized = localStorage.getItem("voxleaf.reader.positions");
       let savedContinuation = false;
       try {
         savedContinuation =
           serialized !== null &&
           JSON.parse(serialized)?.states?.[0]?.locator?.spineItemIndex === 1;
       } catch {
         savedContinuation = false;
       }
       const continuationVisible = Array.from(
         document.querySelectorAll("h1"),
       ).some(
         (heading) =>
           heading.textContent === "Continuation" &&
           heading.getClientRects().length > 0,
       );
       const continuation = Array.from(document.querySelectorAll("h1")).find(
         (heading) => heading.textContent === "Continuation",
       );
       const continuationTop = continuation?.getBoundingClientRect().top;
       const status =
         statusText === "Reading position restored."
           ? "exact"
           : statusText ===
               "Reading position restored to the nearest available passage."
             ? "recovered"
             : statusText === "" ||
                 statusText === "Validating and opening the selected EPUB."
               ? "opening"
             : statusText === "Restoring saved reader state."
               ? "pending"
               : statusText === "The EPUB opened successfully."
                 ? "book-start"
                 : "other";
       return {
         continuationAligned:
           typeof continuationTop === "number" &&
           Math.abs(continuationTop - 24) <= 1,
         continuationVisible,
         documentScrolled: window.scrollY > 0,
         readerBusy:
           document.querySelector(".semantic-reader")
             ?.getAttribute("aria-busy") === "true",
         savedContinuation,
         status,
       };`,
    );
    if (
      observation?.status !== "opening" &&
      observation?.status !== "pending"
    ) {
      return observation;
    }
    await delay(100);
  }

  return observation;
}

function inspectPerformanceLogs(logs) {
  let externalRequestCount = 0;
  let runtimeErrorCount = 0;

  for (const entry of logs) {
    if (typeof entry?.message !== "string") {
      throw new Error("Native driver logs were invalid.");
    }

    let message;
    try {
      message = JSON.parse(entry.message)?.message;
    } catch {
      throw new Error("Native driver logs were invalid.");
    }

    if (
      message?.method === "Network.requestWillBeSent" &&
      !isLocalApplicationUrl(message.params?.request?.url)
    ) {
      externalRequestCount += 1;
    }
    if (
      message?.method === "Runtime.exceptionThrown" ||
      (message?.method === "Log.entryAdded" &&
        message.params?.entry?.level === "error")
    ) {
      runtimeErrorCount += 1;
    }
  }

  return { externalRequestCount, runtimeErrorCount };
}

async function stopChild(child) {
  if (child.exitCode !== null || child.pid === undefined) {
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

  const driverPort = await reserveLoopbackPort();
  const nativeDriverPort = await reserveLoopbackPort();
  const endpoint = `http://127.0.0.1:${driverPort}`;
  const tauriDriverPath =
    process.env.VOXLEAF_TAURI_DRIVER_PATH ?? "tauri-driver.exe";
  const edgeDriverPath =
    process.env.VOXLEAF_EDGE_DRIVER_PATH ?? "msedgedriver.exe";
  const child = spawn(
    tauriDriverPath,
    [
      "--port",
      String(driverPort),
      "--native-port",
      String(nativeDriverPort),
      "--native-driver",
      edgeDriverPath,
    ],
    {
      cwd: desktopRoot,
      env: process.env,
      stdio: "ignore",
      windowsHide: true,
    },
  );
  const spawnState = { failed: false };
  child.once("error", () => {
    spawnState.failed = true;
  });
  const driver = new WebDriverClient(endpoint, {
    requestTimeoutMs: STARTUP_TIMEOUT_MS,
  });
  let stage = "WebDriver startup";
  let cleanupFailed = false;
  const collectedBrowserLogs = [];
  const collectedPerformanceLogs = [];

  try {
    await waitForDriver(endpoint, child, spawnState);
    stage = "native WebView session creation";
    await driver.createSession(executablePath, profileDirectory);
    await Promise.all([
      driver.executeCdp("Log.enable"),
      driver.executeCdp("Runtime.enable"),
      driver.executeCdp("Network.enable"),
    ]);

    stage = "application mount";
    await waitForCondition(
      driver,
      `const root = document.querySelector("#root");
       const main = document.querySelector("main");
       return root?.childElementCount > 0 &&
         main !== null &&
         main.getClientRects().length > 0;`,
    );
    const rootMounted = await driver.execute(
      `return document.querySelector("#root")?.childElementCount > 0;`,
    );

    stage = "synthetic file injection";
    const fileInput = await driver.findElement('input[type="file"]');
    await driver.sendKeys(fileInput, fixturePath);
    stage = "synthetic publication settlement";
    await waitForCondition(
      driver,
      `const status = document.querySelector('[role="status"]');
       return status !== null &&
         status.textContent !== "Validating and opening the selected EPUB.";`,
    );
    const openStatus = await driver.execute(
      `return document.querySelector('[role="status"]')?.textContent ?? "";`,
    );
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
    await waitForCondition(
      driver,
      `return Array.from(document.querySelectorAll("h2")).some(
         (heading) =>
           heading.textContent === "Synthetic comprehensive publication" &&
           heading.getClientRects().length > 0,
       );`,
    );
    stage = "synthetic raster image presentation";
    await driver.execute(
      `document.querySelector(".semantic-raster-host")
         ?.scrollIntoView({ block: "center" });
       return true;`,
    );
    await waitForCondition(
      driver,
      `const image = document.querySelector('img[alt="Synthetic cover"]');
       return image !== null && image.getClientRects().length > 0;`,
    );
    const imageObservation = await driver.execute(
      `const image = document.querySelector('img[alt="Synthetic cover"]');
       return {
         sourceIsLocalObjectUrl: image?.src.startsWith("blob:") === true,
         naturalWidth: image?.naturalWidth ?? 0,
         naturalHeight: image?.naturalHeight ?? 0,
       };`,
    );
    assert(
      imageObservation?.sourceIsLocalObjectUrl === true &&
        imageObservation.naturalWidth === 1 &&
        imageObservation.naturalHeight === 1,
      "Native publication raster image did not decode from a local object URL.",
    );

    stage = "synthetic selection cleanup";
    assert(
      (await driver.execute(
        `return document.querySelector('input[type="file"]')?.value ?? "";`,
      )) === "",
      "Native application did not clear the synthetic file selection.",
    );
    assert(
      (await driver.execute(
        `return document.body.textContent?.includes("synthetic.epub") ?? false;`,
      )) === false,
      "Native application exposed the synthetic fixture filename.",
    );

    stage = "synthetic restoration seed navigation";
    assert(
      (await driver.execute(
        `const destination = Array.from(document.querySelectorAll("button"))
           .find((button) => button.textContent === "Continuation");
         destination?.click();
         return destination !== undefined;`,
      )) === true,
      "Native application did not persist the synthetic continuation locator.",
    );
    await waitForCondition(
      driver,
      `return Array.from(document.querySelectorAll("h1")).some(
         (heading) =>
           heading.textContent === "Continuation" &&
           heading.getClientRects().length > 0,
       );`,
    );
    await waitForCondition(
      driver,
      `const serialized = localStorage.getItem("voxleaf.reader.positions");
       if (serialized === null) {
         return false;
       }
       const envelope = JSON.parse(serialized);
       return envelope?.states?.[0]?.locator?.spineItemIndex === 1;`,
    );

    stage = "native restart preparation";
    await delay(OBSERVATION_WINDOW_MS);
    collectedBrowserLogs.push(...(await driver.getLogs("browser")));
    collectedPerformanceLogs.push(...(await driver.getLogs("performance")));
    await driver.deleteSession();

    stage = "native restart session creation";
    await driver.createSession(executablePath, profileDirectory);
    await Promise.all([
      driver.executeCdp("Log.enable"),
      driver.executeCdp("Runtime.enable"),
      driver.executeCdp("Network.enable"),
    ]);
    await waitForCondition(
      driver,
      `const root = document.querySelector("#root");
       const main = document.querySelector("main");
       return root?.childElementCount > 0 &&
         main !== null &&
         main.getClientRects().length > 0;`,
    );
    stage = "synthetic restart file injection";
    const restartFileInput = await driver.findElement('input[type="file"]');
    await driver.sendKeys(restartFileInput, fixturePath);
    stage = "synthetic saved-position restoration";
    const restorationObservation =
      await observeSavedPositionRestoration(driver);
    if (restorationObservation?.status === "pending") {
      stage =
        restorationObservation.savedContinuation &&
        restorationObservation.continuationVisible &&
        restorationObservation.readerBusy
          ? restorationObservation.continuationAligned
            ? "synthetic restoration pending after destination alignment"
            : restorationObservation.documentScrolled
              ? "synthetic restoration pending after destination adjustment"
              : "synthetic restoration pending before destination alignment"
          : "synthetic restoration pending before destination materialization";
      throw new Error("Native saved-position restoration remained pending.");
    }
    if (restorationObservation?.status !== "exact") {
      stage =
        restorationObservation?.savedContinuation === true
          ? "synthetic saved-position restoration result"
          : "synthetic saved-position persistence result";
      throw new Error(
        "Native saved-position restoration reached an unexpected safe state.",
      );
    }
    assert(
      (await driver.execute(
        `return Array.from(document.querySelectorAll("h1")).some(
           (heading) =>
             heading.textContent === "Continuation" &&
             heading.getClientRects().length > 0,
         );`,
      )) === true,
      "Native application did not restore the synthetic continuation locator.",
    );
    assert(
      (await driver.execute(
        `const continuation = Array.from(document.querySelectorAll("h1"))
           .find((heading) => heading.textContent === "Continuation");
         return document.activeElement !== continuation;`,
      )) === true,
      "Native saved-position restoration moved keyboard focus.",
    );

    stage = "synthetic publication close";
    const closeButton = await driver.findElement("button.close-publication");
    await driver.click(closeButton);
    await waitForCondition(
      driver,
      `return document.querySelector('[role="status"]')?.textContent ===
         "No local EPUB is open.";`,
    );
    assert(
      (await driver.findElements('img[alt="Synthetic cover"]')).length === 0,
      "Native publication raster image remained mounted after close.",
    );

    const externalLoadedResourceCount = await driver.execute(
      `return performance.getEntriesByType("resource").filter((entry) => {
         try {
           const url = new URL(entry.name);
           return !(
             url.protocol === "tauri:" ||
             url.protocol === "data:" ||
             url.protocol === "blob:" ||
             url.hostname === "tauri.localhost"
           );
         } catch {
           return true;
         }
       }).length;`,
    );

    await delay(OBSERVATION_WINDOW_MS);
    collectedBrowserLogs.push(...(await driver.getLogs("browser")));
    collectedPerformanceLogs.push(...(await driver.getLogs("performance")));
    const performanceLogs = inspectPerformanceLogs(
      collectedPerformanceLogs,
    );

    stage = "startup assertions";
    assert(rootMounted === true, "Native application root did not mount.");
    assert(
      (await driver.execute(
        `return document.querySelector("main")?.getClientRects().length > 0;`,
      )) === true,
      "Native application main landmark is not visible.",
    );
    assert(
      collectedBrowserLogs.every((entry) => entry?.level !== "SEVERE") &&
        performanceLogs.runtimeErrorCount === 0,
      "Native application emitted a page or console error.",
    );
    assert(
      externalLoadedResourceCount === 0 &&
        performanceLogs.externalRequestCount === 0,
      "Native application attempted an external request.",
    );

    console.log(
      "Native startup smoke passed: root mounted, synthetic EPUB image decoded locally, exact position survived restart/reselection, publication closed, no errors, no external requests.",
    );
  } catch (error) {
    console.error(
      `Native startup smoke failed during ${stage} [${failureCode(error)}].`,
    );
    process.exitCode = 1;
  } finally {
    if (driver.hasSession) {
      try {
        await driver.deleteSession();
      } catch {
        cleanupFailed = true;
      }
    }
    try {
      await stopChild(child);
    } catch {
      cleanupFailed = true;
    }
    try {
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
