import type { HardwareProfileRegistryEntryV1 } from "./hardware-profile-authority";

export const EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID =
  "qwen3-tts-1-7b-customvoice-cuda-bf16-serena-es-v8";
export const EXACT_QWEN_AIDEN_DEVELOPMENT_PROFILE_ID =
  "qwen3-tts-1-7b-customvoice-cuda-bf16-aiden-en-v8";
export const PIPER_CPU_FALLBACK_PROFILE_ID =
  "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1";
export const PIPER_ENGLISH_CPU_PROFILE_ID =
  "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1";
export const CHATTERBOX_BILINGUAL_PROFILE_ID =
  "chatterbox-multilingual-v3-cuda-bf16-default-v4";

function profileEntry(
  entry: HardwareProfileRegistryEntryV1,
): HardwareProfileRegistryEntryV1 {
  return Object.freeze({
    ...entry,
    identity: Object.freeze({ ...entry.identity }),
    requirements: Object.freeze({
      ...entry.requirements,
      operatingSystems: Object.freeze([...entry.requirements.operatingSystems]),
      architectures: Object.freeze([...entry.requirements.architectures]),
      deviceClasses: Object.freeze([...entry.requirements.deviceClasses]),
    }),
    evidence: Object.freeze({
      ...entry.evidence,
      gates: Object.freeze({ ...entry.evidence.gates }),
    }),
  });
}

/**
 * Product-owned profile registry v1.
 *
 * The resource observations are rounded up from the byte measurements in the
 * bound result records. A registry entry is evidence, not a support claim:
 * only the supportState and the deterministic matcher may admit it.
 */
