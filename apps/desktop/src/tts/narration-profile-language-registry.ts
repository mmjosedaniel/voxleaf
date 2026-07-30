import {
  CHATTERBOX_BILINGUAL_PROFILE_ID,
  EXACT_QWEN_AIDEN_DEVELOPMENT_PROFILE_ID,
  EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
  PIPER_CPU_FALLBACK_PROFILE_ID,
  PIPER_ENGLISH_CPU_PROFILE_ID,
} from "./hardware-profile-registry";
import type { NarrationLanguageV1 } from "./narration-language";

export const NARRATION_PROFILE_LANGUAGE_BINDINGS_V1 = Object.freeze([
  Object.freeze({
    profileId: PIPER_CPU_FALLBACK_PROFILE_ID,
    languages: Object.freeze(["es"] as const),
  }),
  Object.freeze({
    profileId: PIPER_ENGLISH_CPU_PROFILE_ID,
    languages: Object.freeze(["en"] as const),
  }),
  Object.freeze({
    profileId: CHATTERBOX_BILINGUAL_PROFILE_ID,
    languages: Object.freeze(["es", "en"] as const),
  }),
  Object.freeze({
    profileId: EXACT_QWEN_SERENA_DEVELOPMENT_PROFILE_ID,
    languages: Object.freeze(["es"] as const),
  }),
  Object.freeze({
    profileId: EXACT_QWEN_AIDEN_DEVELOPMENT_PROFILE_ID,
    languages: Object.freeze(["en"] as const),
  }),
  Object.freeze({
    profileId: "qwen3-tts-0-6b-customvoice-cuda-bf16-v1",
    languages: Object.freeze(["en"] as const),
  }),
  Object.freeze({
    profileId: "supertonic-3-onnx-cpu-f1-es-v1",
    languages: Object.freeze(["es"] as const),
  }),
]);

export function profileSupportsNarrationLanguageV1(
  profileId: string,
  language: NarrationLanguageV1,
): boolean {
  return (
    NARRATION_PROFILE_LANGUAGE_BINDINGS_V1.find(
      (binding) => binding.profileId === profileId,
    )?.languages.some((candidate) => candidate === language) === true
  );
}
