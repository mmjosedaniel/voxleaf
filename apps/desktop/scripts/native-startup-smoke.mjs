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
const WEBDRIVER_TAB = "\uE004";
const WEBDRIVER_ENTER = "\uE007";
const WEBDRIVER_SPACE = "\uE00D";
const WEBDRIVER_PAGE_DOWN = "\uE00F";
const WEBDRIVER_END = "\uE010";
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
  [
    "Native reader did not fit the approved narrow viewport.",
    "synthetic-narrow-layout-failed",
  ],
  [
    "Native reader skip or return navigation was not keyboard operable.",
    "synthetic-keyboard-skip-failed",
  ],
  [
    "Native reader did not preserve native scrolling-key behavior.",
    "synthetic-native-scroll-key-failed",
  ],
  [
    "Native reader navigation was not keyboard operable.",
    "synthetic-keyboard-navigation-failed",
  ],
  [
    "Native reader controls did not expose the approved keyboard order.",
    "synthetic-keyboard-order-failed",
  ],
  [
    "Native reader accessibility media behavior was unavailable.",
    "synthetic-accessibility-media-failed",
  ],
  [
    "Native reader zoom behavior was unavailable.",
    "synthetic-zoom-layout-failed",
  ],
  [
    "Native reader preferences were not persisted or restored.",
    "synthetic-preferences-not-restored",
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

async function resolveExecutablePath(executable) {
  if (path.isAbsolute(executable)) {
    return executable;
  }

  const searchDirectories = [
    desktopRoot,
    ...(process.env.PATH ?? "")
      .split(path.delimiter)
      .map((directory) => directory.replace(/^"|"$/gu, ""))
      .filter((directory) => directory.length > 0),
  ];

  for (const directory of searchDirectories) {
    const candidate = path.resolve(directory, executable);
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Continue through the bounded PATH entries.
    }
  }

  return executable;
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

async function exerciseNativeReaderInteractionMatrix(driver) {
  await driver.setWindowRect(320, 640);
  await waitForCondition(
    driver,
    `return window.innerWidth <= 360 && window.innerHeight <= 680;`,
  );
  const narrowLayout = await driver.execute(
    `const reader = document.querySelector(".semantic-reader");
     const article = document.querySelector(".semantic-document");
     const controls = document.querySelector(".reader-preferences");
     const bounds = [reader, article, controls].map((element) =>
       element?.getBoundingClientRect(),
     );
     return {
       innerWidth: window.innerWidth,
       fits:
         window.innerWidth >= 300 &&
         document.documentElement.scrollWidth <= window.innerWidth &&
         bounds.every(
           (rect) =>
             rect !== undefined &&
             rect.left >= -0.5 &&
             rect.right <= window.innerWidth + 0.5,
         ),
     };`,
  );
  assert(
    narrowLayout?.fits === true,
    "Native reader did not fit the approved narrow viewport.",
  );

  const initialUrl = await driver.execute(`return window.location.href;`);
  const skipLink = await driver.findElement("a.reader-skip-link");
  await driver.sendKeys(skipLink, WEBDRIVER_ENTER);
  await waitForCondition(
    driver,
    `return document.activeElement?.matches(
       'article.semantic-document[aria-label="Current reading section"]',
     ) === true;`,
  );
  assert(
    (await driver.execute(`return window.location.href;`)) === initialUrl,
    "Native reader skip or return navigation was not keyboard operable.",
  );

  const article = await driver.findElement("article.semantic-document");
  const scrollBefore = await driver.execute(`return window.scrollY;`);
  await driver.sendKeys(article, WEBDRIVER_PAGE_DOWN);
  await waitForCondition(
    driver,
    `return window.scrollY > ${Number(scrollBefore)};`,
  );
  assert(
    (await driver.execute(
      `return document.activeElement?.matches(
         'article.semantic-document[aria-label="Current reading section"]',
       ) === true;`,
    )) === true,
    "Native reader did not preserve native scrolling-key behavior.",
  );

  const returnLink = await driver.findElement("a.reader-return-link");
  await driver.sendKeys(returnLink, WEBDRIVER_ENTER);
  await waitForCondition(
    driver,
    `return document.activeElement?.matches(
       'nav.reader-toc[aria-label="Table of contents"]',
     ) === true;`,
  );
  assert(
    (await driver.execute(`return window.location.href;`)) === initialUrl,
    "Native reader skip or return navigation was not keyboard operable.",
  );

  await driver.sendKeys(skipLink, WEBDRIVER_TAB);
  const textScaleControl = await driver.findElement('select[name="textScale"]');
  assert(
    (await driver.execute(
      `return document.activeElement?.getAttribute("name") === "textScale";`,
    )) === true,
    "Native reader controls did not expose the approved keyboard order.",
  );
  await driver.sendKeys(textScaleControl, WEBDRIVER_END);
  await waitForCondition(
    driver,
    `return document.querySelector('select[name="textScale"]')?.value ===
       "extra-large";`,
  );
  let activeControl = textScaleControl;
  for (const expectedName of ["lineSpacing", "contentWidth", "theme"]) {
    await driver.sendKeys(activeControl, WEBDRIVER_TAB);
    assert(
      (await driver.execute(
        `return document.activeElement?.getAttribute("name") ===
           ${JSON.stringify(expectedName)};`,
      )) === true,
      "Native reader controls did not expose the approved keyboard order.",
    );
    activeControl = await driver.findElement(`select[name="${expectedName}"]`);
  }

  const tocLinks = await driver.findElements("button.reader-toc-link");
  assert(
    tocLinks.length >= 2,
    "Native reader navigation was not keyboard operable.",
  );
  await driver.sendKeys(tocLinks[1], WEBDRIVER_ENTER);
  await waitForCondition(
    driver,
    `return Array.from(document.querySelectorAll("h1")).some(
       (heading) =>
         heading.textContent === "Continuation" &&
         document.activeElement === heading,
     );`,
  );
  const previousChapter = await driver.findElement(
    ".reader-chapter-controls button:first-child",
  );
  await driver.sendKeys(previousChapter, WEBDRIVER_SPACE);
  await waitForCondition(
    driver,
    `return Array.from(document.querySelectorAll("h1")).some(
       (heading) =>
         heading.textContent === "Opening" &&
         document.activeElement === heading,
     );`,
  );

  assert(
    (await driver.execute(
      `const values = {
         textScale: "extra-large",
         lineSpacing: "spacious",
         contentWidth: "narrow",
         theme: "system",
       };
       for (const [name, value] of Object.entries(values)) {
         const control = document.querySelector(\`select[name="\${name}"]\`);
         if (!(control instanceof HTMLSelectElement)) {
           return false;
         }
         control.value = value;
         control.dispatchEvent(new Event("change", { bubbles: true }));
       }
       return true;`,
    )) === true,
    "Native reader preferences were not persisted or restored.",
  );
  await waitForCondition(
    driver,
    `const serialized = localStorage.getItem("voxleaf.reader.preferences");
     if (serialized === null) {
       return false;
     }
     const preferences = JSON.parse(serialized);
     return preferences?.textScale === "extra-large" &&
       preferences?.lineSpacing === "spacious" &&
       preferences?.contentWidth === "narrow" &&
       preferences?.theme === "system";`,
  );

  await driver.executeCdp("Emulation.setEmulatedMedia", {
    media: "",
    features: [
      { name: "prefers-color-scheme", value: "dark" },
      { name: "prefers-reduced-motion", value: "reduce" },
      { name: "forced-colors", value: "active" },
    ],
  });
  const accessibilityMedia = await driver.execute(
    `const reader = document.querySelector(".semantic-reader");
     const navigation = document.querySelector(".reader-toc");
     if (!(reader instanceof HTMLElement) ||
         !(navigation instanceof HTMLElement)) {
       return undefined;
     }
     navigation.focus({ preventScroll: true });
     const focusStyle = getComputedStyle(navigation);
     return {
       dark: matchMedia("(prefers-color-scheme: dark)").matches,
       forcedColors: matchMedia("(forced-colors: active)").matches,
       reducedMotion: matchMedia(
         "(prefers-reduced-motion: reduce)",
       ).matches,
       colorScheme: getComputedStyle(reader).colorScheme,
       transitionDuration: getComputedStyle(reader).transitionDuration,
       outlineStyle: focusStyle.outlineStyle,
       outlineWidth: Number.parseFloat(focusStyle.outlineWidth),
     };`,
  );
  assert(
    accessibilityMedia?.dark === true &&
      accessibilityMedia.forcedColors === true &&
      accessibilityMedia.reducedMotion === true &&
      accessibilityMedia.colorScheme.includes("dark") &&
      accessibilityMedia.transitionDuration === "0s" &&
      accessibilityMedia.outlineStyle !== "none" &&
      accessibilityMedia.outlineWidth > 0,
    "Native reader accessibility media behavior was unavailable.",
  );
  await driver.executeCdp("Emulation.setPageScaleFactor", {
    pageScaleFactor: 1.25,
  });
  const zoomedLayout = await driver.execute(
    `const article = document.querySelector(".semantic-document");
     return {
       articleFits:
         article instanceof HTMLElement &&
         article.getBoundingClientRect().right <= window.innerWidth + 0.5,
       documentFits:
         document.documentElement.scrollWidth <= window.innerWidth,
       focusPreserved:
         document.activeElement?.matches(
           'nav.reader-toc[aria-label="Table of contents"]',
         ) === true,
       scale: window.visualViewport?.scale ?? 1,
     };`,
  );
  assert(
    zoomedLayout?.articleFits === true &&
      zoomedLayout.documentFits === true &&
      zoomedLayout.focusPreserved === true &&
      zoomedLayout.scale >= 1.24,
    "Native reader zoom behavior was unavailable.",
  );
  await driver.executeCdp("Emulation.setPageScaleFactor", {
    pageScaleFactor: 1,
  });
  await driver.executeCdp("Emulation.setEmulatedMedia", {
    media: "",
    features: [],
  });
  await driver.setWindowRect(960, 720);
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
  const { buildReaderNavigationEpubFixture } = await import(
    fixtureModuleUrl.href
  );
  await mkdir(profileDirectory);
  await writeFile(fixturePath, await buildReaderNavigationEpubFixture(), {
    flag: "wx",
  });

  const driverPort = await reserveLoopbackPort();
  const nativeDriverPort = await reserveLoopbackPort();
  const endpoint = `http://127.0.0.1:${driverPort}`;
  const tauriDriverPath = await resolveExecutablePath(
    process.env.VOXLEAF_TAURI_DRIVER_PATH ?? "tauri-driver.exe",
  );
  const edgeDriverPath = await resolveExecutablePath(
    process.env.VOXLEAF_EDGE_DRIVER_PATH ?? "msedgedriver.exe",
  );
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

    stage = "native reader interaction matrix";
    await exerciseNativeReaderInteractionMatrix(driver);

    stage = "synthetic restoration seed navigation";
    const restorationSeedLinks = await driver.findElements(
      "button.reader-toc-link",
    );
    assert(
      restorationSeedLinks.length >= 2,
      "Native application did not persist the synthetic continuation locator.",
    );
    await driver.sendKeys(restorationSeedLinks[1], WEBDRIVER_ENTER);
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
    await driver.setWindowRect(320, 640);
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
    await driver.execute(
      `document.querySelector('input[type="file"]')
         ?.focus({ preventScroll: true });
       return true;`,
    );
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
        `return document.activeElement ===
           document.querySelector('input[type="file"]');`,
      )) === true,
      "Native saved-position restoration moved keyboard focus.",
    );
    assert(
      (await driver.execute(
        `const reader = document.querySelector(".semantic-reader");
         const serialized = localStorage.getItem(
           "voxleaf.reader.preferences",
         );
         if (!(reader instanceof HTMLElement) || serialized === null) {
           return false;
         }
         const preferences = JSON.parse(serialized);
         return preferences?.textScale === "extra-large" &&
           preferences?.lineSpacing === "spacious" &&
           preferences?.contentWidth === "narrow" &&
           preferences?.theme === "system" &&
           reader.dataset.readerTextScale === "extra-large" &&
           reader.dataset.readerLineSpacing === "spacious" &&
           reader.dataset.readerContentWidth === "narrow" &&
           reader.dataset.readerTheme === "system" &&
           document.documentElement.scrollWidth <= window.innerWidth;`,
      )) === true,
      "Native reader preferences were not persisted or restored.",
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
    const performanceLogs = inspectPerformanceLogs(collectedPerformanceLogs);

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
      "Native startup smoke passed: root mounted, narrow and accessible keyboard reader matrix passed, synthetic EPUB image decoded locally, exact position and preferences survived restart/reselection, publication closed, no errors, no external requests.",
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
