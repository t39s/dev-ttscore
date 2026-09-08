# ttScore integration v0.5.1 + v0.11.1 RC1

Publication/runtime-entrypoint stabilization candidate derived from owner-accepted RC16.

## Runtime package contract
- `./index.html` == `./ttscore_0.5.1.html` byte-for-byte;
- `./team/index.html` == `./team/ttscore_team_0.11.1.html` byte-for-byte;
- Team launches ttScore through `../index.html`;
- old `ttScore_0.5.0.html` is absent.

The intentional Team integration adapter remains under `team/assets/0.10.0/`, with only its required dependency closure.

## Verification
- Node: 274/274 PASS;
- browser autonomous 6/6; Team E2E 19/19; pending rebase 10/10; report backup 15/15;
- realtime editor, revision guard, write-race: PASS;
- scoreboard 6/6 + viewport 5/5;
- syntax, byte-equivalence and package-contract checks: PASS.

Decision inside the product goal: CONTINUE to 0.6.0 rebase. Owner acceptance is still required.
