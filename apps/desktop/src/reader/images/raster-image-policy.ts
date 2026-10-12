export type RasterImageMediaType =
  "image/gif" | "image/jpeg" | "image/png" | "image/webp";

export interface RasterImageSafetyPolicy {
  readonly maximumWidthPixels: number;
  readonly maximumHeightPixels: number;
  readonly maximumDecodedPixels: number;
  readonly maximumAnimationFrames: number;
  readonly maximumConcurrentDecodes: number;
  readonly maximumLiveSources: number;
  readonly maximumLiveDecodedPixels: number;
}

export type RasterImageSafetyPolicyOverrides = Readonly<
  Partial<RasterImageSafetyPolicy>
>;

export const DEFAULT_RASTER_IMAGE_SAFETY_POLICY: RasterImageSafetyPolicy =
  Object.freeze({
    maximumWidthPixels: 8_192,
    maximumHeightPixels: 8_192,
    maximumDecodedPixels: 16_777_216,
    maximumAnimationFrames: 1,
    maximumConcurrentDecodes: 1,
    maximumLiveSources: 8,
    maximumLiveDecodedPixels: 16_777_216,
  });

export interface RasterImageMetadata {
  readonly widthPixels: number;
  readonly heightPixels: number;
  readonly decodedPixels: number;
  readonly frameCount: number;
}

export type RasterImageMetadataRejectionReason =
  | "animation-unsupported"
  | "dimensions-exceeded"
  | "invalid-image"
  | "pixels-exceeded";

export type RasterImageMetadataResult =
  | Readonly<{
      status: "accepted";
      metadata: RasterImageMetadata;
    }>
  | Readonly<{
      status: "rejected";
      reason: RasterImageMetadataRejectionReason;
    }>;

interface ParsedRasterImageMetadata {
  readonly widthPixels: number;
  readonly heightPixels: number;
  readonly frameCount: number;
  readonly animated: boolean;
}

