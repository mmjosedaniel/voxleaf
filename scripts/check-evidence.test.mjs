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

for (const [name, personalPath] of [
  ["Windows", String.raw`C:\Users\privacy-canary\project`],
  ["escaped Windows", String.raw`C:\\Users\\privacy-canary\\project`],
  ["Windows forward slashes", "c:/users/privacy-canary/project"],
  ["Windows name with spaces", String.raw`D:\Users\Privacy Canary\project`],
  ["macOS", "/Users/privacy-canary/project"],
  ["Linux", "/home/privacy-canary/project"],
  ["file URL", "file:///home/privacy-canary/project"],
  ["emphasized Windows", String.raw`_C:\Users\privacy-canary\project_`],
  ["emphasized Linux", "_/home/privacy-canary/project_"],
  ["strongly emphasized macOS", "__/Users/privacy-canary/project__"],
]) {
  test(`rejects an untracked Markdown ${name} home path without echoing it`, (t) => {
    const repo = repository(t);
    const path = "docs/plans/evidence/run with spaces/report.MD";
    repo.write(path, `# Result\n\nCommand ran from ${personalPath}.\n`);
    assert.throws(repo.check, (error) => {
      assert.match(error.message, /Personal home paths/);
      assert.ok(error.message.includes(`${path}:3 (worktree)`));
      assert.ok(!error.message.includes(personalPath));
      assert.ok(!error.message.includes("privacy-canary"));
      return true;
    });
  });
}

test("accepts placeholders, web links and synthetic source fixtures", (t) => {
  const repo = repository(t);
  repo.write(
    "README.md",
    [
      "<repo-root>/docs",
      String.raw`C:\Users\<user>\project`,
      "%USERPROFILE%/project",
      "$HOME/project",
      "/home/${USER}/project",
      "/Users/<user>/project",
      "https://docs.example.invalid/home/example",
    ].join("\n"),
  );
  repo.write(
    "packages/example/privacy.test.ts",
    'const path = "/home/private";',
  );
  repo.git("add", "--", "README.md", "packages/example/privacy.test.ts");
  assert.doesNotThrow(repo.check);
});

test("ignores local Markdown originals but rejects forced staged copies", (t) => {
  const repo = repository(t);
  repo.write(".gitignore", "tmp/\n");
  const path = "tmp/evidence/original.md";
  repo.write(path, "/home/privacy-canary/project");
  assert.doesNotThrow(repo.check);
  repo.git("add", "-f", "--", path);
  assert.throws(repo.check, /Personal home paths/);
});

for (const missing of [false, true]) {
  test(`rejects private staged Markdown when its worktree is ${missing ? "deleted" : "cleaned"}`, (t) => {
    const repo = repository(t);
    const path = "docs/report.md";
    repo.write(path, "/home/privacy-canary/project");
    repo.git("add", "--", path);
    if (missing) rmSync(join(repo.root, path));
    else repo.write(path, "<repo-root>");
    assert.throws(repo.check, (error) => {
      assert.ok(error.message.includes(`${path}:1 (staged)`));
      assert.ok(!error.message.includes("privacy-canary"));
      return true;
    });
  });
}

test("checks tracked Markdown and allows an unstaged historical redaction or deletion", (t) => {
  const repo = repository(t);
  const path = "README.md";
  repo.write(path, "/home/privacy-canary/project");
  repo.git("add", "--", path);
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
    "synthetic historical path",
  );
  assert.throws(repo.check, /README\.md:1 \(worktree\)/);
  repo.write(path, "<repo-root>");
  assert.doesNotThrow(repo.check);
  rmSync(join(repo.root, path));
  assert.doesNotThrow(repo.check);
  repo.git("add", "--", path);
  // A staged deletion does not exempt a new untracked file at the same path.
  repo.write(path, "/home/privacy-canary/recreated");
  assert.throws(repo.check, /README\.md:1 \(worktree\)/);
});

test("checks emphasized staged modifications when their worktree correction is clean", (t) => {
  const repo = repository(t);
  const path = "docs/report.md";
  repo.write(path, "<repo-root>");
  repo.git("add", "--", path);
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
    "synthetic public summary",
  );
  repo.write(path, String.raw`_C:\Users\privacy-canary\project_`);
  repo.git("add", "--", path);
  repo.write(path, "<repo-root>");
  assert.throws(repo.check, (error) => {
    assert.match(error.message, /docs\/report\.md:1 \(staged\)/);
    assert.ok(!error.message.includes("privacy-canary"));
    return true;
  });
});

test("exempts only the exact historical synthetic-canary sentence", (t) => {
  const repo = repository(t);
  const path =
    "docs/plans/completed/M006-001-local-tts-profile-blocker-resolution.md";
  const canary =
    "  one home-style match is the deliberate `/home/private/voice` privacy canary.";
  repo.write(path, `${canary}\n`);
  assert.doesNotThrow(repo.check);
  repo.write(path, `${canary}\n/home/privacy-canary/project\n`);
  assert.throws(repo.check, (error) => {
    assert.ok(error.message.includes(`${path}:2 (worktree)`));
    return true;
  });
  repo.write(path, `${canary} /home/privacy-canary/project\n`);
  assert.throws(repo.check, /Personal home paths/);
  repo.write(path, `${canary}\n`);
  repo.write("docs/other.md", `${canary}\n`);
  assert.throws(repo.check, /docs\/other\.md:1 \(worktree\)/);
});

test("fails closed when a tracked Markdown file cannot be read", (t) => {
  const repo = repository(t);
  const path = "docs/report.md";
  repo.write(path);
  repo.git("add", "--", path);
  rmSync(join(repo.root, path));
  mkdirSync(join(repo.root, path));
  assert.throws(repo.check, (error) => {
    assert.match(
      error.message,
      /Cannot read Markdown evidence: docs\/report\.md/,
    );
    assert.ok(!error.message.includes(repo.root));
    assert.equal(error.cause, undefined);
    return true;
  });
});
