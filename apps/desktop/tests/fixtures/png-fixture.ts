// Repository-authored solid-color 3x2 PNG; no publisher or camera data.

const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAMAAAACCAIAAAASFvFNAAAAEElEQVR4nGPQSJkGQQxwFgBBeAbNREcqtQAAAABJRU5ErkJggg==";

export function pngExifChunk(
  orientation: number,
  littleEndian = true,
): Uint8Array {
  const tiff = new Uint8Array(26);
  const view = new DataView(tiff.buffer);
  view.setUint16(0, littleEndian ? 0x4949 : 0x4d4d);
  view.setUint16(2, 42, littleEndian);
  view.setUint32(4, 8, littleEndian);
  view.setUint16(8, 1, littleEndian);
  view.setUint16(10, 0x0112, littleEndian);
  view.setUint16(12, 3, littleEndian);
  view.setUint32(14, 1, littleEndian);
  view.setUint16(18, orientation, littleEndian);
  return pngExifChunkFromTiff(tiff);
}

export function pngExifChunkFromTiff(tiff: Uint8Array): Uint8Array {
  const chunk = new Uint8Array(12 + tiff.length);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, tiff.length);
  chunk.set([101, 88, 73, 102], 4);
  chunk.set(tiff, 8);
  let crc = 0xffffffff;
  for (const byte of chunk.subarray(4, -4)) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1)
      crc = (crc >>> 1) ^ ((crc & 1) === 0 ? 0 : 0xedb88320);
  }
  view.setUint32(chunk.length - 4, (crc ^ 0xffffffff) >>> 0);
  return chunk;
}

export function syntheticPngBytes(exif?: Uint8Array): Uint8Array {
  const bytes = Uint8Array.from(atob(PNG_BASE64), (character) =>
    character.charCodeAt(0),
  );
  return exif === undefined
    ? bytes
    : new Uint8Array([
        ...bytes.subarray(0, 33),
        ...exif,
        ...bytes.subarray(33),
      ]);
}
