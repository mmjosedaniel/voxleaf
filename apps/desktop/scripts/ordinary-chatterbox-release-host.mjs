import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import {
  access,
  lstat,
  mkdtemp,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import { WebDriverClient } from "./native-webdriver-client.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../../..");
const PROFILE_ID = "chatterbox-multilingual-v3-cuda-bf16-default-v4";
const APPLICATION_ID = "com.voxleaf.desktop";
const APPLICATION_NAME = "VoxLeaf";
const DEFAULT_INSTALLER = path.join(
  repositoryRoot,
  "apps/desktop/src-tauri/target/release/bundle/nsis/VoxLeaf_0.1.0_x64-setup.exe",
);
const DEFAULT_RECEIPT = path.join(
  repositoryRoot,
  "apps/desktop/src-tauri/release/ordinary-chatterbox-journey-evidence-v1.json",
);
const STARTUP_TIMEOUT_MS = 90_000;
const ACQUISITION_TIMEOUT_MS = 8 * 60 * 60 * 1_000;
const POLL_INTERVAL_MS = 250;
const DEVELOPMENT_ENVIRONMENT_KEYS = Object.freeze([
  "VOXLEAF_TTS_DEV_ENABLED",
  "VOXLEAF_TTS_DEV_PYTHON",
  "VOXLEAF_TTS_DEV_MODEL_ROOT",
  "VOXLEAF_TTS_PIPER_ENABLED",
  "VOXLEAF_TTS_PIPER_PYTHON",
  "VOXLEAF_TTS_PIPER_MODEL_ROOT",
  "VOXLEAF_TTS_PIPER_EN_ENABLED",
  "VOXLEAF_TTS_PIPER_EN_PYTHON",
  "VOXLEAF_TTS_PIPER_EN_MODEL_ROOT",
  "VOXLEAF_TTS_CHATTERBOX_ENABLED",
  "VOXLEAF_TTS_CHATTERBOX_PYTHON",
  "VOXLEAF_TTS_CHATTERBOX_MODEL_ROOT",
  "VOXLEAF_CHATTERBOX_VALIDATION_PACKAGE_ROOT",
  "PYTHONHOME",
  "PYTHONUSERBASE",
  "VIRTUAL_ENV",
  "CONDA_PREFIX",
  "CONDA_DEFAULT_ENV",
]);
const REQUIRED_RESOURCES = Object.freeze([
  "resources/tts/voxleaf-piper-core-v1/runtime-manifest-v1.json",
  "resources/release/optional/chatterbox/optional-package-manifest-v2.json",
  "resources/release/optional/chatterbox/runtime-package-evidence-v3.json",
  "resources/release/optional/chatterbox/source-manifest-v2.json",
  "resources/release/optional/chatterbox/THIRD-PARTY-NOTICES.md",
]);
const FORBIDDEN_ARTIFACT_PATHS = Object.freeze([
  "resources/release/optional/chatterbox/optional-package-validation-overlay-v1.json",
  "resources/release/optional/chatterbox-validation",
]);

function fail(code) {
  throw new Error(`ordinary-chatterbox-release-host:${code}`);
}

function isAbsoluteWindowsPath(value) {
  return typeof value === "string" && path.isAbsolute(value);
}

function option(arguments_, name) {
  const index = arguments_.indexOf(name);
  return index === -1 ? undefined : arguments_[index + 1];
}

