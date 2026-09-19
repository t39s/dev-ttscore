# Release notes — ttScore suite 0.4.0

## RC11 — Start confirmation safety after independent RC10 review

- Close **R10-01 (HIGH Product risk / FIX NOW)**: Team Start is blocked while the editor contains unpublished details/order/result changes or a prepared-but-unpublished artifact. Start can no longer commit the older Firebase state and then discard the Administrator's local draft.
- Close **R10-02 (MEDIUM Product risk / FIX NOW)**: the Start confirmation captures the canonical Firebase source revision plus the first personal-match id shown in the dialog. Confirm rechecks both against the fresh server state; an intervening edit fails closed and requires a new confirmation.
- Preserve the existing `_writeRevision` Firebase boundary as the final compare-and-set style concurrency guard; no RTDB `runTransaction` claim is made.
- No sporting, personal-match phase, Team generation, Auto-Live, permanent URL, Firebase Team schema or Firebase Rules change is introduced by RC11.
- Component identities advance to ttScore **0.10.2** and ttscore_team **0.13.2**.
- Incorporate the previously received owner field evidence for the pre-existing Release-4 path (full 7/7 Team run plus bounded A15 confirmations) into the self-contained artifact. This evidence does not substitute for the still-required explicit-Team-Start field gate.

## RC10 — explicit Team match start

- Separate Team creation/publication from Team start: new Teams are published with every personal match `planned`.
- Add derived `scheduled` Team lifecycle without a new persisted field or schemaVersion bump.
- Add Administrator **«Начать командную встречу»** action with a separate confirmation step in the Firebase Team editor.
- Confirmed Start changes only the first personal match in current order from `planned` to `current` through the existing `_writeRevision` guarded Firebase write boundary.
- Add non-authoritative Team assignment status `scheduled`; ttScore remains fail-closed until a real `current` assignment exists.
- Add scheduled presentation to the public Team page and permanent Team viewers; permanent viewers do not open a personal Live frame before Start.
- Team Start does not start the personal match, first game, or Auto Live. Existing current-assignment identity, generation semantics, personal-match phases, completion, Team Undo, commit/snapshot and Live protocols are preserved.
- Component identities advance to ttScore 0.10.1 and ttscore_team 0.13.1. Team Firebase schemaVersion 4 and Firebase Rules are unchanged.
- Owner scope explicitly excludes a migration/backward-compatibility path for old prepublished `current` meetings; such meetings are outside the product scenario.

## New behavior

- Explicit durable counter phases distinguish no confirmed data, blank indicators, 0:0, active game, between-game break, preparation, finished game/paperwork, and released counter.
- Umpire preparation and game start are separate idempotent actions; point input is disabled outside an active game.
- Local and Live scoreboards use the same phase semantics. Blank digits are rendered as blank rather than zero and receive explicit accessibility labels.
- Team receives an attempt-scoped `livePhase` projection and no longer equates `current` with “game in progress”.
- Auto Live can begin at the saved `waiting_players` phase while preserving the existing exact Team binding gate.
- Presentation-only phase changes do not change Team assignment generation or sporting revision.
- Final-game display remains held during paperwork: e.g. displayed 2:2 + 12:10 yields actual result 3:2.
- Counter release is separate from completion confirmation.
- New phase-aware matches require durable explicit completion intent before automatic Team handoff; disappearance of local storage alone is not completion.
- Reload recovery can promote an already durable explicit completion into an existing pending record.
- Team finish, Team Undo and manual current-assignment identity changes clear old public phase and Live links.

## RC2 corrections after bounded review

- Reject a delayed older ttScore attempt from replacing a newer attempt's Team `livePhase` or Live links within the same assignment generation; `livePhase` writer is schema 2 with `attemptStartedAt`, while schema 1 remains readable.
- Phase-changing actions now publish only after durable local save; failed phase save rolls the action back and does not update Team. Failed initial meeting save returns to setup before Auto Live/Team publication.
- Persist the latest Undo snapshot with the meeting so one valid Undo remains available after reload without serializing the complete in-memory history stack.
- Preserve `phase` and `phaseLabel` when the permanent/direct Live scoreboard is viewed with reversed sides.

## RC3 correction after RC2 review

- Close R4-R09 with a centralized durable-publication proof. After any failed meeting save, Team `livePhase`/Live-link sync, Auto Live capture, manual Live creation, scheduled Live writes and already queued delayed Live writes all fail closed until the current state again matches a successfully persisted durable meeting state or reload restores it.
- R4-R10 and R4-R11 were reclassified by Product risk rather than automatically fixed: both are **LOW / ACCEPT** and are recorded normatively as KI-005 and KI-006 in `KNOWN_ISSUES.md`.

## RC4 bounded commit/snapshot refactor after RC3 review

- Close R4-R12 by making every successful durable meeting commit queue Team phase projection directly; Team phase no longer depends on a successful Live writer.
- Close R4-R13 by giving asynchronous Team/Live writers immutable committed snapshots instead of mutable global state. A later in-memory transition cannot rewrite an older in-flight publication.
- Keep Team Live links and Team phase as separate projection concerns: phase-only updates preserve current links; confirmed Live success supplies an explicit link pair; explicit stop/forget supplies an explicit null pair.
- Scope retryable Live-link intent to the exact Team binding and ttScore attempt, preventing a delayed retry from carrying old URLs into a changed assignment.
- Preserve a retryable Team link intent after transient failure, but do not create an aggressive Live self-retry loop on transport error; normal lifecycle/Auto-Live recovery remains responsible for retry.
- R4-R14 is LOW / ACCEPT and is folded into KI-006: a second narrow dynamic-storage failure window can make direct completion retry conflict with the immutable backup, while sporting result and Team/manual recovery remain available.

