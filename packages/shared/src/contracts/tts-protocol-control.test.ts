import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  TtsProtocolControlContractError,
  decodeTtsProtocolControlV1,
} from "./tts-protocol-control.js";

const FIXTURE_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../fixtures/contracts/tts-protocol-control/v1",
);

const VALID_FIXTURES = [
  "valid-handshake.json",
  "valid-load.json",
  "valid-warm.json",
  "valid-synthesize.json",
  "valid-cancel.json",
  "valid-health.json",
  "valid-shutdown.json",
  "valid-handshake-accepted.json",
  "valid-state.json",
  "valid-capabilities.json",
  "valid-audio-metadata.json",
  "valid-completed.json",
  "valid-cancelled.json",
  "valid-error.json",
  "valid-protocol-rejected.json",
] as const;

const INVALID_FIXTURES = [
  "invalid-unknown-field.json",
  "invalid-unsupported-protocol.json",
  "invalid-unknown-kind.json",
] as const;

async function readJson(name: string): Promise<unknown> {
  return JSON.parse(
    await readFile(resolve(FIXTURE_ROOT, name), "utf8"),
  ) as unknown;
}

function cloneRecord(input: unknown): Record<string, unknown> {
  return structuredClone(input) as Record<string, unknown>;
}

describe("TTS protocol control v1", () => {
  it.each(VALID_FIXTURES)("decodes and deeply freezes %s", async (name) => {
    const decoded = decodeTtsProtocolControlV1(await readJson(name));

    expect(Object.isFrozen(decoded)).toBe(true);
    if ("segment" in decoded) {
      expect(Object.isFrozen(decoded.segment)).toBe(true);
      expect(Object.isFrozen(decoded.segment.sourceRange)).toBe(true);
    }
  });

  it.each(INVALID_FIXTURES)(
    "rejects %s without exposing input",
    async (name) => {
      const input = await readJson(name);
      expect(() => decodeTtsProtocolControlV1(input)).toThrow(
        TtsProtocolControlContractError,
      );
    },
  );

  it("enforces exact narration code-point and UTF-8 byte bounds", async () => {
    const fixture = cloneRecord(await readJson("valid-synthesize.json"));
    const segment = fixture.segment as Record<string, unknown>;

    segment.text = "a".repeat(640);
    expect(decodeTtsProtocolControlV1(fixture).kind).toBe("synthesize");

    segment.text = "a".repeat(641);
    expect(() => decodeTtsProtocolControlV1(fixture)).toThrow(
      TtsProtocolControlContractError,
    );

    segment.text = "😀".repeat(512);
    expect(decodeTtsProtocolControlV1(fixture).kind).toBe("synthesize");

    segment.text = "😀".repeat(513);
    expect(() => decodeTtsProtocolControlV1(fixture)).toThrow(
      TtsProtocolControlContractError,
    );
  });

  it("rejects audio byte arithmetic and error-semantic drift", async () => {
    const metadata = cloneRecord(await readJson("valid-audio-metadata.json"));
    metadata.payloadBytes = 19_196;
    expect(() => decodeTtsProtocolControlV1(metadata)).toThrow(
      TtsProtocolControlContractError,
    );

    const errorMessage = cloneRecord(await readJson("valid-error.json"));
    const operationalError = errorMessage.error as Record<string, unknown>;
    operationalError.code = "invalid-input";
    operationalError.category = "input";
    expect(() => decodeTtsProtocolControlV1(errorMessage)).toThrow(
      TtsProtocolControlContractError,
    );
  });

  it("distinguishes unsupported control versions from malformed input", () => {
    expect(() =>
      decodeTtsProtocolControlV1({
        schemaVersion: 2,
        protocolVersion: 1,
        kind: "health",
        serviceInstanceId: "service:synthetic-1",
      }),
    ).toThrow(
      expect.objectContaining({
        code: "unsupported-version",
      }),
    );
    expect(() => decodeTtsProtocolControlV1({ schemaVersion: "1" })).toThrow(
      expect.objectContaining({
        code: "malformed",
      }),
    );
  });
});
