"""Model-free coverage for the exact bilingual Chatterbox service adapter."""

from __future__ import annotations

import hashlib
import importlib
import io
import json
import struct
import sys
from pathlib import Path
from types import ModuleType, SimpleNamespace
from typing import Any

import pytest

from voxleaf_tts.adapters.chatterbox import (
    CANDIDATE_ID,
    ENGINE_VERSION,
    GENERATION_SETTINGS,
    TORCH_VERSION,
    TORCHAUDIO_VERSION,
    ArtifactIdentity,
    ChatterboxMultilingualTtsEngine,
)
from voxleaf_tts.engine import EngineFailure, EngineFailureCode
from voxleaf_tts.packaging.chatterbox_sources import historical_sources
from voxleaf_tts.protocol import MAX_AUDIO_SAMPLE_COUNT


class FakeSamples:
    def __init__(self, values: list[float]) -> None:
        self.values = values
        self.ndim = 1
        self.size = len(values)

    def __iter__(self) -> Any:
        return iter(self.values)

    def tobytes(self, *, order: str) -> bytes:
        assert order == "C"
        return b"".join(struct.pack("<f", value) for value in self.values)


class FakeFinite:
    def __init__(self, value: bool) -> None:
        self._value = value

    def all(self) -> bool:
        return self._value


class FakeNumpy(ModuleType):
    def __init__(self) -> None:
        super().__init__("numpy")

    @staticmethod
    def asarray(value: object, *, dtype: str, order: str) -> object:
        assert dtype == "<f4"
        assert order == "C"
        return value

    @staticmethod
    def isfinite(value: object) -> FakeFinite:
        samples = value
        assert isinstance(samples, FakeSamples)
        return FakeFinite(all(sample == sample for sample in samples.values))


class FakeTensor:
    def __init__(
        self,
        samples: FakeSamples,
        shape: tuple[int, ...] | None = None,
        operations: list[str] | None = None,
    ) -> None:
        self._samples = samples
        self.shape = (samples.size,) if shape is None else shape
        self.operations = [] if operations is None else operations

    def detach(self) -> FakeTensor:
        self.operations.append("detach")
        return self

    def to(self, device: str) -> FakeTensor:
        assert device == "cpu"
        self.operations.append("cpu")
        return self

    def reshape(self, size: int) -> FakeTensor:
        assert size == -1
        self.operations.append("flatten")
        return FakeTensor(self._samples, (self._samples.size,), self.operations)

    def numpy(self) -> FakeSamples:
        assert len(self.shape) == 1
        return self._samples


class FakeModel:
    def __init__(
        self,
        calls: dict[str, object],
        samples: FakeSamples | None = None,
        failure: Exception | None = None,
    ) -> None:
        self._calls = calls
        self._samples = samples or FakeSamples([0.0, 0.25, -0.25, 0.5])
        self._failure = failure

    def generate(self, text: str, **kwargs: object) -> FakeTensor:
        generations = self._calls.setdefault("generations", [])
        assert isinstance(generations, list)
        generations.append({"text": text, **kwargs})
        if self._failure is not None:
            raise self._failure
        return FakeTensor(self._samples)


def _write_artifacts(root: Path) -> tuple[ArtifactIdentity, ...]:
    artifacts: list[ArtifactIdentity] = []
    for relative, content in (
        ("t3_mtl23ls_v3.safetensors", b"t3-test"),
        ("s3gen.pt", b"s3-test"),
        ("ve.pt", b"ve-test"),
        ("conds.pt", b"conditions-test"),
        ("grapheme_mtl_merged_expanded_v1.json", b"grapheme-test"),
        ("Cangjie5_TC.json", b"cangjie-test"),
    ):
        path = root / relative
        path.write_bytes(content)
        artifacts.append(
            ArtifactIdentity(relative, hashlib.sha256(content).hexdigest(), len(content))
        )
    return tuple(artifacts)


