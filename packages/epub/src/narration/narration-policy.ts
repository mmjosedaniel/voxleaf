/**
 * Production limits used by the bounded Task 2.3 narration source window,
 * the Task 3.1-3.4 normalizer, the Task 4.1 boundary scanner, and the Task 4.2
 * semantic-unit packer.
 *
 * These values are the implemented subset of the accepted model-independent
 * `narration-v1` profile. Later preparation tasks add batch totals and public
 * result enforcement without weakening these ceilings.
 */
export const NARRATION_V1_SOURCE_WINDOW_POLICY = Object.freeze({
  profileId: "narration-v1" as const,
  sourceCodePointsInspectedTarget: 8_192,
  sourceCodePointsInspectedHardMaximum: 16_384,
  workUnitsBetweenCheckpointsTarget: 512,
  workUnitsBetweenCheckpointsHardMaximum: 1_024,
  workUnitsBetweenYieldsTarget: 4_096,
  workUnitsBetweenYieldsHardMaximum: 8_192,
  traversalDepthHardMaximum: 128,
  parserLookaheadCodePointsHardMaximum: 128,
  protectedTokenCodePointsHardMaximum: 256,
  normalizationExpansionCodePointsHardMaximum: 16,
  retainedTokenEntriesHardMaximum: 4_096,
  retainedEventEntriesHardMaximum: 4_096,
});

/**
 * Stable segment targets and ceilings from the accepted `narration-v1`
 * profile. Targets select natural boundaries; hard maxima are admission
 * limits and are never inferred from JavaScript UTF-16 string length.
 */
export const NARRATION_V1_SEGMENT_POLICY = Object.freeze({
  sourceCodePointsTarget: 384,
  sourceCodePointsHardMaximum: 768,
  narrationCodePointsTarget: 320,
  narrationCodePointsHardMaximum: 640,
  narrationUtf8BytesTarget: 1_024,
  narrationUtf8BytesHardMaximum: 2_048,
  sentencesTarget: 3,
  sentencesHardMaximum: 8,
  retainedSegmentEntriesHardMaximum: 17,
});
