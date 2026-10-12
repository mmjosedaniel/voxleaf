# App conditional presentation acceptance

The [completed ExecPlan](../../completed/app-conditional-presentation.md)
implements all five required deliverables as one four-file unit under
`APP-CONDITIONAL-PRESENTATION-01-WO-01`. The director reviewed scope; named
GPT-6.1 Sol high auditor/worker and GPT-6 Astra high validator retained their
separate roles, one source writer and no delegated subagents. There were no
Git mutations. HEAD throughout: `27082836312fe31be3be4536233ef857a8dc91b1`.

| Report | Result | Scope |
| --- | --- | --- |
| [BASELINE-20261012-01](baseline-20261012-01.md) | BASELINE-FAIL | Original native session failure before any source edits; preserved. |
| [BASELINE-20261012-02](baseline-20261012-02.md) | PASS | Proven driver/runtime mismatch repaired; all seven original commands rerun independently. |
| [CHECKPOINT-20261012-01](checkpoint-20261012-01.md) | FAIL | Three added tests pass on original production; two Prettier wrapping discrepancies. |
| [CHECKPOINT-20261012-02](checkpoint-20261012-02.md) | PASS | Formatting-only correction; all five deterministic gates rerun against unchanged production. |
| [POST-CHANGE-20261012-01](post-change-20261012-01.md) | PASS | Independent final source review and seven gates, including browser and packaged native smoke. |
| [PACKAGE-20261012-01](package-20261012-01.md) | PASS | Portable aggregate on exact accepted source. |
| [FINAL-20261012-01](final-20261012-01.md) | PASS | Full native aggregate on the same source. |

Every report ID has prefix `APP-CONDITIONAL-PRESENTATION-01-`. Each records
before/after HEAD and closed path identities, exact commands/outcomes,
independent scope/invariant/test/privacy review and limitations. All acceptance
commands ran in local PowerShell outside the sandbox, with pinned pnpm 11.15.1,
writers idle and index empty. No accepted source changed after FINAL.

Deliverables: `ApplicationBar`, `ShellWelcome`, `EmptyPublicationNotice`,
`ReadyPublicationSection`, and `readyReaderProps: ReadyPublicationContentProps
| undefined`. App retains all state, effects, resources, persistence,
cancellation, original Settings ref, mounted dialog, keyed error boundary and
public reader contracts. Existing DOM, accessibility and optional omission are
preserved. Three added tests protect preparing/settlement, book-start omission,
reader continuity and focus return; all previous assertions remain.

The original failure was an external test-tool mismatch: EdgeDriver 150 with
WebView2 155. A Microsoft-signed exact 155 driver replaced the local tool, with
the old binary preserved. No product/harness repair, timeout change or weakened
assertion was needed. Historical receipt findings remain unchanged; the sole
attempt-01 navigation link now points directly to the completed plan.

Warnings remain nonfatal: Vite chunk size, browser color settings and pytest
cache-write permission. No model-backed performance, exact inference or
installer-lifecycle claim is added. Native smoke uses synthetic publications
and the fake service. No public behavior, dependency or architecture changed.

Raw logs, manifests, temporary scripts/profiles and tool backups stay ignored at
`tmp/evidence/app-conditional-presentation/`. They are local recovery references,
not permanent public artifacts. The retained Markdown contains only concise
results and source identities. Source and documentation remain unstaged and
uncommitted at closeout.
