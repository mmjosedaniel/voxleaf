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
