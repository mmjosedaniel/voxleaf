import { ZipReader } from "@zip.js/zip.js/lib/zip-core-native.js";
import {
  openEpubPublication,
  type EpubFailureDetail,
  type OpenedPublication,
  type RasterImageResourceId,
} from "@voxleaf/epub";
import {
  decodeBookV1,
  decodeOperationalErrorV1,
  decodeReadingLocatorV1,
} from "@voxleaf/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  applyEpubFixtureMutations,
  buildComprehensiveEpubFixture,
  buildMinimalEpubFixture,
  minimalChapterDocument,
  minimalContainerDocument,
  minimalNavigationDocument,
  minimalPackageDocument,
  syntheticStaticPngBytes,
} from "../../test-support/epub-fixture.js";
import type { EpubArchiveError } from "../archive/archive-error.js";
import {
  DEFAULT_EPUB_INGESTION_POLICY,
  type EpubIngestionPolicy,
} from "../security/ingestion-policy.js";

const PRIVATE_CANARY =
  "private-title/private/path.xhtml?secret=repository-authored-prose";
const PNG = syntheticStaticPngBytes();

const OPERATIONAL_CODE_BY_DETAIL = Object.freeze({
  "broken-reference": "invalid-input",
  cancelled: "operation-cancelled",
  "invalid-container": "invalid-input",
  "malformed-package": "invalid-input",
  "malformed-xml": "invalid-input",
  "resource-limit-exceeded": "resource-exhausted",
  "unsafe-entry": "invalid-input",
  "unsupported-layout": "unsupported-input",
  "unsupported-protection": "unsupported-input",
  "unsupported-resource": "unsupported-input",
  "unsupported-version": "unsupported-input",
} as const satisfies Readonly<
  Record<
    Exclude<EpubFailureDetail, "internal-failure" | "locator-unresolved">,
    string
  >
>);

interface FailureScenarioInput {
  readonly bytes: Uint8Array;
  readonly signal?: AbortSignal;
}

interface FailureScenario {
  readonly name: string;
  readonly detail: keyof typeof OPERATIONAL_CODE_BY_DETAIL;
  readonly archiveCloseCount: number;
  build(): Promise<FailureScenarioInput>;
}

