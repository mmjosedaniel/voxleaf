import { afterEach, describe, expect, it, vi } from "vitest";

import {
  classifyLocalEpubFileSize,
  MAX_LOCAL_EPUB_FILE_BYTES,
  readLocalEpubFile,
} from "./local-epub-file";

class ControlledFileReader {
  public static readonly EMPTY = 0;
  public static readonly LOADING = 1;
  public static readonly DONE = 2;
  public static instances: ControlledFileReader[] = [];

  public error: DOMException | null = null;
  public onabort: ((event: ProgressEvent<FileReader>) => void) | null = null;
  public onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
  public onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
  public readyState = ControlledFileReader.EMPTY;
  public result: ArrayBuffer | string | null = null;

  public constructor() {
    ControlledFileReader.instances.push(this);
  }

  public abort(): void {
    this.readyState = ControlledFileReader.DONE;
    this.onabort?.(new ProgressEvent("abort") as ProgressEvent<FileReader>);
  }

  public readAsArrayBuffer(): void {
    this.readyState = ControlledFileReader.LOADING;
  }

  public fail(): void {
    this.error = new DOMException("private browser failure");
    this.readyState = ControlledFileReader.DONE;
    this.onerror?.(new ProgressEvent("error") as ProgressEvent<FileReader>);
  }

  public succeed(result: ArrayBuffer): void {
    this.result = result;
    this.readyState = ControlledFileReader.DONE;
    this.onload?.(new ProgressEvent("load") as ProgressEvent<FileReader>);
  }
}

function installControlledReader(): void {
  ControlledFileReader.instances = [];
  vi.stubGlobal("FileReader", ControlledFileReader);
}

function latestReader(): ControlledFileReader {
  const reader = ControlledFileReader.instances.at(-1);
  if (reader === undefined) {
    throw new Error("Expected the controlled FileReader to exist");
  }
  return reader;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("local EPUB file ingress", () => {
  it("accepts the exact 100 MiB boundary without allocating the file in the test", async () => {
    installControlledReader();
    const controller = new AbortController();
    const result = readLocalEpubFile(
      { size: MAX_LOCAL_EPUB_FILE_BYTES } as File,
      { signal: controller.signal },
    );

    expect(classifyLocalEpubFileSize(MAX_LOCAL_EPUB_FILE_BYTES)).toBe(
      "accepted",
    );
    expect(latestReader().readyState).toBe(ControlledFileReader.LOADING);
    controller.abort();

    await expect(result).resolves.toEqual({ status: "cancelled" });
  });

  it("rejects maximum plus one before constructing a reader", async () => {
    installControlledReader();

    await expect(
      readLocalEpubFile({ size: MAX_LOCAL_EPUB_FILE_BYTES + 1 } as File),
    ).resolves.toEqual({ status: "rejected", reason: "too-large" });
    expect(classifyLocalEpubFileSize(MAX_LOCAL_EPUB_FILE_BYTES + 1)).toBe(
      "too-large",
    );
    expect(ControlledFileReader.instances).toHaveLength(0);
  });

  it("rejects invalid reported sizes before reading", async () => {
    installControlledReader();

    await expect(readLocalEpubFile({ size: -1 } as File)).resolves.toEqual({
      status: "rejected",
      reason: "invalid-size",
    });
    expect(classifyLocalEpubFileSize(Number.POSITIVE_INFINITY)).toBe("invalid");
    expect(ControlledFileReader.instances).toHaveLength(0);
  });

  it("returns caller-owned bytes for a successful bounded read", async () => {
    installControlledReader();
    const result = readLocalEpubFile({ size: 3 } as File);

    latestReader().succeed(new Uint8Array([1, 2, 3]).buffer);

    await expect(result).resolves.toEqual({
      status: "ready",
      bytes: new Uint8Array([1, 2, 3]),
    });
  });

  it("rejects a browser-reported byte-length mismatch", async () => {
    installControlledReader();
    const result = readLocalEpubFile({ size: 3 } as File);

    latestReader().succeed(new ArrayBuffer(2));

    await expect(result).resolves.toEqual({
      status: "rejected",
      reason: "size-mismatch",
    });
  });

  it("aborts an active browser read", async () => {
    installControlledReader();
    const controller = new AbortController();
    const result = readLocalEpubFile({ size: 3 } as File, {
      signal: controller.signal,
    });
    const reader = latestReader();

    controller.abort();

    expect(reader.readyState).toBe(ControlledFileReader.DONE);
    await expect(result).resolves.toEqual({ status: "cancelled" });
  });

  it("maps read failures to a fixed content-free result", async () => {
    installControlledReader();
    const result = readLocalEpubFile({ size: 3 } as File);

    latestReader().fail();

    await expect(result).resolves.toEqual({
      status: "rejected",
      reason: "read-failed",
    });
  });
});
