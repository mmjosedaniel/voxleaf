/**
 * This file is generated from the canonical JSON Schema source.
 * DO NOT MODIFY IT BY HAND. Run the @voxleaf/shared generate command instead.
 */

export type SchemaVersionWire = number;
export type SessionIdWire = string;
export type GenerationIdWire = string;
/**
 * Contiguous media duration currently available to the player; this is not elapsed wall-clock time.
 */
export type MillisecondsWire = number;
export type MillisecondsWire1 = number;
/**
 * Count of observed involuntary transitions from playback to buffering for this session and generation.
 */
export type CountWire = number;
/**
 * Exhaustion while more audio is expected is represented as buffering, not as a separate terminal state.
 *
 * This interface was referenced by `BufferStatusV1Wire`'s JSON-Schema
 * via the `definition` "bufferState".
 */
export type BufferStateV1Wire =
  "empty" | "buffering" | "ready" | "playing" | "paused";

/**
 * A payload-free snapshot of bounded playable-audio status for one active session and generation.
 */
export interface BufferStatusV1Wire {
  schemaVersion: SchemaVersionWire & 1;
  sessionId: SessionIdWire;
  generationId: GenerationIdWire;
  contiguousPlayableDurationMs: MillisecondsWire;
  thresholds: BufferThresholdsV1Wire;
  underrunCount: CountWire;
  state: BufferStateV1Wire;
}
/**
 * This interface was referenced by `BufferStatusV1Wire`'s JSON-Schema
 * via the `definition` "bufferThresholds".
 */
export interface BufferThresholdsV1Wire {
  lowWaterMarkMs: MillisecondsWire1;
  targetBufferMs: MillisecondsWire1;
  maximumBufferMs: MillisecondsWire1;
}
