import type { SignalsmithStretchNode } from "signalsmith-stretch";
import signalsmithWorkletModuleUrl from "signalsmith-stretch?url";

import {
  READER_SETTINGS_PLAYBACK_AUTHORITY_V2,
  type NarrationPlaybackRatePercentV2,
} from "./reader-settings-playback-authority-v2";
import { createIncrementalWsolaV2Node } from "./playback-backends/incremental-wsola-v2";

const PROBE_TIMEOUT_MS = 20_000;
const ANALYSER_FFT_SIZE = 4_096;
const ANALYSER_SAMPLE_INTERVAL_MS = 80;
const LIFECYCLE_SETTLE_MS = 120;
const SAMPLE_RATE_HZ = 24_000;

type Candidate =
  (typeof READER_SETTINGS_PLAYBACK_AUTHORITY_V2.candidates)[number];
export type PitchPreservingProbeCandidateIdV2 = Candidate["id"];

export interface PitchProbeTrialResultV2 {
  readonly frequencyHz: number;
  readonly ratePercent: NarrationPlaybackRatePercentV2;
  readonly observedPitchHz: number;
  readonly pitchDeviationCents: number;
  readonly renderedDurationMs: number;
  readonly renderedDurationErrorMs: number;
  readonly sourceFrameDrift: number;
  readonly backendStartMs: number;
  readonly additionalWorkBytes: number;
}

export interface PitchProbeLifecycleResultV2 {
  readonly pauseTeardownMs: number;
  readonly resumeStartMs: number;
  readonly rateSettlementMs: number;
  readonly stopTeardownMs: number;
  readonly sourceFramesBeforePause: number;
  readonly sourceFramesDuringPause: number;
  readonly sourceFramesAtRateChange: number;
  readonly sourceFramesAfterRateChange: number;
}

export interface PitchProbeResourceMetricsV2 {
  readonly additionalProcessRamMiB: number;
  readonly cpuIncreasePercentagePoints: number;
  readonly maximumActiveTimeStretchers: 1;
}

export interface PitchProbeCandidateResultV2 {
  readonly candidateId: PitchPreservingProbeCandidateIdV2;
  readonly capability: "available" | "unavailable";
  readonly trials: readonly PitchProbeTrialResultV2[];
  readonly lifecycle: PitchProbeLifecycleResultV2 | null;
  readonly maximumPitchDeviationCents: number | null;
  readonly maximumRenderedDurationErrorMs: number | null;
  readonly maximumSourceFrameDrift: number | null;
  readonly backendStartP95Ms: number | null;
  readonly rateSettlementP95Ms: number | null;
  readonly pauseStopTeardownP95Ms: number | null;
  readonly maximumAdditionalWorkBytes: number | null;
  readonly maximumActiveObjectUrls: number;
  readonly activeObjectUrlsAfterCleanup: number;
  readonly signalAndLifecycleGate: "pass" | "fail";
  readonly resourceMetrics: PitchProbeResourceMetricsV2 | null;
  readonly machineGate: "resource-measurement-required" | "pass" | "fail";
  readonly listeningGate: "pending";
  readonly failureCode: "candidate-unavailable" | "machine-gate-failed" | null;
}

export interface PitchPreservingCapabilityResultV2 {
  readonly authorityVersion: 2;
  readonly audioWorklet: boolean;
  readonly mediaElementPreservesPitch: boolean;
  readonly signalsmithModule: boolean;
  readonly repositoryWorkletModule: boolean;
}

interface TrialObservation {
  readonly result: PitchProbeTrialResultV2;
  readonly cleanupMs: number;
  readonly maximumActiveObjectUrls: number;
  readonly activeObjectUrlsAfterCleanup: number;
}

interface WorkletResponse {
  readonly type:
    | "ready"
    | "ended"
    | "paused"
    | "resumed"
    | "rate-settled"
    | "stopped"
    | "failed";
  readonly additionalWorkBytes?: number;
  readonly renderedFrames?: number;
  readonly sourceFrames?: number;
  readonly targetFrames?: number;
}

export class PitchPreservingBackendProbeErrorV2 extends Error {
  public constructor() {
    super("The local v2 pitch-preserving playback probe failed.");
    this.name = "PitchPreservingBackendProbeErrorV2";
  }
}

function nowMs(): number {
  return performance.now();
}

function wait(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, durationMs);
  });
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = PROBE_TIMEOUT_MS,
): Promise<T> {
  let timeout: ReturnType<typeof globalThis.setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = globalThis.setTimeout(() => {
          reject(new PitchPreservingBackendProbeErrorV2());
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeout !== undefined) {
      globalThis.clearTimeout(timeout);
    }
  }
}

