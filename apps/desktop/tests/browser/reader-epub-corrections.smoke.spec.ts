import { expect, test, type CDPSession, type Page } from "@playwright/test";

async function openFixture(page: Page, chapterDocument: string) {
  const { buildMinimalEpubFixture } =
    await import("../../../../packages/epub/test-support/epub-fixture");
  const bytes = await buildMinimalEpubFixture({ chapterDocument });
  await page.goto("/");
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-epub-correction.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(bytes),
  });
}

test("VF-0135 renders block-link contents and activates the inline control", async ({
  page,
}) => {
  await openFixture(
    page,
    `<html xmlns="http://www.w3.org/1999/xhtml"><body>
    <h1 id="chapter-one">Opening</h1>
    <a href="#destination">Lead<h2 id="inside">Inside</h2>Tail</a>
    <h2 id="destination">Destination</h2>
    <p><span><a href="#inside">Go inside</a></span></p>
  </body></html>`,
  );

  const reader = page.locator(".semantic-document");
  await expect(reader.locator("h1, h2, p")).toHaveText([
    "Opening",
    "Lead",
    "Inside",
    "Tail",
    "Destination",
    "Go inside",
  ]);
  await expect(reader.locator(".semantic-internal-link")).toHaveCount(1);
  await reader.getByRole("button", { name: "Go inside" }).click();
  await expect(reader.getByRole("heading", { name: "Inside" })).toBeFocused();
});

test("VF-0145 uses hidden Contents titles and keeps both chapter destinations", async ({
  page,
}) => {
  const {
    buildMinimalEpubFixture,
    minimalChapterDocument,
    minimalNavigationDocument,
    minimalPackageDocument,
  } = await import("../../../../packages/epub/test-support/epub-fixture");
  const bytes = await buildMinimalEpubFixture({
    packageDocument: minimalPackageDocument()
      .replace(
        "</manifest>",
        '<item id="chapter-two" href="text/chapter-two.xhtml" media-type="application/xhtml+xml"/></manifest>',
      )
      .replace("</spine>", '<itemref idref="chapter-two"/></spine>'),
    navigationDocument: minimalNavigationDocument().replace(
      /<li>.*<\/li>/u,
      `<li><a hidden="" title=" " href="text/chapter.xhtml#chapter-one">Return to first</a></li>
      <li><a hidden="" title="Open second" href="text/chapter-two.xhtml#chapter-two">${"x".repeat(1_025)}</a></li>`,
    ),
    additionalEntries: [
      {
        name: "EPUB/text/chapter-two.xhtml",
        content: minimalChapterDocument()
          .replaceAll("Chapter One", "Chapter Two")
          .replace('id="chapter-one"', 'id="chapter-two"'),
      },
    ],
  });
  await page.goto("/");
  await page.getByLabel("Open a book").setInputFiles({
    name: "synthetic-hidden-contents.epub",
    mimeType: "application/epub+zip",
    buffer: Buffer.from(bytes),
  });

  const reader = page.locator(".semantic-document");
  const showContents = page.getByRole("button", {
    name: "Show table of contents",
  });
  const contents = page.getByRole("navigation", { name: "Table of contents" });
  await expect(
    reader.getByRole("heading", { name: "Chapter One", exact: true }),
  ).toBeVisible();
  await showContents.click();
  await contents
    .getByRole("button", { name: "Open second", exact: true })
    .click();
  await expect(
    reader.getByRole("heading", { name: "Chapter Two", exact: true }),
  ).toBeVisible();
  await showContents.click();
  await contents
    .getByRole("button", { name: "Return to first", exact: true })
    .click();
  await expect(
    reader.getByRole("heading", { name: "Chapter One", exact: true }),
  ).toBeVisible();
});

async function markerSide(
  session: CDPSession,
  rootId: number,
  selector: string,
) {
  const { nodeId } = await session.send("DOM.querySelector", {
    nodeId: rootId,
    selector,
  });
  const { node } = await session.send("DOM.describeNode", { nodeId, depth: 1 });
  const marker = node.pseudoElements?.find(
    ({ pseudoType }) => pseudoType === "marker",
  );
  if (marker === undefined) throw new Error("Expected rendered list marker");
  const elementBox = await session.send("DOM.getBoxModel", { nodeId });
  const markerBox = await session.send("DOM.getBoxModel", {
    backendNodeId: marker.backendNodeId,
  });
  const center = (quad: number[]) => (quad[0]! + quad[2]!) / 2;
  return Math.sign(
    center(markerBox.model.content) - center(elementBox.model.content),
  );
}

test("VF-0152 places ordered markers according to their own item direction", async ({
  page,
}) => {
  await openFixture(
    page,
    `<html xmlns="http://www.w3.org/1999/xhtml"><body>
    <h1 id="chapter-one">Opening</h1>
    <ol dir="ltr" start="3">
      <li dir="rtl"><p>אבג</p><ul><li dir="auto">Nested</li></ul></li>
      <li value="7"><p>Ending</p></li>
    </ol>
  </body></html>`,
  );
  const list = page.locator(".semantic-document > ol");
  const items = list.locator(":scope > li");
  await expect(list).toHaveAttribute("start", "3");
  await expect(items.first()).toHaveAttribute("dir", "rtl");
  await expect(items.first().locator("ul > li")).toHaveAttribute("dir", "ltr");
  await expect(items.last()).toHaveAttribute("value", "7");
  await list.evaluate((element) => {
    const reference = document.createElement("ol");
    reference.id = "synthetic-native-list";
    reference.dir = "ltr";
    reference.style.position = "absolute";
    reference.style.width = `${element.getBoundingClientRect().width}px`;
    for (const direction of ["rtl", "ltr"]) {
      const item = document.createElement("li");
      item.dir = direction;
      item.textContent = "Marker reference";
      reference.append(item);
    }
    document.body.append(reference);
  });
  const session = await page.context().newCDPSession(page);
  try {
    const { root } = await session.send("DOM.getDocument");
    const referenceRtl = await markerSide(
      session,
      root.nodeId,
      "#synthetic-native-list > li:first-child",
    );
    const referenceLtr = await markerSide(
      session,
      root.nodeId,
      "#synthetic-native-list > li:last-child",
    );
    expect(referenceRtl).toBe(1);
    expect(referenceLtr).toBe(-1);
    expect(
      await markerSide(
        session,
        root.nodeId,
        ".semantic-document > ol > li:first-child",
      ),
    ).toBe(referenceRtl);
    expect(
      await markerSide(
        session,
        root.nodeId,
        ".semantic-document > ol > li:last-child",
      ),
    ).toBe(referenceLtr);
  } finally {
    await session.detach();
  }
});
