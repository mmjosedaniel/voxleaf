import { describe, expect, it } from "vitest";

import {
  createBookId,
  createFrameId,
  createGenerationId,
  createSegmentId,
  createSessionId,
  createSpineItemId,
} from "./identifiers.js";
import type { SpineItemId } from "./identifiers.js";

const identifierFactories = [
  createBookId,
  createSpineItemId,
  createSessionId,
  createGenerationId,
  createSegmentId,
  createFrameId,
] as const;

describe("opaque identifiers", () => {
  it("constructs bounded JSON-compatible strings", () => {
    const bookId = createBookId("book:synthetic-1");

    expect(bookId).toBe("book:synthetic-1");
    expect(JSON.parse(JSON.stringify(bookId))).toBe("book:synthetic-1");
  });

  it.each(identifierFactories)(
    "rejects invalid values without exposing the value",
    (createId) => {
      const invalidValues: unknown[] = [
        undefined,
        42,
        "",
        " ",
        " leading",
        "trailing ",
        "contains\u0000control",
        "x".repeat(129),
      ];

      for (const value of invalidValues) {
        expect(() => createId(value)).toThrow();
      }

      expect(() => createId(" private-value ")).toThrowError(
        expect.objectContaining({
          message: expect.not.stringContaining("private-value"),
        }),
      );
    },
  );

  it("keeps identifier families distinct at compile time", () => {
    const bookId = createBookId("book:synthetic-1");
    const acceptSpineItemId = (value: SpineItemId): void => {
      void value;
    };

    // @ts-expect-error A BookId must not be accepted where a SpineItemId is required.
    acceptSpineItemId(bookId);

    expect(bookId).toBe("book:synthetic-1");
  });
});
