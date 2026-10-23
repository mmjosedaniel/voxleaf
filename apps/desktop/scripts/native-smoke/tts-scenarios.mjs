import console from "node:console";
import path from "node:path";
import { setTimeout as wait } from "node:timers/promises";
import {
  runWebDriverElementInteractionWithRetry,
  WebDriverClientError,
} from "../native-webdriver-client.mjs";
import {
  assertNativeSmokeInvariant,
  assertNativeSmokeInvariants,
} from "../native-smoke-invariants.mjs";
import { PORTFOLIO_PLAYBACK_RATE_PERCENTS } from "../bilingual-portfolio-host.mjs";
import { selectAdaptiveTtsAlternateProfile } from "../adaptive-tts-profile-selection.mjs";

export function createNativeTtsScenarios({
  assert,
  waitForCondition,
  openReaderSettings,
  closeReaderSettings,
  injectNativeFile,
  ADAPTIVE_TTS_LANGUAGE,
  ADAPTIVE_TTS_PROFILE_ID,
  CHATTERBOX_BILINGUAL_PROFILE_ID,
  EXERCISE_PLAYBACK_SPEEDS,
  EXERCISE_READER_CORRECTIONS,
  EXPECTED_UNAVAILABLE_PROFILE_REASON,
  INTERACTION_TIMEOUT_MS,
  OPTIONAL_PROFILE_SELECTION_TIMEOUT_MS,
  OPTIONAL_PROFILE_VERIFICATION_TIMEOUT_MS,
  STARTUP_TIMEOUT_MS,
  SYNTHETIC_SENTENCE_TRANSITION_PAUSE_MS,
  WEBDRIVER_SPACE,
  generatedAudioFileCount,
  inspectPerformanceLogs,
  nvidiaSnapshot,
  percentile95,
  processWorkingSetBytes,
  rounded,
  startAdaptiveResourceSampler,
  waitForAdaptiveResourceCleanup,
  delay = wait,
  now = () => Date.now(),
}) {
  async function cancelAdaptiveStartup(driver, setStage) {
    setStage(
      "adaptive exact-host Cancel start during native model preparation",
    );
    const before = await driver.execute(
      `return globalThis.__TAURI_INTERNALS__.invoke("tts_service_lifecycle_observation");`,
    );
    assert(
      before?.schemaVersion === 1 &&
        before.state === "stopped" &&
        before.serviceInstanceId === null,
      "Native startup cancellation requires an unowned service.",
    );
    const play = await driver.findElement('[data-narration-action="play"]');
    await driver.sendKeys(play, WEBDRIVER_SPACE);
    await waitForCondition(
      driver,
      `return globalThis.__TAURI_INTERNALS__.invoke("tts_service_lifecycle_observation").then((state) => {
        const matched = state.schemaVersion === 1 && typeof state.serviceInstanceId === "string" && ["loading", "warming"].includes(state.state);
        if (matched) globalThis.__voxleafNarrationLifecycle.startupState = state;
        return matched;
      });`,
      STARTUP_TIMEOUT_MS,
    );
    const observed = await driver.execute(
      `return globalThis.__voxleafNarrationLifecycle.startupState;`,
    );
    const stillPreparing = await driver.execute(
      `return globalThis.__TAURI_INTERNALS__.invoke("tts_service_lifecycle_observation").then((state) =>
        state.serviceInstanceId === globalThis.__voxleafNarrationLifecycle.startupState.serviceInstanceId &&
        ["loading", "warming"].includes(state.state) &&
        document.querySelector('[data-narration-action="stop"]')?.textContent === "Cancel start");`,
    );
    assert(
      stillPreparing === true,
      "Native startup cancellation phase was not observed.",
    );
    const cancelStart = await driver.findElement(
      '[data-narration-action="stop"]',
    );
    const cancelAt = now();
    await driver.sendKeys(cancelStart, WEBDRIVER_SPACE);
    await waitForCondition(
      driver,
      `return globalThis.__TAURI_INTERNALS__.invoke("tts_service_lifecycle_observation").then((state) =>
        state.state === "stopped" && state.serviceInstanceId === null);`,
      Math.max(1, 2_000 - (now() - cancelAt)),
    );
    const startupShutdownMs = now() - cancelAt;
    await waitForCondition(
      driver,
      `const owner = document.querySelector(".product-narration"); return owner?.getAttribute("data-narration-phase") === "idle" && owner?.getAttribute("data-narration-service-state") === "stopped";`,
      Math.max(1, 5_000 - (now() - cancelAt)),
    );
    const startupCancellationMs = now() - cancelAt;
    assert(
      startupShutdownMs <= 2_000 && startupCancellationMs <= 5_000,
      "Native startup cancellation exceeded final cleanup bound.",
    );
    return {
      startupCancellationMs,
      startupNativePhase: observed.state,
      startupShutdownMs,
    };
  }

  async function installAdaptiveSynchronizationInstrumentation(driver) {
    const installed = await driver.execute(
      `const registry = CSS.highlights;
     if (
       registry === undefined ||
       typeof globalThis.Highlight !== "function"
     ) {
       return false;
     }
     globalThis.__voxleafAdaptiveSynchronizationInstrumentation?.stop?.();
     const documentIds = new WeakMap();
     let nextDocumentId = 1;
     const state = {
       active: true,
       clearCount: 0,
       currentDocumentId: undefined,
       currentKey: undefined,
       focusPreserved: true,
       followLatenciesMs: [],
       forbiddenKeys: new Map(),
       lastHighlight: undefined,
       maxDiscardedUnits: 0,
       maxRetainedUnits: 0,
       rangeValid: true,
       stalePlaybackObserved: false,
       transitionCount: 0,
       frame: 0,
     };
     const seekOwner = document.querySelector(".product-narration");
     const seek = {
       armed: false, initial: false, current: false, sawTrue: false,
       mutationCount: 0, firstTrueElapsedMs: null, startedAt: 0,
     };
     const observeSeek = (records) => {
       if (!state.active || !seek.armed) return;
       seek.current = seekOwner?.getAttribute(
         "data-narration-navigation-settling",
       ) === "true";
       seek.mutationCount = Math.min(1024, seek.mutationCount + records.length);
       if (seek.current || records.some((record) => record.oldValue === "true")) {
         seek.sawTrue = true;
         seek.firstTrueElapsedMs ??= performance.now() - seek.startedAt;
       }
     };
     const seekObserver = new MutationObserver(observeSeek);
     if (seekOwner !== null) seekObserver.observe(seekOwner, {
       attributes: true,
       attributeFilter: ["data-narration-navigation-settling"],
       attributeOldValue: true,
     });
     state.seekDiagnostic = seek;
     state.armSeekDiagnostic = () => {
       seekObserver.takeRecords();
       Object.assign(seek, {
         armed: true, initial: seekOwner?.getAttribute(
           "data-narration-navigation-settling",
         ) === "true", current: false, sawTrue: false,
         mutationCount: 0, firstTrueElapsedMs: null, startedAt: performance.now(),
       });
       observeSeek([]);
     };
     const leafSelector =
       "h1, h2, h3, h4, h5, h6, p, blockquote, li";
     const containingElement = (node) =>
       node instanceof Element ? node : node?.parentElement;
     const containerPath = (container, leaf) => {
       const indexes = [];
       for (let node = container; node !== leaf; node = node.parentNode) {
         const parent = node?.parentNode;
         if (parent === null || parent === undefined) return undefined;
         const index = Array.prototype.indexOf.call(parent.childNodes, node);
         if (index < 0) return undefined;
         indexes.push(index);
       }
       return indexes.reverse().join(".") || "root";
     };
     const rangeDetails = (highlight) => {
       const range = Array.from(highlight)[0];
       if (!(range instanceof Range) || range.collapsed) {
         return undefined;
       }
       const startElement = containingElement(range.startContainer);
       const endElement = containingElement(range.endContainer);
       const article = startElement?.closest(".semantic-document");
       if (
         !(article instanceof HTMLElement) ||
         endElement?.closest(".semantic-document") !== article ||
         !range.startContainer.isConnected ||
         !range.endContainer.isConnected
       ) {
         return undefined;
       }
       let documentId = documentIds.get(article);
       if (documentId === undefined) {
         documentId = nextDocumentId;
         nextDocumentId += 1;
         documentIds.set(article, documentId);
       }
       const leaves = Array.from(article.querySelectorAll(leafSelector));
       const startLeaf = startElement?.closest(leafSelector);
       const endLeaf = endElement?.closest(leafSelector);
       const startIndex = leaves.indexOf(startLeaf);
       const endIndex = leaves.indexOf(endLeaf);
       if (startIndex < 0 || endIndex < 0) {
         return undefined;
       }
       const startPath = containerPath(range.startContainer, startLeaf);
       const endPath = containerPath(range.endContainer, endLeaf);
       if (startPath === undefined || endPath === undefined) return undefined;
       return {
         article,
         documentId,
         key:
           String(documentId) + ":" +
           String(startIndex) + ":" +
           startPath + ":" +
           String(range.startOffset) + ":" +
           String(endIndex) + ":" +
           endPath + ":" +
           String(range.endOffset),
         range,
       };
     };
     const observeFollow = (details, focusOwner, startedAt, attempts = 0) => {
       if (!state.active) {
         return;
       }
       let rect;
       try {
         rect = details.range.getBoundingClientRect();
       } catch {
         state.rangeValid = false;
         return;
       }
       const readerViewport = details.article.closest(
         '[data-reader-scroll-owner="true"]',
       );
       const viewportBounds = readerViewport?.getBoundingClientRect();
       if (viewportBounds === undefined) {
         state.rangeValid = false;
         return;
       }
       const comfortInset = Math.min(
         24,
         Math.max(0, viewportBounds.height / 4),
       );
       const comfortTop = viewportBounds.top + comfortInset;
       const comfortBottom = viewportBounds.bottom - comfortInset;
       const inside =
         Number.isFinite(rect.top) &&
         Number.isFinite(rect.bottom) &&
         rect.bottom >= comfortTop - 1 &&
         rect.top <= comfortBottom + 1;
       if (inside || attempts >= 60) {
         if (state.followLatenciesMs.length < 64) {
           state.followLatenciesMs.push(performance.now() - startedAt);
         }
         state.rangeValid &&= inside;
         state.focusPreserved &&= document.activeElement === focusOwner;
         return;
       }
       requestAnimationFrame(() =>
         observeFollow(details, focusOwner, startedAt, attempts + 1),
       );
     };
     const sample = () => {
       if (!state.active) {
         return;
       }
       const owner = document.querySelector(".product-narration");
       state.maxRetainedUnits = Math.max(
         state.maxRetainedUnits,
         Number(owner?.getAttribute("data-narration-retained-units")) || 0,
       );
       state.maxDiscardedUnits = Math.max(
         state.maxDiscardedUnits,
         Number(owner?.getAttribute("data-narration-discarded-units")) || 0,
       );
       const highlight = registry.get("voxleaf-narration-active");
       if (highlight !== state.lastHighlight) {
         state.lastHighlight = highlight;
         if (highlight === undefined) {
           state.clearCount += 1;
           state.currentDocumentId = undefined;
           state.currentKey = undefined;
         } else {
           const details = rangeDetails(highlight);
           state.transitionCount += 1;
           if (details === undefined) {
             state.rangeValid = false;
           } else {
             state.currentDocumentId = details.documentId;
             state.currentKey = details.key;
             for (const [key, armed] of state.forbiddenKeys) {
               if (details.key === key) {
                 if (armed) {
                   state.stalePlaybackObserved = true;
                 }
               } else if (!armed) {
                 state.forbiddenKeys.set(key, true);
               }
             }
             observeFollow(
               details,
               document.activeElement,
               performance.now(),
             );
           }
         }
       }
       state.frame = requestAnimationFrame(sample);
     };
     state.stop = () => {
       state.active = false;
       seek.armed = false;
       seekObserver.disconnect();
       cancelAnimationFrame(state.frame);
     };
     Object.defineProperty(
       globalThis,
       "__voxleafAdaptiveSynchronizationInstrumentation",
       { configurable: true, value: state },
     );
     state.frame = requestAnimationFrame(sample);
     return true;`,
    );
    assert(installed === true, "Native synchronized narration proof failed.");
  }

  async function currentAdaptiveHighlightMarker(driver) {
    const marker = await driver.execute(
      `const state =
       globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
     if (
       state?.active !== true ||
       typeof state.currentKey !== "string"
     ) {
       return undefined;
     }
     state.armSeekDiagnostic();
     return {
       clearCount: state.clearCount,
       currentDocumentId: state.currentDocumentId,
       currentKey: state.currentKey,
       transitionCount: state.transitionCount,
     };`,
    );
    assert(
      typeof marker?.currentKey === "string" &&
        Number.isSafeInteger(marker.currentDocumentId) &&
        Number.isSafeInteger(marker.transitionCount) &&
        Number.isSafeInteger(marker.clearCount),
      "Native synchronized narration proof failed.",
    );
    return marker;
  }

  async function forbidAdaptiveHighlightKey(driver, key) {
    await waitForCondition(
      driver,
      `const state =
       globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
     return CSS.highlights?.has("voxleaf-narration-active") !== true ||
       state?.currentKey !== ${JSON.stringify(key)};`,
      STARTUP_TIMEOUT_MS,
    );
    const forbidden = await driver.execute(
      `const state =
       globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
     if (state?.active !== true) {
       return false;
     }
     state.forbiddenKeys.set(${JSON.stringify(key)}, false);
     return true;`,
    );
    assert(forbidden === true, "Native synchronized narration proof failed.");
  }

  async function adaptiveSynchronizationObservation(driver) {
    return await driver.execute(
      `const state =
       globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
     const styleRules = [];
     const collectRules = (rules) => {
       for (const rule of Array.from(rules ?? [])) {
         if ("cssRules" in rule) {
           try {
             collectRules(rule.cssRules);
           } catch {}
         }
         if (
           rule.selectorText ===
           "::highlight(voxleaf-narration-active)"
         ) {
           styleRules.push(rule);
         }
       }
     };
     for (const sheet of Array.from(document.styleSheets)) {
       try {
         collectRules(sheet.cssRules);
       } catch {}
     }
     const mainRule = styleRules.find(
       (rule) =>
         rule.style?.backgroundColor === "#ffd640" ||
         rule.style?.backgroundColor === "rgb(255, 214, 64)",
     );
     const parseColor = (value) => {
       const hex = /^#([0-9a-f]{6})$/iu.exec(value);
       if (hex !== null) {
         return [0, 2, 4].map((offset) =>
           Number.parseInt(hex[1].slice(offset, offset + 2), 16),
         );
       }
       const rgb = /^rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)$/u.exec(value);
       return rgb === null
         ? undefined
         : [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
     };
     const luminance = (channels) =>
       channels
         .map((channel) => channel / 255)
         .map((channel) =>
           channel <= 0.04045
             ? channel / 12.92
             : ((channel + 0.055) / 1.055) ** 2.4,
         )
         .reduce(
           (sum, channel, index) =>
             sum + channel * [0.2126, 0.7152, 0.0722][index],
           0,
         );
     const foreground = parseColor(mainRule?.style?.color ?? "");
     const background = parseColor(
       mainRule?.style?.backgroundColor ?? "",
     );
     const contrastRatio =
       foreground === undefined || background === undefined
         ? 0
         : (Math.max(luminance(foreground), luminance(background)) + 0.05) /
           (Math.min(luminance(foreground), luminance(background)) + 0.05);
     return state?.active !== true
       ? undefined
       : {
           clearCount: state.clearCount,
           contrastRatio,
           currentDocumentId: state.currentDocumentId,
           currentKey: state.currentKey,
           focusPreserved: state.focusPreserved,
           followLatenciesMs: [...state.followLatenciesMs],
           forcedColors: matchMedia("(forced-colors: active)").matches,
           highlightPresent:
             CSS.highlights?.has("voxleaf-narration-active") === true,
           maxDiscardedUnits: state.maxDiscardedUnits,
           maxRetainedUnits: state.maxRetainedUnits,
           rangeValid: state.rangeValid,
           readableHighlight:
             contrastRatio >= 4.5 &&
             mainRule?.style?.textDecorationLine.includes("underline") ===
               true,
           reducedMotion: matchMedia(
             "(prefers-reduced-motion: reduce)",
           ).matches,
           stalePlaybackObserved: state.stalePlaybackObserved,
           transitionCount: state.transitionCount,
         };`,
    );
  }

  async function adaptiveReaderExperienceObservation(driver) {
    return await driver.execute(
      `const viewport = document.querySelector(
       '[data-reader-scroll-owner="true"]',
     );
     const compact = document.querySelector(".product-narration-compact");
     const detailToggle = document.querySelector(
       '[data-narration-action="details-toggle"]',
     );
     const detail =
       detailToggle instanceof HTMLButtonElement
         ? document.getElementById(
             detailToggle.getAttribute("aria-controls") ?? "",
           )
         : null;
     const leaves = Array.from(document.querySelectorAll(".paragraph-leaf"));
     const leaf = leaves[0];
     return {
       compactVisible:
         compact instanceof HTMLElement &&
         compact.getClientRects().length > 0,
       detailExpanded:
         detailToggle?.getAttribute("aria-expanded") === "true",
       detailVisible:
         detail instanceof HTMLElement && detail.getClientRects().length > 0,
       leafAriaCurrent: leaf?.getAttribute("aria-current") === "true",
       leafCount: leaves.length,
       leafState:
         leaf instanceof HTMLElement
           ? leaf.getAttribute("data-leaf-state")
           : null,
       leafVisible:
         leaf instanceof HTMLElement && leaf.getClientRects().length > 0,
       progressBarCount: document.querySelectorAll(
         'progress, [role="progressbar"]',
       ).length,
       readerScrollOwnerCount: document.querySelectorAll(
         '[data-reader-scroll-owner="true"]',
       ).length,
       readerScrollOwnerVisible:
         viewport instanceof HTMLElement &&
         viewport.getClientRects().length > 0,
     };`,
    );
  }

  async function prepareParagraphLeafForInteraction(driver) {
    await waitForCondition(
      driver,
      `const leaf = document.querySelector(".paragraph-leaf");
     const host = leaf?.closest(".paragraph-leaf-host");
     const rect = leaf?.getBoundingClientRect();
     return leaf instanceof HTMLButtonElement &&
       host instanceof HTMLElement &&
       host.hidden === false &&
       leaf.disabled === false &&
       rect !== undefined && rect.width > 0 && rect.height > 0;`,
    );
    const focused = await driver.execute(
      `const leaf = document.querySelector(".paragraph-leaf");
     if (!(leaf instanceof HTMLButtonElement)) return false;
     leaf.scrollIntoView({ block: "center", inline: "nearest" });
     leaf.focus({ preventScroll: true });
     return document.activeElement === leaf;`,
    );
    assert(focused === true, "Native synchronized narration proof failed.");
    await waitForCondition(
      driver,
      `const leaf = document.querySelector(".paragraph-leaf");
     const host = leaf?.closest(".paragraph-leaf-host");
     const owner = document.querySelector('[data-reader-scroll-owner="true"]');
     if (!(leaf instanceof HTMLButtonElement) ||
         !(host instanceof HTMLElement) ||
         !(owner instanceof HTMLElement)) return false;
     const leafRect = leaf.getBoundingClientRect();
     const ownerRect = owner.getBoundingClientRect();
     return host.hidden === false &&
       leaf.disabled === false &&
       document.activeElement === leaf &&
       leafRect.width > 0 && leafRect.height > 0 &&
       leafRect.bottom > ownerRect.top && leafRect.top < ownerRect.bottom &&
       leafRect.right > ownerRect.left && leafRect.left < ownerRect.right;`,
    );
    return await driver.findElement(".paragraph-leaf");
  }

  async function paragraphLeafActivationDelivered(driver) {
    try {
      await waitForCondition(
        driver,
        `return document.querySelector(".paragraph-leaf")
         ?.getAttribute("data-leaf-state") === "preparing";`,
        5_000,
      );
      return true;
    } catch (error) {
      if (
        error instanceof WebDriverClientError &&
        error.code === "webdriver-condition-timeout"
      ) {
        return false;
      }
      throw error;
    }
  }

  async function adaptiveActiveHighlightPerceivability(driver) {
    return await driver.execute(
      `const highlightName = "voxleaf-narration-active";
     const registry = CSS.highlights;
     const highlight = registry?.get(highlightName);
     const ranges =
       highlight === undefined ? [] : Array.from(highlight);
     const range = ranges[0];
     if (
       registry === undefined ||
       highlight === undefined ||
       !(range instanceof Range) ||
       ranges.length !== 1 ||
       range.collapsed
     ) {
       return { available: false };
     }
     const containingElement = (node) =>
       node instanceof Element ? node : node?.parentElement;
     const article = containingElement(range.startContainer)?.closest(
       ".semantic-document",
     );
     const viewport = article?.closest(
       '[data-reader-scroll-owner="true"]',
     );
     if (
       !(article instanceof HTMLElement) ||
       !(viewport instanceof HTMLElement)
     ) {
       return { available: false };
     }
     const focusOwner = document.activeElement;
     const selection = document.getSelection();
     const selectionState =
       selection === null
         ? undefined
         : {
             anchorNode: selection.anchorNode,
             anchorOffset: selection.anchorOffset,
             focusNode: selection.focusNode,
             focusOffset: selection.focusOffset,
             rangeCount: selection.rangeCount,
           };
     const descendantCount = article.querySelectorAll("*").length;
     const textLength = article.textContent?.length;
     const initialUrl = window.location.href;
     return new Promise((resolve) => {
       let registeredAnimationFrames = 0;
       const observe = () => {
         registeredAnimationFrames += 1;
         if (registeredAnimationFrames < 2) {
           requestAnimationFrame(observe);
           return;
         }
         let rect;
         try {
           rect = range.getBoundingClientRect();
         } catch {
           resolve({ available: false });
           return;
         }
         const viewportRect = viewport.getBoundingClientRect();
         const comfortInset = Math.min(
           24,
           Math.max(0, viewportRect.height / 4),
         );
         const comfortTop = viewportRect.top + comfortInset;
         const comfortBottom = viewportRect.bottom - comfortInset;
         const currentHighlight = registry.get(highlightName);
         resolve({
           available: true,
           focusPreserved: document.activeElement === focusOwner,
           hasNonzeroClientGeometry: rect.width > 0 && rect.height > 0,
           insideReaderViewport:
             rect.bottom >= comfortTop - 1 &&
             rect.top <= comfortBottom + 1,
           publicationDomUnchanged:
             article.querySelectorAll("*").length === descendantCount &&
             article.textContent?.length === textLength,
           rangeConnected:
             range.startContainer.isConnected &&
             range.endContainer.isConnected &&
             !range.collapsed,
           registeredAcrossRenderingOpportunity:
             currentHighlight === highlight &&
             currentHighlight.has(range),
           registeredAnimationFrames,
           selectionPreserved:
             selection === null ||
             (selection.anchorNode === selectionState.anchorNode &&
               selection.anchorOffset === selectionState.anchorOffset &&
               selection.focusNode === selectionState.focusNode &&
               selection.focusOffset === selectionState.focusOffset &&
               selection.rangeCount === selectionState.rangeCount),
           urlUnchanged: window.location.href === initialUrl,
         });
       };
       requestAnimationFrame(observe);
     });`,
    );
  }

  async function assertAdaptiveActiveHighlightPerceivable(driver) {
    const [highlight, synchronization] = await Promise.all([
      adaptiveActiveHighlightPerceivability(driver),
      adaptiveSynchronizationObservation(driver),
    ]);
    assertNativeSmokeInvariants([
      ["highlight-available", highlight?.available === true],
      [
        "highlight-registered",
        highlight?.registeredAcrossRenderingOpportunity === true,
      ],
      ["highlight-animation-frames", highlight?.registeredAnimationFrames >= 2],
      ["highlight-range-connected", highlight?.rangeConnected === true],
      [
        "highlight-nonzero-geometry",
        highlight?.hasNonzeroClientGeometry === true,
      ],
      [
        "highlight-in-reader-viewport",
        highlight?.insideReaderViewport === true,
      ],
      ["highlight-focus-preserved", highlight?.focusPreserved === true],
      ["highlight-selection-preserved", highlight?.selectionPreserved === true],
      ["highlight-dom-preserved", highlight?.publicationDomUnchanged === true],
      ["highlight-url-preserved", highlight?.urlUnchanged === true],
      ["highlight-readable", synchronization?.readableHighlight === true],
      ["highlight-present", synchronization?.highlightPresent === true],
      ["highlight-range-valid", synchronization?.rangeValid === true],
    ]);
    return Object.freeze({
      focusPreserved: highlight.focusPreserved,
      insideReaderViewport: highlight.insideReaderViewport,
      registeredAnimationFrames: highlight.registeredAnimationFrames,
      visiblyPerceivable: true,
    });
  }

  async function stopAdaptiveSynchronizationInstrumentation(driver) {
    await driver.execute(
      `globalThis.__voxleafAdaptiveSynchronizationInstrumentation?.stop?.();
     delete globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
     return true;`,
    );
  }

  async function waitForAdaptivePlaying(driver, timeoutMs) {
    const timeoutAt = now() + timeoutMs;
    let observation;
    while (now() < timeoutAt) {
      observation = await driver.execute(
        `const owner = document.querySelector(".product-narration");
       return owner === null ? undefined : {
         failure: owner.getAttribute("data-narration-failure"),
         phase: owner.getAttribute("data-narration-phase"),
         playIntent: owner.getAttribute("data-narration-play-intent"),
         recoveryCode: owner.getAttribute("data-narration-recovery-code"),
         recoveryPhase: owner.getAttribute("data-narration-recovery-phase"),
         retainedUnits: Number(
           owner.getAttribute("data-narration-retained-units"),
         ),
         serviceState: owner.getAttribute("data-narration-service-state"),
       };`,
      );
      if (observation?.phase === "playing") {
        return observation;
      }
      if (
        observation?.phase === "failed" ||
        observation?.failure !== "none" ||
        (observation?.playIntent !== "playing" &&
          ["idle", "stopped"].includes(observation?.phase))
      ) {
        console.error(
          `ADAPTIVE_TTS_STARTUP_OBSERVATION ${JSON.stringify(observation)}`,
        );
        throw new Error("Native synchronized narration proof failed.");
      }
      await delay(250);
    }
    console.error(
      `ADAPTIVE_TTS_STARTUP_OBSERVATION ${JSON.stringify(observation)}`,
    );
    throw new Error("Native synchronized narration proof failed.");
  }

  async function adaptivePlaybackRateObservation(driver) {
    return driver.execute(
      `const owner = document.querySelector(".product-narration");
     const speed = document.querySelector(
       'select[aria-label="Playback speed"]',
     );
     return owner === null || !(speed instanceof HTMLSelectElement)
       ? null
       : {
           acceptedUnits: Number(
             owner.getAttribute("data-narration-accepted-units"),
           ),
           activeRatePercent:
             owner.getAttribute("data-narration-active-rate-percent"),
           disabled: speed.disabled,
           failure: owner.getAttribute("data-narration-failure"),
           intentionalWaitMs: Number(
             owner.getAttribute("data-narration-intentional-wait-ms"),
           ),
           options: Array.from(speed.options, (option) =>
             Number(option.value),
           ),
           pendingRatePercent:
             owner.getAttribute("data-narration-pending-rate-percent"),
           phase: owner.getAttribute("data-narration-phase"),
           playbackMs: Number(
             owner.getAttribute("data-narration-playback-ms"),
           ),
           selectedRatePercent: Number(
             owner.getAttribute("data-narration-selected-rate-percent"),
           ),
           value: Number(speed.value),
         };`,
    );
  }

  async function selectAdaptivePlaybackRate(driver, ratePercent) {
    const changed = await driver.execute(
      `const speed = document.querySelector(
       'select[aria-label="Playback speed"]',
     );
     if (!(speed instanceof HTMLSelectElement) || speed.disabled) {
       return false;
     }
     speed.value = ${String(ratePercent)};
     speed.dispatchEvent(new Event("change", { bubbles: true }));
     return true;`,
    );
    assert(changed === true, "Native synchronized narration proof failed.");
    await waitForCondition(
      driver,
      `const owner = document.querySelector(".product-narration");
     const speed = document.querySelector(
       'select[aria-label="Playback speed"]',
     );
     return owner?.getAttribute(
       "data-narration-selected-rate-percent",
     ) === "${String(ratePercent)}" &&
       speed instanceof HTMLSelectElement &&
       speed.value === "${String(ratePercent)}";`,
    );
  }

  async function waitForAdaptivePlaybackRateBoundary(
    driver,
    ratePercent,
    before,
  ) {
    const selectedAtMs = now();
    await waitForCondition(
      driver,
      `const owner = document.querySelector(".product-narration");
     return owner?.getAttribute("data-narration-phase") === "playing" &&
       owner.getAttribute("data-narration-failure") === "none" &&
       owner.getAttribute("data-narration-selected-rate-percent") ===
         "${String(ratePercent)}" &&
       owner.getAttribute("data-narration-active-rate-percent") ===
         "${String(ratePercent)}" &&
       owner.getAttribute("data-narration-pending-rate-percent") === "none";`,
      4 * STARTUP_TIMEOUT_MS,
    );
    const after = await adaptivePlaybackRateObservation(driver);
    assert(
      after?.acceptedUnits >= before.acceptedUnits &&
        after.playbackMs >= before.playbackMs &&
        after.intentionalWaitMs >= before.intentionalWaitMs,
      "Native synchronized narration proof failed.",
    );
    return Object.freeze({
      activeRatePercent: ratePercent,
      boundaryDeferredWallMs: now() - selectedAtMs,
      intentionalWaitDeltaMs:
        after.intentionalWaitMs - before.intentionalWaitMs,
      playbackProgressDeltaMs: after.playbackMs - before.playbackMs,
    });
  }

  async function exerciseAdaptivePlaybackSpeedMatrix(driver, setStage) {
    setStage("adaptive exact-host playback-speed presentation");
    const initial = await adaptivePlaybackRateObservation(driver);
    assert(
      initial?.disabled === false &&
        JSON.stringify(initial.options) ===
          JSON.stringify(PORTFOLIO_PLAYBACK_RATE_PERCENTS) &&
        initial.selectedRatePercent === 100 &&
        initial.value === 100 &&
        initial.activeRatePercent === "100" &&
        initial.pendingRatePercent === "none",
      "Native synchronized narration proof failed.",
    );

    const transitions = [];
    let before = initial;
    for (const ratePercent of [95, 90, 85, 80]) {
      setStage(`adaptive exact-host ${String(ratePercent)} percent boundary`);
      await selectAdaptivePlaybackRate(driver, ratePercent);
      const selected = await adaptivePlaybackRateObservation(driver);
      assert(
        selected?.selectedRatePercent === ratePercent &&
          [before.activeRatePercent, String(ratePercent)].includes(
            selected.activeRatePercent,
          ) &&
          [String(ratePercent), "none"].includes(selected.pendingRatePercent),
        "Native synchronized narration proof failed.",
      );
      const transition = await waitForAdaptivePlaybackRateBoundary(
        driver,
        ratePercent,
        before,
      );
      transitions.push(transition);
      before = await adaptivePlaybackRateObservation(driver);
    }

    setStage("adaptive exact-host latest playback-speed selection wins");
    await selectAdaptivePlaybackRate(driver, 90);
    await selectAdaptivePlaybackRate(driver, 75);
    const latestSelected = await adaptivePlaybackRateObservation(driver);
    assert(
      latestSelected?.selectedRatePercent === 75 &&
        ["75", "none"].includes(latestSelected.pendingRatePercent) &&
        ["80", "75"].includes(latestSelected.activeRatePercent),
      "Native synchronized narration proof failed.",
    );
    transitions.push(
      await waitForAdaptivePlaybackRateBoundary(driver, 75, before),
    );

    setStage("adaptive exact-host one-times playback bypass restoration");
    before = await adaptivePlaybackRateObservation(driver);
    await selectAdaptivePlaybackRate(driver, 100);
    transitions.push(
      await waitForAdaptivePlaybackRateBoundary(driver, 100, before),
    );
    const final = await adaptivePlaybackRateObservation(driver);
    const firstActivationWaitMs = transitions[0].intentionalWaitDeltaMs;
    const recurringWaitsMs = transitions
      .slice(1)
      .map(({ intentionalWaitDeltaMs }) => intentionalWaitDeltaMs);
    const recurringHandoffOverheadsMs = recurringWaitsMs.map((value) =>
      Math.max(0, value - SYNTHETIC_SENTENCE_TRANSITION_PAUSE_MS),
    );
    console.error(
      `ADAPTIVE_TTS_PLAYBACK_RATE_MATRIX ${JSON.stringify({
        final,
        firstActivationWaitMs,
        recurringHandoffOverheadsMs,
        recurringWaitsMs,
        transitions,
      })}`,
    );
    assert(
      firstActivationWaitMs <= 1_000 &&
        recurringHandoffOverheadsMs.every((value) => value <= 250) &&
        final?.selectedRatePercent === 100 &&
        final.activeRatePercent === "100" &&
        final.pendingRatePercent === "none" &&
        final.failure === "none" &&
        final.phase === "playing",
      "Native synchronized narration proof failed.",
    );
    return Object.freeze({
      exercisedRatePercents: Object.freeze([100, 95, 90, 85, 80, 75]),
      firstActivationWaitMs,
      latestSelectionWins: true,
      recurringHandoffOverheadP95Ms: percentile95(recurringHandoffOverheadsMs),
      recurringIntentionalWaitP95Ms: percentile95(recurringWaitsMs),
      transitions: Object.freeze(transitions),
    });
  }

  async function observeAdaptiveDepletionOrStablePlayback(driver) {
    const timeoutAt = now() + 2 * STARTUP_TIMEOUT_MS;
    let observation;
    while (now() < timeoutAt) {
      observation = await driver.execute(
        `const owner = document.querySelector(".product-narration");
       return owner === null ? undefined : {
         bufferingMs: Number(
           owner.getAttribute("data-narration-buffering-ms"),
         ),
         intentionalWaitMs: Number(
           owner.getAttribute("data-narration-intentional-wait-ms"),
         ),
         failure: owner.getAttribute("data-narration-failure"),
         phase: owner.getAttribute("data-narration-phase"),
         playIntent: owner.getAttribute("data-narration-play-intent"),
         navigationSettling:
           owner.getAttribute("data-narration-navigation-settling"),
         playbackMs: Number(
           owner.getAttribute("data-narration-playback-ms"),
         ),
         retainedUnits: Number(
           owner.getAttribute("data-narration-retained-units"),
         ),
         serviceState: owner.getAttribute("data-narration-service-state"),
         underruns: Number(
           owner.getAttribute("data-narration-underruns"),
         ),
       };`,
      );
      if (observation?.phase === "buffering") {
        return Object.freeze({ kind: "depleted", observation });
      }
      if (observation?.phase === "complete") {
        return Object.freeze({ kind: "range-complete", observation });
      }
      if (
        observation?.phase === "playing" &&
        observation.playbackMs >= 60_000
      ) {
        return Object.freeze({ kind: "stable", observation });
      }
      if (
        observation?.phase === "failed" ||
        (["idle", "stopped"].includes(observation?.phase) &&
          observation.playIntent !== "playing")
      ) {
        console.error(
          `ADAPTIVE_TTS_DEPLETION_OBSERVATION ${JSON.stringify(observation)}`,
        );
      }
      assert(
        observation?.phase !== "failed" &&
          !(
            ["idle", "stopped"].includes(observation?.phase) &&
            observation.playIntent !== "playing"
          ),
        "Native synchronized narration proof failed.",
      );
      await delay(250);
    }
    console.error(
      `ADAPTIVE_TTS_DEPLETION_OBSERVATION ${JSON.stringify(observation)}`,
    );
    throw new Error("Native synchronized narration proof failed.");
  }

  async function runAdaptiveTtsExactHostMatrix(
    driver,
    fixturePath,
    rootProcessId,
    setStage,
  ) {
    const temporaryDirectory = path.dirname(fixturePath);
    if (EXERCISE_READER_CORRECTIONS) {
      await runSavedRatePauseCorrection(driver, fixturePath, setStage);
      await runPausedEndedCorrection(driver, fixturePath, setStage);
    }
    setStage("adaptive exact-host synthetic publication injection");
    await injectNativeFile(driver, fixturePath);
    await waitForCondition(
      driver,
      `const viewport = document.querySelector(
       '[data-reader-scroll-owner="true"]',
     );
     const article = document.querySelector("article.semantic-document");
     return viewport instanceof HTMLElement &&
       viewport.getClientRects().length > 0 &&
       article instanceof HTMLElement &&
       article.getClientRects().length > 0;`,
    );
    setStage("adaptive exact-host availability");
    await waitForCondition(
      driver,
      `return document.querySelector(".product-narration")
       ?.getAttribute("data-narration-availability") === "available";`,
    );

    setStage("adaptive exact-host synchronization instrumentation");
    await driver.execute(`
      const observations = { createdContexts: 0, closedContexts: 0, startupState: null };
      globalThis.__voxleafNarrationLifecycle = observations;
      const OriginalContext = globalThis.AudioContext;
      globalThis.AudioContext = class extends OriginalContext {
        constructor(options) { super(options); observations.createdContexts += 1; }
        async close() { await super.close(); observations.closedContexts += 1; }
      };
      return true;
    `);
    await driver.setWindowRect(800, 480);
    await driver.executeCdp("Emulation.setEmulatedMedia", {
      media: "",
      features: [
        { name: "prefers-reduced-motion", value: "reduce" },
        { name: "forced-colors", value: "active" },
      ],
    });
    await installAdaptiveSynchronizationInstrumentation(driver);
    const accessibilityObservation =
      await adaptiveSynchronizationObservation(driver);
    assert(
      accessibilityObservation?.forcedColors === true &&
        accessibilityObservation.reducedMotion === true &&
        accessibilityObservation.readableHighlight === true &&
        accessibilityObservation.contrastRatio >= 4.5,
      "Native synchronized narration proof failed.",
    );

    setStage("adaptive exact-host collapsed reader experience");
    const initialReaderExperience =
      await adaptiveReaderExperienceObservation(driver);
    if (
      initialReaderExperience?.readerScrollOwnerCount !== 1 ||
      initialReaderExperience.readerScrollOwnerVisible !== true ||
      initialReaderExperience.compactVisible !== true ||
      initialReaderExperience.detailExpanded !== false ||
      initialReaderExperience.detailVisible !== false ||
      initialReaderExperience.progressBarCount !== 0 ||
      initialReaderExperience.leafCount !== 1 ||
      initialReaderExperience.leafVisible !== true ||
      initialReaderExperience.leafState !== "checkpoint" ||
      initialReaderExperience.leafAriaCurrent !== false
    ) {
      console.error(
        `Adaptive reader experience observation: ${JSON.stringify(initialReaderExperience)}`,
      );
    }
    assert(
      initialReaderExperience?.readerScrollOwnerCount === 1 &&
        initialReaderExperience.readerScrollOwnerVisible === true &&
        initialReaderExperience.compactVisible === true &&
        initialReaderExperience.detailExpanded === false &&
        initialReaderExperience.detailVisible === false &&
        initialReaderExperience.progressBarCount === 0 &&
        initialReaderExperience.leafCount === 1 &&
        initialReaderExperience.leafVisible === true &&
        initialReaderExperience.leafState === "checkpoint" &&
        initialReaderExperience.leafAriaCurrent === false,
      "Native synchronized narration proof failed.",
    );

    setStage("adaptive exact-host expanded reader experience");
    const detailToggle = await driver.findElement(
      '[data-narration-action="details-toggle"]',
    );
    await driver.sendKeys(detailToggle, WEBDRIVER_SPACE);
    await waitForCondition(
      driver,
      `return document.querySelector(
       '[data-narration-action="details-toggle"]',
     )?.getAttribute("aria-expanded") === "true" &&
       document.querySelector(".product-narration-detail")
         ?.getClientRects().length > 0;`,
    );
    const expandedReaderExperience =
      await adaptiveReaderExperienceObservation(driver);
    assert(
      expandedReaderExperience?.readerScrollOwnerCount === 1 &&
        expandedReaderExperience.compactVisible === true &&
        expandedReaderExperience.detailExpanded === true &&
        expandedReaderExperience.detailVisible === true &&
        expandedReaderExperience.progressBarCount === 0 &&
        expandedReaderExperience.leafCount === 1,
      "Native synchronized narration proof failed.",
    );

    setStage("adaptive exact-host pre-inference action contract");
    const actionContractValid = await driver.execute(
      `const narrationActions = [
       "details-toggle",
       "next-passage",
       "play",
       "previous-passage",
       "visible-passage",
     ];
     const readerActions = ["next-chapter", "previous-chapter"];
     return narrationActions.every(
       (action) =>
         document.querySelectorAll(
           '[data-narration-action="' + action + '"]',
         ).length === 1,
     ) &&
       readerActions.every(
         (action) =>
           document.querySelectorAll(
             '[data-reader-action="' + action + '"]',
           ).length === 1,
       ) &&
       document.querySelectorAll(".paragraph-leaf").length === 1;`,
    );
    assertNativeSmokeInvariant(actionContractValid === true, "action-contract");

    setStage("adaptive exact-host prepared-option selection");
    await openReaderSettings(driver);
    const optionsAccepted = await driver.execute(
      `const target = document.querySelector(
       ".reader-settings-dialog .adaptive-preparation-target select",
     );
     if (!(target instanceof HTMLSelectElement)) {
       return false;
     }
     return JSON.stringify(
       Array.from(target.options, (option) => Number(option.value)),
     ) === JSON.stringify([60000, 120000, 300000, 600000]);`,
    );
    assert(
      optionsAccepted === true,
      "Native application main landmark is not visible.",
    );
    await closeReaderSettings(driver);
    try {
      await waitForCondition(
        driver,
        `const speed = document.querySelector(
         'select[aria-label="Playback speed"]',
       );
       return speed instanceof HTMLSelectElement && !speed.disabled;`,
      );
    } catch (error) {
      const observation = await driver.execute(
        `const speed = document.querySelector(
         'select[aria-label="Playback speed"]',
       );
       return {
         disabled:
           speed instanceof HTMLSelectElement ? speed.disabled : null,
         exists: speed instanceof HTMLSelectElement,
         options:
           speed instanceof HTMLSelectElement
             ? Array.from(speed.options, (option) => Number(option.value))
             : [],
         value:
           speed instanceof HTMLSelectElement ? Number(speed.value) : null,
       };`,
      );
      console.error(
        `ADAPTIVE_TTS_PLAYBACK_RATE_READINESS ${JSON.stringify(observation)}`,
      );
      throw error;
    }
    const playbackRatePresentation = await driver.execute(
      `const speed = document.querySelector(
       'select[aria-label="Playback speed"]',
     );
     return speed instanceof HTMLSelectElement
       ? {
           disabled: speed.disabled,
           options: Array.from(speed.options, (option) =>
             Number(option.value),
           ),
           value: Number(speed.value),
         }
       : null;`,
    );
    console.error(
      `ADAPTIVE_TTS_PLAYBACK_RATE_PRESENTATION ${JSON.stringify(
        playbackRatePresentation,
      )}`,
    );
    assertNativeSmokeInvariant(
      playbackRatePresentation?.disabled === false &&
        JSON.stringify(playbackRatePresentation.options) ===
          JSON.stringify(PORTFOLIO_PLAYBACK_RATE_PERCENTS) &&
        playbackRatePresentation.value === 100,
      "action-contract",
    );
    await driver.sendKeys(detailToggle, WEBDRIVER_SPACE);
    await waitForCondition(
      driver,
      `return document.querySelector(
       '[data-narration-action="details-toggle"]',
     )?.getAttribute("aria-expanded") === "false" &&
       document.querySelector(".product-narration-detail") === null;`,
    );

    const baselineWorkingSetBytes = await processWorkingSetBytes(rootProcessId);
    const baselineGpu = await nvidiaSnapshot();
    const resourceSampler = startAdaptiveResourceSampler(rootProcessId);
    let quickObservation;
    let quickMetrics;
    let quickResourceWorkingSetBytes;
    let quickGpu;
    let preparedObservation;
    let preparedWorkingSetBytes;
    let preparedGpu;
    let cancellationMs;
    let pauseResumeObservation;
    let playbackSpeedMatrix = null;
    let firstHighlightProof;
    let nextHighlightProof;
    let leafReplacementMs;
    let passiveIsolationMs;
    let seekRestartMs;
    let chapterRestartMs;
    let refillMs;
    let checkpointObservation;
    let leafStartObservation;
    let finalStopMs;
    let depletionObservation;
    let synchronizationObservation;
    let cleanupObservation;
    let cleanupReaderExperience;
    let cleanupWorkingSetBytes;
    let cleanupGpu;
    let cleanupResourceReleaseMs;
    let resourceSamples;
    let generatedAudioFiles;
    let startupCancellationMs = null;
    let startupNativePhase = null;
    let startupShutdownMs = null;
    let audioContextLifecycle;
    try {
      if (ADAPTIVE_TTS_PROFILE_ID === CHATTERBOX_BILINGUAL_PROFILE_ID) {
        ({ startupCancellationMs, startupNativePhase, startupShutdownMs } =
          await cancelAdaptiveStartup(driver, setStage));
      }
      setStage("adaptive exact-host keyboard leaf quick start");
      const quickCommandAtMs = now();
      await runWebDriverElementInteractionWithRetry({
        action: async () => {
          const quickStartButton =
            await prepareParagraphLeafForInteraction(driver);
          await driver.sendKeys(quickStartButton, WEBDRIVER_SPACE);
        },
        accepted: async () => await paragraphLeafActivationDelivered(driver),
        onAttempt: async (attempt, maximumAttempts) => {
          setStage(
            `adaptive exact-host keyboard leaf quick start (attempt ${String(attempt)} of ${String(maximumAttempts)})`,
          );
        },
        onRetry: async () => await delay(250),
      });
      await waitForCondition(
        driver,
        `return document.querySelector(".paragraph-leaf")
         ?.getAttribute("data-leaf-state") === "preparing" &&
       document.querySelector(".paragraph-leaf")
         ?.getAttribute("aria-current") !== "true";`,
      );
      await driver.execute(
        `document.querySelector('select[name="theme"]')
         ?.focus({ preventScroll: true });
       return true;`,
      );
      await waitForAdaptivePlaying(driver, 3 * STARTUP_TIMEOUT_MS);
      await waitForCondition(
        driver,
        `return globalThis
         .__voxleafAdaptiveSynchronizationInstrumentation
         ?.transitionCount >= 1;`,
        STARTUP_TIMEOUT_MS,
      );
      quickObservation = await driver.execute(
        `const owner = document.querySelector(".product-narration");
       return owner === null ? null : {
         acceptedSampleFrames: Number(
           owner.getAttribute("data-narration-accepted-sample-frames"),
         ),
         acceptedUnits: Number(
           owner.getAttribute("data-narration-accepted-units"),
         ),
         commandToAudibleMs: Number(
           owner.getAttribute("data-narration-command-to-audible-ms"),
         ),
         playableMs: Number(
           owner.getAttribute("data-narration-playable-ms"),
         ),
         retainedUnits: Number(
           owner.getAttribute("data-narration-retained-units"),
         ),
       };`,
      );
      synchronizationObservation =
        await adaptiveSynchronizationObservation(driver);
      firstHighlightProof =
        await assertAdaptiveActiveHighlightPerceivable(driver);
      const firstAudibleLeaf =
        await adaptiveReaderExperienceObservation(driver);
      assert(
        quickObservation?.acceptedUnits > 0 &&
          quickObservation.acceptedSampleFrames > 0 &&
          quickObservation.commandToAudibleMs > 0 &&
          quickObservation.commandToAudibleMs <=
            now() - quickCommandAtMs + 1_000 &&
          quickObservation.playableMs > 0 &&
          quickObservation.retainedUnits > 0 &&
          synchronizationObservation?.transitionCount >= 1 &&
          synchronizationObservation.highlightPresent === true &&
          synchronizationObservation.rangeValid === true &&
          synchronizationObservation.focusPreserved === true &&
          synchronizationObservation.followLatenciesMs.length >= 1 &&
          firstAudibleLeaf?.leafCount === 1 &&
          firstAudibleLeaf.leafState === "audible" &&
          firstAudibleLeaf.leafAriaCurrent === true &&
          firstAudibleLeaf.detailExpanded === false &&
          firstAudibleLeaf.progressBarCount === 0,
        "Native synchronized narration proof failed.",
      );

      setStage("adaptive exact-host active leaf replacement");
      const leafReplacementMarker =
        await adaptiveSynchronizationObservation(driver);
      assert(
        typeof leafReplacementMarker?.currentKey === "string" &&
          Number.isSafeInteger(leafReplacementMarker.clearCount) &&
          Number.isSafeInteger(leafReplacementMarker.transitionCount),
        "Native synchronized narration proof failed.",
      );
      const leafReplacementStartedAtMs = now();
      await runWebDriverElementInteractionWithRetry({
        action: async () => {
          const activeLeaf = await prepareParagraphLeafForInteraction(driver);
          await driver.sendKeys(activeLeaf, WEBDRIVER_SPACE);
        },
        accepted: async () => await paragraphLeafActivationDelivered(driver),
        onAttempt: async (attempt, maximumAttempts) => {
          setStage(
            `adaptive exact-host active leaf replacement (attempt ${String(attempt)} of ${String(maximumAttempts)})`,
          );
        },
        onRetry: async () => await delay(250),
      });
      await waitForCondition(
        driver,
        `return document.querySelector(".paragraph-leaf")
         ?.getAttribute("data-leaf-state") === "preparing";`,
      );
      await waitForCondition(
        driver,
        `const state =
         globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
       return state?.clearCount >
         ${String(leafReplacementMarker.clearCount)};`,
        STARTUP_TIMEOUT_MS,
      );
      try {
        await waitForCondition(
          driver,
          `const owner = document.querySelector(".product-narration");
         const state =
           globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
         return owner?.getAttribute("data-narration-phase") === "playing" &&
           state?.transitionCount >
             ${String(leafReplacementMarker.transitionCount)} &&
           document.querySelector(".paragraph-leaf")
             ?.getAttribute("data-leaf-state") === "audible" &&
           document.querySelector(".paragraph-leaf")
             ?.getAttribute("aria-current") === "true";`,
          EXERCISE_PLAYBACK_SPEEDS
            ? STARTUP_TIMEOUT_MS
            : 4 * STARTUP_TIMEOUT_MS,
        );
      } catch (error) {
        const observation = await driver.execute(
          `const owner = document.querySelector(".product-narration");
         const leaf = document.querySelector(".paragraph-leaf");
         const state =
           globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
         return {
           acceptedUnits: Number(
             owner?.getAttribute("data-narration-accepted-units"),
           ),
           failure: owner?.getAttribute("data-narration-failure"),
           leafAriaCurrent: leaf?.getAttribute("aria-current") ?? null,
           leafState: leaf?.getAttribute("data-leaf-state") ?? null,
           navigationSettling:
             owner?.getAttribute("data-narration-navigation-settling"),
           phase: owner?.getAttribute("data-narration-phase"),
           playIntent: owner?.getAttribute("data-narration-play-intent"),
           preparationFailure:
             owner?.getAttribute("data-narration-preparation-failure"),
           recoveryCode:
             owner?.getAttribute("data-narration-recovery-code"),
           recoveryPhase:
             owner?.getAttribute("data-narration-recovery-phase"),
           serviceState:
             owner?.getAttribute("data-narration-service-state"),
           synchronizationClearCount: state?.clearCount ?? null,
           synchronizationTransitionCount: state?.transitionCount ?? null,
         };`,
        );
        console.error(
          `ADAPTIVE_TTS_LEAF_REPLACEMENT ${JSON.stringify(observation)}`,
        );
        throw error;
      }
      leafReplacementMs = now() - leafReplacementStartedAtMs;
      const afterLeafReplacement =
        await adaptiveSynchronizationObservation(driver);
      assert(
        afterLeafReplacement?.stalePlaybackObserved === false &&
          afterLeafReplacement.rangeValid === true,
        "Native synchronized narration proof failed.",
      );

      setStage("adaptive exact-host keyboard pause and resume");
      const pauseButton = await driver.findElement(
        '[data-narration-action="pause"]',
      );
      await driver.sendKeys(pauseButton, WEBDRIVER_SPACE);
      await waitForCondition(
        driver,
        `const owner = document.querySelector(".product-narration");
       return owner?.getAttribute("data-narration-phase") === "paused" &&
         owner.getAttribute("data-narration-play-intent") === "paused";`,
      );
      const pausedAtStart = await adaptiveSynchronizationObservation(driver);
      await delay(750);
      const pausedObservation =
        await adaptiveSynchronizationObservation(driver);
      assert(
        pausedObservation?.highlightPresent === true &&
          pausedObservation.currentKey === pausedAtStart?.currentKey &&
          pausedObservation.transitionCount === pausedAtStart?.transitionCount,
        "Native synchronized narration proof failed.",
      );
      const resumeButton = await driver.findElement(
        '[data-narration-action="resume"]',
      );
      await driver.sendKeys(resumeButton, WEBDRIVER_SPACE);
      await waitForCondition(
        driver,
        `const owner = document.querySelector(".product-narration");
       return owner?.getAttribute("data-narration-phase") === "playing" &&
         owner.getAttribute("data-narration-play-intent") === "playing";`,
      );
      const resumedObservation =
        await adaptiveSynchronizationObservation(driver);
      pauseResumeObservation = Object.freeze({
        highlightRetained:
          resumedObservation?.highlightPresent === true &&
          resumedObservation.rangeValid === true &&
          resumedObservation.stalePlaybackObserved === false,
        keyboardOperable: true,
        resumedAtSameBoundary:
          resumedObservation?.currentKey === pausedObservation.currentKey,
      });
      assert(
        pauseResumeObservation.highlightRetained,
        "Native synchronized narration proof failed.",
      );

      if (EXERCISE_PLAYBACK_SPEEDS) {
        playbackSpeedMatrix = await exerciseAdaptivePlaybackSpeedMatrix(
          driver,
          setStage,
        );
      }

      setStage("adaptive exact-host expanded active narration");
      const activeDetailToggle = await driver.findElement(
        '[data-narration-action="details-toggle"]',
      );
      await driver.sendKeys(activeDetailToggle, WEBDRIVER_SPACE);
      await waitForCondition(
        driver,
        `return document.querySelector(
         '[data-narration-action="details-toggle"]',
       )?.getAttribute("aria-expanded") === "true" &&
         document.querySelector(".product-narration-detail")
           ?.getClientRects().length > 0;`,
      );
      const expandedActiveExperience =
        await adaptiveReaderExperienceObservation(driver);
      assert(
        expandedActiveExperience?.compactVisible === true &&
          expandedActiveExperience.detailExpanded === true &&
          expandedActiveExperience.detailVisible === true &&
          expandedActiveExperience.leafState === "audible" &&
          expandedActiveExperience.leafAriaCurrent === true &&
          expandedActiveExperience.progressBarCount === 0,
        "Native synchronized narration proof failed.",
      );

      setStage("adaptive exact-host next-segment seek");
      let seekMarker;
      const diagnoseSeekWait = async (phase, timeoutMs, action) => {
        const startedAtMs = now();
        try {
          return await action();
        } catch (error) {
          let observation;
          try {
            observation = await driver.execute(
              `const state = globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
             const seek = state?.seekDiagnostic;
             const owner = document.querySelector(".product-narration");
             const phase = owner?.getAttribute("data-narration-phase");
             const next = document.querySelector('[data-narration-action="next-passage"]');
             return {
               initial: seek?.initial ?? null, current: seek?.current ?? null,
               sawTrue: seek?.sawTrue ?? null,
               mutationCount: seek?.mutationCount ?? null,
               firstTrueElapsedMs: seek?.firstTrueElapsedMs ?? null,
               clearCountDelta: ${seekMarker === undefined ? "null" : `state?.clearCount - ${String(seekMarker.clearCount)}`},
               transitionCountDelta: ${seekMarker === undefined ? "null" : `state?.transitionCount - ${String(seekMarker.transitionCount)}`},
               oldKeyEqual: ${seekMarker === undefined ? "null" : `typeof state?.currentKey === "string" ? state.currentKey === ${JSON.stringify(seekMarker.currentKey)} : null`},
               phase: ["idle", "preparing", "buffering", "playing", "paused", "stopped", "complete", "failed"].includes(phase) ? phase : null,
               nextDisabled: next instanceof HTMLButtonElement ? next.disabled : null,
             };`,
            );
          } catch {
            observation = null;
          }
          console.error(
            `ADAPTIVE_TTS_SEEK_DIAGNOSTIC ${JSON.stringify({
              phase,
              timeoutMs,
              elapsedMs: now() - startedAtMs,
              code:
                error instanceof WebDriverClientError &&
                error.code === "webdriver-condition-timeout"
                  ? "webdriver-condition-timeout"
                  : "seek-observation-unexpected",
              observation,
            })}`,
          );
          throw error;
        }
      };
      const seekWaitForCondition = (driver, script, timeoutMs, phase) =>
        diagnoseSeekWait(phase, timeoutMs, () =>
          waitForCondition(driver, script, timeoutMs),
        );
      await seekWaitForCondition(
        driver,
        `const next = document.querySelector(
         '[data-narration-action="next-passage"]',
       );
       return next instanceof HTMLButtonElement && !next.disabled;`,
        3 * STARTUP_TIMEOUT_MS,
        "next-button-enabled",
      );
      seekMarker = await currentAdaptiveHighlightMarker(driver);
      const seekStartedAtMs = now();
      const nextPassageButton = await driver.findElement(
        '[data-narration-action="next-passage"]',
      );
      await driver.sendKeys(nextPassageButton, WEBDRIVER_SPACE);
      await seekWaitForCondition(
        driver,
        `const state =
         globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
       return state?.clearCount > ${String(seekMarker.clearCount)};`,
        STARTUP_TIMEOUT_MS,
        "highlight-cleared",
      );
      await seekWaitForCondition(
        driver,
        `const state = globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
       return state?.active === true &&
         state.seekDiagnostic?.armed === true &&
         state.seekDiagnostic.initial === false &&
         state.seekDiagnostic.sawTrue === true;`,
        STARTUP_TIMEOUT_MS,
        "navigation-settling",
      );
      await diagnoseSeekWait("old-highlight-absent", STARTUP_TIMEOUT_MS, () =>
        forbidAdaptiveHighlightKey(driver, seekMarker.currentKey),
      );
      try {
        await seekWaitForCondition(
          driver,
          `const owner = document.querySelector(".product-narration");
         const state =
           globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
         return owner?.getAttribute("data-narration-phase") === "playing" &&
           state?.transitionCount > ${String(seekMarker.transitionCount)} &&
           typeof state.currentKey === "string" &&
           state.currentKey !== ${JSON.stringify(seekMarker.currentKey)};`,
          EXERCISE_PLAYBACK_SPEEDS
            ? STARTUP_TIMEOUT_MS
            : 4 * STARTUP_TIMEOUT_MS,
          "resumed-playback",
        );
      } catch (error) {
        console.error(
          `ADAPTIVE_TTS_SEEK_WAIT ${JSON.stringify({
            marker: seekMarker,
            observation: await adaptiveSynchronizationObservation(driver),
            readerExperience: await adaptiveReaderExperienceObservation(driver),
          })}`,
        );
        throw error;
      }
      seekRestartMs = now() - seekStartedAtMs;
      const afterSeek = await adaptiveSynchronizationObservation(driver);
      nextHighlightProof =
        await assertAdaptiveActiveHighlightPerceivable(driver);
      const nextAudibleLeaf = await adaptiveReaderExperienceObservation(driver);
      assert(
        afterSeek?.currentDocumentId === seekMarker.currentDocumentId &&
          afterSeek.stalePlaybackObserved === false &&
          afterSeek.rangeValid === true &&
          nextAudibleLeaf?.leafState === "audible" &&
          nextAudibleLeaf.leafAriaCurrent === true &&
          nextAudibleLeaf.detailExpanded === true,
        "Native synchronized narration proof failed.",
      );

      setStage("adaptive exact-host passive reader navigation");
      const passiveMarker = await adaptiveSynchronizationObservation(driver);
      assert(
        passiveMarker?.highlightPresent === true &&
          Number.isSafeInteger(passiveMarker.clearCount),
        "Native synchronized narration proof failed.",
      );
      const passiveStartedAtMs = now();
      const passiveScrollPrepared = await driver.execute(
        `const readerViewport = document.querySelector(
         '[data-reader-scroll-owner="true"]',
       );
       const article = document.querySelector("article.semantic-document");
       const highlight = CSS.highlights.get("voxleaf-narration-active");
       const range = highlight === undefined
         ? undefined
         : Array.from(highlight).at(0);
       const paragraphs = Array.from(article?.querySelectorAll("p") ?? []);
       const rangeElement =
         range?.startContainer instanceof Element
           ? range.startContainer
           : range?.startContainer.parentElement;
       const activeParagraph = rangeElement?.closest("p");
       const activeIndex = paragraphs.indexOf(activeParagraph);
       const targetIndex = Math.min(
         paragraphs.length - 1,
         Math.max(0, activeIndex) + 12,
       );
       const target = paragraphs[targetIndex];
       const owner = document.querySelector(".product-narration");
       if (
          !(readerViewport instanceof HTMLElement) ||
          !(article instanceof HTMLElement) ||
          !(target instanceof HTMLElement) ||
          !(owner instanceof HTMLElement) ||
          activeIndex < 0 ||
          targetIndex === activeIndex
       ) {
         return false;
       }
       const isolation = {
         sawSettling: false,
         startedAt: performance.now(),
       };
       const observeSettling = () => {
         isolation.sawSettling ||= owner?.getAttribute(
           "data-narration-navigation-settling",
         ) === "true";
       };
       observeSettling();
       isolation.observer = new MutationObserver(observeSettling);
       isolation.observer.observe(owner, {
         attributeFilter: ["data-narration-navigation-settling"],
       });
       globalThis.__voxleafAdaptivePassiveIsolation = isolation;
       globalThis.__voxleafAdaptivePassiveNavigationStartY =
         readerViewport.scrollTop;
       article.dispatchEvent(
         new WheelEvent("wheel", {
           bubbles: true,
           cancelable: true,
           deltaY: readerViewport.clientHeight,
         }),
       );
       readerViewport.scrollTop +=
         target.getBoundingClientRect().top -
         readerViewport.getBoundingClientRect().top;
       return true;`,
      );
      assert(
        passiveScrollPrepared === true,
        "Native synchronized narration proof failed.",
      );
      setStage("adaptive exact-host passive reader navigation scroll");
      await waitForCondition(
        driver,
        `const readerViewport = document.querySelector(
         '[data-reader-scroll-owner="true"]',
       );
       return readerViewport instanceof HTMLElement &&
         readerViewport.scrollTop >
            globalThis.__voxleafAdaptivePassiveNavigationStartY;`,
        2 * STARTUP_TIMEOUT_MS,
      );
      setStage("adaptive exact-host passive reader navigation isolation");
      await waitForCondition(
        driver,
        `const isolation = globalThis.__voxleafAdaptivePassiveIsolation;
       return performance.now() - isolation.startedAt >= 750;`,
        2 * STARTUP_TIMEOUT_MS,
      );
      passiveIsolationMs = now() - passiveStartedAtMs;
      const afterPassiveNavigation =
        await adaptiveSynchronizationObservation(driver);
      const passiveIsolation = await driver.execute(
        `const isolation = globalThis.__voxleafAdaptivePassiveIsolation;
       isolation?.observer?.disconnect();
       const observation = {
         sawSettling: isolation?.sawSettling === true,
       };
       delete globalThis.__voxleafAdaptivePassiveIsolation;
       delete globalThis.__voxleafAdaptivePassiveNavigationStartY;
       return observation;`,
      );
      assert(
        afterPassiveNavigation?.stalePlaybackObserved === false &&
          afterPassiveNavigation.rangeValid === true &&
          afterPassiveNavigation.clearCount === passiveMarker.clearCount &&
          passiveIsolation.sawSettling === false,
        "Native synchronized narration proof failed.",
      );

      setStage("adaptive exact-host chapter transition");
      const chapterMarker = await currentAdaptiveHighlightMarker(driver);
      const chapterStartedAtMs = now();
      const chapterActivated = await driver.execute(
        `const next = document.querySelector(
         '[data-reader-action="next-chapter"]',
       );
       if (!(next instanceof HTMLButtonElement) || next.disabled) {
         return false;
       }
       next.click();
       return true;`,
      );
      assert(
        chapterActivated === true,
        "Native synchronized narration proof failed.",
      );
      await waitForCondition(
        driver,
        `const state =
         globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
       return state?.clearCount > ${String(chapterMarker.clearCount)};`,
        STARTUP_TIMEOUT_MS,
      );
      await waitForCondition(
        driver,
        `const owner = document.querySelector(".product-narration");
       return owner?.getAttribute("data-narration-navigation-settling") ===
           "true" ||
         owner?.getAttribute("data-narration-phase") !== "playing";`,
        STARTUP_TIMEOUT_MS,
      );
      await forbidAdaptiveHighlightKey(driver, chapterMarker.currentKey);
      await waitForCondition(
        driver,
        `const owner = document.querySelector(".product-narration");
       const state =
         globalThis.__voxleafAdaptiveSynchronizationInstrumentation;
       return owner?.getAttribute("data-narration-phase") === "playing" &&
         owner.getAttribute("data-narration-navigation-settling") === "false" &&
         state?.transitionCount > ${String(chapterMarker.transitionCount)} &&
         Number.isSafeInteger(state.currentDocumentId) &&
         state.currentDocumentId !== ${String(
           chapterMarker.currentDocumentId,
         )};`,
        4 * STARTUP_TIMEOUT_MS,
      );
      chapterRestartMs = now() - chapterStartedAtMs;
      const afterChapter = await adaptiveSynchronizationObservation(driver);
      assert(
        afterChapter?.stalePlaybackObserved === false &&
          afterChapter.rangeValid === true,
        "Native synchronized narration proof failed.",
      );

      setStage("adaptive exact-host depletion");
      depletionObservation =
        await observeAdaptiveDepletionOrStablePlayback(driver);
      quickResourceWorkingSetBytes =
        await processWorkingSetBytes(rootProcessId);
      quickGpu = await nvidiaSnapshot();
      if (depletionObservation.kind === "depleted") {
        const depletedAtMs = now();
        assert(
          depletionObservation.observation.intentionalWaitMs >= 0 &&
            depletionObservation.observation.playbackMs > 0 &&
            depletionObservation.observation.underruns > 0,
          "Native synchronized narration proof failed.",
        );
        setStage("adaptive exact-host refill");
        await waitForCondition(
          driver,
          `return document.querySelector(".product-narration")
           ?.getAttribute("data-narration-phase") === "playing";`,
          5 * STARTUP_TIMEOUT_MS,
        );
        refillMs = now() - depletedAtMs;
        await delay(500);
        quickMetrics = await driver.execute(
          `const owner = document.querySelector(".product-narration");
         return owner === null ? null : {
           bufferingMs: Number(
             owner.getAttribute("data-narration-buffering-ms"),
           ),
           intentionalWaitMs: Number(
             owner.getAttribute("data-narration-intentional-wait-ms"),
           ),
           playbackMs: Number(
             owner.getAttribute("data-narration-playback-ms"),
           ),
           underruns: Number(
             owner.getAttribute("data-narration-underruns"),
           ),
         };`,
        );
        assert(
          quickMetrics?.bufferingMs > 0 &&
            quickMetrics.intentionalWaitMs >= 0 &&
            quickMetrics.playbackMs > 0 &&
            quickMetrics.underruns > 0,
          "Native synchronized narration proof failed.",
        );
      } else {
        quickMetrics = depletionObservation.observation;
        assert(
          quickMetrics.bufferingMs === 0 &&
            quickMetrics.intentionalWaitMs >= 0 &&
            quickMetrics.playbackMs > 0 &&
            (depletionObservation.kind === "range-complete" ||
              quickMetrics.playbackMs >= 60_000) &&
            quickMetrics.underruns === 0,
          "Native synchronized narration proof failed.",
        );
      }

      setStage("adaptive exact-host active cancellation generation");
      const cancellationPassageButton = await driver.findElement(
        '[data-narration-action="next-passage"]',
      );
      await driver.sendKeys(cancellationPassageButton, WEBDRIVER_SPACE);
      await waitForCondition(
        driver,
        `return document.querySelector(".product-narration")
         ?.getAttribute("data-narration-service-state") === "generating";`,
        STARTUP_TIMEOUT_MS,
      );
      setStage("adaptive exact-host active cancellation stop");
      const cancellationAtMs = now();
      const stopButton = await driver.findElement(
        '[data-narration-action="stop"]',
      );
      await driver.sendKeys(stopButton, WEBDRIVER_SPACE);
      await waitForCondition(
        driver,
        `const owner = document.querySelector(".product-narration");
       return owner?.getAttribute("data-narration-phase") === "idle" &&
         owner.getAttribute("data-narration-retained-units") === "0" &&
         owner.getAttribute("data-narration-discarded-units") === "0";`,
        STARTUP_TIMEOUT_MS,
      );
      cancellationMs = now() - cancellationAtMs;
      setStage("adaptive exact-host active cancellation highlight cleanup");
      await waitForCondition(
        driver,
        `return CSS.highlights?.has(
         "voxleaf-narration-active",
       ) !== true;`,
      );
      setStage("adaptive exact-host active cancellation reader state");
      checkpointObservation = await adaptiveReaderExperienceObservation(driver);
      console.error(
        `ADAPTIVE_TTS_CANCELLATION_OBSERVATION ${JSON.stringify({
          cancellationMs,
          ...checkpointObservation,
        })}`,
      );
      assert(
        checkpointObservation?.leafCount === 1 &&
          // A fast engine may make the requested passage audible before stop,
          // while a slower engine can still be holding it as a non-audible
          // preview. Both states prove that preparing/audible authority was
          // cleared; requiring only checkpoint made cancellation timing-dependent.
          ["checkpoint", "preview"].includes(checkpointObservation.leafState) &&
          checkpointObservation.leafAriaCurrent === false &&
          checkpointObservation.compactVisible === true &&
          checkpointObservation.detailExpanded === true &&
          checkpointObservation.progressBarCount === 0,
        "Native synchronized narration proof failed.",
      );

      setStage("adaptive exact-host prepared mode selection");
      await openReaderSettings(driver);
      await driver.execute(
        `document.querySelector(
         '.reader-settings-dialog input[name="adaptive-preparation-mode"][value="prepared"]',
       )?.click();
       return true;`,
      );
      await waitForCondition(
        driver,
        `const prepared = document.querySelector(
         '.reader-settings-dialog input[name="adaptive-preparation-mode"][value="prepared"]',
       );
       const target = document.querySelector(
         ".reader-settings-dialog .adaptive-preparation-target select",
       );
       return prepared instanceof HTMLInputElement &&
         prepared.checked === true &&
         target instanceof HTMLSelectElement &&
         target.disabled === false &&
         target.value === "60000";`,
      );
      await closeReaderSettings(driver);

      setStage("adaptive exact-host one-minute prepared checkpoint leaf start");
      // The earlier active-leaf replacement proves keyboard activation. Use the
      // native WebDriver click here after applying the same visible/focused leaf
      // guard so prepared-mode startup cannot race the post-Settings layout.
      await runWebDriverElementInteractionWithRetry({
        action: async () => {
          const preparedButton =
            await prepareParagraphLeafForInteraction(driver);
          await driver.click(preparedButton);
        },
        accepted: async () => await paragraphLeafActivationDelivered(driver),
        onAttempt: async (attempt, maximumAttempts) => {
          setStage(
            `adaptive exact-host one-minute prepared checkpoint leaf start (attempt ${String(attempt)} of ${String(maximumAttempts)})`,
          );
        },
        onRetry: async () => await delay(250),
      });
      await waitForCondition(
        driver,
        `return document.querySelector(".paragraph-leaf")
         ?.getAttribute("data-leaf-state") === "preparing";`,
      );
      await waitForCondition(
        driver,
        `return document.querySelector(".product-narration")
         ?.getAttribute("data-narration-phase") === "playing";`,
        5 * STARTUP_TIMEOUT_MS,
      );
      preparedObservation = await driver.execute(
        `const owner = document.querySelector(".product-narration");
       return owner === null ? null : {
         commandToAudibleMs: Number(
           owner.getAttribute("data-narration-command-to-audible-ms"),
         ),
         playableMs: Number(
           owner.getAttribute("data-narration-playable-ms"),
         ),
         retainedUnits: Number(
           owner.getAttribute("data-narration-retained-units"),
         ),
         targetMs: Number(
           owner.getAttribute("data-narration-target-ms"),
         ),
       };`,
      );
      assert(
        preparedObservation?.targetMs === 60_000 &&
          preparedObservation.playableMs >= 60_000 &&
          preparedObservation.retainedUnits > 0 &&
          preparedObservation.commandToAudibleMs > 0,
        "Native application root did not mount.",
      );
      leafStartObservation = await adaptiveReaderExperienceObservation(driver);
      assert(
        leafStartObservation?.leafCount === 1 &&
          leafStartObservation.leafState === "audible" &&
          leafStartObservation.leafAriaCurrent === true &&
          leafStartObservation.compactVisible === true &&
          leafStartObservation.detailExpanded === true &&
          leafStartObservation.progressBarCount === 0,
        "Native synchronized narration proof failed.",
      );
      preparedWorkingSetBytes = await processWorkingSetBytes(rootProcessId);
      preparedGpu = await nvidiaSnapshot();

      setStage("adaptive exact-host prepared playback final stop");
      const finalStopStartedAtMs = now();
      const finalStopButton = await driver.findElement(
        '[data-narration-action="stop"]',
      );
      await driver.click(finalStopButton);
      await waitForCondition(
        driver,
        `const owner = document.querySelector(".product-narration");
       return owner?.getAttribute("data-narration-phase") === "idle" &&
         owner.getAttribute("data-narration-failure") === "none" &&
         owner.getAttribute("data-narration-retained-units") === "0" &&
         owner.getAttribute("data-narration-discarded-units") === "0";`,
        STARTUP_TIMEOUT_MS,
      );
      finalStopMs = now() - finalStopStartedAtMs;
      const finalStopReaderExperience =
        await adaptiveReaderExperienceObservation(driver);
      assert(
        finalStopReaderExperience?.leafCount === 1 &&
          ["checkpoint", "preview"].includes(
            finalStopReaderExperience.leafState,
          ) &&
          finalStopReaderExperience.leafAriaCurrent === false &&
          finalStopReaderExperience.progressBarCount === 0,
        "Native synchronized narration proof failed.",
      );
      const finalDetailToggle = await driver.findElement(
        '[data-narration-action="details-toggle"]',
      );
      await driver.sendKeys(finalDetailToggle, WEBDRIVER_SPACE);
      await waitForCondition(
        driver,
        `return document.querySelector(
         '[data-narration-action="details-toggle"]',
       )?.getAttribute("aria-expanded") === "false" &&
         document.querySelector(".product-narration-detail") === null;`,
      );
      await waitForCondition(
        driver,
        `return CSS.highlights?.has(
         "voxleaf-narration-active",
       ) !== true;`,
      );

      setStage("adaptive exact-host cleanup observation");
      cleanupObservation = await adaptiveSynchronizationObservation(driver);
      cleanupReaderExperience =
        await adaptiveReaderExperienceObservation(driver);
      assertNativeSmokeInvariants([
        [
          "cleanup-highlight-cleared",
          cleanupObservation?.highlightPresent === false,
        ],
        [
          "cleanup-no-stale-playback",
          cleanupObservation?.stalePlaybackObserved === false,
        ],
        [
          "cleanup-reader-scroll-owner",
          cleanupReaderExperience?.readerScrollOwnerCount === 1,
        ],
        [
          "cleanup-compact-visible",
          cleanupReaderExperience?.compactVisible === true,
        ],
        [
          "cleanup-detail-collapsed",
          cleanupReaderExperience?.detailExpanded === false &&
            cleanupReaderExperience?.detailVisible === false,
        ],
        [
          "cleanup-progressbar-absent",
          cleanupReaderExperience?.progressBarCount === 0,
        ],
        [
          "cleanup-leaf-bounded",
          cleanupReaderExperience?.leafCount === 1 &&
            ["checkpoint", "preview"].includes(
              cleanupReaderExperience?.leafState,
            ),
        ],
        [
          "cleanup-leaf-inactive",
          cleanupReaderExperience?.leafAriaCurrent === false,
        ],
      ]);
      setStage("adaptive exact-host bounded resource cleanup");
      audioContextLifecycle = await driver.execute(
        `const owner = globalThis.__voxleafNarrationLifecycle; return { createdContexts: owner.createdContexts, closedContexts: owner.closedContexts };`,
      );
      assert(
        audioContextLifecycle.createdContexts > 0 &&
          audioContextLifecycle.createdContexts ===
            audioContextLifecycle.closedContexts,
        "Native audio context lifecycle cleanup failed.",
      );
      const cleanupResources = await waitForAdaptiveResourceCleanup(
        rootProcessId,
        baselineWorkingSetBytes,
        baselineGpu,
      );
      cleanupWorkingSetBytes = cleanupResources.workingSetBytes;
      cleanupGpu = cleanupResources.gpu;
      cleanupResourceReleaseMs = cleanupResources.releaseMs;

      setStage("adaptive exact-host privacy and network assertions");
      const bodyIsContentSafe = await driver.execute(
        `return !document.body.textContent?.includes(
         "VOXLEAF_TTS_DEV_MODEL_ROOT",
       ) && !document.body.textContent?.includes("\\\\Users\\\\");`,
      );
      assert(
        bodyIsContentSafe === true,
        "Native application exposed the synthetic fixture filename.",
      );
      generatedAudioFiles = await generatedAudioFileCount(temporaryDirectory);
      assert(
        generatedAudioFiles === 0,
        "Native generated audio persistence was detected.",
      );
      const externalLoadedResourceCount = await driver.execute(
        `return performance.getEntriesByType("resource").filter((entry) => {
         try {
           const url = new URL(entry.name);
           return !(
             url.protocol === "tauri:" ||
             url.protocol === "ipc:" ||
             url.protocol === "data:" ||
             url.protocol === "blob:" ||
             url.hostname === "tauri.localhost" ||
             url.hostname === "ipc.localhost"
           );
         } catch {
           return true;
         }
       }).length;`,
      );
      assert(
        externalLoadedResourceCount === 0,
        "Native application attempted an external request.",
      );
      const browserLogs = await driver.getLogs("browser");
      const performanceLogs = inspectPerformanceLogs(
        await driver.getLogs("performance"),
      );
      assert(
        browserLogs.every((entry) => entry?.level !== "SEVERE") &&
          performanceLogs.runtimeErrorCount === 0,
        "Native application emitted a page or console error.",
      );
      assert(
        performanceLogs.externalRequestCount === 0,
        "Native application attempted an external request.",
      );
      synchronizationObservation =
        await adaptiveSynchronizationObservation(driver);
    } finally {
      resourceSamples = await resourceSampler.stop();
      await stopAdaptiveSynchronizationInstrumentation(driver);
      await driver.executeCdp("Emulation.setEmulatedMedia", {
        media: "",
        features: [],
      });
      await driver.setWindowRect(960, 720);
    }

    const peakGpu = resourceSamples
      .map((sample) => sample.gpu)
      .concat([baselineGpu, quickGpu, preparedGpu, cleanupGpu])
      .reduce((peak, observation) => ({
        dedicatedMemoryMiB: Math.max(
          peak.dedicatedMemoryMiB,
          observation.dedicatedMemoryMiB,
        ),
        temperatureCelsius: Math.max(
          peak.temperatureCelsius,
          observation.temperatureCelsius,
        ),
        powerWatts: Math.max(peak.powerWatts, observation.powerWatts),
        powerState: observation.powerState,
        utilizationPercent: Math.max(
          peak.utilizationPercent,
          observation.utilizationPercent,
        ),
      }));
    const peakWorkingSetBytes = Math.max(
      ...resourceSamples.map((sample) => sample.workingSetBytes),
      baselineWorkingSetBytes,
      quickResourceWorkingSetBytes,
      preparedWorkingSetBytes,
      cleanupWorkingSetBytes,
    );
    const warmPreparedRtf = rounded(
      preparedObservation.commandToAudibleMs / preparedObservation.playableMs,
    );
    assert(
      synchronizationObservation.maxRetainedUnits <= 256 &&
        synchronizationObservation.maxDiscardedUnits <= 256,
      "Native synchronized narration proof failed.",
    );
    console.log(
      `Adaptive exact-host TTS matrix passed: ${JSON.stringify({
        profileId: ADAPTIVE_TTS_PROFILE_ID,
        language: ADAPTIVE_TTS_LANGUAGE,
        quick: {
          commandToAudibleMs: quickObservation.commandToAudibleMs,
          playableLeadAtStartMs: quickObservation.playableMs,
          depletionObserved: depletionObservation.kind === "depleted",
          rangeCompleteObserved: depletionObservation.kind === "range-complete",
          bufferingObservationWallMs: refillMs ?? 0,
          bufferingSecondsPerPlaybackMinute: rounded(
            quickMetrics.bufferingMs /
              1_000 /
              (quickMetrics.playbackMs / 60_000),
          ),
          underruns: quickMetrics.underruns,
          intentionalWaitMs: quickMetrics.intentionalWaitMs,
          refillObserved: depletionObservation.kind === "depleted",
          refillMs: refillMs ?? null,
          stablePlaybackObservationMs:
            depletionObservation.kind === "stable"
              ? depletionObservation.observation.playbackMs
              : null,
        },
        prepared: preparedObservation,
        warmPreparedRtf,
        cancellationMs,
        startupCancellationMs,
        startupNativePhase,
        startupShutdownMs,
        audioContextLifecycle,
        processTreeWorkingSetBytes: {
          baseline: baselineWorkingSetBytes,
          quick: quickResourceWorkingSetBytes,
          prepared: preparedWorkingSetBytes,
          peak: peakWorkingSetBytes,
          cleanup: cleanupWorkingSetBytes,
        },
        gpu: { baseline: baselineGpu, peak: peakGpu, cleanup: cleanupGpu },
        synchronization: {
          segmentTransitions: synchronizationObservation.transitionCount,
          followLatencyP95Ms: rounded(
            percentile95(synchronizationObservation.followLatenciesMs),
          ),
          pauseResume: pauseResumeObservation,
          seekRestartMs,
          chapterRestartMs,
          stalePlaybackObserved:
            synchronizationObservation.stalePlaybackObserved,
          rangeValid:
            firstHighlightProof.visiblyPerceivable === true &&
            nextHighlightProof.visiblyPerceivable === true,
          focusPreserved:
            firstHighlightProof.focusPreserved === true &&
            nextHighlightProof.focusPreserved === true,
          reducedMotion: accessibilityObservation.reducedMotion,
          forcedColors: accessibilityObservation.forcedColors,
          readableHighlight: accessibilityObservation.readableHighlight,
          highlightClearedAtCleanup:
            cleanupObservation.highlightPresent === false,
          retainedUnitsPeak: synchronizationObservation.maxRetainedUnits,
          discardedUnitsPeak: synchronizationObservation.maxDiscardedUnits,
        },
        readerExperience: {
          oneReaderScrollOwner:
            initialReaderExperience.readerScrollOwnerCount === 1,
          compactDefaultClosed:
            initialReaderExperience.compactVisible === true &&
            initialReaderExperience.detailExpanded === false,
          expandedDetailValidated:
            expandedReaderExperience.detailExpanded === true &&
            expandedReaderExperience.detailVisible === true,
          progressBarAbsent:
            initialReaderExperience.progressBarCount === 0 &&
            expandedReaderExperience.progressBarCount === 0 &&
            cleanupReaderExperience.progressBarCount === 0,
          firstHighlight: firstHighlightProof,
          nextHighlight: nextHighlightProof,
          leafReplacementMs,
          leafStartValidated:
            leafStartObservation.leafState === "audible" &&
            leafStartObservation.leafAriaCurrent === true,
          passiveIsolationMs,
          checkpointAfterStop:
            checkpointObservation.leafState === "checkpoint" &&
            checkpointObservation.leafAriaCurrent === false,
          finalStopMs,
          finalBoundedLeaf:
            ["checkpoint", "preview"].includes(
              cleanupReaderExperience.leafState,
            ) && cleanupReaderExperience.leafAriaCurrent === false,
        },
        cleanup: {
          retainedUnits: 0,
          discardedUnits: 0,
          generatedAudioFiles,
          resourceReleaseMs: cleanupResourceReleaseMs,
        },
        preparedOptionsAcceptedMs: [60_000, 120_000, 300_000, 600_000],
        playbackSpeed: {
          optionsAcceptedPercent: PORTFOLIO_PLAYBACK_RATE_PERCENTS,
          exactMatrix: playbackSpeedMatrix,
        },
        externalRequests: 0,
      })}`,
    );
  }

  async function runPausedEndedCorrection(driver, fixturePath, setStage) {
    for (const rate of [100, 75]) {
      setStage(`CLB-02 queued completion after Pause at ${rate} percent`);
      await driver.execute(`
        localStorage.setItem("voxleaf.narration.playback-preference",
          JSON.stringify({ schemaVersion: 1, playbackRatePercent: ${rate} }));
        const OriginalContext = globalThis.AudioContext;
        const OriginalNode = globalThis.AudioWorkletNode;
        const observation = { pending: false, delivered: false, created: 0, closed: 0, starts: 0 };
        globalThis.__voxleafPausedEnded = observation;
        const hold = (callback, event) => {
          if (observation.delivered || observation.pending) return callback(event);
          observation.pending = true;
          observation.release = () => {
            observation.pending = false;
            observation.delivered = true;
            callback(event);
          };
        };
        globalThis.AudioContext = class extends OriginalContext {
          constructor(options) { super(options); observation.created += 1; }
          createBufferSource() {
            const source = super.createBufferSource();
            const start = source.start.bind(source);
            source.start = (...args) => { observation.starts += 1; return start(...args); };
            let callback;
            Object.defineProperty(source, "onended", { configurable: true,
              get: () => callback, set: value => { callback = value; } });
            source.addEventListener("ended", event => { if (callback) hold(callback, event); });
            return source;
          }
          async close() { await super.close(); observation.closed += 1; }
        };
        globalThis.AudioWorkletNode = class extends OriginalNode {
          constructor(...args) {
            super(...args);
            const port = this.port;
            let callback;
            Object.defineProperty(port, "onmessage", { configurable: true,
              get: () => callback, set: value => { callback = value; } });
            port.addEventListener("message", event => {
              if (!callback) return;
              if (event.data?.type === "ended") hold(callback, event);
              else callback(event);
            });
            port.start();
          }
        };
        observation.restore = () => { globalThis.AudioContext = OriginalContext; globalThis.AudioWorkletNode = OriginalNode; };
        return true;
      `);
      try {
        await injectNativeFile(driver, fixturePath);
        await waitForCondition(
          driver,
          `return document.querySelector('.product-narration')?.getAttribute('data-narration-availability') === 'available';`,
          STARTUP_TIMEOUT_MS,
        );
        await driver.click(
          await driver.findElement('[data-narration-action="play"]'),
        );
        await waitForCondition(
          driver,
          `return globalThis.__voxleafPausedEnded.pending;`,
          4 * STARTUP_TIMEOUT_MS,
        );
        await driver.execute(
          `document.querySelector('[data-narration-action="pause"]').click(); globalThis.__voxleafPausedEnded.release(); return true;`,
        );
        await waitForCondition(
          driver,
          `return document.querySelector('.product-narration')?.getAttribute('data-narration-phase') === 'paused';`,
        );
        await delay(300);
        assert(
          await driver.execute(
            `return document.querySelector('.product-narration')?.getAttribute('data-narration-phase') === 'paused' && globalThis.__voxleafPausedEnded.delivered;`,
          ),
          "Paused completion lost paused intent.",
        );
        await driver.click(
          await driver.findElement('[data-narration-action="resume"]'),
        );
        await waitForCondition(
          driver,
          `return document.querySelector('.product-narration')?.getAttribute('data-narration-phase') === 'playing';`,
          STARTUP_TIMEOUT_MS,
        );
        await driver.click(
          await driver.findElement('[data-narration-action="stop"]'),
        );
        await waitForCondition(
          driver,
          `const o = globalThis.__voxleafPausedEnded; return document.querySelector('.product-narration')?.getAttribute('data-narration-phase') === 'idle' && o.created === o.closed;`,
          STARTUP_TIMEOUT_MS,
        );
        console.error(
          `CLB02_PAUSED_ENDED ${JSON.stringify({ profileId: ADAPTIVE_TTS_PROFILE_ID, language: ADAPTIVE_TTS_LANGUAGE, rate, paused: true, resumed: true, cleaned: true })}`,
        );
      } finally {
        await driver.execute(
          `globalThis.__voxleafPausedEnded?.restore(); localStorage.setItem('voxleaf.narration.playback-preference', JSON.stringify({ schemaVersion: 1, playbackRatePercent: 100 })); return true;`,
        );
      }
    }
  }

  async function runSavedRatePauseCorrection(driver, fixturePath, setStage) {
    setStage("reader corrections saved 0.75x with deferred WebView2 worklet");
    await driver.execute(`
      localStorage.setItem("voxleaf.narration.playback-preference",
        JSON.stringify({ schemaVersion: 1, playbackRatePercent: 75 }));
      const Original = globalThis.AudioContext;
      const observation = { pending: false, resolved: false, created: 0, closed: 0 };
      globalThis.__voxleafRateCorrection = observation;
      globalThis.AudioContext = class extends Original {
        constructor(options) {
          super(options);
          observation.created += 1;
          const originalAdd = this.audioWorklet.addModule.bind(this.audioWorklet);
          this.audioWorklet.addModule = async (...args) => {
            observation.pending = true;
            await new Promise(resolve => { observation.release = resolve; });
            await originalAdd(...args);
            observation.resolved = true;
          };
        }
        async close() { await super.close(); observation.closed += 1; }
      };
      observation.restore = () => { globalThis.AudioContext = Original; };
      return true;
    `);
    try {
      await injectNativeFile(driver, fixturePath);
      await waitForCondition(
        driver,
        `
        const owner = document.querySelector(".product-narration");
        return owner?.getAttribute("data-narration-availability") === "available" &&
          owner.getAttribute("data-narration-selected-rate-percent") === "75";
      `,
        STARTUP_TIMEOUT_MS,
      );
      const startedAt = now();
      await driver.click(
        await driver.findElement('[data-narration-action="play"]'),
      );
      await waitForCondition(
        driver,
        `
        return globalThis.__voxleafRateCorrection.pending === true &&
          document.querySelector('[data-narration-action="pause"]')?.disabled === false;
      `,
        4 * STARTUP_TIMEOUT_MS,
      );
      await driver.click(
        await driver.findElement('[data-narration-action="pause"]'),
      );
      await waitForCondition(
        driver,
        `
        return document.querySelector(".product-narration")?.getAttribute("data-narration-phase") === "paused";
      `,
      );
      const paused = await driver.execute(`
        const owner = document.querySelector(".product-narration");
        globalThis.__voxleafRateCorrection.release();
        return {
          commandToAudibleMs: owner.getAttribute("data-narration-command-to-audible-ms"),
          audible: CSS.highlights?.has("voxleaf-narration-active") === true
        };
      `);
      await waitForCondition(
        driver,
        `return globalThis.__voxleafRateCorrection.resolved === true;`,
      );
      await delay(300);
      const remainedPaused = await driver.execute(`
        return document.querySelector(".product-narration")?.getAttribute("data-narration-phase") === "paused" &&
          CSS.highlights?.has("voxleaf-narration-active") !== true;
      `);
      assert(
        remainedPaused && paused.audible === false,
        "Native synchronized narration proof failed.",
      );
      await driver.click(
        await driver.findElement('[data-narration-action="resume"]'),
      );
      await waitForCondition(
        driver,
        `return CSS.highlights?.has("voxleaf-narration-active") === true;`,
        STARTUP_TIMEOUT_MS,
      );
      const audibleAtMs = now() - startedAt;
      const stopAt = now();
      await driver.click(
        await driver.findElement('[data-narration-action="stop"]'),
      );
      await waitForCondition(
        driver,
        `
        const owner = document.querySelector(".product-narration");
        const observation = globalThis.__voxleafRateCorrection;
        return owner?.getAttribute("data-narration-phase") === "idle" &&
          observation.created === observation.closed;
      `,
        STARTUP_TIMEOUT_MS,
      );
      console.error(
        `READER_RATE_CORRECTION ${JSON.stringify({
          profileId: ADAPTIVE_TTS_PROFILE_ID,
          language: ADAPTIVE_TTS_LANGUAGE,
          savedRatePercent: 75,
          pausedBeforeSound: true,
          remainedPaused: true,
          commandToAudibleIncludingControlledHoldMs: audibleAtMs,
          stopAndContextCleanupMs: now() - stopAt,
        })}`,
      );
    } finally {
      await driver.execute(`
        globalThis.__voxleafRateCorrection?.release?.();
        globalThis.__voxleafRateCorrection?.restore?.();
        localStorage.setItem("voxleaf.narration.playback-preference",
          JSON.stringify({ schemaVersion: 1, playbackRatePercent: 100 }));
        return true;
      `);
    }
  }

  async function selectAdaptiveTtsProfile(
    driver,
    profileId,
    exerciseSwitch = false,
  ) {
    const serializedProfileId = JSON.stringify(profileId);
    if (profileId === CHATTERBOX_BILINGUAL_PROFILE_ID) {
      await waitForCondition(
        driver,
        `const state = document.querySelector(".optional-chatterbox-controls")
         ?.getAttribute("data-optional-profile-state");
       return state === "installed" || state === "failed";`,
        OPTIONAL_PROFILE_VERIFICATION_TIMEOUT_MS,
      );
      const optionalState = await driver.execute(
        `return document.querySelector(".optional-chatterbox-controls")
         ?.getAttribute("data-optional-profile-state") ?? "missing";`,
      );
      console.log(
        `ADAPTIVE_TTS_OPTIONAL_PROFILE ${JSON.stringify({
          profileId,
          state: optionalState,
          failure: await driver.execute(
            `return globalThis.__TAURI_INTERNALS__.invoke("optional_chatterbox_snapshot").then((snapshot) => snapshot.failure ?? null);`,
          ),
        })}`,
      );
      assert(
        optionalState === "installed",
        "Native synchronized narration proof failed.",
      );
    }
    await waitForCondition(
      driver,
      `const owner = document.querySelector(".hardware-compatibility");
     return owner?.getAttribute("data-compatibility-status") !== "checking";`,
    );
    const hostCapacity = await driver.execute(
      `return globalThis.__TAURI_INTERNALS__.invoke(
       "detect_host_profile_compatibility",
     ).then((report) => ({
       availableDedicatedMemoryMiB:
         report?.providers?.cuda?.availableDedicatedMemoryMiB?.value ?? null,
       dedicatedMemoryMiB:
         report?.providers?.cuda?.dedicatedMemoryMiB?.value ?? null,
       probeStatus: report?.probeStatus ?? null,
     }));`,
    );
    const observation = await driver.execute(
      `const profileId = ${serializedProfileId};
     const inputs = Array.from(
       document.querySelectorAll('input[name="hardware-profile"]'),
     );
     const input = inputs.find((candidate) => candidate.value === profileId);
     const profileEntry = Array.from(
       document.querySelectorAll(
         '[aria-label="Measured narration profiles"] li',
       ),
     ).find((candidate) => candidate.dataset.profileId === profileId);
     const owner = document.querySelector(".hardware-compatibility");
     return {
       activeProfileId:
         owner?.getAttribute("data-compatibility-profile") ?? null,
       requestedProfileSelectable: input instanceof HTMLInputElement,
       requestedProfileReason: profileEntry?.dataset.profileReason ?? null,
       requestedProfileState: profileEntry?.dataset.profileState ?? null,
       profileSummaries: Array.from(
         document.querySelectorAll(
           '[aria-label="Measured narration profiles"] li',
         ),
         (item) => item.textContent?.trim() ?? "",
       ),
       selectableProfileIds: inputs.map((candidate) => candidate.value),
       status:
         owner?.getAttribute("data-compatibility-status") ?? "missing",
     };`,
    );
    console.log(
      `ADAPTIVE_TTS_PROFILE_SELECTION ${JSON.stringify({
        ...observation,
        hostCapacity,
      })}`,
    );
    if (
      observation?.requestedProfileSelectable !== true &&
      EXPECTED_UNAVAILABLE_PROFILE_REASON !== undefined
    ) {
      assert(
        observation?.requestedProfileState === "incompatible" &&
          observation?.requestedProfileReason ===
            EXPECTED_UNAVAILABLE_PROFILE_REASON,
        "Native synchronized narration proof failed.",
      );
      return false;
    }
    assert(
      observation?.requestedProfileSelectable === true,
      "Native synchronized narration proof failed.",
    );
    if (exerciseSwitch) {
      await selectAdaptiveTtsAlternateProfile({
        driver,
        profileId,
        waitForCondition,
        assert,
        timeoutMs: STARTUP_TIMEOUT_MS,
      });
    }
    await waitForCondition(
      driver,
      `const profileId = ${serializedProfileId};
     const input = Array.from(
       document.querySelectorAll('input[name="hardware-profile"]'),
     ).find((candidate) => candidate.value === profileId);
     return input instanceof HTMLInputElement && !input.matches(":disabled");`,
      OPTIONAL_PROFILE_SELECTION_TIMEOUT_MS,
    );
    const selected = await driver.execute(
      `const profileId = ${serializedProfileId};
     const input = Array.from(
       document.querySelectorAll('input[name="hardware-profile"]'),
     ).find((candidate) => candidate.value === profileId);
     if (!(input instanceof HTMLInputElement)) {
       return false;
     }
     if (!input.checked) {
       input.click();
     }
     return true;`,
    );
    assert(selected === true, "Native synchronized narration proof failed.");
    await waitForCondition(
      driver,
      `return document.querySelector(".hardware-compatibility")
       ?.getAttribute("data-compatibility-profile") ===
       ${serializedProfileId};`,
      profileId === CHATTERBOX_BILINGUAL_PROFILE_ID
        ? OPTIONAL_PROFILE_SELECTION_TIMEOUT_MS
        : STARTUP_TIMEOUT_MS,
    );
    return true;
  }

  async function selectNarrationLanguage(driver, language) {
    const serializedLanguage = JSON.stringify(language);
    await waitForCondition(
      driver,
      `const owner = document.querySelector(".hardware-compatibility");
     const input = Array.from(
       document.querySelectorAll('input[name="narration-language"]'),
     ).find((candidate) => candidate.value === ${serializedLanguage});
     return owner?.getAttribute("data-compatibility-status") !== "checking" &&
       input instanceof HTMLInputElement &&
       input.disabled === false;`,
    );
    const selected = await driver.execute(
      `const input = document.querySelector(
       'input[name="narration-language"][value="${language}"]',
     );
     const setter = Object.getOwnPropertyDescriptor(
       HTMLInputElement.prototype,
       "checked",
     )?.set;
     if (!(input instanceof HTMLInputElement) || setter === undefined) {
       return false;
     }
     setter.call(input, true);
     input.dispatchEvent(new MouseEvent("click", { bubbles: true }));
     return true;`,
    );
    assert(selected === true, "Native narration language proof failed.");
    await waitForCondition(
      driver,
      `const owner = document.querySelector(".hardware-compatibility");
     return owner?.getAttribute("data-narration-language") ===
         ${serializedLanguage} &&
       owner?.getAttribute("data-compatibility-status") !== "checking";`,
      INTERACTION_TIMEOUT_MS,
    );
  }

  async function exerciseNarrationLanguagePreference(driver, finalLanguage) {
    await waitForCondition(
      driver,
      `const owner = document.querySelector(".hardware-compatibility");
     return owner?.getAttribute("data-compatibility-status") !== "checking" &&
       document.querySelectorAll('input[name="narration-language"]').length === 2;`,
    );
    const initial = await driver.execute(
      `const owner = document.querySelector(".hardware-compatibility");
     const english = document.querySelector(
       'input[name="narration-language"][value="en"]',
     );
     return {
       language: owner?.getAttribute("data-narration-language") ?? null,
       englishChecked:
         english instanceof HTMLInputElement ? english.checked : false,
       persisted:
         localStorage.getItem("voxleaf.narration.language-preference") !== null,
     };`,
    );
    assert(
      initial?.language === "en" &&
        initial?.englishChecked === true &&
        initial?.persisted === false,
      "Native narration language proof failed.",
    );
    await selectNarrationLanguage(driver, "es");
    const persisted = await driver.execute(
      `const serialized = localStorage.getItem(
       "voxleaf.narration.language-preference",
     );
     if (serialized === null) {
       return null;
     }
     const value = JSON.parse(serialized);
     return {
       keys: Object.keys(value).sort(),
       language: value.language,
       schemaVersion: value.schemaVersion,
       serializedLength: serialized.length,
     };`,
    );
    assert(
      persisted?.schemaVersion === 2 &&
        persisted?.language === "es" &&
        persisted?.serializedLength <= 256 &&
        JSON.stringify(persisted?.keys) ===
          JSON.stringify(["language", "schemaVersion"]),
      "Native narration language proof failed.",
    );
    await selectNarrationLanguage(driver, "en");
    if (finalLanguage === "es") {
      await selectNarrationLanguage(driver, "es");
    }
    const finalPersistedLanguage = await driver.execute(
      `const value = JSON.parse(
       localStorage.getItem("voxleaf.narration.language-preference") ?? "null",
     );
     return value?.language ?? null;`,
    );
    assert(
      finalPersistedLanguage === finalLanguage,
      "Native narration language proof failed.",
    );
  }

  async function exerciseNativeTtsProtocolProbe(driver, setStage) {
    setStage("native TTS protocol probe dispatch");
    const started = await driver.execute(
      `if (typeof globalThis.__voxleafRunTtsProtocolProbe !== "function") {
       return false;
     }
     globalThis.__voxleafTtsProtocolProbeObservation = { status: "pending" };
     globalThis.__voxleafRunTtsProtocolProbe()
       .then((observation) => {
         globalThis.__voxleafTtsProtocolProbeObservation = {
           status: "complete",
           observation,
         };
       })
       .catch((error) => {
         const code =
           error?.code === "tts-probe-response-invalid" ||
           error?.code === "tts-probe-unavailable"
             ? error.code
             : "tts-probe-unexpected";
         const detail =
           error?.detail === "array" ||
           error?.detail === "binary-object" ||
           error?.detail === "byte-length" ||
           error?.detail === "non-finite" ||
           error?.detail === "other" ||
           error?.detail === "other-view" ||
           error?.detail === "prefix" ||
           error?.detail === "sample-length"
             ? error.detail
             : "none";
         globalThis.__voxleafTtsProtocolProbeObservation = {
            status: "failed",
            code,
            detail,
          };
       });
     return true;`,
    );
    assert(
      started === true,
      "Native TTS protocol probe did not deliver bounded binary audio.",
    );

    setStage("native TTS protocol probe binary delivery");
    await waitForCondition(
      driver,
      `return globalThis.__voxleafTtsProtocolProbeObservation?.status !==
       "pending";`,
    );
    const result = await driver.execute(
      `const result = globalThis.__voxleafTtsProtocolProbeObservation;
     delete globalThis.__voxleafTtsProtocolProbeObservation;
     return result;`,
    );
    if (result?.status === "failed") {
      assert(
        result.code !== "tts-probe-response-invalid",
        result.detail === "array"
          ? "Native TTS protocol probe returned a serialized array."
          : result.detail === "binary-object"
            ? "Native TTS protocol probe returned an unknown binary object."
            : result.detail === "other-view"
              ? "Native TTS protocol probe returned an unsupported binary view."
              : "Native TTS protocol probe response was invalid.",
      );
      assert(
        result.code !== "tts-probe-unavailable",
        "Native TTS protocol probe command was unavailable.",
      );
    }
    assert(
      result?.status === "complete" &&
        result.observation?.byteLength === 19_200 &&
        result.observation?.sampleCount === 4_800 &&
        result.observation?.sampleFormat === "float32-le",
      "Native TTS protocol probe did not deliver bounded binary audio.",
    );
  }

  async function exerciseNativeTtsServiceLifecycle(driver, setStage) {
    setStage("native TTS service lifecycle dispatch");
    const started = await driver.execute(
      `if (
       typeof globalThis.__voxleafRunTtsServiceLifecycleProbe !== "function"
     ) {
       return false;
     }
     globalThis.__voxleafTtsServiceLifecycleObservation = {
       status: "pending",
     };
     globalThis.__voxleafRunTtsServiceLifecycleProbe()
       .then((observation) => {
         globalThis.__voxleafTtsServiceLifecycleObservation = {
           status: "complete",
           observation,
         };
       })
       .catch((error) => {
         const code =
           typeof error?.code === "string" &&
           error.code.startsWith("tts-service-")
             ? error.code
             : "tts-service-unexpected";
         globalThis.__voxleafTtsServiceLifecycleObservation = {
           status: "failed",
           code,
         };
       });
     return true;`,
    );
    assert(started === true, "Native TTS service lifecycle probe failed.");

    setStage("native TTS service lifecycle completion");
    await waitForCondition(
      driver,
      `return globalThis.__voxleafTtsServiceLifecycleObservation?.status !==
       "pending";`,
    );
    const result = await driver.execute(
      `const result = globalThis.__voxleafTtsServiceLifecycleObservation;
     delete globalThis.__voxleafTtsServiceLifecycleObservation;
     return result;`,
    );
    assert(
      result?.status === "complete" &&
        result.observation?.normalPayloadBytes === 19_200 &&
        result.observation?.normalSampleCountSamples === 4_800 &&
        result.observation?.cancellationCode === "tts-service-cancelled" &&
        result.observation?.finalState === "stopped" &&
        result.observation?.retainedAudioUnits === 0,
      "Native TTS service lifecycle probe failed.",
    );
  }

  return {
    cancelAdaptiveStartup,
    paragraphLeafActivationDelivered,
    waitForAdaptivePlaying,
    runAdaptiveTtsExactHostMatrix,
    selectAdaptiveTtsProfile,
    exerciseNarrationLanguagePreference,
    exerciseNativeTtsProtocolProbe,
    exerciseNativeTtsServiceLifecycle,
  };
}
