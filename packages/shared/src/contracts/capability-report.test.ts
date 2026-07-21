import { describe, expect, it } from "vitest";

import {
  CapabilityReportContractError,
  decodeCapabilityReportV1,
} from "./capability-report.js";

function createCapabilityReportInput() {
  return {
    schemaVersion: 1,
    capabilities: {
      localSpeechGeneration: "supported",
      streamingGeneration: "unsupported",
      generationCancellation: "unknown",
      hardwareAcceleration: "unknown",
      cpuFallback: "supported",
    },
  };
}

describe("capability report contract", () => {
  it("round-trips explicit supported, unsupported, and unknown statuses", () => {
    const input = createCapabilityReportInput();
    const report = decodeCapabilityReportV1(input);

    expect(JSON.parse(JSON.stringify(report))).toEqual(input);
    expect(Object.isFrozen(report)).toBe(true);
    expect(Object.isFrozen(report.capabilities)).toBe(true);
  });

  it("requires every v1 capability to have an explicit status", () => {
    const input = createCapabilityReportInput();
    const { cpuFallback: _cpuFallback, ...incompleteCapabilities } =
      input.capabilities;
    void _cpuFallback;

    expect(() =>
      decodeCapabilityReportV1({
        ...input,
        capabilities: incompleteCapabilities,
      }),
    ).toThrow(CapabilityReportContractError);
  });

  it("rejects unknown statuses and fields under the closed v1 policy", () => {
    const unknownStatus = createCapabilityReportInput();
    unknownStatus.capabilities.hardwareAcceleration = "detected";
    const unknownCapability = {
      ...createCapabilityReportInput(),
      capabilities: {
        ...createCapabilityReportInput().capabilities,
        remoteSpeechGeneration: "supported",
      },
    };
    const unknownRootField = {
      ...createCapabilityReportInput(),
      detectedAt: "synthetic timestamp",
    };

    for (const input of [unknownStatus, unknownCapability, unknownRootField]) {
      expect(() => decodeCapabilityReportV1(input)).toThrow(
        CapabilityReportContractError,
      );
    }
  });

  it.each([
    ["modelId", "private-model"],
    ["deviceName", "private-device"],
    ["gpuVendor", "private-vendor"],
    ["path", "C:/private/models/test"],
    ["bookText", "private book text"],
  ])(
    "rejects implementation or private capability field %s",
    (field, value) => {
      const input = createCapabilityReportInput();
      const capabilities = { ...input.capabilities, [field]: value };

      expect(() =>
        decodeCapabilityReportV1({ ...input, capabilities }),
      ).toThrowError(
        expect.objectContaining({
          message: expect.not.stringContaining(value),
        }),
      );
    },
  );

  it("rejects malformed input without coercion", () => {
    const input = {
      ...createCapabilityReportInput(),
      schemaVersion: "1",
    };

    expect(() => decodeCapabilityReportV1(input)).toThrowError(
      expect.objectContaining({
        code: "malformed",
        message: "Capability report contract is malformed.",
      }),
    );
  });

  it("distinguishes an unsupported version", () => {
    const input = createCapabilityReportInput();
    input.schemaVersion = 2;

    expect(() => decodeCapabilityReportV1(input)).toThrowError(
      expect.objectContaining({
        code: "unsupported-version",
        message: "Capability report contract version is unsupported.",
      }),
    );
  });
});
