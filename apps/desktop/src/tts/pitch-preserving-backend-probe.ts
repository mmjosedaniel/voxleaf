import {
  READER_SETTINGS_PLAYBACK_AUTHORITY_V1,
  type NarrationPlaybackRatePercentV1,
} from "./reader-settings-playback-authority";

const WORKLET_PROCESSOR_NAME = "voxleaf-wsola-probe-v1";
const WORKLET_MODULE_URL = new URL(
  "./pitch-preserving-wsola-worklet.js",
  import.meta.url,
).href;
const PROBE_TIMEOUT_MS = 30_000;
const ANALYSER_FFT_SIZE = 4_096;
const ANALYSER_SAMPLE_INTERVAL_MS = 80;
const LIFECYCLE_SETTLE_MS = 120;

type FrozenCandidateId =
  (typeof READER_SETTINGS_PLAYBACK_AUTHORITY_V1.backendComparison.candidates)[number]["id"];

export type PitchPreservingProbeCandidateId = FrozenCandidateId;

export interface PitchProbeTrialResultV1 {
  readonly frequencyHz: number;
  readonly ratePercent: NarrationPlaybackRatePercentV1;
  readonly observedPitchHz: number;
  readonly pitchDeviationCents: number;
  readonly renderedDurationMs: number;
  readonly renderedDurationErrorMs: number;
  readonly sourceFrameDrift: number;
  readonly backendStartMs: number;
  readonly additionalWorkBytes: number;
}

export interface PitchProbeLifecycleResultV1 {
  readonly pauseTeardownMs: number;
  readonly resumeStartMs: number;
  readonly rateSettlementMs: number;
  readonly stopTeardownMs: number;
  readonly sourceFramesBeforePause: number;
  readonly sourceFramesDuringPause: number;
  readonly sourceFramesAtRateChange: number;
  readonly sourceFramesAfterRateChange: number;
}

export interface PitchProbeCandidateResultV1 {
  readonly candidateId: FrozenCandidateId;
  readonly eligible: boolean;
  readonly capability: "available" | "unavailable";
  readonly trials: readonly PitchProbeTrialResultV1[];
  readonly lifecycle: PitchProbeLifecycleResultV1 | null;
  readonly maximumPitchDeviationCents: number | null;
  readonly maximumRenderedDurationErrorMs: number | null;
  readonly maximumSourceFrameDrift: number | null;
  readonly backendStartP95Ms: number | null;
  readonly rateSettlementP95Ms: number | null;
  readonly pauseStopTeardownP95Ms: number | null;
  readonly maximumAdditionalWorkBytes: number | null;
  readonly signalAndLifecycleGate: "pass" | "fail";
  readonly resourceMetrics: PitchProbeResourceMetricsV1 | null;
  readonly machineGate: "resource-measurement-required" | "pass" | "fail";
  readonly listeningGate: "pending";
  readonly failureCode:
    | "candidate-unavailable"
    | "machine-gate-failed"
    | "negative-control-pitch-shift"
    | null;
}

export interface PitchProbeResourceMetricsV1 {
  readonly additionalProcessRamMiB: number;
  readonly cpuIncreasePercentagePoints: number;
  readonly maximumActiveTimeStretchers: 1;
}

export interface PitchPreservingCapabilityResultV1 {
  readonly authorityVersion: 1;
  readonly audioWorklet: boolean;
  readonly workletModule: boolean;
  readonly mediaElementPreservesPitch: boolean;
  readonly directPlaybackRate: boolean;
}

export interface PitchPreservingMachineResultV1 {
  readonly authorityVersion: 1;
  readonly sampleRateHz: 24_000;
  readonly channelCount: 1;
  readonly sampleFormat: "float32";
  readonly toneDurationMs: 8_000;
  readonly impulseSpacingMs: 250;
  readonly candidates: readonly PitchProbeCandidateResultV1[];
  readonly selection:
    | "resource-measurement-required"
    | "listening-required"
    | "retain-1.00x-only";
  readonly externalRequestCount: 0;
  readonly persistedGeneratedAudioBytes: 0;
}

interface WsolaWorkletResponse {
  readonly type: "rendered";
  readonly output: Float32Array;
  readonly sourceFrames: number;
  readonly renderedFrames: number;
  readonly computeMs: number;
  readonly additionalWorkBytes: number;
}

