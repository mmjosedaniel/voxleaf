"""Check an isolated packaged runtime with synthetic text and memory-only PCM."""

from __future__ import annotations

import argparse
import array
import importlib.metadata
import json
import math
import os
from pathlib import Path
import socket
import time


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--models", type=Path, required=True)
    parser.add_argument("--language", choices=("es", "en"), required=True)
    args = parser.parse_args()
    assert os.environ.get("HF_HUB_OFFLINE") == "1"
    assert os.environ.get("TRANSFORMERS_OFFLINE") == "1"
    assert os.environ.get("NUMBA_CACHE_DIR"), "isolated-numba-cache-required"
    network_attempts = 0

    def deny_network(*_args: object, **_kwargs: object) -> None:
        nonlocal network_attempts
        network_attempts += 1
        raise AssertionError("candidate-network-disabled")

    socket.socket.connect = deny_network
    socket.socket.connect_ex = deny_network
    socket.create_connection = deny_network

    from voxleaf_tts.chatterbox_adapter import ChatterboxMultilingualTtsEngine
    from voxleaf_tts.protocol import MAX_AUDIO_PAYLOAD_BYTES

    versions = {
        name: importlib.metadata.version(name)
        for name in ("certifi", "pillow", "torch", "torchaudio", "chatterbox-tts")
    }
    assert versions["certifi"] == "2026.10.19"
    assert versions["pillow"] == "13.0.0"
    engine = ChatterboxMultilingualTtsEngine(args.models, args.language)
    started = time.monotonic()
    try:
        engine.load()
        engine.warm()
        ready_seconds = time.monotonic() - started
        segment = {
            "text": (
                "Esta prueba verifica la narración local sin guardar archivos de audio."
                if args.language == "es"
                else "This test verifies local narration without saving audio files."
            ),
            "sessionId": "session:security-candidate",
            "generationId": "generation:security-candidate",
            "segmentId": "segment:security-candidate",
        }
        identity = engine.begin("request:security-candidate", segment)
        settled, result = engine.settle()
        assert settled == identity
        assert result.sample_rate_hz == 24000 and result.channel_count == 1
        assert 0 < len(result.payload) <= MAX_AUDIO_PAYLOAD_BYTES
        samples = array.array("f", result.payload)
        assert samples and all(math.isfinite(value) for value in samples)
        assert any(abs(value) > 0.00001 for value in samples)
        payload_bytes = len(result.payload)
        engine.release_result()
        del result, samples
        import torch

        torch_peak_reserved_bytes = torch.cuda.max_memory_reserved()
        cancel_identity = engine.begin("request:cancel-candidate", segment)
        cancel_started = time.monotonic()
        engine.cancel(cancel_identity)
        cancel_ms = (time.monotonic() - cancel_started) * 1000
        assert not engine.has_active_operation
        assert not engine.can_settle
        assert engine.capabilities().local_speech_generation != "supported"
        assert network_attempts == 0
        print(json.dumps({
            "result": "pass",
            "language": args.language,
            "versions": versions,
            "load_and_warm_seconds": round(ready_seconds, 3),
            "pcm_bytes": payload_bytes,
            "torch_peak_reserved_bytes": torch_peak_reserved_bytes,
            "audio_seconds": payload_bytes / (24000 * 4),
            "cancel_ms": round(cancel_ms, 3),
            "network_attempts": network_attempts,
            "audio_files_written": 0,
        }))
    finally:
        engine.cleanup()


if __name__ == "__main__":
    main()
