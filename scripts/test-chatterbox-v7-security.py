"""Bounded real-msgpack error cleanup and legitimate decoding controls."""

from __future__ import annotations

import argparse
import gc
import importlib.metadata
import json
import socket
import tracemalloc


class ProbeHookError(ValueError):
    pass


def reject_hook(_value: object) -> None:
    raise ProbeHookError("synthetic-hook-rejection")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--baseline", action="store_true")
    args = parser.parse_args()
    network_attempts = 0

    def deny_network(*_args: object, **_kwargs: object) -> None:
        nonlocal network_attempts
        network_attempts += 1
        raise AssertionError("unexpected-network-request")

    socket.socket.connect = deny_network
    socket.socket.connect_ex = deny_network
    socket.create_connection = deny_network
    import msgpack

    version = importlib.metadata.version("msgpack")
    assert version == ("1.2.1" if args.baseline else "1.2.3"), "unexpected-probe-version"
    assert msgpack.Unpacker.__module__ == "msgpack._cmsgpack", "c-extension-required"
    legitimate = {"nested": [1, True, None, {"binary": b"synthetic"}], "unicode": "voz"}
    packed = msgpack.packb(legitimate, use_bin_type=True)
    assert msgpack.unpackb(packed, raw=False) == legitimate
    stream = msgpack.Unpacker(raw=False)
    stream.feed(packed[:4])
    assert list(stream) == []
    stream.feed(packed[4:] + packed)
    assert list(stream) == [legitimate, legitimate]
    # Librosa's trusted interval map deliberately accepts numeric keys.
    numeric = {0.5: [1, 2], 2: "interval"}
    assert msgpack.unpackb(msgpack.packb(numeric), strict_map_key=False) == numeric
    stream = msgpack.Unpacker()
    stream.feed(msgpack.packb([1, [2, 3]]) + msgpack.packb("skip") + msgpack.packb(17))
    assert stream.unpack() == [1, [2, 3]]
    stream.skip()
    assert stream.unpack() == 17
    del stream

    retained: dict[str, int] = {}
    # At most 192 MiB of intentional decoded payload if all six paths leak.
    value = b"x" * (2 * 1024 * 1024)
    for name, payload, options in (
        ("integer-key", msgpack.packb({42: value}), {}),
        ("float-key", msgpack.packb({0.5: value}), {}),
        ("list-hook", msgpack.packb([value]), {"list_hook": reject_hook}),
    ):
        for streaming in (False, True):
            def reject_once() -> None:
                decoder = None
                try:
                    if streaming:
                        decoder = msgpack.Unpacker(**options)
                        decoder.feed(payload)
                        decoder.unpack()
                    else:
                        msgpack.unpackb(payload, **options)
                except ValueError as error:
                    if name == "list-hook":
                        assert isinstance(error, ProbeHookError)
                    else:
                        assert "strict_map_key" in str(error)
                else:
                    raise AssertionError("malformed-input-accepted")
                finally:
                    del decoder

            reject_once()
            gc.collect()
            tracemalloc.start()
            before = tracemalloc.get_traced_memory()[0]
            for _ in range(16):
                reject_once()
            gc.collect()
            retained[f"{name}:{'stream' if streaming else 'unpackb'}"] = (
                tracemalloc.get_traced_memory()[0] - before
            )
            tracemalloc.stop()
    leaks = [name for name, growth in retained.items() if growth > 4 * 1024 * 1024]
    assert network_attempts == 0
    print(json.dumps({
        "result": "memory-leak-reproduced" if leaks else "pass",
        "version": version,
        "baseline": args.baseline,
        "retained_bytes": retained,
        "leaking_paths": leaks,
        "legitimate_controls": 4,
        "network_attempts": network_attempts,
    }))
    if leaks:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
