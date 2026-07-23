import { validateReadingSessionV1Wire } from "../generated/validators/index.js";
import {
  createBookId,
  createGenerationId,
  createSchemaVersion,
  createSessionId,
} from "../primitives/index.js";
import type {
  GenerationId,
  SchemaVersion,
  SessionId,
} from "../primitives/index.js";
import type { BookIdentityV1 } from "./book.js";

const READING_SESSION_SCHEMA_VERSION_V1 = createSchemaVersion(1);

export type ReadingSessionContractErrorCode =
  "malformed" | "unsupported-version";

export class ReadingSessionContractError extends Error {
  public readonly code: ReadingSessionContractErrorCode;

  public constructor(code: ReadingSessionContractErrorCode) {
    super(
      code === "unsupported-version"
        ? "Reading session contract version is unsupported."
        : "Reading session contract is malformed.",
    );
    this.name = "ReadingSessionContractError";
    this.code = code;
  }
}

export interface ReadingSessionV1 {
  readonly schemaVersion: SchemaVersion;
  readonly sessionId: SessionId;
  readonly bookIdentity: BookIdentityV1;
  readonly generationId: GenerationId;
}

export interface GenerationWorkIdentityV1 {
  readonly sessionId: SessionId;
  readonly generationId: GenerationId;
}

export interface GenerationCancellationIntentV1 {
  readonly kind: "cancel-generation";
  readonly target: GenerationWorkIdentityV1;
}

export type GenerationWorkEligibilityV1 =
  "eligible" | "stale-session" | "stale-generation";

function malformedReadingSession(): never {
  throw new ReadingSessionContractError("malformed");
}

function readRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return malformedReadingSession();
  }

  return value as Record<string, unknown>;
}

function readSupportedVersion(value: unknown): SchemaVersion {
  let version: SchemaVersion;

  try {
    version = createSchemaVersion(value);
  } catch {
    return malformedReadingSession();
  }

  if (version !== READING_SESSION_SCHEMA_VERSION_V1) {
    throw new ReadingSessionContractError("unsupported-version");
  }

  return version;
}

export function getGenerationWorkIdentity(
  session: ReadingSessionV1,
): GenerationWorkIdentityV1 {
  return Object.freeze({
    sessionId: session.sessionId,
    generationId: session.generationId,
  });
}

export function createGenerationCancellationIntent(
  target: GenerationWorkIdentityV1,
): GenerationCancellationIntentV1 {
  return Object.freeze({
    kind: "cancel-generation",
    target: Object.freeze({
      sessionId: target.sessionId,
      generationId: target.generationId,
    }),
  });
}

export function classifyGenerationWorkEligibility(
  activeSession: ReadingSessionV1 | undefined,
  work: GenerationWorkIdentityV1,
): GenerationWorkEligibilityV1 {
  if (
    activeSession === undefined ||
    activeSession.sessionId !== work.sessionId
  ) {
    return "stale-session";
  }

  if (activeSession.generationId !== work.generationId) {
    return "stale-generation";
  }

  return "eligible";
}

export function isGenerationWorkEligible(
  activeSession: ReadingSessionV1 | undefined,
  work: GenerationWorkIdentityV1,
): boolean {
  return classifyGenerationWorkEligibility(activeSession, work) === "eligible";
}

export function decodeReadingSessionV1(input: unknown): ReadingSessionV1 {
  const session = readRecord(input);
  const schemaVersion = readSupportedVersion(session.schemaVersion);

  if (!validateReadingSessionV1Wire(input)) {
    return malformedReadingSession();
  }

  return Object.freeze({
    schemaVersion,
    sessionId: createSessionId(input.sessionId),
    bookIdentity: Object.freeze({
      scheme: input.bookIdentity.scheme,
      schemeVersion: createSchemaVersion(input.bookIdentity.schemeVersion),
      value: createBookId(input.bookIdentity.value),
    }),
    generationId: createGenerationId(input.generationId),
  });
}
