import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import {
  readLocalEpubFile,
  type LocalEpubFileReadResult,
} from "./file-ingress/local-epub-file";

type FileIngressProbeStatus =
  "accepted" | "cancelled" | "idle" | "reading" | "rejected" | "too-large";

export interface AppProps {
  readonly readFile?: typeof readLocalEpubFile;
}

const STATUS_MESSAGE: Readonly<Record<FileIngressProbeStatus, string>> = {
  accepted: "Local EPUB bytes are ready for the future publication opener.",
  cancelled: "File selection was cancelled.",
  idle: "No local EPUB is selected.",
  reading: "Reading the selected EPUB into bounded memory.",
  rejected: "VoxLeaf could not read that local file.",
  "too-large": "That file is larger than the 100 MiB EPUB limit.",
};

function statusForResult(
  result: LocalEpubFileReadResult,
): FileIngressProbeStatus {
  if (result.status === "ready") {
    return "accepted";
  }
  if (result.status === "cancelled") {
    return "cancelled";
  }
  return result.reason === "too-large" ? "too-large" : "rejected";
}

export function App({ readFile = readLocalEpubFile }: AppProps) {
  const activeRead = useRef<AbortController | undefined>(undefined);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const requestSequence = useRef(0);
  const [status, setStatus] = useState<FileIngressProbeStatus>("idle");

  const cancelActiveRead = useCallback((): void => {
    requestSequence.current += 1;
    activeRead.current?.abort();
    activeRead.current = undefined;
  }, []);

  useEffect(() => {
    const input = fileInput.current;
    const handleCancel = (): void => {
      cancelActiveRead();
      setStatus("cancelled");
    };
    input?.addEventListener("cancel", handleCancel);

    return () => {
      input?.removeEventListener("cancel", handleCancel);
      cancelActiveRead();
    };
  }, [cancelActiveRead]);

  const handleSelection = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";

    cancelActiveRead();
    if (file === null || file === undefined) {
      setStatus("cancelled");
      return;
    }

    const requestId = requestSequence.current;
    const controller = new AbortController();
    activeRead.current = controller;
    setStatus("reading");

    const result = await readFile(file, { signal: controller.signal });
    if (
      requestId !== requestSequence.current ||
      activeRead.current !== controller
    ) {
      return;
    }

    activeRead.current = undefined;
    setStatus(statusForResult(result));
  };

  return (
    <main className="app-shell">
      <section className="shell-card" aria-labelledby="shell-title">
        <p className="shell-label">Local file ingress probe</p>
        <h1 id="shell-title">VoxLeaf development shell</h1>
        <p className="shell-description">
          Choose an EPUB to verify the capability-free WebView file boundary.
          The probe reads bounded bytes in memory but does not open or persist
          the book.
        </p>
        <label className="file-picker">
          <span>Choose a local EPUB</span>
          <input
            ref={fileInput}
            type="file"
            accept=".epub,application/epub+zip"
            onChange={(event) => void handleSelection(event)}
          />
        </label>
        <p className="probe-status" role="status" aria-live="polite">
          {STATUS_MESSAGE[status]}
        </p>
      </section>
    </main>
  );
}
