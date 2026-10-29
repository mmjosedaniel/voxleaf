import process from "node:process";
import { fileURLToPath, URL } from "node:url";
import { runPortfolioArm } from "./bilingual-portfolio-host.mjs";

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
for (const [profile, language] of arms) {
  try {
    await runPortfolioArm({
      runner: script,
      arguments_: [
        "--adaptive-tts-exact-host",
        "--exercise-reader-corrections",
        "--exercise-playback-speeds",
        `--tts-profile=${profile}`,
        `--tts-language=${language}`,
      ],
    });
    process.stdout.write(
      `reader-corrections-host:${profile}:${language}:exit=0\n`,
    );
  } catch {
    process.stderr.write(
      `reader-corrections-host:${profile}:${language}:failed-or-cleanup-unconfirmed\n`,
    );
    process.exitCode = 1;
    break;
  }
}
