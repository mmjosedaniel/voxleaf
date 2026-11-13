# Historical import

The 2026-11-13 seed contains 33 dispositions. Its import baseline is
`403eb27916afe26d4794a7e36aeb97e6d1529bf1`. Each entry has latest check
`not-revalidated` until a later audit records its own snapshot and evidence.
Historical acceptance applies to the reviewed patches and scenarios described in
their reports.

The source baseline was clean `main` when the implementation branch was created.
The import checks source attribution, local links and Git provenance; it does
not execute or reuse product tests as current acceptance. The seed contains 29
historically fixed dispositions (including a contract decision), one intentional
policy, one not-confirmed/unsupported report and two deferrals. These counts are
not independent current defect counts. Historical severity labels have not been
normalized into a comparable severity metric.

| Source | Imported cases | Registry IDs | Scope |
| --- | --- | --- | --- |
| [Chat findings recovery][cfr] | CFR-01 through CFR-24, in order | [VF-0001](registry.md#vf-0001) through [VF-0024](registry.md#vf-0024) | All 24 dispositions, including the intentional recovery policy and the resolved preflight contract. |
| [Passage navigation][pn] | PN-01 through PN-04, in order | [VF-0025](registry.md#vf-0025) through [VF-0028](registry.md#vf-0028) | Four case IDs. The independent review's appearance-recovery safeguard belongs to the PN-02 lineage. |
| [Reader position and image lifecycle][rpi] | RPI-01, RPI-02 | [VF-0029](registry.md#vf-0029), [VF-0030](registry.md#vf-0030) | Both corrections, including the C1 layout observation within RPI-01. |
| [Five-pass audit][fpa] | 1.2, 1.9, 4.5 | [VF-0031](registry.md#vf-0031), [VF-0032](registry.md#vf-0032), [VF-0033](registry.md#vf-0033) | Three selected exclusions or deferrals. The rest of the plan remains available for later import. |

The source IDs in the table map one-to-one in their listed order. Earlier
references in each record provide lineage. In particular, FPA-1.6 is the prior
deferral of [VF-0007](registry.md#vf-0007). FPA-4.4 identifies a separate
lifecycle validator whose earlier result could not close
[VF-0015](registry.md#vf-0015).

| Batch | Planning baseline | Execution reference | Integration commit |
| --- | --- | --- | --- |
| CFR | `693b0fc3650de45244c035b13e05de38a0067c9a` | `95eb4887121f2696beabade407d04afa6441e881` | `403eb27916afe26d4794a7e36aeb97e6d1529bf1` (#314) |
| PN | `a8a61df1417e476daada7795809b5153965a4a54` | `6dd694b815bf52b34e4644487067ec2ba3a8956d` | `693b0fc3650de45244c035b13e05de38a0067c9a` (#313) |
| RPI | `2e464daacaeaca2a53c83d8f63d1b00ea2b27840` | `26f92365eed3d30cbcb57eb2867b848d3beb28c4` | `4baeddb66e2831a00c97625fcdbeffe538072cdb` (#311) |
| FPA selected dispositions | `4baeddb66e2831a00c97625fcdbeffe538072cdb` | See the completed plan | Plan integrated in `a8a61df1417e476daada7795809b5153965a4a54` (#312). The selected cases had no implementation correction. |

Historical evidence is attributed to the [CFR final review][cfr-review],
[PN final review][pn-review], [RPI closeout][rpi-review] and
[FPA exclusion register][fpa]. The integration commits locate the landed
work. The reports retain the actual tested identities, evidence reuse decisions
and limitations. In particular, injected resolver rejection and controlled
geometry establish bounded cases without measuring natural WebView2 incidence.

Future imports can add a source, its exact case scope and its stable-ID mapping
here. Consult the original source when a symptom matches an unmigrated case.
Follow the [registry workflow](README.md) for current checks and disposition
changes.

[cfr]: ../../plans/completed/chat-findings-recovery-and-minimal-corrections.md#finding-and-history-register
[pn]: ../../plans/completed/passage-navigation-minimal-corrections.md
[rpi]: ../../plans/completed/reader-position-and-image-lifecycle.md
[fpa]: ../../plans/completed/five-pass-audit-revalidation-and-corrections.md#excluded-or-conditional-register
[cfr-review]: ../../plans/evidence/chat-findings-recovery/review-final-r03.md
[pn-review]: ../../plans/evidence/passage-navigation/review-r3.md
[rpi-review]: ../../plans/evidence/reader-position-and-image-lifecycle/closeout.md
