declare const numericUnitBrand: unique symbol;

type NumericUnit<TName extends string> = number & {
  readonly [numericUnitBrand]: TName;
};

export type Count = NumericUnit<"Count">;
export type Index = NumericUnit<"Index">;
export type Milliseconds = NumericUnit<"Milliseconds">;
export type SampleCount = NumericUnit<"SampleCount">;
export type Hertz = NumericUnit<"Hertz">;
export type ByteCount = NumericUnit<"ByteCount">;
export type Progression = NumericUnit<"Progression">;

function assertNonNegativeSafeInteger(
  value: unknown,
  unitName: string,
): asserts value is number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    !Number.isSafeInteger(value) ||
    value < 0 ||
    Object.is(value, -0)
  ) {
    throw new RangeError(
      `${unitName} must be a non-negative JSON safe integer.`,
    );
  }
}

function createNonNegativeIntegerUnit<TUnit extends number>(
  value: unknown,
  unitName: string,
): TUnit {
  assertNonNegativeSafeInteger(value, unitName);
  return value as TUnit;
}

export function createCount(value: unknown): Count {
  return createNonNegativeIntegerUnit<Count>(value, "Count");
}

export function createIndex(value: unknown): Index {
  return createNonNegativeIntegerUnit<Index>(value, "Index");
}

export function createMilliseconds(value: unknown): Milliseconds {
  return createNonNegativeIntegerUnit<Milliseconds>(value, "Milliseconds");
}

export function createSampleCount(value: unknown): SampleCount {
  return createNonNegativeIntegerUnit<SampleCount>(value, "SampleCount");
}

export function createHertz(value: unknown): Hertz {
  assertNonNegativeSafeInteger(value, "Hertz");

  if (value === 0) {
    throw new RangeError("Hertz must be greater than zero.");
  }

  return value as Hertz;
}

export function createByteCount(value: unknown): ByteCount {
  return createNonNegativeIntegerUnit<ByteCount>(value, "ByteCount");
}

export function createProgression(value: unknown): Progression {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1 ||
    Object.is(value, -0)
  ) {
    throw new RangeError(
      "Progression must be a finite number from zero through one.",
    );
  }

  return value as Progression;
}
