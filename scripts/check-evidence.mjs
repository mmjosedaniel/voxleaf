import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const evidenceRoot = "docs/plans/evidence/";
const curatedIdentities = new Set([
  `${evidenceRoot}native-rust-test-layout/initial-inventory.json.txt`,
  `${evidenceRoot}linux-rust-test-repair/review-input.json.txt`,
  `${evidenceRoot}chatterbox-security-refresh/review-identities-01.txt`,
  `${evidenceRoot}chatterbox-security-refresh/integration-review-identities-01.txt`,
]);

// Inspect the index, so ignored files forced into Git are still checked.
export function checkEvidence(
  repositoryRoot,
  { git = "git", env = process.env } = {},
) {
  function gitPaths(args) {
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
    if (result.stdout !== "" && !result.stdout.endsWith("\0")) {
      throw new Error("Git evidence paths are not NUL terminated");
    }
    return result.stdout === "" ? [] : result.stdout.slice(0, -1).split("\0");
  }

  const indexedPaths = gitPaths(["ls-files", "--cached", "-z"]);
  // Existing HEAD files retired in the worktree may still be in the index
  // before staging. A staged new raw file missing locally is not a HEAD deletion.
  const deletedPaths = new Set(
    gitPaths([
      "diff",
      "--name-only",
      "--diff-filter=D",
      "-z",
      "HEAD",
      "--",
      evidenceRoot,
    ]),
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
