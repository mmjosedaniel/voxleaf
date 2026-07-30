import console from "node:console";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const hostArgument = "--voxleaf-tts-bilingual-profile-service-host";
const requestedProfile = process.argv
  .find((argument) => argument.startsWith("--profile="))
  ?.slice("--profile=".length);
const profiles = [
  {
    profileId: "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1",
    language: "es",
    required: [
      "VOXLEAF_TTS_PIPER_ENABLED",
      "VOXLEAF_TTS_PIPER_PYTHON",
      "VOXLEAF_TTS_PIPER_MODEL_ROOT",
    ],
  },
  {
    profileId: "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1",
    language: "en",
    required: [
      "VOXLEAF_TTS_PIPER_EN_ENABLED",
      "VOXLEAF_TTS_PIPER_EN_PYTHON",
      "VOXLEAF_TTS_PIPER_EN_MODEL_ROOT",
    ],
  },
  {
    profileId: "chatterbox-multilingual-v3-cuda-bf16-default-v4",
    language: "es",
    required: [
      "VOXLEAF_TTS_CHATTERBOX_ENABLED",
      "VOXLEAF_TTS_CHATTERBOX_PYTHON",
      "VOXLEAF_TTS_CHATTERBOX_MODEL_ROOT",
    ],
  },
  {
    profileId: "chatterbox-multilingual-v3-cuda-bf16-default-v4",
    language: "en",
    required: [
      "VOXLEAF_TTS_CHATTERBOX_ENABLED",
      "VOXLEAF_TTS_CHATTERBOX_PYTHON",
      "VOXLEAF_TTS_CHATTERBOX_MODEL_ROOT",
    ],
  },
  {
    profileId: "qwen3-tts-1-7b-customvoice-cuda-bf16-serena-es-v8",
    language: "es",
    required: [
      "VOXLEAF_TTS_DEV_ENABLED",
      "VOXLEAF_TTS_DEV_PYTHON",
      "VOXLEAF_TTS_DEV_MODEL_ROOT",
    ],
  },
  {
    profileId: "qwen3-tts-1-7b-customvoice-cuda-bf16-aiden-en-v8",
    language: "en",
    required: [
      "VOXLEAF_TTS_DEV_ENABLED",
      "VOXLEAF_TTS_DEV_PYTHON",
      "VOXLEAF_TTS_DEV_MODEL_ROOT",
    ],
  },
];
const selected =
  requestedProfile === undefined
    ? profiles
    : profiles.filter(({ profileId }) => profileId === requestedProfile);

if (
  process.platform !== "win32" ||
  selected.length === 0 ||
  selected.some(
    ({ required }) =>
      process.env[required[0]] !== "1" ||
      required.some((name) => !process.env[name]),
  )
) {
  console.error("Exact bilingual-profile configuration is unavailable.");
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

for (const { profileId, language } of selected) {
  const result = spawnSync(executable, [hostArgument, profileId, language], {
    env: process.env,
    stdio: "ignore",
    windowsHide: true,
    timeout: 10 * 60 * 1_000,
  });
  if (result.status !== 0 || result.error) {
    console.error("Exact bilingual-profile service matrix failed.");
    process.exit(1);
  }
}

console.log("Exact bilingual-profile service matrix passed.");
