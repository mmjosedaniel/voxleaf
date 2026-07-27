"""Model-free placement tests for the exact v5 Qwen workers."""

from __future__ import annotations

import sys
from collections.abc import Iterator
from pathlib import Path
from types import ModuleType, SimpleNamespace
from typing import Final

import pytest

from benchmarks.adapters.manifest import (
    QWEN_V3_CANDIDATE_ID,
    AdapterConfigurationError,
    CandidateConfiguration,
    load_v3_candidate_profile,
)
from benchmarks.adapters.qwen3 import Qwen3TtsAdapter
from benchmarks.batch_contracts import (
    BatchGenerationRequest,
    BatchUnitRequest,
    BatchWorkIdentity,
)
from benchmarks.v5_authority import CPU_PROFILE_ID, GPU_PROFILE_ID

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
CPU_CANDIDATE_ID: Final = "qwen3-tts-1-7b-customvoice-cpu-fp32-v5"


class _Device:
    def __init__(self, label: str) -> None:
        device_type, _, raw_index = label.partition(":")
        self.type = device_type
        self.index = int(raw_index) if raw_index else None


class _Tensor:
    def __init__(self, label: str) -> None:
        self.device = _Device(label)


class _Module:
    def __init__(self, parameters: list[_Tensor], buffers: list[_Tensor]) -> None:
        self._parameters = parameters
        self._buffers = buffers

    def parameters(self) -> Iterator[_Tensor]:
        return iter(self._parameters)

    def buffers(self) -> Iterator[_Tensor]:
        return iter(self._buffers)

    def to(self, device: str) -> _Module:
        for tensor in (*self._parameters, *self._buffers):
            tensor.device = _Device(device)
        return self


def _configuration(root: Path) -> CandidateConfiguration:
    profile = load_v3_candidate_profile(REPOSITORY_ROOT, QWEN_V3_CANDIDATE_ID)
    return CandidateConfiguration(
        candidate_id=profile.candidate_id,
        artifact_root=root,
        model_revision=profile.model_revision,
        voice_id=profile.voice_id,
        provider=profile.provider,
        precision=profile.precision,
        offline=True,
    )


def _request() -> BatchGenerationRequest:
    return BatchGenerationRequest(
        call_index=0,
        phase="measured",
        pass_index=1,
        pair_id="v5-cpu-p01-es-v4-arrival",
        attempt=1,
        identity=BatchWorkIdentity("fixture-session", "fixture-generation"),
        units=(
            BatchUnitRequest(
                unit_id="es-v4-arrival",
                source_sequence=0,
                text="Texto sintético.",
            ),
        ),
    )


def _runtime_modules(
    *,
    device: str,
    cuda_available: bool,
    cuda_device_count: int,
    calls: dict[str, object],
) -> tuple[ModuleType, ModuleType]:
    tokenizer_parameter = _Tensor(device)
    tokenizer_buffer = _Tensor(device)
    autoregressive_parameter = _Tensor(device)
    tokenizer_model = _Module([tokenizer_parameter], [tokenizer_buffer])

    class Inner(_Module):
        def __init__(self) -> None:
            super().__init__(
                [autoregressive_parameter, tokenizer_parameter],
                [tokenizer_buffer],
            )
            self.speech_tokenizer = SimpleNamespace(
                model=tokenizer_model,
                device=_Device(device),
            )
            self.hf_device_map = {"": _Device(device)}

    class Waveform:
        shape = (240_000,)

        def __len__(self) -> int:
            return 240_000

    class Model:
        def __init__(self) -> None:
            self.model = Inner()

        def generate_custom_voice(self, **kwargs: object) -> tuple[list[Waveform], int]:
            calls["generate"] = kwargs
            return [Waveform()], 24_000

    class ModelClass:
        @staticmethod
        def from_pretrained(path: str, **kwargs: object) -> Model:
            calls["path"] = path
            calls["load"] = kwargs
            calls["cuda_visible_at_load"] = __import__("os").environ.get("CUDA_VISIBLE_DEVICES")
            return Model()

    thread_state = {"intra": 0, "interop": 0}
    torch = ModuleType("torch")
    torch.__dict__.update(
        {
            "bfloat16": object(),
            "float32": object(),
            "device": _Device,
            "set_num_threads": lambda value: thread_state.update(intra=value),
            "set_num_interop_threads": lambda value: thread_state.update(interop=value),
            "get_num_threads": lambda: thread_state["intra"],
            "get_num_interop_threads": lambda: thread_state["interop"],
            "cuda": SimpleNamespace(
                is_available=lambda: cuda_available,
                device_count=lambda: cuda_device_count,
                is_bf16_supported=lambda: True,
                reset_peak_memory_stats=lambda: calls.update(reset_peak=True),
                max_memory_reserved=lambda: calls.update(max_reserved=True) or 1,
                empty_cache=lambda: calls.update(empty_cache=True),
            ),
        }
    )
    qwen = ModuleType("qwen_tts")
    qwen.__dict__["Qwen3TTSModel"] = ModelClass
    return torch, qwen


