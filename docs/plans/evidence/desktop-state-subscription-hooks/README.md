# Desktop snapshot subscription acceptance

Source HEAD: `44a83f4113e9cbeadee7d8a2d0e62838df70629b`.
Branch: `codex/desktop-state-subscription-hooks`. Date: 2026-10-12.

One combined STATE-SUBSCRIPTIONS-01 unit implements two typed observation hooks,
four consumer migrations and twelve added tests. The final patch has eight
source/test paths and 592 added-plus-removed lines. Existing hardware tests and
all excluded implementation paths remain unchanged. Source acceptance used the
configured independent Astra validator; one configured Sol worker wrote code
after the configured Sol audit and passing host baseline.

- [Original approved order](work-order-01.md): retained 500-line estimate.
- [Superseding approved order](work-order-02.md): audited 600-line bound for
  readable required coverage; identical paths, invariants and commands.
- [Baseline](baseline-01.md): seven host gates PASS before source edits.
- [Checkpoint A](checkpoint-a-01.md): hooks and characterization pass against
  original bridges; intermediate identity-bound receipt, not another baseline.
- [Post-change](post-change-01.md): seven host gates PASS on the final patch.
- [Package](package-01.md): check:portable PASS.
- [Final source](final-01.md): check PASS; exact eight-path hashes retained.

Reports are immutable and copied byte-for-byte from validator receipts. In the
post-change report, the phrase "source object itself is returned" refers to the
cached **snapshot** returned by source.observe(), not the coordinator instance;
both hooks return that authoritative snapshot without copying it.

The canonical diagram remains accurate: the adapters stay in React presentation
and introduce no ownership, process, persistence or data-flow boundary. No new
GPU/model/performance or general-hardware claim follows from these checks.
Non-failing Vite/color and host pytest-cache warnings are retained in reports.

Raw logs, identity captures and temporary scripts stay in ignored
`tmp/evidence/desktop-state-subscription-hooks/`; these local artifacts are not
permanent public references. Only reviewed Markdown is retained here. No Git
mutation, staging, commit, push or PR is authorized or performed by this work.
