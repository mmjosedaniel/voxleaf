import {
  buildMinimalEpubFixture,
  minimalPackageDocument,
} from "../../../../packages/epub/test-support/epub-fixture.ts";
import { jpegExifSegment, syntheticJpegBytes } from "./jpeg-fixture.ts";

export function buildOrientedRasterEpubFixture() {
  return buildMinimalEpubFixture({
    packageDocument: minimalPackageDocument().replace(
      "</manifest>",
      '<item id="rotated-six" href="images/six.jpg" media-type="image/jpeg"/><item id="rotated-eight" href="images/eight.jpg" media-type="image/jpeg"/></manifest>',
    ),
    chapterDocument:
      '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Oriented raster</title></head><body><h1 id="chapter-one">Oriented JPEG fixture</h1><p><a href="#note?1">Literal fragment</a> <a href="#note%3F1">Encoded fragment</a> <a href="?query#note?1">Query blocked</a> <a href="https://example.invalid/#note?1">External blocked</a></p><p><img src="../images/six.jpg" alt="Synthetic orientation six"/></p><p><img src="../images/eight.jpg" alt="Synthetic orientation eight"/></p><h2 id="note?1">Opaque fragment target</h2><p>Repository-authored orientation and fragment controls.</p></body></html>',
    additionalEntries: [
      {
        name: "EPUB/images/six.jpg",
        content: syntheticJpegBytes(jpegExifSegment(6)),
      },
      {
        name: "EPUB/images/eight.jpg",
        content: syntheticJpegBytes(jpegExifSegment(8, false)),
      },
    ],
  });
}