def test_cpu_adapter_hides_cuda_before_import_and_verifies_full_cpu_placement(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("HF_HUB_OFFLINE", "1")
    monkeypatch.setenv("TRANSFORMERS_OFFLINE", "1")
    monkeypatch.delenv("CUDA_VISIBLE_DEVICES", raising=False)
    monkeypatch.delitem(sys.modules, "torch", raising=False)
    monkeypatch.delitem(sys.modules, "qwen_tts", raising=False)
    profile = load_v3_candidate_profile(REPOSITORY_ROOT, QWEN_V3_CANDIDATE_ID)
    calls: dict[str, object] = {}
    torch, qwen = _runtime_modules(
        device="cpu",
        cuda_available=False,
        cuda_device_count=0,
        calls=calls,
    )
    imported: list[str] = []

    def importer(name: str) -> ModuleType:
        imported.append(name)
        if name == "torch":
            assert __import__("os").environ["CUDA_VISIBLE_DEVICES"] == "-1"
        return {"torch": torch, "qwen_tts": qwen}[name]

    monkeypatch.setattr(
        "benchmarks.adapters.qwen3.validate_configuration",
        lambda _profile, _configuration: tmp_path.resolve(),
    )
    monkeypatch.setattr(
        "benchmarks.adapters.qwen3.verify_artifacts",
        lambda _root, _artifacts: None,
    )
    adapter = Qwen3TtsAdapter(
        profile,
        _configuration(tmp_path),
        placement_profile_id=CPU_PROFILE_ID,
        worker_candidate_id=CPU_CANDIDATE_ID,
        importer=importer,
        version_reader={
            "qwen-tts": "0.1.1",
            "torch": "2.9.1+cu128",
            "torchaudio": "2.9.1+cu128",
        }.__getitem__,
    )

    adapter.load()
    outputs = adapter.generate_batch(_request())
    evidence = adapter.placement_evidence()

    assert imported == ["torch", "qwen_tts"]
    assert adapter.capabilities().candidate_id == CPU_CANDIDATE_ID
    assert calls["cuda_visible_at_load"] == "-1"
    assert calls["load"] == {
        "device_map": "cpu",
        "dtype": torch.__dict__["float32"],
        "attn_implementation": "sdpa",
        "local_files_only": True,
    }
    assert evidence is not None
    assert evidence.profile_id == CPU_PROFILE_ID
    assert evidence.autoregressive_model_device == "cpu"
    assert evidence.speech_tokenizer_model_device == "cpu"
    assert evidence.speech_tokenizer_wrapper_device == "cpu"
    assert not evidence.cuda_available
    assert evidence.cuda_device_count == 0
    assert evidence.intra_op_threads == 12
    assert evidence.interop_threads == 1
    assert outputs[0].sample_count == 240_000
    assert adapter.framework_memory_high_water_bytes() == 0
    assert "max_reserved" not in calls
    adapter.close()
    assert "empty_cache" not in calls


def test_cpu_adapter_fails_closed_if_cuda_remains_visible(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("HF_HUB_OFFLINE", "1")
    monkeypatch.setenv("TRANSFORMERS_OFFLINE", "1")
    monkeypatch.delitem(sys.modules, "torch", raising=False)
    monkeypatch.delitem(sys.modules, "qwen_tts", raising=False)
    profile = load_v3_candidate_profile(REPOSITORY_ROOT, QWEN_V3_CANDIDATE_ID)
    calls: dict[str, object] = {}
    torch, qwen = _runtime_modules(
        device="cpu",
        cuda_available=True,
        cuda_device_count=1,
        calls=calls,
    )
    monkeypatch.setattr(
        "benchmarks.adapters.qwen3.validate_configuration",
        lambda _profile, _configuration: tmp_path.resolve(),
    )
    monkeypatch.setattr(
        "benchmarks.adapters.qwen3.verify_artifacts",
        lambda _root, _artifacts: None,
    )
    adapter = Qwen3TtsAdapter(
        profile,
        _configuration(tmp_path),
        placement_profile_id=CPU_PROFILE_ID,
        worker_candidate_id=CPU_CANDIDATE_ID,
        importer=lambda name: {"torch": torch, "qwen_tts": qwen}[name],
        version_reader={
            "qwen-tts": "0.1.1",
            "torch": "2.9.1+cu128",
            "torchaudio": "2.9.1+cu128",
        }.__getitem__,
    )

    with pytest.raises(
        AdapterConfigurationError,
        match=r"^tts-benchmark-adapter:provider-unavailable$",
    ):
        adapter.load()


@pytest.mark.parametrize("device", ["cuda:0", "meta", "disk"])
def test_cpu_adapter_rejects_non_cpu_tensor_or_device_map(
    device: str,
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("HF_HUB_OFFLINE", "1")
    monkeypatch.setenv("TRANSFORMERS_OFFLINE", "1")
    monkeypatch.delitem(sys.modules, "torch", raising=False)
    monkeypatch.delitem(sys.modules, "qwen_tts", raising=False)
    profile = load_v3_candidate_profile(REPOSITORY_ROOT, QWEN_V3_CANDIDATE_ID)
    calls: dict[str, object] = {}
    torch, qwen = _runtime_modules(
        device=device,
        cuda_available=False,
        cuda_device_count=0,
        calls=calls,
    )
    monkeypatch.setattr(
        "benchmarks.adapters.qwen3.validate_configuration",
        lambda _profile, _configuration: tmp_path.resolve(),
    )
    monkeypatch.setattr(
        "benchmarks.adapters.qwen3.verify_artifacts",
        lambda _root, _artifacts: None,
    )
    adapter = Qwen3TtsAdapter(
        profile,
        _configuration(tmp_path),
        placement_profile_id=CPU_PROFILE_ID,
        worker_candidate_id=CPU_CANDIDATE_ID,
        importer=lambda name: {"torch": torch, "qwen_tts": qwen}[name],
        version_reader={
            "qwen-tts": "0.1.1",
            "torch": "2.9.1+cu128",
            "torchaudio": "2.9.1+cu128",
        }.__getitem__,
    )

    with pytest.raises(
        AdapterConfigurationError,
        match=r"^tts-benchmark-adapter:placement$",
    ):
        adapter.load()


def test_gpu_primary_adapter_freezes_threads_and_exact_cuda_placement(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("HF_HUB_OFFLINE", "1")
    monkeypatch.setenv("TRANSFORMERS_OFFLINE", "1")
    profile = load_v3_candidate_profile(REPOSITORY_ROOT, QWEN_V3_CANDIDATE_ID)
    calls: dict[str, object] = {}
    torch, qwen = _runtime_modules(
        device="cuda:0",
        cuda_available=True,
        cuda_device_count=1,
        calls=calls,
    )
    monkeypatch.setattr(
        "benchmarks.adapters.qwen3.validate_configuration",
        lambda _profile, _configuration: tmp_path.resolve(),
    )
    monkeypatch.setattr(
        "benchmarks.adapters.qwen3.verify_artifacts",
        lambda _root, _artifacts: None,
    )
    adapter = Qwen3TtsAdapter(
        profile,
        _configuration(tmp_path),
        placement_profile_id=GPU_PROFILE_ID,
        importer=lambda name: {"torch": torch, "qwen_tts": qwen}[name],
        version_reader={
            "qwen-tts": "0.1.1",
            "torch": "2.9.1+cu128",
            "torchaudio": "2.9.1+cu128",
        }.__getitem__,
    )

    adapter.load()
    evidence = adapter.placement_evidence()

    assert evidence is not None
    assert evidence.profile_id == GPU_PROFILE_ID
    assert evidence.autoregressive_model_device == "cuda:0"
    assert evidence.cuda_available
    assert evidence.cuda_device_count == 1
    assert evidence.intra_op_threads == 4
    assert evidence.interop_threads == 1
    assert calls["load"] == {
        "device_map": "cuda:0",
        "dtype": torch.__dict__["bfloat16"],
        "attn_implementation": "sdpa",
        "local_files_only": True,
    }


def test_v5_diagnostic_overrides_only_the_generated_token_ceiling(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("HF_HUB_OFFLINE", "1")
    monkeypatch.setenv("TRANSFORMERS_OFFLINE", "1")
    profile = load_v3_candidate_profile(REPOSITORY_ROOT, QWEN_V3_CANDIDATE_ID)
    calls: dict[str, object] = {}
    torch, qwen = _runtime_modules(
        device="cuda:0",
        cuda_available=True,
        cuda_device_count=1,
        calls=calls,
    )
    monkeypatch.setattr(
        "benchmarks.adapters.qwen3.validate_configuration",
        lambda _profile, _configuration: tmp_path.resolve(),
    )
    monkeypatch.setattr(
        "benchmarks.adapters.qwen3.verify_artifacts",
        lambda _root, _artifacts: None,
    )
    adapter = Qwen3TtsAdapter(
        profile,
        _configuration(tmp_path),
        placement_profile_id=GPU_PROFILE_ID,
        diagnostic_max_new_tokens=256,
        importer=lambda name: {"torch": torch, "qwen_tts": qwen}[name],
        version_reader={
            "qwen-tts": "0.1.1",
            "torch": "2.9.1+cu128",
            "torchaudio": "2.9.1+cu128",
        }.__getitem__,
    )

    adapter.load()
    adapter.generate_batch(_request())

    generated = calls["generate"]
    assert isinstance(generated, dict)
    assert generated["max_new_tokens"] == 256


@pytest.mark.parametrize("value", [0, 255, 257, 2048])
def test_v5_diagnostic_rejects_every_other_token_ceiling(
    value: int,
    tmp_path: Path,
) -> None:
    profile = load_v3_candidate_profile(REPOSITORY_ROOT, QWEN_V3_CANDIDATE_ID)
    with pytest.raises(
        AdapterConfigurationError,
        match=r"^tts-benchmark-adapter:authority$",
    ):
        Qwen3TtsAdapter(
            profile,
            _configuration(tmp_path),
            placement_profile_id=GPU_PROFILE_ID,
            diagnostic_max_new_tokens=value,
        )
