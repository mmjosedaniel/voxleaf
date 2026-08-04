import { createHash } from "node:crypto";
import { access, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const APP_VERSION = "0.1.0";
export const SIGNATURE_STATUSES = new Set(["unsigned-local", "signed-valid"]);
export const ANTIVIRUS_STATUSES = new Set([
  "not-run",
  "not-available",
  "windows-defender-no-threats",
]);
export const LIFECYCLE_STATUSES = new Set([
  "not-run",
  "local-install-first-start-repair-uninstall-passed",
]);
const ORDINARY_CHATTERBOX_JOURNEY_STEPS = Object.freeze([
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
const ORDINARY_CHATTERBOX_JOURNEY_OUTCOMES = Object.freeze({
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
});

const PIPER_CORE_RESOURCE =
  "../../../services/tts/release/core/dist/voxleaf-piper-core-v1/";

const EXPECTED_RESOURCES = Object.freeze({
  "../../../LICENSE": "resources/notices/VOXLEAF-MIT.txt",
  "../../../docs/user/windows-release.md": "resources/docs/WINDOWS-RELEASE.md",
  "../../../services/tts/release/component-inventory-v1.json":
    "resources/release/component-inventory-v1.json",
  [PIPER_CORE_RESOURCE]: "resources/tts/voxleaf-piper-core-v1/",
  "../../../services/tts/release/optional/chatterbox/THIRD-PARTY-NOTICES.md":
    "resources/release/optional/chatterbox/THIRD-PARTY-NOTICES.md",
  "../../../services/tts/release/optional/chatterbox/optional-package-manifest-v2.json":
    "resources/release/optional/chatterbox/optional-package-manifest-v2.json",
  "../../../services/tts/release/optional/chatterbox/runtime-package-evidence-v3.json":
    "resources/release/optional/chatterbox/runtime-package-evidence-v3.json",
  "../../../services/tts/release/optional/chatterbox/source-manifest-v2.json":
    "resources/release/optional/chatterbox/source-manifest-v2.json",
});

function fail(code) {
  throw new Error(`windows-release:${code}`);
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function sortedEntries(value) {
  return Object.entries(value ?? {}).sort(([left], [right]) =>
    left.localeCompare(right),
  );
}

export function repositoryRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
}

export function releaseResourceSources(requireCore = false) {
  return Object.keys(EXPECTED_RESOURCES).filter(
    (source) => requireCore || source !== PIPER_CORE_RESOURCE,
  );
}

export async function loadReleaseDocuments(root) {
  const srcTauri = path.join(root, "apps/desktop/src-tauri");
  return {
    rootPackage: await readJson(path.join(root, "package.json")),
    desktopPackage: await readJson(
      path.join(root, "apps/desktop/package.json"),
    ),
    cargoToml: await readFile(path.join(srcTauri, "Cargo.toml"), "utf8"),
    baseConfig: await readJson(path.join(srcTauri, "tauri.conf.json")),
    releaseConfig: await readJson(
      path.join(srcTauri, "tauri.release.conf.json"),
    ),
    optionalManifest: await readJson(
      path.join(
        root,
        "services/tts/release/optional/chatterbox/optional-package-manifest-v2.json",
      ),
    ),
    buildScript: await readFile(
      path.join(root, "scripts/build-windows-release.ps1"),
      "utf8",
    ),
    nsisHooks: await readFile(
      path.join(srcTauri, "windows/nsis-hooks.nsh"),
      "utf8",
    ),
    lifecycleScript: await readFile(
      path.join(root, "scripts/test-windows-package-lifecycle.ps1"),
      "utf8",
    ),
  };
}

const UNINSTALL_FLAGS = Object.freeze([
  "/REMOVE_CHATTERBOX_DATA=1",
  "/REMOVE_PREFERENCES_AND_RECOVERY=1",
  "/REMOVE_APP_DATA=1",
]);
const UNINSTALL_FLAG_OPTIONS = Object.freeze(
  UNINSTALL_FLAGS.map((flag) => flag.slice(0, -1)),
);

const OPTIONAL_UNINSTALL_ROOTS = Object.freeze([
  "tts\\cb\\2",
  "tts\\profiles\\chatterbox-multilingual-v3-cuda-bf16-default-v4\\2",
  "tts\\staging\\chatterbox-multilingual-v3-cuda-bf16-default-v4",
  "tts\\cb\\cache",
]);

export function validateUninstallAuthority({
  nsisHooks,
  lifecycleScript,
  identity,
}) {
  const normalizedHooks = nsisHooks.replaceAll("\\\\", "\\");
  for (const value of [
    "NSIS_HOOK_PREUNINSTALL",
    "NSIS_HOOK_POSTUNINSTALL",
    'DeleteAppDataCheckboxState "0"',
    ...UNINSTALL_FLAG_OPTIONS,
    ...OPTIONAL_UNINSTALL_ROOTS,
    "EBWebView\\Default\\Local Storage",
    "GetFileAttributesW(w R0)",
    ".R1",
    "0x400",
  ]) {
    if (!normalizedHooks.includes(value)) fail("uninstall-authority");
  }
  if (
    normalizedHooks.includes(`RMDir /r "$LOCALAPPDATA\\${identity}"`) ||
    normalizedHooks.includes(`RMDir /r \\"$LOCALAPPDATA\\${identity}\\"`) ||
    normalizedHooks.includes('RMDir /r "$LOCALAPPDATA\\${BUNDLEID}"') ||
    !normalizedHooks.includes(`$LOCALAPPDATA\\${identity}`)
  ) {
    fail("uninstall-scope");
  }
  for (const flag of UNINSTALL_FLAGS) {
    if (!lifecycleScript.includes(flag)) fail("lifecycle-flag-coverage");
  }
  for (const scenario of [
    "default",
    "chatterbox-only",
    "preferences-only",
    "both",
    "legacy",
    "invalid",
  ]) {
    if (!lifecycleScript.includes(scenario)) fail("lifecycle-matrix-coverage");
  }
  if (/not-exercised/i.test(lifecycleScript)) fail("lifecycle-not-exercised");
}

export function validateClosedReleaseValues(documents) {
  const {
    rootPackage,
    desktopPackage,
    cargoToml,
    baseConfig,
    releaseConfig,
    optionalManifest,
    buildScript,
    nsisHooks,
    lifecycleScript,
  } = documents;
  if (
    rootPackage.version !== APP_VERSION ||
    desktopPackage.version !== APP_VERSION ||
    !new RegExp(
      `^version = "${APP_VERSION.replaceAll(".", "\\.")}"$`,
      "m",
    ).test(cargoToml) ||
    baseConfig.version !== APP_VERSION
  ) {
    fail("version-mismatch");
  }
  if (
    baseConfig.productName !== "VoxLeaf" ||
    baseConfig.identifier !== "com.voxleaf.desktop" ||
    baseConfig.app?.windows?.[0]?.title !== "VoxLeaf" ||
    baseConfig.bundle?.active !== false
  ) {
    fail("application-identity");
  }
  if (
    !/^release-locked-runtime = \[\]$/m.test(cargoToml) ||
    /chatterbox-acquisition-validation/.test(cargoToml) ||
    !buildScript.includes('"--features"') ||
    !buildScript.includes('"release-locked-runtime"') ||
    /OrdinaryChatterboxStatus|ordinary-chatterbox-status/.test(buildScript) ||
    rootPackage.scripts?.["package:windows:chatterbox-validation"] ||
    rootPackage.scripts?.["package:windows:chatterbox-validation:check"] ||
    desktopPackage.scripts?.test?.includes("chatterbox-validation-release") ||
    !desktopPackage.scripts?.test?.includes(
      "ordinary-chatterbox-release-host.node-test.mjs",
    ) ||
    !rootPackage.scripts?.["package:windows:ordinary-chatterbox"]?.includes(
      "ordinary-chatterbox-release-host.mjs --mode journey",
    ) ||
    !rootPackage.scripts?.[
      "package:windows:ordinary-chatterbox:preflight"
    ]?.includes("ordinary-chatterbox-release-host.mjs --mode preflight") ||
    !rootPackage.scripts?.[
      "package:windows:ordinary-chatterbox:evidence"
    ]?.includes("--ordinary-chatterbox-receipt") ||
    !rootPackage.scripts?.["test:rust"]?.includes(
      "--features release-locked-runtime",
    ) ||
    lifecycleScript.includes("com.voxleaf.desktop.chatterbox-validation") ||
    lifecycleScript.includes("chatterbox-validation")
  ) {
    fail("release-runtime-boundary");
  }
  if (
    optionalManifest.availability !== "downloadable" ||
    "withholdingReason" in optionalManifest ||
    JSON.stringify(optionalManifest.measurements) !==
      JSON.stringify({
        coldStartSeconds: 83,
        downloadBytes: 8_231_893_387,
        installedBytes: 8_228_503_309,
        minimumFreeBytes: 20_000_000_000,
        temporaryBytes: 13_254_834_850,
      }) ||
    optionalManifest.requirements?.platform !== "windows-x86_64" ||
    optionalManifest.requirements?.provider !== "cuda" ||
    optionalManifest.requirements?.precision !== "bfloat16" ||
    optionalManifest.requirements?.minimumLogicalProcessors !== 8 ||
    optionalManifest.requirements?.minimumTotalRamMiB !== 24_576 ||
    optionalManifest.requirements?.minimumAvailableRamMiB !== 4_096 ||
    optionalManifest.requirements?.minimumTotalDedicatedVramMiB !== 5_632 ||
    optionalManifest.requirements?.minimumAvailableDedicatedVramMiB !== 4_668
  ) {
    fail("optional-acquisition-authority");
  }

  const bundle = releaseConfig.bundle;
  const windows = bundle?.windows;
  const nsis = windows?.nsis;
  if (
    bundle?.active !== true ||
    JSON.stringify(bundle.targets) !== JSON.stringify(["nsis"]) ||
    bundle.createUpdaterArtifacts !== false ||
    bundle.category !== "Reference" ||
    windows?.allowDowngrades !== false ||
    windows?.webviewInstallMode?.type !== "embedBootstrapper" ||
    windows?.webviewInstallMode?.silent !== true ||
    nsis?.installMode !== "currentUser" ||
    JSON.stringify(nsis.languages) !== JSON.stringify(["English", "Spanish"]) ||
    nsis.displayLanguageSelector !== true ||
    nsis.installerHooks !== "windows/nsis-hooks.nsh"
  ) {
    fail("bundle-authority");
  }
  if (
    JSON.stringify(nsis.customLanguageFiles) !==
    JSON.stringify({
      English: "windows/nsis-English.nsh",
      Spanish: "windows/nsis-Spanish.nsh",
    })
  ) {
    fail("uninstall-language-authority");
  }
  if (
    JSON.stringify(sortedEntries(bundle.resources)) !==
    JSON.stringify(sortedEntries(EXPECTED_RESOURCES))
  ) {
    fail("resource-closure");
  }
  validateUninstallAuthority({
    nsisHooks,
    lifecycleScript,
    identity: "com.voxleaf.desktop",
  });
  if (/\.pfx|\.p12|certificateThumbprint|signCommand/i.test(nsisHooks)) {
    fail("tracked-signing-credential");
  }
}

export async function validateReleaseConfiguration(root, requireCore = false) {
  const documents = await loadReleaseDocuments(root);
  validateClosedReleaseValues(documents);
  const srcTauri = path.join(root, "apps/desktop/src-tauri");
  for (const source of releaseResourceSources(requireCore)) {
    const resolved = path.resolve(srcTauri, source);
    if (
      !(await stat(resolved)).isFile() &&
      !(await stat(resolved)).isDirectory()
    ) {
      fail("resource-missing");
    }
  }
  if (requireCore) {
    const builtManifest = path.join(
      root,
      "services/tts/release/core/dist/voxleaf-piper-core-v1/runtime-manifest-v1.json",
    );
    const trackedManifest = path.join(
      root,
      "services/tts/release/core/runtime-manifest-v1.json",
    );
    if (
      (await readFile(builtManifest)).compare(
        await readFile(trackedManifest),
      ) !== 0
    ) {
      fail("piper-core-manifest-stale");
    }
  }
  for (const retired of [
    "apps/desktop/src-tauri/tauri.chatterbox-validation.conf.json",
    "apps/desktop/src-tauri/windows/nsis-chatterbox-validation-hooks.nsh",
    "apps/desktop/scripts/chatterbox-validation-release.mjs",
    "services/tts/release/optional/chatterbox/optional-package-validation-overlay-v1.json",
    "scripts/build-windows-chatterbox-validation.ps1",
  ]) {
    try {
      await access(path.join(root, retired));
      fail("validation-channel-retained");
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.startsWith("windows-release:")
      ) {
        throw error;
      }
      if (!error || typeof error !== "object" || error.code !== "ENOENT") {
        fail("validation-channel-check");
      }
    }
  }
}

async function sha256(file) {
  return createHash("sha256")
    .update(await readFile(file))
    .digest("hex");
}

function option(arguments_, name, fallback = undefined) {
  const index = arguments_.indexOf(name);
  return index === -1 ? fallback : arguments_[index + 1];
}

export function validateOrdinaryChatterboxReceipt(
  receipt,
  installerIdentity,
  binaryIdentity,
) {
  if (
    JSON.stringify(Object.keys(receipt ?? {}).sort()) !==
      JSON.stringify(
        [
          "application",
          "artifact",
          "outcomes",
          "result",
          "schemaVersion",
          "steps",
        ].sort(),
      ) ||
    JSON.stringify(Object.keys(receipt?.artifact ?? {}).sort()) !==
      JSON.stringify(["applicationBinary", "installer"].sort()) ||
    receipt?.schemaVersion !== 1 ||
    JSON.stringify(receipt.application) !==
      JSON.stringify({
        identifier: "com.voxleaf.desktop",
        platform: "windows-x86_64",
        version: APP_VERSION,
      }) ||
    receipt.result !== "passed" ||
    JSON.stringify(receipt.steps) !==
      JSON.stringify(ORDINARY_CHATTERBOX_JOURNEY_STEPS) ||
    JSON.stringify(receipt.outcomes) !==
      JSON.stringify(ORDINARY_CHATTERBOX_JOURNEY_OUTCOMES) ||
    JSON.stringify(receipt.artifact?.installer) !==
      JSON.stringify(installerIdentity) ||
    JSON.stringify(receipt.artifact?.applicationBinary) !==
      JSON.stringify(binaryIdentity)
  ) {
    fail("ordinary-chatterbox-receipt");
  }
}

export async function createPackageEvidence({
  root,
  installer,
  binary,
  signatureStatus,
  antivirusStatus,
  lifecycleStatus,
  ordinaryChatterboxReceipt,
}) {
  if (!SIGNATURE_STATUSES.has(signatureStatus)) fail("signature-status");
  if (!ANTIVIRUS_STATUSES.has(antivirusStatus)) fail("antivirus-status");
  if (!LIFECYCLE_STATUSES.has(lifecycleStatus)) fail("lifecycle-status");
  const installerName = path.basename(installer);
  if (installerName !== `VoxLeaf_${APP_VERSION}_x64-setup.exe`) {
    fail("installer-identity");
  }
  const installerStats = await stat(installer);
  const binaryStats = await stat(binary);
  const signed = signatureStatus === "signed-valid";
  const installerIdentity = {
    fileName: installerName,
    sizeBytes: installerStats.size,
    sha256: await sha256(installer),
  };
  const binaryIdentity = {
    fileName: path.basename(binary),
    sizeBytes: binaryStats.size,
    sha256: await sha256(binary),
  };
  if (ordinaryChatterboxReceipt !== undefined) {
    validateOrdinaryChatterboxReceipt(
      ordinaryChatterboxReceipt,
      installerIdentity,
      binaryIdentity,
    );
  }
  const ordinaryChatterboxStatus =
    ordinaryChatterboxReceipt === undefined
      ? "not-run"
      : "representative-compatible-host-passed";
  const localReleaseGatesPassed =
    lifecycleStatus === "local-install-first-start-repair-uninstall-passed" &&
    ordinaryChatterboxStatus === "representative-compatible-host-passed";
  return {
    schemaVersion: 2,
    application: {
      identifier: "com.voxleaf.desktop",
      platform: "windows-x86_64",
      version: APP_VERSION,
    },
    authority: {
      releaseConfigSha256: await sha256(
        path.join(root, "apps/desktop/src-tauri/tauri.release.conf.json"),
      ),
      piperRuntimeManifestSha256: await sha256(
        path.join(root, "services/tts/release/core/runtime-manifest-v1.json"),
      ),
      optionalChatterboxManifestSha256: await sha256(
        path.join(
          root,
          "services/tts/release/optional/chatterbox/optional-package-manifest-v2.json",
        ),
      ),
      optionalChatterboxRuntimeEvidenceSha256: await sha256(
        path.join(
          root,
          "services/tts/release/optional/chatterbox/runtime-package-evidence-v3.json",
        ),
      ),
    },
    package: {
      target: "nsis",
      installMode: "current-user",
      webview2Bootstrapper: "embedded",
      updaterIncluded: false,
      installer: installerIdentity,
      applicationBinary: binaryIdentity,
    },
    payload: {
      piperCoreBundled: true,
      spanishVoiceBundled: true,
      englishVoiceBundled: true,
      optionalAcquisitionAuthorityBundled: true,
      chatterboxRuntimeOrWeightsBundled: false,
      qwenBundled: false,
      benchmarkToolsBundled: false,
      generatedAudioOrBooksBundled: false,
    },
    optionalChatterbox: {
      availability: "downloadable-after-live-compatible-host-gate",
      packageBundled: false,
      releaseLockedRuntime: true,
      rendererCompatibilityGateRequired: true,
      nativePreNetworkCompatibilityGateRequired: true,
      downloadBytes: 8_231_893_387,
      installedBytes: 8_228_503_309,
      temporaryBytes: 13_254_834_850,
      minimumFreeBytes: 20_000_000_000,
      representativeCompatibleHostJourney: ordinaryChatterboxStatus,
    },
    signature: {
      status: signatureStatus,
      executableAndInstallerVerified: signed,
      publicPublicationAllowed: signed && localReleaseGatesPassed,
      checksumFileName: `${installerName}.sha256`,
      credentialStoredInRepository: false,
    },
    lifecycle: {
      status: lifecycleStatus,
      representativeNormalUserHostRequired: true,
      localReleaseGatesPassed,
      explicitApplicationDataRemovalStructurallyVerified: true,
      silentUninstallPreservesApplicationData: true,
    },
    observations: {
      antivirus: antivirusStatus,
      smartScreen: "not-observed",
      universalReputationClaimed: false,
    },
    limitations: [
      "Ordinary Chatterbox acquisition is accepted only when the exact hash-bound representative compatible-host receipt is present.",
      signed
        ? "A valid local signature does not by itself authorize publication before all release gates pass."
        : "This unsigned artifact is restricted to local or maintainer-operated portfolio validation.",
      "WebView2 installation can require Microsoft network access when the Windows prerequisite is absent.",
    ],
  };
}

async function main(arguments_) {
  const [command, ...rest] = arguments_;
  const root = repositoryRoot();
  if (command === "check") {
    await validateReleaseConfiguration(root, rest.includes("--require-core"));
    process.stdout.write("windows-release:current\n");
    return;
  }
  if (command === "evidence") {
    await validateReleaseConfiguration(root, true);
    const receiptPath = option(rest, "--ordinary-chatterbox-receipt");
    const evidence = await createPackageEvidence({
      root,
      installer: option(rest, "--installer"),
      binary: option(rest, "--binary"),
      signatureStatus: option(rest, "--signature-status", "unsigned-local"),
      antivirusStatus: option(rest, "--antivirus-status", "not-run"),
      lifecycleStatus: option(rest, "--lifecycle-status", "not-run"),
      ordinaryChatterboxReceipt:
        receiptPath === undefined
          ? undefined
          : await readJson(path.resolve(root, receiptPath)),
    });
    const rendered = `${JSON.stringify(evidence, null, 2)}\n`;
    if (rest.includes("--write")) {
      await writeFile(
        path.join(
          root,
          "apps/desktop/src-tauri/release/windows-package-evidence-v2.json",
        ),
        rendered,
        "utf8",
      );
    }
    process.stdout.write(rendered);
    return;
  }
  fail("command");
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : "windows-release:failed"}\n`,
    );
    process.exitCode = 1;
  });
}