const FAILURE_SCENARIOS: readonly FailureScenario[] = [
  {
    name: "empty non-ZIP input",
    detail: "invalid-container",
    archiveCloseCount: 1,
    build: async () => ({ bytes: new Uint8Array() }),
  },
  {
    name: "prepended archive data",
    detail: "invalid-container",
    archiveCloseCount: 1,
    build: async () => {
      const source = await buildMinimalEpubFixture();
      return {
        bytes: applyEpubFixtureMutations(source, [
          {
            kind: "prepend",
            description:
              "Move the first physical ZIP header away from byte zero.",
            bytes: Uint8Array.of(0x00),
          },
        ]),
      };
    },
  },
  {
    name: "invalid EPUB mimetype payload",
    detail: "invalid-container",
    archiveCloseCount: 1,
    build: async () => ({
      bytes: await buildMinimalEpubFixture({ mimetype: "text/plain" }),
    }),
  },
  {
    name: "unsafe archive traversal entry",
    detail: "unsafe-entry",
    archiveCloseCount: 1,
    build: async () => ({
      bytes: await buildMinimalEpubFixture({
        additionalEntries: [
          {
            name: `../${PRIVATE_CANARY}`,
            content: PRIVATE_CANARY,
            compression: "stored",
          },
        ],
      }),
    }),
  },
  {
    name: "archive path maximum plus one",
    detail: "resource-limit-exceeded",
    archiveCloseCount: 1,
    build: async () => ({
      bytes: await buildMinimalEpubFixture({
        additionalEntries: [
          {
            name: "a".repeat(
              DEFAULT_EPUB_INGESTION_POLICY.maxArchivePathBytes + 1,
            ),
            content: PRIVATE_CANARY,
            compression: "stored",
          },
        ],
      }),
    }),
  },
  {
    name: "missing container document",
    detail: "invalid-container",
    archiveCloseCount: 1,
    build: async () => ({
      bytes: await buildMinimalEpubFixture({ containerDocument: null }),
    }),
  },
  {
    name: "container document with a DTD",
    detail: "malformed-xml",
    archiveCloseCount: 1,
    build: async () => ({
      bytes: await buildMinimalEpubFixture({
        containerDocument: `<!DOCTYPE container>${minimalContainerDocument()}<!--${PRIVATE_CANARY}-->`,
      }),
    }),
  },
  {
    name: "unsupported EPUB package version",
    detail: "unsupported-version",
    archiveCloseCount: 1,
    build: async () => ({
      bytes: await buildMinimalEpubFixture({
        packageDocument: replaceOnce(
          minimalPackageDocument(),
          `version="3.0"`,
          `version="2.0"`,
        ),
      }),
    }),
  },
  {
    name: "unsupported fixed-layout rendition",
    detail: "unsupported-layout",
    archiveCloseCount: 1,
    build: async () => ({
      bytes: await buildMinimalEpubFixture({
        packageDocument: replaceOnce(
          minimalPackageDocument(),
          "</metadata>",
          `<meta property="rendition:layout">pre-paginated</meta></metadata>`,
        ),
      }),
    }),
  },
  {
    name: "malformed required package metadata",
    detail: "malformed-package",
    archiveCloseCount: 1,
    build: async () => ({
      bytes: await buildMinimalEpubFixture({
        packageDocument: minimalPackageDocument().replace(
          /<dc:title>.*?<\/dc:title>/u,
          `<!--${PRIVATE_CANARY}-->`,
        ),
      }),
    }),
  },
  {
    name: "broken package spine reference",
    detail: "broken-reference",
    archiveCloseCount: 1,
    build: async () => ({
      bytes: await buildMinimalEpubFixture({
        packageDocument: replaceOnce(
          minimalPackageDocument(),
          `<itemref idref="chapter"/>`,
          `<itemref idref="missing-${PRIVATE_CANARY}"/>`,
        ),
      }),
    }),
  },
  {
    name: "unsupported required spine resource",
    detail: "unsupported-resource",
    archiveCloseCount: 1,
    build: async () => ({
      bytes: await buildMinimalEpubFixture({
        packageDocument: replaceOnce(
          minimalPackageDocument(),
          `<item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/>`,
          `<item id="chapter" href="foreign.bin" media-type="application/octet-stream"/>`,
        ),
        additionalEntries: [
          {
            name: "EPUB/foreign.bin",
            content: PRIVATE_CANARY,
            compression: "stored",
          },
        ],
      }),
    }),
  },
  {
    name: "protected publication marker",
    detail: "unsupported-protection",
    archiveCloseCount: 1,
    build: async () => ({
      bytes: await buildMinimalEpubFixture({
        additionalEntries: [
          {
            name: "META-INF/encryption.xml",
            content: `<private>${PRIVATE_CANARY}</private>`,
            compression: "deflate",
          },
        ],
      }),
    }),
  },
  {
    name: "navigation document without a table of contents",
    detail: "malformed-package",
    archiveCloseCount: 1,
    build: async () => ({
      bytes: await buildMinimalEpubFixture({
        navigationDocument: `<html xmlns="http://www.w3.org/1999/xhtml"><body><p>${PRIVATE_CANARY}</p></body></html>`,
      }),
    }),
  },
  {
    name: "remote navigation target",
    detail: "broken-reference",
    archiveCloseCount: 1,
    build: async () => ({
      bytes: await buildMinimalEpubFixture({
        navigationDocument: replaceOnce(
          minimalNavigationDocument(),
          `text/chapter.xhtml#chapter-one`,
          `https://example.invalid/${PRIVATE_CANARY}`,
        ),
      }),
    }),
  },
  {
    name: "XHTML document with an internal DTD",
    detail: "malformed-xml",
    archiveCloseCount: 1,
    build: async () => ({
      bytes: await buildMinimalEpubFixture({
        chapterDocument: `<!DOCTYPE html [<!ENTITY private-canary "private">]>${minimalChapterDocument()}<!--${PRIVATE_CANARY}-->`,
      }),
    }),
  },
  {
    name: "invalid semantic direction",
    detail: "malformed-package",
    archiveCloseCount: 1,
    build: async () => ({
      bytes: await buildMinimalEpubFixture({
        chapterDocument: replaceOnce(
          minimalChapterDocument(),
          "<body>",
          `<body><p dir="sideways">${PRIVATE_CANARY}</p>`,
        ),
      }),
    }),
  },
  {
    name: "missing local raster reference",
    detail: "broken-reference",
    archiveCloseCount: 1,
    build: async () => ({
      bytes: await buildMinimalEpubFixture({
        packageDocument: addManifestItem(
          minimalPackageDocument(),
          `<item id="missing-image" href="images/${PRIVATE_CANARY}.png" media-type="image/png"/>`,
        ),
        chapterDocument: replaceOnce(
          minimalChapterDocument(),
          "</p>",
          `<img src="../images/${PRIVATE_CANARY}.png" alt="${PRIVATE_CANARY}"/></p>`,
        ),
      }),
    }),
  },
  {
    name: "caller cancellation before archive work",
    detail: "cancelled",
    archiveCloseCount: 0,
    build: async () => {
      const controller = new AbortController();
      controller.abort(PRIVATE_CANARY);
      return {
        bytes: await buildMinimalEpubFixture(),
        signal: controller.signal,
      };
    },
  },
];

