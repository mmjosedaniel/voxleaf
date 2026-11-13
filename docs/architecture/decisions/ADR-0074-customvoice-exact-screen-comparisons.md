# ADR-0074: Exact comparisons for the CustomVoice v3 screen

The opt-in CustomVoice Spanish v3 screen compares exact means for eligibility
and speaker selection. Equal overall means reach the existing ordered tie
breakers, beginning with Spanish pronunciation. Integer scores and the counts
of applicable cases determine the means. The result converts means to JSON
numbers after selection.

The CLI takes the closed `screenVersion` field and defaults to v2. V3 uses a
separate session root, session version, and result schema. The v2 evaluation and
selected speaker retain their original authority. The v3 comparison has
synthetic regression coverage. Its evaluation remains pending.