export function parseArguments(arguments_, environment = process.env) {
  const mode = option(arguments_, "--mode") ?? "preflight";
  const userProfile = environment.USERPROFILE;
  const installedRoot =
    option(arguments_, "--installed-root") ??
    (environment.LOCALAPPDATA === undefined
      ? undefined
      : path.join(environment.LOCALAPPDATA, APPLICATION_NAME));
  const installer = option(arguments_, "--installer") ?? DEFAULT_INSTALLER;
  const receipt = option(arguments_, "--receipt") ?? DEFAULT_RECEIPT;
  const tauriDriver =
    option(arguments_, "--tauri-driver") ??
    environment.VOXLEAF_TAURI_DRIVER_PATH ??
    (userProfile === undefined
      ? undefined
      : path.join(userProfile, ".cargo", "bin", "tauri-driver.exe"));
  const edgeDriver =
    option(arguments_, "--edge-driver") ??
    environment.VOXLEAF_EDGE_DRIVER_PATH ??
    (userProfile === undefined
      ? undefined
      : path.join(userProfile, ".cargo", "bin", "msedgedriver.exe"));
  if (!new Set(["preflight", "journey"]).has(mode)) fail("mode");
  if (!isAbsoluteWindowsPath(installedRoot)) fail("installed-root");
  if (mode === "journey" && !isAbsoluteWindowsPath(installer))
    fail("installer");
  if (mode === "journey" && !isAbsoluteWindowsPath(receipt)) fail("receipt");
  for (const [name, value] of [
    ["tauri-driver", tauriDriver],
    ["edge-driver", edgeDriver],
  ]) {
    if (value !== undefined && !isAbsoluteWindowsPath(value)) fail(name);
  }
  return Object.freeze({
    mode,
    installedRoot: path.resolve(installedRoot),
    installer: installer === undefined ? undefined : path.resolve(installer),
    receipt: path.resolve(receipt),
    tauriDriver:
      tauriDriver === undefined ? undefined : path.resolve(tauriDriver),
    edgeDriver: edgeDriver === undefined ? undefined : path.resolve(edgeDriver),
  });
}

async function sha256(file) {
  return createHash("sha256")
    .update(await readFile(file))
    .digest("hex");
}

export function releaseEnvironment(
  environment,
  { tauriDriver, edgeDriver } = {},
) {
  const sanitized = { ...environment };
  for (const key of DEVELOPMENT_ENVIRONMENT_KEYS) delete sanitized[key];
  // Keep only OS-owned tooling needed by the measurement harness. A decoy is
  // first and no Python, Rust, Cargo, Node, uv, pip, or repository path is kept.
  const systemRoot = environment.SystemRoot ?? "C:\\Windows";
  sanitized.PATH = [
    path.join(tmpdir(), "voxleaf-ordinary-release-no-path"),
    path.join(systemRoot, "System32"),
    path.join(systemRoot, "System32", "WindowsPowerShell", "v1.0"),
  ].join(path.delimiter);
  if (tauriDriver !== undefined)
    sanitized.VOXLEAF_TAURI_DRIVER_PATH = tauriDriver;
  if (edgeDriver !== undefined) sanitized.VOXLEAF_EDGE_DRIVER_PATH = edgeDriver;
  return Object.freeze(sanitized);
}

export function hostileReleaseEnvironment(environment, options = {}) {
  const hostile = { ...releaseEnvironment(environment, options) };
  const decoyRoot = path.join(tmpdir(), "voxleaf-ordinary-release-hostile");
  for (const key of DEVELOPMENT_ENVIRONMENT_KEYS) {
    hostile[key] = key.endsWith("_ENABLED") ? "1" : decoyRoot;
  }
  return Object.freeze(hostile);
}

export function assertNoDevelopmentEnvironment(environment) {
  for (const key of DEVELOPMENT_ENVIRONMENT_KEYS) {
    if (environment[key] !== undefined) fail("development-environment");
  }
  if (!environment.PATH?.includes("voxleaf-ordinary-release-no-path")) {
    fail("hostile-path");
  }
}

export function assertHostileDevelopmentEnvironment(environment) {
  for (const key of DEVELOPMENT_ENVIRONMENT_KEYS) {
    if (environment[key] === undefined) fail("hostile-development-environment");
  }
  if (!environment.PATH?.includes("voxleaf-ordinary-release-no-path")) {
    fail("hostile-path");
  }
}

function isMissing(error) {
  return error && typeof error === "object" && error.code === "ENOENT";
}

