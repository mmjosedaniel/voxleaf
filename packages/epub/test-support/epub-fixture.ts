import {
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipWriter,
} from "@zip.js/zip.js/lib/zip-core-native.js";

const encoder = new TextEncoder();
const EPUB_MIMETYPE = "application/epub+zip";

export const EPUB2_CANONICAL_NCX_DOCTYPE =
  '<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">';
export const EPUB2_CANONICAL_XHTML11_DOCTYPE =
  '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">';

const FIXED_ZIP_OPTIONS = Object.freeze({
  bufferedWrite: true,
  dataDescriptor: false,
  extendedTimestamp: false,
  externalFileAttributes: 0,
  keepOrder: true,
  msdosAttributesRaw: 0,
  transferStreams: false,
  useCompressionStream: false,
  useUnicodeFileNames: true,
  useWebWorkers: false,
  version: 20,
  versionMadeBy: 20,
  zip64: false,
});

export type EpubFixtureContent = string | Uint8Array;
export type EpubFixtureCompression = "deflate" | "stored";

export type EpubVersionEquivalenceFixtureVersion = "2.0" | "3.0";

/**
 * Provenance for the paired EPUB 2/3 fixture used to prove that package
 * version differences do not alter the public reader or narration semantics.
 */
export const EPUB_VERSION_EQUIVALENCE_FIXTURE_PROVENANCE = Object.freeze({
  kind: "repository-authored-synthetic",
  source: "packages/epub/test-support/epub-fixture.ts",
  versions: Object.freeze(["2.0", "3.0"] as const),
} as const);

/** The approved reader semantic-block ceiling from ADR-0008. */
export const READER_SEMANTIC_BLOCK_LIMIT = 10_000;

/** One reader case immediately above the approved semantic-block ceiling. */
export const READER_SEMANTIC_BLOCK_OVER_LIMIT = READER_SEMANTIC_BLOCK_LIMIT + 1;

export const READER_REFLOW_PARAGRAPH_COUNT = 36;
export const READER_REFLOW_PRESERVED_PARAGRAPH_INDEX = 18;

/**
 * Provenance for the short Milestone 5 public narration fixture. Every text
 * value is original repository-authored synthetic test content.
 */
export const NARRATION_INTEGRATION_FIXTURE_PROVENANCE = Object.freeze({
  kind: "repository-authored-synthetic",
  source: "packages/epub/test-support/epub-fixture.ts",
} as const);

export const NARRATION_INTEGRATION_FIXTURE_EXPECTATIONS = Object.freeze({
  anchors: Object.freeze({
    neutralHeading: "neutral-heading",
    neutralInline: "neutral-inline",
    neutralQuote: "neutral-quote",
    neutralListOne: "neutral-list-one",
    neutralListTwo: "neutral-list-two",
    neutralDialogue: "neutral-dialogue",
    neutralScene: "neutral-scene",
    neutralLong: "neutral-long",
    spanishHeading: "spanish-heading",
    spanishDialogue: "spanish-dialogue",
    spanishForms: "spanish-forms",
    spanishForeign: "spanish-foreign",
    spanishImage: "spanish-image",
    finalHeading: "final-heading",
    finalParagraph: "final-paragraph",
  }),
  narrationText: Object.freeze({
    neutralHeading: "Neutral opening",
    neutralInline:
      "A brief emphasis, strong text, and synthetic link keep code_21() unchanged. Next line stays beside an image without speaking its label.",
    neutralQuote: "“A synthetic quotation remains intact.”",
    neutralListOne: "First nested list item.",
    neutralListTwo: "Second item keeps item_2() unchanged.",
    firstDialogueTurn: "—First synthetic voice.",
    secondDialogueTurn: "—Second synthetic voice.",
    spanishHeading: "Escena española",
    firstSpanishDialogueTurn: "—¿Llegó la doctora Mar?",
    secondSpanishDialogueTurn: "—Sí, llegó.",
    spanishForms:
      "La doctora Mar llegó el veinticuatro de julio de dos mil veintiséis a las catorce treinta; pagó doce euros con cincuenta céntimos y dejó veinticinco por ciento.",
    spanishForeign: "Después saludó a George Smith y a Sol y Mar.",
    finalHeading: "Final section",
    finalParagraph: "Final synthetic sentence.",
  }),
  omittedText: Object.freeze({
    imageAlternative: "NARRATION_IMAGE_ALTERNATIVE_CANARY",
    sceneBreak: "***",
  }),
});

/**
 * Structural expectations are authored with the fixture, never derived from
 * an opened publication. Tests combine these values with the independently
 * calculated exact-byte book identity when they require a complete locator.
 */
export interface ReaderFixtureLocatorExpectation {
  readonly spineItemId: string;
  readonly spineItemIndex: number;
  readonly anchorIndex: number;
  readonly anchorValue: string;
  readonly textOffsetCodePoints: number;
}

export const READER_FIXTURE_EXPECTED_LOCATORS = Object.freeze({
  navigation: Object.freeze([
    Object.freeze({
      spineItemId: "spine:0",
      spineItemIndex: 0,
      anchorIndex: 0,
      anchorValue: "opening",
      textOffsetCodePoints: 0,
    }),
    Object.freeze({
      spineItemId: "spine:1",
      spineItemIndex: 1,
      anchorIndex: 0,
      anchorValue: "continuation",
      textOffsetCodePoints: 0,
    }),
    Object.freeze({
      spineItemId: "spine:2",
      spineItemIndex: 2,
      anchorIndex: 0,
      anchorValue: "appendix",
      textOffsetCodePoints: 0,
    }),
  ] satisfies readonly ReaderFixtureLocatorExpectation[]),
  reflow: Object.freeze({
    spineItemId: "spine:0",
    spineItemIndex: 0,
    anchorIndex: READER_REFLOW_PRESERVED_PARAGRAPH_INDEX + 1,
    anchorValue: "reader-reflow-passage",
    textOffsetCodePoints: 0,
  } satisfies ReaderFixtureLocatorExpectation),
});

