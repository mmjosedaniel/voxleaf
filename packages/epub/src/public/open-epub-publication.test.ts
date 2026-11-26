import { ZipReader } from "@zip.js/zip.js/lib/zip-core-native.js";
import { createIndex, decodeOperationalErrorV1 } from "@voxleaf/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildMinimalEpub2Fixture,
  buildMinimalEpubFixture,
  buildReaderRasterEpubFixture,
  EPUB2_CANONICAL_NCX_DOCTYPE,
  EPUB2_CANONICAL_XHTML11_DOCTYPE,
  minimalEpub2Guide,
  minimalEpub2PackageDocument,
  minimalChapterDocument,
  minimalNavigationDocument,
  minimalNcxDocument,
  minimalPackageDocument,
  syntheticStaticPngBytes,
} from "../../test-support/epub-fixture.js";
import { EpubArchiveError } from "../archive/archive-error.js";
import type { EpubArchiveErrorCode } from "../archive/archive-error.js";
import * as archiveInventory from "../archive/archive-inventory.js";
import { mapEpubFailure } from "./epub-result.js";
import { openEpubPublication } from "./open-epub-publication.js";
import * as locatorIndex from "../locator/locator-index.js";

const EXPECTED_OPERATIONAL_CODE = Object.freeze({
  "broken-reference": "invalid-input",
  cancelled: "operation-cancelled",
  "invalid-container": "invalid-input",
  "internal-failure": "internal-failure",
  "locator-unresolved": "invalid-input",
  "malformed-package": "invalid-input",
  "malformed-xml": "invalid-input",
  "resource-limit-exceeded": "resource-exhausted",
  "unsafe-entry": "invalid-input",
  "unsupported-layout": "unsupported-input",
  "unsupported-protection": "unsupported-input",
  "unsupported-resource": "unsupported-input",
  "unsupported-version": "unsupported-input",
} as const satisfies Readonly<Record<EpubArchiveErrorCode, string>>);

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("public privacy-safe EPUB opening", () => {
  it("VF-0134 preserves lookup and reopen for a whitespace-edged member", async () => {
    const archivePath = "\u00a0chapter.xhtml";
    const href = "../%C2%A0chapter.xhtml";
    const bytes = await buildMinimalEpubFixture({
      packageDocument: minimalPackageDocument()
        .replace("text/chapter.xhtml", href)
        .replace(
          "</manifest>",
          '<item id="alias" href="../voxleaf-resource/0" media-type="application/xhtml+xml"/></manifest>',
        ),
      chapterDocument: null,
      navigationDocument: minimalNavigationDocument().replace(
        "text/chapter.xhtml",
        href,
      ),
      additionalEntries: [
        { name: archivePath, content: minimalChapterDocument() },
        { name: "voxleaf-resource/0", content: minimalChapterDocument() },
      ],
    });
    const opened = await openEpubPublication(bytes);
    if (!opened.ok) throw new Error(opened.detail);
    let checkpoint;
    try {
      const { book, navigation, locators } = opened.publication;
      expect(book.spine[0]?.resourcePath).toBe("voxleaf-resource/1");
      expect(book.resources.map(({ path }) => path)).toContain(
        "voxleaf-resource/0",
      );
      const link = navigation[0];
      if (link?.kind !== "link") throw new Error("missing link");
      checkpoint = locators[0]!.startLocator;
      expect(opened.publication.resolveTarget(link.target)).toMatchObject({
        status: "exact",
        locator: checkpoint,
      });
    } finally {
      await opened.publication.close();
    }
    const reopened = await openEpubPublication(bytes);
    if (!reopened.ok) throw new Error(reopened.detail);
    try {
      expect(reopened.publication.resolveLocator(checkpoint)).toMatchObject({
        status: "exact",
        locator: checkpoint,
      });
    } finally {
      await reopened.publication.close();
    }
  });

  it("VF-0135 opens block-link contents and keeps nearby inline links", async () => {
    const opened = await openEpubPublication(
      await buildMinimalEpubFixture({
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml"><body><a href="#destination">Lead<p id="inside">Inside</p>Tail</a><p id="destination"><span><a href="#inside">Back</a></span></p></body></html>',
        navigationDocument: minimalNavigationDocument().replace(
          "#chapter-one",
          "#inside",
        ),
      }),
    );
    if (!opened.ok) throw new Error(opened.detail);
    try {
      const { publication } = opened;
      expect(publication.locators.map(({ block }) => block)).toMatchObject([
        { kind: "paragraph", children: [{ kind: "text", text: "Lead" }] },
        { kind: "paragraph", children: [{ kind: "text", text: "Inside" }] },
        { kind: "paragraph", children: [{ kind: "text", text: "Tail" }] },
        {
          kind: "paragraph",
          children: [
            {
              kind: "internal-link",
              children: [{ kind: "text", text: "Back" }],
            },
          ],
        },
      ]);
      const link = publication.navigation[0];
      if (link?.kind !== "link") throw new Error("missing link");
      expect(publication.resolveTarget(link.target)).toMatchObject({
        status: "exact",
        locator: publication.locators[1]!.startLocator,
      });
    } finally {
      await opened.publication.close();
    }
  });

  it("VF-0135 keeps direction around a block after the local link becomes inert", async () => {
    const opened = await openEpubPublication(
      await buildMinimalEpubFixture({
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml"><body><a href="#inside" dir="rtl">Lead<div><p id="inside">Inside</p></div>Tail</a><p>After</p></body></html>',
        navigationDocument: minimalNavigationDocument().replace(
          "#chapter-one",
          "#inside",
        ),
      }),
    );
    if (!opened.ok) throw new Error(opened.detail);
    try {
      expect(
        opened.publication.locators.map(({ block }) => block),
      ).toMatchObject([
        {
          children: [
            {
              kind: "direction-span",
              direction: "rtl",
              children: [{ text: "Lead" }],
            },
          ],
        },
        { direction: "rtl", children: [{ text: "Inside" }] },
        {
          children: [
            {
              kind: "direction-span",
              direction: "rtl",
              children: [{ text: "Tail" }],
            },
          ],
        },
        { children: [{ kind: "text", text: "After" }] },
      ]);
    } finally {
      await opened.publication.close();
    }
  });

  it("VF-0152 retains item direction and ordered values without changing locators", async () => {
    const bytes = await buildMinimalEpubFixture({
      chapterDocument:
        '<html xmlns="http://www.w3.org/1999/xhtml"><body><ol dir="ltr" start="3"><li dir="rtl"><p id="first">First</p><ul><li dir="auto">Next</li></ul></li><li value="7">Last</li></ol></body></html>',
    });
    const opened = await openEpubPublication(bytes);
    if (!opened.ok) throw new Error(opened.detail);
    let checkpoint;
    try {
      expect(
        opened.publication.documents.find(
          ({ location }) => location.kind === "spine",
        ),
      ).toMatchObject({
        blocks: [
          {
            kind: "list",
            items: [
              {
                direction: "rtl",
                children: [
                  { kind: "paragraph" },
                  { kind: "list", items: [{ direction: "auto" }] },
                ],
              },
              { value: 7 },
            ],
          },
        ],
      });
      const first = opened.publication.locators.find(
        ({ startLocator }) => startLocator.anchor.value === "first",
      );
      expect(first?.block).toMatchObject({
        kind: "paragraph",
        direction: "rtl",
        children: [{ text: "First" }],
      });
      if (first === undefined) throw new Error("missing list locator");
      checkpoint = {
        ...first.startLocator,
        textOffsetCodePoints: createIndex(2),
      };
    } finally {
      await opened.publication.close();
    }
    const reopened = await openEpubPublication(bytes);
    if (!reopened.ok) throw new Error(reopened.detail);
    try {
      expect(reopened.publication.resolveLocator(checkpoint)).toMatchObject({
        status: "exact",
        locator: checkpoint,
      });
    } finally {
      await reopened.publication.close();
    }
  });

  it("VF-0161 gives mixed-case direction the same public model and Auto scopes", async () => {
    const fixture =
      '<html xmlns="http://www.w3.org/1999/xhtml"><body dir="auto"><p dir="auto">One <span dir="rtl">Two</span></p><p>Three</p></body></html>';
    const readDirection = async (chapterDocument: string) => {
      const result = await openEpubPublication(
        await buildMinimalEpubFixture({ chapterDocument }),
      );
      if (!result.ok) return result.detail;
      try {
        return result.publication.documents.map(
          ({ blocks, autoDirectionScopeCount }) => ({
            blocks,
            autoDirectionScopeCount,
          }),
        );
      } finally {
        await result.publication.close();
      }
    };
    const canonical = await readDirection(fixture);
    expect(canonical).toBeInstanceOf(Array);
    expect(
      await readDirection(
        fixture.replaceAll('"auto"', '"AuTo"').replace('"rtl"', '"RtL"'),
      ),
    ).toEqual(canonical);
    expect(await readDirection(fixture.replace('"auto"', '" auto "'))).toEqual(
      "malformed-package",
    );
    expect(await readDirection(fixture.replace('"auto"', '"unknown"'))).toEqual(
      "malformed-package",
    );
  });

  it.each([
    [
      "declared alias",
      "meta:modified",
      'prefix="meta: http://purl.org/dc/terms/"',
      "",
      true,
    ],
    [
      "foreign alias",
      "meta:modified",
      'prefix="meta: urn:foreign:"',
      "",
      false,
    ],
    [
      "duplicate expanded IRI",
      "meta:modified",
      'prefix="meta: http://purl.org/dc/terms/"',
      '<meta property="dcterms:modified">2020-01-01T00:00:00Z</meta>',
      false,
    ],
    [
      "explicit foreign reserved spelling",
      "dcterms:modified",
      'prefix="dcterms: urn:foreign:"',
      "",
      false,
    ],
  ] as const)(
    "VF-0162 resolves modification metadata by vocabulary: %s",
    async (_case, property, declaration, extra, valid) => {
      const packageDocument = minimalPackageDocument()
        .replace("<package ", `<package ${declaration} `)
        .replace("dcterms:modified", property)
        .replace("</metadata>", `${extra}</metadata>`);
      const result = await openEpubPublication(
        await buildMinimalEpubFixture({ packageDocument }),
      );
      try {
        expect(result.ok).toBe(valid);
        if (!result.ok) expect(result.detail).toBe("malformed-package");
      } finally {
        if (result.ok) await result.publication.close();
      }
    },
  );

  it.each(["global", "spine"] as const)(
    "VF-0167 skips an alias-declared fixed rendition via %s",
    async (placement) => {
      const prefix = 'prefix="fx: http://www.idpf.org/vocab/rendition/#"';
      const canonical = minimalPackageDocument();
      const declared = canonical
        .replace("<package ", `<package ${prefix} `)
        .replace("Synthetic minimal publication", "Synthetic fixed rendition");
      const fixed =
        placement === "global"
          ? declared.replace(
              "</metadata>",
              '<meta property="fx:layout">pre-paginated</meta></metadata>',
            )
          : declared.replace(
              '<itemref idref="chapter"',
              '<itemref properties="fx:layout-pre-paginated" idref="chapter"',
            );
      const options = {
        containerDocument:
          '<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="EPUB/fixed.opf" media-type="application/oebps-package+xml"/><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
        additionalEntries: [{ name: "EPUB/fixed.opf", content: fixed }],
      };
      const allFixed = await openEpubPublication(
        await buildMinimalEpubFixture({ ...options, packageDocument: fixed }),
      );
      try {
        expect(allFixed).toMatchObject({
          ok: false,
          detail: "unsupported-layout",
        });
      } finally {
        if (allFixed.ok) await allFixed.publication.close();
      }
      const selected = await openEpubPublication(
        await buildMinimalEpubFixture(options),
      );
      if (!selected.ok) throw new Error(selected.detail);
      try {
        expect(selected.publication.book).toMatchObject({
          metadata: { title: "Synthetic minimal publication" },
          spine: [{ resourcePath: "EPUB/text/chapter.xhtml" }],
        });
      } finally {
        await selected.publication.close();
      }
    },
  );
  it.each([
    ['<a id="empty"></a>', "Alpha Beta"],
    ['<a id="empty"> </a>', "Alpha Beta"],
    ['<a id="empty"><span hidden="hidden">Hidden</span></a>', "Alpha Beta"],
    ['<a id="empty">inline </a>', "Alpha inline Beta"],
    [
      '<a id="empty" href="https://example.invalid/">inline </a>',
      "Alpha inline Beta",
    ],
  ])(
    "VF-0036 keeps inert phrasing inside the identified paragraph (%s)",
    async (anchor, text) => {
      const bytes = await buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml"><body><p>Intro</p><div id="target">Alpha ${anchor}Beta</div><p>Gamma</p></body></html>`,
        navigationDocument: minimalNavigationDocument().replace(
          "#chapter-one",
          "#target",
        ),
      });
      const result = await openEpubPublication(bytes);
      if (!result.ok) throw new Error(result.detail);
      let checkpoint;
      try {
        expect(result.publication.locators).toHaveLength(3);
        const middle = result.publication.locators[1];
        const last = result.publication.locators[2];
        if (middle?.block.kind !== "paragraph" || last === undefined)
          throw new Error("expected paragraph locators");
        expect(
          middle.block.children
            .map((child) => (child.kind === "text" ? child.text : ""))
            .join(""),
        ).toBe(text);
        const link = result.publication.navigation[0];
        if (link?.kind !== "link") throw new Error("expected navigation link");
        expect(result.publication.resolveTarget(link.target)).toMatchObject({
          status: "exact",
          locator: middle.startLocator,
        });
        checkpoint = {
          ...last.startLocator,
          textOffsetCodePoints: createIndex(3),
        };
      } finally {
        await result.publication.close();
      }
      const reopened = await openEpubPublication(bytes);
      if (!reopened.ok) throw new Error(reopened.detail);
      try {
        expect(reopened.publication.resolveLocator(checkpoint)).toMatchObject({
          status: "exact",
          locator: checkpoint,
        });
        expect(reopened.publication.locators[2]?.block).toMatchObject({
          kind: "paragraph",
          children: [{ kind: "text", text: "Gamma" }],
        });
      } finally {
        await reopened.publication.close();
      }
    },
  );

  it.each(["xhtml", "ncx"] as const)(
    "VF-0047 opens %s labels with trimmed Unicode edges and preserved interior NBSP",
    async (format) => {
      for (const label of [
        "\u00a0Chapter\u00a0One\u00a0",
        "&#160;Chapter&#160;One&#160;",
      ]) {
        const bytes =
          format === "xhtml"
            ? await buildMinimalEpubFixture({
                navigationDocument: minimalNavigationDocument().replace(
                  "Chapter One</a>",
                  `${label}</a>`,
                ),
              })
            : await buildMinimalEpub2Fixture({
                ncxDocument: minimalNcxDocument().replace(
                  "Chapter One</text>",
                  `${label}</text>`,
                ),
              });
        const result = await openEpubPublication(bytes);
        expect(result.ok).toBe(true);
        if (!result.ok) throw new Error(result.detail);
        try {
          expect(result.publication.navigation[0]?.label).toBe(
            "Chapter\u00a0One",
          );
          expect(result.publication.book.navigation[0]?.label).toBe(
            "Chapter\u00a0One",
          );
        } finally {
          await result.publication.close();
        }
      }
    },
  );

  it.each(["xhtml", "ncx"] as const)(
    "VF-0060 applies the %s limit to retained label points",
    async (format) => {
      const exactLabel = "😀".repeat(1024);
      for (const [label, valid] of [
        [exactLabel + "\u00a0&#8239;", true],
        [exactLabel + "\u00a0x", false],
        [exactLabel + "x", false],
      ] as const) {
        const bytes =
          format === "xhtml"
            ? await buildMinimalEpubFixture({
                navigationDocument: minimalNavigationDocument().replace(
                  "Chapter One</a>",
                  `${label}</a>`,
                ),
              })
            : await buildMinimalEpub2Fixture({
                ncxDocument: minimalNcxDocument().replace(
                  "Chapter One</text>",
                  `${label}</text>`,
                ),
              });
        const result = await openEpubPublication(bytes);
        try {
          expect(result.ok).toBe(valid);
          if (result.ok)
            expect(result.publication.navigation[0]?.label).toBe(exactLabel);
        } finally {
          if (result.ok) await result.publication.close();
        }
      }
    },
  );

  it("VF-0047 uses title fallback when the visible label is only Unicode whitespace", async () => {
    const result = await openEpubPublication(
      await buildMinimalEpubFixture({
        navigationDocument: minimalNavigationDocument()
          .replace("<a href=", '<a title="&#160;Fallback&#160;" href=')
          .replace("Chapter One</a>", "&#160;</a>"),
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.detail);
    try {
      expect(result.publication.navigation[0]?.label).toBe("Fallback");
    } finally {
      await result.publication.close();
    }
  });

  it("VF-0145 prefers a bounded title for hidden links and groups and keeps their destinations", async () => {
    const exactTitle = "😀".repeat(1024);
    const hiddenText = "x".repeat(1100);
    const result = await openEpubPublication(
      await buildMinimalEpubFixture({
        navigationDocument: minimalNavigationDocument().replace(
          /<li>.*<\/li>/u,
          `<li><span hidden="" title="&#160;${exactTitle}&#8239;">${hiddenText}</span><ol><li><a hidden="" title="&#160;Chapter    Two&#160;" href="text/chapter.xhtml#chapter-two"><img alt="${hiddenText}"/>${hiddenText}</a></li></ol></li><li><a href="text/chapter.xhtml#chapter-one" aria-hidden="true" title="Unused"><span hidden="">${hiddenText}</span><span aria-hidden="true">Chapter One</span></a></li>`,
        ),
        chapterDocument: minimalChapterDocument().replace(
          "</body>",
          '<h2 id="chapter-two">Chapter Two</h2></body>',
        ),
      }),
    );
    if (!result.ok) throw new Error(result.detail);
    const { publication } = result;
    try {
      const [group, adjacent] = publication.navigation;
      if (group?.kind !== "group" || adjacent?.kind !== "link") {
        throw new Error("expected a group and adjacent link");
      }
      expect(group.label).toBe(exactTitle);
      const [chapter] = group.children;
      if (chapter.kind !== "link") throw new Error("expected a chapter link");
      expect(chapter.label).toBe("Chapter Two");
      expect(chapter.target.fragment).toBe("chapter-two");
      expect(adjacent.label).toBe("Chapter One");
      expect(publication.book.navigation.map(({ label }) => label)).toEqual([
        "Chapter Two",
        "Chapter One",
      ]);
      expect(publication.resolveTarget(chapter.target)).toMatchObject({
        status: "exact",
        reason: "fragment",
        locator: publication.locators[2]?.startLocator,
      });
      expect(publication.resolveTarget(adjacent.target)).toMatchObject({
        status: "exact",
        reason: "fragment",
        locator: publication.locators[0]?.startLocator,
      });
    } finally {
      await publication.close();
    }
  });

  it.each([
    ["missing", ""],
    ["blank", ' title="&#160;   &#8239;"'],
    ["overlong", ` title="${"😀".repeat(1025)}"`],
    ["invalid", ' title="Invalid&#127;title"'],
  ])(
    "VF-0145 retains hidden label text when its title is %s",
    async (_, title) => {
      const result = await openEpubPublication(
        await buildMinimalEpubFixture({
          navigationDocument: minimalNavigationDocument().replace(
            "<a href=",
            `<a hidden=""${title} href=`,
          ),
        }),
      );
      if (!result.ok) throw new Error(result.detail);
      try {
        expect(result.publication.navigation[0]?.label).toBe("Chapter One");
      } finally {
        await result.publication.close();
      }
    },
  );

  it.each([
    ["visible overlong label", 'title="Short"', "x".repeat(1025)],
    ["hidden overlong label without a title", 'hidden=""', "x".repeat(1025)],
    ["forbidden label child", 'hidden="" title="Short"', "<ol/>"],
  ])("VF-0145 still rejects a %s", async (_, attributes, content) => {
    const result = await openEpubPublication(
      await buildMinimalEpubFixture({
        navigationDocument: minimalNavigationDocument()
          .replace("<a href=", `<a ${attributes} href=`)
          .replace("Chapter One</a>", `${content}</a>`),
      }),
    );
    if (result.ok) await result.publication.close();
    expect(result).toMatchObject({ ok: false, detail: "malformed-package" });
  });

  it("DCR-07 shares retained TOC and semantic image bytes across rootfiles", async () => {
    const selected = minimalPackageDocument()
      .replace(
        "</manifest>",
        '<item id="image" href="cover.png" media-type="image/png"/></manifest>',
      )
      .replace("</spine>", '<itemref idref="nav"/></spine>');
    const fixed = selected.replace(
      "</metadata>",
      '<meta property="rendition:layout">pre-paginated</meta></metadata>',
    );
    const fixture = (alt: string): Promise<Uint8Array> =>
      buildMinimalEpubFixture({
        packageDocument: selected,
        navigationDocument: minimalNavigationDocument().replace(
          "Chapter One</a>",
          `Chapter One<img src="cover.png" alt="${alt}"/></a>`,
        ),
        containerDocument:
          '<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="EPUB/fixed.opf" media-type="application/oebps-package+xml"/><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
        additionalEntries: [
          { name: "EPUB/fixed.opf", content: fixed },
          { name: "EPUB/cover.png", content: syntheticStaticPngBytes() },
        ],
      });
    let ceiling: number | undefined;
    let usedBudget: archiveInventory.OpenedEpubArchive["budget"] | undefined;
    const openArchive = archiveInventory.openEpubArchive;
    const opens = vi
      .spyOn(archiveInventory, "openEpubArchive")
      .mockImplementation(async (bytes, options) => {
        const archive = await openArchive(bytes, {
          ...options,
          ...(ceiling === undefined
            ? {}
            : { policy: { maxDecodedPublicationTextBytes: ceiling } }),
        });
        usedBudget = archive.budget;
        return archive;
      });
    const empty = await openEpubPublication(await fixture(""));
    if (!empty.ok || usedBudget === undefined)
      throw new Error("expected synthetic fixture");
    const base = usedBudget.getSnapshot().decodedPublicationTextBytes;
    await empty.publication.close();

    const alt = "é";
    const bytes = await fixture(alt);
    // Both renditions parse the TOC and project the navigation spine document.
    ceiling = base + 2 * 2 * 2;
    const exact = await openEpubPublication(bytes);
    if (!exact.ok || usedBudget === undefined)
      throw new Error("expected exact-byte publication");
    try {
      expect(exact.publication.navigation[0]?.label).toBe("Chapter Oneé");
      expect(usedBudget.getSnapshot().decodedPublicationTextBytes).toBe(
        ceiling,
      );
      expect(opens).toHaveBeenCalledTimes(2);
    } finally {
      await exact.publication.close();
    }

    ceiling -= 1;
    const overflow = await openEpubPublication(bytes);
    if (overflow.ok) await overflow.publication.close();
    expect(overflow).toMatchObject({
      ok: false,
      detail: "resource-limit-exceeded",
    });
    expect(overflow).not.toHaveProperty("publication");
  });

  it.each([false, true])(
    "EBC-C17 contains throwing signal cleanup after failed=%s open",
    async (failed) => {
      const controller = new AbortController();
      vi.spyOn(controller.signal, "removeEventListener").mockImplementation(
        () => {
          throw new Error("SYNTHETIC_PRIVATE_CLEANUP_CANARY");
        },
      );
      const close = vi.spyOn(ZipReader.prototype, "close");
      const bytes = await buildMinimalEpubFixture(
        failed
          ? { chapterDocument: '<html xmlns="http://www.w3.org/1999/xhtml">' }
          : {},
      );
      const result = await openEpubPublication(bytes, {
        signal: controller.signal,
      });
      expect(result).toMatchObject({
        ok: false,
        detail: failed ? "malformed-xml" : "internal-failure",
      });
      expect(result).not.toHaveProperty("publication");
      expect(JSON.stringify(result)).not.toContain(
        "SYNTHETIC_PRIVATE_CLEANUP_CANARY",
      );
      expect(close).toHaveBeenCalledTimes(1);
    },
  );

  it("EBC-C17 cancels a real pending open and releases the archive", async () => {
    const bytes = await buildMinimalEpubFixture();
    const controller = new AbortController();
    const close = vi.spyOn(ZipReader.prototype, "close");
    let release: () => void = () => undefined;
    let entered: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const pendingEntries = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const original = ZipReader.prototype.getEntriesGenerator;
    vi.spyOn(ZipReader.prototype, "getEntriesGenerator").mockImplementation(
      async function* (this: ZipReader<Uint8Array>, ...args) {
        entered();
        await gate;
        return yield* original.apply(this, args);
      },
    );
    const opening = openEpubPublication(bytes, { signal: controller.signal });
    await pendingEntries;
    controller.abort("SYNTHETIC_PRIVATE_ABORT_CANARY");
    release();
    const result = await opening;
    expect(result).toMatchObject({
      ok: false,
      detail: "cancelled",
      error: { code: "operation-cancelled" },
    });
    expect(result).not.toHaveProperty("publication");
    expect(JSON.stringify(result)).not.toContain(
      "SYNTHETIC_PRIVATE_ABORT_CANARY",
    );
    expect(close).toHaveBeenCalledTimes(1);
  });
  it("EBC-C17 detaches the successful opening signal from later raster reads", async () => {
    const controller = new AbortController();
    const result = await openEpubPublication(
      await buildReaderRasterEpubFixture(),
      { signal: controller.signal },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected synthetic publication");
    try {
      controller.abort("private-canary");
      const resource = result.publication.resources[0];
      if (resource === undefined) throw new Error("expected synthetic raster");
      expect(
        (await result.publication.readResource(resource.id)).byteLength,
      ).toBeGreaterThan(0);
    } finally {
      await result.publication.close();
    }
  });
  it.each([0, 1])(
    "CAF-R1.2 discarded fixed rendition honors raster limit plus %s",
    async (extra) => {
      const fixed = minimalPackageDocument()
        .replace(
          "</metadata>",
          '<meta property="rendition:layout">pre-paginated</meta></metadata>',
        )
        .replace(
          "</manifest>",
          '<item id="oversize" href="large.png" media-type="image/png"/></manifest>',
        );
      const result = await openEpubPublication(
        await buildMinimalEpubFixture({
          containerDocument:
            '<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="EPUB/fixed.opf" media-type="application/oebps-package+xml"/><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
          additionalEntries: [
            { name: "EPUB/fixed.opf", content: fixed },
            {
              name: "EPUB/large.png",
              content: new Uint8Array(32 * 1_048_576 + extra),
              compression: "stored",
            },
          ],
        }),
      );
      try {
        if (extra === 0) expect(result.ok).toBe(true);
        else
          expect(result).toMatchObject({
            ok: false,
            detail: "resource-limit-exceeded",
          });
      } finally {
        if (result.ok) await result.publication.close();
      }
    },
  );
  it("RCF-03 global layout fallback cannot hide unsafe candidate content", async () => {
    const fixed = minimalPackageDocument()
      .replace(
        "</metadata>",
        '<meta property="rendition:layout">pre-paginated</meta></metadata>',
      )
      .replace("text/chapter.xhtml", "text/unsafe.xhtml");
    const opened = await openEpubPublication(
      await buildMinimalEpubFixture({
        containerDocument:
          '<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="EPUB/fixed.opf" media-type="application/oebps-package+xml"/><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
        additionalEntries: [
          { name: "EPUB/fixed.opf", content: fixed },
          {
            name: "EPUB/text/unsafe.xhtml",
            content:
              '<!DOCTYPE html [<!ENTITY external SYSTEM "file:///private">]><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Unsafe</title></head><body><p>&external;</p></body></html>',
          },
        ],
      }),
    );
    expect(opened).toMatchObject({ ok: false });
    if (!opened.ok) expect(opened.detail).not.toBe("unsupported-layout");
  });

  it.each([
    "narration-v1",
    "narration-bilingual-v2",
    "narration-piper-v2",
    "narration-chatterbox-v1",
  ] as const)(
    "RCF-08 rejects the code-to-prose bypass through public profile %s",
    async (profile) => {
      const bytes = await buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Numeric boundary</title></head><body><p><code>+</code>${"1".repeat(129)}</p></body></html>`,
      });
      const opened = await openEpubPublication(bytes);
      if (!opened.ok) throw new Error(opened.detail);
      try {
        expect(
          await opened.publication.prepareNarration({
            profile,
            defaultLanguage: "es",
            maximumSegments: 1,
            startLocator: opened.publication.defaultStartLocator!,
          }),
        ).toMatchObject({ status: "resource-limit-exceeded" });
      } finally {
        await opened.publication.close();
      }
    },
  );

  it.each([false, true])(
    "RCF-03 examines multiple layout-incompatible candidates (exhausted %s)",
    async (exhausted) => {
      const fixed = minimalPackageDocument().replace(
        '<itemref idref="chapter"',
        '<itemref properties="rendition:layout-pre-paginated" idref="chapter"',
      );
      const bytes = await buildMinimalEpubFixture({
        packageDocument: exhausted ? fixed : minimalPackageDocument(),
        containerDocument:
          '<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="EPUB/fixed.opf" media-type="application/oebps-package+xml"/><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
        additionalEntries: [{ name: "EPUB/fixed.opf", content: fixed }],
      });
      const opened = await openEpubPublication(bytes);
      if (exhausted)
        expect(opened).toMatchObject({
          ok: false,
          detail: "unsupported-layout",
        });
      else {
        expect(opened.ok).toBe(true);
        if (opened.ok) await opened.publication.close();
      }
    },
  );
  it.each([false, true])(
    "RCF-03 validates later spine items before layout-only fallback (malformed %s)",
    async (malformed) => {
      const fixed = minimalPackageDocument()
        .replace(
          '<itemref idref="chapter"',
          '<itemref properties="rendition:layout-pre-paginated" idref="chapter"',
        )
        .replace(
          "</spine>",
          malformed ? '<itemref idref="missing"/></spine>' : "</spine>",
        );
      const bytes = await buildMinimalEpubFixture({
        containerDocument:
          '<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="EPUB/fixed.opf" media-type="application/oebps-package+xml"/><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
        additionalEntries: [{ name: "EPUB/fixed.opf", content: fixed }],
      });
      const opened = await openEpubPublication(bytes);
      if (malformed)
        expect(opened).toMatchObject({ ok: false, detail: "broken-reference" });
      else {
        expect(opened.ok).toBe(true);
        if (opened.ok) await opened.publication.close();
      }
    },
  );

  it("RAF-10 warm public preparation does not rescan every source-length metadata value", async () => {
    const count = 1_000;
    const bytes = await buildMinimalEpubFixture({
      chapterDocument:
        '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Preparation</title></head><body>' +
        "<p>A bounded synthetic sentence for narration.</p>".repeat(count) +
        "</body></html>",
    });
    let visits = 0;
    const original = locatorIndex.createPublicationLocatorIndex;
    vi.spyOn(locatorIndex, "createPublicationLocatorIndex").mockImplementation(
      (...args) => {
        const index = original(...args);
        const blocks = new Proxy(index.blocks, {
          get(target, key, receiver) {
            if (key === Symbol.iterator)
              return function* () {
                for (const block of target) {
                  visits++;
                  yield block;
                }
              };
            return Reflect.get(target, key, receiver);
          },
        });
        return Object.freeze({ ...index, blocks });
      },
    );
    const opened = await openEpubPublication(bytes);
    if (!opened.ok) throw new Error(opened.detail);
    const publication = opened.publication;
    try {
      const first = await publication.prepareNarration({
        maximumSegments: 16,
        profile: "narration-piper-v2",
        defaultLanguage: "en",
        startLocator: publication.defaultStartLocator!,
      });
      expect(first.status).toBe("batch");
      if (first.status !== "batch") throw new Error("expected-batch");
      visits = 0;
      const warm = await publication.prepareNarration({
        maximumSegments: 16,
        profile: "narration-piper-v2",
        defaultLanguage: "en",
        startLocator: first.continuation,
      });
      expect(warm.status).toBe("batch");
      expect(visits).toBeLessThan(64);
      if (warm.status !== "batch") throw new Error("expected-warm-batch");
      expect(warm.segments[0]!.sourceRange.start).toEqual(
        publication.locators[16]!.startLocator,
      );
    } finally {
      await publication.close();
    }
  });
  it("RAF-01 opens an admitted chapter beyond the host argument expansion capacity", async () => {
    const count = 140_000;
    const chapter =
      '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Scale</title></head><body>' +
      Array.from(
        { length: count / 2 },
        (_, index) => `<blockquote><p>${index}</p></blockquote>`,
      ).join("") +
      "</body></html>";
    const bytes = await buildMinimalEpubFixture({
      chapterDocument: null,
      additionalEntries: [
        {
          name: "EPUB/text/chapter.xhtml",
          content: chapter,
          compression: "stored",
        },
      ],
    });
    const original = locatorIndex.createPublicationLocatorIndex;
    let failureName: string | undefined;
    const observeIndex = vi
      .spyOn(locatorIndex, "createPublicationLocatorIndex")
      .mockImplementation((...args) => {
        try {
          return original(...args);
        } catch (error) {
          failureName = error instanceof Error ? error.name : "unknown";
          throw error;
        }
      });
    const result = await openEpubPublication(bytes);
    expect(observeIndex).toHaveBeenCalledOnce();
    expect(failureName).toBeUndefined();
    expect(result).toMatchObject({ ok: true });
    if (result.ok) {
      try {
        expect(result.publication.locators).toHaveLength(count);
      } finally {
        await result.publication.close();
      }
    }
  });

  it.each([16, 64])(
    "RAF-18 bounds repeated package index construction for %i admitted documents",
    async (count) => {
      const indices = Array.from({ length: count }, (_, index) => index);
      const bytes = await buildMinimalEpubFixture({
        packageDocument: minimalPackageDocument()
          .replace(
            "</manifest>",
            indices
              .map(
                (index) =>
                  `<item id="raf-${index}" href="text/raf-${index}.xhtml" media-type="application/xhtml+xml"/>`,
              )
              .join("") + "</manifest>",
          )
          .replace(
            "</spine>",
            indices.map((index) => `<itemref idref="raf-${index}"/>`).join("") +
              "</spine>",
          ),
        additionalEntries: indices.map((index) => ({
          name: `EPUB/text/raf-${index}.xhtml`,
          content:
            '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Scale</title></head><body><p>Bounded synthetic passage.</p></body></html>',
        })),
      });
      let visits = 0;
      const original = Map.prototype.set;
      const observer = vi
        .spyOn(Map.prototype, "set")
        .mockImplementation(function (
          this: Map<unknown, unknown>,
          key: unknown,
          value: unknown,
        ) {
          if (typeof key === "string" && /^raf-\d+$/.test(key)) visits++;
          return original.call(this, key, value);
        });
      const result = await openEpubPublication(bytes);
      observer.mockRestore();
      expect(result.ok).toBe(true);
      if (result.ok) {
        try {
          expect(visits).toBeLessThanOrEqual(count * 12);
        } finally {
          await result.publication.close();
        }
      }
    },
  );
  it("SAC-13 resolves equivalent opaque fragments to the exact public target", async () => {
    const opened = await openEpubPublication(
      await buildMinimalEpubFixture({
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Synthetic</title></head><body><p><a href="#note?1">Literal</a><a href="#note%3F1">Encoded</a><a href="chapter.xhtml?mode=reader#note?1">Query</a><a href="https://example.invalid/#note?1">External</a></p><p id="note?1">Destination</p></body></html>',
      }),
    );
    if (!opened.ok) throw new Error("synthetic-publication-open-failed");
    const publication = opened.publication;
    try {
      const block = publication.documents.find(
        (document) => document.location.kind === "spine",
      )?.blocks[0];
      if (block?.kind !== "paragraph")
        throw new Error("expected synthetic links");
      const links = block.children.filter(
        (inline) => inline.kind === "internal-link",
      );
      expect(links).toHaveLength(2);
      const destination = publication.locators[1];
      expect(destination).toBeDefined();
      for (const link of links)
        expect(publication.resolveTarget(link.target)).toMatchObject({
          status: "exact",
          reason: "fragment",
          locator: destination!.startLocator,
        });
    } finally {
      await publication.close();
    }
  });

  it("VF-0097 only publishes Auto scopes that retain text", async () => {
    for (const visible of [false, true]) {
      const bytes = await buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml"><body><p>Visible</p><p hidden=""><span dir="auto">Sample</span></p><p><span dir="auto"><br/></span>${visible ? '<span dir="auto">Visible Auto</span>' : ""}</p></body></html>`,
      });
      const opened = await openEpubPublication(bytes);
      if (!opened.ok) throw new Error(opened.detail);
      try {
        const chapter = opened.publication.documents.find(
          ({ location }) => location.kind === "spine",
        );
        expect(chapter?.autoDirectionScopeCount ?? 0).toBe(visible ? 1 : 0);
      } finally {
        await opened.publication.close();
      }
    }
  });

  it("VF-0120 resolves padded XML IDs while keeping XHTML IDs literal and old checkpoints usable", async () => {
    const bytes = await buildMinimalEpubFixture({
      navigationDocument: minimalNavigationDocument().replace(
        "#chapter-one",
        "#normalized",
      ),
      chapterDocument:
        '<html xmlns="http://www.w3.org/1999/xhtml"><body><p>First</p><p xml:id=" normalized ">Target</p><p id=" literal ">Literal</p><p xml:id="plain">Plain</p><p xml:id=" repeat ">One</p><p xml:id="repeat">Two</p></body></html>',
    });
    const opened = await openEpubPublication(bytes);
    if (!opened.ok) throw new Error(opened.detail);
    try {
      const { locators, navigation } = opened.publication;
      const link = navigation[0];
      if (link?.kind !== "link") throw new Error("expected navigation link");
      const target = locators[1]!.startLocator;
      expect(opened.publication.resolveTarget(link.target)).toMatchObject({
        status: "exact",
        reason: "fragment",
        locator: target,
      });
      expect(target.anchor.value).toBe("voxleaf-s0-a1");
      expect(locators[2]!.startLocator.anchor.value).not.toBe("literal");
      expect(locators[3]!.startLocator.anchor.value).toBe("plain");
      expect(locators[5]!.startLocator.anchor.value).toBe("repeat");
      expect(
        opened.publication.resolveTarget({
          documentId: link.target.documentId,
          fragment: "repeat",
        }),
      ).toMatchObject({ status: "recovered", reason: "fragment-unresolved" });
      const checkpoint = {
        ...target,
        anchor: { ...target.anchor, value: "voxleaf-s0-a1" },
        textOffsetCodePoints: createIndex(2),
      };
      expect(opened.publication.resolveLocator(checkpoint)).toMatchObject({
        locator: { anchor: target.anchor, textOffsetCodePoints: 2 },
      });
    } finally {
      await opened.publication.close();
    }
  });

  it("VF-0120 preserves a historical generated checkpoint when a normalized ID claims its value", async () => {
    const bytes = await buildMinimalEpubFixture({
      navigationDocument: minimalNavigationDocument().replace(
        "#chapter-one",
        "#voxleaf-s0-a0",
      ),
      chapterDocument:
        '<html xmlns="http://www.w3.org/1999/xhtml"><body><p>Original</p><p xml:id=" voxleaf-s0-a0 ">Second</p></body></html>',
    });
    const result = await openEpubPublication(bytes);
    if (!result.ok) throw new Error(result.detail);
    const publication = result.publication;
    try {
      const [first, second] = publication.locators;
      const saved = {
        ...first!.startLocator,
        anchor: { ...first!.startLocator.anchor, value: "voxleaf-s0-a0" },
        textOffsetCodePoints: createIndex(3),
      };
      const link = publication.navigation[0];
      if (link?.kind !== "link") throw new Error("expected navigation link");
      expect(publication.resolveTarget(link.target)).toMatchObject({
        status: "exact",
        locator: second!.startLocator,
      });
      expect(publication.resolveLocator(saved)).toMatchObject({
        locator: {
          anchor: first!.startLocator.anchor,
          textOffsetCodePoints: 3,
        },
      });
    } finally {
      await publication.close();
    }
  });

  it("VF-0120 retains a saved publisher anchor after its normalized fragment becomes ambiguous", async () => {
    const bytes = await buildMinimalEpubFixture({
      navigationDocument: minimalNavigationDocument().replace(
        "#chapter-one",
        "#voxleaf-s0-a0",
      ),
      chapterDocument:
        '<html xmlns="http://www.w3.org/1999/xhtml"><body><p>Unlabelled</p><p id="voxleaf-s0-a0">Original owner</p><p xml:id=" voxleaf-s0-a0 ">Duplicate</p></body></html>',
    });
    const result = await openEpubPublication(bytes);
    if (!result.ok) throw new Error(result.detail);
    let saved;
    try {
      const link = result.publication.navigation[0];
      if (link?.kind !== "link") throw new Error("expected navigation link");
      expect(result.publication.resolveTarget(link.target)).toMatchObject({
        status: "recovered",
        reason: "fragment-unresolved",
      });
      saved = {
        ...result.publication.locators[1]!.startLocator,
        anchor: {
          ...result.publication.locators[1]!.startLocator.anchor,
          value: "voxleaf-s0-a0",
        },
        textOffsetCodePoints: createIndex(4),
      };
    } finally {
      await result.publication.close();
    }
    const reopened = await openEpubPublication(bytes);
    if (!reopened.ok) throw new Error(reopened.detail);
    try {
      expect(reopened.publication.resolveLocator(saved)).toMatchObject({
        status: "exact",
        locatedBlock: reopened.publication.locators[1],
        locator: {
          anchor: { anchorIndex: 1, value: "voxleaf-s0-a0" },
          textOffsetCodePoints: 4,
        },
      });
    } finally {
      await reopened.publication.close();
    }
  });

  it.each(["&#x9;", "&#xD;", "&#xA;"])(
    "VF-0120 keeps referenced whitespace %s distinct while normalizing literal whitespace",
    async (reference) => {
      const bytes = await buildMinimalEpubFixture({
        navigationDocument: minimalNavigationDocument().replace(
          "#chapter-one",
          "#note",
        ),
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml"><body><p>First</p><p xml:id="${reference}note">Different</p><p xml:id="\t\r\n note \t">Target</p></body></html>`,
      });
      const result = await openEpubPublication(bytes);
      if (!result.ok) throw new Error(result.detail);
      const publication = result.publication;
      try {
        const link = publication.navigation[0];
        if (link?.kind !== "link") throw new Error("expected navigation link");
        expect(publication.resolveTarget(link.target)).toMatchObject({
          status: "exact",
          locator: publication.locators[2]!.startLocator,
        });
      } finally {
        await publication.close();
      }
    },
  );

  it("VF-0119 opens an escaped hash chapter with distinct literal-percent resource paths", async () => {
    const chapterDocument =
      '<html xmlns="http://www.w3.org/1999/xhtml"><body><p>First</p><p id="chapter-one">Destination</p></body></html>';
    const rasterBytes = syntheticStaticPngBytes();
    const bytes = await buildMinimalEpubFixture({
      packageDocument: minimalPackageDocument()
        .replace("text/chapter.xhtml", "text/chapter%23one.xhtml")
        .replace(
          "</manifest>",
          '<item id="aux" href="text/chapter%2523one.xhtml" media-type="application/xhtml+xml"/><item id="alias" href="../voxleaf-resource/0" media-type="application/xhtml+xml"/><item id="image" href="figure%23one.png" media-type="image/png"/></manifest>',
        ),
      chapterDocument: null,
      navigationDocument: minimalNavigationDocument().replace(
        "text/chapter.xhtml",
        "text/chapter%23one.xhtml",
      ),
      additionalEntries: [
        { name: "EPUB/text/chapter#one.xhtml", content: chapterDocument },
        {
          name: "EPUB/text/chapter%23one.xhtml",
          content: minimalChapterDocument(),
        },
        { name: "voxleaf-resource/0", content: minimalChapterDocument() },
        { name: "EPUB/figure#one.png", content: rasterBytes },
      ],
    });
    const opened = await openEpubPublication(bytes);
    expect(opened).toMatchObject({ ok: true });
    if (!opened.ok) return;
    let locator;
    try {
      const { book, locators, navigation } = opened.publication;
      const paths = book.resources.map(({ path }) => path);
      expect(new Set(paths).size).toBe(5);
      expect(paths).toContain("EPUB/text/chapter%23one.xhtml");
      expect(paths).toContain("voxleaf-resource/0");
      expect(book.spine[0]?.resourcePath).not.toBe("voxleaf-resource/0");
      expect(book.spine[0]?.resourcePath).not.toBe(
        "EPUB/text/chapter%23one.xhtml",
      );
      expect(paths).toContain(book.spine[0]?.resourcePath);
      const image = opened.publication.resources[0];
      if (image === undefined) throw new Error("expected synthetic image");
      expect(await opened.publication.readResource(image.id)).toEqual(
        rasterBytes,
      );
      const link = navigation[0];
      if (link?.kind !== "link") throw new Error("expected synthetic link");
      locator = locators[1]!.startLocator;
      expect(opened.publication.resolveTarget(link.target)).toMatchObject({
        status: "exact",
        locator,
      });
    } finally {
      await opened.publication.close();
    }
    const reopened = await openEpubPublication(bytes);
    if (!reopened.ok) throw new Error("expected same-byte reopen");
    try {
      expect(reopened.publication.resolveLocator(locator!)).toMatchObject({
        status: "exact",
        locator,
      });
    } finally {
      await reopened.publication.close();
    }
  });

  it("CHAT-AUDIT F03 opens each spine occurrence of a shared XHTML fallback with its own locator", async () => {
    const result = await openEpubPublication(
      await buildMinimalEpubFixture({
        packageDocument: minimalPackageDocument()
          .replace(
            "</manifest>",
            '<item id="one" href="one.bin" media-type="application/x-synthetic" fallback="chapter"/><item id="two" href="two.bin" media-type="application/x-synthetic" fallback="chapter"/></manifest>',
          )
          .replace(
            '<itemref idref="chapter"/>',
            '<itemref idref="one"/><itemref idref="two"/>',
          ),
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Shared</title></head><body><p id="shared">Shared passage.</p></body></html>',
        navigationDocument: minimalNavigationDocument().replace(
          "#chapter-one",
          "#shared",
        ),
        additionalEntries: [
          { name: "EPUB/one.bin", content: "one" },
          { name: "EPUB/two.bin", content: "two" },
        ],
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const publication = result.publication;
    try {
      expect(publication.book.spine).toHaveLength(2);
      const blocks = publication.locators;
      expect(blocks).toHaveLength(2);
      expect(new Set(blocks.map((block) => block.documentId)).size).toBe(2);
      for (const [index, block] of blocks.entries()) {
        expect(block.startLocator.spineItemIndex).toBe(index);
        expect(publication.resolveLocator(block.startLocator).status).toBe(
          "exact",
        );
        expect(
          publication.resolveTarget({
            documentId: block.documentId,
            fragment: "shared",
          }),
        ).toMatchObject({ locator: block.startLocator });
        const prepared = await publication.prepareNarration({
          startLocator: block.startLocator,
          profile: "narration-bilingual-v2",
          defaultLanguage: "en",
          maximumSegments: 1,
        });
        expect(["complete", "batch"]).toContain(prepared.status);
        if (prepared.status === "complete" || prepared.status === "batch")
          expect(prepared.segments[0]?.sourceRange.start.spineItemIndex).toBe(
            index,
          );
      }
      expect(
        publication.resolveTarget(
          publication.navigation[0]!.kind === "link"
            ? publication.navigation[0]!.target
            : {},
        ),
      ).toMatchObject({ locator: blocks[0]!.startLocator });
    } finally {
      await publication.close();
    }
  });

  it.each(["epub3", "epub2"] as const)(
    "five-pass 4.2 / R8-07 resolves original fallback references and their spine occurrences in %s",
    async (format) => {
      const packageXml = (
        format === "epub3"
          ? minimalPackageDocument()
          : minimalEpub2PackageDocument()
      )
        .replace(
          "</manifest>",
          '<item id="one" href="text/one.xhtml" media-type="application/xhtml+xml" properties="scripted" fallback="middle"/><item id="middle" href="middle.bin" media-type="application/x-synthetic" fallback="chapter"/><item id="two" href="text/two.xhtml" media-type="application/xhtml+xml" properties="scripted" fallback="chapter"/></manifest>',
        )
        .replace(
          '<itemref idref="chapter"/>',
          '<itemref idref="one"/><itemref idref="two"/><itemref idref="chapter"/>',
        );
      const chapterDocument =
        '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Safe</title></head><body><p id="chapter-one">Safe passage.</p><p><a href="one.xhtml">First</a><a href="two.xhtml#chapter-one">Second</a><a href="two.xhtml#absent">Missing</a><a href="chapter.xhtml#chapter-one">Direct</a><a href="two.xhtml#">Alias start</a><a href="chapter.xhtml#">Direct start</a><a href="https://example.invalid/one.xhtml">External</a></p></body></html>';
      const options = {
        packageDocument: packageXml,
        chapterDocument,
        additionalEntries: [
          { name: "EPUB/text/one.xhtml", content: "unused" },
          { name: "EPUB/text/two.xhtml", content: "unused" },
          { name: "EPUB/middle.bin", content: "unused" },
        ],
      };
      const result = await openEpubPublication(
        await (format === "epub3"
          ? buildMinimalEpubFixture({
              ...options,
              navigationDocument: minimalNavigationDocument()
                .replace("chapter.xhtml#chapter-one", "two.xhtml")
                .replace(
                  "</ol>",
                  '<li><a href="text/chapter.xhtml#chapter-one">Direct</a></li><li><a href="text/two.xhtml#">Alias start</a></li><li><a href="text/chapter.xhtml#">Direct start</a></li></ol>',
                ),
            })
          : buildMinimalEpub2Fixture({
              ...options,
              ncxDocument: minimalNcxDocument()
                .replace("chapter.xhtml#chapter-one", "two.xhtml")
                .replace(
                  "</navMap>",
                  '<navPoint id="direct" playOrder="2"><navLabel><text>Direct</text></navLabel><content src="text/chapter.xhtml#chapter-one"/></navPoint><navPoint id="alias-start" playOrder="3"><navLabel><text>Alias start</text></navLabel><content src="text/two.xhtml#"/></navPoint><navPoint id="direct-start" playOrder="4"><navLabel><text>Direct start</text></navLabel><content src="text/chapter.xhtml#"/></navPoint></navMap>',
                ),
            })),
      );
      if (!result.ok) throw new Error(JSON.stringify(result));
      const publication = result.publication;
      try {
        const navigation = publication.navigation[0]!;
        expect(navigation.kind).toBe("link");
        if (navigation.kind !== "link") return;
        expect(publication.resolveTarget(navigation.target)).toMatchObject({
          status: "exact",
          locator: { spineItemIndex: 1 },
        });
        const direct = publication.navigation[1]!;
        expect(direct.kind).toBe("link");
        if (direct.kind === "link")
          expect(publication.resolveTarget(direct.target)).toMatchObject({
            status: "exact",
            locator: { spineItemIndex: 0 },
          });
        for (const [index, spineItemIndex] of [
          [2, 1],
          [3, 0],
        ] as const) {
          const empty = publication.navigation[index]!;
          if (empty.kind !== "link")
            throw new Error("missing synthetic navigation start");
          expect(empty.target.fragment).toBe("");
          expect.soft(publication.resolveTarget(empty.target)).toMatchObject({
            status: "exact",
            reason: "document-start",
            locator: { spineItemIndex, textOffsetCodePoints: 0 },
          });
        }
        for (const document of publication.documents.filter(
          (document) => document.location.kind === "spine",
        )) {
          const paragraph = document.blocks[1];
          if (paragraph?.kind !== "paragraph")
            throw new Error("missing synthetic links");
          const links = paragraph.children.filter(
            (inline) => inline.kind === "internal-link",
          );
          expect(links).toHaveLength(6);
          expect(publication.resolveTarget(links[0]!.target)).toMatchObject({
            status: "exact",
            locator: { spineItemIndex: 0 },
          });
          expect(publication.resolveTarget(links[1]!.target)).toMatchObject({
            status: "exact",
            locator: { spineItemIndex: 1 },
          });
          expect(publication.resolveTarget(links[2]!.target)).toMatchObject({
            status: "recovered",
            reason: "fragment-unresolved",
            locator: { spineItemIndex: 1 },
          });
          expect(publication.resolveTarget(links[3]!.target)).toMatchObject({
            status: "exact",
            locator: {
              spineItemIndex:
                document.location.kind === "spine"
                  ? document.location.spineItemIndex
                  : -1,
            },
          });
          const currentSpine =
            document.location.kind === "spine"
              ? document.location.spineItemIndex
              : -1;
          for (const [index, spineItemIndex] of [
            [4, 1],
            [5, currentSpine],
          ] as const) {
            const target = links[index]!.target;
            expect(target.fragment).toBe("");
            expect.soft(publication.resolveTarget(target)).toMatchObject({
              status: "exact",
              reason: "document-start",
              locator: { spineItemIndex, textOffsetCodePoints: 0 },
            });
          }
          expect(JSON.stringify(links)).not.toContain("xhtml");
        }
      } finally {
        await publication.close();
      }
    },
  );

  it("five-pass 4.2 preserves rejection of a PNG link without an XHTML fallback", async () => {
    const fixture = await buildMinimalEpubFixture({
      packageDocument: minimalPackageDocument().replace(
        "</manifest>",
        '<item id="image" href="cover.png" media-type="image/png"/></manifest>',
      ),
      chapterDocument: minimalChapterDocument().replace(
        "</body>",
        '<p><a href="../cover.png#">Image start</a></p></body>',
      ),
      additionalEntries: [
        { name: "EPUB/cover.png", content: syntheticStaticPngBytes() },
      ],
    });

    expect(await openEpubPublication(fixture)).toMatchObject({
      ok: false,
      detail: "broken-reference",
      error: { code: "invalid-input" },
    });
  });

  it("RAC-06 / CLB-04 exposes no primary start when only auxiliary content is addressable", async () => {
    const result = await openEpubPublication(
      await buildMinimalEpubFixture({
        packageDocument: minimalPackageDocument()
          .replace(
            "</manifest>",
            '<item id="aux" href="text/aux.xhtml" media-type="application/xhtml+xml"/></manifest>',
          )
          .replace(
            '<itemref idref="chapter"/>',
            '<itemref idref="aux" linear="no"/><itemref idref="chapter"/>',
          ),
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Empty</title></head><body/></html>',
        additionalEntries: [
          { name: "EPUB/text/aux.xhtml", content: minimalChapterDocument() },
        ],
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    try {
      expect(result.publication.defaultStartLocator).toBeUndefined();
      const auxiliary = result.publication.locators[0]!.startLocator;
      expect(result.publication.resolveLocator(auxiliary).status).toBe("exact");
      expect(() =>
        result.publication.resolveLocator({
          ...auxiliary,
          spineItemId: "spine:missing",
          spineItemIndex: 99,
        }),
      ).toThrow(EpubArchiveError);
      expect(
        await result.publication.prepareNarration({
          startLocator: {
            ...auxiliary,
            spineItemId: "spine:missing",
            spineItemIndex: 99,
          },
          profile: "narration-v1",
          defaultLanguage: "und",
          maximumSegments: 1,
        }),
      ).toMatchObject({ status: "invalid-start" });
    } finally {
      await result.publication.close();
    }
  });
  it.each(["2.0", "3.0"] as const)(
    "RAC-06 / CLB-04 selects primary start without reindexing auxiliary content in EPUB %s",
    async (version) => {
      for (const emptyPrimary of [false, true]) {
        const packageDocument = (
          version === "2.0"
            ? minimalEpub2PackageDocument()
            : minimalPackageDocument()
        )
          .replace(
            "</manifest>",
            '<item id="aux" href="text/aux.xhtml" media-type="application/xhtml+xml"/><item id="last" href="text/last.xhtml" media-type="application/xhtml+xml"/></manifest>',
          )
          .replace(
            '<itemref idref="chapter"/>',
            '<itemref idref="aux" linear="no"/><itemref idref="chapter"/><itemref idref="last" linear="yes"/>',
          );
        const build =
          version === "2.0"
            ? buildMinimalEpub2Fixture
            : buildMinimalEpubFixture;
        const result = await openEpubPublication(
          await build({
            packageDocument,
            ...(emptyPrimary
              ? {
                  chapterDocument:
                    '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Empty</title></head><body/></html>',
                }
              : {}),
            additionalEntries: [
              {
                name: "EPUB/text/aux.xhtml",
                content: minimalChapterDocument(),
              },
              {
                name: "EPUB/text/last.xhtml",
                content: minimalChapterDocument(),
              },
            ],
          }),
        );
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        const publication = result.publication;
        try {
          const auxiliary = publication.locators[0]!;
          const primary = publication.locators.find(
            (block) =>
              block.startLocator.spineItemIndex === (emptyPrimary ? 2 : 1),
          )!;
          expect(auxiliary.startLocator.spineItemIndex).toBe(0);
          expect(
            publication.resolveLocator(auxiliary.startLocator).status,
          ).toBe("exact");
          expect(
            publication.resolveTarget({ documentId: auxiliary.documentId }),
          ).toMatchObject({ locator: auxiliary.startLocator });
          const recovered = publication.resolveLocator({
            ...auxiliary.startLocator,
            spineItemId: "spine:missing",
            spineItemIndex: 99,
          });
          expect(recovered.reason).toBe("book-start");
          expect(recovered.locator).toEqual(primary.startLocator);
          expect(publication.defaultStartLocator).toEqual(primary.startLocator);
          const prepared = await publication.prepareNarration({
            startLocator: {
              ...auxiliary.startLocator,
              spineItemId: "spine:missing",
              spineItemIndex: 99,
            },
            profile: "narration-v1",
            defaultLanguage: "und",
            maximumSegments: 1,
          });
          expect(prepared.status).toBe("batch");
          if (prepared.status !== "batch")
            throw new Error("synthetic-preparation-failed");
          expect(prepared.start.resolutionReason).toBe("book-start");
          expect(prepared.segments[0]!.sourceRange.start).toEqual(
            primary.startLocator,
          );
          const exactAuxiliary = await publication.prepareNarration({
            startLocator: auxiliary.startLocator,
            profile: "narration-v1",
            defaultLanguage: "und",
            maximumSegments: 1,
          });
          expect(exactAuxiliary.status).toBe("batch");
          if (exactAuxiliary.status !== "batch")
            throw new Error("synthetic-preparation-failed");
          expect(exactAuxiliary.segments[0]!.sourceRange.start).toEqual(
            auxiliary.startLocator,
          );
        } finally {
          await publication.close();
        }
      }
    },
  );
  it("maps every fixed EPUB detail to the shared operational contract", () => {
    for (const [detail, operationalCode] of Object.entries(
      EXPECTED_OPERATIONAL_CODE,
    )) {
      const result = mapEpubFailure(
        new EpubArchiveError(detail as EpubArchiveErrorCode),
      );

      expect(result).toEqual({
        ok: false,
        detail,
        error: expect.objectContaining({ code: operationalCode }),
      });
      expect(decodeOperationalErrorV1(result.error)).toEqual(result.error);
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.error)).toBe(true);
    }
  });

  it("maps unknown exceptions to a content-free internal failure", () => {
    const canary = "private-title/private/path.xhtml?secret=book-prose";
    const source = new Error(canary, { cause: { canary } });
    const result = mapEpubFailure(source);
    const serialized = JSON.stringify(result);

    expect(result).toEqual({
      ok: false,
      detail: "internal-failure",
      error: {
        schemaVersion: 1,
        code: "internal-failure",
        category: "internal",
        severity: "fatal",
      },
    });
    expect(Object.keys(result)).toEqual(["ok", "detail", "error"]);
    expect(serialized).not.toContain(canary);
    expect(serialized).not.toContain("message");
    expect(serialized).not.toContain("stack");
    expect(serialized).not.toContain("cause");
  });

  it("returns invalid and cancelled input as values instead of throwing", async () => {
    await expect(openEpubPublication(new Uint8Array())).resolves.toEqual({
      ok: false,
      detail: "invalid-container",
      error: {
        schemaVersion: 1,
        code: "invalid-input",
        category: "input",
        severity: "recoverable",
      },
    });

    const controller = new AbortController();
    controller.abort("private-cancellation-reason");
    await expect(
      openEpubPublication(new Uint8Array([1]), {
        signal: controller.signal,
      }),
    ).resolves.toEqual({
      ok: false,
      detail: "cancelled",
      error: {
        schemaVersion: 1,
        code: "operation-cancelled",
        category: "cancellation",
        severity: "recoverable",
      },
    });
  });

  it("opens deterministic OPF 2 through NCX and XHTML 1.1 without exposing ignored data", async () => {
    const privacyCanary = "SYNTHETIC_EPUB2_PRIVATE_METADATA_CANARY";
    const worker = vi.fn(() => {
      throw new Error("worker must not be constructed");
    });
    const fetch = vi.fn(() => {
      throw new Error("network must not be requested");
    });
    vi.stubGlobal("Worker", worker);
    vi.stubGlobal("fetch", fetch);

    const options = {
      metadataForm: "deprecated-wrappers" as const,
      guide: minimalEpub2Guide().replace("Synthetic opening", privacyCanary),
      ncxDoctype: EPUB2_CANONICAL_NCX_DOCTYPE,
      chapterDoctype: EPUB2_CANONICAL_XHTML11_DOCTYPE,
    };
    const [bytes, repeatedBytes] = await Promise.all([
      buildMinimalEpub2Fixture(options),
      buildMinimalEpub2Fixture(options),
    ]);
    const originalBytes = bytes.slice();
    const result = await openEpubPublication(bytes);

    expect(repeatedBytes).toEqual(bytes);
    expect(bytes).toEqual(originalBytes);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(`unexpected fixed failure: ${result.detail}`);
    }
    try {
      expect(result.publication.book.metadata).toEqual({
        title: "Synthetic minimal EPUB 2 publication",
        authors: ["Synthetic EPUB 2 Author"],
      });
      expect(result.publication.book.navigation).toEqual([
        { label: "Chapter One", targetSpineItemId: "spine:0" },
      ]);
      expect(result.publication.navigation).toEqual([
        {
          kind: "link",
          label: "Chapter One",
          target: { documentId: "document:1", fragment: "chapter-one" },
          children: [],
        },
      ]);
      expect(result.publication.documents).toHaveLength(1);
      expect(JSON.stringify(result)).not.toContain(privacyCanary);
      expect(JSON.stringify(result)).not.toContain("toc.ncx");
      expect(worker).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      await result.publication.close();
    }
  });

  it("releases archive state and returns no publication after malformed NCX", async () => {
    const close = vi.spyOn(ZipReader.prototype, "close");
    const privacyCanary = "SYNTHETIC_PRIVATE_NCX_CANARY";
    const result = await openEpubPublication(
      await buildMinimalEpub2Fixture({
        ncxDocument: `<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="urn:synthetic"/></head><docTitle><text>Title</text></docTitle><navMap>${privacyCanary}</navMap></ncx>`,
      }),
    );

    expect(result).toEqual({
      ok: false,
      detail: "malformed-package",
      error: {
        schemaVersion: 1,
        code: "invalid-input",
        category: "input",
        severity: "recoverable",
      },
    });
    expect(result).not.toHaveProperty("publication");
    expect(JSON.stringify(result)).not.toContain(privacyCanary);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("releases archive state and returns no publication after a later-stage failure", async () => {
    const close = vi.spyOn(ZipReader.prototype, "close");
    const result = await openEpubPublication(
      await buildMinimalEpubFixture({
        chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml">`,
      }),
    );

    expect(result).toEqual({
      ok: false,
      detail: "malformed-xml",
      error: {
        schemaVersion: 1,
        code: "invalid-input",
        category: "input",
        severity: "recoverable",
      },
    });
    expect(result).not.toHaveProperty("publication");
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("opens EPUB 3 with legacy metadata and inert HTML doctypes", async () => {
    const packageDocument = minimalPackageDocument().replace(
      "</metadata>",
      '<meta name="generator" content="synthetic-tool"/><meta name="cover" content="synthetic-cover"/></metadata>',
    );
    const result = await openEpubPublication(
      await buildMinimalEpubFixture({
        packageDocument,
        navigationDocument: `<!DOCTYPE html>${minimalNavigationDocument()}`,
        chapterDocument: `<!DOCTYPE html>${minimalChapterDocument()}`,
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(`unexpected fixed failure: ${result.detail}`);
    }
    try {
      expect(result.publication.book.metadata.title).toBe(
        "Synthetic minimal publication",
      );
      expect(JSON.stringify(result.publication)).not.toContain(
        "synthetic-tool",
      );
      expect(JSON.stringify(result.publication)).not.toContain(
        "synthetic-cover",
      );
    } finally {
      await result.publication.close();
    }
  });

  it("assembles immutable semantic, navigation, resource, and locator output", async () => {
    const worker = vi.fn(() => {
      throw new Error("worker must not be constructed");
    });
    const fetch = vi.fn(() => {
      throw new Error("network must not be requested");
    });
    vi.stubGlobal("Worker", worker);
    vi.stubGlobal("fetch", fetch);

    const result = await openEpubPublication(await buildMinimalEpubFixture());
    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(`unexpected fixed failure: ${result.detail}`);
    }

    const { publication } = result;
    try {
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(publication)).toBe(true);
      expect(publication.documents.map((document) => document.id)).toEqual([
        "document:0",
        "document:1",
      ]);
      expect(publication.navigation).toEqual([
        {
          kind: "link",
          label: "Chapter One",
          target: { documentId: "document:1", fragment: "chapter-one" },
          children: [],
        },
      ]);
      expect(publication.resources).toEqual([]);
      expect(publication.locators).toHaveLength(2);
      const first = publication.locators[0];
      expect(first).toBeDefined();
      if (first === undefined) {
        throw new Error("expected a first locator");
      }
      expect(publication.resolveLocator(first.startLocator)).toEqual({
        status: "exact",
        reason: "exact",
        locator: first.startLocator,
        locatedBlock: first,
      });
      const narration = await publication.prepareNarration({
        startLocator: first.startLocator,
        profile: "narration-v1",
        defaultLanguage: "und",
        maximumSegments: 16,
      });
      expect(narration.status).toBe("complete");
      if (narration.status !== "complete") {
        throw new Error("expected public narration preparation to complete");
      }
      expect(narration.segments.length).toBeGreaterThan(0);
      expect(narration.segments[0]?.sourceRange.start).toEqual(
        first.startLocator,
      );
      const navigationLink = publication.navigation[0];
      if (navigationLink?.kind !== "link") {
        throw new Error("expected one navigation link");
      }
      expect(publication.resolveTarget(navigationLink.target)).toEqual({
        status: "exact",
        reason: "fragment",
        locator: first.startLocator,
        locatedBlock: first,
      });
      expect(publication.resolveTarget({ documentId: "document:1" })).toEqual({
        status: "exact",
        reason: "document-start",
        locator: first.startLocator,
        locatedBlock: first,
      });
      expect(
        publication.resolveTarget({
          documentId: "document:1",
          fragment: "missing-private-fragment",
        }),
      ).toEqual({
        status: "recovered",
        reason: "fragment-unresolved",
        locator: first.startLocator,
        locatedBlock: first,
      });
      expect(publication.resolveTarget({ documentId: "document:0" })).toEqual({
        status: "unavailable",
        reason: "non-spine-document",
      });
      expect(
        publication.resolveTarget({ documentId: "document:unknown" }),
      ).toEqual({
        status: "unavailable",
        reason: "unknown-document",
      });
      const controller = new AbortController();
      controller.abort("private-cancellation-reason");
      expect(() =>
        publication.resolveTarget(
          { documentId: "document:1" },
          { signal: controller.signal },
        ),
      ).toThrowError(expect.objectContaining({ code: "cancelled" }));
      expect(worker).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      await publication.close();
    }
    expect(publication.closed).toBe(true);
    expect(() =>
      publication.resolveTarget({ documentId: "document:1" }),
    ).toThrowError(expect.objectContaining({ code: "internal-failure" }));
  });

  it("recovers duplicate and non-addressable fragments to the same document start", async () => {
    const result = await openEpubPublication(
      await buildMinimalEpubFixture({
        navigationDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><body><nav epub:type="toc"><ol><li><a href="text/chapter.xhtml#duplicate">Duplicate</a></li><li><a href="text/chapter.xhtml#inline-target">Inline</a></li></ol></nav></body></html>',
        chapterDocument:
          '<html xmlns="http://www.w3.org/1999/xhtml"><body><h1 id="start">Start</h1><p id="duplicate">First duplicate</p><p id="duplicate">Second duplicate</p><p>Before <span id="inline-target">inside</span></p></body></html>',
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(`unexpected fixed failure: ${result.detail}`);
    }

    const { publication } = result;
    try {
      const first = publication.locators[0];
      if (first === undefined) {
        throw new Error("expected a document-start locator");
      }
      expect(publication.navigation).toHaveLength(2);
      for (const node of publication.navigation) {
        if (node.kind !== "link") {
          throw new Error("expected navigation links");
        }
        expect(publication.resolveTarget(node.target)).toEqual({
          status: "recovered",
          reason: "fragment-unresolved",
          locator: first.startLocator,
          locatedBlock: first,
        });
      }
    } finally {
      await publication.close();
    }
  });
});
