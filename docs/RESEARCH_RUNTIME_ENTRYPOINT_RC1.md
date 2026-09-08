# Research — runtime entrypoint decoupling RC1

Baseline: owner-accepted `ttScore 0.5.0 + ttscore_team 0.11.0 RC16`.

## Verified facts

- Team 0.11.0 constructs ttScore launch URL with `../ttScore_0.5.0.html`. This is operational version-specific coupling.
- Product publication already uses `./index.html` and `./team/index.html` as stable deployed entrypoints, but RC16 does not ship them.
- `ttScore_0.5.0.html` imports `./team/assets/0.10.0/ttscore-team-adapter.mjs`.
- The adapter and its three direct operational dependencies (`firebase-source.mjs`, `team-integration-contract.mjs`, `team-report-contract.mjs`) are byte-identical in asset namespaces 0.10.0 and 0.11.0 in RC16.
- RC16 research explicitly treats Team integration as a versioned operational-domain contract and preserves the 0.10.0 asset namespace for ttScore.

## Qualification of the reverse dependency

The `team/assets/0.10.0/ttscore-team-adapter.mjs` path is retained. It is an intentional immutable/versioned integration asset contract, not the same class of coupling as Team launching a version-specific root HTML file. Moving ttScore to the current Team asset namespace would increase coupling to the Team release version without changing the contract.

## Chosen direction

- Stable operational root entrypoint: `../index.html`.
- RC ships byte-identical publication copies `index.html` and `team/index.html`.
- Canonical versioned root runtime uses lowercase `ttscore_<version>.html`.
- No compatibility alias for `ttScore_0.5.0.html`.
- Keep only the proven runtime dependency closure of the 0.10.0 Team adapter namespace (adapter + direct/transitive local modules); omit unrelated historical 0.10.0 UI/app assets from the operational package.
