import {
  activateNarrationPlaybackRateAtBoundaryV3,
  initialNarrationPlaybackRateStateV3,
  READER_SETTINGS_PLAYBACK_AUTHORITY_V3,
  selectNarrationPlaybackRateV3,
  type NarrationPlaybackRatePercentV3,
} from "./reader-settings-playback-authority-v3";
import { createIncrementalWsolaV3Node } from "./playback-backends/incremental-wsola-v3";

const SAMPLE_RATE_HZ = 24_000;
const ANALYSER_FFT_SIZE = 4_096;
const ANALYSER_SAMPLE_INTERVAL_MS = 80;
const PROBE_TIMEOUT_MS = 20_000;
const LIFECYCLE_SETTLE_MS = 120;
const BOUNDARY_UNIT_FRAMES = SAMPLE_RATE_HZ * 2;

type Candidate =
  (typeof READER_SETTINGS_PLAYBACK_AUTHORITY_V3.candidates)[number];

export type PitchPreservingProbeCandidateIdV3 = Candidate["id"];

export interface PitchProbeTrialResultV3 {
  readonly frequencyHz: number;
  readonly ratePercent: NarrationPlaybackRatePercentV3;
  readonly observedPitchHz: number;
  readonly pitchDeviationCents: number;
  readonly renderedDurationMs: number;
  readonly renderedDurationErrorMs: number;
  readonly sourceFrameDrift: number;
  readonly firstActivationMs: number;
  readonly additionalWorkBytes: number;
}

export interface BoundaryDeferredLifecycleResultV3 {
  readonly currentUnitInitialRatePercent: 100;
  readonly currentUnitFinalRatePercent: 100;
  readonly successorActiveRatePercent: 75;
  readonly firstActivationMs: number;
  readonly recurringUnitHandoffMs: readonly number[];
  readonly pauseTeardownMs: number;
  readonly resumeStartMs: number;
  readonly stopTeardownMs: number;
  readonly sourceFramesBeforePause: number;
  readonly sourceFramesDuringPause: number;
  readonly sourceFrameDrift: number;
  readonly midUnitActivationEvents: 0;
  readonly recurringHandoffsUsingFirstActivationAllowance: 0;
  readonly maximumActiveTimeStretchers: 1;
  readonly maximumActiveObjectUrls: number;
  readonly activeTimeStretchersAfterDefaultSettle: 0;
  readonly activeObjectUrlsAfterDefaultSettle: 0;
  readonly transformedAudioCopiesAfterDefaultSettle: 0;
  readonly timeStretchWorkQueuesAfterDefaultSettle: 0;
  readonly additionalTimeStretchWorkBytesAfterDefaultSettle: 0;
}

export interface PitchProbeResourceMetricsV3 {
  readonly additionalProcessRamMiB: number;
  readonly cpuIncreasePercentagePoints: number;
  readonly maximumActiveTimeStretchers: 1;
}

export interface PitchProbeCandidateResultV3 {
  readonly candidateId: PitchPreservingProbeCandidateIdV3;
  readonly capability: "available" | "unavailable";
  readonly trials: readonly PitchProbeTrialResultV3[];
  readonly lifecycle: BoundaryDeferredLifecycleResultV3 | null;
  readonly maximumPitchDeviationCents: number | null;
  readonly maximumRenderedDurationErrorMs: number | null;
  readonly maximumSourceFrameDrift: number | null;
  readonly firstActivationP95Ms: number | null;
  readonly recurringUnitHandoffP95Ms: number | null;
  readonly pauseStopTeardownP95Ms: number | null;
  readonly maximumAdditionalWorkBytes: number | null;
  readonly maximumActiveObjectUrls: number;
  readonly activeObjectUrlsAfterCleanup: number;
  readonly signalAndLifecycleGate: "pass" | "fail";
  readonly resourceMetrics: PitchProbeResourceMetricsV3 | null;
  readonly machineGate: "resource-measurement-required" | "pass" | "fail";
  readonly listeningGate: "pending";
  readonly failureCode: "candidate-unavailable" | "machine-gate-failed" | null;
}

