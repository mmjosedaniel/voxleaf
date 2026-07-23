import type { AnySchema } from "ajv";
import Ajv2020 from "ajv/dist/2020.js";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  validateAudioFrameV1Wire,
  validateBookV1Wire,
  validateBufferStatusV1Wire,
  validateCapabilityReportV1Wire,
  validateLocatorRangeV1Wire,
  validateNarrationSegmentV1Wire,
  validateOperationalErrorV1Wire,
  validatePersistedReadingStateV1Wire,
  validateReadingLocatorV1Wire,
  validateReadingSessionV1Wire,
} from "../generated/validators/index.js";

const CONTRACT_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../fixtures/contracts",
);
const SCHEMA_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../schemas",
);

const SCHEMA_FILES = [
  "primitives/v1.schema.json",
  "book/v1.schema.json",
  "locator/v1.schema.json",
  "locator-range/v1.schema.json",
  "persisted-reading-state/v1.schema.json",
  "reading-session/v1.schema.json",
  "narration-segment/v1.schema.json",
  "operational-error/v1.schema.json",
  "capability-report/v1.schema.json",
  "audio-frame/v1.schema.json",
  "buffer-status/v1.schema.json",
] as const;

type FixtureExpectation = "valid" | "invalid";

interface SerializedFixtureCase {
  readonly id: string;
  readonly fixture: string;
  readonly schemaId: string;
  readonly expected: FixtureExpectation;
  readonly containsSensitiveNarrationText?: true;
}

interface SerializedFixtureManifest {
  readonly cases: readonly SerializedFixtureCase[];
}

type StandaloneValidator = (input: unknown) => boolean;

const STANDALONE_VALIDATORS_BY_SCHEMA_ID: Readonly<
  Record<string, StandaloneValidator>
> = Object.freeze({
  "urn:voxleaf:schema:audio-frame:v1": validateAudioFrameV1Wire,
  "urn:voxleaf:schema:book:v1": validateBookV1Wire,
  "urn:voxleaf:schema:buffer-status:v1": validateBufferStatusV1Wire,
  "urn:voxleaf:schema:capability-report:v1": validateCapabilityReportV1Wire,
  "urn:voxleaf:schema:locator-range:v1": validateLocatorRangeV1Wire,
  "urn:voxleaf:schema:locator:v1": validateReadingLocatorV1Wire,
  "urn:voxleaf:schema:narration-segment:v1": validateNarrationSegmentV1Wire,
  "urn:voxleaf:schema:operational-error:v1": validateOperationalErrorV1Wire,
  "urn:voxleaf:schema:persisted-reading-state:v1":
    validatePersistedReadingStateV1Wire,
  "urn:voxleaf:schema:reading-session:v1": validateReadingSessionV1Wire,
});

function readRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Serialized fixture manifest is malformed.");
  }

  return value as Record<string, unknown>;
}

function readString(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error("Serialized fixture manifest is malformed.");
  }

  return value;
}

function decodeFixtureManifest(input: unknown): SerializedFixtureManifest {
  const manifest = readRecord(input);
  if (!Array.isArray(manifest.cases)) {
    throw new Error("Serialized fixture manifest is malformed.");
  }

  return Object.freeze({
    cases: Object.freeze(
      manifest.cases.map((entry) => {
        const fixture = readRecord(entry);
        const expected = readString(fixture.expected);
        if (expected !== "valid" && expected !== "invalid") {
          throw new Error("Serialized fixture manifest is malformed.");
        }

        const containsSensitiveNarrationText =
          fixture.containsSensitiveNarrationText;
        if (
          containsSensitiveNarrationText !== undefined &&
          containsSensitiveNarrationText !== true
        ) {
          throw new Error("Serialized fixture manifest is malformed.");
        }

        return Object.freeze({
          id: readString(fixture.id),
          fixture: readString(fixture.fixture),
          schemaId: readString(fixture.schemaId),
          expected,
          ...(containsSensitiveNarrationText === true
            ? { containsSensitiveNarrationText: true as const }
            : {}),
        });
      }),
    ),
  });
}

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, "utf8")) as unknown;
}

describe("canonical serialized contract fixtures", () => {
  it("validates every shared fixture against its offline canonical schema", async () => {
    const manifest = decodeFixtureManifest(
      await readJson(resolve(CONTRACT_ROOT, "manifest.json")),
    );
    const schemas = await Promise.all(
      SCHEMA_FILES.map((schemaFile) =>
        readJson(resolve(SCHEMA_ROOT, schemaFile)),
      ),
    );
    const validator = new Ajv2020({
      allErrors: true,
      coerceTypes: false,
      removeAdditional: false,
      strict: true,
      useDefaults: false,
    });

    for (const schema of schemas) {
      validator.addSchema(schema as AnySchema);
    }

    for (const fixtureCase of manifest.cases) {
      const validate = validator.getSchema(fixtureCase.schemaId);
      const standaloneValidate =
        STANDALONE_VALIDATORS_BY_SCHEMA_ID[fixtureCase.schemaId];
      const fixture = await readJson(
        resolve(CONTRACT_ROOT, fixtureCase.fixture),
      );

      expect(validate, fixtureCase.id).toBeDefined();
      expect(standaloneValidate, fixtureCase.id).toBeDefined();
      const canonicalResult = validate!(fixture);
      const standaloneResult = standaloneValidate!(fixture);

      expect(
        canonicalResult,
        `${fixtureCase.id}: ${validator.errorsText(validate!.errors)}`,
      ).toBe(fixtureCase.expected === "valid");
      expect(
        standaloneResult,
        `${fixtureCase.id}: standalone validator drifted from the canonical schema`,
      ).toBe(canonicalResult);
    }
  });

  it("marks the only narration-text fixture explicitly and preserves coverage of every required family", async () => {
    const manifest = decodeFixtureManifest(
      await readJson(resolve(CONTRACT_ROOT, "manifest.json")),
    );

    expect(
      manifest.cases
        .filter((fixtureCase) => fixtureCase.containsSensitiveNarrationText)
        .map((fixtureCase) => fixtureCase.id),
    ).toEqual(["narration-segment-v1-sensitive-valid"]);
    expect(
      new Set(manifest.cases.map((fixtureCase) => fixtureCase.schemaId)),
    ).toEqual(
      new Set([
        "urn:voxleaf:schema:book:v1",
        "urn:voxleaf:schema:locator:v1",
        "urn:voxleaf:schema:locator-range:v1",
        "urn:voxleaf:schema:persisted-reading-state:v1",
        "urn:voxleaf:schema:reading-session:v1",
        "urn:voxleaf:schema:narration-segment:v1",
        "urn:voxleaf:schema:operational-error:v1",
        "urn:voxleaf:schema:capability-report:v1",
        "urn:voxleaf:schema:audio-frame:v1",
        "urn:voxleaf:schema:buffer-status:v1",
      ]),
    );
  });
});
