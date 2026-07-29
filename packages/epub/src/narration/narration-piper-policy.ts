import { NARRATION_V1_SEGMENT_POLICY } from "./narration-policy.js";

export type NarrationSegmentPolicy = Readonly<{
  sourceCodePointsTarget: number;
  sourceCodePointsHardMaximum: number;
  narrationCodePointsTarget: number;
  narrationCodePointsHardMaximum: number;
  narrationUtf8BytesTarget: number;
  narrationUtf8BytesHardMaximum: number;
  sentencesTarget: number;
  sentencesHardMaximum: number;
}>;

/**
 * Exact Piper product segment authority. Aggregate retention and public batch
 * bounds remain owned by narration-v1; only stable block-local selection is
 * narrower so complete Piper waveforms retain protocol-v1 headroom.
 */
export const NARRATION_PIPER_V1_SEGMENT_POLICY: NarrationSegmentPolicy =
  Object.freeze({
    sourceCodePointsTarget: 240,
    sourceCodePointsHardMaximum: 320,
    narrationCodePointsTarget: 200,
    narrationCodePointsHardMaximum: 256,
    narrationUtf8BytesTarget: 800,
    narrationUtf8BytesHardMaximum: 1_024,
    sentencesTarget: 2,
    sentencesHardMaximum: 6,
  });

export function narrationSegmentPolicy(
  profile: "narration-v1" | "narration-piper-v1",
): NarrationSegmentPolicy {
  return profile === "narration-piper-v1"
    ? NARRATION_PIPER_V1_SEGMENT_POLICY
    : NARRATION_V1_SEGMENT_POLICY;
}
