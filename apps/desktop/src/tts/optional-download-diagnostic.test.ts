import { describe, expect, it } from "vitest";
import { decodeDownloadDiagnostic } from "./optional-download-diagnostic";

const report = {
  schemaVersion: 1,
  appVersion: "0.1.0",
  packageVersion: "5",
  source: "github-release",
  artifactIndex: 1,
  stage: "response",
  kind: "content-length",
  elapsedMs: 100,
  receivedBytes: 0,
  expectedBytes: 1_900_000_000,
  httpStatus: 200,
  contentLength: "18446744073709551615",
  osError: null,
};

describe("optional download diagnostics", () => {
  it("preserves large header sizes exactly and omits unapproved fields", () => {
    const decoded = decodeDownloadDiagnostic({
      ...report,
      url: "https://host/?secret=token",
      message: "private book",
    });
    expect(decoded).toEqual(report);
    expect(Object.isFrozen(decoded)).toBe(true);
    expect(JSON.stringify(decoded)).not.toMatch(/secret|private|url|message/);
    expect(decodeDownloadDiagnostic(null)).toBeUndefined();
  });

  it.each([
    undefined,
    [],
    {},
    { ...report, artifactIndex: 5 },
    { ...report, stage: "https://private" },
    { ...report, kind: "raw error" },
    { ...report, contentLength: "token=secret" },
    { ...report, osError: "private/path" },
    { ...report, elapsedMs: Number.MAX_SAFE_INTEGER + 1 },
    { ...report, appVersion: "private" },
    { ...report, httpStatus: 99 },
  ])("rejects malformed diagnostic metadata %#", (value) => {
    expect(() => decodeDownloadDiagnostic(value)).toThrow(
      "optional-download-diagnostic-invalid",
    );
  });
});
