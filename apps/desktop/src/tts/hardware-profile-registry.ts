import type { HardwareProfileRegistryEntryV1 } from "./hardware-profile-authority";

export const EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID =
  "qwen3-tts-1-7b-customvoice-cuda-bf16-v1";

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
      profileId: EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
      engineId: "qwen-tts",
      engineVersion: "0.1.1",
      modelId: "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
      modelRevision: "0c0e3051f131929182e2c023b9537f8b1c68adfe",
      voiceId: "Serena",
      runtimeId: "cpython-pytorch-cuda-sdpa",
      runtimeVersion: "python-3.12.10|torch-2.9.1+cu128|torchaudio-2.9.1+cu128",
      generationConfigurationSha256:
        "b689b9b81cc7633687e80030ed172878d89196d57149370a82839e1ec83d61df",
    },
    role: "development-demo",
    supportState: "development-only",
    requirements: {
      operatingSystems: ["windows"],
      architectures: ["x86_64"],
      minimumLogicalProcessors: 1,
      provider: "cuda",
      precision: "bfloat16",
      deviceClasses: ["discrete-gpu"],
      measuredPeakRamMiB: 4_426,
      measuredPeakDedicatedVramMiB: 5_996,
      measuredArtifactFootprintMiB: 9_297,
    },
    evidence: {
      authorityCommitSha: "de2c2dcf856e4eb44de5cf249a4a7d8c256b19b6",
      authoritySha256:
        "7d062a4f662ed95b1cb5ff0a21fc40864f4ac3858cea4314ee612b84c2e08dbe",
      resultCommitSha: "3ba3ada4c2b7dd8295805391974e14f43fae1b64",
      resultSha256:
        "89a2417670ae9041084da652aaa81b8b63ae3879e8e43c52ec235c6535b01af5",
      decisionSha256:
        "0acb42dfbd7464d4b3bbb92eb5b0f092a7251cd26e75912dfe988276324e32b2",
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