export interface ReaderReflowEpubFixtureOptions {
  /** Total paragraphs after the chapter heading. */
  readonly paragraphCount?: number;
  /** Zero-based paragraph that receives the stable restoration anchor. */
  readonly preservedPassageIndex?: number;
}

export interface ReaderLongChapterEpubFixtureOptions {
  /** Includes the chapter heading and every generated paragraph/target heading. */
  readonly semanticBlockCount: number;
  /** Optional zero-based block index for a navigable deep target heading. */
  readonly deepTargetBlockIndex?: number;
}

export type ReaderRasterFixtureCase =
  "valid-png" | "missing-reference" | "signature-mismatch";

export interface ReaderRasterEpubFixtureOptions {
  readonly imageCase?: ReaderRasterFixtureCase;
}

/** Returns caller-owned bytes for one repository-authored static 1x1 PNG. */
export function syntheticStaticPngBytes(): Uint8Array {
  return Uint8Array.from([
    137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0,
    0, 0, 1, 8, 4, 0, 0, 0, 181, 28, 12, 2, 0, 0, 0, 11, 73, 68, 65, 84, 120,
    218, 99, 100, 248, 15, 0, 1, 5, 1, 1, 39, 24, 227, 102, 0, 0, 0, 0, 73, 69,
    78, 68, 174, 66, 96, 130,
  ]);
}

export interface EpubFixtureExtraField {
  readonly id: number;
  readonly data: Uint8Array;
}

/** One deliberately ordered entry in a deterministic in-memory ZIP. */
export interface EpubFixtureEntry {
  readonly name: string;
  readonly content?: EpubFixtureContent;
  readonly compression?: EpubFixtureCompression;
  readonly directory?: boolean;
  readonly encodedName?: Uint8Array;
  readonly externalFileAttributes?: number;
  readonly extraFields?: readonly EpubFixtureExtraField[];
  readonly versionMadeBy?: number;
  readonly zip64?: boolean;
}

interface DescribedFixtureMutation {
  /** Reviewable explanation of the ZIP field or malformed state being changed. */
  readonly description: string;
}

export interface AppendFixtureBytesMutation extends DescribedFixtureMutation {
  readonly kind: "append";
  readonly bytes: Uint8Array;
}

export interface PrependFixtureBytesMutation extends DescribedFixtureMutation {
  readonly kind: "prepend";
  readonly bytes: Uint8Array;
}

export interface ReplaceFixtureBytesMutation extends DescribedFixtureMutation {
  readonly kind: "replace";
  readonly offset: number;
  readonly expected: Uint8Array;
  readonly replacement: Uint8Array;
}

export interface TruncateFixtureMutation extends DescribedFixtureMutation {
  readonly kind: "truncate";
  readonly byteLength: number;
}

/**
 * Byte mutations are applied in order. Every mutation requires a human-readable
 * description, and replacement mutations verify the original bytes before
 * editing so a library update cannot silently corrupt the wrong ZIP field.
 */
export type EpubFixtureMutation =
  | AppendFixtureBytesMutation
  | PrependFixtureBytesMutation
  | ReplaceFixtureBytesMutation
  | TruncateFixtureMutation;

export interface MinimalEpubFixtureOptions {
  /** `null` omits the entry; `undefined` uses the valid synthetic default. */
  readonly mimetype?: EpubFixtureContent | null;
  /** `null` omits the entry; `undefined` uses the valid synthetic default. */
  readonly containerDocument?: EpubFixtureContent | null;
  /** `null` omits the entry; `undefined` uses the valid synthetic default. */
  readonly packageDocument?: EpubFixtureContent | null;
  /** `null` omits the entry; `undefined` uses the valid synthetic default. */
  readonly navigationDocument?: EpubFixtureContent | null;
  /** `null` omits the entry; `undefined` uses the valid synthetic default. */
  readonly chapterDocument?: EpubFixtureContent | null;
  readonly additionalEntries?: readonly EpubFixtureEntry[];
  readonly mutations?: readonly EpubFixtureMutation[];
}

export type Epub2FixtureMetadataForm = "direct" | "deprecated-wrappers";

export interface MinimalEpub2PackageDocumentOptions {
  readonly metadataForm?: Epub2FixtureMetadataForm;
  /** Raw optional OPF 2 guide markup placed after the spine. */
  readonly guide?: string;
}

export interface MinimalEpub2FixtureOptions {
  /** `null` omits the entry; `undefined` uses the valid synthetic default. */
  readonly mimetype?: EpubFixtureContent | null;
  /** `null` omits the entry; `undefined` uses the valid synthetic default. */
  readonly containerDocument?: EpubFixtureContent | null;
  /** Overrides metadata-form and guide generation when supplied. */
  readonly packageDocument?: EpubFixtureContent | null;
  /** `null` omits the entry; `undefined` uses the valid synthetic NCX. */
  readonly ncxDocument?: EpubFixtureContent | null;
  /** `null` omits the entry; `undefined` uses the valid synthetic XHTML. */
  readonly chapterDocument?: EpubFixtureContent | null;
  readonly metadataForm?: Epub2FixtureMetadataForm;
  /** Raw optional OPF 2 guide markup placed after the generated spine. */
  readonly guide?: string;
  /** Raw test-only declaration prepended exactly to the NCX document. */
  readonly ncxDoctype?: string;
  /** Raw test-only declaration prepended exactly to the XHTML document. */
  readonly chapterDoctype?: string;
  readonly additionalEntries?: readonly EpubFixtureEntry[];
  readonly mutations?: readonly EpubFixtureMutation[];
}