## RC5 correction after RC4 review

- Close R4-R15 in initial Live creation. The asynchronous Auth/report-id setup no longer pins the first Live publish to the snapshot captured before the await boundary.
- Immediately before source creation/first publication, reselect the latest durable committed snapshot for the same ttScore match. A durable commit that arrives during setup becomes the initial payload.
- If the current in-memory state has become undurable, or the active match identity changed while setup was in flight, abort creation and release the publisher lease rather than falling back to an older durable snapshot.
- Team runtime, Firebase Team schema/rules and the existing committed-snapshot queue are unchanged.

## RC6 correction after RC5 field failure

- Close R4-R16, confirmed in the real RC5 field run: the native Live writer incorrectly reused the phase-aware payload schema number (`2`) as the Firebase `liveReportsV2` envelope/meta schema. Existing deployed `ttscore-live` Rules accept envelope/meta `schemaVersion: 1`, so the first new Live write was rejected with `PERMISSION_DENIED`.
- Split the protocol versions: Firebase envelope/meta remain schema **1**; the encrypted compact payload remains schema **2** and continues to carry `counterPhase`, `phaseRevision`, `phaseUpdatedAt`, `sportRevision` and `completionConfirmedAt`.
- Keep `ttscore-live`, `/liveReportsV2`, App Check policy and Security Rules unchanged. No backend deploy is required for RC6.
- Add a field regression plus an explicit compatibility check against the canonical compact-live Rules.

## RC7 correction after RC6 field stall

- Close R4-R17, confirmed in the exact RC6 field run: Team could expose direct Live URLs as soon as a local `livePublication` record existed, before the first Firebase state revision was actually acknowledged. If that first write stalled, viewers opened a real-looking URL but remained at `Подключение к онлайн-табло…`.
- Team now classifies such a publication as `starting` until `lastPublishedStateRevision >= 1` and `lastPublishedAt` is finite; no direct Live URL is projected before that confirmation.
- All native Live Firebase `set`/`update` writes are bounded by an 8-second timeout. A hung write becomes a retryable technical failure and is recovered through the existing Auto-Live/lifecycle retry path rather than holding the source indefinitely in `starting`.
- Confirmed Live publications remain compatible with all previous ownership/binding guards; Firebase Rules and schema are unchanged.

## RC8 correction after full RC7 direct-viewer investigation

- Close R4-R18, confirmed on exact RC7: direct Live links were already confirmed and visible, but both direct ttScore viewer entrypoints aborted before Firebase read startup because `setLiveScoreboardStatus()` and `setLiveViewerStatus()` were referenced but not defined.
- The omission entered with the 0.4.0 RC1 phase-aware reader changes and persisted through RC7; the permanent Team viewer inherited the defect because it embeds the direct URL.
- Restore both helpers byte-for-byte from accepted ttScore 0.9.6. No Firebase, Team protocol, phase model or commit/snapshot behavior changes are needed.
- Add `direct-live-viewer-entrypoint.test.mjs`: it executes the startup boundary with a controlled Firebase-read failure, verifies visible error transition, and explicitly detects the exact RC7 missing-helper regression.
- Preserve R4-R17 separately: delayed/unconfirmed writer exposure was a real lifecycle defect, but it was not the root cause of the indefinitely static direct-viewer text after confirmed RC7 publication.

## Migration/read policy

- Compact Live **encrypted payload** writer is schema 2; payload reader accepts legacy schema 1 and schema 2. The Firebase `liveReportsV2` state/meta envelope remains schema 1 for compatibility with unchanged deployed Rules.
- Legacy local matches without `counterPhase` are mapped conservatively to `game`, `game_break`, or `match_over` based on their existing state; unknown phase is not exposed as a confirmed Team phase.
- Existing Team schemaVersion 4 documents may omit `livePhase`; omission means no confirmed phase. `livePhase` schema 1 is accepted on read; the 0.4.0 writer emits schema 2 with `attemptStartedAt`.
- Phase-aware completion uses explicit completion intent. Legacy phase-less handoff behavior is retained only as a migration path.

## Preserved boundaries

- Team queue remains `planned/current/finished`.
- Exact Team match + individual match + assignment generation + ttScore match identity remains mandatory.
- Standalone does not auto-write Team result/Live.
- One controlling Team context per browser profile remains the supported control model.
- Permanent viewer URLs are unchanged and remain read-only.
- No user-facing Pause Live is introduced.
- Administrator emergency/manual result flow remains available; `reportUrl` remains optional for the domain `finished` status.

## RC9 — controlled reconstruction audit

RC9 performs no runtime change from RC8. It adds the completed exact-baseline reconstruction audit and records the owner's defect-free one-Team RC8 field run. The audit found no additional unexplained runtime loss relative to accepted 0.3.0-rc.7.