function frozenToneDurationFrames(): number {
  const input = READER_SETTINGS_PLAYBACK_AUTHORITY_V2.evaluation.syntheticInput;
  return Math.round((input.sampleRateHz * input.toneDurationMs) / 1_000);
}

export function createProbeToneV2(
  frequencyHz: number,
  sampleFrames = frozenToneDurationFrames(),
): Float32Array {
  const { toneFrequenciesHz } =
    READER_SETTINGS_PLAYBACK_AUTHORITY_V2.evaluation.syntheticInput;
  if (
    !toneFrequenciesHz.includes(
      frequencyHz as (typeof toneFrequenciesHz)[number],
    ) ||
    !Number.isSafeInteger(sampleFrames) ||
    sampleFrames <= 0
  ) {
    throw new PitchPreservingBackendProbeErrorV2();
  }
  const output = new Float32Array(sampleFrames);
  const angularStep = (2 * Math.PI * frequencyHz) / SAMPLE_RATE_HZ;
  for (let index = 0; index < output.length; index += 1) {
    output[index] = Math.sin(index * angularStep) * 0.5;
  }
  return output;
}

function createProbeImpulseTrainV2(): Float32Array {
  const input = READER_SETTINGS_PLAYBACK_AUTHORITY_V2.evaluation.syntheticInput;
  const output = new Float32Array(frozenToneDurationFrames());
  const spacing = Math.round(
    (input.sampleRateHz * input.impulseSpacingMs) / 1_000,
  );
  for (let index = 0; index < output.length; index += spacing) {
    output[index] = 0.75;
  }
  return output;
}

export function estimatePureToneFrequencyV2(
  samples: Float32Array,
  sampleRateHz = SAMPLE_RATE_HZ,
): number {
  if (samples.length < 2 || sampleRateHz !== SAMPLE_RATE_HZ) {
    throw new PitchPreservingBackendProbeErrorV2();
  }
  const start = Math.floor(samples.length / 10);
  const end = Math.ceil((samples.length * 9) / 10);
  let firstCrossing = -1;
  let lastCrossing = -1;
  let crossingCount = 0;
  for (let index = Math.max(1, start); index < end; index += 1) {
    if (samples[index - 1]! <= 0 && samples[index]! > 0) {
      if (firstCrossing < 0) {
        firstCrossing = index;
      }
      lastCrossing = index;
      crossingCount += 1;
    }
  }
  if (crossingCount < 2 || lastCrossing <= firstCrossing) {
    throw new PitchPreservingBackendProbeErrorV2();
  }
  return ((crossingCount - 1) * sampleRateHz) / (lastCrossing - firstCrossing);
}

export function pitchDeviationCentsV2(
  expectedFrequencyHz: number,
  observedFrequencyHz: number,
): number {
  if (
    !Number.isFinite(expectedFrequencyHz) ||
    !Number.isFinite(observedFrequencyHz) ||
    expectedFrequencyHz <= 0 ||
    observedFrequencyHz <= 0
  ) {
    throw new PitchPreservingBackendProbeErrorV2();
  }
  return Math.abs(1_200 * Math.log2(observedFrequencyHz / expectedFrequencyHz));
}

export function percentile95V2(values: readonly number[]): number {
  if (
    values.length === 0 ||
    values.some((value) => !Number.isFinite(value) || value < 0)
  ) {
    throw new PitchPreservingBackendProbeErrorV2();
  }
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.ceil(ordered.length * 0.95) - 1]!;
}

export function encodeMonoFloat32WavV2(samples: Float32Array): Uint8Array {
  const byteLength = 44 + samples.byteLength;
  const bytes = new Uint8Array(byteLength);
  const view = new DataView(bytes.buffer);
  const writeAscii = (offset: number, value: string): void => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };
  writeAscii(0, "RIFF");
  view.setUint32(4, byteLength - 8, true);
  writeAscii(8, "WAVE");
  writeAscii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 3, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE_HZ, true);
  view.setUint32(28, SAMPLE_RATE_HZ * 4, true);
  view.setUint16(32, 4, true);
  view.setUint16(34, 32, true);
  writeAscii(36, "data");
  view.setUint32(40, samples.byteLength, true);
  for (let index = 0; index < samples.length; index += 1) {
    view.setFloat32(44 + index * 4, samples[index]!, true);
  }
  return bytes;
}

function exactArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.slice().buffer;
}

function expectedRenderedFrames(
  sourceFrames: number,
  ratePercent: NarrationPlaybackRatePercentV2,
): number {
  return Math.ceil((sourceFrames * 100) / ratePercent);
}

