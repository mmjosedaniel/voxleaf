"""Resolve manifest-owned C++ dependencies inside the cold packaged child."""

import ctypes
import json
import os
import runpy
import sys
from pathlib import Path

site_packages = Path(sys.argv[1]).resolve(strict=True)
runtime = Path(sys.executable).resolve(strict=True).parent
private = site_packages / "sklearn" / ".libs"
# Keep directory and library handles alive for the entire protocol service.
directories = [os.add_dll_directory(str(runtime)), os.add_dll_directory(str(private))]
kernel = ctypes.WinDLL("kernel32", use_last_error=True)
kernel.GetModuleFileNameW.argtypes = [ctypes.c_void_p, ctypes.c_wchar_p, ctypes.c_uint]
kernel.GetModuleFileNameW.restype = ctypes.c_uint
kernel.GetModuleHandleW.argtypes = [ctypes.c_wchar_p]
kernel.GetModuleHandleW.restype = ctypes.c_void_p
libraries = []
origins = []
for expected in (
    runtime / "vcruntime140.dll",
    runtime / "vcruntime140_1.dll",
    private / "msvcp140.dll",
):
    expected = expected.resolve(strict=True)
    library = ctypes.WinDLL(str(expected), winmode=0x1100)
    actual = ctypes.create_unicode_buffer(32768)
    handle = kernel.GetModuleHandleW(expected.name)
    length = kernel.GetModuleFileNameW(handle, actual, len(actual)) if handle else 0
    if (
        not 0 < length < len(actual)
        or Path(actual.value).resolve(strict=True) != expected
    ):
        raise OSError("private-runtime-dependency-origin-mismatch")
    libraries.append(library)
    origins.append(expected.relative_to(runtime).as_posix())

if sys.argv[2:] == ["--loader-probe"]:
    import torch

    print(
        json.dumps(
            {
                "privateDllOrigins": origins,
                "torch": str(torch.__version__),
                "cudaInitialized": torch.cuda.is_initialized(),
            }
        )
    )
else:
    if len(sys.argv) > 2:
        if len(sys.argv) != 5 or sys.argv[2] != "--diagnostic-observer":
            raise ValueError("invalid-native-diagnostic")
        observer = runpy.run_path(sys.argv[3])["install_native_observation"]
        observer(Path(sys.argv[4]), origins)
    sys.argv = ["voxleaf_tts.chatterbox_service"]
    runpy.run_module("voxleaf_tts.chatterbox_service", run_name="__main__")