function fail(
  code:
    | "fixture-entry-invalid"
    | "fixture-mutation-invalid"
    | "fixture-reader-scenario-invalid",
): never {
  throw new Error(code);
}

function fixedZipDate(): Date {
  // ZIP stores timezone-free DOS date fields, so use fixed local components.
  return new Date(2000, 0, 1, 0, 0, 0, 0);
}

function contentBytes(content: EpubFixtureContent | undefined): Uint8Array {
  return typeof content === "string"
    ? encoder.encode(content)
    : (content?.slice() ?? new Uint8Array());
}

function extraFieldMap(
  fields: readonly EpubFixtureExtraField[] | undefined,
): Map<number, Uint8Array> | undefined {
  if (fields === undefined) {
    return undefined;
  }

  const result = new Map<number, Uint8Array>();
  for (const field of fields) {
    if (
      !Number.isSafeInteger(field.id) ||
      field.id < 0 ||
      field.id > 0xffff ||
      result.has(field.id)
    ) {
      return fail("fixture-entry-invalid");
    }
    result.set(field.id, field.data.slice());
  }
  return result;
}

/** Builds exactly the supplied entry sequence without filesystem or network IO. */
export async function buildDeterministicZipFixture(
  entries: readonly EpubFixtureEntry[],
): Promise<Uint8Array> {
  const writer = new ZipWriter(new Uint8ArrayWriter(), {
    ...FIXED_ZIP_OPTIONS,
    lastModDate: fixedZipDate(),
  });

  for (const entry of entries) {
    const encodedName = entry.encodedName?.slice();
    const extraField = extraFieldMap(entry.extraFields);
    await writer.add(
      entry.name,
      new Uint8ArrayReader(contentBytes(entry.content)),
      {
        ...FIXED_ZIP_OPTIONS,
        directory: entry.directory ?? false,
        externalFileAttributes:
          entry.externalFileAttributes ??
          FIXED_ZIP_OPTIONS.externalFileAttributes,
        lastModDate: fixedZipDate(),
        level: (entry.compression ?? "deflate") === "stored" ? 0 : 6,
        versionMadeBy: entry.versionMadeBy ?? FIXED_ZIP_OPTIONS.versionMadeBy,
        zip64: entry.zip64 ?? false,
        ...(encodedName === undefined
          ? {}
          : {
              encodeText: (value: string) =>
                value === entry.name ? encodedName.slice() : undefined,
            }),
        ...(extraField === undefined ? {} : { extraField }),
      },
    );
  }

  return writer.close(undefined, { zip64: false });
}

function requireMutationDescription(description: string): void {
  if (description.trim().length === 0) {
    return fail("fixture-mutation-invalid");
  }
}

function concatenate(left: Uint8Array, right: Uint8Array): Uint8Array {
  const output = new Uint8Array(left.byteLength + right.byteLength);
  output.set(left);
  output.set(right, left.byteLength);
  return output;
}

function prependFixtureText(
  content: EpubFixtureContent,
  prefix: string | undefined,
): EpubFixtureContent {
  if (prefix === undefined) {
    return typeof content === "string" ? content : content.slice();
  }
  return concatenate(encoder.encode(prefix), contentBytes(content));
}

function replaceFixtureBytes(
  input: Uint8Array,
  mutation: ReplaceFixtureBytesMutation,
): Uint8Array {
  if (
    !Number.isSafeInteger(mutation.offset) ||
    mutation.offset < 0 ||
    mutation.expected.byteLength === 0 ||
    mutation.expected.byteLength !== mutation.replacement.byteLength ||
    mutation.offset > input.byteLength - mutation.expected.byteLength
  ) {
    return fail("fixture-mutation-invalid");
  }
  for (const [index, expected] of mutation.expected.entries()) {
    if (input[mutation.offset + index] !== expected) {
      return fail("fixture-mutation-invalid");
    }
  }

  const output = input.slice();
  output.set(mutation.replacement, mutation.offset);
  return output;
}

/** Applies documented low-level mutations without changing the source bytes. */
export function applyEpubFixtureMutations(
  source: Uint8Array,
  mutations: readonly EpubFixtureMutation[],
): Uint8Array {
  let output: Uint8Array = source.slice();
  for (const mutation of mutations) {
    requireMutationDescription(mutation.description);
    switch (mutation.kind) {
      case "append":
        if (mutation.bytes.byteLength === 0) {
          return fail("fixture-mutation-invalid");
        }
        output = concatenate(output, mutation.bytes);
        break;
      case "prepend":
        if (mutation.bytes.byteLength === 0) {
          return fail("fixture-mutation-invalid");
        }
        output = concatenate(mutation.bytes, output);
        break;
      case "replace":
        output = replaceFixtureBytes(output, mutation);
        break;
      case "truncate":
        if (
          !Number.isSafeInteger(mutation.byteLength) ||
          mutation.byteLength < 0 ||
          mutation.byteLength >= output.byteLength
        ) {
          return fail("fixture-mutation-invalid");
        }
        output = output.slice(0, mutation.byteLength);
        break;
    }
  }
  return output;
}

