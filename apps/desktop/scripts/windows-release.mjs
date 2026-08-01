import { createHash } from "node:crypto";
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
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

const EXPECTED_RESOURCES = Object.freeze({
  "../../../LICENSE": "resources/notices/VOXLEAF-MIT.txt",
  "../../../docs/user/windows-release.md": "resources/docs/WINDOWS-RELEASE.md",
  "../../../services/tts/release/component-inventory-v1.json":
    "resources/release/component-inventory-v1.json",
  "../../../services/tts/release/core/dist/voxleaf-piper-core-v1/":
    "resources/tts/voxleaf-piper-core-v1/",
  "../../../services/tts/release/optional/chatterbox/THIRD-PARTY-NOTICES.md":
    "resources/release/optional/chatterbox/THIRD-PARTY-NOTICES.md",
  "../../../services/tts/release/optional/chatterbox/optional-package-manifest-v2.json":
    "resources/release/optional/chatterbox/optional-package-manifest-v2.json",
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
    nsisHooks: await readFile(
      path.join(srcTauri, "windows/nsis-hooks.nsh"),
      "utf8",
    ),
  };
}

export function validateClosedReleaseValues(documents) {
  const {
    rootPackage,
    desktopPackage,
    cargoToml,
    baseConfig,
    releaseConfig,
    nsisHooks,
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
    JSON.stringify(sortedEntries(bundle.resources)) !==
    JSON.stringify(sortedEntries(EXPECTED_RESOURCES))
  ) {
    fail("resource-closure");
  }
  for (const value of [
    "NSIS_HOOK_PREUNINSTALL",
    "NSIS_HOOK_POSTUNINSTALL",
    "$LOCALAPPDATA\\com.voxleaf.desktop",
    "IfSilent preserve_application_data",
    "/REMOVE_APP_DATA=",
  ]) {
    if (!nsisHooks.includes(value)) {
      fail("uninstall-authority");
    }
  }
  if (/\.pfx|\.p12|certificateThumbprint|signCommand/i.test(nsisHooks)) {
    fail("tracked-signing-credential");
  }
}

export async function validateReleaseConfiguration(root, requireCore = false) {
  const documents = await loadReleaseDocuments(root);
  validateClosedReleaseValues(documents);
  const srcTauri = path.join(root, "apps/desktop/src-tauri");
  for (const source of Object.keys(EXPECTED_RESOURCES)) {
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

export async function createPackageEvidence({
  root,
  installer,
  binary,
  signatureStatus,
  antivirusStatus,
  lifecycleStatus,
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
  return {
    schemaVersion: 1,
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
    },
    package: {
      target: "nsis",
      installMode: "current-user",
      webview2Bootstrapper: "embedded",
      updaterIncluded: false,
      installer: {
        fileName: installerName,
        sizeBytes: installerStats.size,
        sha256: await sha256(installer),
      },
      applicationBinary: {
        fileName: path.basename(binary),
        sizeBytes: binaryStats.size,
        sha256: await sha256(binary),
      },
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
    signature: {
      status: signatureStatus,
      executableAndInstallerVerified: signed,
      publicPublicationAllowed: signed,
      checksumFileName: `${installerName}.sha256`,
      credentialStoredInRepository: false,
    },
    lifecycle: {
      status: lifecycleStatus,
      cleanHostStillRequired: true,
      explicitApplicationDataRemovalStructurallyVerified: true,
      silentUninstallPreservesApplicationData: true,
    },
    observations: {
      antivirus: antivirusStatus,
      smartScreen: "not-observed",
      universalReputationClaimed: false,
    },
    limitations: [
      "This artifact is not clean-host acceptance evidence; that belongs to M011 Milestone 6.",
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
    const evidence = await createPackageEvidence({
      root,
      installer: option(rest, "--installer"),
      binary: option(rest, "--binary"),
      signatureStatus: option(rest, "--signature-status", "unsigned-local"),
      antivirusStatus: option(rest, "--antivirus-status", "not-run"),
      lifecycleStatus: option(rest, "--lifecycle-status", "not-run"),
    });
    const rendered = `${JSON.stringify(evidence, null, 2)}\n`;
    if (rest.includes("--write")) {
      await writeFile(
        path.join(
          root,
          "apps/desktop/src-tauri/release/windows-package-evidence-v1.json",
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
