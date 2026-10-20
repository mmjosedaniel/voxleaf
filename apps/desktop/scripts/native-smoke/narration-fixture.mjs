export function syntheticNarrationSentences(language) {
  return language === "en"
    ? "This synthetic narration describes a quiet library and private local reading. Each sentence validates natural transitions, bounded memory, and order."
    : "Esta narraci&#243;n sint&#233;tica describe una biblioteca tranquila y una lectura local privada. Cada frase valida transiciones naturales, memoria limitada y orden.";
}

export function chatterboxPlaybackSpeedParagraph(language) {
  // Keep the six speed switches inside a paragraph: the matrix subtracts
  // sentence pauses, whereas paragraph pauses intentionally cost 600 ms.
  // Real EPUB-preparation tests verify the first eight semantic boundaries.
  return Array(12).fill(syntheticNarrationSentences(language)).join(" ");
}
