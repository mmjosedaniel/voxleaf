import type { ReadingLocatorV1 } from "@voxleaf/shared";

export const READER_TEXT_SCALES = Object.freeze([
  "small",
  "standard",
  "large",
  "extra-large",
] as const);
export const READER_LINE_SPACINGS = Object.freeze([
  "compact",
  "comfortable",
  "spacious",
] as const);
export const READER_CONTENT_WIDTHS = Object.freeze([
  "narrow",
  "standard",
  "wide",
] as const);
export const READER_THEMES = Object.freeze([
  "system",
  "light",
  "dark",
] as const);

export type ReaderTextScale = (typeof READER_TEXT_SCALES)[number];
export type ReaderLineSpacing = (typeof READER_LINE_SPACINGS)[number];
export type ReaderContentWidth = (typeof READER_CONTENT_WIDTHS)[number];
export type ReaderTheme = (typeof READER_THEMES)[number];

export interface ReaderPreferencesV1 {
  readonly schemaVersion: 1;
  readonly textScale: ReaderTextScale;
  readonly lineSpacing: ReaderLineSpacing;
  readonly contentWidth: ReaderContentWidth;
  readonly theme: ReaderTheme;
}

export type ReaderPreferenceName = Exclude<
  keyof ReaderPreferencesV1,
  "schemaVersion"
>;

export interface ReaderPreferenceReflowIntent {
  readonly kind: "reader-preference-reflow";
  readonly revision: number;
  readonly preference: ReaderPreferenceName;
  readonly locator: ReadingLocatorV1;
  readonly previous: ReaderPreferencesV1;
  readonly next: ReaderPreferencesV1;
}

export const DEFAULT_READER_PREFERENCES: ReaderPreferencesV1 = Object.freeze({
  schemaVersion: 1,
  textScale: "standard",
  lineSpacing: "comfortable",
  contentWidth: "standard",
  theme: "system",
});

function includes<const Values extends readonly string[]>(
  values: Values,
  candidate: unknown,
): candidate is Values[number] {
  return typeof candidate === "string" && values.includes(candidate);
}

export function updateReaderPreference(
  current: ReaderPreferencesV1,
  preference: ReaderPreferenceName,
  value: unknown,
): ReaderPreferencesV1 | undefined {
  switch (preference) {
    case "contentWidth":
      if (!includes(READER_CONTENT_WIDTHS, value)) {
        return undefined;
      }
      return value === current.contentWidth
        ? current
        : Object.freeze({ ...current, contentWidth: value });
    case "lineSpacing":
      if (!includes(READER_LINE_SPACINGS, value)) {
        return undefined;
      }
      return value === current.lineSpacing
        ? current
        : Object.freeze({ ...current, lineSpacing: value });
    case "textScale":
      if (!includes(READER_TEXT_SCALES, value)) {
        return undefined;
      }
      return value === current.textScale
        ? current
        : Object.freeze({ ...current, textScale: value });
    case "theme":
      if (!includes(READER_THEMES, value)) {
        return undefined;
      }
      return value === current.theme
        ? current
        : Object.freeze({ ...current, theme: value });
    default:
      return unreachable(preference);
  }
}

function unreachable(value: never): never {
  void value;
  throw new Error("Unsupported reader preference.");
}