async function existingFile(file, code) {
  try {
    const metadata = await lstat(file);
    if (!metadata.isFile() || metadata.isSymbolicLink()) fail(code);
  } catch (error) {
    if (error?.message?.includes(`ordinary-chatterbox-release-host:${code}`))
      throw error;
    fail(code);
  }
}

async function existingDirectory(directory, code) {
  try {
    const metadata = await lstat(directory);
    if (!metadata.isDirectory() || metadata.isSymbolicLink()) fail(code);
  } catch (error) {
    if (error?.message?.includes(`ordinary-chatterbox-release-host:${code}`))
      throw error;
    fail(code);
  }
}

export async function validateOrdinaryArtifact(installedRoot) {
  await existingDirectory(installedRoot, "installed-root-missing");
  await existingFile(
    path.join(installedRoot, "voxleaf-desktop.exe"),
    "binary-missing",
  );
  const manifestPath = path.join(
    installedRoot,
    "resources/release/optional/chatterbox/optional-package-manifest-v2.json",
  );
  for (const resource of REQUIRED_RESOURCES) {
    await existingFile(path.join(installedRoot, resource), "resource-missing");
  }
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (
    manifest?.availability !== "downloadable" ||
    manifest?.withholdingReason !== undefined ||
    manifest?.measurements?.downloadBytes !== 8_231_893_387 ||
    manifest?.measurements?.installedBytes !== 8_228_503_309 ||
    manifest?.measurements?.temporaryBytes !== 13_254_834_850 ||
    manifest?.measurements?.minimumFreeBytes !== 20_000_000_000
  ) {
    fail("ordinary-manifest-authority");
  }
  for (const relativePath of FORBIDDEN_ARTIFACT_PATHS) {
    try {
      await access(path.join(installedRoot, relativePath));
      fail("validation-artifact-present");
    } catch (error) {
      if (error?.message?.includes("validation-artifact-present")) throw error;
      if (!isMissing(error)) fail("validation-artifact-check");
    }
  }
  return Object.freeze({
    executable: path.join(installedRoot, "voxleaf-desktop.exe"),
    manifest,
  });
}

export function journeySteps() {
  return Object.freeze([
    "preflight",
    "install",
    "gate",
    "consent",
    "cancel-download",
    "verify-staging-cleanup",
    "retry-download",
    "activate",
    "offline-chatterbox-es",
    "offline-chatterbox-en",
    "restart",
    "remove",
    "offline-piper-after-removal-es",
    "offline-piper-after-removal-en",
    "reinstall-optional-package",
    "verify-reinstalled-package",
    "uninstall",
  ]);
}

export async function createJourneyReceipt({ installer, executable }) {
  const installerMetadata = await stat(installer);
  const executableMetadata = await stat(executable);
  return Object.freeze({
    schemaVersion: 1,
    application: Object.freeze({
      identifier: APPLICATION_ID,
      platform: "windows-x86_64",
      version: "0.1.0",
    }),
    artifact: Object.freeze({
      installer: Object.freeze({
        fileName: path.basename(installer),
        sizeBytes: installerMetadata.size,
        sha256: await sha256(installer),
      }),
      applicationBinary: Object.freeze({
        fileName: path.basename(executable),
        sizeBytes: executableMetadata.size,
        sha256: await sha256(executable),
      }),
    }),
    result: "passed",
    steps: journeySteps(),
    outcomes: Object.freeze({
      releaseLockedRuntime: true,
      cleanDevelopmentEnvironmentPassed: true,
      hostileDevelopmentEnvironmentPassed: true,
      nativeCompatibilityGatePassed: true,
      downloadCancellationCleanupPassed: true,
      bilingualOfflineNarrationPassed: true,
      restartDiscoveryPassed: true,
      removalPassed: true,
      piperAfterRemovalPassed: true,
      optionalPackageReinstallPassed: true,
      privateBookTextLogged: false,
    }),
  });
}

