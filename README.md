# ttScore suite 0.3.0

Release 3 adds automatic Live publication for a started personal match that has a valid current Team binding.

## Components

- **ttScore 0.9.5** — scoring, reports and Live; Team mode starts/resumes Live automatically and safely retires the previous Live source.
- **ttscore_team 0.12.0** — unchanged from the accepted Release-2 baseline; permanent Team scoreboard/report links remain the viewer entrypoints.

Baseline for this cycle: accepted `ttscore_suite_0.2.0-rc.7.zip`, SHA-256 `9be552696b718d874fc977dd95c6fa1a3f23551ecc2069e9c50f90f18df9c842`.

## Team-mode Auto Live

After Umpire starts the current assigned personal match and its Team binding/local state are saved successfully, ttScore automatically creates or resumes the existing Live publication. After the first Firebase Live snapshot is confirmed, the direct scoreboard/report URLs are synchronized to Team and the permanent Team viewer URLs continue to follow the current personal match.

Repeated start/auth/online/reload events converge on the existing publication instead of creating another source. Temporary publication or Team-link handoff failures retry without changing the sporting result. There is no user-facing Team Live pause: interruption of Live is a technical failure/recovery state.

When a finished personal match is finalized, its Live source is retired from the local publisher lifecycle before the next personal match can auto-publish. Physical deletion of the old Firebase source is cleanup: after ownership is confirmed it may be deferred, including when an old Firebase write is still pending. Any late completion of the retired source is isolated from the new source and queued for cleanup.

Standalone mode is unchanged: Live remains manual and no Team Result/Live write is inferred without a valid Team binding. The accepted single controlling Team-context model remains unchanged; simultaneous control of two Team matches in one browser profile is not a supported workflow.

Intermediate RCs are prototypes, not deployed production versions. RC-to-RC browser-state migration is not a product requirement; independent RC validation should start from a clean prototype browser state.

## Entry points

- `index.html` — ttScore 0.9.5
- `ttscore_0.9.5.html` — versioned ttScore entrypoint; byte-identical to `index.html`
- `team/index.html` — ttscore_team 0.12.0
- `team/live.html?match=<team-id>&view=scoreboard|report` — permanent Team viewers

## Verification

See `VERIFICATION.md`, `docs/GENERAL_REVIEW.md`, `docs/OWNER_SCOPE_UPDATE.md`, `docs/RESEARCH.md`, `docs/PLAN.md`, and `evidence/`.

`KNOWN_ISSUES.md` is the sole normative registry of accepted current limitations.
