import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { decodeHostProfileCompatibilityReportV1 } from "@voxleaf/shared";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { HardwareProfilePreferenceRepository } from "../persistence/hardware-profile-preference";
import type { NarrationLanguagePreferenceRepository } from "../persistence/narration-language-preference";
import { HardwareCompatibilityControls } from "./HardwareCompatibilityControls";
import { HardwareProfileCompatibilityCoordinator } from "./hardware-profile-compatibility";
import {
  EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
  PIPER_CPU_FALLBACK_PROFILE_ID,
  PIPER_ENGLISH_CPU_PROFILE_ID,
} from "./hardware-profile-registry";

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

function compatibleReport(
  availableRamMiB = 16_384,
  availableDedicatedVramMiB = 9_216,
) {
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
      availablePhysicalMiB: knownQuantity(availableRamMiB),
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
        availableDedicatedMemoryMiB: knownQuantity(availableDedicatedVramMiB),
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

function languagePreference(): NarrationLanguagePreferenceRepository {
  return {
    read: vi.fn(async () => ({
      status: "ready" as const,
      language: "es" as const,
    })),
    write: vi.fn(async () => ({ status: "saved" as const })),
    reset: vi.fn(async () => ({ status: "saved" as const })),
  };
}

function coordinator(
  options: {
    gate?: "available" | "unavailable";
    preference?: HardwareProfilePreferenceRepository;
    availableRamMiB?: number;
    availableDedicatedVramMiB?: number;
    languagePreference?: NarrationLanguagePreferenceRepository;
  } = {},
) {
  return new HardwareProfileCompatibilityCoordinator({
    detector: {
      detect: vi.fn(async () =>
        compatibleReport(
          options.availableRamMiB ?? 16_384,
          options.availableDedicatedVramMiB ?? 9_216,
        ),
      ),
    },
    developmentGate: {
      exactDemoAvailability: vi.fn(
        async () => options.gate ?? ("available" as const),
      ),
    },
    preferenceRepository: options.preference ?? preference(),
    languagePreferenceRepository:
      options.languagePreference ?? languagePreference(),
  });
}

async function ensureChecked(
  subject: HardwareProfileCompatibilityCoordinator,
): Promise<void> {
  await act(async () => {
    await subject.ensureChecked();
  });
}

describe("hardware compatibility controls", () => {
  it("announces the admitted fallback and exposes only admitted selection controls", async () => {
    const subject = coordinator();
    render(
      <>
        <HardwareCompatibilityControls
          coordinator={subject}
          presentation="narration"
        />
        <HardwareCompatibilityControls
          coordinator={subject}
          presentation="device"
        />
      </>,
    );

    expect(
      screen.getByText("Checking local narration compatibility."),
    ).toHaveAttribute("aria-live", "polite");
    await ensureChecked(subject);
    await waitFor(() =>
      expect(
        screen.getByText("Local narration is compatible on this device."),
      ).toBeInTheDocument(),
    );

    const fallback = screen.getByRole("radio", {
      name: "Piper and davefx Spanish fast CPU profile",
    });
    expect(fallback).toBeChecked();
    expect(fallback).toHaveAttribute("value", PIPER_CPU_FALLBACK_PROFILE_ID);
    expect(
      screen.getByRole("radio", {
        name: "Qwen and Serena Spanish quality profile (Development)",
      }),
    ).not.toBeChecked();
    expect(
      screen.queryByRole("radio", {
        name: "Supertonic and F1 evaluated profile",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("A measured CPU fallback is available."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "Measured narration profiles" }),
    ).toHaveTextContent(
      "This profile did not pass the required product evaluation.",
    );
    const qwenProfile = screen
      .getByText("Qwen and Serena Spanish quality profile (Development):")
      .closest("li");
    expect(qwenProfile).toHaveAttribute(
      "data-profile-id",
      EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
    );
    expect(qwenProfile).toHaveAttribute("data-profile-state", "compatible");
    expect(qwenProfile).toHaveAttribute("data-profile-reason", "none");
  });

  it("exposes closed profile diagnostics for exact-host automation", async () => {
    const subject = coordinator({ availableDedicatedVramMiB: 6_507 });
    render(
      <>
        <HardwareCompatibilityControls
          coordinator={subject}
          presentation="narration"
        />
        <HardwareCompatibilityControls
          coordinator={subject}
          presentation="device"
        />
      </>,
    );

    await ensureChecked(subject);
    await waitFor(() => expect(subject.observe().status).toBe("compatible"));

    const qwenProfile = screen
      .getByText("Qwen and Serena Spanish quality profile (Development):")
      .closest("li");
    expect(qwenProfile).toHaveAttribute("data-profile-state", "incompatible");
    expect(qwenProfile).toHaveAttribute(
      "data-profile-reason",
      "available-dedicated-vram",
    );
    expect(qwenProfile).toHaveTextContent(
      "The current free dedicated graphics-memory budget is below this profile's safety reserve.",
    );
    expect(
      screen.queryByRole("radio", {
        name: "Qwen and Serena Spanish quality profile (Development)",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("radio", {
        name: "Piper and davefx Spanish fast CPU profile",
      }),
    ).toBeChecked();
  });

  it("offers development-only Qwen at its frozen available-VRAM boundary", async () => {
    const subject = coordinator({ availableDedicatedVramMiB: 6_508 });
    render(
      <>
        <HardwareCompatibilityControls
          coordinator={subject}
          presentation="narration"
        />
        <HardwareCompatibilityControls
          coordinator={subject}
          presentation="device"
        />
      </>,
    );

    await ensureChecked(subject);
    await waitFor(() => expect(subject.observe().status).toBe("compatible"));

    expect(
      screen.getByRole("radio", {
        name: "Qwen and Serena Spanish quality profile (Development)",
      }),
    ).toBeInTheDocument();
    const qwenProfile = screen
      .getByText("Qwen and Serena Spanish quality profile (Development):")
      .closest("li");
    expect(qwenProfile).toHaveAttribute("data-profile-state", "compatible");
    expect(qwenProfile).toHaveAttribute("data-profile-reason", "none");
  });

  it("supports explicit keyboard-focus-safe selection and recheck", async () => {
    const preferenceRepository = preference();
    const subject = coordinator({ preference: preferenceRepository });
    const onRecoveryEpisodeReset = vi.fn();
    render(
      <>
        <HardwareCompatibilityControls
          coordinator={subject}
          presentation="narration"
          onRecoveryEpisodeReset={onRecoveryEpisodeReset}
        />
        <HardwareCompatibilityControls
          coordinator={subject}
          presentation="device"
          onRecoveryEpisodeReset={onRecoveryEpisodeReset}
        />
      </>,
    );
    await ensureChecked(subject);
    await waitFor(() => expect(subject.observe().status).toBe("compatible"));

    const profile = screen.getByRole("radio", {
      name: "Qwen and Serena Spanish quality profile (Development)",
    });
    fireEvent.click(profile);
    await waitFor(() =>
      expect(preferenceRepository.write).toHaveBeenCalledWith(
        EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
      ),
    );
    expect(onRecoveryEpisodeReset).toHaveBeenCalledTimes(1);

    const recheck = screen.getByRole("button", {
      name: "Check compatibility again",
    });
    recheck.focus();
    fireEvent.click(recheck);
    expect(recheck).toHaveFocus();
    await waitFor(() => expect(recheck).toBeEnabled());
    expect(recheck).toHaveFocus();
    expect(onRecoveryEpisodeReset).toHaveBeenCalledTimes(2);
  });

  it("offers an accessible bilingual radio group and selects the admitted English fallback", async () => {
    const languageRepository = languagePreference();
    const subject = coordinator({ languagePreference: languageRepository });
    render(
      <HardwareCompatibilityControls
        coordinator={subject}
        presentation="narration"
      />,
    );
    await ensureChecked(subject);
    await waitFor(() => expect(subject.observe().status).toBe("compatible"));

    const group = screen.getByRole("group", {
      name: "Narration language",
    });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Spanish" })).toBeChecked();
    const english = screen.getByRole("radio", { name: "English" });
    english.focus();
    fireEvent.click(english);

    await waitFor(() =>
      expect(languageRepository.write).toHaveBeenCalledWith("en"),
    );
    expect(english).toHaveFocus();
    expect(english).toBeChecked();
    expect(
      screen.getByText("The selected narration language is English."),
    ).toHaveAttribute("aria-live", "polite");
    const englishFallback = screen.getByRole("radio", {
      name: "Piper and joe English fast CPU profile",
    });
    expect(englishFallback).toBeChecked();
    expect(englishFallback).toHaveAttribute(
      "value",
      PIPER_ENGLISH_CPU_PROFILE_ID,
    );
    expect(
      screen.queryByRole("radio", {
        name: "Piper and davefx Spanish fast CPU profile",
      }),
    ).not.toBeInTheDocument();
  });

  it("exposes one explicit narration reset that returns language to English", async () => {
    const languageRepository = languagePreference();
    const subject = coordinator({ languagePreference: languageRepository });
    const onResetNarrationSettings = vi.fn(async () => subject.resetLanguage());
    render(
      <HardwareCompatibilityControls
        coordinator={subject}
        presentation="narration"
        onResetNarrationSettings={onResetNarrationSettings}
      />,
    );
    await ensureChecked(subject);
    await waitFor(() => expect(subject.observe().status).toBe("compatible"));

    fireEvent.click(
      screen.getByRole("button", { name: "Reset narration settings" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("radio", { name: "English" })).toBeChecked(),
    );
    expect(onResetNarrationSettings).toHaveBeenCalledOnce();
    expect(languageRepository.reset).toHaveBeenCalledOnce();
  });

  it("keeps unavailable and failure presentation content-free", async () => {
    const unavailable = coordinator({
      gate: "unavailable",
      availableRamMiB: 0,
    });
    const { unmount } = render(
      <HardwareCompatibilityControls
        coordinator={unavailable}
        presentation="device"
      />,
    );
    await ensureChecked(unavailable);
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
    render(
      <HardwareCompatibilityControls
        coordinator={failed}
        presentation="device"
      />,
    );
    await ensureChecked(failed);
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
