from voxleaf_tts import service_version


def test_service_version_is_available_without_runtime_dependencies() -> None:
    assert service_version() == "0.0.0"
