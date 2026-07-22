import { EpubArchiveError } from "../archive/archive-error.js";
import type { RasterImageMediaType } from "../document/document-model.js";

const GIF_87A = Object.freeze([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]);
const GIF_89A = Object.freeze([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
const JPEG = Object.freeze([0xff, 0xd8, 0xff]);
const PNG = Object.freeze([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const RIFF = Object.freeze([0x52, 0x49, 0x46, 0x46]);
const WEBP = Object.freeze([0x57, 0x45, 0x42, 0x50]);

function hasBytesAt(
  bytes: Uint8Array,
  expected: readonly number[],
  offset = 0,
): boolean {
  if (bytes.byteLength - offset < expected.length) {
    return false;
  }

  return expected.every((value, index) => bytes[offset + index] === value);
}

function hasExpectedSignature(
  bytes: Uint8Array,
  mediaType: RasterImageMediaType,
): boolean {
  switch (mediaType) {
    case "image/gif":
      return hasBytesAt(bytes, GIF_87A) || hasBytesAt(bytes, GIF_89A);
    case "image/jpeg":
      return hasBytesAt(bytes, JPEG);
    case "image/png":
      return hasBytesAt(bytes, PNG);
    case "image/webp":
      return hasBytesAt(bytes, RIFF) && hasBytesAt(bytes, WEBP, 8);
  }
}

export function assertRasterImageSignature(
  bytes: Uint8Array,
  mediaType: RasterImageMediaType,
): void {
  if (!hasExpectedSignature(bytes, mediaType)) {
    throw new EpubArchiveError("malformed-package");
  }
}
