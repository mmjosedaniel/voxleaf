# Change Review Report

**Review ID:** CAF-CI-R1-20261104

**Task ID:** CAF CI follow-up — PR #305

**Verdict:** **APPVE**

**Base commit and reviewed HEAD:** `57600c838d2cdf3a4f25e1c4575505504e49de2d`

**Branch:** `codex/chat-audit-minimal-follow-up-plan`

**Reviewed paths and identities**

The five changed paths are `ReaderPublication.tsx`, its test file, the reader product document, `docs/README.md`, and the new `ci-follow-up.md`.

Immutable artifacts under `tmp/evidence/chat-audit-ci/20261104-01/`:

| Artifact | SHA-256 |
|---|---|
| `R1-reviewed-identities.json` — 5 paths | `49DFC5475874F8F83F5959E15761BCD0F5E6FF78C1A2108241303D705DA2189D` |
| `R1-all-source-identities.json` — 1,541 paths | `040BDC888A3E1530AD5C34EECE47F115F46AEDB67776475592BD5B9C28743BAC` |
| `R1-tracked.patch` | `67B723E20E2BCD3EE092B83BFC9F0526BA450B70F4BD6CFA5682C2EF4A95BCD2` |
| `R1-new-files.json` | `EE3D5E24F3ABDD876A970D2507D87682047DA0822148A60A935C24C658F974FB` |
| `input-equivalence.json` | `D9F4D3363E4C9B1E98EF1024E584FAE4B7149403300AFFBFAB29C5AD64E500B9` |

Unchanged support examined includes `reader-reflow-restoration.ts` and its tests, `reader-navigation.ts`, the MAF-07 browser case, Playwright configuration, and package command definitions. Requirements were checked against ADR-0008, ADR-0011 and the existing reader behavior boundaries.

Report exclusion: `docs/plans/evidence/chat-audit-minimal-follow-up/ci-review-R1.md`.

**Identity recheck: PASS**

Before and after inspection, all 1,541 source SHA-256 identities matched. Final inspection verified all five changed-path blobs, exact changed-path and complete source-path membership, unchanged HEAD/branch, and an empty index. Frozen artifact hashes matched the envelope.

The passing receipts’ input hashes matched. Independent comparison confirmed only the three documented documentation paths changed after runtime checks; all 251 package exports and recorded environment/harness inputs matched.

**Acceptance review**

The confirmed trigger is an empty range whose fallback block has already been aligned to the reading line. The prior settlement code then called `scrollIntoView`, replacing that measured placement and producing the observed 24.5-pixel displacement.

The correction skips only that redundant scroll when `result.aligned` is true. Block-start locator reconciliation, initial narrator settlement and checkpoint preservation remain intact. Unaligned/unavailable fallback scrolling and visible exact-range handling retain their existing branches.

I also traced the shared programmatic-navigation path: revision ownership, pending-save checks, locator reconciliation and final settlement still execute. The change introduces no additional work, persistence, resource ownership, privacy surface or cancellation behavior.

The new mounted regression checks absence of the redundant scroll, fallback locator delivery to restoration and narration, and absence of a precise-checkpoint write. Existing browser assertions and tolerances are unchanged.

**Test evidence reviewed**

All local results below are attributed to the executor’s normal PowerShell session outside the sandbox, using Node 24.20.0 and pnpm 11.15.1. I ran no tests.

- `browser-red`: unchanged MAF-07 fails with the same 24.5-pixel displacement as the retained hosted log.
- `unit-aligned-red`: the final regression test fails against unchanged production because `scrollIntoView` is called once. Its test identity matches the final test. The earlier incorrect 8-pixel fixture is retained and excluded from acceptance.
- `unit-green`: ReaderPublication, reflow-restoration and App suites pass: **152 tests**.
- `static`: scoped ESLint, desktop typecheck and Prettier checks pass.
- `browser-full`: `pnpm.cmd test:browser` passes **60 tests**, including unchanged MAF-07. Its configuration rebuilds the renderer, disallows server reuse and uses zero retries.
- `docs-guard`: evidence guard and diff check pass.

Exact commands and results are retained in the reviewed follow-up document and corresponding receipts.

**Findings:** None.

**Remaining uncertainty:** The delivered revision’s hosted CI, including Windows native checks, remains pending. This approval establishes local acceptance of the bounded correction; it does not establish that PR CI is green. Omitted native/TTS/Rust/Python checks are not represented as fresh or reused passes.

**Required next action:** No code correction is required. Confirm the delivered commit’s required hosted checks before declaring CI green.

This report does not authorize Git mutations or merging.

---

**Review ID:** CAF-CI-R1-ERRATUM-20261104

**Verdict:** **APPROVE**

This erratum corrects only `APPVE` to `APPROVE` in CAF-CI-R1-20261104. The original report remains immutable; its findings, evidence, limitations and scope are unchanged.

**Base/HEAD:** `57600c838d2cdf3a4f25e1c4575505504e49de2d`

The exact manifest and artifact hashes are those recorded in CAF-CI-R1-20261104, including reviewed-path manifest `49DFC5475874F8F83F5959E15761BCD0F5E6FF78C1A2108241303D705DA2189D` and source manifest `040BDC888A3E1530AD5C34EECE47F115F46AEDB67776475592BD5B9C28743BAC`.

Hosted CI for the delivered revision, including required Windows native checks, remains pending. This correction does not declare CI green or authorize Git mutations or merging.
