import type { NarrationSourceToken } from "./narration-source.js";

/** Fixed-size, content-free state; never retains source tokens or prior prose. */
export interface NarrationQuotationContext {
  readonly straightDoubleOpen: boolean;
  readonly closings: Readonly<Record<"”" | "’" | "»" | "›", number>>;
}

export function summarizeQuotationContext(
  tokens: readonly NarrationSourceToken[],
  start: number,
  end: number,
  isApostropheContext: (
    tokens: readonly NarrationSourceToken[],
    index: number,
  ) => boolean,
  preceding?: NarrationQuotationContext,
): NarrationQuotationContext {
  const closings = { "”": 0, "’": 0, "»": 0, "›": 0, ...preceding?.closings };
  let straightDoubleOpen = preceding?.straightDoubleOpen ?? false;
  for (let index = start; index < end; index += 1) {
    const token = tokens[index];
    if (
      token?.kind !== "text" ||
      token.textContext.inlineContainers.includes("code")
    )
      continue;
    const value = String(token.text);
    if (value === '"') straightDoubleOpen = !straightDoubleOpen;
    const closing =
      value === "“"
        ? "”"
        : value === "‘"
          ? "’"
          : value === "«"
            ? "»"
            : value === "‹"
              ? "›"
              : undefined;
    if (closing !== undefined) closings[closing] += 1;
    else if (value === "”" || value === "’" || value === "»" || value === "›") {
      const apostrophe = value === "’" && isApostropheContext(tokens, index);
      if (!apostrophe) closings[value] = Math.max(0, closings[value] - 1);
    }
  }
  return Object.freeze({
    straightDoubleOpen,
    closings: Object.freeze(closings),
  });
}
