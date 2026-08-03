import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  APP_VERSION,
  repositoryRoot,
  validateUninstallAuthority,
} from "./windows-release.mjs";

const PRODUCT_NAME = "VoxLeaf-Chatterbox-Validation";
const IDENTIFIER = "com.voxleaf.desktop.chatterbox-validation";
const FEATURE = "chatterbox-acquisition-validation";
const OVERLAY_SOURCE =
  "../../../services/tts/release/optional/chatterbox/optional-package-validation-overlay-v1.json";

function fail(code) {
  throw new Error(`chatterbox-validation-release:${code}`);
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

export async function validateChatterboxValidationRelease(
  root,
  requireCore = false,
) {
  const srcTauri = path.join(root, "apps/desktop/src-tauri");
  const config = await readJson(
    path.join(srcTauri, "tauri.chatterbox-validation.conf.json"),
  );
  const overlay = await readJson(
    path.join(
      root,
      "services/tts/release/optional/chatterbox/optional-package-validation-overlay-v1.json",
    ),
  );
  const canonical = await readJson(
    path.join(
      root,
      "services/tts/release/optional/chatterbox/optional-package-manifest-v2.json",
    ),
  );
  const cargo = await readFile(path.join(srcTauri, "Cargo.toml"), "utf8");
  const hooks = await readFile(
    path.join(srcTauri, "windows/nsis-chatterbox-validation-hooks.nsh"),
    "utf8",
  );
  const lifecycleScript = await readFile(
    path.join(root, "scripts/test-windows-package-lifecycle.ps1"),
    "utf8",
  );

  if (
    config.productName !== PRODUCT_NAME ||
    config.version !== APP_VERSION ||
    config.identifier !== IDENTIFIER ||
    config.app?.windows?.[0]?.title !== "VoxLeaf Chatterbox Validation" ||
    config.bundle?.active !== true ||
    JSON.stringify(config.bundle.targets) !== JSON.stringify(["nsis"]) ||
    config.bundle.createUpdaterArtifacts !== false ||
    config.bundle.windows?.nsis?.installMode !== "currentUser" ||
    config.bundle.windows?.nsis?.installerHooks !==
      "windows/nsis-chatterbox-validation-hooks.nsh"
  ) {
    fail("identity-or-bundle");
  }
  if (
    JSON.stringify(config.bundle.windows?.nsis?.customLanguageFiles) !==
    JSON.stringify({
      English: "windows/nsis-English.nsh",
      Spanish: "windows/nsis-Spanish.nsh",
    })
  ) {
    fail("uninstall-language-authority");
  }
  if (
    canonical.availability !== "withheld" ||
    canonical.measurements !== null ||
    canonical.withholdingReason !== "clean-host-validation-pending"
  ) {
    fail("canonical-manifest-not-withheld");
  }
  if (
    overlay.schemaVersion !== 1 ||
    overlay.purpose !== "local-validation-only" ||
    overlay.availability !== "downloadable" ||
    overlay.publicPublicationAllowed !== false ||
    overlay.measurements?.coldStartSeconds !== 60 ||
    overlay.measurements?.downloadBytes !== 8_231_893_387 ||
    overlay.measurements?.installedBytes !== 8_228_503_309 ||
    overlay.measurements?.temporaryBytes !== 13_254_834_850 ||
    overlay.measurements?.minimumFreeBytes !== 20_000_000_000
  ) {
    fail("overlay-authority");
  }
  if (
    config.bundle.resources?.[OVERLAY_SOURCE] !==
      "resources/release/optional/chatterbox/optional-package-validation-overlay-v1.json" ||
    !Object.keys(config.bundle.resources).some((source) =>
      source.endsWith("optional-package-manifest-v2.json"),
    ) ||
    Object.keys(config.bundle.resources).some((source) =>
      /chatterbox[\\/]dist|benchmarks[\\/]candidates|qwen/i.test(source),
    )
  ) {
    fail("resource-closure");
  }
  if (!cargo.includes(`${FEATURE} = []`)) fail("cargo-feature");
  try {
    validateUninstallAuthority({
      nsisHooks: hooks,
      lifecycleScript,
      identity: IDENTIFIER,
    });
  } catch {
    fail("data-root-isolation");
  }
  if (requireCore) {
    const core = path.resolve(
      srcTauri,
      "../../../services/tts/release/core/dist/voxleaf-piper-core-v1/",
    );
    if (!(await stat(core)).isDirectory()) fail("piper-core-missing");
  }
}

async function main(arguments_) {
  if (arguments_[0] !== "check") fail("command");
  await validateChatterboxValidationRelease(
    repositoryRoot(),
    arguments_.includes("--require-core"),
  );
  process.stdout.write("chatterbox-validation-release:current\n");
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : "chatterbox-validation-release:failed"}\n`,
    );
    process.exitCode = 1;
  });
}
