import assert from "node:assert/strict";
import test from "node:test";

import { openEpubPublication } from "../packages/epub/dist/index.js";
import { buildPortfolioSample } from "./portfolio-sample.mjs";

test("portfolio sample has stable bytes for reading-position restoration", async () => {
  assert.deepEqual(await buildPortfolioSample(), await buildPortfolioSample());
});

test("portfolio sample opens through the public EPUB boundary with two language destinations", async () => {
  const result = await openEpubPublication(await buildPortfolioSample());
  assert.equal(result.ok, true);
  try {
    assert.deepEqual(
      result.publication.navigation.map((item) => item.label),
      ["A Quiet Morning", "Una mañana tranquila"],
    );
    for (const item of result.publication.navigation) {
      assert.equal(item.kind, "link");
      const resolved = await result.publication.resolveTarget(item.target);
      assert.equal(resolved.status, "exact");
    }
  } finally {
    await result.publication.close();
  }
});