function addOptionalEntry(
  entries: EpubFixtureEntry[],
  name: string,
  value: EpubFixtureContent | null | undefined,
  fallback: string,
  compression: EpubFixtureCompression,
): void {
  if (value !== null) {
    entries.push(
      Object.freeze({
        name,
        content: value ?? fallback,
        compression,
      }),
    );
  }
}

/** Builds a valid minimal EPUB by default and accepts explicit malformed inputs. */
export async function buildMinimalEpubFixture(
  options: MinimalEpubFixtureOptions = {},
): Promise<Uint8Array> {
  const entries: EpubFixtureEntry[] = [];
  addOptionalEntry(
    entries,
    "mimetype",
    options.mimetype,
    EPUB_MIMETYPE,
    "stored",
  );
  addOptionalEntry(
    entries,
    "META-INF/container.xml",
    options.containerDocument,
    minimalContainerDocument(),
    "deflate",
  );
  addOptionalEntry(
    entries,
    "EPUB/package.opf",
    options.packageDocument,
    minimalPackageDocument(),
    "deflate",
  );
  addOptionalEntry(
    entries,
    "EPUB/nav.xhtml",
    options.navigationDocument,
    minimalNavigationDocument(),
    "deflate",
  );
  addOptionalEntry(
    entries,
    "EPUB/text/chapter.xhtml",
    options.chapterDocument,
    minimalChapterDocument(),
    "deflate",
  );
  entries.push(...(options.additionalEntries ?? []));

  const archive = await buildDeterministicZipFixture(entries);
  return options.mutations === undefined
    ? archive
    : applyEpubFixtureMutations(archive, options.mutations);
}

/**
 * Builds a deterministic synthetic OPF 2/NCX archive without changing the
 * EPUB 3 defaults of `buildMinimalEpubFixture`. Raw package, NCX, XHTML, and
 * doctype overrides keep malformed and exact-boundary cases reviewable.
 */
export async function buildMinimalEpub2Fixture(
  options: MinimalEpub2FixtureOptions = {},
): Promise<Uint8Array> {
  const entries: EpubFixtureEntry[] = [];
  addOptionalEntry(
    entries,
    "mimetype",
    options.mimetype,
    EPUB_MIMETYPE,
    "stored",
  );
  addOptionalEntry(
    entries,
    "META-INF/container.xml",
    options.containerDocument,
    minimalContainerDocument(),
    "deflate",
  );
  const packageDocument =
    options.packageDocument === undefined
      ? minimalEpub2PackageDocument({
          ...(options.metadataForm === undefined
            ? {}
            : { metadataForm: options.metadataForm }),
          ...(options.guide === undefined ? {} : { guide: options.guide }),
        })
      : options.packageDocument;
  addOptionalEntry(
    entries,
    "EPUB/package.opf",
    packageDocument,
    minimalEpub2PackageDocument(),
    "deflate",
  );
  const ncxDocument =
    options.ncxDocument === null
      ? null
      : prependFixtureText(
          options.ncxDocument ?? minimalNcxDocument(),
          options.ncxDoctype,
        );
  addOptionalEntry(
    entries,
    "EPUB/toc.ncx",
    ncxDocument,
    minimalNcxDocument(),
    "deflate",
  );
  const chapterDocument =
    options.chapterDocument === null
      ? null
      : prependFixtureText(
          options.chapterDocument ?? minimalChapterDocument(),
          options.chapterDoctype,
        );
  addOptionalEntry(
    entries,
    "EPUB/text/chapter.xhtml",
    chapterDocument,
    minimalChapterDocument(),
    "deflate",
  );
  entries.push(...(options.additionalEntries ?? []));

  const archive = await buildDeterministicZipFixture(entries);
  return options.mutations === undefined
    ? archive
    : applyEpubFixtureMutations(archive, options.mutations);
}

/**
 * Builds one rich, valid, repository-authored EPUB for the later integration
 * matrix. It includes multiple spine items, nested navigation, safe semantics,
 * a fallback-resolved spine item, a nonlinear appendix, local links, and PNG.
 */
export async function buildComprehensiveEpubFixture(): Promise<Uint8Array> {
  return buildDeterministicZipFixture([
    Object.freeze({
      name: "mimetype",
      content: EPUB_MIMETYPE,
      compression: "stored",
    }),
    Object.freeze({
      name: "META-INF/container.xml",
      content: minimalContainerDocument(),
      compression: "deflate",
    }),
    Object.freeze({
      name: "EPUB/package.opf",
      content: comprehensivePackageDocument(),
      compression: "deflate",
    }),
    Object.freeze({
      name: "EPUB/nav.xhtml",
      content: comprehensiveNavigationDocument(),
      compression: "deflate",
    }),
    Object.freeze({
      name: "EPUB/text/chapter-1.xhtml",
      content: comprehensiveFirstChapter(),
      compression: "deflate",
    }),
    Object.freeze({
      name: "EPUB/text/chapter-2.xhtml",
      content: comprehensiveSecondChapter(),
      compression: "deflate",
    }),
    Object.freeze({
      name: "EPUB/text/appendix.xhtml",
      content: comprehensiveAppendix(),
      compression: "deflate",
    }),
    Object.freeze({
      name: "EPUB/foreign.bin",
      content: Uint8Array.of(0x00),
      compression: "stored",
    }),
    Object.freeze({
      name: "EPUB/images/cover.png",
      content: syntheticStaticPngBytes(),
      compression: "stored",
    }),
  ]);
}

