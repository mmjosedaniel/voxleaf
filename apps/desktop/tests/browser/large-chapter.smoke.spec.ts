import { expect, test } from "@playwright/test";

const LOCAL_ORIGIN = "http://127.0.0.1:4173";

async function buildOversizedChapterFixture(): Promise<Uint8Array> {
  const fixtureModuleUrl = new URL(
    "../../../../packages/epub/test-support/epub-fixture.ts",
    import.meta.url,
  );
  const fixtureModule = (await import(fixtureModuleUrl.href)) as {
    buildReaderLongChapterEpubFixture(options: {
      readonly semanticBlockCount: number;
    }): Promise<Uint8Array>;
    READER_SEMANTIC_BLOCK_OVER_LIMIT: number;
  };
  return fixtureModule.buildReaderLongChapterEpubFixture({
    semanticBlockCount: fixtureModule.READER_SEMANTIC_BLOCK_OVER_LIMIT,
  });
}

test("rejects an oversized production chapter before partial rendering", async ({
  context,
  page,
}) => {
  test.setTimeout(30_000);
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

  try {
    await page.goto("/");
    const fileInput = page.getByLabel("Open a local EPUB");
    const bytes = await buildOversizedChapterFixture();
    await fileInput.setInputFiles({
      name: "private-oversized-browser.epub",
      mimeType: "application/epub+zip",
      buffer: Buffer.from(bytes),
    });

    await expect(page.getByRole("status").first()).toHaveText(
      "The EPUB opened successfully.",
    );
    const fallback = page.getByRole("article", {
      name: "Current reading section",
    });
    await expect(fallback).toBeVisible();
    await expect(
      fallback.getByRole("heading", {
        level: 2,
        name: "Reading section unavailable",
      }),
    ).toBeVisible();
    await expect(fallback).toContainText(
      "This reading section is too large to display safely.",
    );
    await expect(
      page.getByText("Synthetic production reader block."),
    ).toHaveCount(0);
    await expect(page.locator(".reader-rendering-status")).toHaveCount(0);
    await expect(page).toHaveURL(`${LOCAL_ORIGIN}/`);
    await expect(page.getByText("private-oversized-browser.epub")).toHaveCount(
      0,
    );

    await page.getByRole("button", { name: "Close EPUB" }).click();
    await expect(page.getByRole("status")).toHaveText("No local EPUB is open.");
    expect(unexpectedRequestCount).toBe(0);
  } finally {
    await context.unroute("**/*");
  }
});