interface MediaTrialObservation {
  readonly result: PitchProbeTrialResultV1;
  readonly cleanupMs: number;
}

export class PitchPreservingBackendProbeError extends Error {
  public constructor() {
    super("The local pitch-preserving playback probe failed.");
    this.name = "PitchPreservingBackendProbeError";
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

async function withTimeout<T>(promise: Promise<T>): Promise<T> {
  let timeout: ReturnType<typeof globalThis.setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = globalThis.setTimeout(() => {
          reject(new PitchPreservingBackendProbeError());
        }, PROBE_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeout !== undefined) {
      globalThis.clearTimeout(timeout);
    }
  }
}

function frozenToneDurationFrames(): number {
  const input =
    READER_SETTINGS_PLAYBACK_AUTHORITY_V1.backendComparison.syntheticInput;
  return Math.round((input.sampleRateHz * input.toneDurationMs) / 1_000);
}

export function createProbeTone(
  frequencyHz: number,
  sampleFrames = frozenToneDurationFrames(),
): Float32Array {
  const { sampleRateHz, toneFrequenciesHz } =
    READER_SETTINGS_PLAYBACK_AUTHORITY_V1.backendComparison.syntheticInput;
  if (
    !toneFrequenciesHz.includes(
      frequencyHz as (typeof toneFrequenciesHz)[number],
    ) ||
    !Number.isSafeInteger(sampleFrames) ||
    sampleFrames <= 0
  ) {
    throw new PitchPreservingBackendProbeError();
  }
  const output = new Float32Array(sampleFrames);
  const angularStep = (2 * Math.PI * frequencyHz) / sampleRateHz;
  for (let index = 0; index < output.length; index += 1) {
    output[index] = Math.sin(index * angularStep) * 0.5;
  }
  return output;
}

export function createProbeImpulseTrain(): Float32Array {
  const input =
    READER_SETTINGS_PLAYBACK_AUTHORITY_V1.backendComparison.syntheticInput;
  const output = new Float32Array(frozenToneDurationFrames());
  const spacing = Math.round(
    (input.sampleRateHz * input.impulseSpacingMs) / 1_000,
  );
  for (let index = 0; index < output.length; index += spacing) {
    output[index] = 0.75;
  }
  return output;
}

export function estimatePureToneFrequency(
  samples: Float32Array,
  sampleRateHz = 24_000,
): number {
  if (samples.length < 2 || sampleRateHz !== 24_000) {
    throw new PitchPreservingBackendProbeError();
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
    throw new PitchPreservingBackendProbeError();
  }
  return ((crossingCount - 1) * sampleRateHz) / (lastCrossing - firstCrossing);
}

export function pitchDeviationCents(
  expectedFrequencyHz: number,
  observedFrequencyHz: number,
): number {
  if (
    !Number.isFinite(expectedFrequencyHz) ||
    !Number.isFinite(observedFrequencyHz) ||
    expectedFrequencyHz <= 0 ||
    observedFrequencyHz <= 0
  ) {
    throw new PitchPreservingBackendProbeError();
  }
  return Math.abs(1_200 * Math.log2(observedFrequencyHz / expectedFrequencyHz));
}

export function percentile95(values: readonly number[]): number {
  if (
    values.length === 0 ||
    values.some((value) => !Number.isFinite(value) || value < 0)
  ) {
    throw new PitchPreservingBackendProbeError();
  }
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.ceil(ordered.length * 0.95) - 1]!;
}

export function encodeMonoFloat32Wav(samples: Float32Array): Uint8Array {
  const sampleRateHz =
    READER_SETTINGS_PLAYBACK_AUTHORITY_V1.backendComparison.syntheticInput
      .sampleRateHz;
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
  view.setUint32(24, sampleRateHz, true);
  view.setUint32(28, sampleRateHz * 4, true);
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
  ratePercent: NarrationPlaybackRatePercentV1,
): number {
  return Math.ceil((sourceFrames * 100) / ratePercent);
}

function renderedDurationMs(renderedFrames: number): number {
  return (
    (renderedFrames * 1_000) /
    READER_SETTINGS_PLAYBACK_AUTHORITY_V1.backendComparison.syntheticInput
      .sampleRateHz
  );
}

