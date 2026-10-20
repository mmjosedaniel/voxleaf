"""Probe the corrected certificate store and Pillow without network or user files."""

from __future__ import annotations

import importlib.metadata
import io
import json
import socket
import ssl


def reject_connection(*args: object, **kwargs: object) -> None:
    raise AssertionError("unexpected-network-request")


def cyclic_pdf(*, self_reference: bool = False) -> bytes:
    objects = (
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [2 0 R] /Count 1 >>"
        if self_reference
        else b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Pages /Kids [2 0 R] /Count 1 >>",
    )
    payload = bytearray(b"%PDF-1.4\n")
    offsets = []
    for number, body in enumerate(objects, 1):
        offsets.append(len(payload))
        payload += f"{number} 0 obj\n".encode() + body + b"\nendobj\n"
    xref = len(payload)
    payload += b"xref\n0 4\n0000000000 65535 f \n"
    payload += b"".join(f"{offset:010d} 00000 n \n".encode() for offset in offsets)
    payload += (
        b"trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n"
        + str(xref).encode()
        + b"\n%%EOF\n"
    )
    return bytes(payload)


def main() -> None:
    socket.socket.connect = reject_connection
    socket.socket.connect_ex = reject_connection
    socket.create_connection = reject_connection
    for name, expected in {"certifi": "2026.10.19", "pillow": "13.0.0"}.items():
        assert importlib.metadata.version(name) == expected, f"unsafe-{name}-version"

    import certifi
    from PIL import Image, PdfParser

    context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    context.load_verify_locations(cafile=certifi.where())
    certificates = context.get_ca_certs()
    assert certificates, "empty-certificate-store"
    assert not any(
        "emsign ecc root ca - g3" in str(certificate["subject"]).lower()
        for certificate in certificates
    ), "compromised-root-remains"

    for self_reference in (False, True):
        try:
            PdfParser.PdfParser(buf=cyclic_pdf(self_reference=self_reference))
        except PdfParser.PdfFormatError:
            pass
        else:
            raise AssertionError("cyclic-page-tree-accepted")

    with Image.new("RGB", (8, 8), (10, 20, 30)) as original:
        encoded = io.BytesIO()
        original.save(encoded, format="PNG")
        encoded.seek(0)
        with Image.open(encoded) as decoded:
            decoded.load()
            assert decoded.size == (8, 8)
            assert decoded.getpixel((0, 0)) == (10, 20, 30)
        pdf = io.BytesIO()
        original.save(pdf, format="PDF")
        with PdfParser.PdfParser(buf=pdf.getvalue()) as parsed:
            assert len(parsed.pages) == 1

    print(json.dumps({"result": "pass", "security_cases": 3, "legitimate_controls": 2}))


if __name__ == "__main__":
    main()
