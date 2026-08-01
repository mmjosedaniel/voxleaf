import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const repositoryRoot = resolve(import.meta.dirname, "..");
const policy = JSON.parse(
  readFileSync(
    join(repositoryRoot, "services/tts/release/audit-policy.json"),
    "utf8",
  ),
);
const temporaryDirectory = mkdtempSync(
  join(tmpdir(), "voxleaf-release-audit-"),
);

function run(name, args, { acceptFailure = false } = {}) {
  const command =
    process.platform === "win32" && name === "pnpm"
      ? (process.env.ComSpec ?? "cmd.exe")
      : name;
  const commandArguments =
    process.platform === "win32" && name === "pnpm"
      ? ["/d", "/s", "/c", "pnpm.cmd", ...args]
      : args;
  const result = spawnSync(command, commandArguments, {
    cwd: repositoryRoot,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    shell: false,
  });
  if (result.error) {
    throw result.error;
  }
  if (!acceptFailure && result.status !== 0) {
    throw new Error(
      `${name} ${args.join(" ")} failed (${result.status}):\n${result.stderr}`,
    );
  }
  return result;
}

function parseJsonOutput(result, label) {
  const firstBrace = result.stdout.indexOf("{");
  if (firstBrace < 0) {
    throw new Error(`${label} did not return a JSON object:\n${result.stderr}`);
  }
  try {
    return JSON.parse(result.stdout.slice(firstBrace));
  } catch (error) {
    throw new Error(`${label} returned invalid JSON: ${error.message}`, {
      cause: error,
    });
  }
}

function auditNode() {
  const result = run(
    "pnpm",
    ["audit", "--prod", "--audit-level", "high", "--json"],
    { acceptFailure: true },
  );
  const report = parseJsonOutput(result, "pnpm audit");
  const vulnerabilities = report.metadata?.vulnerabilities ?? {};
  const blocking =
    (vulnerabilities.high ?? 0) + (vulnerabilities.critical ?? 0);
  if (blocking > 0 || result.status !== 0) {
    throw new Error(
      `Production Node audit failed: ${vulnerabilities.high ?? 0} high and ${vulnerabilities.critical ?? 0} critical findings.`,
    );
  }
  console.log("release-audit:node:pass");
}

function auditRust() {
  const result = run(
    "cargo",
    ["audit", "--file", "apps/desktop/src-tauri/Cargo.lock", "--json"],
    { acceptFailure: true },
  );
  const report = parseJsonOutput(result, "cargo audit");
  const vulnerabilityCount = report.vulnerabilities?.count ?? 0;
  if (result.status !== 0 || vulnerabilityCount > 0) {
    throw new Error(
      `Production Rust audit failed: ${vulnerabilityCount} vulnerabilities.`,
    );
  }
  const tree = run("cargo", [
    "tree",
    "--locked",
    "--manifest-path",
    "apps/desktop/src-tauri/Cargo.toml",
    "--target",
    "x86_64-pc-windows-msvc",
    "--edges",
    "normal,build",
    "--prefix",
    "none",
    "--format",
    "{p}",
  ]);
  const reachablePackages = new Set(
    tree.stdout.split(/\r?\n/u).map((line) => line.trim()),
  );
  const actualWarnings = Object.values(report.warnings ?? {})
    .flat()
    .map((warning) => ({
      id: warning.advisory.id,
      package: warning.package.name,
      version: warning.package.version,
      kind: warning.kind,
      windowsReachable: reachablePackages.has(
        `${warning.package.name} v${warning.package.version}`,
      ),
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const expectedWarnings = [...policy.rustInformationalWarnings].sort(
    (left, right) => left.id.localeCompare(right.id),
  );
  if (JSON.stringify(actualWarnings) !== JSON.stringify(expectedWarnings)) {
    throw new Error(
      "RustSec informational warning set or Windows reachability changed; review and update the release audit policy.",
    );
  }
  const reachableWarningCount = actualWarnings.filter(
    (warning) => warning.windowsReachable,
  ).length;
  console.log(
    `release-audit:rust:pass:informational=${actualWarnings.length}:windows-reachable=${reachableWarningCount}`,
  );
}

function exportPythonGraph(graph) {
  if (graph.requirements) {
    return join(repositoryRoot, graph.requirements);
  }
  const output = join(temporaryDirectory, `${graph.id}.txt`);
  run("uv", [
    "export",
    "--project",
    graph.project,
    "--locked",
    "--no-dev",
    "--no-emit-project",
    "--format",
    "requirements-txt",
    "--output-file",
    output,
  ]);
  if (graph.excludedFirstPartyRequirements?.length) {
    const excluded = new Set(graph.excludedFirstPartyRequirements);
    const retained = readFileSync(output, "utf8")
      .split(/\r?\n/u)
      .filter((line) => !excluded.has(line.trim()))
      .join("\n");
    writeFileSync(output, retained, "utf8");
  }
  return output;
}

function auditPythonGraph(graph) {
  const requirements = exportPythonGraph(graph);
  const result = run(
    "uvx",
    [
      "--python",
      policy.tools.python,
      "--from",
      `pip-audit==${policy.tools.pipAudit}`,
      "pip-audit",
      "-r",
      requirements,
      "--no-deps",
      "--disable-pip",
      "--format",
      "json",
    ],
    { acceptFailure: true },
  );
  const report = parseJsonOutput(result, `pip-audit ${graph.id}`);
  const vulnerabilities = report.dependencies.flatMap((dependency) =>
    (dependency.vulns ?? []).map((vulnerability) => ({
      name: dependency.name,
      id: vulnerability.id,
    })),
  );
  const actualBlindSpots = report.dependencies
    .filter((dependency) => dependency.skip_reason)
    .map((dependency) => dependency.name)
    .sort();
  const expectedBlindSpots = graph.expectedBlindSpots
    .map((blindSpot) => blindSpot.name)
    .sort();
  if (JSON.stringify(actualBlindSpots) !== JSON.stringify(expectedBlindSpots)) {
    throw new Error(
      `${graph.id} audit blind spots changed: expected ${expectedBlindSpots.join(", ") || "none"}; received ${actualBlindSpots.join(", ") || "none"}.`,
    );
  }
  if (result.status !== 0 || vulnerabilities.length > 0) {
    throw new Error(
      `${graph.id} Python audit failed: ${vulnerabilities.map(({ name, id }) => `${name}:${id}`).join(", ") || "audit command failure"}.`,
    );
  }
  console.log(
    `release-audit:python:${graph.id}:pass:blind-spots=${actualBlindSpots.join(",") || "none"}`,
  );
}

try {
  auditNode();
  auditRust();
  for (const graph of policy.pythonGraphs) {
    auditPythonGraph(graph);
  }
  console.log("release-audit:pass");
} finally {
  rmSync(temporaryDirectory, { force: true, recursive: true });
}