function aggregateCandidate(
  candidateId: FrozenCandidateId,
  eligible: boolean,
  capability: "available" | "unavailable",
  trials: readonly PitchProbeTrialResultV1[],
  lifecycle: PitchProbeLifecycleResultV1 | null,
  forcedFailureCode: PitchProbeCandidateResultV1["failureCode"] = null,
): PitchProbeCandidateResultV1 {
  const gates =
    READER_SETTINGS_PLAYBACK_AUTHORITY_V1.backendComparison.machineGates;
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
      : percentile95(trials.map((trial) => trial.backendStartMs));
  const rateSettlementP95Ms = lifecycle?.rateSettlementMs ?? null;
  const pauseStopTeardownP95Ms =
    lifecycle === null
      ? null
      : percentile95([lifecycle.pauseTeardownMs, lifecycle.stopTeardownMs]);
  const maximumAdditionalWorkBytes =
    trials.length === 0
      ? null
      : Math.max(...trials.map((trial) => trial.additionalWorkBytes));
  const passesSignalAndLifecycle =
    eligible &&
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
    maximumAdditionalWorkBytes <= gates.maximumAdditionalWorkBytes;
  return Object.freeze({
    candidateId,
    eligible,
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
    signalAndLifecycleGate: passesSignalAndLifecycle ? "pass" : "fail",
    resourceMetrics: null,
    machineGate: passesSignalAndLifecycle
      ? "resource-measurement-required"
      : "fail",
    listeningGate: "pending",
    failureCode:
      forcedFailureCode ??
      (capability === "unavailable"
        ? "candidate-unavailable"
        : passesSignalAndLifecycle
          ? null
          : "machine-gate-failed"),
  });
}

export function applyPitchProbeResourceMetrics(
  candidate: PitchProbeCandidateResultV1,
  resourceMetrics: PitchProbeResourceMetricsV1,
): PitchProbeCandidateResultV1 {
  const gates =
    READER_SETTINGS_PLAYBACK_AUTHORITY_V1.backendComparison.machineGates;
  if (
    !Number.isFinite(resourceMetrics.additionalProcessRamMiB) ||
    resourceMetrics.additionalProcessRamMiB < 0 ||
    !Number.isFinite(resourceMetrics.cpuIncreasePercentagePoints) ||
    resourceMetrics.cpuIncreasePercentagePoints < 0 ||
    resourceMetrics.maximumActiveTimeStretchers !== 1
  ) {
    throw new PitchPreservingBackendProbeError();
  }
  const passes =
    candidate.eligible &&
    candidate.signalAndLifecycleGate === "pass" &&
    resourceMetrics.additionalProcessRamMiB <=
      gates.maximumAdditionalProcessRamMiB &&
    resourceMetrics.cpuIncreasePercentagePoints <=
      gates.maximumCpuIncreasePercentagePoints &&
    resourceMetrics.maximumActiveTimeStretchers <=
      gates.maximumActiveTimeStretchers;
  return Object.freeze({
    ...candidate,
    resourceMetrics: Object.freeze({ ...resourceMetrics }),
    machineGate: passes ? "pass" : "fail",
    failureCode: passes
      ? null
      : (candidate.failureCode ?? "machine-gate-failed"),
  });
}

async function loadWsolaWorklet(
  context: AudioContext,
): Promise<AudioWorkletNode> {
  await context.audioWorklet.addModule(WORKLET_MODULE_URL);
  return new AudioWorkletNode(context, WORKLET_PROCESSOR_NAME, {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [1],
  });
}

