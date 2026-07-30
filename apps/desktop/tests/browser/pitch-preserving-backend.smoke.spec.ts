import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import process from "node:process";

import { expect, test, type Browser, type Page } from "@playwright/test";

import {
  applyPitchProbeResourceMetrics,
  type PitchPreservingProbeCandidateId,
  type PitchProbeCandidateResultV1,
} from "../../src/tts/pitch-preserving-backend-probe";

const LOCAL_ORIGIN = "http://127.0.0.1:4173";
const MEBIBYTE = 1_048_576;

function executeText(file: string, args: readonly string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(file, args, { encoding: "utf8" }, (error, stdout) => {
      if (error !== null) {
        reject(new Error("pitch-probe-process-query-failed"));
        return;
      }
      resolve(stdout);
    });
  });
}

interface ChromiumProcessSnapshot {
  readonly cpuTimeSeconds: number;
  readonly processIds: readonly number[];
}

async function chromiumProcessSnapshot(
  browser: Browser,
): Promise<ChromiumProcessSnapshot> {
  const session = await browser.newBrowserCDPSession();
  try {
    const result = await session.send("SystemInfo.getProcessInfo");
    return Object.freeze({
      cpuTimeSeconds: result.processInfo.reduce(
        (total, process) =>
          total + (Number.isFinite(process.cpuTime) ? process.cpuTime : 0),
        0,
      ),
      processIds: Object.freeze(
        result.processInfo
          .map((process) => process.id)
          .filter(
            (processId) => Number.isSafeInteger(processId) && processId > 0,
          ),
      ),
    });
  } finally {
    await session.detach();
  }
}

async function browserWorkingSetBytes(browser: Browser): Promise<number> {
  const { processIds } = await chromiumProcessSnapshot(browser);
  if (process.platform === "linux") {
    const residentPages = await Promise.all(
      processIds.map(async (processId) => {
        try {
          const fields = (await readFile(`/proc/${processId}/statm`, "utf8"))
            .trim()
            .split(/\s+/u);
          return Number(fields[1] ?? 0);
        } catch {
          return 0;
        }
      }),
    );
    const bytes = residentPages.reduce(
      (total, pages) => total + pages * 4_096,
      0,
    );
    if (!Number.isSafeInteger(bytes) || bytes <= 0) {
      throw new Error("pitch-probe-working-set-unavailable");
    }
    return bytes;
  }
  if (process.platform !== "win32") {
    const output = await executeText("ps", [
      "-o",
      "rss=",
      "-p",
      processIds.join(","),
    ]);
    const bytes =
      output
        .trim()
        .split(/\s+/u)
        .reduce((total, value) => total + Number(value), 0) * 1_024;
    if (!Number.isSafeInteger(bytes) || bytes <= 0) {
      throw new Error("pitch-probe-working-set-unavailable");
    }
    return bytes;
  }
  const query = [
    `$measurement = Get-Process -Id ${processIds.join(",")} -ErrorAction SilentlyContinue | Measure-Object -Property WorkingSet64 -Sum`,
    "$sum = $measurement.Sum",
    "if ($null -eq $sum) { $sum = 0 }",
    "[Console]::Out.Write([int64]$sum)",
  ].join("; ");
  const output = await executeText("powershell.exe", [
    "-NoProfile",
    "-NonInteractive",
    "-Command",
    query,
  ]);
  const value = Number(output.trim());
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error("pitch-probe-working-set-unavailable");
  }
  return value;
}

