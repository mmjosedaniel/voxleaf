# U16 case5.4: classify a deadline during WebDriver body reading

Status: directed reproduction, final combined Node gates and global JavaScript
checks pass; independent [review R1](review-U16-5.4-R1.md) is APPROVE
(`FPA-U16-5.4-CR-R1-20261111`). HEAD remains
`a3241571944530d468e2f4f2d37a0a2394a8df84`, index empty.

The response-body catch now checks the existing timeout signal after explicit
operation cancellation and before malformed-response classification. It uses
the same precedence as the existing fetch catch. Both paths already abort;
this corrects the reported failure code and introduces no new containment,
retry, timeout budget or API. Session deletion retains its independent signal.

The loopback regression confirms status200 headers arrived and JSON body
consumption began while the body remained pending. Old production reports
`webdriver-response-invalid` instead of `webdriver-request-timeout`. Additional
controls preserve explicit user-cancellation precedence, completed malformed JSON
and successful independent DELETE after the operation is canceled.

## Commands and outcomes

All commands ran in normal local PowerShell outside the sandbox with pinned
Node24.18.0/pnpm11.15.1 and Windows PowerShell5.1.26100.9711 children.
Times below are2026-11-12 UTC.

```powershell
node --test --test-name-pattern 'five-pass 5\.4.*deadline' apps/desktop/scripts/native-webdriver-client.node-test.mjs
node --test apps/desktop/scripts/windows-release.node-test.mjs apps/desktop/scripts/native-webdriver-client.node-test.mjs
pnpm.cmd test:native-smoke-harness
node --test apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs
node --check apps/desktop/scripts/native-webdriver-client.mjs
node --check apps/desktop/scripts/native-webdriver-client.node-test.mjs
git diff --check -- apps/desktop/scripts/native-webdriver-client.mjs apps/desktop/scripts/native-webdriver-client.node-test.mjs docs/development/testing.md
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
```

- RED01,01:14:02.563–01:14:14.079: one intended classification failure, exit1.
- Final G4,01:17:35.989–01:18:52.237:71/71 pass, exit0. This is also the
  cumulative release/lifecycle suite after U12/U15; it is not rerun through a
  desktop aggregate.
- Native-smoke harness,01:18:53.558–01:19:26.648:54/54 pass, exit0, including
  the configured package build. These are harness tests, not a WebView2 launch.
- Portfolio Node,01:19:27.892–01:19:31.329:14/14 pass, exit0.
- Scoped syntax/diff,01:18:03.541–01:18:05.185:all exit0.
- Global format,01:20:23.458–01:20:32.869, and global lint,
  01:20:33.871–01:20:54.833:both exit0.

## Exact bindings

Ignored records under `tmp/evidence/five-pass-audit/` retain all commands,
tools, timestamps and before/after discovered file membership/hashes:

| Gate | Input rows | Input SHA-256 | Log SHA-256 |
| --- | ---: | --- | --- |
| `u16-5.4-red-01` | 94 | `799424314042C4C928E72B856DAB4FAC98834F1E6A6CC56DE8B3FBF2E034F6C7` | `BD5B0C4B4636C4ACDDBD7F543FF90B6582328F7AA013A981D99A850928BC9BBE` |
| `u16-g4-01` | 3746 | `1C3AE0F5000CADF37E551D3FBAF2637B5E5CEEA3B89FF3AB8CE0CB0E4DBE3C35` | `E3CCF2080FFAC3C6570233AF8626880FE837EF662DBBB9BB054429EB22190478` |
| `u16-native-smoke-harness-01` | 3304 | `24BA1C3241B0942B2D0763F677B0D762A2D8F5BB6743F364C3631948D51B3AA0` | `FD832EEC0DB39D829417BDD414D8759A4954F7E5492BC229A5CF40A3CB61BCD3` |
| `u16-g7-portfolio-node-01` | 3304 | `24BA1C3241B0942B2D0763F677B0D762A2D8F5BB6743F364C3631948D51B3AA0` | `C693AE4D70F1EC16E1846732439B5C1E5E8A477C7A289670D11755DD4F7BC6B0` |
| `u16-5.4-static-01` | 6 | `D7B7C90DEFB08CC7E4A7E65A805A2B320707B09A74691E2AA8223DC93508D64B` | `69A39EADF2F0E81971B62F41D7790F47ECCDC6921B283613F225892DD76F2A63` |

All251 emitted shared/EPUB files preserve G6's exact bytes throughout, with this
capture's manifest SHA-256
`3EE467A549510E7A616AA2AD50713B981B59A3E38D0BD3778C202CCCF5AB9B15`.
No unchanged frontend result is invalidated merely by the configured rebuild.

Global format/lint capture1,210 current inputs, including actual eight installed
tool package roots and configuration. Both unchanged input manifests hash to
`C9CA399580B8E8440C86DDEC0DE74D8041793B9FD0AAB5BC3231095CA071479F`.
`g11-javascript-format-final-01.log` SHA-256:
`76751CE9B3B423E34BB1F3E9DFF97C756315F771893AFF408DA24590D0C9DF74`.
`g11-javascript-lint-final-01.log`:
`CC5A0B39C7052D24C24888403C48018B4FCCCC9D799F81BE6C9C30C9E19C85FC`.

Closed56-path `u16-5.4-review-inputs.txt` SHA-256:
`61A76AE1D821ED7608817C06F860AF1B557CA4DB38DFEA7E53C7834D4EE9D988`.
Exact three-file `u16-5.4-review.diff` SHA-256:
`6C07AA43E4BFB499B18A9F63D0156F11399EF54E7E6D9270B1D4D203D7FC62E2`.

Final native startup, both real Piper arms, native resources, optional admission,
installer/lifecycle/outer restoration and integrated review remain pending.
