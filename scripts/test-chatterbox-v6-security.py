"""Real dependency controls on disposable synthetic files; never user data."""

from __future__ import annotations

import argparse
import importlib.metadata
import json
import os
from pathlib import Path
import socket
import tempfile
import zipfile


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--baseline", action="store_true")
    parser.add_argument("--temporary-root", type=Path, required=True)
    args = parser.parse_args()
    assert os.name == "nt", "windows-wheel-boundary-required"
    assert args.temporary_root.is_absolute() and args.temporary_root.is_dir()
    network_attempts = 0

    def deny_network(*_args: object, **_kwargs: object) -> None:
        nonlocal network_attempts
        network_attempts += 1
        raise AssertionError("unexpected-network-request")

    socket.socket.connect = deny_network
    socket.socket.connect_ex = deny_network
    socket.create_connection = deny_network
    from filelock import FileLock, ReadWriteLock, Timeout
    from setuptools.wheel import Wheel

    expected = (
        {"filelock": "3.32.0", "setuptools": "83.0.0"}
        if args.baseline
        else {"filelock": "4.2.1", "setuptools": "84.1.0"}
    )
    versions = {name: importlib.metadata.version(name) for name in expected}
    assert versions == expected, "unexpected-probe-versions"
    with tempfile.TemporaryDirectory(prefix="v6-probe-", dir=args.temporary_root) as directory:
        root = Path(directory)
        outside = root / "outside"
        outside.mkdir()
        canary = outside / "canary.txt"
        canary.write_bytes(b"synthetic unchanged canary")

        def install(namespace: str, label: str) -> Path:
            case = root / label
            case.mkdir()
            wheel = case / "synthetic_probe-1.0-py3-none-any.whl"
            with zipfile.ZipFile(wheel, "w") as archive:
                metadata = "synthetic_probe-1.0.dist-info"
                archive.writestr(f"{metadata}/WHEEL", "Wheel-Version: 1.0\nTag: py3-none-any\n")
                archive.writestr(f"{metadata}/METADATA", "Name: synthetic-probe\nVersion: 1.0\n")
                archive.writestr(f"{metadata}/namespace_packages.txt", namespace + "\n")
                archive.writestr("safe/child/payload.txt", "synthetic payload")
            destination = case / "installed"
            Wheel(str(wheel)).install_as_egg(str(destination))
            return destination

        legitimate = install("safe\nsafe.child", "legitimate")
        assert (legitimate / "safe/child/__init__.py").is_file()
        assert (legitimate / "safe/child/payload.txt").read_text() == "synthetic payload"
        bad_names = [str(outside)]
        if not args.baseline:
            bad_names += ["\\\\?\\" + str(outside), "safe/child", "safe\\child", "safe..child"]
        rejected = 0
        for index, namespace in enumerate(bad_names):
            try:
                install(namespace, f"invalid-{index}")
            except ValueError as error:
                assert "invalid namespace package name" in str(error)
                rejected += 1
            else:
                if args.baseline and (outside / "__init__.py").is_file():
                    assert canary.read_bytes() == b"synthetic unchanged canary"
                    print(json.dumps({"result": "vulnerable-baseline-reproduced", "versions": versions,
                                      "legitimate_controls": 1, "outside_file_created": True,
                                      "network_attempts": network_attempts}))
                    raise SystemExit(1)
                raise AssertionError("unsafe-namespace-not-rejected")
        assert not (outside / "__init__.py").exists()
        assert canary.read_bytes() == b"synthetic unchanged canary"

        lock_path = root / "exclusive.lock"
        first, second = FileLock(lock_path), FileLock(lock_path)
        with first.acquire(timeout=1):
            try:
                second.acquire(timeout=0)
            except Timeout:
                pass
            else:
                second.release()
                raise AssertionError("exclusive-lock-admitted-competing-owner")
        with second.acquire(timeout=1):
            assert second.is_locked
        shared = ReadWriteLock(root / "shared.lock")
        with shared.read_lock(timeout=1):
            pass
        with shared.write_lock(timeout=1):
            pass
        assert network_attempts == 0
        print(json.dumps({"result": "pass", "versions": versions,
                          "rejected_namespaces": rejected, "legitimate_controls": 4,
                          "posix_exploit": "not-applicable-on-windows",
                          "network_attempts": network_attempts}))


if __name__ == "__main__":
    main()