export function evaluateHostGate(report) {
  const knownAtLeast = (quantity, minimum) =>
    quantity?.status === "known" && quantity.value >= minimum;
  const cuda = report?.providers?.cuda;
  return (
    report?.schemaVersion === 1 &&
    report?.platform?.operatingSystem === "windows" &&
    report?.platform?.architecture === "x86_64" &&
    knownAtLeast(report?.processor?.logicalProcessorCount, 8) &&
    knownAtLeast(report?.memory?.totalPhysicalMiB, 24_576) &&
    knownAtLeast(report?.memory?.availablePhysicalMiB, 4_096) &&
    cuda?.availability === "available" &&
    cuda?.deviceClass === "discrete-gpu" &&
    cuda?.precisions?.bfloat16 === "available" &&
    knownAtLeast(cuda?.dedicatedMemoryMiB, 5_632) &&
    knownAtLeast(cuda?.availableDedicatedMemoryMiB, 4_668)
  );
}

function appDataRoot() {
  if (!process.env.LOCALAPPDATA) fail("local-app-data");
  return path.join(process.env.LOCALAPPDATA, APPLICATION_ID);
}

function installRoot() {
  if (!process.env.LOCALAPPDATA) fail("local-app-data");
  return path.join(process.env.LOCALAPPDATA, APPLICATION_NAME);
}

function assertExactRootWithin(parent, candidate, expectedName, code) {
  const resolvedParent = path.resolve(parent);
  const resolvedCandidate = path.resolve(candidate);
  if (
    path.dirname(resolvedCandidate).toLowerCase() !==
      resolvedParent.toLowerCase() ||
    path.basename(resolvedCandidate).toLowerCase() !==
      expectedName.toLowerCase()
  ) {
    fail(code);
  }
}

async function waitFor(condition, timeoutMs, code) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await condition()) return;
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  fail(code);
}

async function reserveLoopbackPort() {
  const { createServer } = await import("node:net");
  const server = createServer();
  server.unref();
  server.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (typeof address !== "object" || address === null) fail("driver-port");
  server.close();
  await new Promise((resolve) => server.once("close", resolve));
  return address.port;
}

async function createOrdinarySession({ executable, environment }) {
  const tauriDriver = environment.VOXLEAF_TAURI_DRIVER_PATH;
  const edgeDriver = environment.VOXLEAF_EDGE_DRIVER_PATH;
  if (
    !isAbsoluteWindowsPath(tauriDriver) ||
    !isAbsoluteWindowsPath(edgeDriver)
  ) {
    fail("webdriver-path");
  }
  const [driverPort, nativePort] = await Promise.all([
    reserveLoopbackPort(),
    reserveLoopbackPort(),
  ]);
  const profileDirectory = await mkdtemp(
    path.join(tmpdir(), "voxleaf-ordinary-webdriver-"),
  );
  const driverProcess = spawn(
    tauriDriver,
    [
      "--port",
      String(driverPort),
      "--native-port",
      String(nativePort),
      "--native-driver",
      edgeDriver,
    ],
    {
      cwd: repositoryRoot,
      env: environment,
      stdio: "ignore",
      windowsHide: true,
    },
  );
  const client = new WebDriverClient(`http://127.0.0.1:${driverPort}`, {
    requestTimeoutMs: STARTUP_TIMEOUT_MS,
  });
  try {
    await waitFor(
      () => client.isReady(),
      STARTUP_TIMEOUT_MS,
      "webdriver-startup",
    );
    await client.createSession(executable, profileDirectory);
    await waitFor(
      async () =>
        (await client.execute(
          'return document.querySelector("#root")?.childElementCount > 0;',
        )) === true,
      STARTUP_TIMEOUT_MS,
      "application-startup",
    );
  } catch (error) {
    await client.deleteSession().catch(() => undefined);
    driverProcess.kill();
    await rm(profileDirectory, { recursive: true, force: true });
    throw error;
  }
  return Object.freeze({
    client,
    async close() {
      await client.deleteSession().catch(() => undefined);
      driverProcess.kill();
      await rm(profileDirectory, { recursive: true, force: true });
    },
  });
}

