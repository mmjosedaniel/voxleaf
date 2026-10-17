# Validation Report

> **Sanitized publication copy.** Personal paths are redacted; report IDs,
> results and validation hashes retain their historical meaning.
> Original SHA-256: `910bf9fa34e828eb455df0731966019f578a4abc3d5ac6b12779c6bc15662ed2`.
> See [publication and original retention](../historical-privacy-cleanup/README.md).

Report ID: STATE-SUBSCRIPTIONS-01-DOC-CLOSE-01-20261012
Target ID: STATE-SUBSCRIPTIONS-01-DOC-CLOSE
Mode: FINAL
Verdict: PASS
Environment: local PowerShell outside sandbox at <REPO_ROOT>; every acceptance/identity command used require_escalated. PowerShell 7.6.5, Node v24.20.0, pnpm 11.15.1 selected with the existing Corepack shim directory prefixed only to process-local PATH.
Starting HEAD SHA: 44a83f4113e9cbeadee7d8a2d0e62838df70629b
Ending HEAD SHA: 44a83f4113e9cbeadee7d8a2d0e62838df70629b
Validated paths: the closed thirteen-document path list below, including both sides of the plan move and eight current curated evidence files. The future doc-close-01.md receipt is explicitly excluded to avoid hashing itself.
Validated path identities: before-command exact porcelain, raw SHA-256 and filter-aware expected index blob (git hash-object --path=<path> -- <path>); leading porcelain spaces are significant. Get-FileHash -Algorithm SHA256 -LiteralPath independently confirmed the checker's SHA-256 for every existing document before and after. The removed active plan is DELETED and was not hashed.

| Path | Exact porcelain output | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| `docs/README.md` | ` M docs/README.md` | `650828418997f5a8f212f7f47ee797583bdae3f4bcfc141c7a5d94a35315e56a` | `655bf579e56098d4676c9bd6502fb3bee3b198fd` |
| `docs/plans/active/README.md` | ` M docs/plans/active/README.md` | `f10962237d031ffa7320df6b719fe440447d1f83f97130b4379d827c41da4538` | `2e63c7bf5c4c7f31f671c7ce1c9d0f413da4eb16` |
| `docs/plans/active/desktop-state-subscription-hooks.md` | ` D docs/plans/active/desktop-state-subscription-hooks.md` | `DELETED` | `DELETED` |
| `docs/plans/completed/README.md` | ` M docs/plans/completed/README.md` | `853e229b96d9308f1cfaaca9cccd12ed899cdc0865cf3d2913eb3320681a9b94` | `16f5615666c2d471124c0228fcb0504557a7f678` |
| `docs/plans/completed/desktop-state-subscription-hooks.md` | `?? docs/plans/completed/desktop-state-subscription-hooks.md` | `dc4d5573d520c6b8f2036346233adf0b1d2f8743098308afdbfe33e7a795ad8b` | `76525f3368cb987724383de9b68495f8da07a966` |
| `docs/plans/evidence/desktop-state-subscription-hooks/README.md` | `?? docs/plans/evidence/desktop-state-subscription-hooks/README.md` | `ba908309a9a59ce3ae22b7898fee0454d4b6293c1f10d655ad35209362d3e138` | `0ddbdbb8a1eeffa07e5c045f946b15b96728f42d` |
| `docs/plans/evidence/desktop-state-subscription-hooks/baseline-01.md` | `?? docs/plans/evidence/desktop-state-subscription-hooks/baseline-01.md` | `ebdf378755bb126b35e072eebac732dfdf252adc88af73362c5cf9dbb84d88dc` | `733d11a3f6460e0ba4b987ecc86ed1311ac40dad` |
| `docs/plans/evidence/desktop-state-subscription-hooks/checkpoint-a-01.md` | `?? docs/plans/evidence/desktop-state-subscription-hooks/checkpoint-a-01.md` | `4575b474e6d9c1de2d389162837acacf6ed26578b2ba7d9513e8e63db322b15f` | `c45e9d002fe50bd2deb832632fc654af0b129cef` |
| `docs/plans/evidence/desktop-state-subscription-hooks/work-order-01.md` | `?? docs/plans/evidence/desktop-state-subscription-hooks/work-order-01.md` | `eeff6f92bfd5933f1f1569db0ecf4974a20c96a2f46dfa9a6d3323c4ade231b2` | `af0bf1f4b032a5b5c5c525fb6e481663f79d092b` |
| `docs/plans/evidence/desktop-state-subscription-hooks/work-order-02.md` | `?? docs/plans/evidence/desktop-state-subscription-hooks/work-order-02.md` | `498b835c3996a5ca02bfd62b489d62512603885baae9159505e5650328bd6417` | `655072f8754eee9dbc5f19bf3b0e487c6b17fb77` |
| `docs/plans/evidence/desktop-state-subscription-hooks/post-change-01.md` | `?? docs/plans/evidence/desktop-state-subscription-hooks/post-change-01.md` | `28dd52af98024eb490483ef7a6bef68f1310b038177735b5f04a89e610a1f6d9` | `6ed26a34291156abe794497440fc899217aaee5e` |
| `docs/plans/evidence/desktop-state-subscription-hooks/package-01.md` | `?? docs/plans/evidence/desktop-state-subscription-hooks/package-01.md` | `0ac51ff0e86c64d0b1444bc1ecbb64bfaa9134acad2c2be7d45b555bdc135cf0` | `869faa9ff62bf497cf66937e26a6ef636889980d` |
| `docs/plans/evidence/desktop-state-subscription-hooks/final-01.md` | `?? docs/plans/evidence/desktop-state-subscription-hooks/final-01.md` | `dbc064a1f35ac5420a5f88ee9f8ac27dc7f8e5c7e0c509fae09929182457a874` | `c13b808979796944c66c3523ff4ffde306fec167` |

