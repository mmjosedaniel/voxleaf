"""Check an isolated packaged runtime with synthetic text and memory-only PCM."""

from __future__ import annotations

import argparse
import array
import importlib.metadata
import json
import math
import os
import socket
import time
from pathlib import Path


def install_native_observation(receipt_path: Path, private_origins: list[str]) -> None:
    """Opt-in native-harness observer; never installs in ordinary product startup."""
    from voxleaf_tts.chatterbox_adapter import ChatterboxMultilingualTtsEngine

    observed: dict[str, object] = {
        "privateDllOrigins": private_origins,
        "networkAttempts": 0,
        "audioFilesWritten": 0,
    }

    def save() -> None:
        receipt_path.write_text(json.dumps(observed, sort_keys=True), encoding="utf-8")

    def deny_network(*_args: object, **_kwargs: object) -> None:
        observed["networkAttempts"] = int(observed["networkAttempts"]) + 1
        save()
        raise AssertionError("native-candidate-network-disabled")

    socket.socket.connect = deny_network
    socket.socket.connect_ex = deny_network
    socket.create_connection = deny_network

    def audit(event: str, arguments: tuple[object, ...]) -> None:
        if event == "open" and isinstance(arguments[0], (str, bytes)):
            name = os.fsdecode(arguments[0]).lower()
            mode = arguments[1]
            flags = arguments[2]
            writing = (
                isinstance(mode, str) and any(flag in mode for flag in "wax+")
            ) or (
                isinstance(flags, int)
                and bool(flags & (os.O_WRONLY | os.O_RDWR | os.O_CREAT))
            )
            if writing and name.endswith((".wav", ".pcm", ".mp3", ".ogg", ".flac")):
                observed["audioFilesWritten"] = int(observed["audioFilesWritten"]) + 1
                save()
                raise AssertionError("native-audio-persistence-disabled")

    sys_module = __import__("sys")
    sys_module.addaudithook(audit)
    original_load = ChatterboxMultilingualTtsEngine.load

    def observe_load(engine: object) -> None:
        original_load(engine)
        import torch

        model = engine._model
        transformer = model.t3.tfmr
        observed["parameterDtypes"] = {
            name: sorted({str(parameter.dtype) for parameter in module.parameters()})
            for name, module in (
                ("t3", model.t3),
                ("s3gen", model.s3gen),
                ("ve", model.ve),
            )
        }
        observed["cudaCapability"] = list(torch.cuda.get_device_capability())
        observed["autocastEnabledAtLoad"] = torch.is_autocast_enabled("cuda")
        original_forward = transformer.forward

        def observe_forward(*args: object, **kwargs: object) -> object:
            if "activationDtypes" not in observed:
                dtypes = sorted(
                    {
                        str(value.dtype)
                        for value in (*args, *kwargs.values())
                        if isinstance(value, torch.Tensor) and value.is_floating_point()
                    }
                )
                if dtypes:
                    observed["activationDtypes"] = dtypes
                    observed["autocastEnabledAtForward"] = torch.is_autocast_enabled(
                        "cuda"
                    )
                    save()
            return original_forward(*args, **kwargs)

        transformer.forward = observe_forward
        save()

    ChatterboxMultilingualTtsEngine.load = observe_load
    save()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--models", type=Path, required=True)
    parser.add_argument("--language", choices=("es", "en"), required=True)
    parser.add_argument("--package-version", choices=("5", "6", "7"), default="5")
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
        for name in (
            "certifi",
            "pillow",
            "torch",
            "torchaudio",
            "chatterbox-tts",
            "filelock",
            "setuptools",
        )
    }
    assert versions["certifi"] == "2026.10.19"
    assert versions["pillow"] == "13.0.0"
    if args.package_version in {"6", "7"}:
        assert versions["filelock"] == "4.2.1"
        assert versions["setuptools"] == "84.1.0"
    if args.package_version == "7":
        versions["msgpack"] = importlib.metadata.version("msgpack")
        assert versions["msgpack"] == "1.2.3"
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
        print(
            json.dumps(
                {
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
                }
            )
        )
    finally:
        engine.cleanup()


if __name__ == "__main__":
    main()
