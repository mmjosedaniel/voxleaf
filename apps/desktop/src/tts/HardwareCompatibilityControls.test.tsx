import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { decodeHostProfileCompatibilityReportV1 } from "@voxleaf/shared";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { HardwareProfilePreferenceRepository } from "../persistence/hardware-profile-preference";
import { HardwareCompatibilityControls } from "./HardwareCompatibilityControls";
import { HardwareProfileCompatibilityCoordinator } from "./hardware-profile-compatibility";
import { EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID } from "./hardware-profile-registry";

afterEach(() => {
  cleanup();
});

function unknownQuantity() {
  return { status: "unknown" as const };
}

function knownQuantity(value: number) {
  return { status: "known" as const, value };
}

function unavailableProvider() {
  return {
    availability: "unavailable" as const,
    deviceClass: "unknown" as const,
    dedicatedMemoryMiB: unknownQuantity(),
    availableDedicatedMemoryMiB: unknownQuantity(),
    precisions: {
      float32: "unavailable" as const,
      float16: "unavailable" as const,
      bfloat16: "unavailable" as const,
      int8: "unavailable" as const,
    },
  };
}

function compatibleReport() {
  return decodeHostProfileCompatibilityReportV1({
    schemaVersion: 1,
    probeStatus: "complete",
    platform: {
      operatingSystem: "windows",
      architecture: "x86_64",
    },
    processor: { logicalProcessorCount: knownQuantity(12) },
    memory: {
      totalPhysicalMiB: knownQuantity(24_576),
      availablePhysicalMiB: knownQuantity(16_384),
    },
    storage: {
      applicationVolumeAvailableMiB: knownQuantity(40_960),
    },
    providers: {
      cpu: {
        availability: "available",
        deviceClass: "cpu",
        dedicatedMemoryMiB: knownQuantity(0),
        availableDedicatedMemoryMiB: knownQuantity(0),
        precisions: {
          float32: "available",
          float16: "unknown",
          bfloat16: "unknown",
          int8: "unknown",
        },
      },
      cuda: {
        availability: "available",
        deviceClass: "discrete-gpu",
        dedicatedMemoryMiB: knownQuantity(12_288),
        availableDedicatedMemoryMiB: knownQuantity(9_216),
        precisions: {
          float32: "available",
          float16: "available",
          bfloat16: "available",
          int8: "unknown",
        },
      },
      directml: {
        availability: "unknown",
        deviceClass: "unknown",
        dedicatedMemoryMiB: unknownQuantity(),
        availableDedicatedMemoryMiB: unknownQuantity(),
        precisions: {
          float32: "unknown",
          float16: "unknown",
          bfloat16: "unknown",
          int8: "unknown",
        },
      },
      rocm: unavailableProvider(),
      metal: unavailableProvider(),
    },
  });
}

function preference(): HardwareProfilePreferenceRepository {
  return {
    read: vi.fn(async () => ({ status: "missing" as const })),
    write: vi.fn(async () => ({ status: "saved" as const })),
  };
}

function coordinator(
  options: {
    gate?: "available" | "unavailable";
    preference?: HardwareProfilePreferenceRepository;
  } = {},
) {
  return new HardwareProfileCompatibilityCoordinator({
    detector: { detect: vi.fn(async () => compatibleReport()) },
    developmentGate: {
      exactDemoAvailability: vi.fn(
        async () => options.gate ?? ("available" as const),
      ),
    },
    preferenceRepository: options.preference ?? preference(),
  });
}

describe("hardware compatibility controls", () => {
  it("announces the closed status and exposes only admitted selection controls", async () => {
    const subject = coordinator();
    render(<HardwareCompatibilityControls coordinator={subject} />);

    expect(
      screen.getByText("Checking local narration compatibility."),
    ).toHaveAttribute("aria-live", "polite");
    await waitFor(() =>
      expect(
        screen.getByText(
          "A development-only local narration profile is available.",
        ),
      ).toBeInTheDocument(),
    );

    const summary = screen
      .getByText("Local narration compatibility")
      .closest("summary");
    expect(summary).not.toBeNull();
    fireEvent.click(summary!);

    const profile = screen.getByRole("radio", {
      name: "Qwen and Serena development profile",
    });
    expect(profile).toBeChecked();
    expect(
      screen.queryByRole("radio", {
        name: "Supertonic and F1 evaluated profile",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("No measured CPU fallback is available."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "Measured narration profiles" }),
    ).toHaveTextContent(
      "This profile did not pass the required product evaluation.",
    );
  });

  it("supports explicit keyboard-focus-safe selection and recheck", async () => {
    const preferenceRepository = preference();
    const subject = coordinator({ preference: preferenceRepository });
    render(<HardwareCompatibilityControls coordinator={subject} />);
    await waitFor(() =>
      expect(subject.observe().status).toBe("development-only"),
    );
    fireEvent.click(
      screen.getByText("Local narration compatibility").closest("summary")!,
    );

    const profile = screen.getByRole("radio", {
      name: "Qwen and Serena development profile",
    });
    fireEvent.click(profile);
    await waitFor(() =>
      expect(preferenceRepository.write).toHaveBeenCalledWith(
        EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
      ),
    );

    const recheck = screen.getByRole("button", {
      name: "Check compatibility again",
    });
    recheck.focus();
    fireEvent.click(recheck);
    expect(recheck).toHaveFocus();
    await waitFor(() => expect(recheck).toBeEnabled());
    expect(recheck).toHaveFocus();
  });

  it("keeps unavailable and failure presentation content-free", async () => {
    const unavailable = coordinator({ gate: "unavailable" });
    const { unmount } = render(
      <HardwareCompatibilityControls coordinator={unavailable} />,
    );
    await waitFor(() =>
      expect(
        screen.getByText("Local narration is unavailable on this device."),
      ).toBeInTheDocument(),
    );
    expect(document.body.textContent).not.toContain("24576");
    expect(document.body.textContent).not.toContain("C:\\");
    unmount();

    const failed = new HardwareProfileCompatibilityCoordinator({
      detector: {
        detect: vi.fn(async () => {
          throw new Error("private-adapter-name");
        }),
      },
      developmentGate: {
        exactDemoAvailability: vi.fn(async () => "available" as const),
      },
      preferenceRepository: preference(),
    });
    render(<HardwareCompatibilityControls coordinator={failed} />);
    await waitFor(() =>
      expect(
        screen.getByText("The local narration compatibility check failed."),
      ).toBeInTheDocument(),
    );
    expect(document.body.textContent).not.toContain("private-adapter-name");
  });

  it("has explicit reduced-motion, forced-color, and focus treatment", () => {
    const styles = readFileSync(
      resolve(import.meta.dirname, "../styles.css"),
      "utf8",
    );
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.hardware-compatibility/,
    );
    expect(styles).toContain("@media (forced-colors: active)");
    expect(styles).toMatch(
      /@media \(forced-colors: active\)[\s\S]*\.hardware-compatibility/,
    );
    expect(styles).toContain(".hardware-compatibility summary:focus-visible");
  });
});