/**
 * Builds paired EPUB 2 and EPUB 3 archives with deliberately identical public
 * publication semantics. The package and navigation bytes remain distinct so
 * exact-byte identity isolation can be proved without special test remapping.
 */
export async function buildEpubVersionEquivalenceFixture(
  version: EpubVersionEquivalenceFixtureVersion,
): Promise<Uint8Array> {
  const epub2 = version === "2.0";
  return buildDeterministicZipFixture([
    Object.freeze({
      name: "mimetype",
      content: EPUB_MIMETYPE,
      compression: "stored",
    }),
    Object.freeze({
      name: "META-INF/container.xml",
      content: minimalContainerDocument(),
      compression: "deflate",
    }),
    Object.freeze({
      name: "EPUB/package.opf",
      content: epub2
        ? epubVersionEquivalencePackageDocument2()
        : epubVersionEquivalencePackageDocument3(),
      compression: "deflate",
    }),
    ...(epub2
      ? [
          Object.freeze({
            name: "EPUB/toc.ncx",
            content: `${EPUB2_CANONICAL_NCX_DOCTYPE}${epubVersionEquivalenceNcxDocument()}`,
            compression: "deflate" as const,
          }),
          Object.freeze({
            name: "EPUB/nav.xhtml",
            content: epubVersionEquivalenceContent(
              epubVersionEquivalenceNavigationDocument(),
              true,
            ),
            compression: "deflate" as const,
          }),
        ]
      : [
          Object.freeze({
            name: "EPUB/nav.xhtml",
            content: epubVersionEquivalenceNavigationDocument(),
            compression: "deflate" as const,
          }),
        ]),
    Object.freeze({
      name: "EPUB/text/chapter-1.xhtml",
      content: epubVersionEquivalenceContent(
        comprehensiveFirstChapter(),
        epub2,
      ),
      compression: "deflate",
    }),
    Object.freeze({
      name: "EPUB/text/chapter-2.xhtml",
      content: epubVersionEquivalenceContent(
        epubVersionEquivalenceSecondChapter(),
        epub2,
      ),
      compression: "deflate",
    }),
    Object.freeze({
      name: "EPUB/text/appendix.xhtml",
      content: epubVersionEquivalenceContent(comprehensiveAppendix(), epub2),
      compression: "deflate",
    }),
    Object.freeze({
      name: "EPUB/foreign.bin",
      content: Uint8Array.of(0x00),
      compression: "stored",
    }),
    Object.freeze({
      name: "EPUB/images/cover.png",
      content: syntheticStaticPngBytes(),
      compression: "stored",
    }),
  ]);
}

/**
 * Builds the short provenance-labeled public EPUB-to-segment matrix fixture.
 * It is deliberately separate from reader and ingestion fixtures so narration
 * expectations cannot be inferred from production output.
 */
export async function buildNarrationIntegrationEpubFixture(): Promise<Uint8Array> {
  return buildDeterministicZipFixture([
    Object.freeze({
      name: "mimetype",
      content: EPUB_MIMETYPE,
      compression: "stored",
    }),
    Object.freeze({
      name: "META-INF/container.xml",
      content: minimalContainerDocument(),
      compression: "deflate",
    }),
    Object.freeze({
      name: "EPUB/package.opf",
      content: narrationIntegrationPackageDocument(),
      compression: "deflate",
    }),
    Object.freeze({
      name: "EPUB/nav.xhtml",
      content: narrationIntegrationNavigationDocument(),
      compression: "deflate",
    }),
    Object.freeze({
      name: "EPUB/text/neutral.xhtml",
      content: narrationIntegrationNeutralChapter(),
      compression: "deflate",
    }),
    Object.freeze({
      name: "EPUB/text/spanish.xhtml",
      content: narrationIntegrationSpanishChapter(),
      compression: "deflate",
    }),
    Object.freeze({
      name: "EPUB/text/final.xhtml",
      content: narrationIntegrationFinalChapter(),
      compression: "deflate",
    }),
    Object.freeze({
      name: "EPUB/images/narration.png",
      content: syntheticStaticPngBytes(),
      compression: "stored",
    }),
  ]);
}

/**
 * Builds the multi-spine, nested-TOC, internal-target, and local-raster
 * fixture used by reader navigation scenarios.
 */
export async function buildReaderNavigationEpubFixture(): Promise<Uint8Array> {
  return buildComprehensiveEpubFixture();
}

/**
 * Builds a one-spine reflow case with one stable, independently documented
 * passage anchor. The displayed text remains repository-authored synthetic
 * content and no layout measurement is encoded into the EPUB.
 */
