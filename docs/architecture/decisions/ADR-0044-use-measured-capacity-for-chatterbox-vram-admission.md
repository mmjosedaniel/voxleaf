# ADR-0044: Use measured capacity for Chatterbox VRAM admission

## Status

Accepted on 2026-08-01. This decision supersedes only the current Chatterbox
product-admission floors in ADR-0031; its historical v12 evaluation inputs and
results remain unchanged.

## Context

The accepted Chatterbox bilingual profile peaked at `3,644` MiB of dedicated
VRAM. The runtime registry nevertheless required a nominal 8-GB-class device,
represented as `7,680` MiB total and `6,144` MiB available. Those values
described the evaluated host class and a conservative product policy, not a
measured technical minimum.

The existing result-blind capacity formula already derives `4,668` MiB from
the measured peak plus a `1,024`-MiB reserve. Treating 8 GB as an absolute
minimum would exclude a nominal 6-GB device even when it exposes enough free
dedicated memory for the measured workload and reserve.

## Decision

For the exact supported Chatterbox profile:

- require at least `5,632` MiB total dedicated VRAM so nominal 6-GB-class
  devices can reach the product gate despite ordinary reported-capacity
  differences;
- require at least `4,668` MiB currently available dedicated VRAM, equal to
  the measured `3,644`-MiB peak plus the frozen `1,024`-MiB reserve;
- retain `7,680` MiB reported total, corresponding to the evaluated nominal
  8-GB class, as the recommended configuration; and
- disclose the measured peak, minimum total, minimum available, recommended
  class, RAM/CPU requirements, transfer, installed/staging sizes, cold start,
  and licences before an optional download can begin.

Historical benchmark manifests and results remain byte-unchanged. Passing the
new gate means the current measured-capacity policy admits the host; it does not
claim that every 6-GB GPU or driver combination has completed clean-host
validation. Runtime preflight still fails closed on unknown facts or
insufficient current availability.

## Consequences

- An otherwise compatible nominal 6-GB GPU can use Chatterbox when at least
  `4,668` MiB is currently available.
- An 8-GB GPU can still be rejected temporarily when other applications leave
  insufficient free VRAM.
- The Settings confirmation distinguishes measured, minimum, and recommended
  quantities instead of describing 8 GB as a hard model requirement.
- The exact runtime parts are now published, but the optional download remains
  withheld until clean-host, offline bilingual, removal, reinstall, licence,
  and audit gates pass; changing the VRAM floor does not weaken those release
  gates.

## Alternatives considered

- **Keep 8 GB as the absolute minimum.** Rejected because it is more than twice
  the measured peak and duplicates headroom already enforced by the available-
  memory gate.
- **Use only the 3,644-MiB measured peak.** Rejected because it leaves no
  reserve for transient allocations, the desktop, drivers, or fragmentation.
- **Remove the total-VRAM gate entirely.** Rejected for this MVP because the
  closed 6-GB-class floor prevents accidental admission of a tightly fitting
  lower-capacity device while retaining a simple, explainable policy.
