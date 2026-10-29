import assert from "node:assert/strict";
import { access, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { URL } from "node:url";
import test from "node:test";

import {
  BILINGUAL_PORTFOLIO_ARMS,
  modelFreeLifecycleEnvironment,
  nativeRunnerArguments,
  PORTFOLIO_PLAYBACK_RATE_PERCENTS,
  selectPortfolioArms,
  runPortfolioArm,
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
    "--operation-timeout-ms=1800000",
    "--adaptive-tts-exact-host",
    "--exercise-profile-switch",
    "--tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1",
    "--tts-language=en",
    "--exercise-playback-speeds",
  ]);
  assert.deepEqual(nativeRunnerArguments(BILINGUAL_PORTFOLIO_ARMS[2]), [
    "--operation-timeout-ms=1800000",
    "--adaptive-tts-exact-host",
    "--exercise-profile-switch",
    "--tts-profile=chatterbox-multilingual-v3-cuda-bf16-default-v4",
    "--tts-language=es",
  ]);
});

test("SAF-13 portfolio arms carry a finite cooperative runner deadline", () => {
  const arguments_ = nativeRunnerArguments(BILINGUAL_PORTFOLIO_ARMS[0]);
  assert(arguments_.includes("--operation-timeout-ms=1800000"));
});

for (const mode of [
  "normal",
  "deadline",
  "cleanup-failure",
  "missing-confirmation",
]) {
  test(`SAF-13 parent awaits terminal exit and independently asserts ${mode} cleanup`, async () => {
    const owned = await mkdtemp(path.join(tmpdir(), "voxleaf-saf-portfolio-"));
    const runner = path.join(owned, "runner.mjs");
    const marker = path.join(owned, "cleaned");
    const late = path.join(owned, "late-work");
    const nativeModule = new URL("./native-startup-smoke.mjs", import.meta.url)
      .href;
    await writeFile(
      runner,
      `
      import {writeFile} from 'node:fs/promises';
      import process from 'node:process';
      import {setTimeout as wait} from 'node:timers/promises';
      import {runNativeOperation,nativeOperationTimeout} from ${JSON.stringify(nativeModule)};
      const mode=${JSON.stringify(mode)};
      if(mode==='missing-confirmation') await writeFile(${JSON.stringify(marker)},'cleaned');
      else try {
        await runNativeOperation({
          timeoutMs:nativeOperationTimeout(process.argv.slice(2)),
          work:async(signal)=>{if(mode==='deadline'){await wait(10000,undefined,{signal}); await writeFile(${JSON.stringify(late)},'late');}},
          cleanup:async()=>{await wait(30);await writeFile(${JSON.stringify(marker)},'cleaned');if(mode==='cleanup-failure')throw new Error('synthetic-cleanup');}
        });
      }catch{process.exitCode=1;}
    `,
    );
    let asserted = false;
    try {
      const pending = runPortfolioArm({
        runner,
        timeoutMs: 40,
        assertCleanup: async () => {
          asserted = true;
          await access(marker);
        },
      });
      if (mode === "normal") await pending;
      else
        await assert.rejects(
          pending,
          /runner failed or cleanup was not confirmed/u,
        );
      assert.equal(asserted, true);
      await assert.rejects(access(late), { code: "ENOENT" });
    } finally {
      await rm(owned, { recursive: true, force: true });
    }
  });
}

test("freezes the exact production playback-speed matrix", () => {
  assert.deepEqual(PORTFOLIO_PLAYBACK_RATE_PERCENTS, [100, 95, 90, 85, 80, 75]);
  assert.ok(Object.isFrozen(PORTFOLIO_PLAYBACK_RATE_PERCENTS));
  assert.deepEqual(
    BILINGUAL_PORTFOLIO_ARMS.filter(
      ({ exercisePlaybackSpeeds }) => exercisePlaybackSpeeds === true,
    ).map(({ language }) => language),
    ["es", "en"],
  );
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