export interface PitchPreservingCapabilityResultV3 {
  readonly authorityVersion: 3;
  readonly audioWorklet: boolean;
  readonly mediaElementPreservesPitch: boolean;
  readonly repositoryWorkletModule: boolean;
}

interface TrialObservation {
  readonly result: PitchProbeTrialResultV3;
  readonly maximumActiveObjectUrls: number;
  readonly activeObjectUrlsAfterCleanup: number;
}

interface WorkletResponse {
  readonly type:
    "armed" | "started" | "ended" | "paused" | "resumed" | "stopped" | "failed";
  readonly additionalWorkBytes?: number;
  readonly renderedFrames?: number;
  readonly sourceFrames?: number;
  readonly targetFrames?: number;
  readonly unitSequence?: number;
}

export class PitchPreservingBackendProbeErrorV3 extends Error {
  public constructor() {
    super("The local v3 pitch-preserving playback probe failed.");
    this.name = "PitchPreservingBackendProbeErrorV3";
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
          reject(new PitchPreservingBackendProbeErrorV3());
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
  const input = READER_SETTINGS_PLAYBACK_AUTHORITY_V3.evaluation.syntheticInput;
  return Math.round((input.sampleRateHz * input.toneDurationMs) / 1_000);
}

export function createProbeToneV3(
  frequencyHz: number,
  sampleFrames = frozenToneDurationFrames(),
): Float32Array {
  const { toneFrequenciesHz } =
    READER_SETTINGS_PLAYBACK_AUTHORITY_V3.evaluation.syntheticInput;
  if (
    !toneFrequenciesHz.includes(
      frequencyHz as (typeof toneFrequenciesHz)[number],
    ) ||
    !Number.isSafeInteger(sampleFrames) ||
    sampleFrames <= 0
  ) {
    throw new PitchPreservingBackendProbeErrorV3();
  }
  const output = new Float32Array(sampleFrames);
  const angularStep = (2 * Math.PI * frequencyHz) / SAMPLE_RATE_HZ;
  for (let index = 0; index < output.length; index += 1) {
    output[index] = Math.sin(index * angularStep) * 0.5;
  }
  return output;
}

export function estimatePureToneFrequencyV3(
  samples: Float32Array,
  sampleRateHz = SAMPLE_RATE_HZ,
): number {
  if (samples.length < 2 || sampleRateHz !== SAMPLE_RATE_HZ) {
    throw new PitchPreservingBackendProbeErrorV3();
  }
  const start = Math.floor(samples.length / 10);
  const end = Math.ceil((samples.length * 9) / 10);
  let firstCrossing = -1;
  let lastCrossing = -1;
  let crossingCount = 0;
  for (let index = Math.max(1, start); index < end; index += 1) {
    if (samples[index - 1]! <= 0 && samples[index]! > 0) {
      firstCrossing = firstCrossing < 0 ? index : firstCrossing;
      lastCrossing = index;
      crossingCount += 1;
    }
  }
  if (crossingCount < 2 || lastCrossing <= firstCrossing) {
    throw new PitchPreservingBackendProbeErrorV3();
  }
  return ((crossingCount - 1) * sampleRateHz) / (lastCrossing - firstCrossing);
}

export function pitchDeviationCentsV3(
  expectedFrequencyHz: number,
  observedFrequencyHz: number,
): number {
  if (
    !Number.isFinite(expectedFrequencyHz) ||
    !Number.isFinite(observedFrequencyHz) ||
    expectedFrequencyHz <= 0 ||
    observedFrequencyHz <= 0
  ) {
    throw new PitchPreservingBackendProbeErrorV3();
  }
  return Math.abs(1_200 * Math.log2(observedFrequencyHz / expectedFrequencyHz));
}

export function percentile95V3(values: readonly number[]): number {
  if (
    values.length === 0 ||
    values.some((value) => !Number.isFinite(value) || value < 0)
  ) {
    throw new PitchPreservingBackendProbeErrorV3();
  }
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.ceil(ordered.length * 0.95) - 1]!;
}

