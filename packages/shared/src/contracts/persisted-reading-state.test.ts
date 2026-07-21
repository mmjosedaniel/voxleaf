import { describe, expect, it } from "vitest";

import {
  PersistedReadingStateContractError,
  decodePersistedReadingStateV1,
} from "./persisted-reading-state.js";

function createPersistedReadingStateInput() {
  const bookIdentity = {
    scheme: "synthetic-test",
    schemeVersion: 1,
    value: "book-test-001",
  };

  return {
    schemaVersion: 1,
    bookIdentity,
    locator: {
      schemaVersion: 1,
      bookIdentity: { ...bookIdentity },
      spineItemId: "spine:chapter-1",
      spineItemIndex: 0,
      anchor: {
        kind: "element-id",
        formatVersion: 1,
        value: "paragraph-1",
        anchorIndex: 0,
      },
      textOffsetCodePoints: 4,
      progression: 0.25,
    },
    preferences: {
      selectedVoiceId: "voice:synthetic-1",
      playbackRate: 1.25,
    },
  };
}

describe("persisted reading state contract", () => {
  it("round-trips canonical version 1 input deterministically", () => {
    const input = createPersistedReadingStateInput();
    const state = decodePersistedReadingStateV1(input);
    const reorderedInput = {
      preferences: input.preferences,
      locator: input.locator,
      bookIdentity: input.bookIdentity,
      schemaVersion: input.schemaVersion,
    };
    const stateFromReorderedInput =
      decodePersistedReadingStateV1(reorderedInput);

    expect(JSON.stringify(state)).toBe(JSON.stringify(input));
    expect(JSON.stringify(stateFromReorderedInput)).toBe(JSON.stringify(state));
    expect(JSON.parse(JSON.stringify(state))).toEqual(input);
  });

  it("preserves an empty closed preferences object", () => {
    const input = {
      ...createPersistedReadingStateInput(),
      preferences: {},
    };

    const state = decodePersistedReadingStateV1(input);

    expect(state.preferences).toEqual({});
    expect(JSON.parse(JSON.stringify(state))).toEqual(input);
  });

  it("rejects state fields that could persist content or derived position", () => {
    const forbiddenFields = [
      ["pageNumber", 31],
      ["textQuote", "private quotation"],
      ["bookText", "private book text"],
      ["generatedAudio", "synthetic-audio"],
      ["modelWeights", "synthetic-weights"],
      ["bookPath", "C:\\Users\\private\\book.epub"],
    ] as const;

    for (const [field, value] of forbiddenFields) {
      const input = { ...createPersistedReadingStateInput(), [field]: value };

      expect(() => decodePersistedReadingStateV1(input)).toThrow(
        PersistedReadingStateContractError,
      );
    }
  });

  it("rejects absolute-path-like voice identifiers", () => {
    for (const selectedVoiceId of [
      "C:\\Users\\private\\voice",
      "/home/private/voice",
      "file:///private/voice",
    ]) {
      const input = createPersistedReadingStateInput();
      input.preferences.selectedVoiceId = selectedVoiceId;

      expect(() => decodePersistedReadingStateV1(input)).toThrow(
        PersistedReadingStateContractError,
      );
    }
  });

  it("rejects a top-level identity that differs from the locator", () => {
    const input = createPersistedReadingStateInput();
    input.locator.bookIdentity.value = "book-test-002";

    expect(() => decodePersistedReadingStateV1(input)).toThrow(
      PersistedReadingStateContractError,
    );
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid playback rate %s",
    (playbackRate) => {
      const input = createPersistedReadingStateInput();
      input.preferences.playbackRate = playbackRate;

      expect(() => decodePersistedReadingStateV1(input)).toThrow(
        PersistedReadingStateContractError,
      );
    },
  );

  it("rejects malformed input without coercion", () => {
    const stringVersion = {
      ...createPersistedReadingStateInput(),
      schemaVersion: "1",
    };
    const stringPlaybackRateSource = createPersistedReadingStateInput();
    const stringPlaybackRate = {
      ...stringPlaybackRateSource,
      preferences: {
        ...stringPlaybackRateSource.preferences,
        playbackRate: "1.25",
      },
    };
    const unknownPreference = createPersistedReadingStateInput();
    const preferencesWithUnknown = {
      ...unknownPreference.preferences,
      theme: "dark",
    };
    const withUnknownPreference = {
      ...unknownPreference,
      preferences: preferencesWithUnknown,
    };

    for (const input of [
      stringVersion,
      stringPlaybackRate,
      withUnknownPreference,
    ]) {
      expect(() => decodePersistedReadingStateV1(input)).toThrowError(
        expect.objectContaining({
          code: "malformed",
          message: "Persisted reading state is malformed.",
        }),
      );
    }
  });

  it("distinguishes unsupported root and nested contract versions", () => {
    const unsupportedState = createPersistedReadingStateInput();
    unsupportedState.schemaVersion = 2;
    const unsupportedLocator = createPersistedReadingStateInput();
    unsupportedLocator.locator.schemaVersion = 2;
    const unsupportedAnchor = createPersistedReadingStateInput();
    unsupportedAnchor.locator.anchor.formatVersion = 2;

    for (const input of [
      unsupportedState,
      unsupportedLocator,
      unsupportedAnchor,
    ]) {
      expect(() => decodePersistedReadingStateV1(input)).toThrowError(
        expect.objectContaining({
          code: "unsupported-version",
          message: "Persisted reading state version is unsupported.",
        }),
      );
    }
  });

  it("does not expose persisted input through validation errors", () => {
    const input = createPersistedReadingStateInput();
    input.preferences.selectedVoiceId = "private voice identifier";

    expect(() => decodePersistedReadingStateV1(input)).toThrowError(
      expect.objectContaining({
        message: expect.not.stringContaining("private voice identifier"),
      }),
    );
  });
});
