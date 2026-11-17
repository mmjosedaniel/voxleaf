# Four Codex models on two historical VoxLeaf cases

All four models identified the late-Cancel defect and correctly classified the benchmark-file concern on their first answer. Each proposed a check that could distinguish its explanation.

| Requested model | Correct judgments | Elapsed | Input tokens | Output tokens |
| --- | ---: | ---: | ---: | ---: |
| GPT-6.1 Sol | 2/2 | 28.0 s | 19,456 | 966 |
| GPT-6.2 Sol | 2/2 | 36.2 s | 19,743 | 1,356 |
| GPT-6 Astra | 2/2 | 25.0 s | 18,272 | 614 |
| GPT-6.2 Astra | 2/2 | 20.9 s | 19,696 | 480 |

**VF-0058.** All four traced how an install can finish just before Cancel invalidates the Download callback. Settings can show Installed while the selected narrator still appears unavailable and the next Play cannot start. Each suggested comparing ordinary completion with a late Cancel and checking the next Play. GPT-6.1 Sol also said that cancelling *before* commit always shows the installed controls. In that ordering, the displayed state depends on whether a valid installation already existed.

**VF-0071.** All four recognized that the ordinary writer puts measurements and load observations from the same execution in one fresh session directory. A compatible file substituted before derivation could still pass the format checks. Both Sol answers also described a conditional directory-reuse race between reads. The replay did not execute that sequence. [Historical assessments](../../../development/findings/audits/2026-11-15-deep-findings-validation.md)

Each model received the same two questions and bounded production excerpts from commit `997cddff2a8658440324a87e44178a98018dea77`. The 39,177-byte user prompt had SHA-256 `0d883d38877b5dfadf6aeb66a73dc4f0548a50a8eedc6d85a278b51006952c53` and omitted the previous findings and fixes. The four CLI sessions ran sequentially at High effort, each in a fresh read-only directory. Each returned one answer with zero tool calls. Scoring used criteria written before the runs, with model names withheld until the judgments were recorded. There were zero misses, false alarms and corrective turns on the two scored questions.

Elapsed time includes CLI overhead. There was one run per model, so these timings describe this replay only. The judgments measure interpretation of historical source. Runtime evidence for the original cases belongs to their own records. [Original rollout](../../completed/codex-model-rollout.md) · [Independent review](historical-review.md) · [Closeout](historical-closeout.md)
