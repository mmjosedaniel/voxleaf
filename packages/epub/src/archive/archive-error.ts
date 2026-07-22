export type EpubArchiveErrorCode =
  | "cancelled"
  | "invalid-container"
  | "internal-failure"
  | "resource-limit-exceeded"
  | "unsafe-entry"
  | "unsupported-protection";

export class EpubArchiveError extends Error {
  public readonly code: EpubArchiveErrorCode;

  public constructor(code: EpubArchiveErrorCode) {
    super(code);
    this.name = "EpubArchiveError";
    this.code = code;
  }
}
