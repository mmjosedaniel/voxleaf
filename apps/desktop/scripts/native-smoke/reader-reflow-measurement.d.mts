export function measureReaderReflowAtPassage(options: {
  readonly readingLineInset: number;
  readonly limitMs: number;
  readonly prepare?: boolean;
}): Promise<number>;