interface BoundaryProof {
  readonly owner: string;
  readonly behavior: string;
}

const BOUNDARY_PROOFS = Object.freeze({
  maxCompressedEpubBytes: proof(
    "security/processing-budget.test.ts",
    "exact input and maximum plus one",
  ),
  maxArchiveEntries: proof(
    "security/processing-budget.test.ts and archive/archive-inventory.test.ts",
    "exact count and first excess",
  ),
  maxTotalUncompressedBytes: proof(
    "security/processing-budget.test.ts and archive/archive-reader.test.ts",
    "declared and observed exact totals and next byte",
  ),
  maxEntryUncompressedBytes: proof(
    "security/processing-budget.test.ts",
    "declared and observed exact entry bytes and next byte",
  ),
  maxContainerOrPackageDocumentBytes: proof(
    "container/container-resolver.test.ts",
    "exact container/package bytes and maximum plus one",
  ),
  maxContentDocumentBytes: proof(
    "document/xhtml-projector.test.ts",
    "exact XHTML bytes and maximum plus one",
  ),
  maxRasterImageBytes: proof(
    "resource/opened-publication.test.ts",
    "exact raster bytes and maximum plus one",
  ),
  maxArchivePathBytes: proof(
    "paths/archive-path.test.ts",
    "exact UTF-8 path bytes and maximum plus one",
  ),
  maxArchivePathComponentBytes: proof(
    "paths/archive-path.test.ts",
    "exact UTF-8 component bytes and maximum plus one",
  ),
  maxArchivePathComponents: proof(
    "paths/archive-path.test.ts",
    "exact component count and maximum plus one",
  ),
  maxManifestItems: proof(
    "package/package-document.test.ts",
    "exact item count and maximum plus one",
  ),
  maxManifestFallbackChainItems: proof(
    "package/package-document.test.ts",
    "exact fallback depth and maximum plus one",
  ),
  maxXmlElementDepth: proof(
    "xml/xml-event-reader.test.ts",
    "exact depth and maximum plus one",
  ),
  maxXmlAttributesPerElement: proof(
    "xml/xml-event-reader.test.ts",
    "exact attributes and maximum plus one",
  ),
  maxXmlNodesPerDocument: proof(
    "xml/xml-event-reader.test.ts",
    "exact nodes and maximum plus one",
  ),
  maxNavigationDepth: proof(
    "navigation/navigation-document.test.ts",
    "exact hierarchy depth and maximum plus one",
  ),
  maxNavigationNodes: proof(
    "navigation/navigation-document.test.ts",
    "exact navigation nodes and maximum plus one",
  ),
  maxSpineItems: proof(
    "package/package-document.test.ts",
    "exact spine count and maximum plus one",
  ),
  maxSemanticBlocks: proof(
    "document/xhtml-projector.test.ts and security/processing-budget.test.ts",
    "exact publication blocks and maximum plus one",
  ),
  maxDecodedPublicationTextBytes: proof(
    "xml/xml-event-reader.test.ts and security/processing-budget.test.ts",
    "exact aggregate decoded text and next byte",
  ),
  maxProcessingTimeMs: proof(
    "security/processing-budget.test.ts",
    "exact deadline and first millisecond beyond it",
  ),
  maxCompressionRatio: proof(
    "security/processing-budget.test.ts and archive/archive-reader.test.ts",
    "exact declared/observed ratio and ratio plus one",
  ),
  compressionRatioGraceBytes: proof(
    "security/processing-budget.test.ts",
    "exact grace transition for entry and aggregate ratios",
  ),
} satisfies Readonly<Record<keyof EpubIngestionPolicy, BoundaryProof>>);

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("public EPUB ingestion matrix", () => {
  it("assembles deterministic rich output and exercises resources and locators", async () => {
    const { worker, fetch } = prohibitExternalCapabilities();
    const bytes = await buildComprehensiveEpubFixture();
    const first = await requirePublication(bytes);
    const second = await requirePublication(bytes.slice());

    try {
      expect(publicationSnapshot(first)).toEqual(publicationSnapshot(second));
      expect(decodeBookV1(first.book)).toEqual(first.book);
      expect(first.book.spine).toHaveLength(3);
      expect(first.documents.map((document) => document.location)).toEqual([
        { kind: "non-spine" },
        { kind: "spine", spineItemId: "spine:0", spineItemIndex: 0 },
        { kind: "spine", spineItemId: "spine:1", spineItemIndex: 1 },
        { kind: "spine", spineItemId: "spine:2", spineItemIndex: 2 },
      ]);
      expect(first.navigation).toMatchObject([
        {
          kind: "group",
          label: "Part One",
          children: [
            { kind: "link", label: "Opening" },
            { kind: "link", label: "Continuation" },
          ],
        },
        { kind: "link", label: "Appendix" },
      ]);
      expect(first.resources).toEqual([
        { id: "resource:5", kind: "raster-image", mediaType: "image/png" },
      ]);
      expect(first.locators.length).toBeGreaterThan(8);
      expect(
        new Set(
          first.locators.map(({ startLocator }) =>
            JSON.stringify(startLocator),
          ),
        ).size,
      ).toBe(first.locators.length);
      expect(
        first.locators.some(
          ({ startLocator }) => startLocator.anchor.value === "duplicate",
        ),
      ).toBe(false);

      for (const locatedBlock of first.locators) {
        expect(decodeReadingLocatorV1(locatedBlock.startLocator)).toEqual(
          locatedBlock.startLocator,
        );
        expect(first.resolveLocator(locatedBlock.startLocator)).toEqual({
          status: "exact",
          reason: "exact",
          locator: locatedBlock.startLocator,
          locatedBlock,
        });
      }

      const firstLocatedBlock = required(first.locators[0]);
      const recovered = first.resolveLocator({
        ...firstLocatedBlock.startLocator,
        anchor: {
          ...firstLocatedBlock.startLocator.anchor,
          value: "missing.synthetic.anchor",
          anchorIndex: 999,
        },
        textOffsetCodePoints: 999,
      });
      expect(recovered.status).toBe("recovered");
      expect(recovered.reason).toBe("nearest-anchor");
      expect(recovered.locator.textOffsetCodePoints).toBeLessThanOrEqual(
        recovered.locatedBlock.textLengthCodePoints,
      );

      const locatorError = captureFixedError(() =>
        first.resolveLocator({
          ...firstLocatedBlock.startLocator,
          bookIdentity: {
            ...firstLocatedBlock.startLocator.bookIdentity,
            value: "0".repeat(64),
          },
          privateText: PRIVATE_CANARY,
        }),
      );
      expectFixedError(locatorError, "locator-unresolved");

      const resource = required(first.resources[0]);
      const firstRead = await first.readResource(resource.id);
      expect(firstRead).toEqual(PNG);
      firstRead[0] = 0;
      await expect(first.readResource(resource.id)).resolves.toEqual(PNG);

      const controller = new AbortController();
      controller.abort(PRIVATE_CANARY);
      const cancellation = await captureFixedAsyncError(() =>
        first.readResource(resource.id, { signal: controller.signal }),
      );
      expectFixedError(cancellation, "cancelled");
      expect(first.closed).toBe(false);
      expect(worker).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      await Promise.all([first.close(), second.close()]);
    }
  });

  it("keeps malformed lazy resource bytes private and returns no partial data", async () => {
    const packageDocument = addManifestItem(
      minimalPackageDocument(),
      `<item id="private-image" href="images/private.png" media-type="image/png"/>`,
    );
    const publication = await requirePublication(
      await buildMinimalEpubFixture({
        packageDocument,
        additionalEntries: [
          {
            name: "EPUB/images/private.png",
            content: PRIVATE_CANARY,
            compression: "stored",
          },
        ],
      }),
    );

    try {
      let returned: Uint8Array | undefined;
      const error = await captureFixedAsyncError(async () => {
        returned = await publication.readResource(
          "resource:2" as RasterImageResourceId,
        );
      });

      expectFixedError(error, "malformed-package");
      expect(returned).toBeUndefined();
    } finally {
      await publication.close();
    }
  });

  it("closes publication state idempotently and rejects later operations safely", async () => {
    const publication = await requirePublication(
      await buildComprehensiveEpubFixture(),
    );
    const resource = required(publication.resources[0]);
    const firstClose = publication.close();
    const secondClose = publication.close();

    expect(secondClose).toBe(firstClose);
    await firstClose;
    expect(publication.closed).toBe(true);
    expectFixedError(
      await captureFixedAsyncError(() => publication.readResource(resource.id)),
      "internal-failure",
    );
    expectFixedError(
      captureFixedError(() =>
        publication.resolveLocator(
          required(publication.locators[0]).startLocator,
        ),
      ),
      "internal-failure",
    );
  });

  it.each(FAILURE_SCENARIOS)(
    "returns a safe complete failure for $name",
    async (scenario) => {
      const { worker, fetch, logSpies } = prohibitExternalCapabilities();
      const close = vi.spyOn(ZipReader.prototype, "close");
      const input = await scenario.build();
      const result = await openEpubPublication(input.bytes, {
        ...(input.signal === undefined ? {} : { signal: input.signal }),
      });

      expect(result.ok).toBe(false);
      if (result.ok) {
        await result.publication.close();
        throw new Error("expected a fixed failure result");
      }

      expect(result).toEqual({
        ok: false,
        detail: scenario.detail,
        error: expect.objectContaining({
          code: OPERATIONAL_CODE_BY_DETAIL[scenario.detail],
        }),
      });
      expect(Object.keys(result)).toEqual(["ok", "detail", "error"]);
      expect(result).not.toHaveProperty("publication");
      expect(decodeOperationalErrorV1(result.error)).toEqual(result.error);
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.error)).toBe(true);
      expect(JSON.stringify(result)).not.toContain(PRIVATE_CANARY);
      expect(close).toHaveBeenCalledTimes(scenario.archiveCloseCount);
      expect(worker).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
      for (const log of logSpies) {
        expect(log).not.toHaveBeenCalled();
      }
    },
  );

  it("keeps exact and maximum-plus-one proof ownership exhaustive", () => {
    expect(Object.keys(BOUNDARY_PROOFS).sort()).toEqual(
      Object.keys(DEFAULT_EPUB_INGESTION_POLICY).sort(),
    );
    for (const boundary of Object.values(BOUNDARY_PROOFS)) {
      expect(boundary.owner).toContain(".test.ts");
      expect(boundary.behavior).toMatch(/exact|grace/u);
    }
  });
});

