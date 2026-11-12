# U12 case 1.8: reject asserted lifecycle status before release work

Status: unit APPROVE [FPA-U12-1.8-CR-R1-20261111](review-U12-1.8-R1.md);
combined acceptance pending. HEAD remains
`a3241571944530d468e2f4f2d37a0a2394a8df84`, index empty.

The PowerShell wrapper's ValidateSet now admits only its existing `not-run`
value. An asserted passed lifecycle status fails during argument binding, before
build/signature/checksum/evidence work. Default and explicit not-run behavior
remain available. This is one production-line change plus owning synthetic tests
and the setup contract paragraph. Case4.4 has not been edited in this unit.

The RED uses the existing temporary canonical-build fixture with inert command
sentinels. On old code the legacy invocation exits1 only after recording builder,
signature, signature and evidence entries; the required empty trace assertion
fails. The checksum fixture is also protected by the final regression. No actual
package build, signing operation, installer or user profile was invoked.

## Normal-host validation

Normal local PowerShell outside the sandbox, Node24.18.0, child Windows
PowerShell5.1.26100.9711, pnpm11.15.1, Cargo/Rust1.97.1, uv0.11.29 and
Python3.12.10. Exact wrapper/real tool identities are captured.

```powershell
node --test --test-name-pattern 'legacy lifecycle argument' apps/desktop/scripts/windows-release.node-test.mjs
node --test --test-name-pattern 'CCF-C16|CAF-R1\.5|DCR-05' apps/desktop/scripts/windows-release.node-test.mjs
pnpm.CMD exec prettier --check apps/desktop/scripts/windows-release.node-test.mjs
pnpm.CMD exec eslint apps/desktop/scripts/windows-release.node-test.mjs
powershell.exe -NoProfile -NonInteractive -Command '$tokens=$null; $errors=$null; [void][Management.Automation.Language.Parser]::ParseFile((Resolve-Path "scripts/build-windows-release.ps1"),[ref]$tokens,[ref]$errors); if($errors.Count){$errors | Write-Error; exit 1}'
git.exe diff --check -- scripts/build-windows-release.ps1 apps/desktop/scripts/windows-release.node-test.mjs docs/development/setup.md
```

2026-11-12 UTC RED01 00:12:35.504–00:12:36.977, exit1: one intended failure.
Its47-row before/after SHA-256:
`FAFE82ABC47F1677D9532D1AC752DD35A3E7AD200D5C94A5D79C2430587E0133`.
Log SHA-256 `D9439D02066A47D5DEC6B62624A5E3C5E421DBD0DA9B5F6EE9953E88ACDCBABE`.

GREEN01 00:13:45.402–00:13:53.607, exit0: **14/14 pass**. Legacy input now
produces ParameterArgumentValidationError with no child work and unchanged
checksum. Default and explicit not-run run the synthetic successful path.
Existing alternate directory/target/compiler rejection, identical-byte rebuild,
signature policy and lifecycle evidence controls pass as well.
Its84-row before/after SHA-256:
`6B24E3F358C66455A1686C3566A8FD931135B7DE26FA1AEF11677539EE192AF5`.
Log SHA-256 `925EC037989918F4ED606DBF90C48C8B6654AE8A616EFC3E7EEC80F5797EB7E8`.

Static01 00:14:16.678–00:14:19.942: all four checks exit0. Its27-row paired
input SHA-256 `477DF555BF307E27E1FC6BCCF2CBE71B32CF4FC744CEC5F92E3A41E3CAA5062E`;
log SHA-256 `E062BE262D1F7308DD5020185F14EA5B71CDF6788490FE190AF62B7899D63366`.
Tool-identity discovery emitted a benign uv no-project warning, outside the test
log; no test or build failure is concealed by it.

## Exact review binding

Ignored `tmp/evidence/five-pass-audit/u12-1.8-review-inputs.txt` binds77 paths,
SHA-256 `ED3EFDE0087C5356B1A8ED9094AF4D5A1E94DC691EA674DA1F362AA1D5F6679C`.
`u12-1.8-review.diff` SHA-256:
`DF97952D0B1C046B56B7A879F9B99C3878326833040E71A7600973B3823E429E`.
Full G4, final installer G9 and integrated acceptance remain pending.