def _runtime(tmp_path: Path) -> tuple[Path, Path, Path]:
    root = tmp_path / "runtime"
    executable = root / "Scripts" / "python.exe"
    distributions = root / "Lib" / "site-packages"
    executable.parent.mkdir(parents=True)
    executable.write_bytes(b"python")
    distributions.mkdir(parents=True)
    return root, executable, distributions


def _adapter(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    language: str = "es",
    *,
    model: FakeModel | None = None,
    versions: dict[str, str] | None = None,
    cuda_available: bool = True,
    bf16_available: bool = True,
    capability: tuple[int, int] = (12, 0),
    adapter_type: type[ChatterboxMultilingualTtsEngine] = ChatterboxMultilingualTtsEngine,
    import_failure: str | None = None,
    model_load_failure: bool = False,
    imported_torch_version: str = TORCH_VERSION,
    cuda_probe_failure: bool = False,
) -> tuple[ChatterboxMultilingualTtsEngine, dict[str, object]]:
    monkeypatch.setenv("HF_HUB_OFFLINE", "1")
    monkeypatch.setenv("TRANSFORMERS_OFFLINE", "1")
    artifact_root = tmp_path / "model"
    artifact_root.mkdir()
    artifacts = _write_artifacts(artifact_root)
    runtime_root, executable, distributions = _runtime(tmp_path)
    calls: dict[str, object] = {}
    selected_model = model or FakeModel(calls)

    class ModelClass:
        @staticmethod
        def from_local(path: str, **kwargs: object) -> FakeModel:
            calls["load_path"] = path
            calls["load"] = kwargs
            if model_load_failure:
                raise RuntimeError("unexpected model load details")
            return selected_model

    def probe_cuda() -> bool:
        if cuda_probe_failure:
            raise RuntimeError("unexpected CUDA query details")
        return cuda_available

    torch = ModuleType("torch")
    torch.__dict__.update(
        {
            "__version__": imported_torch_version,
            "device": lambda value: value,
            "cuda": SimpleNamespace(
                is_available=probe_cuda,
                is_bf16_supported=lambda: bf16_available,
                get_device_capability=lambda: capability,
                get_arch_list=lambda: ["sm_120"],
                reset_peak_memory_stats=lambda: calls.update(reset=True),
                empty_cache=lambda: calls.update(cleaned=True),
            ),
        }
    )
    chatterbox = ModuleType("chatterbox.mtl_tts")
    chatterbox.__dict__["ChatterboxMultilingualTTS"] = ModelClass
    modules = {
        "torch": torch,
        "chatterbox.mtl_tts": chatterbox,
        "numpy": FakeNumpy(),
    }
    selected_versions = versions or {
        "chatterbox-tts": ENGINE_VERSION,
        "torch": TORCH_VERSION,
        "torchaudio": TORCHAUDIO_VERSION,
    }

    def importer(name: str) -> ModuleType:
        if name == import_failure:
            raise ImportError("unexpected import details")
        return modules[name]

    adapter = adapter_type(
        artifact_root,
        language,
        artifacts=artifacts,
        importer=importer,
        version_reader=selected_versions.__getitem__,
        distribution_root_reader=lambda _name: distributions,
        runtime_root=runtime_root,
        runtime_executable=executable,
        python_version=(3, 12),
    )
    return adapter, calls


def _segment(text: str) -> dict[str, object]:
    return {
        "text": text,
        "sessionId": "session:test",
        "generationId": "generation:test",
        "segmentId": "segment:test",
    }


