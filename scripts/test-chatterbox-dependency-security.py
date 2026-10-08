"""Exercise the candidate's security boundaries without external requests."""

import importlib.metadata
import json
import socket
import tempfile
from pathlib import Path
from unittest.mock import patch

network_requests = 0


def reject_connection(*args: object, **kwargs: object) -> None:
    global network_requests
    network_requests += 1
    raise AssertionError("unexpected-network-request")


socket.socket.connect = reject_connection
socket.socket.connect_ex = reject_connection
socket.create_connection = reject_connection


def main() -> None:
    from tokenizers import Tokenizer
    from tokenizers.models import WordLevel
    from transformers import PreTrainedTokenizerFast
    from transformers.generation import utils as generation
    from transformers.utils import CHAT_TEMPLATE_DIR

    for distribution, version in {
        "transformers": "5.17.0",
        "tokenizers": "0.23.1",
        "urllib3": "2.8.0",
    }.items():
        assert importlib.metadata.version(distribution) == version, "unexpected-dependency-version"

    cases = 0
    with tempfile.TemporaryDirectory(prefix="voxleaf-security-probe-") as directory:
        root = Path(directory)
        tokenizer = PreTrainedTokenizerFast(
            tokenizer_object=Tokenizer(WordLevel({"[UNK]": 0, "local": 1}, unk_token="[UNK]")),
            unk_token="[UNK]",
        )
        for name in ("../escape", "..\\escape", str(root / "absolute-escape")):
            tokenizer.chat_template = {name: "synthetic template"}
            try:
                tokenizer.save_pretrained(root / "tokenizer")
            except ValueError:
                pass
            else:
                raise AssertionError("unsafe-template-name-accepted")
            assert not (root / "escape.jinja").exists()
            assert not (root / "absolute-escape.jinja").exists()
            assert not (root / "tokenizer/escape.jinja").exists()
            cases += 1
        tokenizer.chat_template = {"default": "local", "safe": "synthetic template"}
        tokenizer.save_pretrained(root / "legitimate")
        assert (
            root / "legitimate" / CHAT_TEMPLATE_DIR / "safe.jinja"
        ).read_text() == "synthetic template"
        cases += 1

        # A false trust decision must precede fetching or importing executable code,
        # for both a remote repository name and a local directory.
        for location in ("synthetic/untrusted", str(root)):
            with (
                patch.object(generation, "has_file", return_value=True),
                patch.object(generation, "get_cached_module_file") as fetch,
                patch.object(generation, "check_python_requirements") as requirements,
                patch.object(generation, "get_class_in_module") as load,
            ):
                try:
                    generation.GenerationMixin.load_custom_generate(
                        object(), location, trust_remote_code=False
                    )
                except ValueError:
                    pass
                else:
                    raise AssertionError("untrusted-custom-generation-accepted")
                fetch.assert_not_called()
                requirements.assert_not_called()
                load.assert_not_called()
                cases += 1
        sentinel = object()
        with (
            patch.object(generation, "has_file", return_value=True),
            patch.object(
                generation, "get_cached_module_file", return_value="synthetic.module"
            ) as fetch,
            patch.object(generation, "check_python_requirements"),
            patch.object(generation, "get_class_in_module", return_value=sentinel),
        ):
            result = generation.GenerationMixin.load_custom_generate(
                object(), "synthetic/trusted", trust_remote_code=True
            )
            assert result is sentinel
            fetch.assert_called_once()
            cases += 1
    assert network_requests == 0, "unexpected-network-request"
    print(
        json.dumps(
            {"security_cases": cases, "result": "pass", "network_requests": network_requests}
        )
    )


if __name__ == "__main__":
    main()
