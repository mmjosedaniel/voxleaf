import {
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

afterEach(() => cleanup());

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
    expect(invoke).toHaveBeenCalledOnce();
  });

  it("shows measured disclosure and starts only after the explicit Download action", async () => {
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
      screen.getByText(/13,254,834,850 bytes \(13.25 GB \/ 12.35 GiB\)/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/8,228,503,309 bytes \(8.23 GB \/ 7.66 GiB\)/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/8,231,893,387 bytes \(8.23 GB \/ 7.67 GiB\)/),
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
    expect(invoke).toHaveBeenCalledTimes(1);
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
