# Standalone native environment diagnosis

Read-only clean_code_auditor GPT-6.1 Sol high, independently corroborated by
refactor_validator after DESKTOP-PCM-01-POST-CHANGE-01. No source/test edits.

Post01 D/B PASS, N exit1 at tts-service-lifecycle-probe-failed; H unrun.
The log does not expose the inner lifecycle failure code. No PCM defect claimed.

The baseline03 and post01 environment recipes are byte-identical, SHA256
205C2B6BD8144C07CF24F40D07D045C5D0CE028476B701BE42C93AE44B95F34B.
They enable real Qwen, Piper and Chatterbox profiles. Rust
ServiceChild::configured prioritizes DEV_ENABLED=1, then enabled Piper, over
its fake fallback. The standalone lifecycle probe requires the fake's exact
19,200-byte/4,800-sample response. Its call path invokes process-client/native
transport and never constructs AdaptivePcmPlayer or WebAudioPcmPlaybackBackend.

The existing H runner's modelFreeLifecycleEnvironment removes all twelve
profile-specific keys before --lifecycle-only; its Node test verifies this.
Standalone N does not perform that sanitation. Outer environment equality
therefore did not imply equal lifecycle child environments.

Director decision: authorize fresh full D/B/N/H validation under a new immutable
Report ID, preserving the failed report. Run unchanged N command in a fresh
PowerShell process with the twelve existing profile keys absent, following the
existing H policy. Retain PATH/Corepack, driver and offline controls. Run H with
the original complete real-profile recipe. No source correction, test change,
timeout change, installation, firewall change or scope expansion. If sanitized
N fails, preserve it and inspect only the existing content-safe lifecycle result.

This is an environment correction, not a source correction cycle or acceptance.
