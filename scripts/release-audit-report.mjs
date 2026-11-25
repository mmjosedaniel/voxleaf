import { isDeepStrictEqual } from "node:util";

function checkCount(value, scanner) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${scanner} scanner returned an invalid finding count`);
  }
}

export function checkNodeReport(report, status) {
  const counts = report.metadata?.vulnerabilities;
  checkCount(counts?.high, "Node");
  checkCount(counts?.critical, "Node");
  if (counts.high + counts.critical > 0) {
    const details = Object.values(report.advisories ?? {}).flatMap((item) => {
      const identity = item.github_advisory_id || item.url || item.id;
      if (!identity || !item.module_name || !item.findings?.length) {
        throw new Error("Node scanner returned incomplete advisory details");
      }
      return item.findings.map(({ version }) => {
        if (!version)
          throw new Error("Node scanner omitted the affected version");
        return `${item.module_name}@${version}: ${identity}`;
      });
    });
    if (!details.length) {
      throw new Error(
        "Node scanner returned a finding count without advisory details",
      );
    }
    throw new Error(
      `Node: ${counts.high} high, ${counts.critical} critical. ${details.join(", ")}`,
    );
  }
  if (status !== 0) throw new Error(`Node scanner failed (exit ${status})`);
}

export function pythonFindingDetails(dependencies) {
  return dependencies.flatMap(({ name, version, vulns }) =>
    (vulns ?? []).map(
      ({ id }) => `${name}${version ? `@${version}` : ""}: ${id}`,
    ),
  );
}

export function reachableRustPackages(tree) {
  return new Set(
    tree.split(/\r?\n/u).flatMap((line) => {
      const match = /^(\S+ v\S+)/u.exec(line.trim());
      return match ? [match[1]] : [];
    }),
  );
}

export function checkRustReport(report, status) {
  const findings = report.vulnerabilities;
  checkCount(findings?.count, "Rust");
  if (
    !Array.isArray(findings.list) ||
    findings.list.length !== findings.count
  ) {
    throw new Error("Rust scanner returned an inconsistent finding list");
  }
  if (findings.count) {
    const details = findings.list.map(
      ({ advisory, package: pkg }) =>
        `${pkg.name}@${pkg.version}: ${advisory.id}`,
    );
    throw new Error(`Rust: ${details.join(", ")}`);
  }
  if (status !== 0) throw new Error(`Rust scanner failed (exit ${status})`);
}

export function checkWarnings(actual, expected) {
  if (!isDeepStrictEqual(actual, expected)) {
    throw new Error(
      `Rust warning policy differs. Received ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`,
    );
  }
}
