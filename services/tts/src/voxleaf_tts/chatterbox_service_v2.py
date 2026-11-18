"""Chatterbox successor with the protocol-v2 load failure record."""

from .adapters.chatterbox import ChatterboxMultilingualTtsEngine
from .chatterbox_service import run_chatterbox
from .protocol import CHATTERBOX_PROTOCOL_VERSION


def main() -> int:
    return run_chatterbox(ChatterboxMultilingualTtsEngine, CHATTERBOX_PROTOCOL_VERSION)


if __name__ == "__main__":
    raise SystemExit(main())
