import { describe, expect, it } from "vitest";

import {
  DEFAULT_READER_PREFERENCES,
  READER_CONTENT_WIDTHS,
  READER_LINE_SPACINGS,
  READER_TEXT_SCALES,
  READER_THEMES,
  updateReaderPreference,
  type ReaderPreferenceName,
} from "./reader-preferences";

describe("reader preferences", () => {
  it("provides the approved frozen first-run defaults", () => {
    expect(DEFAULT_READER_PREFERENCES).toEqual({
      schemaVersion: 1,
      textScale: "standard",
      lineSpacing: "comfortable",
      contentWidth: "standard",
      theme: "system",
    });
    expect(Object.isFrozen(DEFAULT_READER_PREFERENCES)).toBe(true);
  });

  it.each([
    ["textScale", READER_TEXT_SCALES],
    ["lineSpacing", READER_LINE_SPACINGS],
    ["contentWidth", READER_CONTENT_WIDTHS],
    ["theme", READER_THEMES],
  ] as const)("accepts every closed %s value", (preference, values) => {
    for (const value of values) {
      const updated = updateReaderPreference(
        DEFAULT_READER_PREFERENCES,
        preference,
        value,
      );
      expect(updated).toBeDefined();
      expect(updated?.[preference]).toBe(value);
      expect(updated?.schemaVersion).toBe(1);
      expect(Object.isFrozen(updated)).toBe(true);
    }
  });

  it.each([
    "calc(100vw)",
    "var(--publisher-value)",
    "#ffffff",
    "Georgia",
    2,
    null,
    undefined,
    Object.freeze({ value: "large" }),
  ])("rejects arbitrary preference input %j", (value) => {
    for (const preference of [
      "textScale",
      "lineSpacing",
      "contentWidth",
      "theme",
    ] satisfies readonly ReaderPreferenceName[]) {
      expect(
        updateReaderPreference(DEFAULT_READER_PREFERENCES, preference, value),
      ).toBeUndefined();
    }
  });

  it("returns the existing immutable value when no preference changes", () => {
    expect(
      updateReaderPreference(
        DEFAULT_READER_PREFERENCES,
        "textScale",
        "standard",
      ),
    ).toBe(DEFAULT_READER_PREFERENCES);
  });
});