def _vf_0114_run(
    entry: ModuleType,
    adapter: ChatterboxMultilingualTtsEngine,
    monkeypatch: pytest.MonkeyPatch,
    *,
    version: int,
    language: str = "es",
    commands: tuple[str, ...] = ("handshake", "load"),
    wrong_load_identity: bool = False,
    wrong_frame_version: bool = False,
    wrong_payload_version: bool = False,
) -> tuple[int, list[dict[str, Any]]]:
    source = io.BytesIO()
    header = struct.Struct(">4sHBBI")
    for kind in commands:
        control = {
            "schemaVersion": 1,
            "protocolVersion": 1 if wrong_payload_version else version,
            "kind": kind,
            "serviceInstanceId": (
                "service:wrong" if kind == "load" and wrong_load_identity else "service:vf-0114"
            ),
        }
        encoded = json.dumps(control).encode("utf-8")
        frame_version = 1 if wrong_frame_version else version
        source.write(header.pack(b"VLTP", frame_version, 1, 0, len(encoded)) + encoded)
    source.seek(0)
    destination = io.BytesIO()
    with monkeypatch.context() as patch:
        patch.setenv("VOXLEAF_TTS_RUNTIME_CHATTERBOX_LANGUAGE", language)
        patch.setattr(entry, "ChatterboxMultilingualTtsEngine", lambda *_args: adapter)
        patch.setattr(sys, "stdin", SimpleNamespace(buffer=source))
        patch.setattr(sys, "stdout", SimpleNamespace(buffer=destination))
        exit_code = int(entry.main())

    records = []
    destination.seek(0)
    while raw := destination.read(header.size):
        magic, observed_version, kind_value, flags, size = header.unpack(raw)
        assert (magic, observed_version, kind_value, flags) == (b"VLTP", version, 1, 0)
        record = json.loads(destination.read(size))
        assert record["protocolVersion"] == version
        records.append(record)
    return exit_code, records


