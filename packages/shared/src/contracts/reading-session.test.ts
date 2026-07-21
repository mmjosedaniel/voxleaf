import { describe, expect, it } from "vitest";

import type { GenerationId } from "../primitives/index.js";
import {
  ReadingSessionContractError,
  classifyGenerationWorkEligibility,
  createGenerationCancellationIntent,
  decodeReadingSessionV1,
  getGenerationWorkIdentity,
  isGenerationWorkEligible,
} from "./reading-session.js";

function createReadingSessionInput() {
  return {
    schemaVersion: 1,
    sessionId: "session:synthetic-1",
    bookIdentity: {
      scheme: "synthetic-test",
      schemeVersion: 1,
      value: "book-test-001",
    },
    generationId: "generation:synthetic-1",
  };
}

describe("reading session contract", () => {
  it("round-trips a content-free active session exactly", () => {
    const input = createReadingSessionInput();
    const session = decodeReadingSessionV1(input);

    expect(JSON.parse(JSON.stringify(session))).toEqual(input);
    expect(session).not.toHaveProperty("locator");
    expect(session).not.toHaveProperty("bookText");
  });

  it("keeps session and generation identities distinct at compile time", () => {
    const session = decodeReadingSessionV1(createReadingSessionInput());
    const acceptGenerationId = (value: GenerationId): void => {
      void value;
    };

    // @ts-expect-error A SessionId must not be accepted where a GenerationId is required.
    acceptGenerationId(session.sessionId);

    expect(session.generationId).toBe("generation:synthetic-1");
  });

  it("rejects malformed identities and undeclared content fields", () => {
    const emptySessionId = createReadingSessionInput();
    emptySessionId.sessionId = "";
    const malformedGenerationId = createReadingSessionInput();
    malformedGenerationId.generationId = "\u0000private-generation";
    const withBookText = {
      ...createReadingSessionInput(),
      bookText: "private book text",
    };

    for (const input of [emptySessionId, malformedGenerationId, withBookText]) {
      expect(() => decodeReadingSessionV1(input)).toThrow(
        ReadingSessionContractError,
      );
    }
  });

  it("rejects malformed input without coercion", () => {
    const stringVersion = {
      ...createReadingSessionInput(),
      schemaVersion: "1",
    };
    const numericSessionId = {
      ...createReadingSessionInput(),
      sessionId: 1,
    };

    for (const input of [stringVersion, numericSessionId]) {
      expect(() => decodeReadingSessionV1(input)).toThrowError(
        expect.objectContaining({
          code: "malformed",
          message: "Reading session contract is malformed.",
        }),
      );
    }
  });

  it("distinguishes an unsupported version", () => {
    const input = createReadingSessionInput();
    input.schemaVersion = 2;

    expect(() => decodeReadingSessionV1(input)).toThrowError(
      expect.objectContaining({
        code: "unsupported-version",
        message: "Reading session contract version is unsupported.",
      }),
    );
  });
});

describe("generation work eligibility", () => {
  it("accepts work owned by the active session and generation", () => {
    const activeSession = decodeReadingSessionV1(createReadingSessionInput());
    const work = getGenerationWorkIdentity(activeSession);

    expect(classifyGenerationWorkEligibility(activeSession, work)).toBe(
      "eligible",
    );
    expect(isGenerationWorkEligible(activeSession, work)).toBe(true);
  });

  it("rejects work from a replaced or missing session", () => {
    const originalSession = decodeReadingSessionV1(createReadingSessionInput());
    const staleWork = getGenerationWorkIdentity(originalSession);
    const replacementInput = createReadingSessionInput();
    replacementInput.sessionId = "session:synthetic-2";
    const replacementSession = decodeReadingSessionV1(replacementInput);

    expect(
      classifyGenerationWorkEligibility(replacementSession, staleWork),
    ).toBe("stale-session");
    expect(classifyGenerationWorkEligibility(undefined, staleWork)).toBe(
      "stale-session",
    );
    expect(isGenerationWorkEligible(replacementSession, staleWork)).toBe(false);
  });

  it("rejects work from an earlier generation in the same session", () => {
    const originalSession = decodeReadingSessionV1(createReadingSessionInput());
    const staleWork = getGenerationWorkIdentity(originalSession);
    const replacementInput = createReadingSessionInput();
    replacementInput.generationId = "generation:synthetic-2";
    const replacementSession = decodeReadingSessionV1(replacementInput);

    expect(
      classifyGenerationWorkEligibility(replacementSession, staleWork),
    ).toBe("stale-generation");
    expect(isGenerationWorkEligible(replacementSession, staleWork)).toBe(false);
  });

  it("keeps cancellation intent separate from stale-result rejection", () => {
    const activeSession = decodeReadingSessionV1(createReadingSessionInput());
    const work = getGenerationWorkIdentity(activeSession);
    const cancellation = createGenerationCancellationIntent(work);

    expect(cancellation).toEqual({
      kind: "cancel-generation",
      target: work,
    });
    expect(Object.isFrozen(cancellation)).toBe(true);
    expect(Object.isFrozen(cancellation.target)).toBe(true);
    expect(classifyGenerationWorkEligibility(activeSession, work)).toBe(
      "eligible",
    );
  });

  it("does not expose malformed input through errors", () => {
    const input = createReadingSessionInput();
    input.generationId = " private generation identifier ";

    expect(() => decodeReadingSessionV1(input)).toThrowError(
      expect.objectContaining({
        message: expect.not.stringContaining("private generation identifier"),
      }),
    );
  });
});
