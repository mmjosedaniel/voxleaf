"""Dependency-free foundation for the local VoxLeaf TTS service."""

__all__ = ["service_version"]

_SERVICE_VERSION = "0.0.0"


def service_version() -> str:
    """Return the service contract version without starting runtime work."""
    return _SERVICE_VERSION