export async function buildReaderReflowEpubFixture(
  options: ReaderReflowEpubFixtureOptions = {},
): Promise<Uint8Array> {
  const paragraphCount = readerScenarioCount(
    options.paragraphCount ?? READER_REFLOW_PARAGRAPH_COUNT,
    1,
    READER_SEMANTIC_BLOCK_LIMIT - 1,
  );
  const preservedPassageIndex = readerScenarioCount(
    options.preservedPassageIndex ?? READER_REFLOW_PRESERVED_PARAGRAPH_INDEX,
    0,
    paragraphCount - 1,
  );
  const paragraphs = Array.from({ length: paragraphCount }, (_, index) =>
    index === preservedPassageIndex
      ? '<p id="reader-reflow-passage">Preserved synthetic passage with enough words to wrap across several visual lines while preferences and viewport geometry change.</p>'
      : `<p>Repository-authored reflow filler ${String(index + 1)} with deterministic local text.</p>`,
  ).join("");

  return buildMinimalEpubFixture({
    chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Reflow</title></head><body><h1 id="chapter-one">Reflow fixture</h1>${paragraphs}</body></html>`,
  });
}

/** The reflow case is also the canonical exact/recovered restoration fixture. */
export async function buildReaderRestorationEpubFixture(): Promise<Uint8Array> {
  return buildReaderReflowEpubFixture();
}

/**
 * Builds the approved exact-limit or exact-limit-plus-one reader chapter.
 * A deep target, when requested, replaces one generated paragraph so the
 * semantic-block count stays exact and navigation remains composable.
 */
export async function buildReaderLongChapterEpubFixture(
  options: ReaderLongChapterEpubFixtureOptions,
): Promise<Uint8Array> {
  const semanticBlockCount = readerScenarioCount(
    options.semanticBlockCount,
    1,
    READER_SEMANTIC_BLOCK_OVER_LIMIT,
  );
  const deepTargetBlockIndex = options.deepTargetBlockIndex;
  if (
    deepTargetBlockIndex !== undefined &&
    (!Number.isSafeInteger(deepTargetBlockIndex) ||
      deepTargetBlockIndex < 1 ||
      deepTargetBlockIndex >= semanticBlockCount)
  ) {
    return fail("fixture-reader-scenario-invalid");
  }

  const blocks: string[] = ['<h1 id="chapter-one">Limit section</h1>'];
  for (let index = 1; index < semanticBlockCount; index += 1) {
    blocks.push(
      index === deepTargetBlockIndex
        ? '<h2 id="deep-target">Deep target</h2>'
        : "<p>Synthetic production reader block.</p>",
    );
  }

  const navigationDocument =
    deepTargetBlockIndex === undefined
      ? minimalNavigationDocument()
      : '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc"><h2>Contents</h2><ol><li><a href="text/chapter.xhtml#chapter-one">Limit section</a></li><li><a href="text/chapter.xhtml#deep-target">Deep target</a></li></ol></nav></body></html>';

  return buildMinimalEpubFixture({
    chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Limit</title></head><body>${blocks.join("")}</body></html>`,
    navigationDocument,
  });
}

/**
 * Builds local-raster reader cases while keeping the supported, missing, and
 * signature-mismatch variations explicit and independent of ZIP mutations.
 */
export async function buildReaderRasterEpubFixture(
  options: ReaderRasterEpubFixtureOptions = {},
): Promise<Uint8Array> {
  const imageCase = options.imageCase ?? "valid-png";
  if (
    imageCase !== "valid-png" &&
    imageCase !== "missing-reference" &&
    imageCase !== "signature-mismatch"
  ) {
    return fail("fixture-reader-scenario-invalid");
  }

  const imageSource =
    imageCase === "missing-reference"
      ? "../images/missing.png"
      : "../images/cover.png";
  const packageDocument = readerRasterPackageDocument(
    imageCase !== "missing-reference",
  );
  const additionalEntries =
    imageCase === "missing-reference"
      ? []
      : [
          Object.freeze({
            name: "EPUB/images/cover.png",
            content:
              imageCase === "valid-png"
                ? syntheticStaticPngBytes()
                : Uint8Array.of(0x00, 0x01, 0x02, 0x03),
            compression: "stored" as const,
          }),
        ];

  return buildMinimalEpubFixture({
    packageDocument,
    chapterDocument: `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Raster</title></head><body><h1 id="reader-raster">Raster fixture</h1><p><img src="${imageSource}" alt="Synthetic reader image"/></p></body></html>`,
    additionalEntries,
  });
}

export function minimalContainerDocument(): string {
  return `<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`;
}

export function minimalPackageDocument(): string {
  return `<package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/" version="3.0" unique-identifier="pub-id"><metadata><dc:identifier id="pub-id">urn:synthetic:minimal</dc:identifier><dc:title>Synthetic minimal publication</dc:title><dc:language>en</dc:language><meta property="dcterms:modified">2026-07-22T00:00:00Z</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="chapter"/></spine></package>`;
}

export function minimalEpub2Guide(): string {
  return '<guide><reference type="text" title="Synthetic opening" href="text/chapter.xhtml#chapter-one"/></guide>';
}

export function minimalEpub2PackageDocument(
  options: MinimalEpub2PackageDocumentOptions = {},
): string {
  const dcMetadata =
    '<dc:identifier id="pub-id">urn:synthetic:minimal-epub2</dc:identifier><dc:title>Synthetic minimal EPUB 2 publication</dc:title><dc:language>en</dc:language><dc:creator>Synthetic EPUB 2 Author</dc:creator>';
  const metadata =
    (options.metadataForm ?? "direct") === "deprecated-wrappers"
      ? `<metadata><dc-metadata>${dcMetadata}</dc-metadata><x-metadata><meta name="generator" content="repository-authored-synthetic"/></x-metadata></metadata>`
      : `<metadata>${dcMetadata}</metadata>`;
  const guide = options.guide ?? "";
  return `<package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0" unique-identifier="pub-id">${metadata}<manifest><item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/><item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/></manifest><spine toc="ncx"><itemref idref="chapter"/></spine>${guide}</package>`;
}

export function minimalNcxDocument(): string {
  return '<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="urn:synthetic:minimal-epub2"/></head><docTitle><text>Synthetic minimal EPUB 2 publication</text></docTitle><navMap><navPoint id="chapter-one" playOrder="1"><navLabel><text>Chapter One</text></navLabel><content src="text/chapter.xhtml#chapter-one"/></navPoint></navMap></ncx>';
}

