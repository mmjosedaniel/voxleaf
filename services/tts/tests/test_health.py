from voxleaf_tts import service_version


def test_service_version_is_available_without_starting_protocol_runtime() -> None:
    assert service_version() == "0.0.0"
