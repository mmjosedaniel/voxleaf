/**
 * This file is generated from the canonical JSON Schema source.
 * DO NOT MODIFY IT BY HAND. Run the @voxleaf/shared generate command instead.
 */

export type SchemaVersionWire = number;
export type FrameIdWire = string;
export type SessionIdWire = string;
export type GenerationIdWire = string;
export type SegmentIdWire = string;
/**
 * Monotonic frame order within the active generation.
 */
export type IndexWire = number;
export type HertzWire = number;
export type SampleCountWire = number;
export type CountWire = number;

/**
 * Privacy-safe metadata for one in-memory audio frame. Audio payload and encoding are intentionally outside this contract.
 */
export interface AudioFrameV1Wire {
  schemaVersion: SchemaVersionWire & 1;
  frameId: FrameIdWire;
  sessionId: SessionIdWire;
  generationId: GenerationIdWire;
  segmentId: SegmentIdWire;
  sequence: IndexWire;
  sampleRateHz: HertzWire;
  /**
   * Positive count of sample frames per channel; duration is this count divided by sampleRateHz.
   */
  sampleCountSamples: SampleCountWire;
  /**
   * Positive number of channels represented by the future payload; it does not multiply duration.
   */
  channelCount: CountWire;
  /**
   * True only for the final audio frame produced for this narration segment.
   */
  endOfSegment: boolean;
}
