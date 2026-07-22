import { EpubArchiveError } from "../archive/archive-error.js";

const MEBIBYTE = 1_048_576;

export interface EpubIngestionPolicy {
  readonly maxCompressedEpubBytes: number;
  readonly maxArchiveEntries: number;
  readonly maxTotalUncompressedBytes: number;
  readonly maxEntryUncompressedBytes: number;
  readonly maxContainerOrPackageDocumentBytes: number;
  readonly maxContentDocumentBytes: number;
  readonly maxRasterImageBytes: number;
  readonly maxArchivePathBytes: number;
  readonly maxArchivePathComponentBytes: number;
  readonly maxArchivePathComponents: number;
  readonly maxManifestItems: number;
  readonly maxManifestFallbackChainItems: number;
  readonly maxXmlElementDepth: number;
  readonly maxXmlAttributesPerElement: number;
  readonly maxXmlNodesPerDocument: number;
  readonly maxNavigationDepth: number;
  readonly maxNavigationNodes: number;
  readonly maxSpineItems: number;
  readonly maxSemanticBlocks: number;
  readonly maxDecodedPublicationTextBytes: number;
  readonly maxProcessingTimeMs: number;
  readonly maxCompressionRatio: number;
  readonly compressionRatioGraceBytes: number;
}

export type EpubIngestionPolicyOverrides = Readonly<
  Partial<EpubIngestionPolicy>
>;

export const DEFAULT_EPUB_INGESTION_POLICY: EpubIngestionPolicy = Object.freeze(
  {
    maxCompressedEpubBytes: 100 * MEBIBYTE,
    maxArchiveEntries: 4_096,
    maxTotalUncompressedBytes: 512 * MEBIBYTE,
    maxEntryUncompressedBytes: 64 * MEBIBYTE,
    maxContainerOrPackageDocumentBytes: 2 * MEBIBYTE,
    maxContentDocumentBytes: 8 * MEBIBYTE,
    maxRasterImageBytes: 32 * MEBIBYTE,
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
    maxDecodedPublicationTextBytes: 64 * MEBIBYTE,
    maxProcessingTimeMs: 30_000,
    maxCompressionRatio: 100,
    compressionRatioGraceBytes: MEBIBYTE,
  },
);

function invalidPolicy(): never {
  throw new EpubArchiveError("internal-failure");
}

export function createEpubIngestionPolicy(
  overrides: EpubIngestionPolicyOverrides = {},
): EpubIngestionPolicy {
  const knownKeys = new Set(Object.keys(DEFAULT_EPUB_INGESTION_POLICY));

  for (const key of Object.keys(overrides)) {
    if (!knownKeys.has(key)) {
      return invalidPolicy();
    }
  }

  const policy = {
    ...DEFAULT_EPUB_INGESTION_POLICY,
    ...overrides,
  };

  for (const key of Object.keys(
    DEFAULT_EPUB_INGESTION_POLICY,
  ) as (keyof EpubIngestionPolicy)[]) {
    const value = policy[key];
    if (
      !Number.isSafeInteger(value) ||
      value < 0 ||
      value > DEFAULT_EPUB_INGESTION_POLICY[key]
    ) {
      return invalidPolicy();
    }
  }

  return Object.freeze(policy);
}