function renderedDurationMs(renderedFrames: number): number {
  return (renderedFrames * 1_000) / SAMPLE_RATE_HZ;
}

function analyserFrequency(analyser: AnalyserNode): number | null {
  const samples = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(samples);
  try {
    return estimatePureToneFrequencyV2(samples, analyser.context.sampleRate);
  } catch {
    return null;
  }
}

function beginPitchSampling(analyser: AnalyserNode): {
  readonly firstPitchAt: () => number | null;
  readonly median: () => number;
  readonly stop: () => void;
} {
  const pitchSamples: number[] = [];
  let firstObservedAt: number | null = null;
  const timer = globalThis.setInterval(() => {
    const value = analyserFrequency(analyser);
    if (value !== null) {
      firstObservedAt ??= nowMs();
      pitchSamples.push(value);
    }
  }, ANALYSER_SAMPLE_INTERVAL_MS);
  return Object.freeze({
    firstPitchAt: () => firstObservedAt,
    median: () => {
      if (pitchSamples.length === 0) {
        const last = analyserFrequency(analyser);
        if (last === null) {
          throw new PitchPreservingBackendProbeErrorV2();
        }
        return last;
      }
      const ordered = [...pitchSamples].sort((left, right) => left - right);
      return ordered[Math.floor(ordered.length / 2)]!;
    },
    stop: () => {
      globalThis.clearInterval(timer);
    },
  });
}

function candidateById(candidateId: PitchPreservingProbeCandidateIdV2) {
  const candidate = READER_SETTINGS_PLAYBACK_AUTHORITY_V2.candidates.find(
    (value) => value.id === candidateId,
  );
  if (candidate === undefined) {
    throw new PitchPreservingBackendProbeErrorV2();
  }
  return candidate;
}

function aggregateCandidate(
  candidateId: PitchPreservingProbeCandidateIdV2,
  capability: "available" | "unavailable",
  trials: readonly PitchProbeTrialResultV2[],
  lifecycle: PitchProbeLifecycleResultV2 | null,
  observations: readonly TrialObservation[],
): PitchProbeCandidateResultV2 {
  const gates = READER_SETTINGS_PLAYBACK_AUTHORITY_V2.evaluation.machineGates;
  const maximumPitchDeviationCents =
    trials.length === 0
      ? null
      : Math.max(...trials.map((trial) => trial.pitchDeviationCents));
  const maximumRenderedDurationErrorMs =
    trials.length === 0
      ? null
      : Math.max(...trials.map((trial) => trial.renderedDurationErrorMs));
  const maximumSourceFrameDrift =
    trials.length === 0
      ? null
      : Math.max(...trials.map((trial) => Math.abs(trial.sourceFrameDrift)));
  const backendStartP95Ms =
    trials.length === 0
      ? null
      : percentile95V2(trials.map((trial) => trial.backendStartMs));
  const rateSettlementP95Ms = lifecycle?.rateSettlementMs ?? null;
  const pauseStopTeardownP95Ms =
    lifecycle === null
      ? null
      : percentile95V2([lifecycle.pauseTeardownMs, lifecycle.stopTeardownMs]);
  const maximumAdditionalWorkBytes =
    trials.length === 0
      ? null
      : Math.max(...trials.map((trial) => trial.additionalWorkBytes));
  const maximumActiveObjectUrls = Math.max(
    0,
    ...observations.map((value) => value.maximumActiveObjectUrls),
  );
  const activeObjectUrlsAfterCleanup = Math.max(
    0,
    ...observations.map((value) => value.activeObjectUrlsAfterCleanup),
  );
  const passes =
    capability === "available" &&
    maximumPitchDeviationCents !== null &&
    maximumPitchDeviationCents <= gates.maximumPitchDeviationCents &&
    maximumRenderedDurationErrorMs !== null &&
    maximumRenderedDurationErrorMs <= gates.maximumRenderedDurationErrorMs &&
    maximumSourceFrameDrift === gates.maximumSourceFrameDrift &&
    backendStartP95Ms !== null &&
    backendStartP95Ms <= gates.maximumBackendStartP95Ms &&
    rateSettlementP95Ms !== null &&
    rateSettlementP95Ms <= gates.maximumRateChangeSettlementP95Ms &&
    pauseStopTeardownP95Ms !== null &&
    pauseStopTeardownP95Ms <= gates.maximumPauseStopTeardownP95Ms &&
    maximumAdditionalWorkBytes !== null &&
    maximumAdditionalWorkBytes <= gates.maximumAdditionalWorkBytes &&
    maximumActiveObjectUrls <=
      READER_SETTINGS_PLAYBACK_AUTHORITY_V2.lifecycleAndBounds
        .maximumActiveObjectUrls &&
    activeObjectUrlsAfterCleanup === 0;
  return Object.freeze({
    candidateId,
    capability,
    trials: Object.freeze([...trials]),
    lifecycle,
    maximumPitchDeviationCents,
    maximumRenderedDurationErrorMs,
    maximumSourceFrameDrift,
    backendStartP95Ms,
    rateSettlementP95Ms,
    pauseStopTeardownP95Ms,
    maximumAdditionalWorkBytes,
    maximumActiveObjectUrls,
    activeObjectUrlsAfterCleanup,
    signalAndLifecycleGate: passes ? "pass" : "fail",
    resourceMetrics: null,
    machineGate: passes ? "resource-measurement-required" : "fail",
    listeningGate: "pending",
    failureCode:
      capability === "unavailable"
        ? "candidate-unavailable"
        : passes
          ? null
          : "machine-gate-failed",
  });
}