def test_vf_0114_frozen_v7_conflates_torch_unavailable_and_model_failure(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    # V7 selects this exact frozen closure, even when newer entry points exist.
    root = Path(__file__).resolve().parents[3]
    snapshot = tmp_path / "frozen_v7"
    for relative, contents in historical_sources(root, "3").items():
        target = snapshot / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(contents)
    monkeypatch.syspath_prepend(str(tmp_path))
    entry = importlib.import_module("frozen_v7.chatterbox_service")
    results = []
    for scenario in ("torch", "model"):
        fixture = tmp_path / scenario
        fixture.mkdir()
        adapter, calls = _adapter(
            fixture,
            monkeypatch,
            adapter_type=entry.ChatterboxMultilingualTtsEngine,
            cuda_available=scenario != "torch",
            model_load_failure=scenario == "model",
        )
        exit_code, records = _vf_0114_run(entry, adapter, monkeypatch, version=1)
        assert exit_code == 1
        assert records[-1]["state"] == "failed"
        assert ("load" in calls) == (scenario == "model")
        results.append(records[-2])
    assert results[0] == results[1]
    assert results[0]["reason"] == "engine-failure"


@pytest.mark.parametrize(
    ("case", "reason"),
    [
        ("torch-unavailable", "torch-cuda-unavailable"),
        ("torch-version", "engine-failure"),
        ("import", "engine-failure"),
        ("artifact", "engine-failure"),
        ("probe-exception", "engine-failure"),
        ("bf16", "engine-failure"),
        ("model-load", "engine-failure"),
        ("warm", "engine-failure"),
    ],
)
def test_vf_0114_successor_load_reason(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, case: str, reason: str
) -> None:
    entry = importlib.import_module("voxleaf_tts.chatterbox_service_v2")
    adapter, calls = _adapter(
        tmp_path,
        monkeypatch,
        model=FakeModel({}, failure=RuntimeError("unexpected warm-up details"))
        if case == "warm"
        else None,
        cuda_available=case not in {"torch-unavailable", "torch-version", "import", "artifact"},
        imported_torch_version="unexpected" if case == "torch-version" else TORCH_VERSION,
        import_failure="chatterbox.mtl_tts" if case == "import" else None,
        bf16_available=case != "bf16",
        model_load_failure=case == "model-load",
        cuda_probe_failure=case == "probe-exception",
    )
    if case == "artifact":
        (tmp_path / "model" / "conds.pt").write_bytes(b"changed")

    commands = ("handshake", "load", "warm") if case == "warm" else ("handshake", "load")
    exit_code, records = _vf_0114_run(entry, adapter, monkeypatch, version=2, commands=commands)

    assert exit_code == 1
    assert records[1]["kind"] == "handshakeAccepted"
    assert records[-2] == {
        "schemaVersion": 1,
        "protocolVersion": 2,
        "kind": "error",
        "reason": reason,
        "serviceInstanceId": "service:vf-0114",
        "error": {
            "schemaVersion": 1,
            "code": "internal-failure",
            "category": "internal",
            "severity": "fatal",
        },
    }
    assert records[-1]["state"] == "failed"
    assert ("load" in calls) == (case in {"model-load", "warm"})


@pytest.mark.parametrize("wrong", ["frame-version", "payload-version", "instance", "language"])
def test_vf_0114_successor_requires_matching_connection(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, wrong: str
) -> None:
    entry = importlib.import_module("voxleaf_tts.chatterbox_service_v2")
    adapter, calls = _adapter(tmp_path, monkeypatch, cuda_available=False)
    exit_code, records = _vf_0114_run(
        entry,
        adapter,
        monkeypatch,
        version=2,
        language="unsupported" if wrong == "language" else "es",
        wrong_load_identity=wrong == "instance",
        wrong_frame_version=wrong == "frame-version",
        wrong_payload_version=wrong == "payload-version",
    )
    assert exit_code == 1
    assert not calls
    if wrong == "language":
        assert records == []
    else:
        assert records[-1]["kind"] == "protocolRejected"
        assert records[-1]["reason"] == (
            "identity-mismatch" if wrong == "instance" else "unsupported-protocol-version"
        )


def test_vf_0114_successor_healthy_load_warm_and_shutdown(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    entry = importlib.import_module("voxleaf_tts.chatterbox_service_v2")
    adapter, calls = _adapter(tmp_path, monkeypatch, "en")
    exit_code, records = _vf_0114_run(
        entry,
        adapter,
        monkeypatch,
        version=2,
        language="en",
        commands=("handshake", "load", "warm", "health", "shutdown"),
    )
    assert exit_code == 0
    assert [record.get("state") for record in records if record["kind"] == "state"] == [
        "handshaking",
        "unloaded",
        "loading",
        "warming",
        "ready",
        "ready",
        "stopping",
        "stopped",
    ]
    assert calls["cleaned"] is True


def test_vf_0114_local_v1_does_not_publish_successor_reason(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    entry = importlib.import_module("voxleaf_tts.chatterbox_service")
    adapter, calls = _adapter(tmp_path, monkeypatch, cuda_available=False)
    exit_code, records = _vf_0114_run(entry, adapter, monkeypatch, version=1)
    assert exit_code == 1
    assert not calls
    assert records[-2]["reason"] == "engine-failure"
    assert records[-1]["state"] == "failed"


@pytest.mark.parametrize(
    ("language", "text"),
    [("es", "Una frase local acotada."), ("en", "A bounded local sentence.")],
)
def test_exact_bilingual_load_warm_and_generation(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    language: str,
    text: str,
) -> None:
    adapter, calls = _adapter(tmp_path, monkeypatch, language)

    assert adapter.capabilities().local_speech_generation == "unknown"
    adapter.load()
    assert calls["load_path"] == str(tmp_path / "model")
    assert calls["load"] == {"device": "cuda", "t3_model": "v3"}
    adapter.warm()
    identity = adapter.begin("request:test", _segment(text))
    completed, result = adapter.settle()

    assert completed == identity
    assert result.sample_rate_hz == 24_000
    assert result.channel_count == 1
    assert len(result.payload) == 16
    generations = calls["generations"]
    assert isinstance(generations, list)
    assert generations[-1] == {
        "text": text,
        "language_id": language,
        "audio_prompt_path": None,
        **GENERATION_SETTINGS,
    }
    assert CANDIDATE_ID == "chatterbox-multilingual-v3-cuda-bf16-default-v4"


def test_cancel_is_identity_bound_and_cleans_the_loaded_model(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    adapter, calls = _adapter(tmp_path, monkeypatch)
    adapter.load()
    adapter.warm()
    identity = adapter.begin("request:test", _segment("Texto local."))

    adapter.cancel(identity)

    assert not adapter.has_active_operation
    assert calls["cleaned"] is True
    assert adapter.capabilities().local_speech_generation == "unknown"


@pytest.mark.parametrize(
    ("shape", "samples"),
    [
        ((), [0.25]),
        ((0,), []),
        ((1, 0), []),
        ((2, 2), [0.0, 0.25, -0.25, 0.5]),
        ((4, 1), [0.0, 0.25, -0.25, 0.5]),
        ((1, 1, 4), [0.0, 0.25, -0.25, 0.5]),
        ((1, MAX_AUDIO_SAMPLE_COUNT + 1), [0.25]),
    ],
)
def test_dcr_16_rejects_waveform_shape_before_transfer(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    shape: tuple[int, ...],
    samples: list[float],
) -> None:
    adapter, _calls = _adapter(tmp_path, monkeypatch)
    adapter.load()
    adapter.warm()
    waveform = FakeTensor(FakeSamples(samples), shape)
    monkeypatch.setattr(FakeModel, "generate", lambda *_args, **_kwargs: waveform)
    adapter.begin("request:test", _segment("Synthetic local sentence."))

    with pytest.raises(EngineFailure) as failure:
        adapter.settle()

    assert failure.value.code == EngineFailureCode.FAILURE
    assert waveform.operations == []
    assert not adapter.has_active_operation


@pytest.mark.parametrize("shape", [(4,), (1, 4)])
def test_dcr_16_valid_mono_shapes_have_identical_pcm(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    shape: tuple[int, ...],
) -> None:
    adapter, _calls = _adapter(tmp_path, monkeypatch)
    adapter.load()
    adapter.warm()
    samples = [0.0, 0.25, -0.25, 0.5]
    waveform = FakeTensor(FakeSamples(samples), shape)
    monkeypatch.setattr(FakeModel, "generate", lambda *_args, **_kwargs: waveform)
    identity = adapter.begin("request:test", _segment("Synthetic local sentence."))
    completed, result = adapter.settle()

    assert completed == identity
    assert result.channel_count == 1
    assert result.sample_rate_hz == 24_000
    assert result.payload == struct.pack("<4f", *samples)
    assert waveform.operations == ["detach", "cpu", "flatten"]


@pytest.mark.parametrize(
    ("versions", "cuda_available", "bf16_available", "capability"),
    [
        (
            {"chatterbox-tts": "0.0.0", "torch": TORCH_VERSION, "torchaudio": TORCHAUDIO_VERSION},
            True,
            True,
            (12, 0),
        ),
        (None, False, True, (12, 0)),
        (None, True, False, (12, 0)),
        (None, True, True, (8, 9)),
    ],
)
def test_load_fails_closed_for_unreviewed_runtime_or_provider(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    versions: dict[str, str] | None,
    cuda_available: bool,
    bf16_available: bool,
    capability: tuple[int, int],
) -> None:
    adapter, _calls = _adapter(
        tmp_path,
        monkeypatch,
        versions=versions,
        cuda_available=cuda_available,
        bf16_available=bf16_available,
        capability=capability,
    )

    with pytest.raises(EngineFailure) as failure:
        adapter.load()

    expected = (
        EngineFailureCode.TORCH_CUDA_UNAVAILABLE
        if versions is None and not cuda_available
        else EngineFailureCode.UNAVAILABLE
    )
    assert failure.value.code is expected


def test_language_outside_the_admitted_pair_is_rejected(tmp_path: Path) -> None:
    root = tmp_path / "model"
    root.mkdir()

    with pytest.raises(EngineFailure) as failure:
        ChatterboxMultilingualTtsEngine(root, "fr")

    assert failure.value.code is EngineFailureCode.UNAVAILABLE
