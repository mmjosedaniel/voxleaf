# Frozen v6 normalizer fixture

`narration-normalizer.ts.txt` contains the exact bytes of
`packages/epub/src/narration/narration-normalizer.ts` at the v6 authority commit
`9a2f74845853e84635b419a4e65170c9a2c207ee`.
SHA-256: `8bee1b480a81a96b105df32cf85eaf65f6e42bae382e152e89adbaa02353db74`.

The historical profile binds that hash. R7-05 changed the production normalizer,
so model-free v6 adapter and quality tests need an isolated historical input.
The fixture is data, never imported or executed. Tests copy it and the unchanged
profile authorities into a temporary repository and use the real strict loader.
They require no Git executable, repository history, model or network access.

Do not regenerate this fixture from current source or repin the frozen profile.
The production loader must continue rejecting current, altered or missing
normalizer bytes as inputs to the historical evaluation.