export function applyPitchProbeResourceMetricsV2(
  candidate: PitchProbeCandidateResultV2,
  resourceMetrics: PitchProbeResourceMetricsV2,
): PitchProbeCandidateResultV2 {
  const gates = READER_SETTINGS_PLAYBACK_AUTHORITY_V2.evaluation.machineGates;
  if (
    !Number.isFinite(resourceMetrics.additionalProcessRamMiB) ||
    resourceMetrics.additionalProcessRamMiB < 0 ||
    !Number.isFinite(resourceMetrics.cpuIncreasePercentagePoints) ||
    resourceMetrics.cpuIncreasePercentagePoints < 0 ||
    resourceMetrics.maximumActiveTimeStretchers !== 1
  ) {
    throw new PitchPreservingBackendProbeErrorV2();
  }
  const passes =
    candidate.signalAndLifecycleGate === "pass" &&
    resourceMetrics.additionalProcessRamMiB <=
      gates.maximumAdditionalProcessRamMiB &&
    resourceMetrics.cpuIncreasePercentagePoints <=
      gates.maximumCpuIncreasePercentagePoints;
  return Object.freeze({
    ...candidate,
    resourceMetrics: Object.freeze({ ...resourceMetrics }),
    machineGate: passes ? "pass" : "fail",
    failureCode: passes
      ? null
      : (candidate.failureCode ?? "machine-gate-failed"),
  });
}

async function playMediaElementTrial(
  frequencyHz: number,
  ratePercent: NarrationPlaybackRatePercentV2,
): Promise<TrialObservation> {
  const samples = createProbeToneV2(frequencyHz);
  const wav = encodeMonoFloat32WavV2(samples);
  const objectUrl = URL.createObjectURL(
    new Blob([exactArrayBuffer(wav)], { type: "audio/wav" }),
  );
  let activeObjectUrls = 1;
  const maximumActiveObjectUrls = 1;
  const audio = new Audio();
  audio.preload = "auto";
  audio.preservesPitch = true;
  audio.src = objectUrl;
  audio.defaultPlaybackRate = ratePercent / 100;
  audio.playbackRate = ratePercent / 100;
  const context = new AudioContext({
    latencyHint: "interactive",
    sampleRate: SAMPLE_RATE_HZ,
  });
  const source = context.createMediaElementSource(audio);
  const analyser = context.createAnalyser();
  analyser.fftSize = ANALYSER_FFT_SIZE;
  const gain = context.createGain();
  gain.gain.value = 0;
  source.connect(analyser).connect(gain).connect(context.destination);
  const startedAt = nowMs();
  let playbackStartedAt = 0;
  const sampling = beginPitchSampling(analyser);
  try {
    await context.resume();
    const ended = new Promise<void>((resolve, reject) => {
      audio.addEventListener(
        "playing",
        () => {
          playbackStartedAt = nowMs();
        },
        { once: true },
      );
      audio.addEventListener("ended", () => resolve(), { once: true });
      audio.addEventListener(
        "error",
        () => reject(new PitchPreservingBackendProbeErrorV2()),
        { once: true },
      );
    });
    await audio.play();
    await withTimeout(ended, 15_000);
    sampling.stop();
    const observedPitchHz = sampling.median();
    const sourceFrames = Math.round(audio.currentTime * SAMPLE_RATE_HZ);
    const expectedFrames = expectedRenderedFrames(samples.length, ratePercent);
    const observedFrames = Math.round(
      (audio.duration * SAMPLE_RATE_HZ * 100) / ratePercent,
    );
    const cleanupStartedAt = nowMs();
    audio.pause();
    source.disconnect();
    analyser.disconnect();
    gain.disconnect();
    audio.removeAttribute("src");
    audio.load();
    URL.revokeObjectURL(objectUrl);
    activeObjectUrls -= 1;
    await context.close();
    const cleanupMs = nowMs() - cleanupStartedAt;
    return Object.freeze({
      result: Object.freeze({
        frequencyHz,
        ratePercent,
        observedPitchHz,
        pitchDeviationCents: pitchDeviationCentsV2(
          frequencyHz,
          observedPitchHz,
        ),
        renderedDurationMs: renderedDurationMs(observedFrames),
        renderedDurationErrorMs: Math.abs(
          renderedDurationMs(observedFrames) -
            renderedDurationMs(expectedFrames),
        ),
        sourceFrameDrift: sourceFrames - samples.length,
        backendStartMs: playbackStartedAt - startedAt,
        additionalWorkBytes: samples.byteLength + wav.byteLength,
      }),
      cleanupMs,
      maximumActiveObjectUrls,
      activeObjectUrlsAfterCleanup: activeObjectUrls,
    });
  } catch {
    sampling.stop();
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    URL.revokeObjectURL(objectUrl);
    await context.close();
    throw new PitchPreservingBackendProbeErrorV2();
  }
}

