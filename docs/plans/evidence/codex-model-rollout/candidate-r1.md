# Contributor model rollout review inputs

Record `CMR-INPUT-R1` covers `codex/adopt-gpt-6-2-workflow` at `e85837ddee68e73ea05a0157e2fa0c79b63b7264`.
The review report adds this manifest’s own identity. The two reserved terminal records are the independent verdict and coordinator closeout.
Ignored validation helpers identify the checks used on the local host. All other supporting paths belong to the checkout.

| Path | Porcelain | Worktree SHA-256 | Filter-aware Git blob |
| --- | --- | --- | --- |
| `.agents/PLANS.md` | `--` | `cb253d3a574af427d9d84e53427792cf284895ad1ea74c921cba26a8b0316f78` | `547ea789a1f2dfc65b38e9f11c0f704784f7e991` |
| `.agents/skills/audit-logic/SKILL.md` | ` M` | `adfdfec586feb6885e8e6ee6b3370838e1301a2c09da4c285e5a768c68e0256e` | `e69a56ab73009249224f84e0435e765a1064c529` |
| `.agents/skills/implement-feature/SKILL.md` | `--` | `46040762db3c0f2d57ef9fe46aeac3ab380e327897d2d1486917e8249aac804c` | `fa37ee93b911eeca43cfa1b12ee817bcd762ac5e` |
| `.agents/skills/investigate-bug/SKILL.md` | `--` | `2fcb67f564d892b724fe7f8af37a78e0adaec599eca2dd6bf3cad993faf902d3` | `f67778f1ca29650782fc77656fe13bb5b0474c56` |
| `.agents/skills/orchestrate-safe-refactor/SKILL.md` | ` M` | `489bf355d710b44e4e8a8a7d551db83a8ac5fb4d878d4b2c7846171e3ea0c296` | `2e1c3854ae697b94b9302d8dfb7a317acef7d730` |
| `.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md` | `--` | `a5f2d805063ba8536cc046b361ea5bda732f55d9166afe137b08bc01175f49ae` | `16ba1a7002366ad9312223d51dace7902d6ae751` |
| `.agents/skills/validate-safe-refactor/SKILL.md` | `--` | `413f90eb532feb8297ecbe988a4e5c939f8cf5484de8ee059e6b5f9f8206397c` | `bf672a0e4090e0269ffac22f0a5a0f332c5235f9` |
| `.agents/skills/validate-safe-refactor/references/validation-policy.md` | `--` | `7686223dafc5a5095f5e3a5d0a1f28604fa9260a2ed62b5c8de5ed3288a6faba` | `f7a1f5fbf5a2473a121e675e245110fcf4025aa4` |
| `.codex/agents/change-reviewer.toml` | ` M` | `7d4ea124cb7c858e4fd08781700233447c0ad28ac6b4dde491707fe0db211a73` | `7986594d0085b11c6f9093ae396b9f660c85c05e` |
| `.codex/agents/clean-code-auditor.toml` | ` M` | `b2fa691c144b1d271f589373a89e3067c07aef9f187d6c7fe90e2b14e316e176` | `4c6e6650b01ee404a54a754d6ce1b2302e6fd024` |
| `.codex/agents/clean-code-worker.toml` | ` M` | `f95620b089ec26d3eb913fb33255a203308525fe788078c2fccc3f5265f5b131` | `532b54f9d6350896cee59eb8f8a1e6f6fd2429f7` |
| `.codex/agents/git-steward.toml` | ` M` | `472ae5d10486895303a5e4be0158e8e77362437df2f55e44262f45858f46dd30` | `120dca575db2bcf3c5553f940ef64e2781834bb4` |
| `.codex/agents/refactor-validator.toml` | ` M` | `e1166c29414ab78746b246d2fe44e049d65ecec9ed74e1110df70d78af1490a8` | `180d72a7c5ac48593f2e078ed90f5c30ec8eaebd` |
| `.codex/config.toml` | ` M` | `4e83b8ed5fe9c9c0320a8a91bb9d9b601cd6b8d1d5c482da070191ba7267cf0d` | `3e8e6321e77fd720bd549c2583faed433d8b498f` |
| `.gitattributes` | `--` | `d4953f0478abcd311063e9e24188d5f2a9fe2dfb775a2d19463d16ff209712e4` | `5acf47068be3a84b4e38b502877083e99b5ce0f9` |
| `.gitignore` | `--` | `9e601c0421914252a949656b79092e3a1049c325c8d6218ba158801e37241392` | `2afcbb78c8a55861916e5ccd14455c598c132beb` |
| `AGENTS.md` | ` M` | `13bba2370f7e87a04da10c96c5c49bccc13febf0104f875f056a5fef1ad765d3` | `6526695aa57a65b1bd5b6ac1c69cb7447b95aea2` |
| `docs/README.md` | ` M` | `3658565acb1cc25412d13263ade7e7ce32b6119c08ceae15bd51f45e2eda7155` | `356d1087089452606c5c343375aa6c3e963a6bff` |
| `docs/development/agentic-change-review.md` | ` M` | `093026226d8dd9322081295ed25b6712fe11870740a50c35f793ece08593a494` | `26b0d8519194ff3b2ccc7acff74a0171bab647c2` |
| `docs/development/agentic-refactoring.md` | ` M` | `5812a255ed97765513ddfe1e4cbf03b62c494f280b1b4d7181caf6b6c97742c4` | `a3e55941eae41a1a9b330190e7cbdf3772f85091` |
| `docs/development/evidence-retention.md` | `--` | `daaffd1fcc1bf61b5aed70b61cff3ae3df6cef2e589dca6293bef5f8066f62eb` | `017ace643604118fda92a71923efc2ec27cc3b8b` |
| `docs/development/findings/README.md` | `--` | `f8b8ec90ae9aceb2694050bca158cc8374afc5ebd220b8f8df1075eb11bb83dc` | `d389da823a8d5d44a0d046919fe137c2466a365b` |
| `docs/development/git-workflow.md` | ` M` | `82317223361f59de504201af2601639e4ffbd0fde6c3fe8e39dabbe57843acf7` | `933acea23d66858bffbbd89838346a864a5f0189` |
| `docs/development/testing.md` | `--` | `37db175abc35201b4b27258614b2d5d18374fa0e77a839d10e389ac0ba2c59f0` | `aabd1289ce7222029335a0755d3634f378aae838` |
| `docs/plans/active/README.md` | `--` | `11fcc8db660e85b06f805fa480b27a8aa11c56965116e57a689d2a80287e3315` | `5291c1acad10c0b6e4cbe6e6a0d1eb90f204672a` |
| `docs/plans/completed/README.md` | ` M` | `cba2ad3a31183b60b0ef9b156c8e2ebde71911c414d4692d6c004bec9b74b1d8` | `f5c7c55308eb373e5b559dd304c8ac1f5c784bcc` |
| `docs/plans/completed/codex-model-rollout.md` | `??` | `3c25219dc1c56ea8fc3fbec4d212ffa77e3c2071700430d89e7287bbe2897fe0` | `a30dbcf50628df9f9811e36155d6f3b4772ddd4d` |
| `docs/product/mvp.md` | `--` | `99c1adffe4efa9ca18ad6735b0bc9ad075f516614c993f009c4c524c87cf1e5c` | `b5cb94fd2ea1013668d9139bfd868164222e2b2b` |
| `package.json` | `--` | `cdeafd8d2aa6a86bf1db6584ff3aaba570a3408b61e754ce22af01ef0623ca07` | `0adb5df45315027b5375905407c28d0d98d46014` |
| `scripts/check-evidence.mjs` | `--` | `a6e942d6a55262790d4e101d888562249a4ba3e8c0d9d0b64147ce62de1fae0d` | `47e1e4ecdde2bda6cf15b50ce41ee45569819ae0` |
| `scripts/check-evidence.test.mjs` | `--` | `62e0e7554ef0e5954c305013ca398c5dd25aced5cec96adafda4852676a9dd9f` | `abbc93570fa566e5eef81d4d2b943feb1584f70f` |
| `tmp/evidence/codex-model-rollout/loaded_roles.py` | `!!` | `2646951a3a4c5d2a34ebb4a5f6f355493a27b65e6fcb42769f48b005af96ab7c` | `49bccad395f288aabb6fa57b212d0fea010a892e` |
| `tmp/evidence/codex-model-rollout/project_config.py` | `!!` | `c58315cad98a73d7145eec82e08c153cf2a4bbabd7a0e7ce59a8ccab51d7be98` | `a4afbef4cddc97c455db619d19b4a7568fb9b695` |
| `tmp/evidence/codex-model-rollout/synthetic.py` | `!!` | `904cc387aa36e9a973cd7eded0fdee693f92001bcd3cd1396dbbc6d7bca48c51` | `5205f7206946c85abd72af3f2f644a56edce19a7` |
| `tmp/evidence/codex-model-rollout/verify.py` | `!!` | `3b4c52d7efaec3cfe6eae62acd727c3f628d8f554509a14e2588529ebc7ae4f0` | `fde0185b947ffcce7b3d2951bb1d3b91fc481f86` |
