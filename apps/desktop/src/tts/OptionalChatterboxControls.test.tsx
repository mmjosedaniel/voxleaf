import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  CHATTERBOX_OPTIONAL_PROFILE_ID,
  OptionalChatterboxClient,
} from "./optional-chatterbox-client";
import { OptionalChatterboxControls } from "./OptionalChatterboxControls";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function deferred() {
  let resolve!: (value: unknown) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<unknown>((accept, fail) => {
    resolve = accept;
    reject = fail;
  });
  return { promise, resolve, reject };
}

function snapshot(
  state: "absent" | "confirming" | "downloading" | "failed" | "installed",
  downloadedBytes = 0,
) {
  return {
    profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
    state,
    downloadBytes: 1_073_741_824,
    downloadedBytes,
    installedBytes: 2_147_483_648,
    temporaryBytes: 3_221_225_472,
    minimumFreeBytes: 4_294_967_296,
    coldStartSeconds: 31,
    minimumLogicalProcessors: 8,
    minimumTotalRamMiB: 24_576,
    minimumAvailableRamMiB: 4_096,
    measuredPeakDedicatedVramMiB: 3_644,
    minimumTotalDedicatedVramMiB: 5_632,
    minimumAvailableDedicatedVramMiB: 4_668,
    recommendedTotalDedicatedVramMiB: 7_680,
    licenseSummary:
      "Chatterbox, its reviewed model/default conditioning, and PerTh are MIT-licensed.",
    failure: null,
  };
}