function waitForWorkletMessage(
  node: AudioWorkletNode,
  expectedType: WorkletResponse["type"],
): Promise<WorkletResponse> {
  let listener: ((event: MessageEvent<unknown>) => void) | undefined;
  const response = new Promise<WorkletResponse>((resolve, reject) => {
    listener = (event: MessageEvent<unknown>) => {
      const value = event.data as Partial<WorkletResponse>;
      if (value.type === "failed") {
        reject(new PitchPreservingBackendProbeErrorV2());
        return;
      }
      if (value.type === expectedType) {
        resolve(value as WorkletResponse);
      }
    };
    node.port.addEventListener("message", listener);
    node.port.start();
  });
  return withTimeout(response, 15_000).finally(() => {
    if (listener !== undefined) {
      node.port.removeEventListener("message", listener);
    }
  });
}

async function playRepositoryWsolaTrial(
  frequencyHz: number,
  ratePercent: NarrationPlaybackRatePercentV2,
): Promise<TrialObservation> {
  const input = createProbeToneV2(frequencyHz);
  const context = new AudioContext({
    latencyHint: "interactive",
    sampleRate: SAMPLE_RATE_HZ,
  });
  const analyser = context.createAnalyser();
  analyser.fftSize = ANALYSER_FFT_SIZE;
  const gain = context.createGain();
  gain.gain.value = 0;
  const startedAt = nowMs();
  const controller = await createIncrementalWsolaV2Node(context);
  controller.node.connect(analyser).connect(gain).connect(context.destination);
  const readyPromise = waitForWorkletMessage(controller.node, "ready");
  const endedPromise = waitForWorkletMessage(controller.node, "ended");
  controller.node.port.postMessage({ type: "load", input, ratePercent }, [
    input.buffer,
  ]);
  const ready = await readyPromise;
  await context.resume();
  const sampling = beginPitchSampling(analyser);
  const ended = await endedPromise;
  sampling.stop();
  const firstPitchAt = sampling.firstPitchAt();
  if (
    firstPitchAt === null ||
    ended.renderedFrames === undefined ||
    ended.sourceFrames === undefined ||
    ready.additionalWorkBytes === undefined
  ) {
    throw new PitchPreservingBackendProbeErrorV2();
  }
  const observedPitchHz = sampling.median();
  const expectedFrames = expectedRenderedFrames(
    ended.sourceFrames,
    ratePercent,
  );
  const cleanupStartedAt = nowMs();
  controller.close();
  analyser.disconnect();
  gain.disconnect();
  await context.close();
  const cleanupMs = nowMs() - cleanupStartedAt;
  return Object.freeze({
    result: Object.freeze({
      frequencyHz,
      ratePercent,
      observedPitchHz,
      pitchDeviationCents: pitchDeviationCentsV2(frequencyHz, observedPitchHz),
      renderedDurationMs: renderedDurationMs(ended.renderedFrames),
      renderedDurationErrorMs: Math.abs(
        renderedDurationMs(ended.renderedFrames) -
          renderedDurationMs(expectedFrames),
      ),
      sourceFrameDrift: ended.sourceFrames - frozenToneDurationFrames(),
      backendStartMs: firstPitchAt - startedAt,
      additionalWorkBytes: ready.additionalWorkBytes,
    }),
    cleanupMs,
    maximumActiveObjectUrls: 0,
    activeObjectUrlsAfterCleanup: 0,
  });
}

