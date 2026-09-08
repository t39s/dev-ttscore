import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../", import.meta.url);
const read = p => readFileSync(new URL(p, root));

test("root index is byte-identical to canonical ttscore runtime", () => {
  assert.deepEqual(read("index.html"), read("ttscore_0.5.1.html"));
});

test("team index is byte-identical to canonical Team runtime", () => {
  assert.deepEqual(read("team/index.html"), read("team/ttscore_team_0.11.1.html"));
});

test("Team launches stable root index and carries teamMatch query", () => {
  const app = readFileSync(new URL("team/assets/0.11.1/app.mjs", root), "utf8");
  assert.match(app, /new URL\("\.\.\/index\.html", location\.href\)/);
  assert.match(app, /searchParams\.set\("teamMatch", teamMatch\.id\)/);
  assert.doesNotMatch(app, /ttScore_0\.5\.0\.html|ttscore_0\.5\.1\.html|ttscore_0\.6\.0\.html/);
});

test("old version-specific root runtime is absent", () => {
  assert.equal(existsSync(new URL("ttScore_0.5.0.html", root)), false);
});

test("intentional 0.10.0 Team adapter asset remains available", () => {
  assert.equal(existsSync(new URL("team/assets/0.10.0/ttscore-team-adapter.mjs", root)), true);
  const runtime = readFileSync(new URL("ttscore_0.5.1.html", root), "utf8");
  assert.match(runtime, /team\/assets\/0\.10\.0\/ttscore-team-adapter\.mjs/);
});