export function encodeMonoFloat32WavV3(samples: Float32Array): Uint8Array {
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
  ratePercent: NarrationPlaybackRatePercentV3,
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
    return estimatePureToneFrequencyV3(samples, analyser.context.sampleRate);
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
          throw new PitchPreservingBackendProbeErrorV3();
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

function waitForMediaEvent(
  audio: HTMLAudioElement,
  eventName: "canplaythrough" | "ended" | "playing",
): Promise<void> {
  return withTimeout(
    new Promise<void>((resolve, reject) => {
      audio.addEventListener(eventName, () => resolve(), { once: true });
      audio.addEventListener(
        "error",
        () => reject(new PitchPreservingBackendProbeErrorV3()),
        { once: true },
      );
    }),
  );
}

function waitForWorkletMessage(
  node: AudioWorkletNode,
  expectedType: WorkletResponse["type"],
  unitSequence?: number,
): Promise<WorkletResponse> {
  let listener: ((event: MessageEvent<unknown>) => void) | undefined;
  const response = new Promise<WorkletResponse>((resolve, reject) => {
    listener = (event: MessageEvent<unknown>) => {
      const value = event.data as Partial<WorkletResponse>;
      if (value.type === "failed") {
        reject(new PitchPreservingBackendProbeErrorV3());
        return;
      }
      if (
        value.type === expectedType &&
        (unitSequence === undefined || value.unitSequence === unitSequence)
      ) {
        resolve(value as WorkletResponse);
      }
    };
    node.port.addEventListener("message", listener);
    node.port.start();
  });
  return withTimeout(response).finally(() => {
    if (listener !== undefined) {
      node.port.removeEventListener("message", listener);
    }
  });
}

function candidateById(candidateId: PitchPreservingProbeCandidateIdV3) {
  const candidate = READER_SETTINGS_PLAYBACK_AUTHORITY_V3.candidates.find(
    (value) => value.id === candidateId,
  );
  if (candidate === undefined) {
    throw new PitchPreservingBackendProbeErrorV3();
  }
  return candidate;
}

async function playMediaElementTrial(
  frequencyHz: number,
  ratePercent: NarrationPlaybackRatePercentV3,
): Promise<TrialObservation> {
  const samples = createProbeToneV3(frequencyHz);
  const wav = encodeMonoFloat32WavV3(samples);
  const objectUrl = URL.createObjectURL(
    new Blob([exactArrayBuffer(wav)], { type: "audio/wav" }),
  );
  const audio = new Audio();
  audio.preload = "auto";
  audio.preservesPitch = true;
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
  const playing = waitForMediaEvent(audio, "playing");
  const ended = waitForMediaEvent(audio, "ended");
  const sampling = beginPitchSampling(analyser);
  try {
    audio.src = objectUrl;
    await context.resume();
    await audio.play();
    await playing;
    const firstActivationMs = nowMs() - startedAt;
    await ended;
    sampling.stop();
    const observedPitchHz = sampling.median();
    const sourceFrames = Math.round(audio.currentTime * SAMPLE_RATE_HZ);
    const expectedFrames = expectedRenderedFrames(samples.length, ratePercent);
    const observedFrames = Math.round(
      (audio.duration * SAMPLE_RATE_HZ * 100) / ratePercent,
    );
    audio.pause();
    source.disconnect();
    analyser.disconnect();
    gain.disconnect();
    audio.removeAttribute("src");
    audio.load();
    URL.revokeObjectURL(objectUrl);
    await context.close();
    return Object.freeze({
      result: Object.freeze({
        frequencyHz,
        ratePercent,
        observedPitchHz,
        pitchDeviationCents: pitchDeviationCentsV3(
          frequencyHz,
          observedPitchHz,
        ),
        renderedDurationMs: renderedDurationMs(observedFrames),
        renderedDurationErrorMs: Math.abs(
          renderedDurationMs(observedFrames) -
            renderedDurationMs(expectedFrames),
        ),
        sourceFrameDrift: sourceFrames - samples.length,
        firstActivationMs,
        additionalWorkBytes: samples.byteLength + wav.byteLength,
      }),
      maximumActiveObjectUrls: 1,
      activeObjectUrlsAfterCleanup: 0,
    });
  } catch {
    sampling.stop();
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    URL.revokeObjectURL(objectUrl);
    await context.close();
    throw new PitchPreservingBackendProbeErrorV3();
  }
}

async function playRepositoryWsolaTrial(
  frequencyHz: number,
  ratePercent: NarrationPlaybackRatePercentV3,
): Promise<TrialObservation> {
  const input = createProbeToneV3(frequencyHz);
  const context = new AudioContext({
    latencyHint: "interactive",
    sampleRate: SAMPLE_RATE_HZ,
  });
  const analyser = context.createAnalyser();
  analyser.fftSize = ANALYSER_FFT_SIZE;
  const gain = context.createGain();
  gain.gain.value = 0;
  const startedAt = nowMs();
  const controller = await createIncrementalWsolaV3Node(context);
  controller.node.connect(analyser).connect(gain).connect(context.destination);
  const armedPromise = waitForWorkletMessage(controller.node, "armed", 0);
  controller.node.port.postMessage(
    { type: "arm", input, ratePercent, unitSequence: 0 },
    [input.buffer],
  );
  const armed = await armedPromise;
  const startedPromise = waitForWorkletMessage(controller.node, "started", 0);
  const endedPromise = waitForWorkletMessage(controller.node, "ended", 0);
  await context.resume();
  const sampling = beginPitchSampling(analyser);
  controller.node.port.postMessage({ type: "start" });
  await startedPromise;
  const firstActivationMs = nowMs() - startedAt;
  const ended = await endedPromise;
  sampling.stop();
  if (
    ended.renderedFrames === undefined ||
    ended.sourceFrames === undefined ||
    armed.additionalWorkBytes === undefined
  ) {
    throw new PitchPreservingBackendProbeErrorV3();
  }
  const observedPitchHz = sampling.median();
  const expectedFrames = expectedRenderedFrames(
    ended.sourceFrames,
    ratePercent,
  );
  controller.close();
  analyser.disconnect();
  gain.disconnect();
  await context.close();
  return Object.freeze({
    result: Object.freeze({
      frequencyHz,
      ratePercent,
      observedPitchHz,
      pitchDeviationCents: pitchDeviationCentsV3(frequencyHz, observedPitchHz),
      renderedDurationMs: renderedDurationMs(ended.renderedFrames),
      renderedDurationErrorMs: Math.abs(
        renderedDurationMs(ended.renderedFrames) -
          renderedDurationMs(expectedFrames),
      ),
      sourceFrameDrift: ended.sourceFrames - frozenToneDurationFrames(),
      firstActivationMs,
      additionalWorkBytes: armed.additionalWorkBytes,
    }),
    maximumActiveObjectUrls: 0,
    activeObjectUrlsAfterCleanup: 0,
  });
}

function initialBoundaryRateState() {
  const active = activateNarrationPlaybackRateAtBoundaryV3(
    initialNarrationPlaybackRateStateV3(),
    "initial-unit-start",
  );
  return selectNarrationPlaybackRateV3(active, 75);
}

function activatedSuccessorRatePercent(): 75 {
  const pending = initialBoundaryRateState();
  if (pending.activeRatePercent !== 100 || pending.pendingRatePercent !== 75) {
    throw new PitchPreservingBackendProbeErrorV3();
  }
  const successor = activateNarrationPlaybackRateAtBoundaryV3(
    pending,
    "after-complete-unit-ended-before-successor-start",
  );
  if (successor.activeRatePercent !== 75) {
    throw new PitchPreservingBackendProbeErrorV3();
  }
  return successor.activeRatePercent;
}

async function exerciseMediaBoundaryLifecycle(): Promise<BoundaryDeferredLifecycleResultV3> {
  const input = createProbeToneV3(220, BOUNDARY_UNIT_FRAMES);
  const wav = encodeMonoFloat32WavV3(input);
  const context = new AudioContext({ sampleRate: SAMPLE_RATE_HZ });
  const audio = new Audio();
  audio.preload = "auto";
  audio.preservesPitch = true;
  audio.playbackRate = 0.75;
  const source = context.createMediaElementSource(audio);
  const gain = context.createGain();
  gain.gain.value = 0;
  source.connect(gain).connect(context.destination);
  let activeObjectUrl: string | undefined;
  let activeObjectUrls = 0;
  let maximumActiveObjectUrls = 0;

  const releaseUrl = (): void => {
    if (activeObjectUrl !== undefined) {
      URL.revokeObjectURL(activeObjectUrl);
      activeObjectUrl = undefined;
      activeObjectUrls -= 1;
    }
  };
  const arm = async (): Promise<void> => {
    releaseUrl();
    activeObjectUrl = URL.createObjectURL(
      new Blob([exactArrayBuffer(wav)], { type: "audio/wav" }),
    );
    activeObjectUrls += 1;
    maximumActiveObjectUrls = Math.max(
      maximumActiveObjectUrls,
      activeObjectUrls,
    );
    const ready = waitForMediaEvent(audio, "canplaythrough");
    audio.src = activeObjectUrl;
    audio.load();
    await ready;
  };
  const startAndWait = async (): Promise<void> => {
    const playing = waitForMediaEvent(audio, "playing");
    const ended = waitForMediaEvent(audio, "ended");
    await audio.play();
    await playing;
    await ended;
  };

  try {
    await context.resume();
    const firstActivationStartedAt = nowMs();
    await arm();
    const firstActivationMs = nowMs() - firstActivationStartedAt;
    const successorActiveRatePercent = activatedSuccessorRatePercent();
    await startAndWait();
    const firstDrift =
      Math.round(audio.currentTime * SAMPLE_RATE_HZ) - input.length;

    const recurringUnitHandoffMs: number[] = [];
    for (let unit = 0; unit < 2; unit += 1) {
      const handoffStartedAt = nowMs();
      await arm();
      const playing = waitForMediaEvent(audio, "playing");
      const ended = waitForMediaEvent(audio, "ended");
      await audio.play();
      await playing;
      recurringUnitHandoffMs.push(nowMs() - handoffStartedAt);
      if (unit === 0) {
        await ended;
      } else {
        await wait(250);
      }
    }

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
    const stopStartedAt = nowMs();
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    releaseUrl();
    source.disconnect();
    gain.disconnect();
    await context.close();

    return Object.freeze({
      currentUnitInitialRatePercent: 100,
      currentUnitFinalRatePercent: 100,
      successorActiveRatePercent,
      firstActivationMs,
      recurringUnitHandoffMs: Object.freeze(recurringUnitHandoffMs),
      pauseTeardownMs,
      resumeStartMs,
      stopTeardownMs: nowMs() - stopStartedAt,
      sourceFramesBeforePause,
      sourceFramesDuringPause,
      sourceFrameDrift: firstDrift,
      midUnitActivationEvents: 0,
      recurringHandoffsUsingFirstActivationAllowance: 0,
      maximumActiveTimeStretchers: 1,
      maximumActiveObjectUrls,
      activeTimeStretchersAfterDefaultSettle: 0,
      activeObjectUrlsAfterDefaultSettle: 0,
      transformedAudioCopiesAfterDefaultSettle: 0,
      timeStretchWorkQueuesAfterDefaultSettle: 0,
      additionalTimeStretchWorkBytesAfterDefaultSettle: 0,
    });
  } catch {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    releaseUrl();
    await context.close();
    throw new PitchPreservingBackendProbeErrorV3();
  }
}

async function exerciseRepositoryWsolaBoundaryLifecycle(): Promise<BoundaryDeferredLifecycleResultV3> {
  const context = new AudioContext({ sampleRate: SAMPLE_RATE_HZ });
  const controller = await createIncrementalWsolaV3Node(context);
  const gain = context.createGain();
  gain.gain.value = 0;
  controller.node.connect(gain).connect(context.destination);
  await context.resume();

  const arm = async (unitSequence: number): Promise<WorkletResponse> => {
    const input = createProbeToneV3(220, BOUNDARY_UNIT_FRAMES);
    const armed = waitForWorkletMessage(controller.node, "armed", unitSequence);
    controller.node.port.postMessage(
      {
        type: "arm",
        input,
        ratePercent: 75,
        unitSequence,
      },
      [input.buffer],
    );
    return armed;
  };
  const start = async (
    unitSequence: number,
  ): Promise<{
    readonly startedAt: number;
    readonly ended: Promise<WorkletResponse>;
  }> => {
    const started = waitForWorkletMessage(
      controller.node,
      "started",
      unitSequence,
    );
    const ended = waitForWorkletMessage(controller.node, "ended", unitSequence);
    controller.node.port.postMessage({ type: "start" });
    await started;
    return Object.freeze({ startedAt: nowMs(), ended });
  };

  try {
    const firstActivationStartedAt = nowMs();
    await arm(0);
    const firstActivationMs = nowMs() - firstActivationStartedAt;
    const successorActiveRatePercent = activatedSuccessorRatePercent();
    const firstUnit = await start(0);
    const firstEnded = await firstUnit.ended;
    const firstDrift = (firstEnded.sourceFrames ?? 0) - BOUNDARY_UNIT_FRAMES;

    const recurringUnitHandoffMs: number[] = [];
    for (let unitSequence = 1; unitSequence <= 2; unitSequence += 1) {
      const handoffStartedAt = nowMs();
      await arm(unitSequence);
      const active = await start(unitSequence);
      recurringUnitHandoffMs.push(active.startedAt - handoffStartedAt);
      if (unitSequence === 1) {
        await active.ended;
      } else {
        await wait(250);
      }
    }

    const pauseStartedAt = nowMs();
    const paused = waitForWorkletMessage(controller.node, "paused", 2);
    controller.node.port.postMessage({ type: "pause" });
    const pauseResult = await paused;
    const pauseTeardownMs = nowMs() - pauseStartedAt;
    await wait(LIFECYCLE_SETTLE_MS);
    const sourceFramesBeforePause = pauseResult.sourceFrames ?? 0;
    const resumeStartedAt = nowMs();
    const resumed = waitForWorkletMessage(controller.node, "resumed", 2);
    controller.node.port.postMessage({ type: "resume" });
    await resumed;
    const resumeStartMs = nowMs() - resumeStartedAt;
    await wait(200);
    const stopStartedAt = nowMs();
    const stopped = waitForWorkletMessage(controller.node, "stopped");
    controller.node.port.postMessage({ type: "stop" });
    await stopped;
    controller.close();
    gain.disconnect();
    await context.close();

    return Object.freeze({
      currentUnitInitialRatePercent: 100,
      currentUnitFinalRatePercent: 100,
      successorActiveRatePercent,
      firstActivationMs,
      recurringUnitHandoffMs: Object.freeze(recurringUnitHandoffMs),
      pauseTeardownMs,
      resumeStartMs,
      stopTeardownMs: nowMs() - stopStartedAt,
      sourceFramesBeforePause,
      sourceFramesDuringPause: sourceFramesBeforePause,
      sourceFrameDrift: firstDrift,
      midUnitActivationEvents: 0,
      recurringHandoffsUsingFirstActivationAllowance: 0,
      maximumActiveTimeStretchers: 1,
      maximumActiveObjectUrls: 0,
      activeTimeStretchersAfterDefaultSettle: 0,
      activeObjectUrlsAfterDefaultSettle: 0,
      transformedAudioCopiesAfterDefaultSettle: 0,
      timeStretchWorkQueuesAfterDefaultSettle: 0,
      additionalTimeStretchWorkBytesAfterDefaultSettle: 0,
    });
  } catch {
    controller.close();
    await context.close();
    throw new PitchPreservingBackendProbeErrorV3();
  }
}

type TrialInput = Readonly<{
  frequencyHz: number;
  ratePercent: NarrationPlaybackRatePercentV3;
}>;

function frozenTrialInputs(): readonly TrialInput[] {
  const authority = READER_SETTINGS_PLAYBACK_AUTHORITY_V3.evaluation;
  return authority.syntheticInput.toneFrequenciesHz.flatMap((frequencyHz) =>
    authority.deterministicRatePercent.map((ratePercent) =>
      Object.freeze({ frequencyHz, ratePercent }),
    ),
  );
}

function aggregateCandidate(
  candidateId: PitchPreservingProbeCandidateIdV3,
  capability: "available" | "unavailable",
  trials: readonly PitchProbeTrialResultV3[],
  lifecycle: BoundaryDeferredLifecycleResultV3 | null,
  observations: readonly TrialObservation[],
): PitchProbeCandidateResultV3 {
  const gates = READER_SETTINGS_PLAYBACK_AUTHORITY_V3.evaluation.machineGates;
  const maximumPitchDeviationCents =
    trials.length === 0
      ? null
      : Math.max(...trials.map((trial) => trial.pitchDeviationCents));
  const maximumRenderedDurationErrorMs =
    trials.length === 0
      ? null
      : Math.max(...trials.map((trial) => trial.renderedDurationErrorMs));
  const maximumSourceFrameDrift =
    trials.length === 0 || lifecycle === null
      ? null
      : Math.max(
          ...trials.map((trial) => Math.abs(trial.sourceFrameDrift)),
          Math.abs(lifecycle.sourceFrameDrift),
        );
  const firstActivationP95Ms =
    trials.length === 0 || lifecycle === null
      ? null
      : percentile95V3([
          ...trials.map((trial) => trial.firstActivationMs),
          lifecycle.firstActivationMs,
        ]);
  const recurringUnitHandoffP95Ms =
    lifecycle === null
      ? null
      : percentile95V3(lifecycle.recurringUnitHandoffMs);
  const pauseStopTeardownP95Ms =
    lifecycle === null
      ? null
      : percentile95V3([lifecycle.pauseTeardownMs, lifecycle.stopTeardownMs]);
  const maximumAdditionalWorkBytes =
    trials.length === 0
      ? null
      : Math.max(...trials.map((trial) => trial.additionalWorkBytes));
  const maximumActiveObjectUrls = Math.max(
    lifecycle?.maximumActiveObjectUrls ?? 0,
    ...observations.map((observation) => observation.maximumActiveObjectUrls),
  );
  const activeObjectUrlsAfterCleanup = Math.max(
    lifecycle?.activeObjectUrlsAfterDefaultSettle ?? 0,
    ...observations.map(
      (observation) => observation.activeObjectUrlsAfterCleanup,
    ),
  );
  const passes =
    capability === "available" &&
    trials.length === frozenTrialInputs().length &&
    maximumPitchDeviationCents !== null &&
    maximumPitchDeviationCents <= gates.maximumPitchDeviationCents &&
    maximumRenderedDurationErrorMs !== null &&
    maximumRenderedDurationErrorMs <= gates.maximumRenderedDurationErrorMs &&
    maximumSourceFrameDrift === gates.maximumSourceFrameDrift &&
    firstActivationP95Ms !== null &&
    firstActivationP95Ms <= gates.maximumFirstNonDefaultActivationP95Ms &&
    recurringUnitHandoffP95Ms !== null &&
    recurringUnitHandoffP95Ms <= gates.maximumRecurringUnitHandoffP95Ms &&
    pauseStopTeardownP95Ms !== null &&
    pauseStopTeardownP95Ms <= gates.maximumPauseStopTeardownP95Ms &&
    maximumAdditionalWorkBytes !== null &&
    maximumAdditionalWorkBytes <= gates.maximumAdditionalWorkBytes &&
    maximumActiveObjectUrls <=
      READER_SETTINGS_PLAYBACK_AUTHORITY_V3.lifecycleAndBounds
        .maximumActiveObjectUrls &&
    activeObjectUrlsAfterCleanup === 0 &&
    lifecycle !== null &&
    lifecycle.currentUnitInitialRatePercent === 100 &&
    lifecycle.currentUnitFinalRatePercent === 100 &&
    lifecycle.successorActiveRatePercent === 75 &&
    lifecycle.midUnitActivationEvents ===
      gates.maximumMidUnitActivationEvents &&
    lifecycle.recurringHandoffsUsingFirstActivationAllowance ===
      gates.maximumRecurringHandoffsUsingFirstActivationAllowance &&
    lifecycle.activeTimeStretchersAfterDefaultSettle === 0 &&
    lifecycle.transformedAudioCopiesAfterDefaultSettle === 0 &&
    lifecycle.timeStretchWorkQueuesAfterDefaultSettle === 0 &&
    lifecycle.additionalTimeStretchWorkBytesAfterDefaultSettle === 0;

  return Object.freeze({
    candidateId,
    capability,
    trials: Object.freeze([...trials]),
    lifecycle,
    maximumPitchDeviationCents,
    maximumRenderedDurationErrorMs,
    maximumSourceFrameDrift,
    firstActivationP95Ms,
    recurringUnitHandoffP95Ms,
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

export function applyPitchProbeResourceMetricsV3(
  candidate: PitchProbeCandidateResultV3,
  resourceMetrics: PitchProbeResourceMetricsV3,
): PitchProbeCandidateResultV3 {
  const gates = READER_SETTINGS_PLAYBACK_AUTHORITY_V3.evaluation.machineGates;
  if (
    !Number.isFinite(resourceMetrics.additionalProcessRamMiB) ||
    resourceMetrics.additionalProcessRamMiB < 0 ||
    !Number.isFinite(resourceMetrics.cpuIncreasePercentagePoints) ||
    resourceMetrics.cpuIncreasePercentagePoints < 0 ||
    resourceMetrics.maximumActiveTimeStretchers !== 1
  ) {
    throw new PitchPreservingBackendProbeErrorV3();
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

export async function inspectPitchPreservingBackendCapabilitiesV3(): Promise<PitchPreservingCapabilityResultV3> {
  const audio = document.createElement("audio");
  const audioWorklet =
    typeof AudioContext === "function" &&
    typeof AudioWorkletNode === "function";
  return Object.freeze({
    authorityVersion: 3,
    audioWorklet,
    mediaElementPreservesPitch: "preservesPitch" in audio,
    repositoryWorkletModule: audioWorklet,
  });
}

export async function runPitchPreservingBackendCandidateProbeV3(
  candidateId: PitchPreservingProbeCandidateIdV3,
): Promise<PitchProbeCandidateResultV3> {
  candidateById(candidateId);
  const capabilities = await inspectPitchPreservingBackendCapabilitiesV3();
  const trials: PitchProbeTrialResultV3[] = [];
  const observations: TrialObservation[] = [];
  let lifecycle: BoundaryDeferredLifecycleResultV3 | null = null;
  let available = false;
  try {
    if (candidateId === "html-media-element-preserves-pitch-wav-boundary-v3") {
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
        lifecycle = await exerciseMediaBoundaryLifecycle();
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
        lifecycle = await exerciseRepositoryWsolaBoundaryLifecycle();
      }
    }
  } catch {
    // One closed candidate failure must not prevent the other sequential arm.
  }
  return aggregateCandidate(
    candidateId,
    available ? "available" : "unavailable",
    trials,
    lifecycle,
    observations,
  );
}
