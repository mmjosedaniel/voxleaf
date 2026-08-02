import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactElement,
} from "react";

import {
  OptionalChatterboxClient,
  type OptionalChatterboxSnapshot,
} from "./optional-chatterbox-client";

export interface OptionalChatterboxControlsProps {
  readonly client: OptionalChatterboxClient;
  readonly onActivate: () => Promise<boolean>;
  readonly onRemove: () => Promise<void>;
}

function displayBytes(value: number | undefined): string {
  if (value === undefined) {
    return "measured size pending";
  }
  return `${(value / 1_073_741_824).toFixed(2)} GiB`;
}

function displayMiB(value: number): string {
  return `${(value / 1_024).toFixed(2)} GiB`;
}

function StatusCopy({
  snapshot,
  downloadRequested,
}: Readonly<{
  snapshot: OptionalChatterboxSnapshot;
  downloadRequested: boolean;
}>): ReactElement {
  if (downloadRequested && snapshot.state === "confirming") {
    return <p aria-live="polite">Starting the Chatterbox download.</p>;
  }
  switch (snapshot.state) {
    case "absent":
      return <p>The compatible Chatterbox quality profile is not installed.</p>;
    case "confirming":
      return <p>Review the local download before starting it.</p>;
    case "downloading":
      return (
        <p aria-live="polite">
          Downloading Chatterbox: {displayBytes(snapshot.downloadedBytes)} of{" "}
          {displayBytes(snapshot.downloadBytes)}.
        </p>
      );
    case "verifying":
      return <p aria-live="polite">Verifying the downloaded package.</p>;
    case "installed":
      return <p>The verified Chatterbox package is installed locally.</p>;
    case "removing":
      return <p aria-live="polite">Removing the local Chatterbox package.</p>;
    case "failed":
      return (
        <p role="status">
          Chatterbox setup did not complete. The current narration profile was
          not changed.
        </p>
      );
    case "withheld":
      return (
        <p>
          The optional Chatterbox download is not available to end users yet.
          Clean-host validation is still pending. Piper remains available
          without it.
        </p>
      );
  }
}

export function OptionalChatterboxControls({
  client,
  onActivate,
  onRemove,
}: OptionalChatterboxControlsProps): ReactElement {
  const snapshot = useSyncExternalStore(
    (listener) => client.subscribe(listener),
    () => client.observe(),
    () => client.observe(),
  );
  const [pending, setPending] = useState(false);
  const [downloadRequested, setDownloadRequested] = useState(false);

  useEffect(() => {
    void client.refresh();
  }, [client]);

  useEffect(() => {
    if (
      !downloadRequested &&
      !["downloading", "verifying", "removing"].includes(snapshot.state)
    ) {
      return;
    }
    const timer = window.setInterval(() => void client.refresh(), 250);
    return () => window.clearInterval(timer);
  }, [client, downloadRequested, snapshot.state]);

  const run = (operation: () => Promise<unknown>): void => {
    setPending(true);
    void operation().finally(() => setPending(false));
  };

  const download = (): void => {
    setPending(true);
    setDownloadRequested(true);
    void client.download().finally(() => {
      setDownloadRequested(false);
      setPending(false);
    });
  };

  return (
    <section
      className="optional-chatterbox-controls"
      aria-labelledby="optional-chatterbox-heading"
      data-optional-profile-state={snapshot.state}
    >
      <h4 id="optional-chatterbox-heading">Chatterbox quality voice</h4>
      <StatusCopy snapshot={snapshot} downloadRequested={downloadRequested} />
      {snapshot.state === "absent" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => client.select())}
        >
          Review Chatterbox download
        </button>
      ) : null}
      {snapshot.state === "confirming" ? (
        <div className="optional-chatterbox-confirmation">
          <p>
            Spanish and English on Windows x64. Download{" "}
            {displayBytes(snapshot.downloadBytes)}; install{" "}
            {displayBytes(snapshot.installedBytes)}; temporary storage{" "}
            {displayBytes(snapshot.temporaryBytes)}; free space required{" "}
            {displayBytes(snapshot.minimumFreeBytes)}. Cold start is about{" "}
            {snapshot.coldStartSeconds ?? "a measured"} seconds.
          </p>
          <p>
            GPU: Chatterbox measured{" "}
            {displayMiB(snapshot.measuredPeakDedicatedVramMiB)} VRAM. VoxLeaf
            requires {displayMiB(snapshot.minimumTotalDedicatedVramMiB)} total
            and {displayMiB(snapshot.minimumAvailableDedicatedVramMiB)}{" "}
            available. A nominal 8-GB GPU (
            {displayMiB(snapshot.recommendedTotalDedicatedVramMiB)} reported) is
            recommended and was the evaluated class; 6-GB-class hardware is
            admitted only when the available memory check passes.
          </p>
          <p>
            System: {snapshot.minimumLogicalProcessors} logical processors,{" "}
            {displayMiB(snapshot.minimumTotalRamMiB)} RAM total, and{" "}
            {displayMiB(snapshot.minimumAvailableRamMiB)} RAM available.
          </p>
          <p>{snapshot.licenseSummary}</p>
          <button type="button" disabled={pending} onClick={download}>
            Download Chatterbox
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => client.cancel())}
          >
            Cancel
          </button>
        </div>
      ) : null}
      {snapshot.state === "downloading" || snapshot.state === "verifying" ? (
        <div className="optional-chatterbox-progress">
          {snapshot.state === "downloading" &&
          snapshot.downloadBytes !== undefined ? (
            <progress
              aria-label="Chatterbox download progress"
              max={snapshot.downloadBytes}
              value={snapshot.downloadedBytes}
            />
          ) : null}
          <button
            type="button"
            disabled={pending && !downloadRequested}
            onClick={() => run(() => client.cancel())}
          >
            Cancel download
          </button>
        </div>
      ) : null}
      {snapshot.state === "installed" ? (
        <div>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(onActivate)}
          >
            Activate Chatterbox
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(onRemove)}
          >
            Remove Chatterbox
          </button>
        </div>
      ) : null}
    </section>
  );
}