const GIF_87A = Object.freeze([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]);
const GIF_89A = Object.freeze([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
const JPEG = Object.freeze([0xff, 0xd8]);
const PNG = Object.freeze([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const RIFF = Object.freeze([0x52, 0x49, 0x46, 0x46]);
const WEBP = Object.freeze([0x57, 0x45, 0x42, 0x50]);

function rejected(
  reason: RasterImageMetadataRejectionReason,
): RasterImageMetadataResult {
  return Object.freeze({ status: "rejected", reason });
}

function hasBytesAt(
  bytes: Uint8Array,
  expected: readonly number[],
  offset = 0,
): boolean {
  if (offset < 0 || bytes.byteLength - offset < expected.length) {
    return false;
  }
  return expected.every((value, index) => bytes[offset + index] === value);
}

function hasAsciiAt(
  bytes: Uint8Array,
  expected: string,
  offset: number,
): boolean {
  if (offset < 0 || bytes.byteLength - offset < expected.length) {
    return false;
  }
  for (let index = 0; index < expected.length; index += 1) {
    if (bytes[offset + index] !== expected.charCodeAt(index)) {
      return false;
    }
  }
  return true;
}

function readUint16BigEndian(bytes: Uint8Array, offset: number): number {
  if (offset < 0 || bytes.byteLength - offset < 2) {
    return -1;
  }
  return (bytes[offset] ?? 0) * 0x100 + (bytes[offset + 1] ?? 0);
}

function readUint16LittleEndian(bytes: Uint8Array, offset: number): number {
  if (offset < 0 || bytes.byteLength - offset < 2) {
    return -1;
  }
  return (bytes[offset] ?? 0) + (bytes[offset + 1] ?? 0) * 0x100;
}

function readUint24LittleEndian(bytes: Uint8Array, offset: number): number {
  if (offset < 0 || bytes.byteLength - offset < 3) {
    return -1;
  }
  return (
    (bytes[offset] ?? 0) +
    (bytes[offset + 1] ?? 0) * 0x100 +
    (bytes[offset + 2] ?? 0) * 0x1_0000
  );
}

function readUint32BigEndian(bytes: Uint8Array, offset: number): number {
  if (offset < 0 || bytes.byteLength - offset < 4) {
    return -1;
  }
  return (
    (bytes[offset] ?? 0) * 0x1_000000 +
    (bytes[offset + 1] ?? 0) * 0x1_0000 +
    (bytes[offset + 2] ?? 0) * 0x100 +
    (bytes[offset + 3] ?? 0)
  );
}

function readUint32LittleEndian(bytes: Uint8Array, offset: number): number {
  if (offset < 0 || bytes.byteLength - offset < 4) {
    return -1;
  }
  return (
    (bytes[offset] ?? 0) +
    (bytes[offset + 1] ?? 0) * 0x100 +
    (bytes[offset + 2] ?? 0) * 0x1_0000 +
    (bytes[offset + 3] ?? 0) * 0x1_000000
  );
}

function checkedEnd(
  offset: number,
  length: number,
  byteLength: number,
): number | undefined {
  if (
    !Number.isSafeInteger(offset) ||
    !Number.isSafeInteger(length) ||
    offset < 0 ||
    length < 0 ||
    offset > byteLength ||
    length > byteLength - offset
  ) {
    return undefined;
  }
  return offset + length;
}

function parsePng(bytes: Uint8Array): ParsedRasterImageMetadata | undefined {
  if (!hasBytesAt(bytes, PNG)) {
    return undefined;
  }

  let offset = PNG.length;
  let widthPixels: number | undefined;
  let heightPixels: number | undefined;
  let frameCount = 1;
  let animated = false;
  let sawHeader = false;
  let sawEnd = false;

  while (offset < bytes.byteLength) {
    const dataOffset = checkedEnd(offset, 8, bytes.byteLength);
    if (dataOffset === undefined) {
      return undefined;
    }
    const chunkLength = readUint32BigEndian(bytes, offset);
    const dataEnd = checkedEnd(dataOffset, chunkLength, bytes.byteLength);
    const chunkEnd =
      dataEnd === undefined
        ? undefined
        : checkedEnd(dataEnd, 4, bytes.byteLength);
    if (dataEnd === undefined || chunkEnd === undefined) {
      return undefined;
    }

    if (hasAsciiAt(bytes, "IHDR", offset + 4)) {
      if (sawHeader || offset !== PNG.length || chunkLength !== 13) {
        return undefined;
      }
      widthPixels = readUint32BigEndian(bytes, dataOffset);
      heightPixels = readUint32BigEndian(bytes, dataOffset + 4);
      sawHeader = true;
    } else if (hasAsciiAt(bytes, "acTL", offset + 4)) {
      if (!sawHeader || animated || chunkLength !== 8) {
        return undefined;
      }
      frameCount = readUint32BigEndian(bytes, dataOffset);
      animated = true;
    } else if (hasAsciiAt(bytes, "IEND", offset + 4)) {
      if (!sawHeader || chunkLength !== 0 || chunkEnd !== bytes.byteLength) {
        return undefined;
      }
      sawEnd = true;
    }

    offset = chunkEnd;
  }

  if (
    !sawEnd ||
    widthPixels === undefined ||
    heightPixels === undefined ||
    widthPixels <= 0 ||
    heightPixels <= 0 ||
    frameCount <= 0
  ) {
    return undefined;
  }
  return { widthPixels, heightPixels, frameCount, animated };
}

function skipGifSubBlocks(
  bytes: Uint8Array,
  startOffset: number,
): number | undefined {
  let offset = startOffset;
  while (offset < bytes.byteLength) {
    const blockLength = bytes[offset];
    if (blockLength === undefined) {
      return undefined;
    }
    offset += 1;
    if (blockLength === 0) {
      return offset;
    }
    const blockEnd = checkedEnd(offset, blockLength, bytes.byteLength);
    if (blockEnd === undefined) {
      return undefined;
    }
    offset = blockEnd;
  }
  return undefined;
}

function gifColorTableLength(packed: number): number {
  return (packed & 0x80) === 0 ? 0 : 3 * 2 ** ((packed & 0x07) + 1);
}

function parseGif(bytes: Uint8Array): ParsedRasterImageMetadata | undefined {
  if (
    bytes.byteLength < 14 ||
    (!hasBytesAt(bytes, GIF_87A) && !hasBytesAt(bytes, GIF_89A))
  ) {
    return undefined;
  }

  const widthPixels = readUint16LittleEndian(bytes, 6);
  const heightPixels = readUint16LittleEndian(bytes, 8);
  const packed = bytes[10];
  if (widthPixels <= 0 || heightPixels <= 0 || packed === undefined) {
    return undefined;
  }

  const firstBlock = checkedEnd(13, gifColorTableLength(packed), bytes.length);
  if (firstBlock === undefined) {
    return undefined;
  }

  let offset = firstBlock;
  let frameCount = 0;
  let sawTrailer = false;
  while (offset < bytes.byteLength) {
    const marker = bytes[offset];
    offset += 1;
    if (marker === 0x3b) {
      sawTrailer = offset === bytes.byteLength;
      break;
    }
    if (marker === 0x21) {
      if (offset >= bytes.byteLength) {
        return undefined;
      }
      offset += 1;
      const extensionEnd = skipGifSubBlocks(bytes, offset);
      if (extensionEnd === undefined) {
        return undefined;
      }
      offset = extensionEnd;
      continue;
    }
    if (marker !== 0x2c) {
      return undefined;
    }

    const descriptorEnd = checkedEnd(offset, 9, bytes.byteLength);
    if (descriptorEnd === undefined) {
      return undefined;
    }
    const left = readUint16LittleEndian(bytes, offset);
    const top = readUint16LittleEndian(bytes, offset + 2);
    const frameWidth = readUint16LittleEndian(bytes, offset + 4);
    const frameHeight = readUint16LittleEndian(bytes, offset + 6);
    const descriptorPacked = bytes[offset + 8];
    if (
      left < 0 ||
      top < 0 ||
      frameWidth <= 0 ||
      frameHeight <= 0 ||
      descriptorPacked === undefined ||
      left + frameWidth > widthPixels ||
      top + frameHeight > heightPixels
    ) {
      return undefined;
    }

    const colorTableEnd = checkedEnd(
      descriptorEnd,
      gifColorTableLength(descriptorPacked),
      bytes.byteLength,
    );
    if (colorTableEnd === undefined || colorTableEnd >= bytes.byteLength) {
      return undefined;
    }
    offset = colorTableEnd + 1;
    const imageDataEnd = skipGifSubBlocks(bytes, offset);
    if (imageDataEnd === undefined) {
      return undefined;
    }
    offset = imageDataEnd;
    frameCount += 1;
  }

  if (!sawTrailer || frameCount <= 0) {
    return undefined;
  }
  return {
    widthPixels,
    heightPixels,
    frameCount,
    animated: frameCount > 1,
  };
}

const JPEG_START_OF_FRAME_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

function isStandaloneJpegMarker(marker: number): boolean {
  return (
    marker === 0x01 || marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd9)
  );
}

function parseJpeg(bytes: Uint8Array): ParsedRasterImageMetadata | undefined {
  if (!hasBytesAt(bytes, JPEG)) {
    return undefined;
  }

  let offset = JPEG.length;
  let dimensions: readonly [number, number] | undefined;
  while (offset < bytes.byteLength) {
    if (bytes[offset] !== 0xff) {
      return undefined;
    }
    while (bytes[offset] === 0xff) {
      offset += 1;
    }
    const marker = bytes[offset];
    if (marker === undefined || marker === 0x00) {
      return undefined;
    }
    offset += 1;

    if (isStandaloneJpegMarker(marker)) {
      if (marker === 0xd9) {
        return undefined;
      }
      continue;
    }
    const segmentLength = readUint16BigEndian(bytes, offset);
    if (segmentLength < 2) {
      return undefined;
    }
    const segmentEnd = checkedEnd(offset, segmentLength, bytes.byteLength);
    if (segmentEnd === undefined) {
      return undefined;
    }

    if (JPEG_START_OF_FRAME_MARKERS.has(marker)) {
      if (dimensions !== undefined || segmentLength < 8) {
        return undefined;
      }
      const heightPixels = readUint16BigEndian(bytes, offset + 3);
      const widthPixels = readUint16BigEndian(bytes, offset + 5);
      if (widthPixels <= 0 || heightPixels <= 0) {
        return undefined;
      }
      dimensions = [widthPixels, heightPixels];
    }
    if (marker === 0xda) {
      return dimensions === undefined
        ? undefined
        : {
            widthPixels: dimensions[0],
            heightPixels: dimensions[1],
            frameCount: 1,
            animated: false,
          };
    }
    offset = segmentEnd;
  }
  return undefined;
}

function parseVp8Dimensions(
  bytes: Uint8Array,
  offset: number,
  length: number,
): readonly [number, number] | undefined {
  if (length < 10 || !hasBytesAt(bytes, [0x9d, 0x01, 0x2a], offset + 3)) {
    return undefined;
  }
  const widthPixels = readUint16LittleEndian(bytes, offset + 6) & 0x3fff;
  const heightPixels = readUint16LittleEndian(bytes, offset + 8) & 0x3fff;
  return widthPixels > 0 && heightPixels > 0
    ? [widthPixels, heightPixels]
    : undefined;
}

function parseVp8lDimensions(
  bytes: Uint8Array,
  offset: number,
  length: number,
): readonly [number, number] | undefined {
  if (length < 5 || bytes[offset] !== 0x2f) {
    return undefined;
  }
  const bits = readUint32LittleEndian(bytes, offset + 1);
  if (bits < 0) {
    return undefined;
  }
  return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
}

function parseWebp(bytes: Uint8Array): ParsedRasterImageMetadata | undefined {
  if (
    bytes.byteLength < 20 ||
    !hasBytesAt(bytes, RIFF) ||
    !hasBytesAt(bytes, WEBP, 8) ||
    readUint32LittleEndian(bytes, 4) !== bytes.byteLength - 8
  ) {
    return undefined;
  }

  let offset = 12;
  let canvasDimensions: readonly [number, number] | undefined;
  let payloadDimensions: readonly [number, number] | undefined;
  let animated = false;
  let animationFrames = 0;

  while (offset < bytes.byteLength) {
    const dataOffset = checkedEnd(offset, 8, bytes.byteLength);
    if (dataOffset === undefined) {
      return undefined;
    }
    const chunkLength = readUint32LittleEndian(bytes, offset + 4);
    const dataEnd = checkedEnd(dataOffset, chunkLength, bytes.byteLength);
    const paddedLength = chunkLength + (chunkLength % 2);
    const chunkEnd = checkedEnd(dataOffset, paddedLength, bytes.byteLength);
    if (dataEnd === undefined || chunkEnd === undefined) {
      return undefined;
    }

    if (hasAsciiAt(bytes, "VP8X", offset)) {
      if (canvasDimensions !== undefined || chunkLength !== 10) {
        return undefined;
      }
      const flags = bytes[dataOffset];
      const widthMinusOne = readUint24LittleEndian(bytes, dataOffset + 4);
      const heightMinusOne = readUint24LittleEndian(bytes, dataOffset + 7);
      if (flags === undefined || widthMinusOne < 0 || heightMinusOne < 0) {
        return undefined;
      }
      canvasDimensions = [widthMinusOne + 1, heightMinusOne + 1];
      animated = (flags & 0x02) !== 0;
    } else if (hasAsciiAt(bytes, "VP8 ", offset)) {
      if (payloadDimensions !== undefined) {
        return undefined;
      }
      payloadDimensions = parseVp8Dimensions(bytes, dataOffset, chunkLength);
      if (payloadDimensions === undefined) {
        return undefined;
      }
    } else if (hasAsciiAt(bytes, "VP8L", offset)) {
      if (payloadDimensions !== undefined) {
        return undefined;
      }
      payloadDimensions = parseVp8lDimensions(bytes, dataOffset, chunkLength);
      if (payloadDimensions === undefined) {
        return undefined;
      }
    } else if (hasAsciiAt(bytes, "ANIM", offset)) {
      animated = true;
    } else if (hasAsciiAt(bytes, "ANMF", offset)) {
      animated = true;
      animationFrames += 1;
    }
    offset = chunkEnd;
  }

  if (offset !== bytes.byteLength) {
    return undefined;
  }
  if (animated) {
    if (canvasDimensions === undefined || animationFrames <= 0) {
      return undefined;
    }
    return {
      widthPixels: canvasDimensions[0],
      heightPixels: canvasDimensions[1],
      frameCount: animationFrames,
      animated: true,
    };
  }
  if (payloadDimensions === undefined) {
    return undefined;
  }
  if (
    canvasDimensions !== undefined &&
    (canvasDimensions[0] !== payloadDimensions[0] ||
      canvasDimensions[1] !== payloadDimensions[1])
  ) {
    return undefined;
  }
  return {
    widthPixels: payloadDimensions[0],
    heightPixels: payloadDimensions[1],
    frameCount: 1,
    animated: false,
  };
}

function parseMetadata(
  bytes: Uint8Array,
  mediaType: RasterImageMediaType,
): ParsedRasterImageMetadata | undefined {
  switch (mediaType) {
    case "image/gif":
      return parseGif(bytes);
    case "image/jpeg":
      return parseJpeg(bytes);
    case "image/png":
      return parsePng(bytes);
    case "image/webp":
      return parseWebp(bytes);
  }
}

export function createRasterImageSafetyPolicy(
  overrides: RasterImageSafetyPolicyOverrides = {},
): RasterImageSafetyPolicy {
  const knownKeys = new Set(Object.keys(DEFAULT_RASTER_IMAGE_SAFETY_POLICY));
  for (const key of Object.keys(overrides)) {
    if (!knownKeys.has(key)) {
      throw new Error("invalid-raster-image-safety-policy");
    }
  }

  const policy = { ...DEFAULT_RASTER_IMAGE_SAFETY_POLICY, ...overrides };
  for (const key of Object.keys(
    DEFAULT_RASTER_IMAGE_SAFETY_POLICY,
  ) as (keyof RasterImageSafetyPolicy)[]) {
    const value = policy[key];
    if (
      !Number.isSafeInteger(value) ||
      value < 1 ||
      value > DEFAULT_RASTER_IMAGE_SAFETY_POLICY[key]
    ) {
      throw new Error("invalid-raster-image-safety-policy");
    }
  }
  if (policy.maximumLiveDecodedPixels < policy.maximumDecodedPixels) {
    throw new Error("invalid-raster-image-safety-policy");
  }
  return Object.freeze(policy);
}

export function inspectRasterImageMetadata(
  bytes: Uint8Array,
  mediaType: RasterImageMediaType,
  policy: RasterImageSafetyPolicy = DEFAULT_RASTER_IMAGE_SAFETY_POLICY,
): RasterImageMetadataResult {
  const normalizedPolicy = createRasterImageSafetyPolicy(policy);
  const parsed = parseMetadata(bytes, mediaType);
  if (parsed === undefined) {
    return rejected("invalid-image");
  }
  if (
    parsed.widthPixels > normalizedPolicy.maximumWidthPixels ||
    parsed.heightPixels > normalizedPolicy.maximumHeightPixels
  ) {
    return rejected("dimensions-exceeded");
  }

  const decodedPixels = parsed.widthPixels * parsed.heightPixels;
  if (
    !Number.isSafeInteger(decodedPixels) ||
    decodedPixels > normalizedPolicy.maximumDecodedPixels
  ) {
    return rejected("pixels-exceeded");
  }
  if (
    parsed.animated ||
    parsed.frameCount > normalizedPolicy.maximumAnimationFrames
  ) {
    return rejected("animation-unsupported");
  }

  return Object.freeze({
    status: "accepted",
    metadata: Object.freeze({
      widthPixels: parsed.widthPixels,
      heightPixels: parsed.heightPixels,
      decodedPixels,
      frameCount: parsed.frameCount,
    }),
  });
}
