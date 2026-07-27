import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const required = [
  "VOXLEAF_TTS_DEV_ENABLED",
  "VOXLEAF_TTS_DEV_PYTHON",
  "VOXLEAF_TTS_DEV_MODEL_ROOT",
];
if (
  process.platform !== "win32" ||
  process.env.VOXLEAF_TTS_DEV_ENABLED !== "1" ||
  required.some((name) => !process.env[name])
) {
  console.error("Exact-host TTS diagnostic configuration is unavailable.");
  process.exit(1);
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const executable = path.resolve(
  scriptDirectory,
  "..",
  "src-tauri",
  "target",
  "release",
  "voxleaf-desktop.exe",
);
const result = spawnSync(executable, ["--voxleaf-tts-exact-service-host"], {
  env: process.env,
  stdio: "ignore",
  windowsHide: true,
  timeout: 10 * 60 * 1000,
});
if (result.status !== 0 || result.error) {
  console.error("Exact-host TTS diagnostic failed.");
  process.exit(1);
}
console.log("Exact-host TTS diagnostic passed.");
