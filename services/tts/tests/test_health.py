import subprocess
import sys
from pathlib import Path
from textwrap import dedent


def test_service_version_is_available_without_starting_protocol_runtime() -> None:
    source_root = Path(__file__).resolve().parents[1] / "src"
    script = dedent(
        """
        import sys

        sys.path.insert(0, sys.argv[1])
        assert "voxleaf_tts" not in sys.modules

        def reject_child_process(event, args):
            if event in {"subprocess.Popen", "os.system", "os.posix_spawn", "os.fork"}:
                raise AssertionError("package import must not start a child process")

        sys.addaudithook(reject_child_process)

        import voxleaf_tts

        assert voxleaf_tts.service_version() == "0.0.0"
        assert not any(name.startswith("voxleaf_tts.") for name in sys.modules)
        """
    )
    completed = subprocess.run(
        [sys.executable, "-I", "-c", script, str(source_root)],
        stdin=subprocess.DEVNULL,
        capture_output=True,
        check=False,
        timeout=5,
    )

    assert completed.returncode == 0
    assert completed.stdout == b""
    assert completed.stderr == b""
