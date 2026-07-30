import type { NarrationSegmentPolicy } from "./narration-piper-policy.js";

/**
 * Chatterbox produces one complete waveform per narration segment. These
 * bilingual bounds keep typical output below protocol-v1's 20-second audio
 * unit ceiling without changing the shared normalization contract.
 */
export const NARRATION_CHATTERBOX_V1_SEGMENT_POLICY: NarrationSegmentPolicy =
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
