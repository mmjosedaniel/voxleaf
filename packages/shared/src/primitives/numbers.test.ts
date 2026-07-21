import { describe, expect, it } from "vitest";

import {
  createByteCount,
  createCount,
  createHertz,
  createIndex,
  createMilliseconds,
  createProgression,
  createSampleCount,
} from "./numbers.js";
import type { ByteCount } from "./numbers.js";

const nonNegativeIntegerFactories = [
  createCount,
  createIndex,
  createMilliseconds,
  createSampleCount,
  createByteCount,
] as const;

describe("numeric and unit primitives", () => {
  it.each(nonNegativeIntegerFactories)(
    "accepts non-negative JSON safe integers and rejects invalid boundaries",
    (createUnit) => {
      expect(createUnit(0)).toBe(0);
      expect(createUnit(Number.MAX_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER);

      for (const invalid of [
        -0,
        -1,
        0.5,
        Number.MAX_SAFE_INTEGER + 1,
        NaN,
        Infinity,
        "1",
      ]) {
        expect(() => createUnit(invalid)).toThrow();
      }
    },
  );

  it("requires a positive sample rate", () => {
    expect(createHertz(24_000)).toBe(24_000);
    expect(() => createHertz(0)).toThrow();
    expect(() => createHertz(-1)).toThrow();
  });

  it("accepts progression from zero through one only", () => {
    expect(createProgression(0)).toBe(0);
    expect(createProgression(0.5)).toBe(0.5);
    expect(createProgression(1)).toBe(1);

    for (const invalid of [-0, -0.1, 1.1, NaN, Infinity, "0.5"]) {
      expect(() => createProgression(invalid)).toThrow();
    }
  });

  it("keeps incompatible units distinct at compile time", () => {
    const milliseconds = createMilliseconds(250);
    const acceptBytes = (value: ByteCount): void => {
      void value;
    };

    // @ts-expect-error Milliseconds must not be accepted where ByteCount is required.
    acceptBytes(milliseconds);

    expect(JSON.parse(JSON.stringify(milliseconds))).toBe(250);
  });
});
