import { describe, expect, it } from "vitest";

import {
  OperationalErrorContractError,
  createOperationalErrorV1,
  decodeOperationalErrorV1,
} from "./operational-error.js";

const VALID_ERROR_SEMANTICS = [
  ["invalid-input", "input", "recoverable"],
  ["unsupported-input", "input", "recoverable"],
  ["capability-unavailable", "availability", "recoverable"],
  ["operation-cancelled", "cancellation", "recoverable"],
  ["resource-exhausted", "resource", "recoverable"],
  ["internal-failure", "internal", "fatal"],
] as const;

describe("operational error contract", () => {
  it.each(VALID_ERROR_SEMANTICS)(
    "round-trips %s with its fixed category and severity",
    (code, category, severity) => {
      const input = { schemaVersion: 1, code, category, severity };
      const error = decodeOperationalErrorV1(input);

      expect(JSON.parse(JSON.stringify(error))).toEqual(input);
      expect(createOperationalErrorV1(code)).toEqual(input);
      expect(Object.isFrozen(error)).toBe(true);
    },
  );

  it("rejects mismatched category and severity semantics", () => {
    const mismatchedCategory = {
      schemaVersion: 1,
      code: "invalid-input",
      category: "internal",
      severity: "recoverable",
    };
    const mismatchedSeverity = {
      schemaVersion: 1,
      code: "internal-failure",
      category: "internal",
      severity: "recoverable",
    };

    for (const input of [mismatchedCategory, mismatchedSeverity]) {
      expect(() => decodeOperationalErrorV1(input)).toThrowError(
        expect.objectContaining({ code: "malformed" }),
      );
    }
  });

  it("rejects unknown codes and fields under the closed v1 policy", () => {
    const unknownCode = {
      schemaVersion: 1,
      code: "future-failure",
      category: "internal",
      severity: "fatal",
    };
    const unknownField = {
      schemaVersion: 1,
      code: "internal-failure",
      category: "internal",
      severity: "fatal",
      retryAfterMs: 100,
    };

    for (const input of [unknownCode, unknownField]) {
      expect(() => decodeOperationalErrorV1(input)).toThrow(
        OperationalErrorContractError,
      );
    }
  });

  it.each([
    ["message", "private narration text"],
    ["bookText", "private book text"],
    ["generatedAudio", "synthetic-audio-payload"],
    ["stack", "private stack trace"],
    ["path", "C:/private/books/test.epub"],
  ])("rejects forbidden diagnostic field %s", (field, value) => {
    const input = {
      schemaVersion: 1,
      code: "internal-failure",
      category: "internal",
      severity: "fatal",
      [field]: value,
    };

    expect(() => decodeOperationalErrorV1(input)).toThrowError(
      expect.objectContaining({
        message: expect.not.stringContaining(value),
      }),
    );
  });

  it("rejects malformed input without coercion", () => {
    const stringVersion = {
      schemaVersion: "1",
      code: "invalid-input",
      category: "input",
      severity: "recoverable",
    };

    expect(() => decodeOperationalErrorV1(stringVersion)).toThrowError(
      expect.objectContaining({
        code: "malformed",
        message: "Operational error contract is malformed.",
      }),
    );
  });

  it("distinguishes an unsupported version", () => {
    const input = {
      schemaVersion: 2,
      code: "invalid-input",
      category: "input",
      severity: "recoverable",
    };

    expect(() => decodeOperationalErrorV1(input)).toThrowError(
      expect.objectContaining({
        code: "unsupported-version",
        message: "Operational error contract version is unsupported.",
      }),
    );
  });
});
