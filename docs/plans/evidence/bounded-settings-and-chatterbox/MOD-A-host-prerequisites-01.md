# Host prerequisite inspection

Report ID: MOD-A-HOST-PREREQUISITES-01
Target ID: MOD-A
Inspector: independent refactor_validator, GPT-6 Astra high.
Environment: read-only local PowerShell outside sandbox, exit 0; no tests or
firewall/installation mutations.

## Current installed package

The native optional root and corrected cb/2 package exist. Legacy package and
profile staging roots are absent. Runtime manifest SHA-256 is
`1bca3c4e5706771877ad837398e7930206c8f74eb03e9804a093a4c78f0b6262`, matching
current authority. Zero runtime .pyc and zero targeted Librosa .nbc/.nbi files were
observed. No migration, payload repair or staging/cache deletion is implied by
that observed state. Ordinary cb/cache exists and inference can update it outside
the verified payload. All seven documented model/interpreter paths exist.

The harness isolates WebView storage, not native optional-package storage. Native
APPLICATION_DATA_ROOT comes from app_local_data_dir()/tts; there is no existing
harness override. Snapshot/discovery can repair/migrate a legacy package and clean
staging/cache, so test use is not a general no-installed-state-effects guarantee.
The director permits ordinary bounded inference/cache use for requested checks,
but no install/download/payload repair.

## Actual offline prerequisite blocker

Native supervision prefers the verified installed Chatterbox interpreter over the
developer interpreter configured by VOXLEAF_TTS_CHATTERBOX_PYTHON. Portfolio
preflight and interpreter-specific cleanup checks inspect the latter. The actual
installed interpreter exists but has zero matching enabled outbound blocking
rules under `VoxLeaf TTS Benchmark Offline`, and zero under any other name.
Documented developer environment setup cannot prove isolation of the interpreter
actually executed. No firewall rule was added or changed.

The mandatory model-backed portfolio gate is BLOCKED until an exact installed-
interpreter outbound block is authorized/provisioned or an already authorized
isolated test installation/account supplies that prerequisite. Recheck actual
interpreter coverage before running. Do not silently substitute developer-path
preflight, weaken offline requirements, or edit the harness in this unit.

## Coverage limits

The portfolio includes the same no-flag native-startup smoke, so one successful
full portfolio subsumes separate native-startup. It does not assert action-level
reset/removal order or rejection timing; direct tests retain that responsibility.
Interpreter-bound process cleanup also targets the configured developer path;
native supervisor and WebView/resource cleanup assertions remain relevant but
must not be represented as a complete installed-interpreter process scan.