async function invoke(client, command, payload = undefined) {
  return await client.execute(
    `return globalThis.__TAURI_INTERNALS__?.invoke(${JSON.stringify(command)}, ${JSON.stringify(payload)});`,
  );
}

async function hostGate(client) {
  const report = await invoke(client, "detect_host_profile_compatibility");
  if (!evaluateHostGate(report)) fail("host-gate");
  return report;
}

async function releaseBoundary(client) {
  const enabled = await invoke(client, "release_locked_runtime_enabled");
  if (enabled !== true) fail("release-runtime-not-locked");
  const qwenAvailable = await invoke(
    client,
    "tts_profile_configuration_available",
    { profileId: "qwen3-tts-1-7b-customvoice-cuda-bf16-serena-es-v8" },
  );
  if (qwenAvailable !== false) fail("development-profile-available");
}

async function runCommand(executable, arguments_, environment, code) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [executable, ...arguments_], {
      cwd: repositoryRoot,
      env: environment,
      stdio: "inherit",
      windowsHide: true,
    });
    child.once("error", reject);
    child.once("exit", (exitCode) => {
      if (exitCode === 0) resolve();
      else reject(new Error(`ordinary-chatterbox-release-host:${code}`));
    });
  });
}

async function runBilingualSmoke(executable, profileId, language, environment) {
  await runCommand(
    path.join(scriptDirectory, "native-startup-smoke.mjs"),
    [
      "--adaptive-tts-exact-host",
      `--tts-profile=${profileId}`,
      `--tts-language=${language}`,
      "--executable",
      executable,
    ],
    environment,
    "offline-narration",
  );
}

async function runInstaller(installer, environment) {
  await new Promise((resolve, reject) => {
    const child = spawn(installer, ["/S"], {
      cwd: repositoryRoot,
      env: environment,
      stdio: "ignore",
      windowsHide: true,
    });
    child.once("error", reject);
    child.once("exit", (exitCode) => {
      if (exitCode === 0) resolve();
      else reject(new Error("ordinary-chatterbox-release-host:installer"));
    });
  });
}

async function runUninstaller(installedRoot, environment) {
  const uninstaller = path.join(installedRoot, "uninstall.exe");
  await existingFile(uninstaller, "uninstaller-missing");
  await new Promise((resolve, reject) => {
    const child = spawn(uninstaller, ["/S"], {
      cwd: repositoryRoot,
      env: environment,
      stdio: "ignore",
      windowsHide: true,
    });
    child.once("error", reject);
    child.once("exit", (exitCode) => {
      if (exitCode === 0) resolve();
      else reject(new Error("ordinary-chatterbox-release-host:uninstaller"));
    });
  });
}

async function backupApplicationData() {
  const root = appDataRoot();
  assertExactRootWithin(
    process.env.LOCALAPPDATA,
    root,
    APPLICATION_ID,
    "application-data-root",
  );
  try {
    const metadata = await lstat(root);
    if (!metadata.isDirectory() || metadata.isSymbolicLink())
      fail("existing-data-root");
  } catch (error) {
    if (error?.message?.includes("existing-data-root")) throw error;
    if (!isMissing(error)) fail("existing-data-root-check");
    return Object.freeze({ root, backup: undefined });
  }
  const backup = `${root}.ordinary-chatterbox-harness-backup-${process.pid}`;
  try {
    await lstat(backup);
    fail("backup-occupied");
  } catch (error) {
    if (error?.message?.includes("backup-occupied")) throw error;
    if (!isMissing(error)) fail("backup-check");
  }
  await rename(root, backup);
  return Object.freeze({ root, backup });
}

async function restoreApplicationData({ root, backup }) {
  assertExactRootWithin(
    process.env.LOCALAPPDATA,
    root,
    APPLICATION_ID,
    "application-data-root",
  );
  try {
    const current = await lstat(root);
    if (!current.isDirectory() || current.isSymbolicLink()) {
      fail("unsafe-application-data-restore-root");
    }
  } catch (error) {
    if (
      error?.message?.includes("unsafe-application-data-restore-root") ||
      !isMissing(error)
    ) {
      throw error;
    }
  }
  await rm(root, { recursive: true, force: true });
  if (backup !== undefined) await rename(backup, root);
}

