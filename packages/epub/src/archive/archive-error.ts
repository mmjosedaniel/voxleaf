export type EpubArchiveErrorCode =
  | "broken-reference"
  | "cancelled"
  | "invalid-container"
  | "internal-failure"
  | "malformed-package"
  | "malformed-xml"
  | "resource-limit-exceeded"
  | "unsafe-entry"
  | "unsupported-layout"
  | "unsupported-protection"
  | "unsupported-resource"
  | "unsupported-version";

export class EpubArchiveError extends Error {
  public readonly code: EpubArchiveErrorCode;

  public constructor(code: EpubArchiveErrorCode) {
    super(code);
    this.name = "EpubArchiveError";
    this.code = code;
  }
}