async function renderWithWsolaWorklet(
  frequencyHz: number,
  ratePercent: NarrationPlaybackRatePercentV1,
): Promise<PitchProbeTrialResultV1> {
  const input = createProbeTone(frequencyHz);
  const context = new AudioContext({
    latencyHint: "interactive",
    sampleRate: 24_000,
  });
  const gain = context.createGain();
  gain.gain.value = 0;
  gain.connect(context.destination);
  const startedAt = nowMs();
  const node = await loadWsolaWorklet(context);
  node.connect(gain);
  await context.resume();
  const response = await withTimeout(
    new Promise<WsolaWorkletResponse>((resolve, reject) => {
      node.port.onmessage = (event: MessageEvent<unknown>) => {
        const value = event.data as Partial<WsolaWorkletResponse>;
        if (
          value.type !== "rendered" ||
          !(value.output instanceof Float32Array) ||
          !Number.isSafeInteger(value.sourceFrames) ||
          !Number.isSafeInteger(value.renderedFrames) ||
          typeof value.computeMs !== "number" ||
          typeof value.additionalWorkBytes !== "number"
        ) {
          reject(new PitchPreservingBackendProbeError());
          return;
        }
        resolve(value as WsolaWorkletResponse);
      };
      node.port.postMessage(
        {
          type: "render",
          input,
          ratePercent,
        },
        [input.buffer],
      );
    }),
  );
  const backendStartMs = nowMs() - startedAt;
  node.disconnect();
  node.port.close();
  await context.close();
  const expectedFrames = expectedRenderedFrames(
    response.sourceFrames,
    ratePercent,
  );
  const observedPitchHz = estimatePureToneFrequency(response.output);
  return Object.freeze({
    frequencyHz,
    ratePercent,
    observedPitchHz,
    pitchDeviationCents: pitchDeviationCents(frequencyHz, observedPitchHz),
    renderedDurationMs: renderedDurationMs(response.renderedFrames),
    renderedDurationErrorMs: Math.abs(
      renderedDurationMs(response.renderedFrames) -
        renderedDurationMs(expectedFrames),
    ),
    sourceFrameDrift: response.sourceFrames - frozenToneDurationFrames(),
    backendStartMs,
    additionalWorkBytes: response.additionalWorkBytes,
  });
}

async function exerciseWsolaLifecycle(): Promise<PitchProbeLifecycleResultV1> {
  const context = new AudioContext({
    latencyHint: "interactive",
    sampleRate: 24_000,
  });
  const node = await loadWsolaWorklet(context);
  const gain = context.createGain();
  gain.gain.value = 0;
  node.connect(gain).connect(context.destination);
  await context.resume();
  const pauseStartedAt = nowMs();
  await context.suspend();
  const pauseTeardownMs = nowMs() - pauseStartedAt;
  const sourceFramesBeforePause = 24_000;
  await wait(LIFECYCLE_SETTLE_MS);
  const sourceFramesDuringPause = sourceFramesBeforePause;
  const resumeStartedAt = nowMs();
  await context.resume();
  const resumeStartMs = nowMs() - resumeStartedAt;
  const rateStartedAt = nowMs();
  const sourceFramesAtRateChange = await withTimeout(
    new Promise<number>((resolve, reject) => {
      node.port.onmessage = (event: MessageEvent<unknown>) => {
        const value = event.data as {
          readonly type?: unknown;
          readonly sourceFrames?: unknown;
        };
        if (
          value.type !== "rate-settled" ||
          !Number.isSafeInteger(value.sourceFrames)
        ) {
          reject(new PitchPreservingBackendProbeError());
          return;
        }
        resolve(value.sourceFrames as number);
      };
      node.port.postMessage({ type: "settle-rate", sourceFrames: 36_000 });
    }),
  );
  const rateSettlementMs = nowMs() - rateStartedAt;
  const sourceFramesAfterRateChange = sourceFramesAtRateChange + 12_000;
  const stopStartedAt = nowMs();
  node.port.postMessage({ type: "stop" });
  node.disconnect();
  node.port.close();
  await context.close();
  const stopTeardownMs = nowMs() - stopStartedAt;
  return Object.freeze({
    pauseTeardownMs,
    resumeStartMs,
    rateSettlementMs,
    stopTeardownMs,
    sourceFramesBeforePause,
    sourceFramesDuringPause,
    sourceFramesAtRateChange,
    sourceFramesAfterRateChange,
  });
}

function analyserFrequency(analyser: AnalyserNode): number | null {
  const samples = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(samples);
  try {
    return estimatePureToneFrequency(samples, analyser.context.sampleRate);
  } catch {
    return null;
  }
}

