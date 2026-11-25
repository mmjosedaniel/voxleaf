"""Resolve proposed Windows pins in scratch, preserving the published v7 graph."""

from __future__ import annotations

import argparse
import difflib
import re
import subprocess
from datetime import UTC, datetime, timedelta
from pathlib import Path

PROFILE = Path("services/tts/release/profiles/chatterbox-v7")
PIN = re.compile(r"([A-Za-z0-9_.-]+)==([^\s;]+)")


def compile_lock(source: Path, output: Path, cutoff: str) -> None:
    subprocess.run(
        [
            "uv", "pip", "compile", str(source), "--python-version", "3.12",
            "--python-platform", "windows", "--no-deps", "--generate-hashes",
            "--exclude-newer", cutoff, "--output-file", str(output), "--quiet",
        ],
        check=True,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    output = args.output.resolve()
    output.mkdir(exist_ok=False, parents=True)
    lines = (PROFILE / "requirements.in").read_text(encoding="utf-8").splitlines()
    cutoff = (datetime.now(UTC) - timedelta(days=7)).strftime("%Y-%m-%dT00:00:00Z")
    # The reviewed input is the allowlist. URL archives and CUDA wheels stay exact.
    relaxed = [PIN.sub(r"\1>=\2", line) if PIN.fullmatch(line) else line for line in lines]
    source = output / "requirements.in"
    source.write_text("\n".join(relaxed) + "\n", encoding="utf-8")
    lock = output / "requirements.lock"
    compile_lock(source, lock, cutoff)
    selected = {}
    for line in lock.read_text(encoding="utf-8").splitlines():
        match = PIN.fullmatch(line.removesuffix(" \\"))
        if match:
            selected[match[1].lower()] = match[2]
    candidate = []
    for line in lines:
        pin = PIN.fullmatch(line)
        candidate.append(f"{pin[1]}=={selected[pin[1].lower()]}" if pin else line)
    source.write_text("\n".join(candidate) + "\n", encoding="utf-8")
    # Recompile the exact proposal so this pair can be reviewed together.
    compile_lock(source, lock, cutoff)
    delta = list(difflib.unified_diff(lines, candidate, "published", "candidate", lineterm=""))
    tracked_lock = (PROFILE / "requirements.lock").read_text(encoding="utf-8").splitlines()
    lock_delta = difflib.unified_diff(tracked_lock, lock.read_text(encoding="utf-8").splitlines(),
                                      "published.lock", "candidate.lock", lineterm="")
    (output / "lock.diff").write_text("\n".join(lock_delta) + "\n", encoding="utf-8")
    print(f"Windows x64 / Python 3.12, eligible releases through {cutoff}")
    print("\n".join(delta) if delta else "No eligible pin changes.")


if __name__ == "__main__":
    main()
