import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  CHATTERBOX_OPTIONAL_PROFILE_ID,
  OptionalChatterboxClient,
} from "./optional-chatterbox-client";
import { OptionalChatterboxControls } from "./OptionalChatterboxControls";

afterEach(() => cleanup());

function snapshot(state: "absent" | "confirming" | "installed") {
  return {
    profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
    state,
    downloadBytes: 1_073_741_824,
    downloadedBytes: 0,
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
    expect(invoke).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getByRole("button", { name: "Download Chatterbox" }),
    );
    expect(
      await screen.findByRole("button", { name: "Activate Chatterbox" }),
    ).toBeInTheDocument();
    expect(invoke).toHaveBeenNthCalledWith(2, "download_optional_chatterbox", {
      profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
    });
  });
});