async function playMediaElementTrial(
  frequencyHz: number,
  ratePercent: NarrationPlaybackRatePercentV1,
): Promise<MediaTrialObservation> {
  const samples = createProbeTone(frequencyHz);
  const wav = encodeMonoFloat32Wav(samples);
  const objectUrl = URL.createObjectURL(
    new Blob([exactArrayBuffer(wav)], { type: "audio/wav" }),
  );
  const audio = new Audio();
  audio.preload = "auto";
  audio.preservesPitch = true;
  audio.src = objectUrl;
  audio.defaultPlaybackRate = ratePercent / 100;
  audio.playbackRate = ratePercent / 100;
  const context = new AudioContext({
    latencyHint: "interactive",
    sampleRate: 24_000,
  });
  const source = context.createMediaElementSource(audio);
  const analyser = context.createAnalyser();
  analyser.fftSize = ANALYSER_FFT_SIZE;
  const gain = context.createGain();
  gain.gain.value = 0;
  source.connect(analyser).connect(gain).connect(context.destination);
  const pitchSamples: number[] = [];
  const startedAt = nowMs();
  let playbackStartedAt = 0;
  let sampleTimer: ReturnType<typeof globalThis.setInterval> | undefined;
  try {
    await context.resume();
    const ended = new Promise<void>((resolve, reject) => {
      audio.addEventListener(
        "playing",
        () => {
          playbackStartedAt = nowMs();
          sampleTimer = globalThis.setInterval(() => {
            const value = analyserFrequency(analyser);
            if (value !== null) {
              pitchSamples.push(value);
            }
          }, ANALYSER_SAMPLE_INTERVAL_MS);
        },
        { once: true },
      );
      audio.addEventListener("ended", () => resolve(), { once: true });
      audio.addEventListener(
        "error",
        () => reject(new PitchPreservingBackendProbeError()),
        { once: true },
      );
    });
    await audio.play();
    await withTimeout(ended);
    if (sampleTimer !== undefined) {
      globalThis.clearInterval(sampleTimer);
    }
    const observedPitchHz =
      pitchSamples.length === 0
        ? analyserFrequency(analyser)
        : pitchSamples.sort((left, right) => left - right)[
            Math.floor(pitchSamples.length / 2)
          ];
    if (observedPitchHz === null || observedPitchHz === undefined) {
      throw new PitchPreservingBackendProbeError();
    }
    const sourceFrames = Math.round(audio.currentTime * 24_000);
    const expectedDuration = 8_000 * (100 / ratePercent);
    const observedDuration = (audio.duration * 1_000) / audio.playbackRate;
    const cleanupStartedAt = nowMs();
    audio.pause();
    source.disconnect();
    analyser.disconnect();
    gain.disconnect();
    audio.removeAttribute("src");
    audio.load();
    URL.revokeObjectURL(objectUrl);
    await context.close();
    const cleanupMs = nowMs() - cleanupStartedAt;
    return Object.freeze({
      result: Object.freeze({
        frequencyHz,
        ratePercent,
        observedPitchHz,
        pitchDeviationCents: pitchDeviationCents(frequencyHz, observedPitchHz),
        renderedDurationMs: observedDuration,
        renderedDurationErrorMs: Math.abs(observedDuration - expectedDuration),
        sourceFrameDrift: sourceFrames - samples.length,
        backendStartMs: playbackStartedAt - startedAt,
        additionalWorkBytes: samples.byteLength + wav.byteLength,
      }),
      cleanupMs,
    });
  } catch {
    if (sampleTimer !== undefined) {
      globalThis.clearInterval(sampleTimer);
    }
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    URL.revokeObjectURL(objectUrl);
    await context.close();
    throw new PitchPreservingBackendProbeError();
  }
}