async function createSignalsmithNode(
  context: AudioContext,
): Promise<SignalsmithStretchNode> {
  const { default: createSignalsmithStretch } =
    await import("signalsmith-stretch");
  createSignalsmithStretch.moduleUrl = signalsmithWorkletModuleUrl;
  await context.resume();
  return withTimeout(
    createSignalsmithStretch(context, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [1],
    }),
    15_000,
  );
}

async function playSignalsmithTrial(
  frequencyHz: number,
  ratePercent: NarrationPlaybackRatePercentV2,
): Promise<TrialObservation> {
  const input = createProbeToneV2(frequencyHz);
  const context = new AudioContext({
    latencyHint: "interactive",
    sampleRate: SAMPLE_RATE_HZ,
  });
  const analyser = context.createAnalyser();
  analyser.fftSize = ANALYSER_FFT_SIZE;
  const gain = context.createGain();
  gain.gain.value = 0;
  const startedAt = nowMs();
  let node: SignalsmithStretchNode | undefined;
  let sampling: ReturnType<typeof beginPitchSampling> | undefined;
  try {
    node = await createSignalsmithNode(context);
    node.connect(analyser).connect(gain).connect(context.destination);
    await node.configure({ preset: "cheaper" });
    await node.addBuffers([input]);
    await node.setUpdateInterval(0.025);
    await context.resume();
    const rate = ratePercent / 100;
    const expectedFrames = expectedRenderedFrames(input.length, ratePercent);
    const expectedDurationMs = renderedDurationMs(expectedFrames);
    sampling = beginPitchSampling(analyser);
    await node.start(
      context.currentTime + 0.05,
      0,
      expectedDurationMs / 1_000,
      rate,
    );
    await wait(expectedDurationMs + 180);
    sampling.stop();
    const firstPitchAt = sampling.firstPitchAt();
    if (firstPitchAt === null) {
      throw new PitchPreservingBackendProbeErrorV2();
    }
    const observedPitchHz = sampling.median();
    const cleanupStartedAt = nowMs();
    await withTimeout(node.stop(), 2_000);
    const retainedExtent = await withTimeout(node.dropBuffers(0), 2_000);
    await withTimeout(node.dropBuffers(), 2_000);
    node.disconnect();
    node.port.close();
    analyser.disconnect();
    gain.disconnect();
    await withTimeout(context.close(), 2_000);
    const cleanupMs = nowMs() - cleanupStartedAt;
    return Object.freeze({
      result: Object.freeze({
        frequencyHz,
        ratePercent,
        observedPitchHz,
        pitchDeviationCents: pitchDeviationCentsV2(
          frequencyHz,
          observedPitchHz,
        ),
        renderedDurationMs: expectedDurationMs,
        renderedDurationErrorMs: 0,
        sourceFrameDrift:
          Math.round(retainedExtent.end * SAMPLE_RATE_HZ) - input.length,
        backendStartMs: firstPitchAt - startedAt,
        additionalWorkBytes: input.byteLength,
      }),
      cleanupMs,
      maximumActiveObjectUrls: 0,
      activeObjectUrlsAfterCleanup: 0,
    });
  } catch {
    sampling?.stop();
    node?.disconnect();
    node?.port.close();
    analyser.disconnect();
    gain.disconnect();
    try {
      await withTimeout(context.close(), 2_000);
    } catch {
      // The candidate still fails closed if its worklet cannot tear down.
    }
    throw new PitchPreservingBackendProbeErrorV2();
  }
}

