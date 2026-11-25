import assert from "node:assert/strict";
import test from "node:test";
import {
  checkNodeReport,
  checkRustReport,
  checkWarnings,
} from "./release-audit-report.mjs";

test("release audit preserves advisory identity and distinguishes tool failure", () => {
  const node = {
    metadata: { vulnerabilities: { high: 0, critical: 0 } },
    advisories: {},
  };
  const rust = { vulnerabilities: { count: 0, list: [] } };
  checkNodeReport(node, 0);
  checkRustReport(rust, 0);
  assert.throws(() => checkNodeReport(node, 1), /scanner failed/);
  assert.throws(() => checkRustReport(rust, 1), /scanner failed/);
  assert.throws(() => checkNodeReport({}, 0), /invalid finding count/);
  assert.throws(() => checkRustReport({}, 0), /invalid finding count/);
  node.metadata.vulnerabilities.high = 1;
  node.advisories.x = {
    module_name: "demo",
    findings: [{ version: "1.0" }],
    github_advisory_id: "GHSA-demo",
  };
  assert.throws(() => checkNodeReport(node, 1), /demo@1.0: GHSA-demo/);
  rust.vulnerabilities = {
    count: 1,
    list: [
      {
        package: { name: "demo", version: "2.0" },
        advisory: { id: "RUSTSEC-demo" },
      },
    ],
  };
  assert.throws(() => checkRustReport(rust, 1), /demo@2.0: RUSTSEC-demo/);
});

test("warning fields ignore object ordering and preserve types, keys and multiplicity", () => {
  const row = { id: "notice", version: "1", windowsReachable: false };
  checkWarnings(
    [row],
    [{ windowsReachable: false, version: "1", id: "notice" }],
  );
  for (const expected of [
    [],
    [row, row],
    [{ ...row, version: 1 }],
    [{ ...row, windowsReachable: true }],
    [{ ...row, extra: true }],
    [{ id: "notice" }],
  ]) {
    assert.throws(() => checkWarnings([row], expected), /policy differs/);
  }
});
