# U14 case 4.3: recoverable three-file authority replacement

Status: host checks pass; independent [review R1](review-U14-4.3-R1.md)
is APPROVE (`FPA-U14-4.3-CR-R1-20261111`). HEAD remains
`a3241571944530d468e2f4f2d37a0a2394a8df84`, index empty. Only the v7 authority
writer, its owning tests and setup documentation change. Accepted authority
was read and compared, never regenerated for this unit.

The writer renders validated canonical payloads before replacing destinations,
stages/readbacks the closed set and separately copies original regular files.
True absence remains distinct from unreadable/nonregular targets. Each attempted
replacement is registered before the operation. A catchable failure restores
peers independently in reverse order; restoration uses a copy of the recovery
backup so a failed move cannot consume the only original. Originally absent
targets are removed only after staged-file consumption establishes owned output.

Rollback errors preserve stage/recovery material and are grouped with the primary
failure; one failed restoration does not skip peers. Cleanup failure after all
replacements reports separately without rolling back the committed set. This is
not a power-loss or concurrent-publication atomicity claim.

## Normal-host validation

All checks run in normal local PowerShell outside the sandbox with pinned
uv 0.11.29, Python 3.12.10, Node 24.18.0 and pnpm 11.15.1:

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_chatterbox_v7_authority.py -k failed_write_restores
uv run --project services/tts --locked pytest services/tts/tests/test_chatterbox_v7_authority.py
pnpm.cmd package:chatterbox-optional:v7:check-acquisition
uv.exe run --project services/tts --locked ruff format --check services/tts/src/voxleaf_tts/packaging/chatterbox_v7_authority.py services/tts/tests/test_chatterbox_v7_authority.py
uv.exe run --project services/tts --locked ruff check services/tts/src/voxleaf_tts/packaging/chatterbox_v7_authority.py services/tts/tests/test_chatterbox_v7_authority.py
uv.exe run --project services/tts --locked mypy --config-file services/tts/pyproject.toml services/tts/src/voxleaf_tts/packaging/chatterbox_v7_authority.py services/tts/tests/test_chatterbox_v7_authority.py
git.exe diff --check -- services/tts/src/voxleaf_tts/packaging/chatterbox_v7_authority.py services/tts/tests/test_chatterbox_v7_authority.py docs/development/setup.md
```

2026-11-12 UTC RED01, 00:34:04.914–00:34:06.336: two intended failures,
18 deselected, exit 1. Injected post-write errors at the second/third actual
temporary destinations leave mixed original/new bytes and presence on old code.
The final regression keeps that post-operation interruption boundary.

GREEN01, 00:38:07.619–00:38:16.593: **29/29 pass**, exit 0. Controls cover
first/second/third replacement, absent originals, staging/readback failure,
unreadable/nonregular originals, failed rollback with continued peer restoration
and retained backups/errors, postcommit cleanup failure, unchanged neighbors and
exact successful canonical bytes.

Read-only acquisition check, 00:38:49.807–00:38:51.013: current, exit 0.
Static01, 00:38:58.973–00:39:00.106: all four checks exit 0. The existing pytest
cache warning remains explicit; no infrastructure retry or accepted write occurred.

## Exact identities

Ignored `tmp/evidence/five-pass-audit/` paired manifests are identical within
each command:

| Gate | Input rows | SHA-256 |
| --- | ---: | --- |
| RED01 | 313 | `26C8EE4FDB77ABB19FC10BB35A308D762A18A32945F9030E283AB94D559602FE` |
| GREEN01 | 313 | `95B0D08732F226A283A49A8E883F68306C90BA1993A7833068B323FF98216CA5` |
| Acquisition check | 85 | `A7148F5419B5D1D5B0EA88F72C4370E7721538CAD3B1ED68922CFAF9F1244889` |
| Static01 | 28 | `8965E2F65A63F05D9F0DDD4BC619F32113B0A3A6FC44CFC6218B4386992E95F1` |

The 26 accepted/historical optional-authority and v7-profile paths match the
pre-edit RED snapshot in membership and bytes, with no Git drift. Normal-host
comparison at 00:39:54.435–00:39:54.588 passes; manifest SHA-256:
`05979E9B2736867030C922E21B719DBE3E368D864CC19CEEB522FCE4843BD3E1`.

Closed 79-path `u14-4.3-review-inputs.txt` SHA-256:
`C383A63274F379FEEA425834697B2753DB68341DD5CEF443E719F8E4BB348DD5`.
`u14-4.3-review.diff` SHA-256:
`A3FEA278BF3D1CD6BFBA0B5DE5A47EE7A99494B4ADD06A9F5D225508C1B899B6`.
Final G3/G11/integrated checks remain pending. Core generation has not started.
