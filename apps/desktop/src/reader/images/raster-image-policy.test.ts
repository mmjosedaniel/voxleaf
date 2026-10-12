import { describe, expect, it } from "vitest";

import {
  createRasterImageSafetyPolicy,
  DEFAULT_RASTER_IMAGE_SAFETY_POLICY,
  inspectRasterImageMetadata,
  type RasterImageMediaType,
} from "./raster-image-policy";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function ascii(value: string): number[] {
  return [...value].map((character) => character.charCodeAt(0));
}

function uint16BigEndian(value: number): number[] {
  return [(value >>> 8) & 0xff, value & 0xff];
}

function uint16LittleEndian(value: number): number[] {
  return [value & 0xff, (value >>> 8) & 0xff];
}

function uint24LittleEndian(value: number): number[] {
  return [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff];
}

function uint32BigEndian(value: number): number[] {
  return [
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ];
}

function uint32LittleEndian(value: number): number[] {
  return [
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  ];
}

function pngChunk(type: string, data: readonly number[]): number[] {
  return [...uint32BigEndian(data.length), ...ascii(type), ...data, 0, 0, 0, 0];
}

function createPng(
  widthPixels: number,
  heightPixels: number,
  animationFrames?: number,
): Uint8Array {
  return new Uint8Array([
    ...PNG_SIGNATURE,
    ...pngChunk("IHDR", [
      ...uint32BigEndian(widthPixels),
      ...uint32BigEndian(heightPixels),
      8,
      6,
      0,
      0,
      0,
    ]),
    ...(animationFrames === undefined
      ? []
      : pngChunk("acTL", [...uint32BigEndian(animationFrames), 0, 0, 0, 0])),
    ...pngChunk("IEND", []),
  ]);
}

function createGif(
  widthPixels: number,
  heightPixels: number,
  frameCount: number,
): Uint8Array {
  const frame = [
    0x2c,
    0,
    0,
    0,
    0,
    ...uint16LittleEndian(widthPixels),
    ...uint16LittleEndian(heightPixels),
    0,
    2,
    1,
    0,
    0,
  ];
  return new Uint8Array([
    ...ascii("GIF89a"),
    ...uint16LittleEndian(widthPixels),
    ...uint16LittleEndian(heightPixels),
    0,
    0,
    0,
    ...Array.from({ length: frameCount }, () => frame).flat(),
    0x3b,
  ]);
}

function createJpeg(widthPixels: number, heightPixels: number): Uint8Array {
  return new Uint8Array([
    0xff,
    0xd8,
    0xff,
    0xc0,
    0,
    8,
    8,
    ...uint16BigEndian(heightPixels),
    ...uint16BigEndian(widthPixels),
    1,
    0xff,
    0xda,
    0,
    2,
  ]);
}

function createJpegWithDuplicateFrame(
  widthPixels: number,
  heightPixels: number,
): Uint8Array {
  const jpeg = createJpeg(widthPixels, heightPixels);
  return new Uint8Array([
    ...jpeg.slice(0, -4),
    ...jpeg.slice(2, -4),
    ...jpeg.slice(-4),
  ]);
}

function webpChunk(type: string, data: readonly number[]): number[] {
  return [
    ...ascii(type),
    ...uint32LittleEndian(data.length),
    ...data,
    ...(data.length % 2 === 0 ? [] : [0]),
  ];
}

function createWebp(widthPixels: number, heightPixels: number): Uint8Array {
  const dimensions = (widthPixels - 1) | ((heightPixels - 1) << 14);
  const chunk = webpChunk("VP8L", [
    0x2f,
    ...uint32LittleEndian(dimensions >>> 0),
  ]);
  return new Uint8Array([
    ...ascii("RIFF"),
    ...uint32LittleEndian(4 + chunk.length),
    ...ascii("WEBP"),
    ...chunk,
  ]);
}

function createAnimatedWebp(
  widthPixels: number,
  heightPixels: number,
  frameCount: number,
): Uint8Array {
  const extended = webpChunk("VP8X", [
    0x02,
    0,
    0,
    0,
    ...uint24LittleEndian(widthPixels - 1),
    ...uint24LittleEndian(heightPixels - 1),
  ]);
  const animation = webpChunk("ANIM", [0, 0, 0, 0, 0, 0]);
  const frames = Array.from({ length: frameCount }, () =>
    webpChunk("ANMF", new Array<number>(16).fill(0)),
  ).flat();
  const chunks = [...extended, ...animation, ...frames];
  return new Uint8Array([
    ...ascii("RIFF"),
    ...uint32LittleEndian(4 + chunks.length),
    ...ascii("WEBP"),
    ...chunks,
  ]);
}

