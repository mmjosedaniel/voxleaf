import { expect, test } from "@playwright/test";

const LOCAL_ORIGIN = "http://127.0.0.1:4173";
const TEST_STORAGE_KEY = "voxleaf.browser-smoke";
const READER_PREFERENCES_STORAGE_KEY = "voxleaf.reader.preferences";

async function buildNavigationFixture(): Promise<Uint8Array> {
  const fixtureModuleUrl = new URL(
    "../../../../packages/epub/test-support/epub-fixture.ts",
    import.meta.url,
  );
  const fixtureModule = (await import(fixtureModuleUrl.href)) as {
    buildComprehensiveEpubFixture(): Promise<Uint8Array>;
  };
  return fixtureModule.buildComprehensiveEpubFixture();
}

test("controls the browser boundary and exposes the local EPUB open shell", async ({
  context,
  page,
}) => {
  let unexpectedRequestCount = 0;

  await context.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.origin === LOCAL_ORIGIN) {
      await route.continue();
      return;
    }

    unexpectedRequestCount += 1;
    await route.abort("blockedbyclient");
  });
  await page.addInitScript(
    (keys) => {
      for (const key of keys) {
        localStorage.removeItem(key);
      }
    },
    [TEST_STORAGE_KEY, READER_PREFERENCES_STORAGE_KEY],
  );
  await page.addInitScript(() => {
    const originalRevoke = URL.revokeObjectURL.bind(URL);
    let revokedObjectUrlCount = 0;
    Object.defineProperty(globalThis, "__voxleafRevokedObjectUrlCount", {
      configurable: false,
      get: () => revokedObjectUrlCount,
    });
    URL.revokeObjectURL = (objectUrl: string): void => {
      revokedObjectUrlCount += 1;
      originalRevoke(objectUrl);
    };
  });

  try {
    expect(page.viewportSize()).toEqual({ width: 1_280, height: 720 });
    await page.goto("/");

    const main = page.getByRole("main");
    const shell = page.getByRole("region", {
      name: "VoxLeaf",
    });
    const heading = page.getByRole("heading", {
      level: 1,
      name: "VoxLeaf",
    });
    const fileInput = page.getByLabel("Open a local EPUB");

    await expect(main).toBeVisible();
    await expect(shell).toBeVisible();
    await expect(heading).toBeVisible();
    await expect(page.getByRole("status")).toHaveText("No local EPUB is open.");
    await expect(fileInput).toHaveAttribute(
      "accept",
      ".epub,application/epub+zip",
    );

    await fileInput.focus();
    await expect(fileInput).toBeFocused();

    await fileInput.setInputFiles({
      name: "private-browser-smoke.epub",
      mimeType: "application/epub+zip",
      buffer: Buffer.from("not-an-epub"),
    });
    await expect(page.getByRole("status")).toHaveText(
      "That file is not a valid supported EPUB.",
    );
    await expect(fileInput).toHaveValue("");
    await expect(page.getByText("private-browser-smoke.epub")).toHaveCount(0);

    const publicationBytes = await buildNavigationFixture();
    await fileInput.setInputFiles({
      name: "private-navigation-smoke.epub",
      mimeType: "application/epub+zip",
      buffer: Buffer.from(publicationBytes),
    });
    await expect(page.getByRole("status")).toHaveText(
      "The EPUB opened successfully.",
    );

    const reader = page.locator(".semantic-reader");
    const appearance = page.getByRole("group", {
      name: "Reader appearance",
    });
    await expect(appearance).toBeVisible();
    await expect(page.getByLabel("Text size")).toHaveValue("standard");
    await expect(page.getByLabel("Line spacing")).toHaveValue("comfortable");
    await expect(page.getByLabel("Content width")).toHaveValue("standard");
    await expect(page.getByLabel("Theme")).toHaveValue("system");
    await expect(reader).toHaveAttribute("data-reader-mode", "continuous");

    await page.getByLabel("Text size").selectOption("extra-large");
    await page.getByLabel("Line spacing").selectOption("spacious");
    await page.getByLabel("Content width").selectOption("wide");
    await page.getByLabel("Theme").selectOption("dark");
    await expect(reader).toHaveAttribute(
      "data-reader-text-scale",
      "extra-large",
    );
    await expect(reader).toHaveAttribute(
      "data-reader-line-spacing",
      "spacious",
    );
    await expect(reader).toHaveAttribute("data-reader-content-width", "wide");
    await expect(reader).toHaveAttribute("data-reader-theme", "dark");
    expect(
      await reader.evaluate((element) => ({
        colorScheme: getComputedStyle(element).colorScheme,
        inlineStyle: element.getAttribute("style"),
      })),
    ).toEqual({ colorScheme: "dark", inlineStyle: null });

    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
    await page.getByLabel("Theme").selectOption("system");
    expect(
      await reader.evaluate((element) => ({
        colorScheme: getComputedStyle(element).colorScheme,
        transitionDuration: getComputedStyle(element).transitionDuration,
      })),
    ).toEqual({ colorScheme: "dark", transitionDuration: "0s" });
    await page.getByLabel("Theme").selectOption("light");
    await expect
      .poll(() =>
        reader.evaluate((element) => getComputedStyle(element).colorScheme),
      )
      .toBe("light");

    await page.emulateMedia({ forcedColors: "active" });
    await page.getByLabel("Text size").focus();
    const forcedColorFocus = await page
      .getByLabel("Text size")
      .evaluate((element) => ({
        forcedColors: matchMedia("(forced-colors: active)").matches,
        outlineStyle: getComputedStyle(element).outlineStyle,
        outlineWidth: Number.parseFloat(getComputedStyle(element).outlineWidth),
      }));
    expect(forcedColorFocus.forcedColors).toBe(true);
    expect(forcedColorFocus.outlineStyle).not.toBe("none");
    expect(forcedColorFocus.outlineWidth).toBeGreaterThan(0);
    await page.emulateMedia({ forcedColors: "none" });

    await expect
      .poll(() =>
        page.evaluate(
          (key) => localStorage.getItem(key),
          READER_PREFERENCES_STORAGE_KEY,
        ),
      )
      .toBeNull();

    const toc = page.getByRole("navigation", { name: "Table of contents" });
    await expect(toc.getByText("Part One", { exact: true })).toBeVisible();
    await expect(toc.getByRole("button", { name: "Part One" })).toHaveCount(0);
    await page.locator(".semantic-raster-host").scrollIntoViewIfNeeded();
    const publicationImage = page.getByRole("img", {
      name: "Synthetic cover",
      exact: true,
    });
    await expect(publicationImage).toBeVisible();
    await expect(publicationImage).toHaveAttribute("src", /^blob:/u);
    expect(
      await publicationImage.evaluate((image: HTMLImageElement) => ({
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      })),
    ).toEqual({ naturalWidth: 1, naturalHeight: 1 });
    expect(
      await page.evaluate(
        () =>
          (
            globalThis as typeof globalThis & {
              __voxleafRevokedObjectUrlCount: number;
            }
          ).__voxleafRevokedObjectUrlCount,
      ),
    ).toBe(0);
    await expect(page.locator(".semantic-reader")).not.toContainText(
      "images/cover.png",
    );

    await toc.getByRole("button", { name: "Continuation" }).click();
    const continuationHeading = page.getByRole("heading", {
      level: 1,
      name: "Continuation",
    });
    await expect(continuationHeading).toBeVisible();
    await expect(continuationHeading).toBeFocused();
    await expect(page).toHaveURL(`${LOCAL_ORIGIN}/`);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (
              globalThis as typeof globalThis & {
                __voxleafRevokedObjectUrlCount: number;
              }
            ).__voxleafRevokedObjectUrlCount,
        ),
      )
      .toBeGreaterThanOrEqual(1);

    await page.getByRole("button", { name: "Previous chapter" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Opening" }),
    ).toBeFocused();
    await page.locator(".semantic-raster-host").scrollIntoViewIfNeeded();
    await expect(publicationImage).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(continuationHeading).toBeFocused();

    await page.getByRole("button", { name: "Next chapter" }).click();
    await expect(
      page.getByRole("heading", { level: 2, name: "Appendix" }),
    ).toBeFocused();
    await expect(
      page.getByRole("button", { name: "Next chapter" }),
    ).toBeDisabled();
    await expect(page.locator(".semantic-reader a")).toHaveCount(0);
    await expect(page.locator(".semantic-reader [href]")).toHaveCount(0);
    await expect(page.getByText("private-navigation-smoke.epub")).toHaveCount(
      0,
    );
    await page.getByRole("button", { name: "Previous chapter" }).click();
    await expect(continuationHeading).toBeFocused();
    await expect(
      page.locator(".semantic-document code", {
        hasText: "synthetic_unbroken_code_token_",
      }),
    ).toBeVisible();

    await expect
      .poll(() =>
        page.evaluate((key) => localStorage.getItem(key), TEST_STORAGE_KEY),
      )
      .toBeNull();
    await page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
      key: TEST_STORAGE_KEY,
      value: "controlled",
    });
    await expect
      .poll(() =>
        page.evaluate((key) => localStorage.getItem(key), TEST_STORAGE_KEY),
      )
      .toBe("controlled");

    for (const viewport of [
      { width: 1_280, height: 720 },
      { width: 768, height: 720 },
      { width: 320, height: 640 },
      { width: 360, height: 640 },
    ]) {
      await page.setViewportSize(viewport);
      const layout = await shell.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const reader = document.querySelector(".semantic-reader");
        const article = document.querySelector(".semantic-document");
        const controls = document.querySelector(".reader-preferences");
        const longCode = document.querySelector(".semantic-document code");
        const targetBounds = [reader, article, controls, longCode].flatMap(
          (target) => (target === null ? [] : [target.getBoundingClientRect()]),
        );
        return {
          left: bounds.left,
          right: bounds.right,
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
          targetsWithinViewport: targetBounds.every(
            (target) =>
              target.left >= -0.5 && target.right <= window.innerWidth + 0.5,
          ),
        };
      });

      expect(layout.left).toBeGreaterThanOrEqual(-0.5);
      expect(layout.right).toBeLessThanOrEqual(layout.viewportWidth + 0.5);
      expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
      expect(layout.targetsWithinViewport).toBe(true);
    }

    await page.setViewportSize({ width: 640, height: 720 });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    const zoomedLayout = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      articleRight:
        document.querySelector(".semantic-document")?.getBoundingClientRect()
          .right ?? Number.POSITIVE_INFINITY,
    }));
    expect(zoomedLayout.documentWidth).toBeLessThanOrEqual(
      zoomedLayout.viewportWidth,
    );
    expect(zoomedLayout.articleRight).toBeLessThanOrEqual(
      zoomedLayout.viewportWidth + 0.5,
    );
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "";
    });

    await page.evaluate(
      (key) => localStorage.removeItem(key),
      TEST_STORAGE_KEY,
    );
    await expect
      .poll(() =>
        page.evaluate((key) => localStorage.getItem(key), TEST_STORAGE_KEY),
      )
      .toBeNull();
    await page.getByRole("button", { name: "Close EPUB" }).click();
    await expect(page.getByRole("status")).toHaveText("No local EPUB is open.");
    expect(unexpectedRequestCount).toBe(0);
  } finally {
    if (!page.isClosed() && page.url().startsWith(LOCAL_ORIGIN)) {
      await page.evaluate(
        (key) => localStorage.removeItem(key),
        TEST_STORAGE_KEY,
      );
    }
    await context.unroute("**/*");
  }
});
