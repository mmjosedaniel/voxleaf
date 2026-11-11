import {
  buildMinimalEpubFixture,
  minimalPackageDocument,
  syntheticStaticPngBytes,
} from "../../../../packages/epub/test-support/epub-fixture.ts";
import { openEpubPublication } from "@voxleaf/epub";

export async function readerImageLifecycleCheckpoint(bytes) {
  const opened = await openEpubPublication(bytes);
  if (!opened.ok) throw new Error("rpi-fixture-open-failed");
  try {
    const located = opened.publication.locators.find(
      (candidate) =>
        candidate.block.kind === "paragraph" &&
        candidate.block.children.some(
          (child) =>
            child.kind === "text" && child.text.startsWith("RPI passage 8."),
        ),
    );
    if (located === undefined) throw new Error("rpi-fixture-locator-missing");
    return { ...located.startLocator, textOffsetCodePoints: 100 };
  } finally {
    await opened.publication.close();
  }
}

// Repository-authored text and the existing synthetic PNG. Repeated resource
// occurrences must have independent source ownership, just like distinct images.
export function buildReaderImageLifecycleFixture(
  imageBytes = syntheticStaticPngBytes(),
) {
  const passages = Array.from({ length: 12 }, (_, index) => {
    const number = index + 1;
    const prose = Array.from(
      { length: 7 },
      () =>
        `<p>RPI passage ${number}. ${"This synthetic passage separates local illustrations and preserves an interior reading checkpoint. ".repeat(12)}</p>`,
    ).join("");
    return `<h2>RPI section ${number}</h2><p><img src="../images/cover.png" alt="RPI image ${number}"/></p>${prose}`;
  }).join("");
  return buildMinimalEpubFixture({
    packageDocument: minimalPackageDocument().replace(
      "</manifest>",
      '<item id="cover" href="images/cover.png" media-type="image/png"/></manifest>',
    ),
    additionalEntries: [{ name: "EPUB/images/cover.png", content: imageBytes }],
    chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Image lifecycle</title></head><body><h1 id="chapter-one">RPI image lifecycle</h1>${passages}</body></html>`,
  });
}