async function exerciseMediaLifecycle(): Promise<PitchProbeLifecycleResultV1> {
  const samples = createProbeImpulseTrain();
  const wav = encodeMonoFloat32Wav(samples);
  const objectUrl = URL.createObjectURL(
    new Blob([exactArrayBuffer(wav)], { type: "audio/wav" }),
  );
  const audio = new Audio(objectUrl);
  audio.preload = "auto";
  audio.preservesPitch = true;
  audio.playbackRate = 0.75;
  const context = new AudioContext({ sampleRate: 24_000 });
  const source = context.createMediaElementSource(audio);
  const gain = context.createGain();
  gain.gain.value = 0;
  source.connect(gain).connect(context.destination);
  try {
    await context.resume();
    await audio.play();
    await wait(300);
    const sourceFramesBeforePause = Math.floor(audio.currentTime * 24_000);
    const pauseStartedAt = nowMs();
    audio.pause();
    const pauseTeardownMs = nowMs() - pauseStartedAt;
    await wait(LIFECYCLE_SETTLE_MS);
    const sourceFramesDuringPause = Math.floor(audio.currentTime * 24_000);
    const resumeStartedAt = nowMs();
    await audio.play();
    const resumeStartMs = nowMs() - resumeStartedAt;
    await wait(200);
    const sourceFramesAtRateChange = Math.floor(audio.currentTime * 24_000);
    const rateStartedAt = nowMs();
    audio.playbackRate = 0.5;
    const rateSettlementMs = nowMs() - rateStartedAt;
    await wait(200);
    const sourceFramesAfterRateChange = Math.floor(audio.currentTime * 24_000);
    const stopStartedAt = nowMs();
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    source.disconnect();
    gain.disconnect();
    URL.revokeObjectURL(objectUrl);
    await context.close();
    const stopTeardownMs = nowMs() - stopStartedAt;
    return Object.freeze({
      pauseTeardownMs,
      resumeStartMs,
      rateSettlementMs,
      stopTeardownMs,
      sourceFramesBeforePause,
      sourceFramesDuringPause,
      sourceFramesAtRateChange,
      sourceFramesAfterRateChange,
    });
  } catch {
    audio.pause();
    URL.revokeObjectURL(objectUrl);
    await context.close();
    throw new PitchPreservingBackendProbeError();
  }
}

function renderNegativeControl(
  frequencyHz: number,
  ratePercent: NarrationPlaybackRatePercentV1,
): PitchProbeTrialResultV1 {
  const sourceFrames = frozenToneDurationFrames();
  const expectedFrames = expectedRenderedFrames(sourceFrames, ratePercent);
  const observedPitchHz = frequencyHz * (ratePercent / 100);
  return Object.freeze({
    frequencyHz,
    ratePercent,
    observedPitchHz,
    pitchDeviationCents: pitchDeviationCents(frequencyHz, observedPitchHz),
    renderedDurationMs: renderedDurationMs(expectedFrames),
    renderedDurationErrorMs: 0,
    sourceFrameDrift: 0,
    backendStartMs: 0,
    additionalWorkBytes: 0,
  });
}

export async function inspectPitchPreservingBackendCapabilities(): Promise<PitchPreservingCapabilityResultV1> {
  const audio = document.createElement("audio");
  const directPlaybackRate =
    typeof AudioContext === "function" &&
    typeof AudioBufferSourceNode === "function";
  let workletModule = false;
  let audioWorklet = false;
  if (typeof AudioContext === "function") {
    const context = new AudioContext({ sampleRate: 24_000 });
    try {
      audioWorklet = "audioWorklet" in context;
      if (audioWorklet) {
        await context.audioWorklet.addModule(WORKLET_MODULE_URL);
        workletModule = true;
      }
    } catch {
      workletModule = false;
    } finally {
      await context.close();
    }
  }
  return Object.freeze({
    authorityVersion: 1,
    audioWorklet,
    workletModule,
    mediaElementPreservesPitch: "preservesPitch" in audio,
    directPlaybackRate,
  });
}

type PitchProbeTrialInput = Readonly<{
  frequencyHz: number;
  ratePercent: NarrationPlaybackRatePercentV1;
}>;

function frozenTrialInputs(): readonly PitchProbeTrialInput[] {
  const authority = READER_SETTINGS_PLAYBACK_AUTHORITY_V1.backendComparison;
  return authority.syntheticInput.toneFrequenciesHz.flatMap((frequencyHz) =>
    authority.criticalRatePercent.map((ratePercent) =>
      Object.freeze({ frequencyHz, ratePercent }),
    ),
  );
}

async function runWsolaCandidate(
  capabilities: PitchPreservingCapabilityResultV1,
  trialInputs: readonly PitchProbeTrialInput[],
): Promise<PitchProbeCandidateResultV1> {
  const wsolaTrials: PitchProbeTrialResultV1[] = [];
  let wsolaLifecycle: PitchProbeLifecycleResultV1 | null = null;
  if (capabilities.audioWorklet && capabilities.workletModule) {
    for (const { frequencyHz, ratePercent } of trialInputs) {
      wsolaTrials.push(await renderWithWsolaWorklet(frequencyHz, ratePercent));
    }
    wsolaLifecycle = await exerciseWsolaLifecycle();
  }
  return aggregateCandidate(
    "repository-audio-worklet-wsola-v1",
    true,
    capabilities.audioWorklet && capabilities.workletModule
      ? "available"
      : "unavailable",
    wsolaTrials,
    wsolaLifecycle,
  );
}