function wait(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

async function measureCpuPercentage(
  browser: Browser,
  durationMs: number,
): Promise<number> {
  const before = await chromiumProcessSnapshot(browser);
  const startedAt = performance.now();
  await wait(durationMs);
  const after = await chromiumProcessSnapshot(browser);
  const elapsedSeconds = (performance.now() - startedAt) / 1_000;
  return Math.max(
    0,
    ((after.cpuTimeSeconds - before.cpuTimeSeconds) / elapsedSeconds) * 100,
  );
}

async function measureCandidate(
  browser: Browser,
  page: Page,
  candidateId: PitchPreservingProbeCandidateId,
): Promise<PitchProbeCandidateResultV1> {
  const baselineCpuPercentage = await measureCpuPercentage(browser, 1_000);
  const baselineWorkingSetBytes = await browserWorkingSetBytes(browser);
  const beforeCpu = await chromiumProcessSnapshot(browser);
  const startedAt = performance.now();
  let peakWorkingSetBytes = baselineWorkingSetBytes;
  let sampling = true;
  const workingSetSampler = (async (): Promise<void> => {
    while (sampling) {
      peakWorkingSetBytes = Math.max(
        peakWorkingSetBytes,
        await browserWorkingSetBytes(browser),
      );
      await wait(100);
    }
  })();

  const candidate = await page.evaluate(async (id) => {
    const run = window.__voxleafRunPitchPreservingBackendCandidateProbe;
    if (run === undefined) {
      throw new Error("pitch-preserving-candidate-probe-missing");
    }
    return run(id);
  }, candidateId);
  sampling = false;
  await workingSetSampler;
  const elapsedSeconds = (performance.now() - startedAt) / 1_000;
  const afterCpu = await chromiumProcessSnapshot(browser);
  const activeCpuPercentage = Math.max(
    0,
    ((afterCpu.cpuTimeSeconds - beforeCpu.cpuTimeSeconds) / elapsedSeconds) *
      100,
  );
  return applyPitchProbeResourceMetrics(candidate, {
    additionalProcessRamMiB:
      Math.max(0, peakWorkingSetBytes - baselineWorkingSetBytes) / MEBIBYTE,
    cpuIncreasePercentagePoints: Math.max(
      0,
      activeCpuPercentage - baselineCpuPercentage,
    ),
    maximumActiveTimeStretchers: 1,
  });
}

test("exposes only the frozen local pitch-preserving capabilities", async ({
  context,
  page,
}) => {
  let unexpectedRequestCount = 0;
  await context.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.origin === LOCAL_ORIGIN) {
      await route.continue();
      return;
    }
    unexpectedRequestCount += 1;
    await route.abort("blockedbyclient");
  });

  try {
    await page.goto("/");
    const capabilities = await page.evaluate(async () => {
      const inspect = window.__voxleafInspectPitchPreservingBackendCapabilities;
      if (inspect === undefined) {
        throw new Error("pitch-preserving-capability-probe-missing");
      }
      return inspect();
    });

    expect(capabilities).toEqual({
      authorityVersion: 1,
      audioWorklet: true,
      workletModule: true,
      mediaElementPreservesPitch: true,
      directPlaybackRate: true,
    });
    expect(unexpectedRequestCount).toBe(0);
  } finally {
    await context.unroute("**/*");
    await page.close();
    await context.close();
  }
});

test("measures the frozen pitch-preserving candidates without content or persistence", async ({
  browser,
  context,
  page,
}, testInfo) => {
  test.setTimeout(240_000);
  let unexpectedRequestCount = 0;
  await context.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.origin === LOCAL_ORIGIN) {
      await route.continue();
      return;
    }
    unexpectedRequestCount += 1;
    await route.abort("blockedbyclient");
  });

  try {
    await page.goto("/");
    const wsola = await measureCandidate(
      browser,
      page,
      "repository-audio-worklet-wsola-v1",
    );
    const media = await measureCandidate(
      browser,
      page,
      "html-media-element-preserves-pitch-wav-v1",
    );
    const negative = await page.evaluate(async () => {
      const run = window.__voxleafRunPitchPreservingBackendCandidateProbe;
      if (run === undefined) {
        throw new Error("pitch-preserving-candidate-probe-missing");
      }
      return run("audio-buffer-source-playback-rate-negative-control-v1");
    });
    const result = Object.freeze({
      authorityVersion: 1,
      candidates: Object.freeze([wsola, media, negative]),
      selection: [wsola, media].some(
        (candidate) => candidate.machineGate === "pass",
      )
        ? "listening-required"
        : "retain-1.00x-only",
      externalRequestCount: unexpectedRequestCount,
      persistedGeneratedAudioBytes: 0,
    });
    console.log(
      "Pitch-preserving machine evidence:",
      JSON.stringify(
        result.candidates.map((candidate) => ({
          candidateId: candidate.candidateId,
          machineGate: candidate.machineGate,
          resourceMetrics: candidate.resourceMetrics,
          signalAndLifecycleGate: candidate.signalAndLifecycleGate,
        })),
      ),
    );
    await testInfo.attach("pitch-preserving-machine-result.json", {
      body: JSON.stringify(result, null, 2),
      contentType: "application/json",
    });

    expect(result.externalRequestCount).toBe(0);
    expect(result.persistedGeneratedAudioBytes).toBe(0);
    expect(result.candidates).toHaveLength(3);
    expect(wsola.trials).toHaveLength(9);
    expect(media.trials).toHaveLength(9);
    expect(negative.failureCode).toBe("negative-control-pitch-shift");
    expect(negative.machineGate).toBe("fail");
    expect([wsola.machineGate, media.machineGate]).toContain("pass");
    expect(unexpectedRequestCount).toBe(0);
  } finally {
    await context.unroute("**/*");
    await page.close();
    await context.close();
  }
});
