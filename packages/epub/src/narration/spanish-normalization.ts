/**
 * Closed `narration-v1` allowlist for line-end Spanish hyphenation.
 *
 * A source line break does not prove that an adjacent hyphen is discretionary:
 * it may be a genuine compound. Task 3.1 therefore joins only the exact split
 * accepted by the Task 1.2 corpus. Extending this policy requires adding
 * positive and negative corpus evidence first.
 */
export function isAcceptedSpanishLineEndHyphenation(
  leftFragment: string,
  rightFragment: string,
): boolean {
  return leftFragment === "narra" && rightFragment === "ción";
}

/**
 * Closed `narration-v1` Spanish symbol expansions accepted by the Task 1.2
 * corpus. The normalizer still owns source context, language, and span checks;
 * this module owns only the exact source/output table.
 */
export const SPANISH_AMPERSAND_NARRATION = "y";

export const SPANISH_CELSIUS_NORMALIZATION = Object.freeze([
  Object.freeze({ source: "2", narration: "veinte" }),
  Object.freeze({ source: "0", narration: undefined }),
  Object.freeze({ source: " ", narration: " " }),
  Object.freeze({ source: "°", narration: "grados " }),
  Object.freeze({ source: "C", narration: "Celsius" }),
] as const);
