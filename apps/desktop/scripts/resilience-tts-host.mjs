import console from "node:console";
import { spawnSync } from "node:child_process";
import process from "node:process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const profileArgument = process.argv.find((argument) =>
  argument.startsWith("--profile="),
);
const requestedProfile = profileArgument?.slice("--profile=".length);
const profiles = [
  {
    profile: "qwen",
    argument: "--voxleaf-tts-exact-service-host",
    required: [
      "VOXLEAF_TTS_DEV_ENABLED",
      "VOXLEAF_TTS_DEV_PYTHON",
      "VOXLEAF_TTS_DEV_MODEL_ROOT",
    ],
  },
  {
    profile: "piper",
    argument: "--voxleaf-tts-piper-service-host",
    required: [
      "VOXLEAF_TTS_PIPER_ENABLED",
      "VOXLEAF_TTS_PIPER_PYTHON",
      "VOXLEAF_TTS_PIPER_MODEL_ROOT",
    ],
  },
];
const selectedProfiles =
  requestedProfile === undefined
    ? profiles
    : profiles.filter(({ profile }) => profile === requestedProfile);

if (
  process.platform !== "win32" ||
  selectedProfiles.length === 0 ||
  selectedProfiles.some(
    ({ required }) =>
      process.env[required[0]] !== "1" ||
      required.some((name) => !process.env[name]),
  )
) {
  console.error("Exact-host resilience configuration is unavailable.");
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

for (const { argument } of selectedProfiles) {
  const result = spawnSync(executable, [argument], {
    env: process.env,
    stdio: "ignore",
    windowsHide: true,
    timeout: 10 * 60 * 1000,
  });
  if (result.status !== 0 || result.error) {
    console.error("Exact-host resilience matrix failed.");
    process.exit(1);
  }
}

console.log("Exact-host resilience matrix passed.");