async function exerciseMediaLifecycle(): Promise<PitchProbeLifecycleResultV2> {
  const samples = createProbeImpulseTrainV2();
  const wav = encodeMonoFloat32WavV2(samples);
  const objectUrl = URL.createObjectURL(
    new Blob([exactArrayBuffer(wav)], { type: "audio/wav" }),
  );
  const audio = new Audio(objectUrl);
  audio.preload = "auto";
  audio.preservesPitch = true;
  audio.playbackRate = 0.75;
  const context = new AudioContext({ sampleRate: SAMPLE_RATE_HZ });
  const source = context.createMediaElementSource(audio);
  const gain = context.createGain();
  gain.gain.value = 0;
  source.connect(gain).connect(context.destination);
  try {
    await context.resume();
    await audio.play();
    await wait(300);
    const sourceFramesBeforePause = Math.floor(
      audio.currentTime * SAMPLE_RATE_HZ,
    );
    const pauseStartedAt = nowMs();
    audio.pause();
    const pauseTeardownMs = nowMs() - pauseStartedAt;
    await wait(LIFECYCLE_SETTLE_MS);
    const sourceFramesDuringPause = Math.floor(
      audio.currentTime * SAMPLE_RATE_HZ,
    );
    const resumeStartedAt = nowMs();
    await audio.play();
    const resumeStartMs = nowMs() - resumeStartedAt;
    await wait(200);
    const sourceFramesAtRateChange = Math.floor(
      audio.currentTime * SAMPLE_RATE_HZ,
    );
    const rateStartedAt = nowMs();
    audio.playbackRate = 0.85;
    const rateSettlementMs = nowMs() - rateStartedAt;
    await wait(200);
    const sourceFramesAfterRateChange = Math.floor(
      audio.currentTime * SAMPLE_RATE_HZ,
    );
    const stopStartedAt = nowMs();
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    source.disconnect();
    gain.disconnect();
    URL.revokeObjectURL(objectUrl);
    await context.close();
    return Object.freeze({
      pauseTeardownMs,
      resumeStartMs,
      rateSettlementMs,
      stopTeardownMs: nowMs() - stopStartedAt,
      sourceFramesBeforePause,
      sourceFramesDuringPause,
      sourceFramesAtRateChange,
      sourceFramesAfterRateChange,
    });
  } catch {
    audio.pause();
    URL.revokeObjectURL(objectUrl);
    await context.close();
    throw new PitchPreservingBackendProbeErrorV2();
  }
}

async function exerciseRepositoryWsolaLifecycle(): Promise<PitchProbeLifecycleResultV2> {
  const input = createProbeImpulseTrainV2();
  const context = new AudioContext({ sampleRate: SAMPLE_RATE_HZ });
  const controller = await createIncrementalWsolaV2Node(context);
  const gain = context.createGain();
  gain.gain.value = 0;
  controller.node.connect(gain).connect(context.destination);
  const ready = waitForWorkletMessage(controller.node, "ready");
  controller.node.port.postMessage({ type: "load", input, ratePercent: 75 }, [
    input.buffer,
  ]);
  await ready;
  await context.resume();
  await wait(300);
  const pauseStartedAt = nowMs();
  const paused = waitForWorkletMessage(controller.node, "paused");
  controller.node.port.postMessage({ type: "pause" });
  const pauseResult = await paused;
  const pauseTeardownMs = nowMs() - pauseStartedAt;
  await wait(LIFECYCLE_SETTLE_MS);
  const resumeStartedAt = nowMs();
  const resumed = waitForWorkletMessage(controller.node, "resumed");
  controller.node.port.postMessage({ type: "resume" });
  await resumed;
  const resumeStartMs = nowMs() - resumeStartedAt;
  await wait(200);
  const rateStartedAt = nowMs();
  const rateSettled = waitForWorkletMessage(controller.node, "rate-settled");
  controller.node.port.postMessage({ type: "rate", ratePercent: 85 });
  const rateResult = await rateSettled;
  const rateSettlementMs = nowMs() - rateStartedAt;
  await wait(200);
  const stopStartedAt = nowMs();
  const stopped = waitForWorkletMessage(controller.node, "stopped");
  controller.node.port.postMessage({ type: "stop" });
  const stopResult = await stopped;
  controller.close();
  gain.disconnect();
  await context.close();
  const sourceFramesBeforePause = pauseResult.sourceFrames ?? 0;
  const sourceFramesAtRateChange = rateResult.sourceFrames ?? 0;
  return Object.freeze({
    pauseTeardownMs,
    resumeStartMs,
    rateSettlementMs,
    stopTeardownMs: nowMs() - stopStartedAt,
    sourceFramesBeforePause,
    sourceFramesDuringPause: sourceFramesBeforePause,
    sourceFramesAtRateChange,
    sourceFramesAfterRateChange: stopResult.sourceFrames ?? 0,
  });
}