function proof(owner: string, behavior: string): BoundaryProof {
  return Object.freeze({ owner, behavior });
}

function replaceOnce(
  source: string,
  search: string,
  replacement: string,
): string {
  if (!source.includes(search)) {
    throw new Error("fixture-template-mismatch");
  }
  return source.replace(search, replacement);
}

function addManifestItem(packageDocument: string, item: string): string {
  return replaceOnce(packageDocument, "</manifest>", `${item}</manifest>`);
}

function required<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error("expected synthetic fixture value");
  }
  return value;
}

async function requirePublication(
  bytes: Uint8Array,
): Promise<OpenedPublication> {
  const result = await openEpubPublication(bytes);
  if (!result.ok) {
    throw new Error(`unexpected fixed failure: ${result.detail}`);
  }
  return result.publication;
}

function publicationSnapshot(publication: OpenedPublication): unknown {
  return {
    book: publication.book,
    documents: publication.documents,
    navigation: publication.navigation,
    resources: publication.resources,
    locators: publication.locators.map(
      ({ documentId, block, startLocator, textLengthCodePoints }) => ({
        documentId,
        block,
        startLocator,
        textLengthCodePoints,
      }),
    ),
  };
}

function captureFixedError(action: () => unknown): EpubArchiveError {
  try {
    action();
  } catch (error: unknown) {
    return error as EpubArchiveError;
  }
  throw new Error("expected fixed EPUB error");
}

