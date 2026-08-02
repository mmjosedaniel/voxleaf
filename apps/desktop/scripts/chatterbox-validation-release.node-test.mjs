import assert from "node:assert/strict";
import test from "node:test";

import { validateChatterboxValidationRelease } from "./chatterbox-validation-release.mjs";
import { repositoryRoot } from "./windows-release.mjs";

test("validation installer is isolated while normal Chatterbox stays withheld", async () => {
  await assert.doesNotReject(() =>
    validateChatterboxValidationRelease(repositoryRoot(), false),
  );
});