export function minimalNavigationDocument(): string {
  return `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc"><h2>Contents</h2><ol><li><a href="text/chapter.xhtml#chapter-one">Chapter One</a></li></ol></nav></body></html>`;
}

export function minimalChapterDocument(): string {
  return `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Chapter One</title></head><body><h1 id="chapter-one">Chapter One</h1><p>Repository-authored synthetic prose.</p></body></html>`;
}

function readerScenarioCount(
  value: number,
  minimum: number,
  maximum: number,
): number {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    return fail("fixture-reader-scenario-invalid");
  }
  return value;
}

function readerRasterPackageDocument(includeCover: boolean): string {
  const cover = includeCover
    ? '<item id="cover" href="images/cover.png" media-type="image/png"/>'
    : "";
  return `<package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/" version="3.0" unique-identifier="pub-id"><metadata><dc:identifier id="pub-id">urn:synthetic:reader-raster</dc:identifier><dc:title>Synthetic reader raster</dc:title><dc:language>en</dc:language><meta property="dcterms:modified">2026-07-22T00:00:00Z</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/>${cover}</manifest><spine><itemref idref="chapter"/></spine></package>`;
}

function comprehensivePackageDocument(): string {
  return `<package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/" version="3.0" unique-identifier="pub-id"><metadata><dc:identifier id="pub-id">urn:synthetic:comprehensive</dc:identifier><dc:title>Synthetic comprehensive publication</dc:title><dc:language>en</dc:language><dc:creator>First Synthetic Author</dc:creator><dc:creator>Second Synthetic Author</dc:creator><meta property="dcterms:modified">2026-07-22T00:00:00Z</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="chapter-one" href="text/chapter-1.xhtml" media-type="application/xhtml+xml"/><item id="chapter-two" href="text/chapter-2.xhtml" media-type="application/xhtml+xml"/><item id="appendix" href="text/appendix.xhtml" media-type="application/xhtml+xml"/><item id="foreign" href="foreign.bin" media-type="application/octet-stream" fallback="chapter-two"/><item id="cover" href="images/cover.png" media-type="image/png"/></manifest><spine><itemref idref="chapter-one"/><itemref idref="foreign"/><itemref idref="appendix" linear="no"/></spine></package>`;
}

function comprehensiveNavigationDocument(): string {
  return `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc"><h2>Contents</h2><ol><li><span>Part One</span><ol><li><a href="text/chapter-1.xhtml#opening">Opening</a></li><li><a href="text/chapter-2.xhtml#continuation">Continuation</a></li></ol></li><li><a href="text/appendix.xhtml#appendix">Appendix</a></li></ol></nav></body></html>`;
}

function comprehensiveFirstChapter(): string {
  return `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Opening</title></head><body><h1 id="opening">Opening</h1><p id="dialogue">“Synthetic dialogue,” said the first speaker.<br/>A second line uses <em>emphasis</em> and <strong>strength</strong>.</p><p><a href="chapter-2.xhtml#continuation">Continue</a> <img src="../images/cover.png" alt="Synthetic cover"/></p><hr/></body></html>`;
}

function comprehensiveSecondChapter(): string {
  const longCode = "synthetic_unbroken_code_token_".repeat(16);
  return `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Continuation</title></head><body><h1 id="continuation">Continuation</h1><blockquote><p id="duplicate">A synthetic quotation.</p></blockquote><ol><li><p id="duplicate">First item</p></li><li>Second <code>item()</code></li></ol><p><code>${longCode}</code></p></body></html>`;
}

function comprehensiveAppendix(): string {
  return `<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Appendix</title></head><body><h2 id="appendix">Appendix</h2><p>Nonlinear synthetic material.</p></body></html>`;
}

function epubVersionEquivalencePackageDocument2(): string {
  return `<package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0" unique-identifier="pub-id"><metadata><dc:identifier id="pub-id">urn:synthetic:epub-version-equivalence</dc:identifier><dc:title>Synthetic EPUB version equivalence</dc:title><dc:language>en</dc:language><dc:creator>First Synthetic Author</dc:creator><dc:creator>Second Synthetic Author</dc:creator></metadata><manifest><item id="nav-xhtml" href="nav.xhtml" media-type="application/xhtml+xml"/><item id="chapter-one" href="text/chapter-1.xhtml" media-type="application/xhtml+xml"/><item id="chapter-two" href="text/chapter-2.xhtml" media-type="application/xhtml+xml"/><item id="appendix" href="text/appendix.xhtml" media-type="application/xhtml+xml"/><item id="foreign" href="foreign.bin" media-type="application/octet-stream" fallback="chapter-two"/><item id="cover" href="images/cover.png" media-type="image/png"/><item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/></manifest><spine toc="ncx"><itemref idref="chapter-one"/><itemref idref="foreign"/><itemref idref="appendix" linear="no"/></spine></package>`;
}

function epubVersionEquivalencePackageDocument3(): string {
  return `<package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/" version="3.0" unique-identifier="pub-id"><metadata><dc:identifier id="pub-id">urn:synthetic:epub-version-equivalence</dc:identifier><dc:title>Synthetic EPUB version equivalence</dc:title><dc:language>en</dc:language><dc:creator>First Synthetic Author</dc:creator><dc:creator>Second Synthetic Author</dc:creator><meta property="dcterms:modified">2026-08-03T00:00:00Z</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="chapter-one" href="text/chapter-1.xhtml" media-type="application/xhtml+xml"/><item id="chapter-two" href="text/chapter-2.xhtml" media-type="application/xhtml+xml"/><item id="appendix" href="text/appendix.xhtml" media-type="application/xhtml+xml"/><item id="foreign" href="foreign.bin" media-type="application/octet-stream" fallback="chapter-two"/><item id="cover" href="images/cover.png" media-type="image/png"/></manifest><spine><itemref idref="chapter-one"/><itemref idref="foreign"/><itemref idref="appendix" linear="no"/></spine></package>`;
}

