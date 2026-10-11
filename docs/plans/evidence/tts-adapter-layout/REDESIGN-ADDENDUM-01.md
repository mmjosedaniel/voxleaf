# Accepted redesign audit and work-order addendum

ID: TTS-ADAPTER-LAYOUT-01-REDESIGN-ADDENDUM-01.
Parent: REDESIGN-WORK-ORDER-01, SHA256
`58dc8270167dff2c35915731472330df0218eb2995fef2824caa1e2fca455b23`.
Director accepts the configured clean_code_auditor's read-only reassessment.
The same user-authorized redesign, pre-edit PASS, HEAD, closed three editable
paths and complete 35-path acceptance unit remain in force. No new unit or
baseline cleanliness is asserted. The worker stopped before further writing.

After formatting, the worker reports 439 incremental lines against report03
and 3350 combined additional lines. Independent verification remains required.
The previous 400/3400 limits were insufficient for readable actual-policy
coverage. Replace only those limits with **520 incremental /3500 combined**;
generated 151/300 and mechanical 1614 remain unchanged. This accommodates
required coverage and the concrete findings below, without compression or
test removal. Stop again if either ceiling is exceeded after formatting.

Required completion before freeze:

1. Bind the optional probe to the exact platform-specific default audit event.
   Local Python 3.12.10 Windows subprocess implementation emits executable=None
   for default subprocess.run('lscpu'), unlike the POSIX executable string.
   Admit only that exact default context and existing verified source/function/
   module provenance; every launch still raises PermissionError before execution.
   Reject explicit executable override, shell, extra arguments, cwd/env and
   wrong source/module. The copied interpreter's projection requires independent
   confirmation; local stdlib inspection alone is not copied-provider evidence.
2. Require exactly one optional denied probe at Chatterbox audit admission and
   zero for Piper. Reject zero with budget one for both forced and orderly exit.
3. Add separate wrong-source and wrong-module fixtures, a benign os.system
   sentinel that would create a marker, and an assertion binding sys.executable
   to the canonical locked .venv interpreter. Preserve no-fallback/no-skip rules.
4. Prefix each Python audit snapshot with a newline as well as its existing
   trailing newline/flush. Otherwise preceding unterminated diagnostic output
   can hide a denial record. Exercise real locked Python with preceding noise,
   a caught unexpected denial and os._exit; forced admission must reject the
   retained violation without an atexit record.

All existing policy, lifecycle, package, privacy, source and artifact invariants
remain mandatory. No runtime/dependency/model/package changes or rebuilding;
no new files or CLI modes. Worker owns implementation and restricted host
format/syntax checks only; validator owns tests and all 22 final gates after
freeze. Provider imports and model/native execution remain blocked until fresh
offline prerequisites are independently verified. No Git mutations authorized.
