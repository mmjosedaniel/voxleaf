import { afterEach, describe, expect, it, vi } from "vitest";
import { decodeBookV1 } from "@voxleaf/shared";

import { EpubArchiveError } from "../archive/archive-error.js";
import type { ArchiveFilePath } from "../paths/archive-path.js";
import { parseArchiveEntryPath } from "../paths/archive-path.js";
import type {
  PackageManifestItem,
  ParsedPackageDocument,
} from "../package/package-document.js";
import type { ParsedNavigationDocument } from "../navigation/navigation-document.js";
import { projectBookV1 } from "./book-v1-projection.js";

const encoder = new TextEncoder();
const EMPTY_NAVIGATION_DOCUMENT: ParsedNavigationDocument = Object.freeze({
  roots: Object.freeze([]),
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("BookV1 projection", () => {
  it("computes the standard lowercase SHA-256 identity from the exact byte view", async () => {
    const backing = encoder.encode("ignoredabctrailing");
    const exactView = backing.subarray(7, 10);

    const book = await projectBookV1(
      exactView,
      createPackageDocument(),
      EMPTY_NAVIGATION_DOCUMENT,
    );

    expect(book.identity).toEqual({
      scheme: "sha256",
      schemeVersion: 1,
      value: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    });
    expect(book.identity.value).toMatch(/^[0-9a-f]{64}$/u);
  });

  it("keeps identical bytes stable and changes identity after one byte changes", async () => {
    const original = encoder.encode("synthetic EPUB bytes");
    const identical = new Uint8Array(original);
    const changed = new Uint8Array(original);
    const lastIndex = changed.length - 1;
    changed[lastIndex] = changed[lastIndex]! ^ 0x01;

    const first = await projectBookV1(
      original,
      createPackageDocument(),
      EMPTY_NAVIGATION_DOCUMENT,
    );
    const second = await projectBookV1(
      identical,
      createPackageDocument(),
      EMPTY_NAVIGATION_DOCUMENT,
    );
    const third = await projectBookV1(
      changed,
      createPackageDocument(),
      EMPTY_NAVIGATION_DOCUMENT,
    );

    expect(second.identity).toEqual(first.identity);
    expect(third.identity).not.toEqual(first.identity);
  });

  it("projects accepted metadata, local resources, and deterministic spine order through the shared decoder", async () => {
    const worker = vi.fn(() => {
      throw new Error("worker must not be constructed");
    });
    const fetch = vi.fn(() => {
      throw new Error("network must not be requested");
    });
    vi.stubGlobal("Worker", worker);
    vi.stubGlobal("fetch", fetch);

    const book = await projectBookV1(
      encoder.encode("synthetic package bytes"),
      createPackageDocument(),
      EMPTY_NAVIGATION_DOCUMENT,
    );

    expect(book).toMatchObject({
      schemaVersion: 1,
      metadata: {
        title: "Synthetic title",
        authors: ["First Author", "Second Author"],
      },
      resources: [
        {
          path: "EPUB/nav.xhtml",
          mediaType: "application/xhtml+xml",
          role: "content-document",
        },
        {
          path: "EPUB/text/chapter.xhtml",
          mediaType: "application/xhtml+xml",
          role: "content-document",
        },
        {
          path: "EPUB/images/cover.png",
          mediaType: "image/png",
          role: "image",
        },
      ],
      spine: [
        {
          id: "spine:0",
          index: 0,
          resourcePath: "EPUB/text/chapter.xhtml",
        },
        {
          id: "spine:1",
          index: 1,
          resourcePath: "EPUB/nav.xhtml",
        },
      ],
      navigation: [],
    });
    expect(Object.isFrozen(book)).toBe(true);
    expect(Object.isFrozen(book.identity)).toBe(true);
    expect(Object.isFrozen(book.metadata)).toBe(true);
    expect(Object.isFrozen(book.metadata.authors)).toBe(true);
    expect(Object.isFrozen(book.resources)).toBe(true);
    expect(Object.isFrozen(book.spine)).toBe(true);
    expect(Object.isFrozen(book.navigation)).toBe(true);
    expect(decodeBookV1(JSON.parse(JSON.stringify(book)))).toEqual(book);
    expect(worker).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("flattens spine targets in hierarchy order and omits groups and non-spine targets", async () => {
    const navigationDocument: ParsedNavigationDocument = Object.freeze({
      roots: Object.freeze([
        Object.freeze({
          label: "Part One",
          children: Object.freeze([
            Object.freeze({
              label: "Chapter One",
              target: Object.freeze({
                kind: "spine" as const,
                path: filePath("EPUB/text/chapter.xhtml"),
                spineItemIndex: 0,
                fragment: "start",
              }),
              children: Object.freeze([]),
            }),
            Object.freeze({
              label: "Notes",
              target: Object.freeze({
                kind: "non-spine" as const,
                path: filePath("EPUB/nav.xhtml"),
              }),
              children: Object.freeze([]),
            }),
          ]),
        }),
        Object.freeze({
          label: "Contents",
          target: Object.freeze({
            kind: "spine" as const,
            path: filePath("EPUB/nav.xhtml"),
            spineItemIndex: 1,
          }),
          children: Object.freeze([]),
        }),
      ]),
    });

    const book = await projectBookV1(
      encoder.encode("navigation projection"),
      createPackageDocument(),
      navigationDocument,
    );

    expect(book.navigation).toEqual([
      { label: "Chapter One", targetSpineItemId: "spine:0" },
      { label: "Contents", targetSpineItemId: "spine:1" },
    ]);
    expect(JSON.stringify(book.navigation)).not.toContain("start");
    expect(Object.isFrozen(book.navigation)).toBe(true);
  });

  it("rejects a navigation target that does not match its claimed spine item", async () => {
    const navigationDocument: ParsedNavigationDocument = Object.freeze({
      roots: Object.freeze([
        Object.freeze({
          label: "Private canary label",
          target: Object.freeze({
            kind: "spine" as const,
            path: filePath("EPUB/nav.xhtml"),
            spineItemIndex: 0,
          }),
          children: Object.freeze([]),
        }),
      ]),
    });

    await expectProjectionError(
      () =>
        projectBookV1(
          encoder.encode("invalid navigation"),
          createPackageDocument(),
          navigationDocument,
        ),
      "malformed-package",
    );
  });

  it("does not derive identity from a path, package metadata, or publisher identifiers", async () => {
    const exactBytes = encoder.encode("same exact bytes");
    const firstPackage = createPackageDocument();
    const secondPackage = createPackageDocument({
      path: filePath("Private/renamed-book.opf"),
      metadata: {
        ...firstPackage.metadata,
        uniqueIdentifier: "private-publisher-identifier",
        identifiers: ["private-publisher-identifier"],
        titles: ["Private replacement title"],
        creators: ["Private replacement author"],
      },
    });

    const first = await projectBookV1(
      exactBytes,
      firstPackage,
      EMPTY_NAVIGATION_DOCUMENT,
    );
    const second = await projectBookV1(
      exactBytes,
      secondPackage,
      EMPTY_NAVIGATION_DOCUMENT,
    );

    expect(second.identity).toEqual(first.identity);
    expect(second.metadata).not.toEqual(first.metadata);
    expect(JSON.stringify(second.identity)).not.toContain("Private");
    expect(JSON.stringify(second.identity)).not.toContain("publisher");
  });

  it("excludes foreign, remote, active, and media-overlay resources", async () => {
    const book = await projectBookV1(
      encoder.encode("resource filtering"),
      createPackageDocument(),
      EMPTY_NAVIGATION_DOCUMENT,
    );
    const serialized = JSON.stringify(book);

    expect(book.resources.map((resource) => resource.path)).toEqual([
      "EPUB/nav.xhtml",
      "EPUB/text/chapter.xhtml",
      "EPUB/images/cover.png",
    ]);
    expect(serialized).not.toContain("private-canary");
    expect(serialized).not.toContain("scripted.xhtml");
    expect(serialized).not.toContain("foreign.bin");
    expect(serialized).not.toContain("overlay.smil");
  });

  it("maps an invalid BookV1 relationship to a content-free package error", async () => {
    const packageDocument = createPackageDocument({
      spine: [
        {
          index: 0,
          idref: "private-canary-source",
          contentResourceId: "private-canary-source",
          path: filePath("EPUB/private-canary-missing.xhtml"),
          linear: true,
          properties: Object.freeze([]),
        },
      ],
    });

    await expectProjectionError(
      () =>
        projectBookV1(
          encoder.encode("invalid relationship"),
          packageDocument,
          EMPTY_NAVIGATION_DOCUMENT,
        ),
      "malformed-package",
    );
  });

  it("maps shared metadata rejection without exposing publisher values", async () => {
    const privateTitle = `private-canary-${"x".repeat(1_024)}`;
    const packageDocument = createPackageDocument({
      metadata: {
        ...createPackageDocument().metadata,
        titles: [privateTitle],
      },
    });

    await expectProjectionError(
      () =>
        projectBookV1(
          encoder.encode("invalid metadata"),
          packageDocument,
          EMPTY_NAVIGATION_DOCUMENT,
        ),
      "malformed-package",
    );
  });

  it("maps unavailable or failing Web Crypto to a fixed internal error", async () => {
    vi.stubGlobal("crypto", {
      subtle: {
        digest: vi.fn(async () => {
          throw new Error("private-canary-crypto-failure");
        }),
      },
    });

    await expectProjectionError(
      () =>
        projectBookV1(
          encoder.encode("digest failure"),
          createPackageDocument(),
          EMPTY_NAVIGATION_DOCUMENT,
        ),
      "internal-failure",
    );
  });
});

interface PackageDocumentOverrides {
  readonly path?: ArchiveFilePath;
  readonly metadata?: ParsedPackageDocument["metadata"];
  readonly spine?: ParsedPackageDocument["spine"];
}

function filePath(value: string): ArchiveFilePath {
  return parseArchiveEntryPath(value, "file");
}

function localItem(
  id: string,
  path: string,
  mediaType: string,
  kind: PackageManifestItem["kind"],
  properties: readonly string[] = [],
  mediaOverlayId?: string,
): PackageManifestItem {
  return Object.freeze({
    id,
    location: Object.freeze({ kind: "local", path: filePath(path) }),
    mediaType,
    mediaTypeEssence: mediaType,
    kind,
    properties: Object.freeze([...properties]),
    ...(mediaOverlayId === undefined ? {} : { mediaOverlayId }),
  });
}

function createPackageDocument(
  overrides: PackageDocumentOverrides = {},
): ParsedPackageDocument {
  const manifest: readonly PackageManifestItem[] = Object.freeze([
    localItem(
      "nav",
      "EPUB/nav.xhtml",
      "application/xhtml+xml",
      "content-document",
      ["nav"],
    ),
    localItem(
      "chapter",
      "EPUB/text/chapter.xhtml",
      "application/xhtml+xml",
      "content-document",
      [],
      "overlay",
    ),
    localItem("image", "EPUB/images/cover.png", "image/png", "raster-image"),
    localItem(
      "scripted",
      "EPUB/scripted.xhtml",
      "application/xhtml+xml",
      "content-document",
      ["scripted"],
    ),
    localItem("foreign", "EPUB/foreign.bin", "application/x-private", "other"),
    localItem("overlay", "EPUB/overlay.smil", "application/smil+xml", "other"),
    Object.freeze({
      id: "remote",
      location: Object.freeze({ kind: "external" }),
      mediaType: "application/xhtml+xml",
      mediaTypeEssence: "application/xhtml+xml",
      kind: "content-document",
      properties: Object.freeze([]),
    }),
  ]);
  const metadata = Object.freeze({
    uniqueIdentifier: "urn:synthetic:book",
    identifiers: Object.freeze(["urn:synthetic:book"]),
    titles: Object.freeze(["Synthetic title"]),
    languages: Object.freeze(["en"]),
    creators: Object.freeze(["First Author", "First Author", "Second Author"]),
    modified: "2026-07-22T12:34:56Z",
  });
  const spine = Object.freeze([
    Object.freeze({
      index: 0,
      idref: "chapter",
      contentResourceId: "chapter",
      path: filePath("EPUB/text/chapter.xhtml"),
      linear: true,
      properties: Object.freeze([]),
    }),
    Object.freeze({
      index: 1,
      idref: "nav",
      contentResourceId: "nav",
      path: filePath("EPUB/nav.xhtml"),
      linear: false,
      properties: Object.freeze([]),
    }),
  ]);

  return Object.freeze({
    path: overrides.path ?? filePath("EPUB/package.opf"),
    version: "3.0",
    renditionLayout: "reflowable",
    pageProgressionDirection: "default",
    metadata: overrides.metadata ?? metadata,
    manifest,
    spine: overrides.spine ?? spine,
    navigation: Object.freeze({
      resourceId: "nav",
      path: filePath("EPUB/nav.xhtml"),
    }),
  });
}

async function expectProjectionError(
  action: () => Promise<unknown>,
  code: EpubArchiveError["code"],
): Promise<void> {
  let captured: unknown;
  try {
    await action();
  } catch (error: unknown) {
    captured = error;
  }

  expect(captured).toBeInstanceOf(EpubArchiveError);
  expect(captured).toMatchObject({ code, message: code });
  expect(captured).not.toHaveProperty("cause");
  expect(JSON.stringify(captured)).not.toContain("private-canary");
}
