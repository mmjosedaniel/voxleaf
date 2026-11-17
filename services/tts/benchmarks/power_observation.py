"""Read-only Windows scheme/timeout observations; never writes power policy."""

from __future__ import annotations

import ctypes
import sys
import uuid
from dataclasses import asdict, dataclass
from typing import cast


class PowerObservationError(RuntimeError):
    def __init__(self) -> None:
        super().__init__("tts-benchmark-safety:power-observation")


@dataclass(frozen=True)
class PowerSnapshot:
    scheme: str
    standby_ac: int
    standby_dc: int
    hibernate_ac: int
    hibernate_dc: int

    def as_json(self) -> dict[str, object]:
        return cast(dict[str, object], asdict(self))

    @classmethod
    def parse(cls, value: object) -> PowerSnapshot:
        if not isinstance(value, dict) or set(value) != {
            "scheme",
            "standby_ac",
            "standby_dc",
            "hibernate_ac",
            "hibernate_dc",
        }:
            raise PowerObservationError()
        scheme = value["scheme"]
        if not isinstance(scheme, str):
            raise PowerObservationError()
        try:
            if str(uuid.UUID(scheme)) != scheme:
                raise ValueError
        except ValueError:
            raise PowerObservationError() from None
        numbers = [
            value[key] for key in ("standby_ac", "standby_dc", "hibernate_ac", "hibernate_dc")
        ]
        if any(type(item) is not int or not 0 <= item <= 0xFFFFFFFF for item in numbers):
            raise PowerObservationError()
        return cls(scheme, *numbers)

    def disabled_for(self, original: PowerSnapshot) -> bool:
        return self.scheme == original.scheme and (
            self.standby_ac,
            self.standby_dc,
            self.hibernate_ac,
            self.hibernate_dc,
        ) == (0, 0, 0, 0)


def observe_power() -> PowerSnapshot:
    """Query PowrProf indexes, rejecting a scheme change during the observation."""
    if sys.platform != "win32":
        raise PowerObservationError()
    power = ctypes.WinDLL("PowrProf.dll", use_last_error=True)
    kernel = ctypes.WinDLL("Kernel32.dll", use_last_error=True)
    get_scheme = power.PowerGetActiveScheme
    get_scheme.argtypes = [ctypes.c_void_p, ctypes.POINTER(ctypes.c_void_p)]
    get_scheme.restype = ctypes.c_uint32
    free = kernel.LocalFree
    free.argtypes = [ctypes.c_void_p]
    free.restype = ctypes.c_void_p

    def scheme_bytes() -> bytes:
        pointer = ctypes.c_void_p()
        if get_scheme(None, ctypes.byref(pointer)) != 0 or not pointer.value:
            raise PowerObservationError()
        try:
            return ctypes.string_at(pointer, 16)
        finally:
            free(pointer)

    original = scheme_bytes()
    scheme = ctypes.create_string_buffer(original)
    subgroup = ctypes.create_string_buffer(
        uuid.UUID("238c9fa8-0aad-41ed-83f4-97be242c8f20").bytes_le
    )
    values: list[int] = []
    for setting_id in (
        "29f6c1db-86da-48c5-9fdb-f2b67b1f44da",
        "9d7815a6-7ee4-497e-8888-515a05f02364",
    ):
        setting = ctypes.create_string_buffer(uuid.UUID(setting_id).bytes_le)
        for name in ("PowerReadACValueIndex", "PowerReadDCValueIndex"):
            read = getattr(power, name)
            read.argtypes = [ctypes.c_void_p] * 4 + [ctypes.POINTER(ctypes.c_uint32)]
            read.restype = ctypes.c_uint32
            result = ctypes.c_uint32()
            if read(None, scheme, subgroup, setting, ctypes.byref(result)) != 0:
                raise PowerObservationError()
            values.append(result.value)
    if scheme_bytes() != original:
        raise PowerObservationError()
    return PowerSnapshot(str(uuid.UUID(bytes_le=original)), *values)
