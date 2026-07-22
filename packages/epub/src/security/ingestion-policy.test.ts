import { describe, expect, it } from "vitest";

import { EpubArchiveError } from "../archive/archive-error.js";
import {
  createEpubIngestionPolicy,
  DEFAULT_EPUB_INGESTION_POLICY,
} from "./ingestion-policy.js";

describe("EPUB ingestion policy", () => {
  it("centralizes the accepted ADR limits in one immutable default", () => {
    expect(DEFAULT_EPUB_INGESTION_POLICY).toMatchObject({
      maxCompressedEpubBytes: 100 * 1_048_576,
      maxArchiveEntries: 4_096,
      maxTotalUncompressedBytes: 512 * 1_048_576,
      maxEntryUncompressedBytes: 64 * 1_048_576,
      maxContainerOrPackageDocumentBytes: 2 * 1_048_576,
      maxContentDocumentBytes: 8 * 1_048_576,
      maxRasterImageBytes: 32 * 1_048_576,
      maxArchivePathBytes: 2_048,
      maxArchivePathComponentBytes: 255,
      maxArchivePathComponents: 32,
      maxManifestItems: 4_096,
      maxManifestFallbackChainItems: 32,
      maxXmlElementDepth: 128,
      maxXmlAttributesPerElement: 256,
      maxXmlNodesPerDocument: 250_000,
      maxNavigationDepth: 32,
      maxNavigationNodes: 10_000,
      maxSpineItems: 4_096,
      maxSemanticBlocks: 200_000,
      maxDecodedPublicationTextBytes: 64 * 1_048_576,
      maxProcessingTimeMs: 30_000,
      maxCompressionRatio: 100,
      compressionRatioGraceBytes: 1_048_576,
    });
    expect(Object.isFrozen(DEFAULT_EPUB_INGESTION_POLICY)).toBe(true);
    expect(createEpubIngestionPolicy()).toEqual(DEFAULT_EPUB_INGESTION_POLICY);
  });

  it("creates immutable policies with equal or stricter overrides", () => {
    const policy = createEpubIngestionPolicy({
      maxArchiveEntries: 10,
      maxProcessingTimeMs: 500,
      maxCompressionRatio: 20,
    });

    expect(policy).toMatchObject({
      maxArchiveEntries: 10,
      maxProcessingTimeMs: 500,
      maxCompressionRatio: 20,
      maxEntryUncompressedBytes: 64 * 1_048_576,
    });
    expect(Object.isFrozen(policy)).toBe(true);
  });

  it.each([
    { maxArchiveEntries: 4_097 },
    { maxArchiveEntries: -1 },
    { maxArchiveEntries: 1.5 },
    { maxArchiveEntries: Number.NaN },
    { maxArchiveEntries: Number.POSITIVE_INFINITY },
    { unknownLimit: 1 },
  ])("rejects an invalid or permissive override", (overrides) => {
    const action = () =>
      createEpubIngestionPolicy(
        overrides as Parameters<typeof createEpubIngestionPolicy>[0],
      );

    expect(action).toThrowError(
      expect.objectContaining({
        code: "internal-failure",
        message: "internal-failure",
      }),
    );
    expect(action).toThrow(EpubArchiveError);
  });
});
