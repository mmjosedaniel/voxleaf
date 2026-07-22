export type EpubPathErrorCode =
  "broken-reference" | "resource-limit-exceeded" | "unsafe-entry";

export class EpubPathError extends Error {
  public readonly code: EpubPathErrorCode;

  public constructor(code: EpubPathErrorCode) {
    super(code);
    this.name = "EpubPathError";
    this.code = code;
  }
}
