# CO-02 preparation addendum 01

This refines clean staging preparation under CO-02; it is not another source
correction or an expansion of the 35-path source allowlist or diff ceilings.
HEAD remains `7bbad9d5bef3a83c913ea5d7b948213a05bb0362`.

The successful Windows retry was rejected before freeze by complete resource
set comparison (`worker-correction-02/freeze-03.log`). Four retired copied
resources, absent from the current configured installer input set, remain at:

```text
apps/desktop/src-tauri/target/release/resources/release/optional/chatterbox/optional-package-manifest-v2.json
apps/desktop/src-tauri/target/release/resources/release/optional/chatterbox/optional-package-validation-overlay-v1.json
apps/desktop/src-tauri/target/release/resources/release/optional/chatterbox/runtime-package-evidence-v3.json
apps/desktop/src-tauri/target/release/resources/release/optional/chatterbox/source-manifest-v2.json
```

The sole worker may remove only these four exact copied staging files after
preserving and verifying the just-built current outputs and their bytes in a
new recovery capture. Verify each resolved absolute target stays inside the
repository's `apps/desktop/src-tauri/target/release/resources/` tree, is not a
link, and matches its recovery copy before mutation. Historical authority in
`services/tts/release/optional/chatterbox/` is explicitly untouched.

Run only the existing registered `package:windows` preparation after recovery;
its nested Piper writer also requires verified current core backups before
launch. Record the previous successful-but-unfrozen attempt separately. Verify
the full actual resource set and generated installer input directives, then
freeze desktop-02 with new identities. Do not hide or exempt extra files, edit
the builder, reuse an older installer claim, or mutate desktop-01. No acceptance
commands, source edits, Git mutations, installation or publication authorized
by this addendum. Final independent validation remains mandatory.
