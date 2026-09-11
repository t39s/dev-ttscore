# ttScore 0.8.1 + ttscore_team 0.11.1 RC15

## Status

Docs-only review stabilization of RC14.

- Runtime remains byte-identical to RC14: `ttScore 0.8.1 + ttscore_team 0.11.1`.
- RC14 independent review found no runtime MEDIUM+ defect.
- RC14 is superseded because its package contained inherited top-level historical `RC14` documents that collided with the current candidate number and could direct the owner to the wrong review/checklist.
- Conflicting historical documents are preserved byte-for-byte under `docs/history/inherited_scoreboard_rc14/`.
- RC14 Speech Voice Profiles release metadata is preserved under `docs/history/rc14_speech_reset_release/`.
- Stable owner-accepted baseline remains RC4 until explicit owner acceptance.
- Engineering decision: `ESCALATE` only for owner-controlled Safari/WebKit device verification.

## Runtime verification

RC14 → RC15 runtime/test boundary is byte-identical. The final RC15 package is rechecked after clean extraction.

See `docs/GENERAL_REVIEW.md`, `docs/EVIDENCE.md`, `docs/OWNER_ACCEPTANCE_CHECKLIST.md`, and `docs/DOCS_NAMESPACE_STABILIZATION_RC15.md`.