export const HARDWARE_PROFILE_REGISTRY_V1 = Object.freeze([
  profileEntry({
    registryVersion: 1,
    identity: {
      profileId: PIPER_CPU_FALLBACK_PROFILE_ID,
      engineId: "piper-tts",
      engineVersion: "1.4.2",
      modelId: "rhasspy/piper-voices",
      modelRevision: "0d907f158acc877ddeebcbf827659ee13bea8bcd",
      voiceId: "es_ES-davefx-medium",
      runtimeId: "cpython-onnxruntime-cpu",
      runtimeVersion: "python-3.12.10|piper-tts-1.4.2|onnxruntime-1.27.0",
      generationConfigurationSha256:
        "9e9b1a93aed70cfdbdd8dd8141d2a7edb363530372387d7596bb4ef8d46bd918",
    },
    role: "cpu-fallback",
    supportState: "supported",
    requirements: {
      operatingSystems: ["windows"],
      architectures: ["x86_64"],
      minimumLogicalProcessors: 1,
      provider: "cpu",
      precision: "float32",
      deviceClasses: ["cpu"],
      measuredPeakRamMiB: 393,
      measuredPeakDedicatedVramMiB: 0,
      measuredArtifactFootprintMiB: 166,
    },
    evidence: {
      authorityCommitSha: "9a2f74845853e84635b419a4e65170c9a2c207ee",
      authoritySha256:
        "ec0ef6aceedfc2ed4df199cc276b5c8365f979921311a7d2cd3d813546e1bd48",
      resultCommitSha: "f19f440eb05f63b090bd56113b9d48338779a59f",
      resultSha256:
        "8d8005f3909517276faecacda859db48714a497ccd3a2a92797a7cedb3eb38f8",
      decisionSha256:
        "678104e655ca9ef1b17b7bdfc89c6bb4bf4f4a684045cc15a6d5d0a83f945d8d",
      gates: {
        startup: "pass",
        throughput: "pass",
        cancellation: "pass",
        memory: "pass",
        quality: "pass",
        offline: "pass",
        cleanup: "pass",
        license: "pass",
        packaging: "pass",
      },
    },
  }),
  profileEntry({
    registryVersion: 1,
    identity: {
      profileId: EXACT_QWEN_AIDEN_DEVELOPMENT_PROFILE_ID,
      engineId: "qwen-tts",
      engineVersion: "0.1.1",
      modelId: "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
      modelRevision: "0c0e3051f131929182e2c023b9537f8b1c68adfe",
      voiceId: "Aiden",
      runtimeId: "cpython-pytorch-cuda-sdpa",
      runtimeVersion: "python-3.12.10|torch-2.9.1+cu128|torchaudio-2.9.1+cu128",
      generationConfigurationSha256:
        "1bdfc746b80110c44acc04636bbbda5d4fcec1ae99969d7d25ef3af0a1724812",
    },
    role: "development-demo",
    supportState: "development-only",
    requirements: {
      operatingSystems: ["windows"],
      architectures: ["x86_64"],
      minimumLogicalProcessors: 8,
      provider: "cuda",
      precision: "bfloat16",
      deviceClasses: ["discrete-gpu"],
      measuredPeakRamMiB: 4_433,
      measuredPeakDedicatedVramMiB: 4_570,
      measuredArtifactFootprintMiB: 9_297,
      minimumTotalRamMiB: 10_570,
      minimumAvailableRamMiB: 6_474,
      minimumTotalDedicatedVramMiB: 7_196,
      minimumAvailableDedicatedVramMiB: 6_508,
      minimumAvailableStorageMiB: 11_345,
    },
    evidence: {
      authorityCommitSha: "0b90fa2c16cdb276550ad3c3a58a2d84e1509876",
      authoritySha256:
        "b4144299538225bdac86983493b3a64b8cf2a8c291403aca21dfafe7d33cc267",
      resultCommitSha: "3c7ace1f9cb02341c26b0ecf921d99031cd6010b",
      resultSha256:
        "9ad66e1d3bc73678b58fde7984c49b485cd31dacc5c3d0ed5df7e54fa70b2215",
      decisionSha256:
        "64f54f73868c145c09752ad19c05f5d4791cd8e51117afad82b3bf21c1e3924d",
      gates: {
        startup: "pass",
        throughput: "pass",
        cancellation: "fail",
        memory: "pass",
        quality: "pass",
        offline: "pass",
        cleanup: "pass",
        license: "pass",
        packaging: "pass",
      },
    },
  }),
  profileEntry({
    registryVersion: 1,
    identity: {
      profileId: PIPER_ENGLISH_CPU_PROFILE_ID,
      engineId: "piper-tts",
      engineVersion: "1.4.2",
      modelId: "rhasspy/piper-voices",
      modelRevision: "0d907f158acc877ddeebcbf827659ee13bea8bcd",
      voiceId: "en_US-joe-medium",
      runtimeId: "cpython-onnxruntime-cpu",
      runtimeVersion: "python-3.12.10|piper-tts-1.4.2|onnxruntime-1.27.0",
      generationConfigurationSha256:
        "be801c25b081523bcdffe299ecc0bb09a13c4fe3e10474c7c3d5ac953c18ace2",
    },
    role: "cpu-fallback",
    supportState: "supported",
    requirements: {
      operatingSystems: ["windows"],
      architectures: ["x86_64"],
      minimumLogicalProcessors: 4,
      provider: "cpu",
      precision: "float32",
      deviceClasses: ["cpu"],
      measuredPeakRamMiB: 412,
      measuredPeakDedicatedVramMiB: 0,
      measuredArtifactFootprintMiB: 167,
      minimumTotalRamMiB: 8_192,
    },
    evidence: {
      authorityCommitSha: "b66fafa743b84e8a995705ec3bbdf8fed6a9a04e",
      authoritySha256:
        "84448e70e8b8b2782f22c0e3d874b1b30531084732e0416ab9e83e1ad1e7525a",
      resultCommitSha: "bcf6521e13984a65157d8486d77fb6212b0aaa90",
      resultSha256:
        "b0144e3cacc0916c02dcb6b56c6bb6af4cfafe19b9c203da1a95ea8ba208b7aa",
      decisionSha256:
        "64f54f73868c145c09752ad19c05f5d4791cd8e51117afad82b3bf21c1e3924d",
      gates: {
        startup: "pass",
        throughput: "pass",
        cancellation: "pass",
        memory: "pass",
        quality: "pass",
        offline: "pass",
        cleanup: "pass",
        license: "pass",
        packaging: "pass",
      },
    },
  }),
  profileEntry({
    registryVersion: 1,
    identity: {
      profileId: CHATTERBOX_BILINGUAL_PROFILE_ID,
      engineId: "chatterbox-tts",
      engineVersion: "0.1.7",
      modelId: "ResembleAI/chatterbox",
      modelRevision: "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18",
      voiceId: "official-bundled-default-v3",
      runtimeId: "cpython-pytorch-cuda",
      runtimeVersion: "python-3.12.10|torch-2.9.1+cu128|torchaudio-2.9.1+cu128",
      generationConfigurationSha256:
        "58d0ddec0a6b8f3f163e98be11ace48c97563ce06ab32d3e6b34a75d2fd0a5dd",
    },
    role: "standard",
    supportState: "supported",
    requirements: {
      operatingSystems: ["windows"],
      architectures: ["x86_64"],
      minimumLogicalProcessors: 8,
      provider: "cuda",
      precision: "bfloat16",
      deviceClasses: ["discrete-gpu"],
      measuredPeakRamMiB: 4_994,
      measuredPeakDedicatedVramMiB: 3_644,
      measuredArtifactFootprintMiB: 8_211,
      minimumTotalRamMiB: 24_576,
      minimumAvailableRamMiB: 4_096,
      // Chatterbox peaked at 3,644 MiB. The product gate uses that measured
      // peak plus the frozen 1,024-MiB capacity reserve. A 5,632-MiB total
      // floor admits nominal 6-GB devices without claiming they were part of
      // the exact-host evaluation; the evaluated 8-GB class remains the
      // recommendation disclosed by the optional-package flow.
      minimumTotalDedicatedVramMiB: 5_632,
      minimumAvailableDedicatedVramMiB: 4_668,
    },
    evidence: {
      authorityCommitSha: "0b90fa2c16cdb276550ad3c3a58a2d84e1509876",
      authoritySha256:
        "b4144299538225bdac86983493b3a64b8cf2a8c291403aca21dfafe7d33cc267",
      resultCommitSha: "3c7ace1f9cb02341c26b0ecf921d99031cd6010b",
      resultSha256:
        "96301fa9bdd8267e6316e261a2e07756717f2b11eaf7a4771870d0b3be8c7d9e",
      decisionSha256:
        "64f54f73868c145c09752ad19c05f5d4791cd8e51117afad82b3bf21c1e3924d",
      gates: {
        startup: "pass",
        throughput: "pass",
        cancellation: "pass",
        memory: "pass",
        quality: "pass",
        offline: "pass",
        cleanup: "pass",
        license: "pass",
        packaging: "pass",
      },
    },
  }),
  profileEntry({
    registryVersion: 1,
    identity: {
      profileId: EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
      engineId: "qwen-tts",
      engineVersion: "0.1.1",
      modelId: "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
      modelRevision: "0c0e3051f131929182e2c023b9537f8b1c68adfe",
      voiceId: "Serena",
      runtimeId: "cpython-pytorch-cuda-sdpa",
      runtimeVersion: "python-3.12.10|torch-2.9.1+cu128|torchaudio-2.9.1+cu128",
      generationConfigurationSha256:
        "303508e84858e6062623adda0c5a05354c0b5a4c4bf7edda4dca55482d6cc640",
    },
    role: "development-demo",
    supportState: "development-only",
    requirements: {
      operatingSystems: ["windows"],
      architectures: ["x86_64"],
      minimumLogicalProcessors: 8,
      provider: "cuda",
      precision: "bfloat16",
      deviceClasses: ["discrete-gpu"],
      measuredPeakRamMiB: 4_424,
      measuredPeakDedicatedVramMiB: 4_602,
      measuredArtifactFootprintMiB: 9_297,
      minimumTotalRamMiB: 10_570,
      minimumAvailableRamMiB: 6_474,
      minimumTotalDedicatedVramMiB: 7_196,
      minimumAvailableDedicatedVramMiB: 6_508,
      minimumAvailableStorageMiB: 11_345,
    },
    evidence: {
      authorityCommitSha: "0b90fa2c16cdb276550ad3c3a58a2d84e1509876",
      authoritySha256:
        "b4144299538225bdac86983493b3a64b8cf2a8c291403aca21dfafe7d33cc267",
      resultCommitSha: "3c7ace1f9cb02341c26b0ecf921d99031cd6010b",
      resultSha256:
        "d24b3d7c8f734077abbe3a5f17ea4d9d709b4b23e712bcbd341fe1ec00a6e7bb",
      decisionSha256:
        "64f54f73868c145c09752ad19c05f5d4791cd8e51117afad82b3bf21c1e3924d",
      gates: {
        startup: "pass",
        throughput: "pass",
        cancellation: "fail",
        memory: "pass",
        quality: "pass",
        offline: "pass",
        cleanup: "pass",
        license: "pass",
        packaging: "pass",
      },
    },
  }),
  profileEntry({
    registryVersion: 1,
    identity: {
      profileId: "qwen3-tts-0-6b-customvoice-cuda-bf16-v1",
      engineId: "qwen-tts",
      engineVersion: "0.1.1",
      modelId: "Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice",
      modelRevision: "8f9ebcf8826db6eeb9cdd4caa09d575a7f9ce4bd",
      voiceId: "Aiden",
      runtimeId: "cpython-pytorch-cuda-sdpa",
      runtimeVersion: "python-3.12.10|torch-2.9.1+cu128|torchaudio-2.9.1+cu128",
      generationConfigurationSha256:
        "9014cc6595ca617e4134c3cad22570daae89bcd4b800991aaca2a4d84ec79f07",
    },
    role: "standard",
    supportState: "unsupported",
    requirements: {
      operatingSystems: ["windows"],
      architectures: ["x86_64"],
      minimumLogicalProcessors: 1,
      provider: "cuda",
      precision: "bfloat16",
      deviceClasses: ["discrete-gpu"],
      measuredPeakRamMiB: 2_538,
      measuredPeakDedicatedVramMiB: 3_972,
      measuredArtifactFootprintMiB: 7_368,
    },
    evidence: {
      authorityCommitSha: "9d35899ed7909085757efb798de591887f3e7d3d",
      authoritySha256:
        "92384d22a7f8f93761b98448ed24ee3bf829eeb2b32e38aa0f5ac508c201e527",
      resultCommitSha: "8253ff4434d761731d278e57a21c58abd9474a1f",
      resultSha256:
        "517a68f83740906343b47a7df79b306d3581d64f2422c335fd70500cdb3eba1e",
      decisionSha256:
        "64e4f1ba61c555d1597426d18760154b172352bd231c1a797b6cfb830a4b0eeb",
      gates: {
        startup: "fail",
        throughput: "fail",
        cancellation: "fail",
        memory: "pass",
        quality: "fail",
        offline: "pass",
        cleanup: "pass",
        license: "pass",
        packaging: "pass",
      },
    },
  }),
  profileEntry({
    registryVersion: 1,
    identity: {
      profileId: "supertonic-3-onnx-cpu-f1-es-v1",
      engineId: "supertonic",
      engineVersion: "1.3.1",
      modelId: "Supertone/supertonic-3",
      modelRevision: "3cadd1ee6394adea1bd021217a0e650ede09a323",
      voiceId: "F1",
      runtimeId: "cpython-onnxruntime-cpu",
      runtimeVersion: "python-3.12.10|onnxruntime-1.27.0",
      generationConfigurationSha256:
        "581153dd68a79f96ec97b4edc180b5dd508781ebebc885c3f06511261734e658",
    },
    role: "cpu-fallback",
    supportState: "unsupported",
    requirements: {
      operatingSystems: ["windows"],
      architectures: ["x86_64"],
      minimumLogicalProcessors: 1,
      provider: "cpu",
      precision: "float32",
      deviceClasses: ["cpu"],
      measuredPeakRamMiB: 637,
      measuredPeakDedicatedVramMiB: 0,
      measuredArtifactFootprintMiB: 503,
    },
    evidence: {
      authorityCommitSha: "9d35899ed7909085757efb798de591887f3e7d3d",
      authoritySha256:
        "92384d22a7f8f93761b98448ed24ee3bf829eeb2b32e38aa0f5ac508c201e527",
      resultCommitSha: "8253ff4434d761731d278e57a21c58abd9474a1f",
      resultSha256:
        "517a68f83740906343b47a7df79b306d3581d64f2422c335fd70500cdb3eba1e",
      decisionSha256:
        "64e4f1ba61c555d1597426d18760154b172352bd231c1a797b6cfb830a4b0eeb",
      gates: {
        startup: "fail",
        throughput: "pass",
        cancellation: "fail",
        memory: "pass",
        quality: "fail",
        offline: "pass",
        cleanup: "pass",
        license: "pass",
        packaging: "pass",
      },
    },
  }),
] as const satisfies readonly HardwareProfileRegistryEntryV1[]);
