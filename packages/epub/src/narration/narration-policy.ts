/**
 * Production limits used by the bounded Task 2.3 narration source window and
 * the Task 3.1-3.2 normalizer.
 *
 * These values are the relevant subset of the accepted model-independent
 * `narration-v1` profile. Later normalization and segmentation tasks add the
 * remaining output dimensions without weakening these ceilings.
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
  normalizationExpansionCodePointsHardMaximum: 16,
  retainedTokenEntriesHardMaximum: 4_096,
  retainedEventEntriesHardMaximum: 4_096,
});
