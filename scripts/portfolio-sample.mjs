import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildMinimalEpubFixture } from "../packages/epub/test-support/epub-fixture.ts";

const source = new URL("../docs/portfolio/sample/", import.meta.url);

export async function buildPortfolioSample() {
  const [packageDocument, navigationDocument, chapterDocument] =
    await Promise.all(
      ["package.opf", "nav.xhtml", "chapter.xhtml"].map((name) =>
        readFile(new URL(name, source), "utf8"),
      ),
    );
  return buildMinimalEpubFixture({
    packageDocument,
    navigationDocument,
    chapterDocument,
  });
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const destination = new URL(
    "../tmp/portfolio/voxleaf-sample.epub",
    import.meta.url,
  );
  const bytes = await buildPortfolioSample();
  await mkdir(dirname(fileURLToPath(destination)), { recursive: true });
  await writeFile(destination, bytes);
  console.log(
    "Created tmp/portfolio/voxleaf-sample.epub (original demo text).",
  );
}
