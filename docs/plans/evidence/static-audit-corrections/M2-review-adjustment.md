# SAC M2 review correction and gate adjustment

Recorded after `SAC-R1-20261028-01`, before its corrective production edit.

SAC-12 requires a real bound during dispatch, including a child that stops
reading stdin. Add one private writer owner inside the existing ServiceSession:
bounded request/ack channels, one outstanding write, absolute command deadline,
best-effort nonblocking cancellation, and termination independent of the I/O
lock. Retain the same framed stdio transport, public contracts, dependency graph,
one-service-tree rule and existing command/termination budgets. Process and
writer ownership must both settle before replacement is admitted. The supervisor
and its existing tests remain the only required production/test owners.

A real subprocess with stdin backpressure supplies regression-first evidence;
a captured-process rescue watchdog makes the old-code failure safe to observe.
The test must show the new deadline returns without needing rescue and that
teardown cannot terminate a replacement identity. Previous synthetic-clock
tests remain controls for exact/+1 and cumulative response deadlines.

This correction invalidates prior supervisor/native results; final Rust and all
planned native/model gates remain fresh and had not yet run. Runtime/model
payload verification is independent: H-artifact-preflight-01 verified all 13,091
V7 runtime files, the six official model files and absence of extra runtime
files, then journaled task-owned scratch. No download or model rebuild occurred.

B1's second failing attempt stopped that stage for diagnosis. Its accessible
snapshot established disabled controls with the expected roles. The corrected
role selector passed the directed `B1-SAC15-repair-01` case with exact stored
bytes and zero writes. Renew the affected reader spec once after this targeted
repair; retain foundation's four passing cases because its source, imports,
fixtures, configuration, bundle and environment are unchanged. Both earlier
failed command logs and before/after source identities remain preserved;
the first failure's screenshot/trace were separately archived before rerun.

This is a bounded review adjustment, not acceptance or Git authorization.
