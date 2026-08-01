import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  CHATTERBOX_OPTIONAL_PROFILE_ID,
  OptionalChatterboxClient,
} from "./optional-chatterbox-client";
import { OptionalChatterboxControls } from "./OptionalChatterboxControls";

afterEach(() => cleanup());

function snapshot(state: "confirming" | "installed") {
  return {
    profileId: CHATTERBOX_OPTIONAL_PROFILE_ID,
    state,
    downloadBytes: 1_073_741_824,
    downloadedBytes: 0,
    installedBytes: 2_147_483_648,
    temporaryBytes: 3_221_225_472,
    minimumFreeBytes: 4_294_967_296,
    coldStartSeconds: 31,
    licenseSummary:
      "Chatterbox, its reviewed model/default conditioning, and PerTh are MIT-licensed.",
    failure: null,
  };
}

describe("optional Chatterbox controls", () => {
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
