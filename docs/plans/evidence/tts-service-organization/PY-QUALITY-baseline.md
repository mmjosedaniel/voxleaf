# PY-QUALITY-BASELINE-01

Independent `refactor_validator`; BASELINE **PASS**. Host PowerShell outside
sandbox with existing Corepack PATH, Python 3.12.10. Starting/ending HEAD
`a3fa08accbf7752e7638ff24aca73211ec8aeb92`; identity recheck PASS; index empty.
All 12 accepted source paths and 393 protected paths unchanged.

| Exact path | Porcelain | SHA-256 | Expected index blob |
| --- | --- | --- | --- |
| `services/tts/benchmarks/quality.py` | Empty | `4bd15985177745d0d533f5943c48460f749409d1ff81bb02e5621fed04c28df8` | `f0dfd4b31b103c35cb66a186000d8f3dfaa62e59` |
| `services/tts/benchmarks/quality_presentation.py` | Empty | ABSENT | ABSENT |
| `services/tts/benchmarks/quality_scoring.py` | Empty | ABSENT | ABSENT |
| `services/tts/tests/test_benchmark_quality.py` | Empty | `a6842f4dbf62d91f7122cd34f609b29519326f0af1140c57165590772682f63d` | `5bd0096c1fae2a3a2232161bcec136e192ac0a15` |

All five commands exited 0: `pnpm.cmd format:check:python` (168 files),
`pnpm.cmd lint:python`, `pnpm.cmd typecheck:python` (165 files),
`pnpm.cmd test:python` (446 passed; existing cache-write warning), and
`pnpm.cmd build:python` (sdist/wheel). Host inline characterization through
`uv run --project services/tts --locked python -`, `git diff --check`, and
`git diff --cached --quiet` exited 0.

Scope, baseline invariants, test integrity and privacy reviews PASS. Six existing
quality tests untouched. Synthetic temporary JSON only, automatically cleaned;
no audio/model generation. Pre-loop metadata validation, per-candidate corpus
read timing, medians/means and evaluator/case corrections were characterized.

## Fixed HTML input

Call `_render_evaluator_html("evaluator-01", scorecard)` with insertion order:

```python
scorecard = {
    "sessionId": "a" * 32,
    "evaluatorId": "evaluator-01",
    "samples": [{
        "sampleId": "b" * 32,
        "caseId": "synthetic-case",
        "scores": {dimension: None for dimension in DIMENSIONS},
        "meaningChangingDefect": None,
    }],
}
```

Keep the current dimension order. UTF-8 output: **3,675 bytes**, SHA-256
`24ff8309930111c671c17a53145e71f03b0f10488143cfcc53f66aa0c76b8e15`.

## Fixed aggregation input and result

Original `aggregate_scores` ran with real temporary JSON session/card/correction
files. Only `load_corpus` was replaced with synthetic ordered cases
`("case-a", "case-b")`. Session ID is `"c" * 32`. Metadata insertion order:
state `ready`; evaluatorIds `["evaluator-01", "evaluator-02", "evaluator-03"]`;
expectedCandidates `["candidate-a", "candidate-b"]`;
protocolVersion `tts-feasibility-profile-v2`.

Sample IDs are `f"{n:032x}"`, n=1..4, mapping in order to A/a, A/b, B/a, B/b.
Key contains `samples`, each entry ordered sampleId/candidateId/caseId. Cards
are ordered sessionId/evaluatorId/samples, with samples in key order and fields
sampleId/caseId/scores/meaningChangingDefect. Scores use current dimension order.

Each cell below is evaluator 01/02/03; NA is exactly `"not-applicable"`.

| Candidate A dimension | case-a | case-b | Observed mean |
| --- | --- | --- | ---: |
| intelligibility | 1, 5, NA | 2, 4, 5 | 3.5 |
| spanishPronunciation | 1, NA, NA | 5, NA, NA | 3.0 |
| punctuationDialogue | NA, NA, NA | 2, 4, NA | 3.0 |
| numericExpressions | 2, 3, 4 | 1, 2, NA | 2.25 |
| foreignNames | 5, 5, 1 | 1, 1, 5 | 3.0 |
| naturalness | NA, 2, 4 | NA, NA, 5 | 4.0 |
| artifactFreedom | 1, 2, 3 | 4, 5, NA | 3.25 |

Candidate B scores all 4. Defects true only for candidate A evaluator01/case-a,
evaluator02/case-a and evaluator03/case-b. Correction file for evaluator01:
sessionId `"c" * 32`, evaluatorId `evaluator-01`, caseId `case-a`,
previousMeaningChangingDefect true, correctedMeaningChangingDefect false,
reasonCode `evaluator-clarified-no-meaning-change`.
Thus corrected pairs = `{("evaluator-01", "case-a")}`.

Observed A overallMean **3.142857142857143**, defects **2**; B dimension/overall
means **4.0**, defects **0**. Both: evaluatorCount 3, blindOrder true, scale `1-5`,
unchanged five limitations (small-panel, spanish-only, fixed-voices-only,
synthetic-corpus-only, not-accessibility-certification). Receipt: status pass,
sessionId, evaluatorCount 3, eligibleForPromotion true, candidates A/B in order.
Written aggregate: sessionVersion `tts-quality-session-v1`, sessionId,
eligibleForPromotion true and the same candidates.

Observed reads: session.json; evaluator01/02/03 completed cards; evaluator01
correction; randomization-key.json; corpus-v1.json; corpus-v1.json. Changing all
A artifactFreedom scores to NA raises canonical QualitySessionError with code
`missing-dimension`, message `tts-benchmark-quality:missing-dimension`.

These are pre-change observations, not implementation acceptance or Git authority.
