function littleEndian32(value: number): number[] {
  return [
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    value >>> 24,
  ];
}

function ascii(value: string): number[] {
  return Array.from(value, (character) => character.charCodeAt(0));
}

function chunk(type: string, data: number[]): number[] {
  return [
    ...ascii(type),
    ...littleEndian32(data.length),
    ...data,
    ...(data.length % 2 === 0 ? [] : [0]),
  ];
}

export function syntheticEarlyAnimatedWebp(
  marker: "ANIM" | "ANMF",
  flags = 0,
): Uint8Array {
  const chunks = [
    ...chunk(marker, Array<number>(marker === "ANIM" ? 6 : 16).fill(0)),
    ...chunk("VP8X", [flags, 0, 0, 0, 1, 0, 0, 1, 0, 0]),
    ...chunk("VP8L", [0x2f, 1, 0x40, 0, 0]),
  ];
  return new Uint8Array([
    ...ascii("RIFF"),
    ...littleEndian32(chunks.length + 4),
    ...ascii("WEBP"),
    ...chunks,
  ]);
}