function epubVersionEquivalenceNavigationDocument(): string {
  return `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc"><h2>Contents</h2><ol><li><a href="text/chapter-1.xhtml#opening">Part One</a><ol><li><a href="text/chapter-2.xhtml#continuation">Continuation</a></li></ol></li><li><a href="text/appendix.xhtml#appendix">Appendix</a></li></ol></nav></body></html>`;
}

function epubVersionEquivalenceSecondChapter(): string {
  const boundedCode = "synthetic_unbroken_code_token_".repeat(4);
  return `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Continuation</title></head><body><h1 id="continuation">Continuation</h1><blockquote><p id="duplicate">A synthetic quotation.</p></blockquote><ol><li><p id="duplicate">First item</p></li><li>Second <code>item()</code></li></ol><p><code>${boundedCode}</code></p></body></html>`;
}

function epubVersionEquivalenceNcxDocument(): string {
  return `<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="urn:synthetic:epub-version-equivalence"/></head><docTitle><text>Synthetic EPUB version equivalence</text></docTitle><navMap><navPoint id="part-one" playOrder="30"><navLabel><text>Part One</text></navLabel><content src="text/chapter-1.xhtml#opening"/><navPoint id="continuation" playOrder="10"><navLabel><text>Continuation</text></navLabel><content src="text/chapter-2.xhtml#continuation"/></navPoint></navPoint><navPoint id="appendix" playOrder="20"><navLabel><text>Appendix</text></navLabel><content src="text/appendix.xhtml#appendix"/></navPoint></navMap></ncx>`;
}

function epubVersionEquivalenceContent(
  document: string,
  epub2: boolean,
): string {
  return epub2 ? `${EPUB2_CANONICAL_XHTML11_DOCTYPE}${document}` : document;
}

function narrationIntegrationPackageDocument(): string {
  return `<package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/" version="3.0" unique-identifier="pub-id"><metadata><dc:identifier id="pub-id">urn:synthetic:narration-integration</dc:identifier><dc:title>Synthetic narration integration</dc:title><dc:language>en</dc:language><dc:language>es</dc:language><meta property="dcterms:modified">2026-07-25T00:00:00Z</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="neutral" href="text/neutral.xhtml" media-type="application/xhtml+xml"/><item id="spanish" href="text/spanish.xhtml" media-type="application/xhtml+xml"/><item id="final" href="text/final.xhtml" media-type="application/xhtml+xml"/><item id="narration-image" href="images/narration.png" media-type="image/png"/></manifest><spine><itemref idref="neutral"/><itemref idref="spanish"/><itemref idref="final"/></spine></package>`;
}

function narrationIntegrationNavigationDocument(): string {
  return `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Synthetic narration contents</title></head><body><nav epub:type="toc"><h2>Contents</h2><ol><li><a href="text/neutral.xhtml#neutral-heading">Neutral opening</a></li><li><a href="text/spanish.xhtml#spanish-heading">Escena española</a></li><li><a href="text/final.xhtml#final-heading">Final section</a></li></ol></nav></body></html>`;
}

function narrationIntegrationNeutralChapter(): string {
  const longSentence = `${"Synthetic ".repeat(72)}ending.`;
  return `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Neutral narration</title></head><body><h1 id="neutral-heading">Neutral opening</h1><p id="neutral-inline">A brief <em>emphasis</em>, <strong>strong text</strong>, and <a href="spanish.xhtml#spanish-heading">synthetic link</a> keep <code>code_21()</code> unchanged.<br/>Next line stays beside an image <img src="../images/narration.png" alt="NARRATION_IMAGE_ALTERNATIVE_CANARY"/> without speaking its label.</p><blockquote><p id="neutral-quote">“A synthetic quotation remains intact.”</p><ul><li><p id="neutral-list-one">First nested list item.</p></li><li><p id="neutral-list-two">Second item keeps <code>item_2()</code> unchanged.</p></li></ul></blockquote><p id="neutral-dialogue">—First synthetic voice.<br/>—Second synthetic voice.</p><p id="neutral-scene">***</p><p id="neutral-long">${longSentence}</p></body></html>`;
}

function narrationIntegrationSpanishChapter(): string {
  return `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="es"><head><title>Narración española</title></head><body><h1 id="spanish-heading">Escena española</h1><p id="spanish-dialogue">—¿Llegó la Dra. Mar?<br/>—Sí, llegó.</p><p id="spanish-forms">La Dra. Mar llegó el 24/07/2026 a 14:30; pagó 12,50 € y dejó 25 %.</p><p id="spanish-foreign">Después saludó a <em xml:lang="en">George Smith</em> y a Sol &amp; Mar.</p><p id="spanish-image"><img src="../images/narration.png" alt="NARRATION_IMAGE_ALTERNATIVE_CANARY"/></p></body></html>`;
}

function narrationIntegrationFinalChapter(): string {
  return `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Final narration</title></head><body><h2 id="final-heading">Final section</h2><p id="final-paragraph">Final synthetic sentence.</p></body></html>`;
}