describe("optional Chatterbox controls", () => {
  it("SFA-06 unmount releases the pending action subscription and timer", async () => {
    vi.useFakeTimers();
    const download = deferred();
    const invoke = vi.fn((command: string) =>
      command === "download_optional_chatterbox"
        ? download.promise
        : Promise.resolve(snapshot("confirming")),
    );
    const client = new OptionalChatterboxClient(invoke);
    const unsubscribe = vi.fn();
    const subscribe = client.subscribe.bind(client);
    vi.spyOn(client, "subscribe").mockImplementation((listener) => {
      const release = subscribe(listener);
      return () => {
        release();
        unsubscribe();
      };
    });
    const subject = render(
      <OptionalChatterboxControls
        client={client}
        onActivate={vi.fn(async () => true)}
        onRecheck={vi.fn(async () => true)}
        onRemove={vi.fn(async () => undefined)}
      />,
    );
    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Download Chatterbox" }),
    );
    const releases = unsubscribe.mock.calls.length;
    subject.unmount();
    expect(unsubscribe.mock.calls.length).toBeGreaterThan(releases);
    const calls = invoke.mock.calls.length;
    await act(async () => {
      download.reject("tts-optional-profile-incompatible-host");
      await vi.advanceTimersByTimeAsync(1_000);
    });
    expect(invoke).toHaveBeenCalledTimes(calls);
    expect(vi.getTimerCount()).toBe(0);
    expect(subject.container).toBeEmptyDOMElement();
  });

  it("SFA-06 shows a preflight rejection after a confirming poll and releases polling on unmount", async () => {
    vi.useFakeTimers();
    const download = deferred();
    const invoke = vi.fn((command: string) =>
      command === "download_optional_chatterbox"
        ? download.promise
        : Promise.resolve(snapshot("confirming")),
    );
    const client = new OptionalChatterboxClient(invoke);
    const subject = render(
      <OptionalChatterboxControls
        client={client}
        onActivate={vi.fn(async () => true)}
        onRecheck={vi.fn(async () => true)}
        onRemove={vi.fn(async () => undefined)}
      />,
    );
    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Download Chatterbox" }),
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
    expect(client.observe().state).toBe("confirming");
    await act(async () => {
      download.reject("tts-optional-profile-incompatible-host");
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "does not currently meet the Chatterbox requirements",
    );
    expect(
      screen.getByRole("button", { name: "Recheck device compatibility" }),
    ).toBeEnabled();
    const calls = invoke.mock.calls.length;
    subject.unmount();
    await vi.advanceTimersByTimeAsync(1_000);
    expect(invoke).toHaveBeenCalledTimes(calls);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("SAF-02 exposes removal for cache-only residue discovered after restart", async () => {
    const invoke = vi.fn(async (command: string) =>
      command === "remove_optional_chatterbox"
        ? { ...snapshot("absent"), installedBytes: null }
        : {
            ...snapshot("failed"),
            installedBytes: null,
            failure: "tts-optional-profile-unavailable",
          },
    );
    const client = new OptionalChatterboxClient(invoke);
    const onRemove = vi.fn(async () => {
      await client.remove();
    });
    render(
      <OptionalChatterboxControls
        client={client}
        onActivate={vi.fn(async () => true)}
        onRecheck={vi.fn(async () => true)}
        onRemove={onRemove}
      />,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Remove Chatterbox" }),
    );
    await waitFor(() => expect(client.observe().state).toBe("absent"));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(invoke).toHaveBeenCalledWith("remove_optional_chatterbox", {
      profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
    });
    expect(
      screen.queryByRole("button", { name: "Remove Chatterbox" }),
    ).not.toBeInTheDocument();
  });

  it.each([
    "tts-optional-profile-download-failed",
    "tts-optional-profile-insufficient-space",
    "tts-optional-profile-invalid",
  ])(
    "NCC-03 explicitly retries cached %s through fresh confirmation",
    async (failure) => {
      let corrected = false;
      let current = {
        ...snapshot("failed"),
        failure: failure as string | null,
      };
      const invoke = vi.fn(async (command: string) => {
        if (command === "select_optional_chatterbox" && corrected)
          current = { ...snapshot("confirming"), failure: null };
        if (command === "download_optional_chatterbox")
          current = { ...snapshot("installed"), failure: null };
        return current;
      });
      const client = new OptionalChatterboxClient(invoke);
      const onRemove = vi.fn(async () => undefined);
      render(
        <OptionalChatterboxControls
          client={client}
          onActivate={vi.fn(async () => true)}
          onRecheck={vi.fn(async () => true)}
          onRemove={onRemove}
        />,
      );
      const retry = await screen.findByRole("button", {
        name: /Check Chatterbox again|Review Chatterbox download again/,
      });
      corrected = true;
      fireEvent.click(retry);
      await waitFor(() => expect(client.observe().state).toBe("confirming"));
      expect(invoke).toHaveBeenCalledWith("select_optional_chatterbox", {
        profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
      });
      expect(invoke.mock.calls.map(([command]) => command)).not.toContain(
        "download_optional_chatterbox",
      );
      expect(onRemove).not.toHaveBeenCalled();
      fireEvent.click(
        screen.getByRole("button", { name: "Download Chatterbox" }),
      );
      await waitFor(() => expect(client.observe().state).toBe("installed"));
      expect(invoke).toHaveBeenCalledWith("download_optional_chatterbox", {
        profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
      });
    },
  );

  it("reads the last download error only after an explicit export request", async () => {
    const invoke = vi.fn(async (command: string) =>
      command === "optional_chatterbox_download_diagnostic"
        ? null
        : snapshot("absent"),
    );
    render(
      <OptionalChatterboxControls
        client={new OptionalChatterboxClient(invoke)}
        onActivate={vi.fn(async () => true)}
        onRecheck={vi.fn(async () => true)}
        onRemove={vi.fn(async () => undefined)}
      />,
    );
    fireEvent.click(screen.getByText("Download troubleshooting"));
    const button = await screen.findByRole("button", {
      name: "Export last download error",
    });
    expect(invoke).not.toHaveBeenCalledWith(
      "optional_chatterbox_download_diagnostic",
    );
    fireEvent.click(button);
    expect(
      await screen.findByText(
        "No download error has been recorded in this session.",
      ),
    ).toBeInTheDocument();
    expect(invoke).toHaveBeenCalledWith(
      "optional_chatterbox_download_diagnostic",
    );
  });

  it("exports a local report only on click and leaves acquisition state unchanged", async () => {
    const report = {
      schemaVersion: 1,
      appVersion: "0.1.0",
      packageVersion: "5",
      source: "github-release",
      artifactIndex: 1,
      stage: "request",
      kind: "timeout",
      elapsedMs: 30_000,
      receivedBytes: 0,
      expectedBytes: 1_900_000_000,
      httpStatus: null,
      contentLength: null,
      osError: null,
    };
    const create = vi.fn(() => "blob:diagnostic");
    vi.stubGlobal(
      "URL",
      class extends URL {
        static override createObjectURL = create;
        static override revokeObjectURL = vi.fn();
      },
    );
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    const client = new OptionalChatterboxClient(
      vi.fn(async (command) =>
        command === "optional_chatterbox_download_diagnostic"
          ? report
          : snapshot("absent"),
      ),
    );
    render(
      <OptionalChatterboxControls
        client={client}
        onActivate={vi.fn(async () => true)}
        onRecheck={vi.fn(async () => true)}
        onRemove={vi.fn(async () => undefined)}
      />,
    );
    await screen.findByRole("button", { name: "Review Chatterbox download" });
    expect(create).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Download troubleshooting"));
    fireEvent.click(
      screen.getByRole("button", { name: "Export last download error" }),
    );
    await screen.findByText("Diagnostic download requested.");
    expect(create).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect((click.mock.instances[0] as HTMLAnchorElement).download).toBe(
      "voxleaf-download-error.json",
    );
    expect(client.observe().state).toBe("absent");
  });

  it("contains report-read failures without changing the download state", async () => {
    const client = new OptionalChatterboxClient(async (command) => {
      if (command === "optional_chatterbox_download_diagnostic")
        throw new Error("unavailable");
      return snapshot("absent");
    });
    render(
      <OptionalChatterboxControls
        client={client}
        onActivate={vi.fn(async () => true)}
        onRecheck={vi.fn(async () => true)}
        onRemove={vi.fn(async () => undefined)}
      />,
    );
    await screen.findByRole("button", { name: "Review Chatterbox download" });
    fireEvent.click(screen.getByText("Download troubleshooting"));
    fireEvent.click(
      screen.getByRole("button", { name: "Export last download error" }),
    );
    await screen.findByText("Could not export the download error. Try again.");
    expect(client.observe().state).toBe("absent");
    expect(
      screen.getByRole("button", { name: "Export last download error" }),
    ).toBeEnabled();
  });

  it("lets an absent compatible package reach explicit download confirmation", async () => {
    const invoke = vi.fn(async (command: string) =>
      snapshot(
        command === "optional_chatterbox_snapshot" ? "absent" : "confirming",
      ),
    );
    const client = new OptionalChatterboxClient(invoke);

    render(
      <OptionalChatterboxControls
        client={client}
        onActivate={vi.fn(async () => true)}
        onRecheck={vi.fn(async () => true)}
        onRemove={vi.fn(async () => undefined)}
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Review Chatterbox download",
      }),
    );

    expect(
      await screen.findByRole("button", { name: "Download Chatterbox" }),
    ).toBeInTheDocument();
    expect(invoke).toHaveBeenNthCalledWith(2, "select_optional_chatterbox", {
      profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
    });
  });

  it("blocks review until the bounded Chatterbox compatibility presentation passes", async () => {
    const invoke = vi.fn(async () => snapshot("absent"));
    const client = new OptionalChatterboxClient(invoke);
    const onRecheck = vi.fn(async () => true);

    render(
      <OptionalChatterboxControls
        client={client}
        onActivate={vi.fn(async () => true)}
        onRecheck={onRecheck}
        onRemove={vi.fn(async () => undefined)}
        acquisitionAllowed={false}
        acquisitionBlockMessage="Chatterbox compatibility is not established. Recheck device compatibility."
      />,
    );

    const review = await screen.findByRole("button", {
      name: "Review Chatterbox download",
    });
    expect(review).toBeDisabled();
    expect(
      screen.getByText(/compatibility is not established/),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Recheck device compatibility" }),
    );
    await waitFor(() => expect(onRecheck).toHaveBeenCalledOnce());
    expect(invoke).toHaveBeenCalledTimes(2);
    expect(invoke).toHaveBeenLastCalledWith(
      "optional_chatterbox_snapshot",
      undefined,
    );
  });

  it("SFA-03 shows snapshot disclosure and starts only after the explicit Download action", async () => {
    const invoke = vi.fn(async (command: string) => {
      if (command === "optional_chatterbox_snapshot") {
        return snapshot("confirming");
      }
      return snapshot("installed");
    });
    const client = new OptionalChatterboxClient(invoke);

    render(
      <OptionalChatterboxControls
        client={client}
        onActivate={vi.fn(async () => true)}
        onRecheck={vi.fn(async () => true)}
        onRemove={vi.fn(async () => undefined)}
      />,
    );

    expect(
      await screen.findByRole("button", { name: "Download Chatterbox" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Download 1.00 GiB/)).toBeInTheDocument();
    expect(
      screen.getByText(/Chatterbox measured 3.56 GiB VRAM/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/6-GB-class hardware is admitted/),
    ).toBeInTheDocument();
    expect(screen.getByText(/24.00 GiB RAM total/)).toBeInTheDocument();
    expect(
      screen.getByText(/3,221,225,472 bytes \(3.22 GB \/ 3.00 GiB\)/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/2,147,483,648 bytes \(2.15 GB \/ 2.00 GiB\)/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/1,073,741,824 bytes \(1.07 GB \/ 1.00 GiB\)/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Historical v2 observations, not current package measurements/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/4,294,967,296 bytes \(4.29 GB \/ 4.00 GiB\)/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/generally more natural and expressive than Piper/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/first model load can exceed one minute/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/A representative cold start rounded to 31 seconds/),
    ).toHaveTextContent("actual startup varies and can exceed one minute");
    expect(screen.queryByText(/60 seconds/)).not.toBeInTheDocument();
    expect(invoke).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getByRole("button", { name: "Download Chatterbox" }),
    );
    expect(
      await screen.findByRole("button", { name: "Activate Chatterbox" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Activate it before starting narration/),
    ).toBeInTheDocument();
    expect(invoke).toHaveBeenNthCalledWith(2, "download_optional_chatterbox", {
      profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
    });
  });

  it("blocks Download in confirmation when Chatterbox compatibility no longer passes", async () => {
    const client = new OptionalChatterboxClient(async () =>
      snapshot("confirming"),
    );

    render(
      <OptionalChatterboxControls
        client={client}
        onActivate={vi.fn(async () => true)}
        onRecheck={vi.fn(async () => true)}
        onRemove={vi.fn(async () => undefined)}
        acquisitionAllowed={false}
        acquisitionBlockMessage="This device does not currently meet the Chatterbox requirements. Recheck device compatibility after its available resources change."
      />,
    );

    expect(
      await screen.findByRole("button", { name: "Download Chatterbox" }),
    ).toBeDisabled();
    expect(
      screen.getByText(/does not currently meet the Chatterbox requirements/),
    ).toBeInTheDocument();
  });

  it("shows an installed selected profile as active without redundant activation", async () => {
    const client = new OptionalChatterboxClient(async () =>
      snapshot("installed"),
    );

    render(
      <OptionalChatterboxControls
        client={client}
        active
        onActivate={vi.fn(async () => true)}
        onRecheck={vi.fn(async () => true)}
        onRemove={vi.fn(async () => undefined)}
      />,
    );

    expect(
      await screen.findByText(
        "The verified Chatterbox package is installed and selected.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Activate Chatterbox" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove Chatterbox" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Chatterbox is active.")).toBeInTheDocument();
    expect(
      screen.getByText("Local package storage: 2.00 GiB."),
    ).toBeInTheDocument();
  });

  it("explains the bounded cleanup caused by cancelling acquisition", async () => {
    const client = new OptionalChatterboxClient(async () =>
      snapshot("confirming"),
    );

    render(
      <OptionalChatterboxControls
        client={client}
        onActivate={vi.fn(async () => true)}
        onRecheck={vi.fn(async () => true)}
        onRemove={vi.fn(async () => undefined)}
      />,
    );

    expect(
      await screen.findByText(
        /removes only this operation's incomplete staging/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/It cannot resume later/)).toBeInTheDocument();
    expect(
      screen.getByText(/never removes a verified installed package/),
    ).toBeInTheDocument();
  });

  it("shows safe actionable failure copy and lets the user check again", async () => {
    const invoke = vi.fn(async () => ({
      ...snapshot("failed"),
      failure: "tts-optional-profile-incompatible-host",
    }));
    const client = new OptionalChatterboxClient(invoke);
    const onRecheck = vi.fn(async () => true);

    render(
      <OptionalChatterboxControls
        client={client}
        onActivate={vi.fn(async () => true)}
        onRecheck={onRecheck}
        onRemove={vi.fn(async () => undefined)}
      />,
    );

    expect(
      await screen.findByText(
        /does not currently meet the Chatterbox requirements/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("tts-optional-profile-incompatible-host"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Chatterbox is not active.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove Chatterbox" }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Recheck device compatibility" }),
    );
    await waitFor(() => expect(onRecheck).toHaveBeenCalledTimes(1));
    expect(invoke).toHaveBeenCalledTimes(2);
    expect(invoke).toHaveBeenLastCalledWith(
      "optional_chatterbox_snapshot",
      undefined,
    );
  });

  it("explains cleanup recovery and retries removal without restarting", async () => {
    let removalAttempts = 0;
    const invoke = vi.fn(async (command: string) => {
      if (command === "remove_optional_chatterbox") {
        removalAttempts += 1;
        return removalAttempts === 1
          ? Promise.reject("tts-optional-profile-cleanup-failed")
          : snapshot("absent");
      }
      return snapshot("installed");
    });
    const client = new OptionalChatterboxClient(invoke);
    const onRemove = vi.fn(async () => {
      await client.remove();
    });
    render(
      <OptionalChatterboxControls
        client={client}
        onActivate={vi.fn(async () => true)}
        onRecheck={vi.fn(async () => true)}
        onRemove={onRemove}
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Remove Chatterbox" }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Close any apps using those files, then try Remove Chatterbox again.",
    );
    expect(screen.queryByText(/Restart VoxLeaf/)).not.toBeInTheDocument();
    const retry = screen.getByRole("button", { name: "Remove Chatterbox" });
    await waitFor(() => expect(retry).toBeEnabled());
    fireEvent.click(retry);
    expect(
      await screen.findByRole("button", { name: "Review Chatterbox download" }),
    ).toBeEnabled();
    expect(onRemove).toHaveBeenCalledTimes(2);
    expect(client.observe().state).toBe("absent");
  });

  it("polls and exposes native progress while the download command remains active", async () => {
    let downloadStarted = false;
    const invoke = vi.fn((command: string): Promise<unknown> => {
      if (command === "download_optional_chatterbox") {
        downloadStarted = true;
        return new Promise(() => undefined);
      }
      return Promise.resolve(
        downloadStarted
          ? snapshot("downloading", 536_870_912)
          : snapshot("confirming"),
      );
    });
    const client = new OptionalChatterboxClient(invoke);

    render(
      <OptionalChatterboxControls
        client={client}
        onActivate={vi.fn(async () => true)}
        onRecheck={vi.fn(async () => true)}
        onRemove={vi.fn(async () => undefined)}
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Download Chatterbox" }),
    );

    expect(
      await screen.findByText("Starting the Chatterbox download."),
    ).toBeInTheDocument();
    const progress = await screen.findByRole(
      "progressbar",
      { name: "Chatterbox download progress" },
      { timeout: 1_000 },
    );
    expect(progress).toHaveAttribute("max", "1073741824");
    expect(progress).toHaveAttribute("value", "536870912");
    await waitFor(() =>
      expect(invoke).toHaveBeenCalledWith(
        "optional_chatterbox_snapshot",
        undefined,
      ),
    );
  });
});
