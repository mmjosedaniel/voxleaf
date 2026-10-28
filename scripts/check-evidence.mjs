import { spawnSync } from "node:child_process";
import { lstatSync, readFileSync, readlinkSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const evidenceRoot = "docs/plans/evidence/";
const curatedIdentities = new Set([
  `${evidenceRoot}native-rust-test-layout/initial-inventory.json.txt`,
  `${evidenceRoot}linux-rust-test-repair/review-input.json.txt`,
  `${evidenceRoot}chatterbox-security-refresh/review-identities-01.txt`,
  `${evidenceRoot}chatterbox-security-refresh/integration-review-identities-01.txt`,
]);

// Match literal home directories, including escaped Windows separators. Prefer
// <repo-root>, <user>, %USERPROFILE% or $HOME in public documentation.
const personalHomePath =
  /(?<![a-z0-9.-])(?:[a-z]:[\\/]+Users[\\/]+|\/(?:Users|home)\/)[^\\/\s`"'<>${}[\]%]+/i;

function privatePathLocations(path, text, source) {
  const violations = [];
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    // This exact historical sentence documents a synthetic privacy test.
    if (
      path ===
        "docs/plans/completed/M006-001-local-tts-profile-blocker-resolution.md" &&
      line ===
        "  one home-style match is the deliberate `/home/private/voice` privacy canary."
    ) {
      continue;
    }
    if (personalHomePath.test(line)) {
      violations.push(`${path}:${index + 1} (${source})`);
    }
  }
  return violations;
}

// Inspect the index, so ignored files forced into Git are still checked.
export function checkEvidence(
  repositoryRoot,
  { git = "git", env = process.env } = {},
) {
  function gitOutput(args) {
    const result = spawnSync(git, args, {
      cwd: repositoryRoot,
      env,
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
      shell: false,
    });
    if (result.error || result.status !== 0) {
      throw new Error("Cannot read Git evidence paths", {
        cause: result.error,
      });
    }
    return result.stdout;
  }

  function gitPaths(args) {
    const output = gitOutput(args);
    if (output !== "" && !output.endsWith("\0")) {
      throw new Error("Git evidence paths are not NUL terminated");
    }
    return output === "" ? [] : output.slice(0, -1).split("\0");
  }

  const indexedPaths = gitPaths(["ls-files", "--cached", "-z"]);
  // Existing HEAD files retired in the worktree may still be in the index
  // before staging. A staged new raw file missing locally is not a HEAD deletion.
  const deletedPaths = new Set(
    gitPaths(["diff", "--name-only", "--diff-filter=D", "-z", "HEAD", "--"]),
  );
  const violations = [...new Set(indexedPaths)].filter(
    (path) =>
      path.startsWith(evidenceRoot) &&
      !path.endsWith(".md") &&
      !curatedIdentities.has(path) &&
      !deletedPaths.has(path),
  );
  if (violations.length > 0) {
    throw new Error(
      `Raw evidence is tracked:\n${violations.map((path) => `- ${path}`).join("\n")}\nKeep raw output in ignored tmp/evidence/<run> or CI artifacts; see docs/development/evidence-retention.md.`,
    );
  }

  const isMarkdown = (path) => /\.md$/i.test(path);
  const stagedMarkdown = new Set(
    gitPaths([
      "diff",
      "--cached",
      "--name-only",
      "--diff-filter=ACMRT",
      "-z",
      "HEAD",
      "--",
    ]).filter(isMarkdown),
  );
  const worktreeMarkdown = new Set(
    [
      ...indexedPaths.filter((path) => !deletedPaths.has(path)),
      ...gitPaths(["ls-files", "--others", "--exclude-standard", "-z"]),
    ].filter(isMarkdown),
  );
  const privateLocations = [];
  for (const path of worktreeMarkdown) {
    let text;
    try {
      const file = resolve(repositoryRoot, path);
      // Inspect a tracked link's destination text without reading its target.
      text = lstatSync(file).isSymbolicLink()
        ? readlinkSync(file, "utf8")
        : readFileSync(file, "utf8");
    } catch (error) {
      // A new staged file may be missing locally; its index bytes are checked
      // below. Other read failures must not silently skip documentation.
      if (error.code === "ENOENT" && stagedMarkdown.has(path)) continue;
      // eslint-disable-next-line preserve-caught-error -- OS errors contain the private absolute checkout path.
      throw new Error(`Cannot read Markdown evidence: ${path}`);
    }
    privateLocations.push(...privatePathLocations(path, text, "worktree"));
  }
  // Read staged changes separately: cleaning the worktree must not hide private
  // bytes already staged. Unstaged redactions of existing HEAD files can pass.
  for (const path of stagedMarkdown) {
    privateLocations.push(
      ...privatePathLocations(path, gitOutput(["show", `:${path}`]), "staged"),
    );
  }
  if (privateLocations.length > 0) {
    throw new Error(
      `Personal home paths in Markdown:\n${privateLocations.map((location) => `- ${location}`).join("\n")}\nUse <repo-root> or a home-directory placeholder; see docs/development/evidence-retention.md.`,
    );
  }
}

if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  try {
    checkEvidence(resolve(import.meta.dirname, ".."));
    console.log("Evidence retention check passed.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
