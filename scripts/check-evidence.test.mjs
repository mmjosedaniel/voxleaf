import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import test from "node:test";

import { checkEvidence } from "./check-evidence.mjs";

// Prevent a caller's Git overrides from targeting its actual repository/index.
const env = Object.fromEntries(
  Object.entries(process.env).filter(
    ([key]) => !key.toUpperCase().startsWith("GIT_"),
  ),
);

function repository(t) {
  const root = mkdtempSync(join(tmpdir(), "voxleaf-evidence-test-"));
  t.after(() => {
    assert.equal(dirname(root), resolve(tmpdir()));
    assert.ok(basename(root).startsWith("voxleaf-evidence-test-"));
    rmSync(root, { recursive: true, force: true });
  });
  const git = (...args) =>
    execFileSync(
      "git",
      ["-c", `core.hooksPath=${join(root, ".git/no-hooks")}`, ...args],
      { cwd: root, env, stdio: "pipe" },
    );
  git("init", "--quiet");
  git(
    "-c",
    "user.name=Evidence Test",
    "-c",
    "user.email=evidence@example.invalid",
    "-c",
    "commit.gpgsign=false",
    "commit",
    "--quiet",
    "--allow-empty",
    "-m",
    "test baseline",
  );
  const write = (path, contents = "synthetic\n") => {
    const file = join(root, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, contents);
  };
  return { root, git, write, check: () => checkEvidence(root, { env }) };
}

for (const name of ["bad.log", "bad.log.txt", "bad.json.txt", "plain.txt"]) {
  test(`rejects tracked raw evidence ${name}`, (t) => {
    const repo = repository(t);
    const path = `docs/plans/evidence/run/${name}`;
    repo.write(path);
    repo.git("add", "--", path);
    assert.throws(repo.check, (error) => error.message.includes(path));
  });
}

test("rejects a forced staged addition despite ignore rules", (t) => {
  const repo = repository(t);
  repo.write(".gitignore", "docs/plans/evidence/**/*.log.txt\n");
  const path = "docs/plans/evidence/run/forced.log.txt";
  repo.write(path);
  assert.throws(() => repo.git("add", "--", path));
  repo.git("add", "-f", "--", path);
  assert.throws(repo.check, /forced\.log\.txt/);
});

test("preserves NUL-delimited paths containing spaces", (t) => {
  const repo = repository(t);
  const path = "docs/plans/evidence/run with spaces/raw capture.log.txt";
  repo.write(path);
  repo.git("add", "--", path);
  assert.throws(repo.check, (error) => error.message.includes(path));
});

test("accepts Markdown, all four curated identities and fixtures outside evidence", (t) => {
  const repo = repository(t);
  for (const path of [
    "docs/plans/evidence/run with spaces/report.md",
    "docs/plans/evidence/native-rust-test-layout/initial-inventory.json.txt",
    "docs/plans/evidence/linux-rust-test-repair/review-input.json.txt",
    "docs/plans/evidence/chatterbox-security-refresh/review-identities-01.txt",
    "docs/plans/evidence/chatterbox-security-refresh/integration-review-identities-01.txt",
    "packages/shared/fixtures/contracts/example.json",
  ]) {
    repo.write(path);
    repo.git("add", "--", path);
  }
  assert.doesNotThrow(repo.check);
});

test("curated exceptions allow only their exact paths", (t) => {
  const repo = repository(t);
  const path = "docs/plans/evidence/other/initial-inventory.json.txt";
  repo.write(path);
  repo.git("add", "--", path);
  assert.throws(repo.check, /other\/initial-inventory\.json\.txt/);
});

test("permits an exact HEAD deletion before staging, but rejects its neighboring raw file", (t) => {
  const repo = repository(t);
  const deleted = "docs/plans/evidence/run/raw.log.txt";
  const neighbor = "docs/plans/evidence/run/raw.log.txt.extra";
  repo.write(deleted);
  repo.git("add", "--", deleted);
  repo.git(
    "-c",
    "user.name=Evidence Test",
    "-c",
    "user.email=evidence@example.invalid",
    "-c",
    "commit.gpgsign=false",
    "commit",
    "--quiet",
    "-m",
    "historical raw output",
  );
  rmSync(join(repo.root, deleted));
  assert.doesNotThrow(repo.check);
  repo.write(neighbor);
  repo.git("add", "--", neighbor);
  assert.throws(repo.check, (error) => error.message.includes(neighbor));
});

test("a staged new raw file is rejected even if subsequently deleted locally", (t) => {
  const repo = repository(t);
  const path = "docs/plans/evidence/run/new.log.txt";
  repo.write(path);
  repo.git("add", "--", path);
  rmSync(join(repo.root, path));
  assert.throws(repo.check, /new\.log\.txt/);
});

test("fails closed when Git is unavailable", (t) => {
  const repo = repository(t);
  assert.throws(
    () =>
      checkEvidence(repo.root, { git: join(repo.root, "missing-git"), env }),
    /Cannot read Git/,
  );
});

test("fails closed on a corrupt Git index", (t) => {
  const repo = repository(t);
  repo.write("report.md");
  repo.git("add", "--", "report.md");
  const index = join(repo.root, ".git/index");
  assert.ok(readFileSync(index).length > 0);
  writeFileSync(index, "not a Git index");
  assert.throws(repo.check, /Cannot read Git/);
});

test("fails closed outside a Git repository", (t) => {
  const repo = repository(t);
  rmSync(join(repo.root, ".git"), { recursive: true });
  assert.throws(repo.check, /Cannot read Git/);
});
