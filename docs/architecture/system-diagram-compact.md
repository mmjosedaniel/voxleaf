# Compact system diagram

This is the simplified view of VoxLeaf for product introductions and
high-level explanations. It shows the current user-facing reading and narration
path without milestone history, benchmark evidence, exact resource limits, or
development-only TTS branches. See the [canonical system diagram](system-diagram.md)
for those details and status authority.

```mermaid
flowchart LR
    classDef local fill:#d9f2e6,stroke:#247a52,color:#102a20
    classDef external fill:#dcecff,stroke:#356aa0,color:#13253a
    classDef optional fill:#fff0c7,stroke:#9a6b00,color:#332400

    BOOK["User-selected local EPUB"]:::external
    AUDIO["Speakers or headphones"]:::external
    MODEL_SOURCE["Verified Chatterbox artifacts<br/>optional external download"]:::external

    subgraph DEVICE["User's Windows PC"]
        subgraph APP["VoxLeaf desktop application"]
            EPUB["EPUB engine<br/>validate, extract, locate"]:::local
            READER["Visual reader<br/>reflow, navigation, highlighting"]:::local
            PREP["Narration preparation<br/>normalize and segment"]:::local
            TTS["Local text to speech<br/>bundled Piper or optional Chatterbox"]:::local
            PLAYER["Bounded in-memory audio<br/>buffer, play, synchronize"]:::local
            STATE["Local reading state<br/>stable position and preferences"]:::local
            OPTIONAL["Optional package manager<br/>gate, verify, install, remove"]:::optional
        end
    end

    BOOK -->|"bytes stay on device"| EPUB
    EPUB -->|"safe semantic content"| READER
    EPUB -->|"locator-linked text"| PREP
    PREP -->|"ephemeral prepared segments"| TTS
    TTS -->|"local PCM units"| PLAYER
    PLAYER -->|"audible passage"| READER
    PLAYER -->|"playback"| AUDIO
    READER -->|"save"| STATE
    STATE -->|"restore"| READER
    MODEL_SOURCE -->|"explicit consent + compatible host"| OPTIONAL
    OPTIONAL -->|"verified installed profile"| TTS
```

## Key points

- EPUB content, prepared narration text, and TTS inference stay on the user's
  device.
- Generated audio is kept in bounded memory and is not persisted by default.
- The reader, audible highlight, and saved progress share stable EPUB
  locations rather than rendered page numbers.
- Piper is included with the Windows package. Chatterbox is a separate,
  explicitly requested download available only after the compatibility gate
  passes.
- Installation prerequisites, release signing, development-only Qwen profiles,
  exact limits, and validation history are intentionally left to the canonical
  diagram.
