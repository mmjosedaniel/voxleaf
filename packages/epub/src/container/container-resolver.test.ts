import {
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipWriter,
} from "@zip.js/zip.js/lib/zip-core-native.js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EpubArchiveError } from "../archive/archive-error.js";
import { openEpubArchive } from "../archive/archive-inventory.js";
import type { EpubProcessingBudgetOptions } from "../security/processing-budget.js";
import { resolveContainerPackage } from "./container-resolver.js";

const PACKAGE_MEDIA_TYPE = "application/oebps-package+xml";
const ZIP_WRITER_OPTIONS = Object.freeze({
  dataDescriptor: false,
  extendedTimestamp: false,
  keepOrder: true,
  lastModDate: new Date("2000-01-01T00:00:00.000Z"),
  transferStreams: false,
  useCompressionStream: false,
  useWebWorkers: false,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("container.xml package resolution", () => {
  it("selects one local EPUB 3 reflowable package without network, workers, or public state", async () => {
    const worker = vi.fn(() => {
      throw new Error("worker must not be constructed");
    });
    const fetch = vi.fn(() => {
      throw new Error("network must not be requested");
    });
    vi.stubGlobal("Worker", worker);
    vi.stubGlobal("fetch", fetch);
    const packageDocument = createPackageDocument();

    await withArchive(
      [
        [
          "META-INF/container.xml",
          createContainerDocument(rootfile("EPUB/package.opf")),
        ],
        ["EPUB/package.opf", packageDocument],
      ],
      {},
      async (archive) => {
        const resolved = await resolveContainerPackage(archive);

        expect(resolved).toMatchObject({
          path: "EPUB/package.opf",
          version: "3.0",
          renditionLayout: "reflowable",
        });
        expect(new TextDecoder().decode(resolved.bytes)).toBe(packageDocument);
        expect(Object.isFrozen(resolved)).toBe(true);
        expect(worker).not.toHaveBeenCalled();
        expect(fetch).not.toHaveBeenCalled();
      },
    );
  });

  it("uses namespace URIs, decodes a local IRI, and ignores bounded container extensions", async () => {
    const container = `<?xml version="1.0"?>
      <ocf:container xmlns:ocf="urn:oasis:names:tc:opendocument:xmlns:container"
                     xmlns:ext="urn:example:extension" version="1.0">
        <ext:metadata>ignored extension text</ext:metadata>
        <ocf:rootfiles>
          <ocf:rootfile full-path="EPUB/package%20file.opf"
                        media-type="${PACKAGE_MEDIA_TYPE}"/>
        </ocf:rootfiles>
      </ocf:container>`;
    const packageDocument = `
      <opf:package xmlns:opf="http://www.idpf.org/2007/opf" version="3.0">
        <opf:metadata/>
      </opf:package>`;

    await withArchive(
      [
        ["META-INF/container.xml", container],
        ["EPUB/package file.opf", packageDocument],
      ],
      {},
      async (archive) => {
        await expect(resolveContainerPackage(archive)).resolves.toMatchObject({
          path: "EPUB/package file.opf",
          renditionLayout: "reflowable",
        });
      },
    );
  });

  it("skips well-formed unsupported entries in document order and selects the first supported one", async () => {
    const container = createContainerDocument(
      [
        rootfile("EPUB/ignored.opf", "application/xml"),
        rootfile("EPUB/legacy.opf"),
        rootfile("EPUB/fixed.opf"),
        rootfile("EPUB/reflowable.opf"),
        rootfile("EPUB/later.opf"),
      ].join(""),
    );

    await withArchive(
      [
        ["META-INF/container.xml", container],
        ["EPUB/legacy.opf", createPackageDocument({ version: "2.0" })],
        ["EPUB/fixed.opf", createPackageDocument({ layout: "pre-paginated" })],
        [
          "EPUB/reflowable.opf",
          createPackageDocument({ layout: "reflowable" }),
        ],
        ["EPUB/later.opf", createPackageDocument()],
      ],
      {},
      async (archive) => {
        await expect(resolveContainerPackage(archive)).resolves.toMatchObject({
          path: "EPUB/reflowable.opf",
        });
      },
    );
  });

  it("rejects a missing container document", async () => {
    await withArchive(
      [["EPUB/package.opf", createPackageDocument()]],
      {},
      async (archive) => {
        await expectResolutionError(
          () => resolveContainerPackage(archive),
          "invalid-container",
        );
      },
    );
  });

  it.each([
    ["wrong namespace", `<container version="1.0"><rootfiles/></container>`],
    [
      "wrong version",
      `<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="2.0"><rootfiles/></container>`,
    ],
    [
      "missing rootfiles",
      `<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"/>`,
    ],
    [
      "missing rootfile attribute",
      createContainerDocument(`<rootfile media-type="${PACKAGE_MEDIA_TYPE}"/>`),
    ],
  ])(
    "rejects structurally invalid container XML: %s",
    async (_name, container) => {
      await withArchive(
        [["META-INF/container.xml", container]],
        {},
        async (archive) => {
          await expectResolutionError(
            () => resolveContainerPackage(archive),
            "invalid-container",
          );
        },
      );
    },
  );

  it.each([
    ["malformed syntax", `<container`],
    [
      "DTD",
      `<!DOCTYPE container [<!ENTITY private "canary">]>
       ${createContainerDocument(rootfile("EPUB/package.opf"))}`,
    ],
  ])("rejects unsafe container XML: %s", async (_name, container) => {
    await withArchive(
      [["META-INF/container.xml", container]],
      {},
      async (archive) => {
        await expectResolutionError(
          () => resolveContainerPackage(archive),
          "malformed-xml",
        );
      },
    );
  });

  it.each([
    "../EPUB/package.opf",
    "%2e%2e/EPUB/package.opf",
    "https://example.invalid/package.opf",
    "EPUB/package.opf#fragment",
    "EPUB\\package.opf",
  ])("rejects an unsafe or external rootfile reference: %s", async (path) => {
    const container = createContainerDocument(rootfile(path));

    await withArchive(
      [["META-INF/container.xml", container]],
      {},
      async (archive) => {
        await expectResolutionError(
          () => resolveContainerPackage(archive),
          "broken-reference",
        );
      },
    );
  });

  it("fails on an unsafe rootfile even when a later rootfile is supported", async () => {
    const container = createContainerDocument(
      `${rootfile("https://example.invalid/ignored.opf", "application/xml")}${rootfile("EPUB/package.opf")}`,
    );

    await withArchive(
      [
        ["META-INF/container.xml", container],
        ["EPUB/package.opf", createPackageDocument()],
      ],
      {},
      async (archive) => {
        await expectResolutionError(
          () => resolveContainerPackage(archive),
          "broken-reference",
        );
      },
    );
  });

  it("rejects a supported-media rootfile whose local package is missing", async () => {
    await withArchive(
      [
        [
          "META-INF/container.xml",
          createContainerDocument(rootfile("EPUB/missing.opf")),
        ],
      ],
      {},
      async (archive) => {
        await expectResolutionError(
          () => resolveContainerPackage(archive),
          "broken-reference",
        );
      },
    );
  });

  it("reports an unsupported resource when no rootfile declares the OPF media type", async () => {
    await withArchive(
      [
        [
          "META-INF/container.xml",
          createContainerDocument(
            rootfile("EPUB/package.xml", "application/xml"),
          ),
        ],
      ],
      {},
      async (archive) => {
        await expectResolutionError(
          () => resolveContainerPackage(archive),
          "unsupported-resource",
        );
      },
    );
  });

  it.each([
    ["2.0", undefined, "unsupported-version"],
    ["3.0", "pre-paginated", "unsupported-layout"],
  ] as const)(
    "reports an unsupported package profile: version %s, layout %s",
    async (version, layout, code) => {
      await withArchive(
        [
          [
            "META-INF/container.xml",
            createContainerDocument(rootfile("EPUB/package.opf")),
          ],
          ["EPUB/package.opf", createPackageDocument({ version, layout })],
        ],
        {},
        async (archive) => {
          await expectResolutionError(
            () => resolveContainerPackage(archive),
            code,
          );
        },
      );
    },
  );

  it("fails instead of falling through from a malformed candidate", async () => {
    const container = createContainerDocument(
      `${rootfile("EPUB/broken.opf")}${rootfile("EPUB/valid.opf")}`,
    );

    await withArchive(
      [
        ["META-INF/container.xml", container],
        ["EPUB/broken.opf", `<package`],
        ["EPUB/valid.opf", createPackageDocument()],
      ],
      {},
      async (archive) => {
        await expectResolutionError(
          () => resolveContainerPackage(archive),
          "malformed-xml",
        );
      },
    );
  });

  it.each([
    ["wrong OPF namespace", `<package xmlns="urn:not-opf" version="3.0"/>`],
    [
      "missing package version",
      `<package xmlns="http://www.idpf.org/2007/opf"/>`,
    ],
    [
      "unknown global layout",
      createPackageDocument({ layout: "private-canary-layout" }),
    ],
    [
      "nested global layout markup",
      `<package xmlns="http://www.idpf.org/2007/opf" version="3.0">
         <metadata><meta property="rendition:layout"><b>reflowable</b></meta></metadata>
       </package>`,
    ],
  ])(
    "rejects a malformed package profile: %s",
    async (_name, packageDocument) => {
      await withArchive(
        [
          [
            "META-INF/container.xml",
            createContainerDocument(rootfile("EPUB/package.opf")),
          ],
          ["EPUB/package.opf", packageDocument],
        ],
        {},
        async (archive) => {
          const error = await captureResolutionError(() =>
            resolveContainerPackage(archive),
          );
          expect(error).toMatchObject({
            code: "malformed-package",
            message: "malformed-package",
          });
          expect(error.message).not.toContain("private-canary");
          expect(error.cause).toBeUndefined();
        },
      );
    },
  );

  it("allows the exact container byte limit and rejects one byte beyond it", async () => {
    const packageDocument = createPackageDocument();
    const baseContainer = createContainerDocument(rootfile("EPUB/package.opf"));
    const container = `${baseContainer}${" ".repeat(packageDocument.length + 32)}`;
    const maximumBytes = new TextEncoder().encode(container).byteLength;
    const entries = [
      ["META-INF/container.xml", container],
      ["EPUB/package.opf", packageDocument],
    ] as const;

    await withArchive(
      entries,
      { policy: { maxContainerOrPackageDocumentBytes: maximumBytes } },
      async (archive) => {
        await expect(resolveContainerPackage(archive)).resolves.toMatchObject({
          path: "EPUB/package.opf",
        });
      },
    );
    await withArchive(
      entries,
      { policy: { maxContainerOrPackageDocumentBytes: maximumBytes - 1 } },
      async (archive) => {
        await expectResolutionError(
          () => resolveContainerPackage(archive),
          "resource-limit-exceeded",
        );
      },
    );
  });

  it("allows the exact package byte limit and rejects one byte beyond it", async () => {
    const container = createContainerDocument(rootfile("EPUB/package.opf"));
    const packageDocument = `${createPackageDocument()}${" ".repeat(container.length + 32)}`;
    const maximumBytes = new TextEncoder().encode(packageDocument).byteLength;
    const entries = [
      ["META-INF/container.xml", container],
      ["EPUB/package.opf", packageDocument],
    ] as const;

    await withArchive(
      entries,
      { policy: { maxContainerOrPackageDocumentBytes: maximumBytes } },
      async (archive) => {
        await expect(resolveContainerPackage(archive)).resolves.toMatchObject({
          path: "EPUB/package.opf",
        });
      },
    );
    await withArchive(
      entries,
      { policy: { maxContainerOrPackageDocumentBytes: maximumBytes - 1 } },
      async (archive) => {
        await expectResolutionError(
          () => resolveContainerPackage(archive),
          "resource-limit-exceeded",
        );
      },
    );
  });

  it("honors cancellation and the exact processing deadline", async () => {
    const entries = [
      [
        "META-INF/container.xml",
        createContainerDocument(rootfile("EPUB/package.opf")),
      ],
      ["EPUB/package.opf", createPackageDocument()],
    ] as const;
    const controller = new AbortController();

    await withArchive(
      entries,
      { signal: controller.signal },
      async (archive) => {
        controller.abort("private-canary");
        await expectResolutionError(
          () => resolveContainerPackage(archive),
          "cancelled",
        );
      },
    );

    let nowMs = 0;
    await withArchive(
      entries,
      {
        clock: { now: () => nowMs },
        policy: { maxProcessingTimeMs: 10 },
      },
      async (archive) => {
        nowMs = 10;
        await expect(resolveContainerPackage(archive)).resolves.toMatchObject({
          path: "EPUB/package.opf",
        });
      },
    );

    nowMs = 0;
    await withArchive(
      entries,
      {
        clock: { now: () => nowMs },
        policy: { maxProcessingTimeMs: 10 },
      },
      async (archive) => {
        nowMs = 11;
        await expectResolutionError(
          () => resolveContainerPackage(archive),
          "cancelled",
        );
      },
    );
  });
});

interface PackageDocumentOptions {
  readonly version?: string;
  readonly layout?: string | undefined;
}

function createPackageDocument(options: PackageDocumentOptions = {}): string {
  const version = options.version ?? "3.0";
  const layout =
    options.layout === undefined
      ? ""
      : `<meta property="rendition:layout">${options.layout}</meta>`;
  return `<package xmlns="http://www.idpf.org/2007/opf" version="${version}"><metadata>${layout}</metadata></package>`;
}

function createContainerDocument(rootfiles: string): string {
  return `<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles>${rootfiles}</rootfiles></container>`;
}

function rootfile(path: string, mediaType = PACKAGE_MEDIA_TYPE): string {
  return `<rootfile full-path="${path}" media-type="${mediaType}"/>`;
}

async function createArchive(
  entries: readonly (readonly [path: string, content: string])[],
): Promise<Uint8Array> {
  const writer = new ZipWriter(new Uint8ArrayWriter(), ZIP_WRITER_OPTIONS);
  const encoder = new TextEncoder();
  await writer.add(
    "mimetype",
    new Uint8ArrayReader(encoder.encode("application/epub+zip")),
    { ...ZIP_WRITER_OPTIONS, level: 0 },
  );

  for (const [path, content] of entries) {
    await writer.add(path, new Uint8ArrayReader(encoder.encode(content)), {
      ...ZIP_WRITER_OPTIONS,
      level: 0,
    });
  }

  return writer.close();
}

async function withArchive(
  entries: readonly (readonly [path: string, content: string])[],
  options: EpubProcessingBudgetOptions,
  action: (
    archive: Awaited<ReturnType<typeof openEpubArchive>>,
  ) => Promise<void>,
): Promise<void> {
  const archive = await openEpubArchive(await createArchive(entries), options);
  try {
    await action(archive);
  } finally {
    await archive.close();
  }
}

async function expectResolutionError(
  action: () => Promise<unknown>,
  code: EpubArchiveError["code"],
): Promise<void> {
  const error = await captureResolutionError(action);
  expect(error).toMatchObject({ code, message: code });
  expect(error.cause).toBeUndefined();
}

async function captureResolutionError(
  action: () => Promise<unknown>,
): Promise<EpubArchiveError> {
  try {
    await action();
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(EpubArchiveError);
    return error as EpubArchiveError;
  }

  throw new Error("expected package resolution to fail");
}