async function captureFixedAsyncError(
  action: () => Promise<unknown>,
): Promise<EpubArchiveError> {
  try {
    await action();
  } catch (error: unknown) {
    return error as EpubArchiveError;
  }
  throw new Error("expected fixed EPUB error");
}

function expectFixedError(
  error: EpubArchiveError,
  code:
    | "cancelled"
    | "internal-failure"
    | "locator-unresolved"
    | "malformed-package",
): void {
  expect(error).toMatchObject({ code, message: code });
  expect(error.cause).toBeUndefined();
  expect(JSON.stringify(error)).not.toContain(PRIVATE_CANARY);
}

function prohibitExternalCapabilities(): {
  readonly worker: ReturnType<typeof vi.fn>;
  readonly fetch: ReturnType<typeof vi.fn>;
  readonly logSpies: readonly ReturnType<typeof vi.spyOn>[];
} {
  const worker = vi.fn(() => {
    throw new Error("worker must not be constructed");
  });
  const fetch = vi.fn(() => {
    throw new Error("network must not be requested");
  });
  vi.stubGlobal("Worker", worker);
  vi.stubGlobal("fetch", fetch);
  const logSpies = [
    vi.spyOn(console, "debug").mockImplementation(() => undefined),
    vi.spyOn(console, "info").mockImplementation(() => undefined),
    vi.spyOn(console, "log").mockImplementation(() => undefined),
    vi.spyOn(console, "warn").mockImplementation(() => undefined),
    vi.spyOn(console, "error").mockImplementation(() => undefined),
  ];
  return { worker, fetch, logSpies };
}
