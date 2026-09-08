# Plan — ttScore 0.5.1 + ttscore_team 0.11.1 RC1

Scope: packaging/runtime-entrypoint architecture only; preserve RC16 product behavior.

Changes:
- bump ttScore patch to 0.5.1 and canonical file to `ttscore_0.5.1.html`;
- ship byte-identical `index.html`;
- bump Team patch to 0.11.1;
- Team opens `../index.html`;
- ship byte-identical `team/index.html`;
- keep `team/assets/0.10.0` integration adapter namespace;
- remove old root `ttScore_0.5.0.html` from the new package.

Acceptance evidence: full Node regression, syntax checks, browser regression, byte-identity checks, runtime URL/static contract checks, package integrity.