export async function runPreflight(options, environment = process.env) {
  const artifact = await validateOrdinaryArtifact(options.installedRoot);
  const releaseEnv = releaseEnvironment(environment, options);
  const hostileEnv = hostileReleaseEnvironment(environment, options);
  assertNoDevelopmentEnvironment(releaseEnv);
  assertHostileDevelopmentEnvironment(hostileEnv);
  return Object.freeze({
    artifact,
    environment: releaseEnv,
    hostileEnvironment: hostileEnv,
  });
}

export async function runJourney(options, environment = process.env) {
  await existingFile(options.installer, "installer-missing");
  const expectedInstallRoot = installRoot();
  if (
    path.resolve(options.installedRoot).toLowerCase() !==
    expectedInstallRoot.toLowerCase()
  ) {
    fail("unexpected-install-root");
  }
  const releaseEnv = releaseEnvironment(environment, options);
  const hostileEnv = hostileReleaseEnvironment(environment, options);
  assertNoDevelopmentEnvironment(releaseEnv);
  assertHostileDevelopmentEnvironment(hostileEnv);
  try {
    await access(options.installedRoot);
    fail("preexisting-install-root");
  } catch (error) {
    if (error?.message?.includes("preexisting-install-root")) throw error;
    if (!isMissing(error)) fail("install-root-check");
  }
  const dataBackup = await backupApplicationData();
  let session;
  let applicationInstalled = false;
  let journeyReceipt;
  try {
    await runInstaller(options.installer, releaseEnv);
    applicationInstalled = true;
    const { artifact } = await runPreflight(options, environment);
    session = await createOrdinarySession({
      executable: artifact.executable,
      environment: releaseEnv,
    });
    await releaseBoundary(session.client);
    await hostGate(session.client);
    await session.close();
    session = undefined;
    session = await createOrdinarySession({
      executable: artifact.executable,
      environment: hostileEnv,
    });
    await releaseBoundary(session.client);
    await hostGate(session.client);
    const initial = await invoke(
      session.client,
      "optional_chatterbox_snapshot",
    );
    if (initial?.state !== "absent") fail("initial-optional-state");
    const confirming = await invoke(
      session.client,
      "select_optional_chatterbox",
      { profileId: PROFILE_ID },
    );
    if (confirming?.state !== "confirming") fail("consent-state");
    await session.client.execute(
      `globalThis.__TAURI_INTERNALS__.invoke("download_optional_chatterbox", { profileId: ${JSON.stringify(PROFILE_ID)} }).catch(() => undefined); return true;`,
    );
    await waitFor(
      async () =>
        (await invoke(session.client, "optional_chatterbox_snapshot"))
          ?.state === "downloading",
      STARTUP_TIMEOUT_MS,
      "cancel-not-started",
    );
    await invoke(session.client, "cancel_optional_chatterbox", {
      profileId: PROFILE_ID,
    });
    await waitFor(
      async () =>
        (await invoke(session.client, "optional_chatterbox_snapshot"))
          ?.state !== "downloading",
      STARTUP_TIMEOUT_MS,
      "cancel-not-finished",
    );
    await access(path.join(dataBackup.root, "tts", "staging", PROFILE_ID))
      .then(() => fail("staging-retained"))
      .catch((error) => {
        if (error?.message?.includes("staging-retained")) throw error;
      });
    const retryConfirmation = await invoke(
      session.client,
      "select_optional_chatterbox",
      { profileId: PROFILE_ID },
    );
    if (retryConfirmation?.state !== "confirming") fail("retry-consent-state");
    await session.client.execute(
      `globalThis.__TAURI_INTERNALS__.invoke("download_optional_chatterbox", { profileId: ${JSON.stringify(PROFILE_ID)} }).catch(() => undefined); return true;`,
    );
    await waitFor(
      async () =>
        (await invoke(session.client, "optional_chatterbox_snapshot"))
          ?.state === "installed",
      ACQUISITION_TIMEOUT_MS,
      "acquisition",
    );
    await session.close();
    session = undefined;
    await runBilingualSmoke(artifact.executable, PROFILE_ID, "es", hostileEnv);
    await runBilingualSmoke(artifact.executable, PROFILE_ID, "en", hostileEnv);
    session = await createOrdinarySession({
      executable: artifact.executable,
      environment: hostileEnv,
    });
    await releaseBoundary(session.client);
    const restarted = await invoke(
      session.client,
      "optional_chatterbox_snapshot",
    );
    if (restarted?.state !== "installed") fail("restart-discovery");
    await invoke(session.client, "remove_optional_chatterbox", {
      profileId: PROFILE_ID,
    });
    await waitFor(
      async () =>
        (await invoke(session.client, "optional_chatterbox_snapshot"))
          ?.state === "absent",
      STARTUP_TIMEOUT_MS,
      "removal",
    );
    await session.close();
    session = undefined;
    await runBilingualSmoke(
      artifact.executable,
      "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1",
      "es",
      hostileEnv,
    );
    await runBilingualSmoke(
      artifact.executable,
      "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1",
      "en",
      hostileEnv,
    );
    session = await createOrdinarySession({
      executable: artifact.executable,
      environment: hostileEnv,
    });
    await releaseBoundary(session.client);
    const reinstallConfirmation = await invoke(
      session.client,
      "select_optional_chatterbox",
      { profileId: PROFILE_ID },
    );
    if (reinstallConfirmation?.state !== "confirming")
      fail("reinstall-consent-state");
    await session.client.execute(
      `globalThis.__TAURI_INTERNALS__.invoke("download_optional_chatterbox", { profileId: ${JSON.stringify(PROFILE_ID)} }).catch(() => undefined); return true;`,
    );
    await waitFor(
      async () =>
        (await invoke(session.client, "optional_chatterbox_snapshot"))
          ?.state === "installed",
      ACQUISITION_TIMEOUT_MS,
      "reinstall-acquisition",
    );
    journeyReceipt = await createJourneyReceipt({
      installer: options.installer,
      executable: artifact.executable,
    });
    await session.close();
    session = undefined;
    await runUninstaller(options.installedRoot, releaseEnv);
    applicationInstalled = false;
  } finally {
    try {
      await session?.close();
    } finally {
      try {
        if (applicationInstalled) {
          await runUninstaller(options.installedRoot, releaseEnv);
        }
      } finally {
        await restoreApplicationData(dataBackup);
      }
    }
  }
  if (journeyReceipt === undefined) fail("journey-receipt");
  await writeFile(
    options.receipt,
    `${JSON.stringify(journeyReceipt, null, 2)}\n`,
    "utf8",
  );
  return journeyReceipt;
}

async function main(arguments_) {
  const options = parseArguments(arguments_);
  if (options.mode === "preflight") {
    const { artifact, environment, hostileEnvironment } =
      await runPreflight(options);
    let session = await createOrdinarySession({
      executable: artifact.executable,
      environment,
    });
    try {
      await releaseBoundary(session.client);
      await hostGate(session.client);
    } finally {
      await session.close();
    }
    session = await createOrdinarySession({
      executable: artifact.executable,
      environment: hostileEnvironment,
    });
    try {
      await releaseBoundary(session.client);
      await hostGate(session.client);
    } finally {
      await session.close();
    }
    process.stdout.write("ordinary-chatterbox-release-host:preflight-passed\n");
    return;
  }
  await runJourney(options);
  process.stdout.write("ordinary-chatterbox-release-host:journey-passed\n");
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : "ordinary-chatterbox-release-host:failed"}\n`,
    );
    process.exitCode = 1;
  });
}
