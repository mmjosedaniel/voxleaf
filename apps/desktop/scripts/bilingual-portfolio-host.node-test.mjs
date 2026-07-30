import assert from "node:assert/strict";
import test from "node:test";

import {
  BILINGUAL_PORTFOLIO_ARMS,
  modelFreeLifecycleEnvironment,
  nativeRunnerArguments,
  selectPortfolioArms,
} from "./bilingual-portfolio-host.mjs";

test("freezes the six exact bilingual portfolio arms", () => {
  assert.equal(BILINGUAL_PORTFOLIO_ARMS.length, 6);
  assert.deepEqual(
    BILINGUAL_PORTFOLIO_ARMS.map(({ profileId, language }) => [
      profileId,
      language,
    ]),
    [
      ["piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1", "es"],
      ["piper-1-4-2-onnx-cpu-en-us-joe-medium-v1", "en"],
      ["chatterbox-multilingual-v3-cuda-bf16-default-v4", "es"],
      ["chatterbox-multilingual-v3-cuda-bf16-default-v4", "en"],
      ["qwen3-tts-1-7b-customvoice-cuda-bf16-serena-es-v8", "es"],
      ["qwen3-tts-1-7b-customvoice-cuda-bf16-aiden-en-v8", "en"],
    ],
  );
  assert.ok(Object.isFrozen(BILINGUAL_PORTFOLIO_ARMS));
  assert.ok(
    BILINGUAL_PORTFOLIO_ARMS.every(
      (arm) => Object.isFrozen(arm) && Object.isFrozen(arm.requiredEnvironment),
    ),
  );
});

test("filters one exact profile and language without broadening the matrix", () => {
  const selected = selectPortfolioArms([
    "--profile=chatterbox-multilingual-v3-cuda-bf16-default-v4",
    "--language=en",
  ]);
  assert.equal(selected.length, 1);
  assert.equal(selected[0]?.language, "en");
  assert.throws(
    () => selectPortfolioArms(["--profile=unknown"]),
    /Unknown bilingual portfolio profile or language\./u,
  );
});

test("builds explicit packaged runner arguments", () => {
  assert.deepEqual(nativeRunnerArguments(BILINGUAL_PORTFOLIO_ARMS[1]), [
    "--adaptive-tts-exact-host",
    "--exercise-profile-switch",
    "--tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1",
    "--tts-language=en",
  ]);
});

test("removes every exact model key from the generic lifecycle environment", () => {
  const environment = Object.fromEntries(
    BILINGUAL_PORTFOLIO_ARMS.flatMap(({ requiredEnvironment }) =>
      requiredEnvironment.map((name) => [name, "private-value"]),
    ),
  );
  environment.PATH = "retained";
  const sanitized = modelFreeLifecycleEnvironment(environment);
  assert.deepEqual(sanitized, { PATH: "retained" });
  assert.notEqual(sanitized, environment);
});
