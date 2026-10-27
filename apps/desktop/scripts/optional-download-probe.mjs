import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";

// Runs in the installed WebView; it calls the ordinary native commands. No
// test-only request limits or alternate download implementation are injected.
export async function boundedDownloadInPage(profileId) {
  const invoke = globalThis.__TAURI_INTERNALS__.invoke;
  const confirmation = await invoke("select_optional_chatterbox", {
    profileId,
  });
  if (confirmation.state !== "confirming") throw new Error("probe-consent");
  let settled = false;
  let state;
  let failure;
  let peakBytes = 0;
  let cancellationRequested = false;
  const work = invoke("download_optional_chatterbox", { profileId }).then(
    (result) => {
      state = result.state;
      settled = true;
    },
    () => {
      state = "failed";
      settled = true;
    },
  );
  const deadline = Date.now() + 35_000;
  try {
    while (!settled) {
      const snapshot = await invoke("optional_chatterbox_snapshot");
      peakBytes = Math.max(peakBytes, snapshot.downloadedBytes);
      failure = snapshot.failure;
      if (peakBytes >= 1_048_576 || Date.now() >= deadline) break;
      await new Promise((resolve) => globalThis.setTimeout(resolve, 10));
    }
  } finally {
    if (!settled) {
      cancellationRequested = true;
      await invoke("cancel_optional_chatterbox", { profileId });
    }
    await work;
  }
  return { state, failure, peakBytes, cancellationRequested };
}

async function begin(client, profileId) {
  await client.execute(`
    globalThis.__voxleafDownloadProbe = null;
    (${boundedDownloadInPage.toString()})(${JSON.stringify(profileId)}).then(
      result => { globalThis.__voxleafDownloadProbe = result; },
      () => { globalThis.__voxleafDownloadProbe = { harnessError: true }; }
    ); return true;`);
}

async function finish(client) {
  for (let attempt = 0; attempt < 800; attempt++) {
    const result = await client.execute(
      "return globalThis.__voxleafDownloadProbe;",
    );
    if (result !== null) {
      if (result.harnessError || result.peakBytes > 16 * 1_048_576)
        throw new Error("download-probe-boundary");
      return result;
    }
    await delay(100);
  }
  throw new Error("download-probe-deadline");
}

export async function exerciseOptionalDownloadProbe({
  client,
  dataRoot,
  profileId,
  repositoryRoot,
  invoke,
}) {
  const stage = (name) =>
    process.stdout.write(`optional-download-probe:stage=${name}\n`);
  stage("capture-error");
  if (
    (await invoke(client, "optional_chatterbox_download_diagnostic")) !== null
  )
    throw new Error("download-probe-not-empty");
  const staging = path.join(dataRoot, "tts", "staging", profileId);
  const partial = path.join(
    staging,
    "operation/downloads/runtime/.voxleaf-chatterbox-runtime-v7.zip.part-001.partial",
  );
  await begin(client, profileId);
  // A directory at the first partial-file path produces a real OS file-create
  // error after response headers. The ordinary cleanup removes this barrier.
  let barrierCreated = false;
  for (let attempt = 0; attempt < 500; attempt++) {
    try {
      await mkdir(partial);
      barrierCreated = true;
      break;
    } catch (error) {
      if (error.code !== "ENOENT") break;
      await delay(10);
    }
  }
  const errorProbe = await finish(client);
  const diagnostic = await invoke(
    client,
    "optional_chatterbox_download_diagnostic",
  );
  if (!barrierCreated || errorProbe.state !== "failed" || diagnostic === null)
    throw new Error("download-probe-error-not-captured");

  const exportRoot = await mkdtemp(
    path.join(tmpdir(), "voxleaf-download-export-"),
  );
  if (
    path.dirname(path.resolve(exportRoot)) !== path.resolve(tmpdir()) ||
    !path.basename(exportRoot).startsWith("voxleaf-download-export-")
  ) {
    throw new Error("download-probe-export-cleanup-boundary");
  }
  try {
    stage("open-synthetic-book");
    const fixtureModule = pathToFileURL(
      path.join(repositoryRoot, "packages/epub/test-support/epub-fixture.ts"),
    );
    const { buildMinimalEpubFixture } = await import(fixtureModule.href);
    const fixture = path.join(exportRoot, "diagnostic-synthetic.epub");
    await writeFile(fixture, await buildMinimalEpubFixture());
    await client.sendKeys(
      await client.findElement('input[type="file"]'),
      fixture,
    );
    let settings;
    for (let attempt = 0; attempt < 100; attempt++) {
      settings = await client.execute(
        `return [...document.querySelectorAll("button")].some(button => button.textContent.trim() === "Settings");`,
      );
      if (settings) break;
      await delay(100);
    }
    if (!settings) throw new Error("download-probe-settings-unavailable");
    stage("open-settings");
    await client.execute(
      `[...document.querySelectorAll("button")].find(button => button.textContent.trim() === "Settings").click(); return true;`,
    );
    await client.executeCdp("Browser.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: exportRoot,
    });
    let expanded = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      expanded = await client.execute(
        `const summary = [...document.querySelectorAll("summary")].find(element => element.textContent === "Download troubleshooting"); if (!summary) return false; summary.click(); return true;`,
      );
      if (expanded) break;
      await delay(50);
    }
    if (!expanded) throw new Error("download-probe-controls-unavailable");
    stage("manual-export");
    const button = await client.execute(
      `const button = [...document.querySelectorAll("button")].find(element => element.textContent === "Export last download error"); button.scrollIntoView({block:"center"}); return true;`,
    );
    if (!button) throw new Error("download-probe-export-unavailable");
    await client.click(
      await client.findElement(".optional-chatterbox-controls details button"),
    );
    const exportedPath = path.join(exportRoot, "voxleaf-download-error.json");
    let exported;
    for (let attempt = 0; attempt < 100; attempt++) {
      try {
        exported = JSON.parse(await readFile(exportedPath, "utf8"));
        break;
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
        await delay(100);
      }
    }
    if (exported === undefined)
      throw new Error("download-probe-export-missing");
    if (!isDeepStrictEqual(exported, diagnostic))
      throw new Error("download-probe-export-mismatch");
    stage("export-verified");
    await client.execute(
      `[...document.querySelectorAll("button")].find(button => button.textContent.trim() === "Close Settings").click(); return true;`,
    );
    stage("bounded-transfer");
    await begin(client, profileId);
    const transfer = await finish(client);
    const finalDiagnostic = await invoke(
      client,
      "optional_chatterbox_download_diagnostic",
    );
    if (
      transfer.state !== "absent" ||
      !transfer.cancellationRequested ||
      transfer.peakBytes < 1_048_576
    ) {
      return {
        passed: false,
        completeAcquisition: false,
        errorProbe,
        diagnostic,
        exported,
        transfer,
        finalDiagnostic,
      };
    }
    if (!isDeepStrictEqual(finalDiagnostic, diagnostic))
      throw new Error("download-probe-cancel-overwrote-error");
    stage("cancel-verified");
    return {
      passed: true,
      completeAcquisition: false,
      errorProbe,
      diagnostic,
      exported,
      transfer,
    };
  } finally {
    await rm(exportRoot, { recursive: true, force: true });
  }
}
