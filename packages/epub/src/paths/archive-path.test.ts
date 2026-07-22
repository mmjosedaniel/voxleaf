import { describe, expect, it } from "vitest";

import {
  assertNoArchivePathCollisions,
  decodeArchiveEntryPath,
  parseArchiveEntryPath,
} from "./archive-path.js";
import type { ArchiveEntryPath } from "./archive-path.js";
import { EpubPathError } from "./path-error.js";

describe("archive entry paths", () => {
  it("preserves a valid case-sensitive file path", () => {
    expect(parseArchiveEntryPath("EPUB/Text/Chapter-01.xhtml", "file")).toBe(
      "EPUB/Text/Chapter-01.xhtml",
    );
  });

  it("validates a directory marker but excludes it from the canonical key", () => {
    expect(parseArchiveEntryPath("EPUB/Images/", "directory")).toBe(
      "EPUB/Images",
    );
  });

  it.each([
    ["", "file"],
    ["/EPUB/chapter.xhtml", "file"],
    ["//server/share/chapter.xhtml", "file"],
    ["C:/EPUB/chapter.xhtml", "file"],
    ["c:chapter.xhtml", "file"],
    ["EPUB\\chapter.xhtml", "file"],
    ["EPUB//chapter.xhtml", "file"],
    ["EPUB/chapter.xhtml/", "file"],
    ["EPUB/images", "directory"],
    ["EPUB/./chapter.xhtml", "file"],
    ["EPUB/../chapter.xhtml", "file"],
    ["EPUB/%2e%2e/chapter.xhtml", "file"],
    ["EPUB/%252e%252e/chapter.xhtml", "file"],
    ["EPUB%2fchapter.xhtml", "file"],
    ["EPUB%255cchapter.xhtml", "file"],
    ["EPUB/chapter\u0000.xhtml", "file"],
    ["EPUB/chapter\u0085.xhtml", "file"],
    ["\ufeffEPUB/chapter.xhtml", "file"],
    ["EPUB/\ud800.xhtml", "file"],
  ] as const)("rejects unsafe or ambiguous entry %s", (path, kind) => {
    expectPathError(() => parseArchiveEntryPath(path, kind), "unsafe-entry");
  });

  it("rejects entry kinds other than regular files and directories", () => {
    const parseWithUncheckedKind = parseArchiveEntryPath as (
      path: string,
      kind: string,
    ) => ArchiveEntryPath;

    expectPathError(
      () => parseWithUncheckedKind("EPUB/link", "symlink"),
      "unsafe-entry",
    );
  });

  it("accepts exact path, component, and component-count maxima", () => {
    const maximumPath = [
      ...Array.from({ length: 7 }, () => "a".repeat(255)),
      "b".repeat(254),
      "c",
    ].join("/");
    const maximumComponent = `${"é".repeat(127)}a`;
    const maximumComponents = Array.from({ length: 32 }, () => "a").join("/");

    expect(new TextEncoder().encode(maximumPath)).toHaveLength(2_048);
    expect(parseArchiveEntryPath(maximumPath, "file")).toBe(maximumPath);
    expect(new TextEncoder().encode(maximumComponent)).toHaveLength(255);
    expect(parseArchiveEntryPath(maximumComponent, "file")).toBe(
      maximumComponent,
    );
    expect(parseArchiveEntryPath(maximumComponents, "file")).toBe(
      maximumComponents,
    );
  });

  it("rejects the first value above every path budget", () => {
    const oversizedPath = [
      ...Array.from({ length: 7 }, () => "a".repeat(255)),
      "b".repeat(254),
      "cc",
    ].join("/");
    const oversizedComponent = "é".repeat(128);
    const tooManyComponents = Array.from({ length: 33 }, () => "a").join("/");

    expectPathError(
      () => parseArchiveEntryPath(oversizedPath, "file"),
      "resource-limit-exceeded",
    );
    expectPathError(
      () => parseArchiveEntryPath(oversizedComponent, "file"),
      "resource-limit-exceeded",
    );
    expectPathError(
      () => parseArchiveEntryPath(tooManyComponents, "file"),
      "resource-limit-exceeded",
    );
  });

  it("strictly decodes UTF-8 entry-name bytes", () => {
    const encodedPath = new TextEncoder().encode("EPUB/café.xhtml");

    expect(decodeArchiveEntryPath(encodedPath, "file")).toBe("EPUB/café.xhtml");
    expectPathError(
      () => decodeArchiveEntryPath(Uint8Array.from([0xc3, 0x28]), "file"),
      "unsafe-entry",
    );
    expectPathError(
      () =>
        decodeArchiveEntryPath(
          Uint8Array.from([0xef, 0xbb, 0xbf, 0x61]),
          "file",
        ),
      "unsafe-entry",
    );
  });
});

describe("archive path collision policy", () => {
  it.each([
    ["EPUB/chapter.xhtml", "EPUB/chapter.xhtml"],
    ["EPUB/café.xhtml", "EPUB/cafe\u0301.xhtml"],
    ["EPUB/Text/Chapter.xhtml", "epub/text/chapter.xhtml"],
    ["EPUB/straße.xhtml", "EPUB/STRASSE.xhtml"],
  ])("rejects ambiguous paths %s and %s", (left, right) => {
    const paths = [
      parseArchiveEntryPath(left, "file"),
      parseArchiveEntryPath(right, "file"),
    ];

    expectPathError(() => assertNoArchivePathCollisions(paths), "unsafe-entry");
  });

  it("keeps distinct case-sensitive paths unchanged", () => {
    const paths = [
      parseArchiveEntryPath("EPUB/chapter-1.xhtml", "file"),
      parseArchiveEntryPath("EPUB/chapter-2.xhtml", "file"),
    ];

    expect(() => assertNoArchivePathCollisions(paths)).not.toThrow();
    expect(paths).toEqual(["EPUB/chapter-1.xhtml", "EPUB/chapter-2.xhtml"]);
  });

  it("rejects a file and directory with the same canonical key", () => {
    const paths = [
      parseArchiveEntryPath("EPUB/Images", "file"),
      parseArchiveEntryPath("EPUB/Images/", "directory"),
    ];

    expectPathError(() => assertNoArchivePathCollisions(paths), "unsafe-entry");
  });
});

function expectPathError(
  operation: () => unknown,
  code: EpubPathError["code"],
): void {
  try {
    operation();
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(EpubPathError);
    expect(error).toMatchObject({ code, message: code });
    expect((error as Error).cause).toBeUndefined();
    return;
  }

  throw new Error("expected path operation to fail");
}
