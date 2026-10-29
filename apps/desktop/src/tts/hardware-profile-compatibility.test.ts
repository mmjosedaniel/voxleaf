import { decodeHostProfileCompatibilityReportV1 } from "@voxleaf/shared";
import { describe, expect, it, vi } from "vitest";

import {
  createWebStorageHardwareProfilePreferenceRepository,
  type HardwareProfilePreferenceRepository,
} from "../persistence/hardware-profile-preference";
import type { NarrationLanguagePreferenceRepository } from "../persistence/narration-language-preference";
import {
  HardwareProfileCompatibilityCoordinator,
  CHATTERBOX_ACQUISITION_PROFILE_ID,
  chatterboxAcquisitionPresentation,
  type HardwareDevelopmentGatePort,
  type HardwareProfileDetectionPort,
} from "./hardware-profile-compatibility";
import {
  EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
  HARDWARE_PROFILE_REGISTRY_V1,
  PIPER_CPU_FALLBACK_PROFILE_ID,
  PIPER_ENGLISH_CPU_PROFILE_ID,
} from "./hardware-profile-registry";

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

function completeReport(availableRamMiB = 16_384) {
  return decodeHostProfileCompatibilityReportV1({
    cudaComputeCapability: { status: "known", major: 12, minor: 0 },
    schemaVersion: 1,
    probeStatus: "complete",
    platform: {
      operatingSystem: "windows",
      architecture: "x86_64",
    },
    processor: {
      logicalProcessorCount: knownQuantity(12),
    },
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

function partialReport() {
  const value = {
    ...completeReport(),
    probeStatus: "partial",
    memory: {
      ...completeReport().memory,
      availablePhysicalMiB: unknownQuantity(),
    },
  };
  return decodeHostProfileCompatibilityReportV1(value);
}

function preference(
  readResult: Awaited<
    ReturnType<HardwareProfilePreferenceRepository["read"]>
  > = {
    status: "missing",
  },
): HardwareProfilePreferenceRepository {
  return {
    read: vi.fn(async () => readResult),
    write: vi.fn(async () => ({ status: "saved" as const })),
  };
}

function languagePreference(
  language: "es" | "en" = "es",
): NarrationLanguagePreferenceRepository {
  let selectedLanguage = language;
  return {
    read: vi.fn(async () => ({
      status: "ready" as const,
      language: selectedLanguage,
    })),
    write: vi.fn(async (nextLanguage) => {
      selectedLanguage = nextLanguage;
      return { status: "saved" as const };
    }),
    reset: vi.fn(async () => {
      selectedLanguage = "en";
      return { status: "saved" as const };
    }),
  };
}

function dependencies(
  options: {
    report?: ReturnType<typeof completeReport>;
    detector?: HardwareProfileDetectionPort;
    gate?: "available" | "unavailable";
    preference?: HardwareProfilePreferenceRepository;
    languagePreference?: NarrationLanguagePreferenceRepository;
  } = {},
) {
  const detector =
    options.detector ??
    ({
      detect: vi.fn(async () => options.report ?? completeReport()),
    } satisfies HardwareProfileDetectionPort);
  const developmentGate = {
    exactDemoAvailability: vi.fn(
      async () => options.gate ?? ("available" as const),
    ),
  } satisfies HardwareDevelopmentGatePort;
  const preferenceRepository = options.preference ?? preference();
  const languagePreferenceRepository =
    options.languagePreference ?? languagePreference();
  return {
    detector,
    developmentGate,
    preferenceRepository,
    languagePreferenceRepository,
  };
}

describe("hardware profile compatibility coordinator", () => {
  it.each(["available", "unavailable", "wrong-language"] as const)(
    "RAC-04 reports CPU fallback independently of retained Chatterbox: %s",
    async (fallback) => {
      const report = completeReport();
      const subject = new HardwareProfileCompatibilityCoordinator({
        ...dependencies({
          report:
            fallback === "unavailable"
              ? decodeHostProfileCompatibilityReportV1({
                  ...report,
                  providers: {
                    ...report.providers,
                    cpu: unavailableProvider(),
                  },
                })
              : report,
          preference: preference({
            status: "ready",
            profileId: CHATTERBOX_ACQUISITION_PROFILE_ID,
          }),
          languagePreference: languagePreference("es"),
        }),
        ...(fallback === "wrong-language"
          ? {
              registry: HARDWARE_PROFILE_REGISTRY_V1.filter(
                (profile) =>
                  profile.identity.profileId !== PIPER_ENGLISH_CPU_PROFILE_ID,
              ),
            }
          : {}),
      });
      await subject.ensureChecked();
      for (const language of ["en", "es", "en"] as const) {
        await subject.selectLanguage(language);
        expect(subject.observe()).toMatchObject({
          activeProfileId: CHATTERBOX_ACQUISITION_PROFILE_ID,
          fallbackAvailable:
            fallback === "available" ||
            (fallback === "wrong-language" && language === "es"),
        });
      }
      await subject.resetLanguage();
      expect(subject.observe()).toMatchObject({
        activeProfileId: CHATTERBOX_ACQUISITION_PROFILE_ID,
        language: "en",
        fallbackAvailable: fallback === "available",
      });
      subject.close();
    },
  );
  it("CHAT-AUDIT R1 unknown CUDA free memory preserves Piper admission and continuation", async () => {
    let current = completeReport();
    const subject = new HardwareProfileCompatibilityCoordinator(
      dependencies({
        detector: { detect: async () => current },
        preference: preference({
          status: "ready",
          profileId: PIPER_ENGLISH_CPU_PROFILE_ID,
        }),
        languagePreference: languagePreference("en"),
      }),
    );
    await subject.ensureChecked();
    current = decodeHostProfileCompatibilityReportV1({
      ...current,
      providers: {
        ...current.providers,
        cuda: {
          ...current.providers.cuda,
          availableDedicatedMemoryMiB: unknownQuantity(),
        },
      },
    });
    try {
      const snapshot = await subject.check("operating-system-resume");
      expect(snapshot.activeProfileId).toBe(PIPER_ENGLISH_CPU_PROFILE_ID);
      expect(
        subject.isProfileCurrentlyAllowed(PIPER_ENGLISH_CPU_PROFILE_ID),
      ).toBe(true);
      expect(
        subject.isProfileContinuationAllowed(PIPER_ENGLISH_CPU_PROFILE_ID),
      ).toBe(true);
      expect(
        await subject.isProfileStartAllowed(
          PIPER_ENGLISH_CPU_PROFILE_ID,
          "before-profile-start",
          "en",
        ),
      ).toBe(true);
      expect(chatterboxAcquisitionPresentation(snapshot).allowed).toBe(false);
    } finally {
      subject.close();
    }
  });

  it("CHAT-AUDIT F06 evaluates continuation separately from admission after a resource recheck", async () => {
    let availableRam = 16_384;
    const dependency = dependencies({
      detector: { detect: async () => completeReport(availableRam) },
      preference: preference({
        status: "ready",
        profileId: PIPER_ENGLISH_CPU_PROFILE_ID,
      }),
      languagePreference: languagePreference("en"),
    });
    const coordinator = new HardwareProfileCompatibilityCoordinator(dependency);
    await coordinator.ensureChecked();
    expect(
      coordinator.isProfileCurrentlyAllowed(PIPER_ENGLISH_CPU_PROFILE_ID),
    ).toBe(true);
    availableRam = 1;
    await coordinator.check("operating-system-resume");
    expect(
      coordinator.isProfileCurrentlyAllowed(PIPER_ENGLISH_CPU_PROFILE_ID),
    ).toBe(false);
    expect(
      coordinator.isProfileContinuationAllowed(PIPER_ENGLISH_CPU_PROFILE_ID),
    ).toBe(true);
    expect(
      await coordinator.isProfileStartAllowed(
        PIPER_ENGLISH_CPU_PROFILE_ID,
        "before-profile-start",
        "en",
      ),
    ).toBe(false);
    availableRam = 0;
    await coordinator.check("operating-system-resume");
    expect(
      coordinator.isProfileContinuationAllowed(PIPER_ENGLISH_CPU_PROFILE_ID),
    ).toBe(false);
    coordinator.close();
  });
  it("recommends the admitted CPU fallback while retaining the exact development profile", async () => {
    const subject = new HardwareProfileCompatibilityCoordinator(dependencies());

    const snapshot = await subject.check("application-start");

    expect(snapshot.status).toBe("compatible");
    expect(snapshot.activeProfileId).toBe(PIPER_CPU_FALLBACK_PROFILE_ID);
    expect(snapshot.selectionSource).toBe("recommendation");
    expect(snapshot.fallbackAvailable).toBe(true);
    expect(snapshot.profiles).toHaveLength(7);
  });

  it("admits Chatterbox acquisition from its exact supported profile, not the active Piper selection", async () => {
    const snapshot = await new HardwareProfileCompatibilityCoordinator(
      dependencies(),
    ).check("application-start");

    expect(snapshot.activeProfileId).toBe(PIPER_CPU_FALLBACK_PROFILE_ID);
    expect(chatterboxAcquisitionPresentation(snapshot)).toEqual({
      allowed: true,
      message: "",
    });
  });

  it("blocks Chatterbox acquisition at one-below capacity and unknown facts", async () => {
    const snapshot = await new HardwareProfileCompatibilityCoordinator(
      dependencies(),
    ).check("application-start");
    const oneBelow = {
      ...snapshot,
      profiles: snapshot.profiles.map((profile) =>
        profile.profileId === "chatterbox-multilingual-v3-cuda-bf16-default-v4"
          ? { ...profile, state: "incompatible" as const }
          : profile,
      ),
    };
    const unknown = {
      ...snapshot,
      profiles: snapshot.profiles.map((profile) =>
        profile.profileId === "chatterbox-multilingual-v3-cuda-bf16-default-v4"
          ? { ...profile, state: "unknown" as const }
          : profile,
      ),
    };

    expect(chatterboxAcquisitionPresentation(oneBelow).allowed).toBe(false);
    expect(chatterboxAcquisitionPresentation(oneBelow).message).toMatch(
      /does not currently meet/,
    );
    expect(chatterboxAcquisitionPresentation(unknown).allowed).toBe(false);
    expect(chatterboxAcquisitionPresentation(unknown).message).toMatch(
      /not established/,
    );
  });

  it.each([
    [
      "insufficient capacity",
      dependencies({
        report: completeReport(0),
        gate: "unavailable",
      }),
      "unavailable",
    ],
    [
      "partial facts",
      dependencies({
        detector: { detect: vi.fn(async () => partialReport()) },
      }),
      "unknown",
    ],
    [
      "probe failure",
      dependencies({
        detector: {
          detect: vi.fn(async () => {
            throw new Error("private native detail");
          }),
        },
      }),
      "failed",
    ],
  ] as const)("maps %s to the closed %s state", async (_name, deps, status) => {
    const snapshot = await new HardwareProfileCompatibilityCoordinator(
      deps,
    ).check("application-start");

    expect(snapshot.status).toBe(status);
    expect(JSON.stringify(snapshot)).not.toContain("private native detail");
  });

  it("permits one concurrent probe and reuses the same in-flight result", async () => {
    let resolveReport:
      ((value: ReturnType<typeof completeReport>) => void) | undefined;
    const detect = vi.fn(
      () =>
        new Promise<ReturnType<typeof completeReport>>((resolve) => {
          resolveReport = resolve;
        }),
    );
    const subject = new HardwareProfileCompatibilityCoordinator(
      dependencies({ detector: { detect } }),
    );

    const first = subject.check("application-start");
    const second = subject.check("explicit-recheck");
    expect(first).toBe(second);
    expect(detect).toHaveBeenCalledOnce();
    resolveReport!(completeReport());
    await expect(first).resolves.toMatchObject({
      status: "compatible",
    });
  });

  it("reprobes immediately before profile start and fails closed when capacity changed", async () => {
    const detect = vi
      .fn()
      .mockResolvedValueOnce(completeReport())
      .mockResolvedValueOnce(completeReport(128));
    const subject = new HardwareProfileCompatibilityCoordinator(
      dependencies({ detector: { detect } }),
    );

    await expect(
      subject.isProfileStartAllowed(
        PIPER_CPU_FALLBACK_PROFILE_ID,
        "application-start",
      ),
    ).resolves.toBe(true);
    await expect(
      subject.isProfileStartAllowed(
        PIPER_CPU_FALLBACK_PROFILE_ID,
        "before-profile-start",
      ),
    ).resolves.toBe(false);
    expect(detect).toHaveBeenCalledTimes(2);
    expect(subject.observe()).toMatchObject({
      status: "unavailable",
      reason: "available-ram",
    });
  });

  it("persists only an admitted compatible explicit selection", async () => {
    const preferenceRepository = preference();
    const subject = new HardwareProfileCompatibilityCoordinator(
      dependencies({ preference: preferenceRepository }),
    );
    await subject.check("application-start");

    await expect(
      subject.selectProfile(EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID),
    ).resolves.toBe(true);
    expect(preferenceRepository.write).toHaveBeenCalledWith(
      EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
    );
    expect(subject.observe()).toMatchObject({
      status: "development-only",
      reason: undefined,
      selectionSource: "preference",
      preferenceStatus: "used",
    });
    await expect(
      subject.selectProfile("supertonic-3-onnx-cpu-f1-es-v1"),
    ).resolves.toBe(false);
    expect(preferenceRepository.write).toHaveBeenCalledOnce();
    await expect(
      subject.selectProfile(PIPER_CPU_FALLBACK_PROFILE_ID),
    ).resolves.toBe(true);
    expect(subject.observe().status).toBe("compatible");
  });

  it("SAC-03 applies an explicit profile after malformed stored JSON", async () => {
    let value = "{";
    const preferenceRepository =
      createWebStorageHardwareProfilePreferenceRepository({
        storage: () => ({
          getItem: () => value,
          setItem: (_key, next) => {
            value = next;
          },
        }),
      });
    const subject = new HardwareProfileCompatibilityCoordinator(
      dependencies({ preference: preferenceRepository }),
    );
    await subject.check("application-start");
    await expect(
      subject.selectProfile(PIPER_CPU_FALLBACK_PROFILE_ID),
    ).resolves.toBe(true);
    expect(subject.observe()).toMatchObject({
      status: "compatible",
      selectionSource: "preference",
      preferenceStatus: "used",
    });
    await expect(preferenceRepository.read()).resolves.toEqual({
      status: "ready",
      profileId: PIPER_CPU_FALLBACK_PROFILE_ID,
    });
  });

  it.each(["select", "reset"] as const)(
    "preserves a successful language %s while an older probe settles",
    async (action) => {
      let finishReport!: (report: ReturnType<typeof completeReport>) => void;
      const detector = {
        detect: vi.fn(async () => completeReport()),
      };
      const language = languagePreference(action === "select" ? "en" : "es");
      const subject = new HardwareProfileCompatibilityCoordinator(
        dependencies({ detector, languagePreference: language }),
      );
      await subject.ensureChecked();
      detector.detect.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishReport = resolve;
          }),
      );
      const probe = subject.check("operating-system-resume");
      const expectedLanguage = action === "select" ? "es" : "en";
      expect(
        await (action === "select"
          ? subject.selectLanguage("es")
          : subject.resetLanguage()),
      ).toBe(true);
      finishReport(completeReport());
      await probe;
      expect(subject.observe()).toMatchObject({
        language: expectedLanguage,
        status: "compatible",
        activeProfileId:
          expectedLanguage === "es"
            ? PIPER_CPU_FALLBACK_PROFILE_ID
            : PIPER_ENGLISH_CPU_PROFILE_ID,
      });
      expect(await language.read()).toMatchObject({
        language: expectedLanguage,
      });
      subject.close();
    },
  );

  it.each([16_384, 0])(
    "reconciles a newer profile preference with fresh %i MiB hardware facts",
    async (availableRam) => {
      let finishReport!: (report: ReturnType<typeof completeReport>) => void;
      const detector = { detect: vi.fn(async () => completeReport()) };
      const subject = new HardwareProfileCompatibilityCoordinator(
        dependencies({ detector }),
      );
      await subject.ensureChecked();
      detector.detect.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishReport = resolve;
          }),
      );
      const probe = subject.check("operating-system-resume");
      expect(
        await subject.selectProfile(EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID),
      ).toBe(true);
      finishReport(completeReport(availableRam));
      await probe;
      expect(subject.observe()).toMatchObject(
        availableRam === 0
          ? { status: "unavailable", activeProfileId: undefined }
          : {
              status: "development-only",
              activeProfileId: EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
              preferenceStatus: "used",
            },
      );
      subject.close();
    },
  );

  it.each(["restored", "selected", "during-probe", "future-version"] as const)(
    "VCA-04 preserves %s preferences across rejection and a later recheck",
    async (scenario) => {
      let rejectReport!: (error: Error) => void;
      const detector = { detect: vi.fn(async () => completeReport()) };
      const language = languagePreference(
        scenario === "selected" ? "en" : "es",
      );
      const profile = preference(
        scenario === "future-version"
          ? { status: "unsupported-version" }
          : { status: "missing" },
      );
      if (scenario === "future-version") {
        vi.mocked(language.read).mockResolvedValue({
          status: "unsupported-version",
          language: "en",
        });
      }
      const subject = new HardwareProfileCompatibilityCoordinator(
        dependencies({
          detector,
          languagePreference: language,
          preference: profile,
        }),
      );
      await subject.ensureChecked();
      if (scenario === "selected") await subject.selectLanguage("es");
      detector.detect.mockImplementationOnce(
        () =>
          new Promise((_resolve, reject) => {
            rejectReport = reject;
          }),
      );
      const probe = subject.check("explicit-recheck");
      expect(subject.check("operating-system-resume")).toBe(probe);
      if (scenario === "during-probe") await subject.selectLanguage("en");
      rejectReport(new Error("synthetic host probe failure"));
      await probe;
      const expectedLanguage =
        scenario === "future-version" || scenario === "during-probe"
          ? "en"
          : "es";
      expect(subject.observe()).toMatchObject({
        status: "failed",
        language: expectedLanguage,
        activeProfileId: undefined,
        canPersistLanguage: scenario !== "future-version",
        canPersistSelection: scenario !== "future-version",
        languagePreferenceStatus:
          scenario === "future-version" ? "unsupported-version" : "ready",
      });
      if (scenario === "future-version") {
        expect(await subject.selectLanguage("es")).toBe(false);
        expect(language.write).not.toHaveBeenCalled();
      }
      await subject.check("explicit-recheck");
      expect(subject.observe()).toMatchObject({
        status: "compatible",
        language: expectedLanguage,
      });
      subject.close();
    },
  );

  it("preserves a newer language when the pending host probe fails", async () => {
    let rejectReport!: (error: Error) => void;
    const detector = { detect: vi.fn(async () => completeReport()) };
    const subject = new HardwareProfileCompatibilityCoordinator(
      dependencies({ detector, languagePreference: languagePreference("en") }),
    );
    await subject.ensureChecked();
    detector.detect.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectReport = reject;
        }),
    );
    const probe = subject.check("operating-system-resume");
    expect(await subject.selectLanguage("es")).toBe(true);
    rejectReport(new Error("synthetic host probe failure"));
    await probe;
    expect(subject.observe()).toMatchObject({
      status: "failed",
      language: "es",
      languagePreferenceStatus: "ready",
      activeProfileId: undefined,
    });
    subject.close();
  });

  it("does not use a stale or future-version preference", async () => {
    const stale = new HardwareProfileCompatibilityCoordinator(
      dependencies({
        preference: preference({
          status: "ready",
          profileId: "removed-profile",
        }),
      }),
    );
    await stale.check("application-start");
    expect(stale.observe()).toMatchObject({
      status: "compatible",
      preferenceStatus: "stale",
      selectionSource: "recommendation",
    });

    const futurePreference = preference({ status: "unsupported-version" });
    const future = new HardwareProfileCompatibilityCoordinator(
      dependencies({ preference: futurePreference }),
    );
    await future.check("application-start");
    expect(future.observe().canPersistSelection).toBe(false);
    await expect(
      future.selectProfile(EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID),
    ).resolves.toBe(false);
    expect(futurePreference.write).not.toHaveBeenCalled();
  });

  it("persists explicit English, selects its admitted CPU profile, and rejects a wrong-language start", async () => {
    const languageRepository = languagePreference();
    const subject = new HardwareProfileCompatibilityCoordinator(
      dependencies({ languagePreference: languageRepository }),
    );
    await subject.check("application-start");

    await expect(subject.selectLanguage("en")).resolves.toBe(true);
    expect(languageRepository.write).toHaveBeenCalledWith("en");
    expect(subject.observe()).toMatchObject({
      language: "en",
      languagePreferenceStatus: "ready",
      activeProfileId: PIPER_ENGLISH_CPU_PROFILE_ID,
      status: "compatible",
      languageReason: undefined,
      fallbackAvailable: true,
    });
    await expect(
      subject.selectProfile(PIPER_CPU_FALLBACK_PROFILE_ID),
    ).resolves.toBe(false);
    await expect(
      subject.isProfileStartAllowed(
        PIPER_ENGLISH_CPU_PROFILE_ID,
        "before-profile-start",
        "en",
      ),
    ).resolves.toBe(true);
  });

  it("resets language explicitly to English and selects an English profile", async () => {
    const languageRepository = languagePreference("es");
    const subject = new HardwareProfileCompatibilityCoordinator(
      dependencies({ languagePreference: languageRepository }),
    );
    await subject.check("application-start");

    await expect(subject.resetLanguage()).resolves.toBe(true);
    expect(languageRepository.reset).toHaveBeenCalledOnce();
    expect(subject.observe()).toMatchObject({
      language: "en",
      languagePreferenceStatus: "ready",
      activeProfileId: PIPER_ENGLISH_CPU_PROFILE_ID,
      status: "compatible",
    });
  });

  it("restores English explicitly and fails future language state closed to English", async () => {
    const english = new HardwareProfileCompatibilityCoordinator(
      dependencies({ languagePreference: languagePreference("en") }),
    );
    await english.check("application-start");
    expect(english.observe()).toMatchObject({
      language: "en",
      activeProfileId: PIPER_ENGLISH_CPU_PROFILE_ID,
      status: "compatible",
    });

    const futureRepository: NarrationLanguagePreferenceRepository = {
      read: vi.fn(async () => ({
        status: "unsupported-version" as const,
        language: "en" as const,
      })),
      write: vi.fn(async () => ({ status: "saved" as const })),
      reset: vi.fn(async () => ({ status: "unsupported-version" as const })),
    };
    const future = new HardwareProfileCompatibilityCoordinator(
      dependencies({ languagePreference: futureRepository }),
    );
    await future.check("application-start");
    expect(future.observe()).toMatchObject({
      language: "en",
      canPersistLanguage: false,
      activeProfileId: PIPER_ENGLISH_CPU_PROFILE_ID,
    });
    await expect(future.selectLanguage("en")).resolves.toBe(false);
    expect(futureRepository.write).not.toHaveBeenCalled();
  });
});
