# ttScore suite 0.2.0 — Release Candidate 6

Integrated table-tennis scoring suite.

## Components

- **ttScore 0.8.7** — unchanged from accepted 0.1.7 baseline.
- **ttscore_team 0.12.0** — Team administration plus permanent public Team Live viewers.

## Entrypoints

- `index.html` — ttScore.
- `team/index.html` — Team create/edit/view.
- `team/live.html?match=<team-id>&view=scoreboard` — permanent public Team scoreboard.
- `team/live.html?match=<team-id>&view=report` — permanent public Team report.

## RC6 lineage

RC6 is built **directly from RC3**.

The only runtime change from RC3 is in `team/assets/0.12.0/live-viewer.css`:

```css
[hidden] { display: none !important; }
```

This fixes a field-observed presentation defect where JavaScript correctly toggled the HTML `hidden` attribute, but `.viewer__status { display: grid; }` / `.viewer__frame { display: block; }` could keep the stale status visible over an already working Live iframe.

All JavaScript runtime files are byte-identical to RC3.

## Verification

- full Node regression: **177/177 PASS**;
- focused Release-2 tests: **21/21 PASS**;
- syntax/static/runtime-lineage checks: PASS;
- RC3 browser evidence remains applicable to the unchanged JavaScript/state-machine runtime; the RC6 hidden-state CSS contract has dedicated regression coverage.

A field retest of the exact RC6 bytes is still required before final/STOP.

## Known issues

`KNOWN_ISSUES.md` is the sole normative registry of accepted product limitations.