Identity recheck: PASS. All thirteen documentary statuses/hash/blob values, full HEAD, branch and complete worktree status are identical before/after. The eight accepted source paths also match FINAL-01 exactly before and after (porcelain, SHA-256 and blob); their complete identities are retained in adjacent before.json/after.json and the immutable final-01.md. Branch remains codex/desktop-state-subscription-hooks and index remains empty (git diff --cached --quiet exit 0 and staged name/status empty). Writers/docs/Git remained idle.

Commands and outcomes:
1. `node tmp/evidence/desktop-state-subscription-hooks/doc-close-check.mjs before` -> exit 0; captures thirteen documents, verifies HEAD/branch/empty index and all eight FINAL-01 source identities.
2. `pnpm.cmd check:evidence` -> exit 0; Evidence retention check passed. This repository guard reads the Git index; actual untracked evidence directory contents were additionally checked by command 4 and reviewed below.
3. `git diff --check` -> exit 0 before closeout and again after the final identity check; no whitespace errors.
4. `node tmp/evidence/desktop-state-subscription-hooks/doc-close-check.mjs checks` -> exit 0. Exact scope is 21 changed paths (eight accepted source + thirteen docs); evidence directory contains exactly eight approved Markdown files and no raw/other artifacts. All 240 relative inline Markdown links in the twelve existing validated documents resolve, including heading anchors where supplied. Repository Markdown scan found zero incoming links resolving to the deleted active plan. Active path is absent, with no redirect. Five retained validator receipts compare byte-for-byte to their original ignored captures.
5. `node tmp/evidence/desktop-state-subscription-hooks/doc-close-check.mjs after` -> exit 0; full documentary/source/status comparison matched. Additional host PowerShell Get-FileHash comparisons passed on all twelve existing documentary files. No runtime gate was rerun for this documentation-only closure.

Diff scope: PASS. Only the authorized plan move, three maintained indexes and eight curated evidence records accompany the already accepted eight-source-path patch. The original active plan is absent; completed plan is present. No unrelated historical plan, runtime, test, dependency, configuration or generated source change occurred. Original work-order-01 and superseding work-order-02 remain separate; baseline and checkpoint are not presented as final source acceptance.

Invariant review: PASS. Completed-plan status, test counts, eight-path/592-line scope and audited 600-line ceiling agree with the immutable execution reports. Milestones distinguish original planning, unchanged baseline, pre-migration characterization, four-site migration, post-change and broader acceptance. Diagrams remain unchanged because ownership/process/data-flow boundaries are preserved. Warnings and unmeasured performance/GPU/model/private-book/acquisition limitations remain visible; uncommitted work is not represented as committed or published.

The evidence README correctly clarifies the immutable post-change report's wording: “source object itself is returned” means the cached snapshot returned by source.observe(), not the coordinator instance. The actual hooks return that snapshot, and exact-object tests passed. This clarification changes no source, validation result or original receipt bytes.

Test-integrity review: PASS. All source and test identities remain those accepted by STATE-SUBSCRIPTIONS-01-FINAL-01-20261012. Documentation counts match execution: shared 209, EPUB 651, desktop 661 plus 51 Node, Python 485, evidence 13, Rust 87 default/88 release-locked with one existing subprocess fixture ignored per configuration, browser 7/7 and packaged native success. Runtime acceptance is consumed from immutable source reports; no new runtime/performance claim is made.

Privacy/artifact review: PASS. Only reviewed Markdown is present in the new evidence directory. Raw logs, before/after JSON and temporary checkers stay under ignored tmp/evidence/desktop-state-subscription-hooks. No private book/audio/model/secret or new raw evidence artifact entered the diff. Logs/captures retain local-only provenance, not permanent public availability. External web URLs were not revalidated by this documentary link check.

Action required: none. Director may retain this receipt byte-for-byte as the separately excluded docs/plans/evidence/desktop-state-subscription-hooks/doc-close-01.md. That retention does not permit editing a validated document or refreshing any prior report's identities. No staging, commit, push or PR is authorized or performed.

Local evidence: tmp/evidence/desktop-state-subscription-hooks/STATE-SUBSCRIPTIONS-01-DOC-CLOSE-01-20261012/ contains before.json, after.json, checks.json and numbered command logs. The checker is ../doc-close-check.mjs. All acceptance outcomes above were obtained outside the sandbox.

