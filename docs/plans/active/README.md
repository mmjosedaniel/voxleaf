# Active plans

Store current approved ExecPlans in this directory. A plan may be ready for implementation without production work having started; use its task statuses and the roadmap for implementation state.

The high-level milestone order is maintained in [`../roadmap.md`](../roadmap.md). Create or refine detailed ExecPlans just in time for the milestone being implemented rather than planning the entire roadmap at implementation depth.

Prefix milestone-specific ExecPlans with their zero-padded roadmap milestone number:

```text
M003-secure-epub-ingestion.md
M004-reflowable-reader.md
```

If a milestone requires multiple ExecPlans, add a second three-digit sequence, such as `M003-001-secure-epub-ingestion.md`. Plans that intentionally span multiple milestones retain descriptive names until they are split. See `.agents/PLANS.md` for the complete naming rules.

Follow `.agents/PLANS.md` and update the progress log while working.

## Current plans

The [App preference effects plan](../completed/app-preference-effects-readability.md)
is complete and archived. Both startup hydration and narrator preference binding
were extracted after 28 characterization cases passed against unchanged App;
16 module cases and independent post-change/browser/native/portable/final gates
pass. Restoration, saving and application cleanup remain in App. Failed attempts
and the successful unchanged Rust rerun remain recorded. No staging or commits.

The [App hardware effects plan](../completed/app-hardware-effects-readability.md)
is complete and archived: one hardware visibility binding, five added unit/App
cases, private preference types and named UI conditions. Independent baseline,
post-change and both aggregate gates passed; ownership and behavior preserved.
Changes remain unstaged and uncommitted.

The [App readability plan](../completed/app-readability.md) is complete and
archived: three presentation components/private messages, nine added integration
cases and independent baseline/post-change plus portable/native aggregate PASS.
Picker identity and publication ownership remain unchanged. Preference-handler
deduplication and lifecycle extraction remain SKIP; no staging or commits.

The [TTS adapter layout plan](../completed/tts-adapter-layout.md) is complete:
selective `adapters/` migration, refreshed Piper and local-only Chatterbox v4,
independent three-baseline/22-gate PASS and four candidate/four desktop arms.
Firewall cleanup and documentary closeout are independently approved. Historical
authority and admitted v3 remain protected; implementation is committed for PR handoff. See its
[execution evidence](../evidence/tts-adapter-layout/README.md).

The [TTS service organization plan](../completed/tts-service-organization.md) is
complete and archived, with four
independently accepted Python packaging-integrity, release-authority,
benchmark-corpus and quality-tooling units. Developer guidance and full
portable/native aggregate validation are complete. All changes remain unstaged.

The [desktop source organization plan](../completed/desktop-source-organization.md)
is complete and archived. Semantic planning, Web Audio and ordered CSS extractions
passed independent unit and combined validation. Changes remain unstaged with
no Git publication; the large publication/narration lifecycle owners remain SKIP.

The [PR #229 evidence retention cleanup](../completed/pr-evidence-retention.md) is technically complete and archived; its separate Git publication handoff is pending. The [Linux Rust comparison](../completed/linux-rust-test-comparison.md) is complete; its former active path is a navigation-only redirect for historical evidence.

The completed
[native Rust test-layout campaign](../completed/native-rust-test-layout.md)
records all ten accepted units and aggregate host validation.

The preceding native Rust organization campaign is archived in
[completed plans](../completed/native-rust-module-organization.md).

## Historical reference

- [`synchronized-reader-and-startup-buffer.md`](synchronized-reader-and-startup-buffer.md):
  retained broad historical context. Completed M009 supersedes its
  synchronization work; it does not supersede completed Milestones 4 through 9.
  Its original path is preserved for links in completed plans; it is not an
  active ExecPlan.
