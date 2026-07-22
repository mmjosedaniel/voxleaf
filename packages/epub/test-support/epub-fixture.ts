import {
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipWriter,
} from "@zip.js/zip.js/lib/zip-core-native.js";

const encoder = new TextEncoder();
const EPUB_MIMETYPE = "application/epub+zip";

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

function fail(
  code: "fixture-entry-invalid" | "fixture-mutation-invalid",
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
      content: Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a),
      compression: "stored",
    }),
  ]);
}

export function minimalContainerDocument(): string {
  return `<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`;
}

export function minimalPackageDocument(): string {
  return `<package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/" version="3.0" unique-identifier="pub-id"><metadata><dc:identifier id="pub-id">urn:synthetic:minimal</dc:identifier><dc:title>Synthetic minimal publication</dc:title><dc:language>en</dc:language><meta property="dcterms:modified">2026-07-22T00:00:00Z</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="chapter" href="text/chapter.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="chapter"/></spine></package>`;
}

export function minimalNavigationDocument(): string {
  return `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc"><h2>Contents</h2><ol><li><a href="text/chapter.xhtml#chapter-one">Chapter One</a></li></ol></nav></body></html>`;
}

export function minimalChapterDocument(): string {
  return `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Chapter One</title></head><body><h1 id="chapter-one">Chapter One</h1><p>Repository-authored synthetic prose.</p></body></html>`;
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
  return `<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><title>Continuation</title></head><body><h1 id="continuation">Continuation</h1><blockquote><p id="duplicate">A synthetic quotation.</p></blockquote><ol><li><p id="duplicate">First item</p></li><li>Second <code>item()</code></li></ol></body></html>`;
}

function comprehensiveAppendix(): string {
  return `<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Appendix</title></head><body><h2 id="appendix">Appendix</h2><p>Nonlinear synthetic material.</p></body></html>`;
}
