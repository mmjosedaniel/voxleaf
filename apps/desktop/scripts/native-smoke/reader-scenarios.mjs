import console from "node:console";
import { setTimeout as wait } from "node:timers/promises";
import { runWebDriverInteractionWithRetry } from "../native-webdriver-client.mjs";

export function createNativeReaderScenarios({
  assert,
  waitForCondition,
  openReaderSettings,
  closeReaderSettings,
  openReaderContents,
  closeReaderContents,
  injectNativeFile,
  INTERACTION_TIMEOUT_MS,
  NATIVE_BATCH_SCRIPT_LIMIT_MS,
  NATIVE_COMBINED_WORKING_SET_LIMIT_BYTES,
  NATIVE_LIVE_DOM_NODE_LIMIT,
  NATIVE_REFLOW_LIMIT_MS,
  NATIVE_RESOURCE_HEAP_GROWTH_LIMIT_BYTES,
  NATIVE_RESOURCE_STRESS_CYCLES,
  NATIVE_RESOURCE_WORKING_SET_GROWTH_LIMIT_BYTES,
  NATIVE_TARGET_READY_LIMIT_MS,
  NATIVE_TOTAL_RENDER_LIMIT_MS,
  OBSERVATION_WINDOW_MS,
  STARTUP_TIMEOUT_MS,
  WEBDRIVER_END,
  WEBDRIVER_ENTER,
  WEBDRIVER_PAGE_DOWN,
  WEBDRIVER_SPACE,
  WEBDRIVER_TAB,
  inspectPerformanceLogs,
  installNativeResourceInstrumentation,
  memoryDelta,
  nativeMemorySnapshot,
  nativeResourceInstrumentation,
  rounded,
  delay = wait,
  now = () => Date.now(),
}) {
  async function nativeReaderInteractionObservation(driver) {
    try {
      return await driver.execute(
        `const activeElement = document.activeElement;
       const readerViewport = document.querySelector(
         '[data-reader-scroll-owner="true"]',
       );
       const controls = Object.fromEntries(
         Array.from(
           document.querySelectorAll(".reader-preferences select[name]"),
         ).map((control) => [control.name, control.value]),
       );
       let preferencesPersisted = false;
       try {
         const serialized = localStorage.getItem(
           "voxleaf.reader.preferences",
         );
         preferencesPersisted =
           serialized !== null &&
           JSON.parse(serialized)?.version === 1;
       } catch {
         preferencesPersisted = false;
       }
       return {
         activeElement: {
           className:
             activeElement instanceof HTMLElement
               ? activeElement.className
               : "",
           name: activeElement?.getAttribute("name") ?? "",
           tagName: activeElement?.tagName ?? "",
         },
         controls,
         headingCount: document.querySelectorAll("h1, h2").length,
         preferencesPersisted,
         readerPresent:
           document.querySelector(".semantic-reader") !== null,
         scroll: {
            maximumY: Math.max(
              0,
              (readerViewport?.scrollHeight ?? 0) -
                (readerViewport?.clientHeight ?? 0),
            ),
            y: readerViewport?.scrollTop ?? 0,
          },
         viewport: {
           height: window.innerHeight,
           scale: window.visualViewport?.scale ?? 1,
           width: window.innerWidth,
         },
       };`,
      );
    } catch {
      return { observation: "unavailable" };
    }
  }

  async function runNativeReaderInteraction({
    action,
    condition,
    driver,
    label,
    setStage,
  }) {
    await runWebDriverInteractionWithRetry({
      action,
      condition: async () => {
        await waitForCondition(driver, condition, INTERACTION_TIMEOUT_MS);
      },
      onAttempt: async (attempt, maximumAttempts) => {
        setStage(
          `native reader ${label} (attempt ${String(attempt)} of ${String(maximumAttempts)})`,
        );
      },
      onConditionTimeout: async (attempt, maximumAttempts) => {
        const observation = await nativeReaderInteractionObservation(driver);
        console.error(
          `Native reader condition timed out during ${label} (attempt ${String(attempt)} of ${String(maximumAttempts)}): ${JSON.stringify(observation)}`,
        );
      },
    });
  }

  async function observeSavedPositionRestoration(driver) {
    const deadline = now() + STARTUP_TIMEOUT_MS;
    let observation;

    while (now() < deadline) {
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
       const readerViewport = document.querySelector(
         '[data-reader-scroll-owner="true"]',
       );
       const readerViewportTop =
         readerViewport?.getBoundingClientRect().top;
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
           typeof readerViewportTop === "number" &&
           Math.abs(continuationTop - (readerViewportTop + 24)) <= 1,
         continuationVisible,
         documentScrolled: (readerViewport?.scrollTop ?? 0) > 0,
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

  async function exerciseNativeReaderInteractionMatrix(driver, setStage) {
    await runNativeReaderInteraction({
      action: async () => {
        await driver.setWindowRect(320, 640);
      },
      condition: `return window.innerWidth <= 360 && window.innerHeight <= 680;`,
      driver,
      label: "narrow viewport settlement",
      setStage,
    });
    setStage("native reader narrow viewport assertion");
    const narrowLayout = await driver.execute(
      `const reader = document.querySelector(".semantic-reader");
     const article = document.querySelector(".semantic-document");
     const controls = document.querySelector(".application-bar");
     const scrollOwners = Array.from(
       document.querySelectorAll('[data-reader-scroll-owner="true"]'),
     );
     const scrollOwner = scrollOwners[0];
     const narrationDetailsButton = Array.from(
       document.querySelectorAll(".product-narration button"),
     ).find((button) =>
       button.textContent?.includes("narration details"),
     );
     const bounds = [reader, article, controls].map((element) =>
       element?.getBoundingClientRect(),
     );
     return {
       innerWidth: window.innerWidth,
       compactNarration:
         narrationDetailsButton?.getAttribute("aria-expanded") === "false" &&
         document.querySelector('progress') === null,
       fixedReaderShell:
         scrollOwners.length === 1 &&
         scrollOwner?.scrollHeight > scrollOwner?.clientHeight &&
         document.documentElement.scrollHeight <= window.innerHeight + 1,
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
      narrowLayout?.fits === true &&
        narrowLayout.compactNarration === true &&
        narrowLayout.fixedReaderShell === true,
      "Native reader did not fit the approved narrow viewport.",
    );

    const initialUrl = await driver.execute(`return window.location.href;`);
    await runNativeReaderInteraction({
      action: async () => {
        const skipLink = await driver.findElement("a.reader-skip-link");
        await driver.sendKeys(skipLink, WEBDRIVER_ENTER);
      },
      condition: `return document.activeElement?.matches(
       'article.semantic-document[aria-label="Current reading section"]',
     ) === true;`,
      driver,
      label: "skip-link focus transfer",
      setStage,
    });
    setStage("native reader skip-link URL assertion");
    assert(
      (await driver.execute(`return window.location.href;`)) === initialUrl,
      "Native reader skip or return navigation was not keyboard operable.",
    );

    await runNativeReaderInteraction({
      action: async () => {
        const article = await driver.findElement("article.semantic-document");
        await driver.execute(
          `const article = document.querySelector("article.semantic-document");
         const readerViewport = document.querySelector(
           '[data-reader-scroll-owner="true"]',
         );
         if (
           !(article instanceof HTMLElement) ||
           !(readerViewport instanceof HTMLElement)
         ) {
           return false;
         }
         readerViewport.scrollTop = 0;
         article.focus({ preventScroll: true });
         const state = {
           defaultPrevented: undefined,
           keyObserved: false,
           startY: readerViewport.scrollTop,
         };
         globalThis.__voxleafNativePageDownInteraction = state;
         article.addEventListener(
           "keydown",
           (event) => {
             if (event.key !== "PageDown") {
               return;
             }
             state.keyObserved = true;
             queueMicrotask(() => {
               state.defaultPrevented = event.defaultPrevented;
             });
           },
           { once: true },
         );
         return state.startY === 0;`,
        );
        await driver.sendKeys(article, WEBDRIVER_PAGE_DOWN);
      },
      condition: `const state =
       globalThis.__voxleafNativePageDownInteraction;
     return state?.startY === 0 &&
       state.keyObserved === true &&
       state.defaultPrevented === false &&
       document.querySelector(
         '[data-reader-scroll-owner="true"]',
       )?.scrollTop > state.startY;`,
      driver,
      label: "PageDown scrolling",
      setStage,
    });
    setStage("native reader PageDown focus assertion");
    assert(
      (await driver.execute(
        `return document.activeElement?.matches(
         'article.semantic-document[aria-label="Current reading section"]',
       ) === true;`,
      )) === true,
      "Native reader did not preserve native scrolling-key behavior.",
    );
    await driver.execute(
      `delete globalThis.__voxleafNativePageDownInteraction;
     return true;`,
    );

    await runNativeReaderInteraction({
      action: async () => {
        const returnLink = await driver.findElement("a.reader-return-link");
        await driver.sendKeys(returnLink, WEBDRIVER_ENTER);
      },
      condition: `return document.activeElement?.matches(
       'nav.reader-toc[aria-label="Table of contents"]',
     ) === true;`,
      driver,
      label: "return-link focus transfer",
      setStage,
    });
    setStage("native reader return-link URL assertion");
    assert(
      (await driver.execute(`return window.location.href;`)) === initialUrl,
      "Native reader skip or return navigation was not keyboard operable.",
    );

    setStage("native reader preference-control keyboard order");
    await closeReaderContents(driver);
    const settingsButton = await driver.findElement(
      ".application-bar-actions button",
    );
    await driver.sendKeys(settingsButton, WEBDRIVER_ENTER);
    await waitForCondition(
      driver,
      `return document.activeElement?.textContent?.trim() === "Close Settings";`,
    );
    const closeSettingsButton = await driver.findElement(
      "button.reader-settings-close",
    );
    await driver.sendKeys(closeSettingsButton, WEBDRIVER_TAB);
    let textScaleControl = await driver.findElement('select[name="textScale"]');
    assert(
      (await driver.execute(
        `return document.activeElement?.getAttribute("name") === "textScale";`,
      )) === true,
      "Native reader controls did not expose the approved keyboard order.",
    );
    await runNativeReaderInteraction({
      action: async () => {
        textScaleControl = await driver.findElement('select[name="textScale"]');
        await driver.sendKeys(textScaleControl, WEBDRIVER_END);
      },
      condition: `return document.querySelector('select[name="textScale"]')?.value ===
       "extra-large";`,
      driver,
      label: "text-scale keyboard selection",
      setStage,
    });
    setStage("native reader remaining preference-control keyboard order");
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
      activeControl = await driver.findElement(
        `select[name="${expectedName}"]`,
      );
    }

    await closeReaderSettings(driver);
    await openReaderContents(driver);
    const tocLinks = await driver.findElements("button.reader-toc-link");
    assert(
      tocLinks.length >= 2,
      "Native reader navigation was not keyboard operable.",
    );
    await runNativeReaderInteraction({
      action: async () => {
        const links = await driver.findElements("button.reader-toc-link");
        assert(
          links.length >= 2,
          "Native reader navigation was not keyboard operable.",
        );
        await driver.sendKeys(links[1], WEBDRIVER_ENTER);
      },
      condition: `return Array.from(document.querySelectorAll("h1")).some(
       (heading) =>
         heading.textContent === "Continuation" &&
         document.activeElement === heading,
     );`,
      driver,
      label: "table-of-contents destination focus",
      setStage,
    });
    await runNativeReaderInteraction({
      action: async () => {
        const previousChapter = await driver.findElement(
          '[data-reader-action="previous-chapter"]',
        );
        await driver.sendKeys(previousChapter, WEBDRIVER_SPACE);
      },
      condition: `return Array.from(document.querySelectorAll("h1")).some(
       (heading) =>
         heading.textContent === "Opening" &&
         document.activeElement === heading,
     );`,
      driver,
      label: "previous-chapter destination focus",
      setStage,
    });

    await openReaderSettings(driver);
    await runNativeReaderInteraction({
      action: async () => {
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
      },
      condition: `const serialized = localStorage.getItem(
       "voxleaf.reader.preferences",
     );
     if (serialized === null) {
       return false;
     }
     const preferences = JSON.parse(serialized);
     return preferences?.textScale === "extra-large" &&
       preferences?.lineSpacing === "spacious" &&
       preferences?.contentWidth === "narrow" &&
       preferences?.theme === "system";`,
      driver,
      label: "preference persistence",
      setStage,
    });
    await closeReaderSettings(driver);

    setStage("native reader accessibility media assertion");
    await driver.executeCdp("Emulation.setEmulatedMedia", {
      media: "",
      features: [
        { name: "prefers-color-scheme", value: "dark" },
        { name: "prefers-reduced-motion", value: "reduce" },
        { name: "forced-colors", value: "active" },
      ],
    });
    await openReaderContents(driver);
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
    setStage("native reader zoom assertion");
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
    await closeReaderContents(driver);
    await driver.setWindowRect(960, 720);
  }

  async function exerciseNativeSynchronizationFeasibility(driver, setStage) {
    setStage("native synchronization feasibility setup");
    await driver.setWindowRect(800, 400);
    // Window-command completion can precede WebView resize/reflow delivery.
    // Establish fixture readiness before sampling the offscreen precondition.
    await waitForCondition(
      driver,
      "return innerWidth === 800 && innerHeight === 400;",
      INTERACTION_TIMEOUT_MS,
    );
    await driver.execute(
      "return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve(true))));",
    );
    const proof = await driver.execute(
      `const highlights = CSS.highlights;
     if (
       highlights === undefined ||
       typeof globalThis.Highlight !== "function"
     ) {
       return { supported: false };
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
         (rule) =>
           rule instanceof CSSStyleRule &&
           rule.selectorText ===
             "::highlight(voxleaf-narration-active)",
       );
     const leaves = Array.from(
       document.querySelectorAll(
         ".semantic-document h1, .semantic-document h2, " +
         ".semantic-document h3, .semantic-document h4, " +
         ".semantic-document h5, .semantic-document h6, " +
         ".semantic-document p",
       ),
     );
     const firstText = (element) => {
       if (!(element instanceof HTMLElement)) {
         return undefined;
       }
       const walker = document.createTreeWalker(
         element,
         NodeFilter.SHOW_TEXT,
       );
       const node = walker.nextNode();
       return node instanceof Text ? node : undefined;
     };
     const selectionOwner = leaves[0];
     // Keep this synchronization proof independent from deferred raster
     // presentation. The comprehensive fixture's final paragraph contains a
     // lazy image whose legitimate mount changes DOM and geometry while it
     // enters the viewport.
     const target = [...leaves].reverse().find(
       (element) =>
         element.querySelector(".semantic-raster-host") === null &&
         (firstText(element)?.data.length ?? 0) >= 2,
     );
     const selectionText = firstText(selectionOwner);
     const targetText = firstText(target);
     const selection = document.getSelection();
     const focusOwner = Array.from(document.querySelectorAll("button")).find(
       (candidate) => candidate.textContent?.trim() === "Settings",
     );
     const readerViewport = document.querySelector(
       '[data-reader-scroll-owner="true"]',
     );
     if (
       selectionText === undefined ||
       targetText === undefined ||
       selectionText.data.length < 2 ||
       targetText.data.length < 2 ||
       selection === null ||
       !(focusOwner instanceof HTMLButtonElement) ||
       !(readerViewport instanceof HTMLElement)
     ) {
       return { supported: true, fixtureReady: false };
     }

     focusOwner.focus({ preventScroll: true });
     const selected = document.createRange();
     selected.setStart(selectionText, 0);
     selected.setEnd(selectionText, 1);
     selection.removeAllRanges();
     selection.addRange(selected);
     const selectionBefore = selection.toString();
     const article = target.closest(".semantic-document");

     const range = document.createRange();
     range.setStart(targetText, 0);
     range.setEnd(targetText, targetText.data.length);
     const highlightName = "voxleaf-narration-active";

     readerViewport.scrollTop = 0;
     const readerViewportBounds = readerViewport.getBoundingClientRect();
     const beforeFollow = range.getBoundingClientRect();
     // Keep the comfort band non-empty on short or DPI-scaled WebView2
     // viewports while retaining the frozen 24px maximum on normal windows.
     const comfortInsetPx = Math.min(
       24,
       Math.max(0, readerViewportBounds.height / 4),
     );
     const comfortTop = readerViewportBounds.top + comfortInsetPx;
     const comfortBottom = readerViewportBounds.bottom - comfortInsetPx;
     const outsideBefore =
       beforeFollow.bottom < comfortTop ||
       beforeFollow.top > comfortBottom;
     if (outsideBefore) {
       readerViewport.scrollTop += beforeFollow.top - comfortTop;
     }
     return new Promise((resolve) => {
       const maximumFollowAnimationFrames = 24;
       const requiredStableFollowFrames = 3;
       let followAnimationFrames = 0;
       let stableFollowFrames = 0;
       let previousFollowSignature;
       const settleFollow = () => {
         followAnimationFrames += 1;
         const followRect = range.getBoundingClientRect();
         const followSignature = [
           article?.querySelectorAll("*").length ?? -1,
           article?.textContent?.length ?? -1,
           Math.round(followRect.top * 100),
           Math.round(followRect.bottom * 100),
           Math.round(readerViewport.scrollTop * 100),
         ].join(":");
         stableFollowFrames =
           followSignature === previousFollowSignature
             ? stableFollowFrames + 1
             : 0;
         previousFollowSignature = followSignature;
         if (
           stableFollowFrames < requiredStableFollowFrames &&
           followAnimationFrames < maximumFollowAnimationFrames
         ) {
           requestAnimationFrame(settleFollow);
           return;
         }

         const settledFollowRect = range.getBoundingClientRect();
         const settledInsideReaderViewport =
           settledFollowRect.bottom >= comfortTop - 1 &&
           settledFollowRect.top <= comfortBottom + 1;
         if (
           !settledInsideReaderViewport &&
           followAnimationFrames < maximumFollowAnimationFrames
         ) {
           readerViewport.scrollTop += settledFollowRect.top - comfortTop;
           stableFollowFrames = 0;
           previousFollowSignature = undefined;
           requestAnimationFrame(settleFollow);
           return;
         }

         const descendantCountBefore =
           article?.querySelectorAll("*").length;
         const textLengthBefore = article?.textContent?.length;
         const initialUrl = window.location.href;
         const highlight = new Highlight(range);
         highlights.set(highlightName, highlight);
         const rangeAcceptedBeforePaint =
           highlights.has(highlightName) && highlight.has(range);
         const highlightPerceivableBeforePaint = false;

       let registeredAnimationFrames = 0;
       const observeRenderingOpportunity = () => {
         registeredAnimationFrames += 1;
         if (registeredAnimationFrames < 2) {
           requestAnimationFrame(observeRenderingOpportunity);
           return;
         }
         const afterFollow = range.getBoundingClientRect();
         const renderedStyle = getComputedStyle(
           target,
           "::highlight(voxleaf-narration-active)",
         );
         const parseColor = (value) => {
           const rgb = value.match(
             /^rgba?\\(\\s*(\\d+(?:\\.\\d+)?)\\s*,?\\s*(\\d+(?:\\.\\d+)?)\\s*,?\\s*(\\d+(?:\\.\\d+)?)/u,
           );
           if (rgb !== null) {
             return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
           }
           const hex = value.match(/^#([\\da-f]{6})$/iu);
           if (hex === null) {
             return undefined;
           }
           const packed = Number.parseInt(hex[1], 16);
           return [
             (packed >> 16) & 255,
             (packed >> 8) & 255,
             packed & 255,
           ];
         };
         const luminance = (color) => {
           const channels = color.map((channel) => {
             const normalized = channel / 255;
             return normalized <= 0.04045
               ? normalized / 12.92
               : ((normalized + 0.055) / 1.055) ** 2.4;
           });
           return (
             channels[0] * 0.2126 +
             channels[1] * 0.7152 +
             channels[2] * 0.0722
           );
         };
         const foreground = parseColor(renderedStyle.color);
         const background = parseColor(renderedStyle.backgroundColor);
         const foregroundLuminance =
           foreground === undefined ? undefined : luminance(foreground);
         const backgroundLuminance =
           background === undefined ? undefined : luminance(background);
         const textContrastRatio =
           foregroundLuminance === undefined ||
           backgroundLuminance === undefined
             ? 0
             : (Math.max(
                 foregroundLuminance,
                 backgroundLuminance,
               ) +
                 0.05) /
               (Math.min(
                 foregroundLuminance,
                 backgroundLuminance,
               ) +
                 0.05);
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
         const registeredAcrossRenderingOpportunity =
           highlights.has(highlightName) && highlight.has(range);
         const highlightVisiblyPerceivable =
           rangeAcceptedBeforePaint &&
           registeredAcrossRenderingOpportunity &&
           registeredAnimationFrames >= 2 &&
           hasNonzeroClientGeometry &&
           insideReaderViewport &&
           hasExplicitForegroundAndBackground &&
           textContrastRatio >= 4.5 &&
           hasNonColorUnderline;
         const result = {
           supported: true,
           fixtureReady: true,
           rangeAcceptedBeforePaint,
           highlightPerceivableBeforePaint,
           registeredAcrossRenderingOpportunity,
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
            focusPreserved: document.activeElement === focusOwner,
           selectionPreserved:
             selection.rangeCount === 1 &&
             selection.toString() === selectionBefore &&
             selection.getRangeAt(0) === selected,
           publicationDomUnchanged:
             article?.querySelectorAll("*").length ===
               descendantCountBefore &&
             article?.textContent?.length === textLengthBefore,
           urlUnchanged: window.location.href === initialUrl,
         };
         highlights.delete(highlightName);
         selection.removeAllRanges();
         resolve(result);
       };
       requestAnimationFrame(observeRenderingOpportunity);
       };
       requestAnimationFrame(settleFollow);
     });`,
    );
    await driver.setWindowRect(960, 720);

    setStage("native synchronization feasibility assertion");
    if (
      proof?.supported !== true ||
      proof.fixtureReady !== true ||
      proof.rangeAcceptedBeforePaint !== true ||
      proof.highlightPerceivableBeforePaint !== false ||
      proof.registeredAcrossRenderingOpportunity !== true ||
      proof.registeredAnimationFrames < 2 ||
      proof.styleRegistered !== true ||
      proof.rangeConnected !== true ||
      proof.hasNonzeroClientGeometry !== true ||
      proof.insideReaderViewport !== true ||
      proof.hasExplicitForegroundAndBackground !== true ||
      proof.textContrastRatio < 4.5 ||
      proof.hasNonColorUnderline !== true ||
      proof.highlightVisiblyPerceivable !== true ||
      proof.followed !== true ||
      proof.focusPreserved !== true ||
      proof.selectionPreserved !== true ||
      proof.publicationDomUnchanged !== true ||
      proof.urlUnchanged !== true
    ) {
      console.error(
        `Native synchronization feasibility observation: ${JSON.stringify(proof)}`,
      );
    }
    assert(
      proof?.supported === true &&
        proof.fixtureReady === true &&
        proof.rangeAcceptedBeforePaint === true &&
        proof.highlightPerceivableBeforePaint === false &&
        proof.registeredAcrossRenderingOpportunity === true &&
        proof.registeredAnimationFrames >= 2 &&
        proof.styleRegistered === true &&
        proof.rangeConnected === true &&
        proof.hasNonzeroClientGeometry === true &&
        proof.insideReaderViewport === true &&
        proof.hasExplicitForegroundAndBackground === true &&
        proof.textContrastRatio >= 4.5 &&
        proof.hasNonColorUnderline === true &&
        proof.highlightVisiblyPerceivable === true &&
        proof.followed === true &&
        proof.focusPreserved === true &&
        proof.selectionPreserved === true &&
        proof.publicationDomUnchanged === true &&
        proof.urlUnchanged === true,
      "Native synchronization feasibility proof failed.",
    );
  }

  async function beginNativeRenderInstrumentation(driver) {
    const startedAt = await driver.execute(
      `const originalRequestAnimationFrame =
       globalThis.__voxleafNativeOriginalRequestAnimationFrame ??
       globalThis.requestAnimationFrame.bind(globalThis);
     if (globalThis.__voxleafNativeOriginalRequestAnimationFrame === undefined) {
       Object.defineProperty(
         globalThis,
         "__voxleafNativeOriginalRequestAnimationFrame",
         { configurable: false, value: originalRequestAnimationFrame },
       );
       globalThis.requestAnimationFrame = (callback) =>
         originalRequestAnimationFrame((timestamp) => {
           const instrumentation =
             globalThis.__voxleafNativeRenderInstrumentation;
           const callbackStartedAt = performance.now();
           if (instrumentation?.active === true) {
             instrumentation.pendingBatchStartedAt = callbackStartedAt;
           }
           callback(timestamp);
           if (instrumentation?.active === true) {
             instrumentation.callbackDurations.push(
               performance.now() - callbackStartedAt,
             );
           }
         });
     }
     globalThis.__voxleafNativeRenderObserver?.disconnect();
     const instrumentation = {
       active: true,
       selectionStartedAt: performance.now(),
       firstContentAt: 0,
       completeAt: 0,
       callbackDurations: [],
       pendingBatchStartedAt: 0,
       batchCommitDurations: [],
       previousRenderedBlocks: 0,
     };
     Object.defineProperty(
       globalThis,
       "__voxleafNativeRenderInstrumentation",
       { configurable: true, value: instrumentation },
     );
     const observeProgress = () => {
       const article = document.querySelector(".semantic-document");
       const renderedBlocks = article?.children.length ?? 0;
       if (renderedBlocks > 0 && instrumentation.firstContentAt === 0) {
         instrumentation.firstContentAt = performance.now();
       }
       if (
         renderedBlocks === 10000 &&
         document.querySelector(".reader-rendering-status") === null
       ) {
         instrumentation.completeAt = performance.now();
       }
       if (
         renderedBlocks > instrumentation.previousRenderedBlocks &&
         instrumentation.previousRenderedBlocks > 0 &&
         instrumentation.pendingBatchStartedAt > 0
       ) {
         instrumentation.batchCommitDurations.push(
           performance.now() - instrumentation.pendingBatchStartedAt,
         );
         instrumentation.pendingBatchStartedAt = 0;
       }
       instrumentation.previousRenderedBlocks = renderedBlocks;
     };
     const observer = new MutationObserver(observeProgress);
     observer.observe(document.body, { childList: true, subtree: true });
     Object.defineProperty(
       globalThis,
       "__voxleafNativeRenderObserver",
       { configurable: true, value: observer },
     );
     return instrumentation.selectionStartedAt;`,
    );
    assert(
      Number.isFinite(startedAt),
      "Native reader performance metrics were unavailable.",
    );
    return startedAt;
  }

  async function finishNativeRenderInstrumentation(driver) {
    const measurement = await driver.execute(
      `const instrumentation =
       globalThis.__voxleafNativeRenderInstrumentation;
     globalThis.__voxleafNativeRenderObserver?.disconnect();
     if (instrumentation === undefined) {
       return undefined;
     }
     instrumentation.active = false;
     return {
       selectionStartedAt: instrumentation.selectionStartedAt,
       firstContentAt: instrumentation.firstContentAt,
       completeAt: instrumentation.completeAt,
       callbackDurations: [...instrumentation.callbackDurations],
       batchCommitDurations: [...instrumentation.batchCommitDurations],
     };`,
    );
    assert(
      measurement !== undefined &&
        measurement.firstContentAt > measurement.selectionStartedAt &&
        measurement.completeAt > measurement.firstContentAt,
      "Native reader performance metrics were unavailable.",
    );
    return measurement;
  }

  async function replaceNativePublicationForCleanup(
    driver,
    invalidFixturePath,
  ) {
    await injectNativeFile(driver, invalidFixturePath);
    await waitForCondition(
      driver,
      `return document.querySelector('[role="status"]')?.textContent ===
       "That file is not a valid supported EPUB.";`,
    );
  }

  async function runNativeReaderPerformanceBenchmark(
    driver,
    fixtures,
    rootProcessId,
    setStage,
  ) {
    setStage("native reader performance instrumentation");
    await driver.setWindowRect(1_280, 720);
    await installNativeResourceInstrumentation(driver);
    await driver.execute(
      `localStorage.removeItem("voxleaf.reader.positions");
     localStorage.removeItem("voxleaf.reader.preferences");
     return true;`,
    );
    setStage("native reader baseline memory measurement");
    const baseline = await nativeMemorySnapshot(
      driver,
      rootProcessId,
      setStage,
      "native reader baseline",
    );

    setStage("native exact-limit render measurement");
    await beginNativeRenderInstrumentation(driver);
    const exactInput = await driver.findElement('input[type="file"]');
    await driver.sendKeys(exactInput, fixtures.exact);
    await waitForCondition(
      driver,
      `const article = document.querySelector(".semantic-document");
     return article !== null && article.children.length >= 250;`,
    );
    await openReaderContents(driver);
    const deepTargetLinks = await driver.execute(
      `return document.querySelectorAll("button.reader-toc-link").length;`,
    );
    assert(
      deepTargetLinks >= 2,
      "Native reader performance metrics were unavailable.",
    );
    const targetStartedAt = await driver.execute(`return performance.now();`);
    await driver.execute(
      `document.querySelectorAll("button.reader-toc-link")[1]?.click();
     return true;`,
    );
    await waitForCondition(
      driver,
      `return Array.from(document.querySelectorAll("h2")).some(
       (heading) =>
         heading.textContent === "Deep target" &&
         document.activeElement === heading,
     );`,
    );
    const targetReadyMs =
      (await driver.execute(`return performance.now();`)) - targetStartedAt;
    await waitForCondition(
      driver,
      `const article = document.querySelector(".semantic-document");
     return article?.children.length === 10000 &&
       document.querySelector(".reader-rendering-status") === null;`,
    );
    const renderInstrumentation =
      await finishNativeRenderInstrumentation(driver);
    const exactFinal = await nativeMemorySnapshot(
      driver,
      rootProcessId,
      setStage,
      "native exact-limit final",
    );
    const exactMemoryDelta = memoryDelta(baseline, exactFinal);
    const maximumBatchScriptMs = Math.max(
      0,
      ...renderInstrumentation.batchCommitDurations,
    );
    const maximumSchedulerCallbackMs = Math.max(
      0,
      ...renderInstrumentation.callbackDurations,
    );
    const selectionToFirstContentMs =
      renderInstrumentation.firstContentAt -
      renderInstrumentation.selectionStartedAt;
    const incrementalAppendMs =
      renderInstrumentation.completeAt - renderInstrumentation.firstContentAt;
    await openReaderSettings(driver);
    const preferenceReflowMs = await driver.execute(
      `return new Promise((resolve, reject) => {
       const select = document.querySelector('select[name="textScale"]');
       if (!(select instanceof HTMLSelectElement)) {
         reject(new Error("reader-preference-unavailable"));
         return;
       }
       const startedAt = performance.now();
       select.value = "large";
       select.dispatchEvent(new Event("change", { bubbles: true }));
       requestAnimationFrame(() =>
         requestAnimationFrame(() =>
           requestAnimationFrame(() => resolve(performance.now() - startedAt)),
         ),
       );
      });`,
    );
    await closeReaderSettings(driver);
    setStage("native exact-limit assertions");
    assert(
      maximumBatchScriptMs <= NATIVE_BATCH_SCRIPT_LIMIT_MS &&
        targetReadyMs <= NATIVE_TARGET_READY_LIMIT_MS &&
        incrementalAppendMs <= NATIVE_TOTAL_RENDER_LIMIT_MS &&
        preferenceReflowMs <= NATIVE_REFLOW_LIMIT_MS &&
        exactMemoryDelta.domNodes <= NATIVE_LIVE_DOM_NODE_LIMIT &&
        exactMemoryDelta.workingSetBytes <=
          NATIVE_COMBINED_WORKING_SET_LIMIT_BYTES,
      "Native reader exceeded the approved performance limits.",
    );
    await replaceNativePublicationForCleanup(driver, fixtures.dismissal);
    await delay(OBSERVATION_WINDOW_MS);
    const exactClosedResources = await nativeResourceInstrumentation(driver);
    assert(
      exactClosedResources.activeIntersectionObservers === 0 &&
        exactClosedResources.activeObjectUrls === 0 &&
        exactClosedResources.activeResizeObservers === 0,
      "Native reader resources remained active after close.",
    );

    const closedSnapshots = [];
    const cycleReports = [];
    for (let cycle = 0; cycle < NATIVE_RESOURCE_STRESS_CYCLES; cycle += 1) {
      setStage(`native reader resource cycle ${String(cycle + 1)}`);
      const openStartedAt = await driver.execute(`return performance.now();`);
      const fileInput = await driver.findElement('input[type="file"]');
      await driver.sendKeys(fileInput, fixtures.representative);
      await waitForCondition(
        driver,
        `return document.querySelector(".semantic-document") !== null &&
         document.querySelector(".open-status")?.textContent !==
           "Validating and opening the selected EPUB." &&
         document.querySelector(".open-status")?.textContent !==
           "Restoring saved reader state.";`,
      );
      const openMs =
        (await driver.execute(`return performance.now();`)) - openStartedAt;
      if (cycle > 0) {
        assert(
          (await driver.execute(
            `return document.querySelector(".open-status")?.textContent ===
             "Reading position restored.";`,
          )) === true && openMs <= NATIVE_TARGET_READY_LIMIT_MS,
          "Native reader exceeded the approved performance limits.",
        );
      }

      await openReaderContents(driver);
      const tocLinks = await driver.execute(
        `return document.querySelectorAll("button.reader-toc-link").length;`,
      );
      assert(
        tocLinks >= 2,
        "Native reader performance metrics were unavailable.",
      );
      await driver.execute(
        `document.querySelectorAll("button.reader-toc-link")[0]?.click();
       return true;`,
      );
      await waitForCondition(
        driver,
        `return Array.from(document.querySelectorAll("h1")).some(
         (heading) => heading.textContent === "Opening",
       );`,
      );
      await driver.execute(
        `document.querySelector(".semantic-raster-host")
         ?.scrollIntoView({ block: "center" });
       return true;`,
      );
      await waitForCondition(
        driver,
        `const image = document.querySelector('img[alt="Synthetic cover"]');
       return image !== null &&
         image.src.startsWith("blob:") &&
         image.getClientRects().length > 0;`,
      );

      const chapterStartedAt = await driver.execute(
        `return performance.now();`,
      );
      await openReaderContents(driver);
      await driver.execute(
        `document.querySelectorAll("button.reader-toc-link")[1]?.click();
       return true;`,
      );
      await waitForCondition(
        driver,
        `return Array.from(document.querySelectorAll("h1")).some(
         (heading) =>
           heading.textContent === "Continuation" &&
           document.activeElement === heading,
       );`,
      );
      const chapterMs =
        (await driver.execute(`return performance.now();`)) - chapterStartedAt;
      assert(
        chapterMs <= NATIVE_TARGET_READY_LIMIT_MS,
        "Native reader exceeded the approved performance limits.",
      );
      await waitForCondition(
        driver,
        `const serialized = localStorage.getItem("voxleaf.reader.positions");
       if (serialized === null) {
         return false;
       }
       try {
         return JSON.parse(serialized)?.states?.[0]?.locator
           ?.spineItemIndex === 1;
       } catch {
         return false;
       }`,
      );

      await replaceNativePublicationForCleanup(driver, fixtures.dismissal);
      await delay(OBSERVATION_WINDOW_MS);
      const settledResources = await nativeResourceInstrumentation(driver);
      assert(
        settledResources.activeIntersectionObservers === 0 &&
          settledResources.activeObjectUrls === 0 &&
          settledResources.activeResizeObservers === 0 &&
          (await driver.findElements(".semantic-reader")).length === 0,
        "Native reader resources remained active after close.",
      );
      const storageWritesAfterClose = settledResources.storageWrites;
      await delay(OBSERVATION_WINDOW_MS);
      assert(
        (await nativeResourceInstrumentation(driver)).storageWrites ===
          storageWritesAfterClose,
        "Native reader resources remained active after close.",
      );
      const closedSnapshot = await nativeMemorySnapshot(
        driver,
        rootProcessId,
        setStage,
        `native reader resource cycle ${String(cycle + 1)} closed`,
      );
      setStage(`native reader resource cycle ${String(cycle + 1)} assertions`);
      closedSnapshots.push(closedSnapshot);
      assert(
        closedSnapshot.domNodes <= baseline.domNodes + 256,
        "Native reader resources remained active after close.",
      );
      cycleReports.push({
        cycle: cycle + 1,
        openMs: rounded(openMs),
        restoreMs: cycle === 0 ? null : rounded(openMs),
        chapterMs: rounded(chapterMs),
        closedMemoryDelta: memoryDelta(baseline, closedSnapshot),
        storageWrites: storageWritesAfterClose,
      });
    }

    const firstClosed = closedSnapshots[0];
    const lastClosed = closedSnapshots.at(-1);
    assert(
      firstClosed !== undefined &&
        lastClosed !== undefined &&
        lastClosed.jsHeapBytes <=
          firstClosed.jsHeapBytes + NATIVE_RESOURCE_HEAP_GROWTH_LIMIT_BYTES &&
        lastClosed.workingSetBytes <=
          firstClosed.workingSetBytes +
            NATIVE_RESOURCE_WORKING_SET_GROWTH_LIMIT_BYTES,
      "Native reader resources remained active after close.",
    );

    setStage("native over-limit recovery measurement");
    const overLimitInput = await driver.findElement('input[type="file"]');
    await driver.sendKeys(overLimitInput, fixtures.overLimit);
    await waitForCondition(
      driver,
      `const article = document.querySelector(
       ".semantic-document.reader-chapter-too-large",
     );
     return article?.children.length === 3 &&
       document.querySelector(".reader-rendering-status") === null;`,
    );
    const recoveryInput = await driver.findElement('input[type="file"]');
    await driver.sendKeys(recoveryInput, fixtures.representative);
    await waitForCondition(
      driver,
      `return document.querySelector(
       ".semantic-document:not(.reader-chapter-too-large)",
     ) !== null;`,
    );
    await replaceNativePublicationForCleanup(driver, fixtures.dismissal);
    await delay(OBSERVATION_WINDOW_MS);
    const finalResources = await nativeResourceInstrumentation(driver);
    const storageBounds = await driver.execute(
      `const positions = localStorage.getItem("voxleaf.reader.positions");
     const preferences = localStorage.getItem("voxleaf.reader.preferences");
     let positionCount;
     try {
       positionCount =
         positions === null ? 0 : JSON.parse(positions).states.length;
     } catch {
       positionCount = -1;
     }
     return {
       positionsLength: positions?.length ?? 0,
       preferencesLength: preferences?.length ?? 0,
       positionCount,
       unexpectedReaderKeys: Object.keys(localStorage).filter(
         (key) =>
           key.startsWith("voxleaf.reader.") &&
           key !== "voxleaf.reader.positions" &&
           key !== "voxleaf.reader.preferences",
       ).length,
     };`,
    );
    assert(
      finalResources.activeIntersectionObservers === 0 &&
        finalResources.activeObjectUrls === 0 &&
        finalResources.activeResizeObservers === 0 &&
        storageBounds.positionCount >= 0 &&
        storageBounds.positionCount <= 128 &&
        storageBounds.positionsLength <= 262_144 &&
        storageBounds.preferencesLength <= 1_024 &&
        storageBounds.unexpectedReaderKeys === 0,
      "Native over-limit reader recovery failed.",
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
    setStage("native performance privacy assertions");
    await delay(OBSERVATION_WINDOW_MS);
    const browserLogs = await driver.getLogs("browser");
    const performanceLogs = inspectPerformanceLogs(
      await driver.getLogs("performance"),
    );
    assert(
      browserLogs.every((entry) => entry?.level !== "SEVERE") &&
        performanceLogs.runtimeErrorCount === 0 &&
        externalLoadedResourceCount === 0 &&
        performanceLogs.externalRequestCount === 0,
      performanceLogs.externalRequestCount > 0 ||
        externalLoadedResourceCount > 0
        ? "Native application attempted an external request."
        : "Native application emitted a page or console error.",
    );

    console.log(
      `NATIVE_READER_PERFORMANCE_BENCHMARK ${JSON.stringify({
        exactLimit: {
          blockCount: 10_000,
          selectionToFirstContentMs: rounded(selectionToFirstContentMs),
          maximumSchedulerCallbackMs: rounded(maximumSchedulerCallbackMs),
          maximumBatchScriptMs: rounded(maximumBatchScriptMs),
          targetReadyMs: rounded(targetReadyMs),
          incrementalAppendMs: rounded(incrementalAppendMs),
          preferenceReflowMs: rounded(preferenceReflowMs),
          memoryDelta: exactMemoryDelta,
        },
        resourceStress: {
          cycles: NATIVE_RESOURCE_STRESS_CYCLES,
          cycleReports,
          firstToLastClosedDelta: {
            domNodes: lastClosed.domNodes - firstClosed.domNodes,
            jsHeapBytes: Math.max(
              0,
              lastClosed.jsHeapBytes - firstClosed.jsHeapBytes,
            ),
            workingSetBytes: Math.max(
              0,
              lastClosed.workingSetBytes - firstClosed.workingSetBytes,
            ),
          },
          finalResources,
          storageBounds,
        },
      })}`,
    );
  }

  return {
    runNativeReaderInteraction,
    observeSavedPositionRestoration,
    exerciseNativeReaderInteractionMatrix,
    exerciseNativeSynchronizationFeasibility,
    replaceNativePublicationForCleanup,
    runNativeReaderPerformanceBenchmark,
  };
}
