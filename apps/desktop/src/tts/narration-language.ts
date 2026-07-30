export type NarrationLanguageV1 = "es" | "en";

export const DEFAULT_NARRATION_LANGUAGE_V1: NarrationLanguageV1 = "es";

export const NARRATION_LANGUAGES_V1 = Object.freeze([
  Object.freeze({ value: "es" as const, label: "Spanish" }),
  Object.freeze({ value: "en" as const, label: "English" }),
]);

export function isNarrationLanguageV1(
  value: unknown,
): value is NarrationLanguageV1 {
  return value === "es" || value === "en";
}
