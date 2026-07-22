import { EpubPathError } from "./path-error.js";

const MAX_ARCHIVE_PATH_BYTES = 2_048;
const MAX_ARCHIVE_PATH_COMPONENT_BYTES = 255;
const MAX_ARCHIVE_PATH_COMPONENTS = 32;

const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder("utf-8", {
  fatal: true,
  ignoreBOM: true,
});

declare const archiveFilePathBrand: unique symbol;
declare const archiveDirectoryPathBrand: unique symbol;

export type ArchiveFilePath = string & {
  readonly [archiveFilePathBrand]: "ArchiveFilePath";
};

export type ArchiveDirectoryPath = string & {
  readonly [archiveDirectoryPathBrand]: "ArchiveDirectoryPath";
};

export type ArchiveEntryPath = ArchiveDirectoryPath | ArchiveFilePath;
export type ArchiveEntryKind = "directory" | "file";

function unsafeEntry(): never {
  throw new EpubPathError("unsafe-entry");
}

function resourceLimitExceeded(): never {
  throw new EpubPathError("resource-limit-exceeded");
}

function isWellFormedUnicode(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);

    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const nextCodeUnit = value.charCodeAt(index + 1);
      if (nextCodeUnit < 0xdc00 || nextCodeUnit > 0xdfff) {
        return false;
      }

      index += 1;
    } else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      return false;
    }
  }

  return true;
}

function hasForbiddenCodePoint(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0);

    if (
      codePoint === undefined ||
      codePoint <= 0x1f ||
      (codePoint >= 0x7f && codePoint <= 0x9f) ||
      codePoint === 0xfeff
    ) {
      return true;
    }
  }

  return false;
}

function hasPercentEscape(value: string): boolean {
  return /%[0-9a-f]{2}/iu.test(value);
}

export function hasEncodedPathHazard(value: string): boolean {
  let candidate = value;

  for (
    let remainingLayers = value.length;
    remainingLayers > 0;
    remainingLayers -= 1
  ) {
    if (!hasPercentEscape(candidate)) {
      return false;
    }

    if (/%(?:2f|5c)/iu.test(candidate)) {
      return true;
    }

    let decoded: string;
    try {
      decoded = decodeURIComponent(candidate);
    } catch {
      return true;
    }

    if (
      decoded === "." ||
      decoded === ".." ||
      decoded.includes("/") ||
      decoded.includes("\\") ||
      !isWellFormedUnicode(decoded) ||
      hasForbiddenCodePoint(decoded)
    ) {
      return true;
    }

    if (decoded === candidate) {
      return false;
    }

    candidate = decoded;
  }

  return true;
}

function utf8ByteLength(value: string): number {
  return utf8Encoder.encode(value).byteLength;
}

function validateArchiveEntryPath(
  input: string,
  kind: ArchiveEntryKind,
  encodedByteLength: number,
): string {
  if (kind !== "directory" && kind !== "file") {
    return unsafeEntry();
  }

  if (encodedByteLength > MAX_ARCHIVE_PATH_BYTES) {
    return resourceLimitExceeded();
  }

  if (!isWellFormedUnicode(input) || hasForbiddenCodePoint(input)) {
    return unsafeEntry();
  }

  const isDirectory = kind === "directory";
  if (isDirectory !== input.endsWith("/")) {
    return unsafeEntry();
  }

  const canonicalPath = isDirectory ? input.slice(0, -1) : input;

  if (
    canonicalPath.length === 0 ||
    canonicalPath.startsWith("/") ||
    canonicalPath.startsWith("\\") ||
    /^[a-z]:/iu.test(canonicalPath) ||
    canonicalPath.includes("\\")
  ) {
    return unsafeEntry();
  }

  const components = canonicalPath.split("/");
  if (components.length > MAX_ARCHIVE_PATH_COMPONENTS) {
    return resourceLimitExceeded();
  }

  for (const component of components) {
    if (
      component.length === 0 ||
      component === "." ||
      component === ".." ||
      hasEncodedPathHazard(component)
    ) {
      return unsafeEntry();
    }

    if (utf8ByteLength(component) > MAX_ARCHIVE_PATH_COMPONENT_BYTES) {
      return resourceLimitExceeded();
    }
  }

  return canonicalPath;
}

export function parseArchiveEntryPath(
  input: string,
  kind: "file",
): ArchiveFilePath;
export function parseArchiveEntryPath(
  input: string,
  kind: "directory",
): ArchiveDirectoryPath;
export function parseArchiveEntryPath(
  input: string,
  kind: ArchiveEntryKind,
): ArchiveEntryPath;
export function parseArchiveEntryPath(
  input: string,
  kind: ArchiveEntryKind,
): ArchiveEntryPath {
  const canonicalPath = validateArchiveEntryPath(
    input,
    kind,
    utf8ByteLength(input),
  );

  return canonicalPath as ArchiveEntryPath;
}

export function decodeArchiveEntryPath(
  input: Uint8Array,
  kind: "file",
): ArchiveFilePath;
export function decodeArchiveEntryPath(
  input: Uint8Array,
  kind: "directory",
): ArchiveDirectoryPath;
export function decodeArchiveEntryPath(
  input: Uint8Array,
  kind: ArchiveEntryKind,
): ArchiveEntryPath;
export function decodeArchiveEntryPath(
  input: Uint8Array,
  kind: ArchiveEntryKind,
): ArchiveEntryPath {
  if (input.byteLength > MAX_ARCHIVE_PATH_BYTES) {
    return resourceLimitExceeded();
  }

  let decoded: string;
  try {
    decoded = utf8Decoder.decode(input);
  } catch {
    return unsafeEntry();
  }

  return validateArchiveEntryPath(
    decoded,
    kind,
    input.byteLength,
  ) as ArchiveEntryPath;
}

function caseFoldPath(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleUpperCase("und")
    .toLocaleLowerCase("und")
    .normalize("NFC");
}

export function assertNoArchivePathCollisions(
  paths: Iterable<ArchiveEntryPath>,
): void {
  const exactPaths = new Set<string>();
  const normalizedPaths = new Set<string>();
  const caseFoldedPaths = new Set<string>();

  for (const path of paths) {
    const exactPath = String(path);
    const normalizedPath = exactPath.normalize("NFC");
    const caseFoldedPath = caseFoldPath(normalizedPath);

    if (
      exactPaths.has(exactPath) ||
      normalizedPaths.has(normalizedPath) ||
      caseFoldedPaths.has(caseFoldedPath)
    ) {
      return unsafeEntry();
    }

    exactPaths.add(exactPath);
    normalizedPaths.add(normalizedPath);
    caseFoldedPaths.add(caseFoldedPath);
  }
}
