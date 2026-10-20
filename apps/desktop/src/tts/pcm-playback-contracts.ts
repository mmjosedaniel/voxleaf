import type { NarrationPlaybackRatePercentV3 } from "./reader-settings-playback-authority-v3";

export type PcmPlaybackErrorCode =
  "invalid-state" | "invalid-volume" | "playback-failure" | "unsupported-rate";

export class PcmPlaybackError extends Error {
  public readonly code: PcmPlaybackErrorCode;

  public constructor(code: PcmPlaybackErrorCode) {
    super("Local audio playback failed.");
    this.name = "PcmPlaybackError";
    this.code = code;
  }
}

export interface PcmPlaybackRequest {
  readonly sequence: number;
  readonly payload: Uint8Array;
  readonly sampleRateHz: 24_000;
  readonly channelCount: 1;
  readonly sampleFormat: "float32-le";
  readonly sampleCountSamples: number;
  readonly startSampleFrame: number;
  readonly volumePercent: number;
  readonly playbackRate: number;
}

export interface PcmPlaybackHandle {
  readonly sequence: number;
  readonly playedSampleFrames: number;
  pause(): void;
  resume(): void;
  stop(): void;
  setVolumePercent(volumePercent: number): void;
}

export interface PcmPlaybackCallbacks {
  readonly ended: () => void;
  readonly failed: () => void;
}

export interface PcmPlaybackBackend {
  start(
    request: PcmPlaybackRequest,
    callbacks: PcmPlaybackCallbacks,
  ): PcmPlaybackHandle;
  preparePlaybackRate?(
    playbackRatePercent: NarrationPlaybackRatePercentV3,
  ): Promise<void>;
  isPlaybackRatePrepared?(
    playbackRatePercent: NarrationPlaybackRatePercentV3,
  ): boolean;
  releasePlaybackRatePreparation?(): void;
  close(): void | Promise<void>;
}
