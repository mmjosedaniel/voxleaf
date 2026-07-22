const MEBIBYTE = 1_048_576;

/** Mirrors ADR-0007's compressed EPUB input ceiling at the desktop boundary. */
export const MAX_LOCAL_EPUB_FILE_BYTES = 100 * MEBIBYTE;

export type LocalEpubFileSizeDisposition = "accepted" | "invalid" | "too-large";

export type LocalEpubFileReadFailureReason =
  "invalid-size" | "read-failed" | "size-mismatch" | "too-large";

export interface LocalEpubFileReadOptions {
  readonly signal?: AbortSignal;
}

export interface ReadyLocalEpubFileRead {
  readonly status: "ready";
  readonly bytes: Uint8Array;
}

export interface CancelledLocalEpubFileRead {
  readonly status: "cancelled";
}

export interface RejectedLocalEpubFileRead {
  readonly status: "rejected";
  readonly reason: LocalEpubFileReadFailureReason;
}

export type LocalEpubFileReadResult =
  | CancelledLocalEpubFileRead
  | ReadyLocalEpubFileRead
  | RejectedLocalEpubFileRead;

const CANCELLED_RESULT: CancelledLocalEpubFileRead = Object.freeze({
  status: "cancelled",
});

function rejected(
  reason: LocalEpubFileReadFailureReason,
): RejectedLocalEpubFileRead {
  return Object.freeze({ status: "rejected", reason });
}

export function classifyLocalEpubFileSize(
  size: number,
): LocalEpubFileSizeDisposition {
  if (!Number.isSafeInteger(size) || size < 0) {
    return "invalid";
  }

  return size <= MAX_LOCAL_EPUB_FILE_BYTES ? "accepted" : "too-large";
}

/**
 * Reads one browser-selected file into a new caller-owned ArrayBuffer without
 * exposing its name, path, type, or read failure. FileReader is used instead
 * of File.arrayBuffer so an obsolete selection can abort the active read.
 */
export function readLocalEpubFile(
  file: File,
  options: LocalEpubFileReadOptions = {},
): Promise<LocalEpubFileReadResult> {
  const sizeDisposition = classifyLocalEpubFileSize(file.size);
  if (sizeDisposition === "invalid") {
    return Promise.resolve(rejected("invalid-size"));
  }
  if (sizeDisposition === "too-large") {
    return Promise.resolve(rejected("too-large"));
  }

  const { signal } = options;
  if (signal?.aborted === true) {
    return Promise.resolve(CANCELLED_RESULT);
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    let settled = false;

    const finish = (result: LocalEpubFileReadResult): void => {
      if (settled) {
        return;
      }

      settled = true;
      signal?.removeEventListener("abort", abortRead);
      reader.onload = null;
      reader.onerror = null;
      reader.onabort = null;
      resolve(result);
    };

    const abortRead = (): void => {
      if (reader.readyState === FileReader.LOADING) {
        reader.abort();
      }
      finish(CANCELLED_RESULT);
    };

    reader.onload = () => {
      if (signal?.aborted === true) {
        finish(CANCELLED_RESULT);
        return;
      }

      if (!(reader.result instanceof ArrayBuffer)) {
        finish(rejected("read-failed"));
        return;
      }

      if (
        reader.result.byteLength !== file.size ||
        reader.result.byteLength > MAX_LOCAL_EPUB_FILE_BYTES
      ) {
        finish(rejected("size-mismatch"));
        return;
      }

      finish(
        Object.freeze({
          status: "ready",
          bytes: new Uint8Array(reader.result),
        }),
      );
    };
    reader.onerror = () => finish(rejected("read-failed"));
    reader.onabort = () => finish(CANCELLED_RESULT);
    signal?.addEventListener("abort", abortRead, { once: true });

    try {
      reader.readAsArrayBuffer(file);
    } catch {
      finish(rejected("read-failed"));
    }
  });
}
