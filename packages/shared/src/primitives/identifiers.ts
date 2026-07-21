const MAX_IDENTIFIER_CODE_POINTS = 128;

declare const identifierBrand: unique symbol;

type Identifier<TName extends string> = string & {
  readonly [identifierBrand]: TName;
};

export type BookId = Identifier<"BookId">;
export type SpineItemId = Identifier<"SpineItemId">;
export type SessionId = Identifier<"SessionId">;
export type GenerationId = Identifier<"GenerationId">;
export type SegmentId = Identifier<"SegmentId">;
export type FrameId = Identifier<"FrameId">;

function createIdentifier<TIdentifier extends string>(
  value: unknown,
  identifierName: string,
): TIdentifier {
  if (typeof value !== "string") {
    throw new TypeError(`${identifierName} must be a string.`);
  }

  const codePointLength = Array.from(value).length;
  const containsControlCharacter = Array.from(value).some((character) => {
    const codePoint = character.codePointAt(0);

    return codePoint !== undefined && (codePoint <= 0x1f || codePoint === 0x7f);
  });

  if (
    codePointLength === 0 ||
    codePointLength > MAX_IDENTIFIER_CODE_POINTS ||
    value.trim() !== value ||
    containsControlCharacter
  ) {
    throw new RangeError(`${identifierName} is not a valid opaque identifier.`);
  }

  return value as TIdentifier;
}

export function createBookId(value: unknown): BookId {
  return createIdentifier<BookId>(value, "BookId");
}

export function createSpineItemId(value: unknown): SpineItemId {
  return createIdentifier<SpineItemId>(value, "SpineItemId");
}

export function createSessionId(value: unknown): SessionId {
  return createIdentifier<SessionId>(value, "SessionId");
}

export function createGenerationId(value: unknown): GenerationId {
  return createIdentifier<GenerationId>(value, "GenerationId");
}

export function createSegmentId(value: unknown): SegmentId {
  return createIdentifier<SegmentId>(value, "SegmentId");
}

export function createFrameId(value: unknown): FrameId {
  return createIdentifier<FrameId>(value, "FrameId");
}
