# U1 case 1.1: superseding chapter navigation

Status: unit APPROVE, renewed by FPA-U3-5.2-CR-R1-20261111;
combined acceptance pending. Base/HEAD:
`a3241571944530d468e2f4f2d37a0a2394a8df84`.

## Scope and lineage

The existing coordinator reused the same pending navigation object across a
new chapter request. Older boundary/paragraph continuations therefore retained
current identity and emitted after containment. ReaderPublication accepts each
emission as a new programmatic navigation, so the delayed older request could
supersede the user's newer chapter destination. Earlier navigation fixes covered
already delivered requests and completion/rejection; this case holds shutdown
before the old request is delivered.

Allowlist: `apps/desktop/src/tts/product-narration-coordinator.ts` and its
existing `.test.ts`. App and ReaderPublication callers are unchanged.
The new pending object has its own revision/event/target while retaining the
existing stop promise and prior play/pause intent. There is no duplicate Stop,
new queue, public schema, dependency, persistence or process change.

## Host RED and GREEN

All commands ran outside the managed sandbox in local PowerShell, repository
root cwd with Node 24.18.0, pnpm 11.15.1 and Vitest 5.0.5. Input snapshots include
desktop imports/test sources/configuration/locks and built EPUB/shared exports.
Logs and identity manifests live under ignored `tmp/evidence/five-pass-audit/`.

| Receipt | UTC interval | Command | Outcome |
| --- | --- | --- | --- |
| `u1-1.1-red-03.log` | 20:03:53.227–20:03:55.784 | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts -t 'five-pass 1.1'` | Exit 1; four attributed failures: delayed boundary and paragraph emission, each playing and paused |
| `u1-1.1-green-01.log` | 20:05:03.556–20:05:08.834 | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/reader/ReaderPublication.test.tsx src/App.test.tsx` | Exit 0; 344/344 tests pass |

The tests hold the existing shutdown promise, request newer chapter navigation,
release shutdown, reject old emissions, verify only one shutdown, and verify the
chapter's target and paused/playing intent. A close-during-containment control
checks retired ownership. Existing coordinator, Reader and App tests remain.
This is a controlled model-free ordering reproduction, not natural host timing.

RED production SHA-256:
`B111678A407947D973A4A709B9062BCE3786E0545DB34EDA8AD159E35C61B252`.
RED test SHA-256:
`64D45B8D9902AC03CC1E84099D830991EADFCE74A5E62197BB0EA9235FA8BB19`.
RED before/after manifest SHA-256:
`80F1989E6120E2027E7391E17ECDB5EACA5656C8A82FEB17F8D8FC95B16AE8A7`.

GREEN production SHA-256:
`128EC55CE8EB1D86818F1FF48D03F32F4D793030B75F48060A2F58D3D326CAF4`;
Git blob `c76b3de7f08edd66b39b4d811ef730ea9ed703ca`.
GREEN test SHA-256:
`8F5F8340668C05FBD606B4455FCE27E6E349393F38EA3A4B0E17AEA144EF90EA`;
Git blob `464a96048d86c59d707f17f93efcefa706e483eb`.
GREEN before/after manifest SHA-256:
`D724018E73556BD6FC02694C029928911309B7147DD0E7600913F18AAD02CD87`.

## Retained failed preparation

The initial capture wrapper failed before Vitest (unsupported Tee-Object
parameter combination); its stale zero exit is not a test result. `red-02`
contains two genuine playing failures but its paused fixtures admitted navigation
before playing. `red-03` waits for actual playing before Pause and is the complete
attributed RED. The first format check reported test formatting; scoped pinned
Prettier formatting preceded GREEN. All attempts remain in ignored evidence.

## Remaining acceptance

Fresh scoped static receipt `u1-1.1-static-02.log` has the same before/after input
manifest as GREEN. All three commands exit 0: scoped
`pnpm.cmd exec prettier --check` (20:06:05.141–20:06:06.008Z) and
`pnpm.cmd exec eslint` (20:06:06.009–20:06:24.554Z) on the two allowlisted paths,
then `pnpm.cmd --filter @voxleaf/desktop run typecheck`
(20:06:24.555–20:06:31.252Z). This does not claim final repository G11.

Closed current changed/support-path identities are in
`tmp/evidence/five-pass-audit/u1-1.1-review-inputs.txt` (SHA-256
`BEDE1A1EB531E84AF0184568072E09394AB91FCE9C7076B1365F1AA30FEA46ED`);
the complete two-file patch is `u1-1.1-review.diff` (SHA-256
`4EE06E883A4FB1062C975C3D913FBD7A7485AB4961BE5DE61AA44E9CA952454F`).

No historical PASS reused. Independent case review is pending.
G6 directed browser, G7 native/Piper, final G11/G12 and
the integrated review remain pending; 344 passing unit tests do not replace them.
