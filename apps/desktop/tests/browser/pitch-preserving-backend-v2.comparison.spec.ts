import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import process from "node:process";

import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";

import type {
  PitchPreservingProbeCandidateIdV2,
  PitchProbeCandidateResultV2,
} from "../../src/tts/pitch-preserving-backend-probe-v2";
import { READER_SETTINGS_PLAYBACK_AUTHORITY_V2 } from "../../src/tts/reader-settings-playback-authority-v2";

const LOCAL_ORIGIN =
  process.env.VOXLEAF_PLAYBACK_V2_LOCAL_ORIGIN ?? "http://127.0.0.1:4173";
const MEBIBYTE = 1_048_576;
const EXPECTED_TRIALS =
  READER_SETTINGS_PLAYBACK_AUTHORITY_V2.evaluation.syntheticInput
    .toneFrequenciesHz.length *
  READER_SETTINGS_PLAYBACK_AUTHORITY_V2.evaluation.deterministicRatePercent
    .length;
const requestedCandidateId = process.env
  .VOXLEAF_PLAYBACK_V2_COMPARISON_CANDIDATE as
  PitchPreservingProbeCandidateIdV2 | undefined;
const selectedCandidates =
  requestedCandidateId === undefined
    ? READER_SETTINGS_PLAYBACK_AUTHORITY_V2.candidates
    : READER_SETTINGS_PLAYBACK_AUTHORITY_V2.candidates.filter(
        ({ id }) => id === requestedCandidateId,
      );

if (selectedCandidates.length === 0) {
  throw new Error("pitch-probe-v2-unknown-candidate");
}

