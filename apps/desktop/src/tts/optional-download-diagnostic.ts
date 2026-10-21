const STAGES = [
  "request",
  "response",
  "create-file",
  "read",
  "write",
  "flush",
  "verify",
  "rename",
] as const;
const KINDS = [
  "invalid-url",
  "redirect-rejected",
  "request",
  "timeout",
  "connection",
  "http-status",
  "content-length",
  "io",
  "size-limit",
  "incomplete",
  "integrity",
] as const;

export interface OptionalDownloadDiagnostic {
  readonly schemaVersion: 1;
  readonly appVersion: string;
  readonly packageVersion: string;
  readonly source: "github-release" | "hugging-face";
  readonly artifactIndex: number;
  readonly stage: (typeof STAGES)[number];
  readonly kind: (typeof KINDS)[number];
  readonly elapsedMs: number;
  readonly receivedBytes: number;
  readonly expectedBytes: number;
  readonly httpStatus: number | null;
  readonly contentLength: string | null;
  readonly osError: number | null;
}

function invalid(): never {
  throw new Error("optional-download-diagnostic-invalid");
}

function integer(
  value: unknown,
  minimum = 0,
  maximum = Number.MAX_SAFE_INTEGER,
): number {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < minimum ||
    value > maximum
  )
    invalid();
  return value;
}

function choice<T extends string>(value: unknown, options: readonly T[]): T {
  if (typeof value !== "string" || !options.includes(value as T)) invalid();
  return value as T;
}

export function decodeDownloadDiagnostic(
  value: unknown,
): OptionalDownloadDiagnostic | undefined {
  if (value === null) return undefined;
  if (typeof value !== "object" || value === null || Array.isArray(value))
    invalid();
  const record = value as Record<string, unknown>;
  if (
    record.schemaVersion !== 1 ||
    typeof record.appVersion !== "string" ||
    !/^\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(record.appVersion) ||
    typeof record.packageVersion !== "string" ||
    !/^\d{1,3}$/.test(record.packageVersion) ||
    (record.contentLength !== null &&
      (typeof record.contentLength !== "string" ||
        !/^\d{1,20}$/.test(record.contentLength)))
  )
    invalid();
  const source = choice(record.source, [
    "github-release",
    "hugging-face",
  ] as const);
  // Build a new closed object: no native error string, URL or extra field can
  // accidentally reach the exported report.
  return Object.freeze({
    schemaVersion: 1,
    appVersion: record.appVersion,
    packageVersion: record.packageVersion,
    source,
    artifactIndex: integer(
      record.artifactIndex,
      1,
      source === "github-release" ? 4 : 6,
    ),
    stage: choice(record.stage, STAGES),
    kind: choice(record.kind, KINDS),
    elapsedMs: integer(record.elapsedMs),
    receivedBytes: integer(record.receivedBytes),
    expectedBytes: integer(record.expectedBytes, 1),
    httpStatus:
      record.httpStatus === null ? null : integer(record.httpStatus, 100, 599),
    contentLength: record.contentLength,
    osError:
      record.osError === null
        ? null
        : integer(record.osError, -2_147_483_648, 2_147_483_647),
  });
}

export function exportDownloadDiagnostic(
  report: OptionalDownloadDiagnostic,
): void {
  const blob = new Blob([JSON.stringify(report, null, 2) + "\n"], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = "voxleaf-download-error.json";
    link.click();
  } finally {
    // Allow WebView2 to consume the explicit download before releasing it.
    window.setTimeout(URL.revokeObjectURL.bind(URL, url), 1_000);
  }
}
