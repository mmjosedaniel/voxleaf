import { describe, expect, expectTypeOf, it } from "vitest";

import { parseArchiveEntryPath } from "./archive-path.js";
import type { ArchiveFilePath } from "./archive-path.js";
import { parseOcfReference, resolveOcfReference } from "./ocf-reference.js";
import type { OcfReference } from "./ocf-reference.js";
import { EpubPathError } from "./path-error.js";

describe("OCF references", () => {
  it("keeps document references distinct from archive entry paths", () => {
    const reference = parseOcfReference("chapter.xhtml");

    expectTypeOf(reference).toEqualTypeOf<OcfReference>();
    expectTypeOf(reference).not.toEqualTypeOf<ArchiveFilePath>();
    expect(reference).toEqual({ relativePath: "chapter.xhtml" });
  });

  it.each([
    [
      "EPUB/Text/chapter-1.xhtml",
      "chapter-2.xhtml",
      "EPUB/Text/chapter-2.xhtml",
      undefined,
    ],
    [
      "EPUB/Text/chapter-1.xhtml",
      "../Images/cover.png#hero",
      "EPUB/Images/cover.png",
      "hero",
    ],
    [
      "EPUB/Text/chapter-1.xhtml",
      "./caf%C3%A9.xhtml#part%201",
      "EPUB/Text/café.xhtml",
      "part 1",
    ],
    [
      "EPUB/Text/chapter-1.xhtml",
      "#section-2",
      "EPUB/Text/chapter-1.xhtml",
      "section-2",
    ],
    ["EPUB/Text/chapter-1.xhtml", "", "EPUB/Text/chapter-1.xhtml", undefined],
  ])(
    "resolves %s against an in-container base",
    (base, rawReference, expectedPath, expectedFragment) => {
      const result = resolveOcfReference(
        parseArchiveEntryPath(base, "file"),
        parseOcfReference(rawReference),
      );

      expect(result.path).toBe(expectedPath);
      expect(result.fragment).toBe(expectedFragment);
    },
  );

  it("never includes a fragment in the archive lookup key", () => {
    const result = resolveOcfReference(
      parseArchiveEntryPath("EPUB/nav.xhtml", "file"),
      parseOcfReference("Text/chapter.xhtml#heading"),
    );

    expect(result).toEqual({
      path: "EPUB/Text/chapter.xhtml",
      fragment: "heading",
    });
    expect(result.path).not.toContain("#");
  });

  it("does not apply archive path bytes to a structural fragment", () => {
    const base = parseArchiveEntryPath("EPUB/chapter.xhtml", "file");
    const fragment = "a".repeat(2_049);
    const result = resolveOcfReference(base, parseOcfReference(`#${fragment}`));

    expect(result).toEqual({ path: base, fragment });
  });

  it("preserves case during resolution", () => {
    const result = resolveOcfReference(
      parseArchiveEntryPath("EPUB/Nav.xhtml", "file"),
      parseOcfReference("Text/Chapter.xhtml"),
    );

    expect(result.path).toBe("EPUB/Text/Chapter.xhtml");
  });

  it.each([
    "https://example.invalid/chapter.xhtml",
    "file:///private/book/chapter.xhtml",
    "file%3Aprivate-book.xhtml",
    "data:text/plain,chapter",
    "//example.invalid/chapter.xhtml",
    "/EPUB/chapter.xhtml",
    "C:/EPUB/chapter.xhtml",
    "C%3AEPUB/chapter.xhtml",
    "chapter.xhtml?mode=reader",
    "EPUB\\chapter.xhtml",
    "Text//chapter.xhtml",
    "Text/chapter.xhtml/",
    "%2e%2e/chapter.xhtml",
    "%252e%252e/chapter.xhtml",
    "Text%2fchapter.xhtml",
    "Text%255cchapter.xhtml",
    "chapter%00.xhtml",
    "chapter%C3%28.xhtml",
    "chapter%.xhtml",
    "chapter.xhtml\u0000",
    "chapter.xhtml#bad%5cfragment",
    "chapter.xhtml#bad%C3%28fragment",
    "\ud800.xhtml",
  ])("rejects a non-local or ambiguous reference %s", (reference) => {
    expectPathError(() => parseOcfReference(reference), "broken-reference");
  });

  it.each(["../../../chapter.xhtml", "..", "."])(
    "rejects resolution outside or without a file target: %s",
    (reference) => {
      const base = parseArchiveEntryPath("EPUB/Text/chapter.xhtml", "file");

      expectPathError(
        () => resolveOcfReference(base, parseOcfReference(reference)),
        "broken-reference",
      );
    },
  );

  it("applies the archive path limit to the resolved lookup key", () => {
    const base = parseArchiveEntryPath("a/base.xhtml", "file");
    const oversizedTarget = "b".repeat(2_047);

    expectPathError(
      () => resolveOcfReference(base, parseOcfReference(oversizedTarget)),
      "resource-limit-exceeded",
    );
  });

  it("uses fixed content-free errors", () => {
    const privateCanary = "https://private-canary.invalid/book.xhtml";

    try {
      parseOcfReference(privateCanary);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(EpubPathError);
      expect(error).toMatchObject({
        code: "broken-reference",
        message: "broken-reference",
      });
      expect((error as Error).message).not.toContain("private-canary");
      expect((error as Error).cause).toBeUndefined();
      return;
    }

    throw new Error("expected reference parsing to fail");
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

  throw new Error("expected reference operation to fail");
}
