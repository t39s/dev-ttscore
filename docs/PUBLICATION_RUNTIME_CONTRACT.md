# PUBLICATION_RUNTIME_CONTRACT

Every release candidate now ships the files that are uploaded directly; the owner no longer needs to duplicate HTML files manually.

```text
./index.html
./ttscore_<version>.html
./team/index.html
./team/ttscore_team_<version>.html
./team/assets/...
```

Contract:
- `./index.html` MUST be byte-identical to `./ttscore_<version>.html`;
- `./team/index.html` MUST be byte-identical to `./team/ttscore_team_<version>.html`;
- `index.html` is not a redirect or launcher;
- Team launches ttScore through `../index.html`;
- versioned HTML files remain explicit release/audit artifacts;
- repeated commits replacing `index.html` preserve the Git history of what was operationally published.
