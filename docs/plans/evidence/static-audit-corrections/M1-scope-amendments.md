# SAC implementation scope amendments

2026-10-28, before additional fixture/integration edits.

SAC-09 shares a repository-authored solid-color 3x2 JPEG fixture across unit,
Chromium and WebView2 checks. Add `apps/desktop/tests/fixtures/jpeg-fixture.ts`
and `apps/desktop/tests/fixtures/oriented-raster-epub-fixture.mjs` to the
allowlist. They contain only synthetic pixels, EXIF orientation and synthetic
EPUB markup; existing frozen fixtures and corpora remain unchanged.

The host has an existing VoxLeaf installation. Updated execution authorization
permits uninstalling and reinstalling that installation for L1. Preserve user
data, record original artifact/state identities privately, use the existing
lifecycle journal safeguards and verify byte restoration. Reinstall the final
verified package after the lifecycle script, whose normal terminal state is
uninstalled. Do not treat the prior M0 no-existing-install restriction as an
authorization to discard data. No new dependencies or runtime payloads are needed.

The retained installer predates v7 hooks/resources and is not an equivalent L1
fixture. Build `package:windows:verified-core` once on final sources, reusing the
verified Piper payload. P1 runs against the resulting release-locked layout.
Default Tauri and release-locked executables are different artifacts and each
must retain its own acceptance identity.

Historical Python result reuse lacks complete execution-time tool/environment
and artifact proof. Run current Python leaves rather than reconstructing it.
Historical runtime/model payloads remain artifact candidates only, subject to
current verification. No old runtime PASS accepts the new executable.
