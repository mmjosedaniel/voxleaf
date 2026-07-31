export type NarrationLanguageV1 = "es" | "en";

export const DEFAULT_NARRATION_LANGUAGE_V1: NarrationLanguageV1 = "es";

// V1 is historical M010.1 authority. Runtime preference V2 deliberately
// changes only the missing/invalid/reset fallback while preserving valid V1
// Spanish and English choices.
export const DEFAULT_NARRATION_LANGUAGE_V2: NarrationLanguageV1 = "en";

export const NARRATION_LANGUAGES_V1 = Object.freeze([
  Object.freeze({ value: "es" as const, label: "Spanish" }),
  Object.freeze({ value: "en" as const, label: "English" }),
]);

export const NARRATION_LANGUAGES_V2 = Object.freeze([
  Object.freeze({ value: "en" as const, label: "English" }),
  Object.freeze({ value: "es" as const, label: "Spanish" }),
]);

export function isNarrationLanguageV1(
  value: unknown,
): value is NarrationLanguageV1 {
  return value === "es" || value === "en";
}
