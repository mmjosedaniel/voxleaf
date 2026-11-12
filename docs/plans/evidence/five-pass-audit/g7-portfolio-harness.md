# G7 Piper portfolio fixture applicability

Status: focused RED/GREEN and static checks pass; independent review and final
native rerun pending. Base/HEAD remains
`a3241571944530d468e2f4f2d37a0a2394a8df84`, index empty.

The [native failure and work order](native-gates.md) records why selected Piper
arms cannot assume an installed alternate Chatterbox profile. The runner now
sets exerciseProfileSwitch=false only on its two frozen Piper arm records.
The argument builder defaults to true, preserving other arms and direct callers.
It retains both exact profile/language selections, the30-minute cooperative
deadline, real reader inference, language transitions/persistence, six playback
speeds, firewall and independently verified process cleanup. The generic switch
helper and optional installation eligibility are unchanged.

## Attributed host checks

All commands run in normal local PowerShell with pinned Node24.18.0 and
pnpm11.15.1 on2026-11-12 UTC. No native/model work competes with these checks.

| Check | Time | Result |
| --- | --- | --- |
| `node --test apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs`, test-only RED | 02:11:39.318–02:11:42.792 | Exit1: ES and EN exact-vector assertions reject only the unwanted switch flag; other-profile/default controls pass |
| Same command, GREEN | 02:12:08.551–02:12:12.032 | Exit0,17/17 |
| `pnpm.cmd test:native-smoke-harness` | 02:12:13.077–02:12:43.978 | Exit0,54/54 |
| `node --check apps/desktop/scripts/bilingual-portfolio-host.mjs` | 02:12:45.008–02:12:45.052 | Exit0 |
| `node --check apps/desktop/scripts/bilingual-portfolio-host.node-test.mjs` | 02:12:46.066–02:12:46.198 | Exit0 |
| `pnpm.cmd format:check:typescript` | 02:13:03.336–02:13:11.804 | Exit0 |
| `pnpm.cmd lint:typescript` | 02:13:12.796–02:13:33.998 | Exit0 |

The3,291-row RED input manifest hashes to
`AA094E58650F365607F18AFFAA840E1ECFA4ECA0A54E35EDC870D1971732A2D9`.
The GREEN/harness/syntax input manifest is unchanged across those commands:
`86C94ADE871A6E6DC0033B7860198C3CD2CD828972ABE03EA8FEE3C2BCE909E1`.
The final global JavaScript static pair matches before/after with SHA-256
`2BD32E77D98CCAD6D7E01D5DAEB09DA9398CA4918130878F2B65D8BF3CEF1947`.
All251 package exports retain their captured exact bytes/membership.

Ignored log identities:

- `u16-g7-profile-red-01.log`:
  `D9663367AC9C0AB522309D5CC6E477D43BBA2F5274EF02929F8C43CCCAFD790E`.
- `u16-g7-profile-green-01.log`:
  `D7256BF520C9ADC9E2C74F55EED71FBFDE9BD4BCF6670A7CF2F684192234F8F0`.
- `u16-g7-profile-harness-01.log`:
  `4300B51F07EB2D0F816DE5D6764A1CC4C7E9400B94B44BF58799772D4A2D404A`.
- `g11-javascript-format-final-02.log`:
  `76751CE9B3B423E34BB1F3E9DFF97C756315F771893AFF408DA24590D0C9DF74`.
- `g11-javascript-lint-final-02.log`:
  `CC5A0B39C7052D24C24888403C48018B4FCCCC9D799F81BE6C9C30C9E19C85FC`.

## Acceptance boundaries

The portfolio Node result supersedes its previous14-test receipt. The native
harness and global JavaScript checks also supersede their previous results for
these changed inputs. Because native tts-scenarios imports the portfolio module,
startup and native resource checks must be refreshed after this change, followed
by both real selected Piper arms. Earlier native results remain attributed
intermediate observations. G8's Rust admission does not load this module.

G1/G6 retain the controlled Reset/pending-selection ordering proof. The real
Piper arms do not establish that race or successful optional Chatterbox
activation. No model download, new CLI flag, public schema, product dependency
or runtime eligibility change is introduced.
