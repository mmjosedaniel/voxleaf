import { spawnSync } from "node:child_process";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

// Sequential ownership of WebView2, audio and GPU; deliberately no Qwen arm.
const arms = [
  ["piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1", "es"],
  ["piper-1-4-2-onnx-cpu-en-us-joe-medium-v1", "en"],
  ["chatterbox-multilingual-v3-cuda-bf16-default-v4", "es"],
  ["chatterbox-multilingual-v3-cuda-bf16-default-v4", "en"],
];
const script = fileURLToPath(
  new URL("./native-startup-smoke.mjs", import.meta.url),
);
let failed = false;
for (const [profile, language] of arms) {
  const result = spawnSync(
    process.execPath,
    [
      script,
      "--adaptive-tts-exact-host",
      "--exercise-reader-corrections",
      "--exercise-playback-speeds",
      `--tts-profile=${profile}`,
      `--tts-language=${language}`,
    ],
    { stdio: "inherit", windowsHide: true, timeout: 30 * 60_000 },
  );
  process.stdout.write(
    `reader-corrections-host:${profile}:${language}:exit=${String(result.status)}\n`,
  );
  if (result.status !== 0 || result.error) failed = true;
}
process.exitCode = failed ? 1 : 0;
