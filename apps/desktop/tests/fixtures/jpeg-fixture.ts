// Repository-authored solid-color 3x2 JPEG, encoded with Windows System.Drawing.
// No publisher content, camera metadata or external image source is included.
const JPEG_BASE64 =
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAACAAMDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDkqKKK/oU/nc//2Q==";

export function jpegExifSegment(
  orientation: number,
  littleEndian = true,
): Uint8Array {
  const segment = new Uint8Array(36);
  segment.set([0xff, 0xe1, 0, 34, 69, 120, 105, 102, 0, 0]);
  const tiff = new DataView(segment.buffer, 10);
  tiff.setUint16(0, littleEndian ? 0x4949 : 0x4d4d);
  tiff.setUint16(2, 42, littleEndian);
  tiff.setUint32(4, 8, littleEndian);
  tiff.setUint16(8, 1, littleEndian);
  tiff.setUint16(10, 0x0112, littleEndian);
  tiff.setUint16(12, 3, littleEndian);
  tiff.setUint32(14, 1, littleEndian);
  tiff.setUint16(18, orientation, littleEndian);
  return segment;
}

export function syntheticJpegBytes(exif?: Uint8Array): Uint8Array {
  const bytes = Uint8Array.from(atob(JPEG_BASE64), (character) =>
    character.charCodeAt(0),
  );
  return exif === undefined
    ? bytes
    : new Uint8Array([...bytes.subarray(0, 2), ...exif, ...bytes.subarray(2)]);
}

// Physical 3x2 pixels, with EXIF's recognized 108/144 DPI -> 2x1 size.
export function jpegDensityExifSegment(
  orientation = 1,
  littleEndian = true,
): Uint8Array {
  const segment = new Uint8Array(140);
  segment.set([0xff, 0xe1, 0, 138, 69, 120, 105, 102, 0, 0]);
  const tiff = new DataView(segment.buffer, 10);
  tiff.setUint16(0, littleEndian ? 0x4949 : 0x4d4d);
  tiff.setUint16(2, 42, littleEndian);
  tiff.setUint32(4, 8, littleEndian);
  const entry = (offset: number, tag: number, type: number, value: number) => {
    tiff.setUint16(offset, tag, littleEndian);
    tiff.setUint16(offset + 2, type, littleEndian);
    tiff.setUint32(offset + 4, 1, littleEndian);
    if (type === 3) tiff.setUint16(offset + 8, value, littleEndian);
    else tiff.setUint32(offset + 8, value, littleEndian);
  };
  tiff.setUint16(8, 5, littleEndian);
  entry(10, 0x0112, 3, orientation);
  entry(22, 0x011a, 5, 74);
  entry(34, 0x011b, 5, 82);
  entry(46, 0x0128, 3, 2);
  entry(58, 0x8769, 4, 90);
  tiff.setUint32(74, 108, littleEndian);
  tiff.setUint32(78, 1, littleEndian);
  tiff.setUint32(82, 144, littleEndian);
  tiff.setUint32(86, 1, littleEndian);
  tiff.setUint16(90, 2, littleEndian);
  entry(92, 0xa002, 4, 2);
  entry(104, 0xa003, 4, 1);
  return segment;
}