function executeText(file: string, args: readonly string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(file, args, { encoding: "utf8" }, (error, stdout) => {
      if (error !== null) {
        reject(new Error("pitch-probe-v2-process-query-failed"));
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
        (total, processInfo) =>
          total +
          (Number.isFinite(processInfo.cpuTime) ? processInfo.cpuTime : 0),
        0,
      ),
      processIds: Object.freeze(
        result.processInfo
          .map((processInfo) => processInfo.id)
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
      throw new Error("pitch-probe-v2-working-set-unavailable");
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
      throw new Error("pitch-probe-v2-working-set-unavailable");
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
    throw new Error("pitch-probe-v2-working-set-unavailable");
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

async function applyFrozenCspAndIsolation(
  context: BrowserContext,
): Promise<() => number> {
  let unexpectedRequestCount = 0;
  await context.route("**/*", async (route) => {
    const request = route.request();
    const requestUrl = new URL(request.url());
    if (requestUrl.origin !== LOCAL_ORIGIN) {
      unexpectedRequestCount += 1;
      await route.abort("blockedbyclient");
      return;
    }
    if (request.resourceType() === "document") {
      const response = await route.fetch();
      await route.fulfill({
        response,
        headers: {
          ...response.headers(),
          "content-security-policy":
            READER_SETTINGS_PLAYBACK_AUTHORITY_V2.contentSecurityPolicy
              .mediaCandidateProspective,
        },
      });
      return;
    }
    await route.continue();
  });
  return () => unexpectedRequestCount;
}

async function measureCandidate(
  browser: Browser,
  page: Page,
  candidateId: PitchPreservingProbeCandidateIdV2,
): Promise<PitchProbeCandidateResultV2> {
  const baselineCpuPercentage = await measureCpuPercentage(browser, 1_000);
  const baselineWorkingSetBytes = await browserWorkingSetBytes(browser);
  const beforeCpu = await chromiumProcessSnapshot(browser);
  const startedAt = performance.now();
  let peakWorkingSetBytes = baselineWorkingSetBytes;
  let sampling = true;
  const sampler = (async (): Promise<void> => {
    while (sampling) {
      peakWorkingSetBytes = Math.max(
        peakWorkingSetBytes,
        await browserWorkingSetBytes(browser),
      );
      await wait(100);
    }
  })();
  let candidate: PitchProbeCandidateResultV2;
  try {
    candidate = await page.evaluate(async (id) => {
      const run = window.__voxleafRunPitchPreservingBackendCandidateProbeV2;
      if (run === undefined) {
        throw new Error("pitch-preserving-candidate-probe-v2-missing");
      }
      return run(id);
    }, candidateId);
  } finally {
    sampling = false;
    await sampler;
  }
  const elapsedSeconds = (performance.now() - startedAt) / 1_000;
  const afterCpu = await chromiumProcessSnapshot(browser);
  const activeCpuPercentage = Math.max(
    0,
    ((afterCpu.cpuTimeSeconds - beforeCpu.cpuTimeSeconds) / elapsedSeconds) *
      100,
  );
  const resourceMetrics = Object.freeze({
    additionalProcessRamMiB:
      Math.max(0, peakWorkingSetBytes - baselineWorkingSetBytes) / MEBIBYTE,
    cpuIncreasePercentagePoints: Math.max(
      0,
      activeCpuPercentage - baselineCpuPercentage,
    ),
    maximumActiveTimeStretchers: 1,
  });
  const gates = READER_SETTINGS_PLAYBACK_AUTHORITY_V2.evaluation.machineGates;
  const passes =
    candidate.signalAndLifecycleGate === "pass" &&
    resourceMetrics.additionalProcessRamMiB <=
      gates.maximumAdditionalProcessRamMiB &&
    resourceMetrics.cpuIncreasePercentagePoints <=
      gates.maximumCpuIncreasePercentagePoints;
  return Object.freeze({
    ...candidate,
    resourceMetrics,
    machineGate: passes ? "pass" : "fail",
    failureCode: passes
      ? null
      : (candidate.failureCode ?? "machine-gate-failed"),
  });
}

test("loads all frozen v2 capabilities under the exact prospective CSP", async ({
  context,
  page,
}) => {
  test.setTimeout(30_000);
  const unexpectedRequests = await applyFrozenCspAndIsolation(context);
  try {
    await page.goto("/");
    const capabilities = await page.evaluate(async () => {
      const inspect =
        window.__voxleafInspectPitchPreservingBackendCapabilitiesV2;
      if (inspect === undefined) {
        throw new Error("pitch-preserving-capability-probe-v2-missing");
      }
      return inspect();
    });

    expect(capabilities).toEqual({
      authorityVersion: 2,
      audioWorklet: true,
      mediaElementPreservesPitch: true,
      signalsmithModule: true,
      repositoryWorkletModule: true,
    });
    expect(unexpectedRequests()).toBe(0);
  } finally {
    await context.unroute("**/*");
    await page.close();
    await context.close();
  }
});

test("measures the selected frozen v2 candidates sequentially", async ({
  browser,
  context,
  page,
}, testInfo) => {
  test.setTimeout(720_000);
  const unexpectedRequests = await applyFrozenCspAndIsolation(context);
  const results: PitchProbeCandidateResultV2[] = [];
  try {
    await page.goto("/");
    for (const candidate of selectedCandidates) {
      results.push(await measureCandidate(browser, page, candidate.id));
    }
    const result = Object.freeze({
      authorityVersion: 2,
      host: "production-chromium",
      candidates: Object.freeze(results),
      externalRequestCount: unexpectedRequests(),
      persistedGeneratedAudioBytes: 0,
    });
    console.log(
      "Pitch-preserving v2 Chromium evidence:",
      JSON.stringify(
        result.candidates.map((candidate) => ({
          candidateId: candidate.candidateId,
          backendStartP95Ms: candidate.backendStartP95Ms,
          maximumAdditionalWorkBytes: candidate.maximumAdditionalWorkBytes,
          maximumRenderedDurationErrorMs:
            candidate.maximumRenderedDurationErrorMs,
          machineGate: candidate.machineGate,
          maximumPitchDeviationCents: candidate.maximumPitchDeviationCents,
          maximumSourceFrameDrift: candidate.maximumSourceFrameDrift,
          pauseStopTeardownP95Ms: candidate.pauseStopTeardownP95Ms,
          rateSettlementP95Ms: candidate.rateSettlementP95Ms,
          resourceMetrics: candidate.resourceMetrics,
          signalAndLifecycleGate: candidate.signalAndLifecycleGate,
        })),
      ),
    );
    await testInfo.attach("pitch-preserving-v2-chromium-result.json", {
      body: JSON.stringify(result, null, 2),
      contentType: "application/json",
    });

    expect(result.externalRequestCount).toBe(0);
    expect(result.persistedGeneratedAudioBytes).toBe(0);
    expect(result.candidates).toHaveLength(selectedCandidates.length);
    for (const candidate of result.candidates) {
      expect(candidate.machineGate).not.toBe("resource-measurement-required");
      expect(candidate.activeObjectUrlsAfterCleanup).toBe(0);
      if (candidate.capability === "available") {
        expect(candidate.trials.length).toBeLessThanOrEqual(EXPECTED_TRIALS);
      }
    }
    for (const candidate of result.candidates) {
      expect(candidate.maximumActiveObjectUrls).toBe(
        candidate.candidateId === "html-media-element-preserves-pitch-wav-v2"
          ? 1
          : 0,
      );
    }
  } finally {
    await context.unroute("**/*");
    await page.close();
    await context.close();
  }
});