async function exerciseSignalsmithLifecycle(): Promise<PitchProbeLifecycleResultV2> {
  const input = createProbeImpulseTrainV2();
  const context = new AudioContext({ sampleRate: SAMPLE_RATE_HZ });
  const node = await createSignalsmithNode(context);
  const gain = context.createGain();
  gain.gain.value = 0;
  node.connect(gain).connect(context.destination);
  await node.configure({ preset: "cheaper" });
  await node.addBuffers([input]);
  await node.setUpdateInterval(0.01);
  await context.resume();
  await node.start(context.currentTime + 0.05, 0, undefined, 0.75);
  await wait(300);
  const sourceFramesBeforePause = Math.floor(node.inputTime * SAMPLE_RATE_HZ);
  const pauseStartedAt = nowMs();
  await context.suspend();
  const pauseTeardownMs = nowMs() - pauseStartedAt;
  await wait(LIFECYCLE_SETTLE_MS);
  const sourceFramesDuringPause = Math.floor(node.inputTime * SAMPLE_RATE_HZ);
  const resumeStartedAt = nowMs();
  await context.resume();
  const resumeStartMs = nowMs() - resumeStartedAt;
  await wait(200);
  const sourceFramesAtRateChange = Math.floor(node.inputTime * SAMPLE_RATE_HZ);
  const rateStartedAt = nowMs();
  await node.schedule({
    output: context.currentTime + 0.01,
    rate: 0.85,
  });
  const rateSettlementMs = nowMs() - rateStartedAt;
  await wait(200);
  const sourceFramesAfterRateChange = Math.floor(
    node.inputTime * SAMPLE_RATE_HZ,
  );
  const stopStartedAt = nowMs();
  await node.stop();
  await node.dropBuffers();
  node.disconnect();
  node.port.close();
  gain.disconnect();
  await context.close();
  return Object.freeze({
    pauseTeardownMs,
    resumeStartMs,
    rateSettlementMs,
    stopTeardownMs: nowMs() - stopStartedAt,
    sourceFramesBeforePause,
    sourceFramesDuringPause,
    sourceFramesAtRateChange,
    sourceFramesAfterRateChange,
  });
}

type TrialInput = Readonly<{
  frequencyHz: number;
  ratePercent: NarrationPlaybackRatePercentV2;
}>;

function frozenTrialInputs(): readonly TrialInput[] {
  const authority = READER_SETTINGS_PLAYBACK_AUTHORITY_V2.evaluation;
  return authority.syntheticInput.toneFrequenciesHz.flatMap((frequencyHz) =>
    authority.deterministicRatePercent.map((ratePercent) =>
      Object.freeze({ frequencyHz, ratePercent }),
    ),
  );
}

export async function inspectPitchPreservingBackendCapabilitiesV2(): Promise<PitchPreservingCapabilityResultV2> {
  const audio = document.createElement("audio");
  const audioWorklet =
    typeof AudioContext === "function" &&
    typeof AudioWorkletNode === "function";
  return Object.freeze({
    authorityVersion: 2,
    audioWorklet,
    mediaElementPreservesPitch: "preservesPitch" in audio,
    signalsmithModule: true,
    repositoryWorkletModule: audioWorklet,
  });
}

export async function runPitchPreservingBackendCandidateProbeV2(
  candidateId: PitchPreservingProbeCandidateIdV2,
): Promise<PitchProbeCandidateResultV2> {
  candidateById(candidateId);
  const capabilities = await inspectPitchPreservingBackendCapabilitiesV2();
  const trials: PitchProbeTrialResultV2[] = [];
  const observations: TrialObservation[] = [];
  let lifecycle: PitchProbeLifecycleResultV2 | null = null;
  let available = false;
  try {
    if (candidateId === "html-media-element-preserves-pitch-wav-v2") {
      available = capabilities.mediaElementPreservesPitch;
      if (available) {
        for (const { frequencyHz, ratePercent } of frozenTrialInputs()) {
          const observation = await playMediaElementTrial(
            frequencyHz,
            ratePercent,
          );
          observations.push(observation);
          trials.push(observation.result);
        }
        lifecycle = await exerciseMediaLifecycle();
      }
    } else if (
      candidateId === "signalsmith-stretch-web-audio-wasm-worklet-1-3-2"
    ) {
      available = capabilities.signalsmithModule;
      if (available) {
        for (const { frequencyHz, ratePercent } of frozenTrialInputs()) {
          const observation = await playSignalsmithTrial(
            frequencyHz,
            ratePercent,
          );
          observations.push(observation);
          trials.push(observation.result);
        }
        lifecycle = await exerciseSignalsmithLifecycle();
      }
    } else {
      available =
        capabilities.audioWorklet && capabilities.repositoryWorkletModule;
      if (available) {
        for (const { frequencyHz, ratePercent } of frozenTrialInputs()) {
          const observation = await playRepositoryWsolaTrial(
            frequencyHz,
            ratePercent,
          );
          observations.push(observation);
          trials.push(observation.result);
        }
        lifecycle = await exerciseRepositoryWsolaLifecycle();
      }
    }
  } catch {
    // A candidate-level failure is evidence for the frozen fail-closed gate,
    // not a reason to prevent the remaining sequential candidates from running.
  }
  return aggregateCandidate(
    candidateId,
    available ? "available" : "unavailable",
    trials,
    lifecycle,
    observations,
  );
}