describe("raster image predecode policy", () => {
  it("freezes exact production limits for dimensions, pixels, animation, and lifetime", () => {
    expect(DEFAULT_RASTER_IMAGE_SAFETY_POLICY).toEqual({
      maximumWidthPixels: 8_192,
      maximumHeightPixels: 8_192,
      maximumDecodedPixels: 16_777_216,
      maximumAnimationFrames: 1,
      maximumConcurrentDecodes: 1,
      maximumLiveSources: 8,
      maximumLiveDecodedPixels: 16_777_216,
    });
    expect(Object.isFrozen(DEFAULT_RASTER_IMAGE_SAFETY_POLICY)).toBe(true);
  });

  it.each<[RasterImageMediaType, Uint8Array]>([
    ["image/gif", createGif(3, 2, 1)],
    ["image/jpeg", createJpeg(3, 2)],
    ["image/png", createPng(3, 2)],
    ["image/webp", createWebp(3, 2)],
  ])("accepts bounded static %s metadata", (mediaType, bytes) => {
    const result = inspectRasterImageMetadata(bytes, mediaType);

    expect(result).toEqual({
      status: "accepted",
      metadata: {
        widthPixels: 3,
        heightPixels: 2,
        decodedPixels: 6,
        frameCount: 1,
      },
    });
    expect(Object.isFrozen(result)).toBe(true);
    if (result.status === "accepted") {
      expect(Object.isFrozen(result.metadata)).toBe(true);
    }
  });

  it("accepts exact dimension limits and rejects the first value above them", () => {
    const policy = createRasterImageSafetyPolicy({
      maximumWidthPixels: 4,
      maximumHeightPixels: 4,
      maximumDecodedPixels: 16,
      maximumLiveDecodedPixels: 16,
    });

    expect(
      inspectRasterImageMetadata(createPng(4, 4), "image/png", policy),
    ).toMatchObject({ status: "accepted" });
    expect(
      inspectRasterImageMetadata(createPng(5, 4), "image/png", policy),
    ).toEqual({ status: "rejected", reason: "dimensions-exceeded" });
    expect(
      inspectRasterImageMetadata(createPng(4, 5), "image/png", policy),
    ).toEqual({ status: "rejected", reason: "dimensions-exceeded" });
  });

  it("accepts the exact decoded-pixel maximum and rejects maximum plus one", () => {
    const policy = createRasterImageSafetyPolicy({
      maximumWidthPixels: 10,
      maximumHeightPixels: 10,
      maximumDecodedPixels: 4,
      maximumLiveDecodedPixels: 4,
    });

    expect(
      inspectRasterImageMetadata(createPng(2, 2), "image/png", policy),
    ).toMatchObject({ status: "accepted" });
    expect(
      inspectRasterImageMetadata(createPng(5, 1), "image/png", policy),
    ).toEqual({ status: "rejected", reason: "pixels-exceeded" });
  });

  it("accepts one static frame and rejects GIF, APNG, and WebP animation before decode", () => {
    expect(
      inspectRasterImageMetadata(createGif(2, 2, 1), "image/gif"),
    ).toMatchObject({ status: "accepted" });
    expect(inspectRasterImageMetadata(createGif(2, 2, 2), "image/gif")).toEqual(
      { status: "rejected", reason: "animation-unsupported" },
    );
    expect(inspectRasterImageMetadata(createPng(2, 2, 2), "image/png")).toEqual(
      { status: "rejected", reason: "animation-unsupported" },
    );
    expect(
      inspectRasterImageMetadata(createAnimatedWebp(2, 2, 2), "image/webp"),
    ).toEqual({ status: "rejected", reason: "animation-unsupported" });
  });

  it("rejects malformed, truncated, zero-sized, and media-type-mismatched candidates", () => {
    expect(inspectRasterImageMetadata(new Uint8Array(), "image/png")).toEqual({
      status: "rejected",
      reason: "invalid-image",
    });
    expect(inspectRasterImageMetadata(createPng(0, 2), "image/png")).toEqual({
      status: "rejected",
      reason: "invalid-image",
    });
    expect(
      inspectRasterImageMetadata(createPng(2, 2).slice(0, -1), "image/png"),
    ).toEqual({ status: "rejected", reason: "invalid-image" });
    expect(inspectRasterImageMetadata(createGif(2, 2, 1), "image/png")).toEqual(
      { status: "rejected", reason: "invalid-image" },
    );
    expect(
      inspectRasterImageMetadata(
        createJpegWithDuplicateFrame(2, 2),
        "image/jpeg",
      ),
    ).toEqual({ status: "rejected", reason: "invalid-image" });
  });

  it("permits only frozen equal-or-stricter policies", () => {
    expect(
      Object.isFrozen(createRasterImageSafetyPolicy({ maximumWidthPixels: 1 })),
    ).toBe(true);
    expect(() =>
      createRasterImageSafetyPolicy({ maximumWidthPixels: 8_193 }),
    ).toThrow("invalid-raster-image-safety-policy");
    expect(() =>
      createRasterImageSafetyPolicy({ maximumConcurrentDecodes: 0 }),
    ).toThrow("invalid-raster-image-safety-policy");
    expect(() =>
      createRasterImageSafetyPolicy({
        maximumDecodedPixels: 10,
        maximumLiveDecodedPixels: 9,
      }),
    ).toThrow("invalid-raster-image-safety-policy");
  });
});
