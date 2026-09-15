# ttScore suite 0.3.0

Release 3 adds automatic Live publication for a started personal match that has a valid current Team binding.

## Components

- **ttScore 0.9.0** — scoring, reports and Live; Team mode now starts/resumes Live automatically.
- **ttscore_team 0.12.0** — unchanged from the accepted Release-2 baseline; permanent Team scoreboard/report links remain the viewer entrypoints.

Baseline for this cycle: accepted `ttscore_suite_0.2.0-rc.7.zip`, SHA-256 `9be552696b718d874fc977dd95c6fa1a3f23551ecc2069e9c50f90f18df9c842`.

## Team-mode Auto Live

After Umpire starts the current assigned personal match and its Team binding/local state are saved successfully, ttScore automatically creates or resumes the existing Live publication. After the first Firebase Live snapshot is confirmed, the direct scoreboard/report URLs are synchronized to Team and the permanent Team viewer URLs continue to follow the current personal match.

Repeated start/auth/online/reload events converge on the existing publication instead of creating another source. Temporary publication or Team-link handoff failures retry without changing the sporting result.

Umpire can explicitly **Pause Live** and **Resume Live**. Pause is stored for the current Team in the current browser profile and survives reload, reconnect and the transition to the next personal match until explicit resume. While paused, Team Live URLs are cleared so permanent viewers show waiting.

Standalone mode is unchanged: Live remains manual and no Team Result/Live write is inferred without a valid Team binding.

## Entry points

- `index.html` — ttScore 0.9.0
- `ttscore_0.9.0.html` — versioned ttScore entrypoint; byte-identical to `index.html`
- `team/index.html` — ttscore_team 0.12.0
- `team/live.html?match=<team-id>&view=scoreboard|report` — permanent Team viewers

## Verification

See `VERIFICATION.md`, `docs/GENERAL_REVIEW.md`, `docs/RESEARCH.md`, `docs/PLAN.md`, and `evidence/`.

`KNOWN_ISSUES.md` is the sole normative registry of accepted current limitations.
