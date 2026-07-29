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
  piperSpeechExpansionUnitsTarget?: number;
  piperSpeechExpansionUnitsHardMaximum?: number;
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

export const NARRATION_PIPER_V2_SEGMENT_POLICY = Object.freeze({
  ...NARRATION_PIPER_V1_SEGMENT_POLICY,
  piperSpeechExpansionUnitsTarget: 120,
  piperSpeechExpansionUnitsHardMaximum: 160,
} satisfies NarrationSegmentPolicy);

const PIPER_TRIPLE_WEIGHT_SYMBOLS = new Set([
  "%",
  "\u2030",
  "\u00ba",
  "\u00aa",
  "\u00b0",
]);
const ASCII_DIGIT = /^[0-9]$/u;
const UNICODE_CURRENCY_SYMBOL = /^\p{Sc}$/u;
const UNICODE_UPPERCASE_LETTER = /^\p{Lu}$/u;

export function piperSpeechExpansionCodePointUnits(codePoint: string): number {
  if (ASCII_DIGIT.test(codePoint)) {
    return 4;
  }
  if (
    PIPER_TRIPLE_WEIGHT_SYMBOLS.has(codePoint) ||
    UNICODE_CURRENCY_SYMBOL.test(codePoint)
  ) {
    return 3;
  }
  return UNICODE_UPPERCASE_LETTER.test(codePoint) ? 2 : 1;
}

export function narrationSegmentPolicy(
  profile:
    | "narration-v1"
    | "narration-bilingual-v2"
    | "narration-piper-v1"
    | "narration-piper-v2",
): NarrationSegmentPolicy {
  switch (profile) {
    case "narration-piper-v1":
      return NARRATION_PIPER_V1_SEGMENT_POLICY;
    case "narration-piper-v2":
      return NARRATION_PIPER_V2_SEGMENT_POLICY;
    case "narration-v1":
    case "narration-bilingual-v2":
      return NARRATION_V1_SEGMENT_POLICY;
  }
}
