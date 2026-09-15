# Versions

Artifact stage is represented by the outer archive filename and is not a separate product version.

## Current target — suite 0.3.0

| Component | Version | Change |
|---|---:|---|
| ttScore suite | 0.3.0 | Release 3 target: automatic Team-bound Live |
| ttScore | 0.9.0 | automatic Live controller, recovery, pause/resume and TTL replacement |
| ttscore_team | 0.12.0 | unchanged from accepted Release-2 baseline |

Current dependency closure:

- `index.html` = `ttscore_0.9.0.html` byte-for-byte;
- ttScore continues to import the accepted historical `team/assets/0.11.9/ttscore-team-adapter.mjs` integration closure;
- all `team/assets/0.11.9/` and `team/assets/0.12.0/` bytes are unchanged from the accepted Release-2 baseline;
- `team/index.html`, `team/live.html` and `team/ttscore_team_0.12.0.html` are unchanged from the accepted Release-2 baseline;
- Firebase Team schema/rules are unchanged.

## Accepted input baseline

`ttscore_suite_0.2.0-rc.7.zip`

SHA-256: `9be552696b718d874fc977dd95c6fa1a3f23551ecc2069e9c50f90f18df9c842`

Components: ttScore 0.8.7 + ttscore_team 0.12.0.