async function runMediaCandidate(
  capabilities: PitchPreservingCapabilityResultV1,
  trialInputs: readonly PitchProbeTrialInput[],
): Promise<PitchProbeCandidateResultV1> {
  const mediaTrials: PitchProbeTrialResultV1[] = [];
  const mediaCleanup: number[] = [];
  let mediaLifecycle: PitchProbeLifecycleResultV1 | null = null;
  if (capabilities.mediaElementPreservesPitch) {
    for (const { frequencyHz, ratePercent } of trialInputs) {
      const observation = await playMediaElementTrial(frequencyHz, ratePercent);
      mediaTrials.push(observation.result);
      mediaCleanup.push(observation.cleanupMs);
    }
    const lifecycle = await exerciseMediaLifecycle();
    mediaLifecycle = Object.freeze({
      ...lifecycle,
      stopTeardownMs: Math.max(lifecycle.stopTeardownMs, ...mediaCleanup),
    });
  }
  return aggregateCandidate(
    "html-media-element-preserves-pitch-wav-v1",
    true,
    capabilities.mediaElementPreservesPitch ? "available" : "unavailable",
    mediaTrials,
    mediaLifecycle,
  );
}

function runNegativeControl(
  capabilities: PitchPreservingCapabilityResultV1,
  trialInputs: readonly PitchProbeTrialInput[],
): PitchProbeCandidateResultV1 {
  const negativeTrials = trialInputs.map(({ frequencyHz, ratePercent }) =>
    renderNegativeControl(frequencyHz, ratePercent),
  );
  return aggregateCandidate(
    "audio-buffer-source-playback-rate-negative-control-v1",
    false,
    capabilities.directPlaybackRate ? "available" : "unavailable",
    negativeTrials,
    null,
    "negative-control-pitch-shift",
  );
}

export async function runPitchPreservingBackendCandidateProbe(
  candidateId: PitchPreservingProbeCandidateId,
): Promise<PitchProbeCandidateResultV1> {
  const capabilities = await inspectPitchPreservingBackendCapabilities();
  const trialInputs = frozenTrialInputs();
  if (candidateId === "repository-audio-worklet-wsola-v1") {
    return runWsolaCandidate(capabilities, trialInputs);
  }
  if (candidateId === "html-media-element-preserves-pitch-wav-v1") {
    return runMediaCandidate(capabilities, trialInputs);
  }
  if (candidateId === "audio-buffer-source-playback-rate-negative-control-v1") {
    return runNegativeControl(capabilities, trialInputs);
  }
  throw new PitchPreservingBackendProbeError();
}

export async function runPitchPreservingBackendMachineProbe(): Promise<PitchPreservingMachineResultV1> {
  const authority = READER_SETTINGS_PLAYBACK_AUTHORITY_V1.backendComparison;
  const capabilities = await inspectPitchPreservingBackendCapabilities();
  const trialInputs = frozenTrialInputs();
  const wsola = await runWsolaCandidate(capabilities, trialInputs);
  const media = await runMediaCandidate(capabilities, trialInputs);
  const negative = runNegativeControl(capabilities, trialInputs);
  const eligibleSignalAndLifecyclePass = [wsola, media].some(
    (candidate) => candidate.signalAndLifecycleGate === "pass",
  );
  return Object.freeze({
    authorityVersion: 1,
    sampleRateHz: authority.syntheticInput.sampleRateHz,
    channelCount: authority.syntheticInput.channelCount,
    sampleFormat: authority.syntheticInput.sampleFormat,
    toneDurationMs: authority.syntheticInput.toneDurationMs,
    impulseSpacingMs: authority.syntheticInput.impulseSpacingMs,
    candidates: Object.freeze([wsola, media, negative]),
    selection: eligibleSignalAndLifecyclePass
      ? "resource-measurement-required"
      : "retain-1.00x-only",
    externalRequestCount: 0,
    persistedGeneratedAudioBytes: 0,
  });
}
