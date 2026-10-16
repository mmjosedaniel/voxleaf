import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  access,
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { PassThrough } from "node:stream";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  AuditReader,
  assertAudio,
  assertNoNetwork,
  assertWorkIdentity,
  childEnvironment,
  encodeControl,
  FrameReader,
  parseArguments,
  ProcessTree,
  pythonAuditPolicy,
  terminateTree,
  verifyModuleClosure,
  verifyRootBinding,
  verifyTree,
  withChild,
} from "./tts-adapter-layout-host.mjs";

const lockedPython = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../services/tts/.venv",
  process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
);
test("real locked Python denies execution, sockets and writes even when callers catch denial", async () => {
  await access(lockedPython);
  const root = await mkdtemp(path.join(tmpdir(), "voxleaf-audit-policy-"));
  const probePath = path.join(root, "numpy/testing/_private/utils.py");
  const marker = path.join(root, "executed.txt");
  const wrongSource = path.join(root, "other-utils.py");
  const fixture = `import subprocess,os
def check_support_sve(operation):
 try:
  operation()
 except OSError:
  return False
 raise AssertionError('process was permitted')
`;
  try {
    await mkdir(path.dirname(probePath), { recursive: true });
    await writeFile(probePath, fixture);
    await writeFile(wrongSource, fixture);
    const probe = {
      path: probePath,
      sha256: createHash("sha256").update(fixture).digest("hex"),
    };
    const invoke =
      "trusted=runpy.run_path(fixture_path,run_name='numpy.testing._private.utils')['check_support_sve']\n";
    const cases = [
      [
        "assert trusted(lambda:subprocess.run('lscpu',capture_output=True,text=True)) is False",
        "optionalProbeDenied",
        probe,
        1,
      ],
      [
        "assert trusted(lambda:subprocess.run(['lscpu'],capture_output=True,text=True)) is False",
        "optionalProbeDenied",
        probe,
        1,
      ],
      [
        "trusted(lambda:subprocess.run(['lscpu','extra']))",
        "processDenied",
        probe,
        1,
      ],
      [
        "trusted(lambda:subprocess.run([sys.executable,'-c',\"open('executed.txt','w').write('executed')\"]))",
        "processDenied",
        probe,
        1,
      ],
      [
        "trusted(lambda:subprocess.run('lscpu',shell=True))",
        "processDenied",
        probe,
        1,
      ],
      [
        "trusted(lambda:subprocess.run('lscpu',cwd=root))",
        "processDenied",
        probe,
        1,
      ],
      [
        "trusted(lambda:subprocess.run('lscpu',env={}))",
        "processDenied",
        probe,
        1,
      ],
      [
        "trusted(lambda:subprocess.run('lscpu',executable='lscpu'))",
        "processDenied",
        probe,
        1,
      ],
      [
        "runpy.run_path(wrong_source,run_name='numpy.testing._private.utils')['check_support_sve'](lambda:subprocess.run('lscpu'))",
        "processDenied",
        probe,
        1,
      ],
      [
        "runpy.run_path(fixture_path,run_name='other')['check_support_sve'](lambda:subprocess.run('lscpu'))",
        "processDenied",
        probe,
        1,
      ],
      [
        "trusted(lambda:subprocess.run('lscpu'))",
        "processDenied",
        { ...probe, sha256: "0".repeat(64) },
        1,
      ],
      ["subprocess.run('lscpu')", "processDenied", probe, 1],
      ["os.system('lscpu')", "processDenied", probe, 1],
      ["os.system(shell_marker)", "processDenied", null, 0],
      [
        "subprocess.run([sys.executable,'-c',\"open('executed.txt','w').write('executed')\"])",
        "processDenied",
        null,
        0,
      ],
      ["socket.getaddrinfo('localhost',80)", "networkDenied", null, 0],
      ["socket.socket().bind(('127.0.0.1',0))", "networkDenied", null, 0],
      ["socket.socket().connect(('127.0.0.1',9))", "networkDenied", null, 0],
      ["open(root/'audio.wav','wb')", "audioWritesDenied", null, 0],
      ["open(root/'payload.txt','w')", "payloadWritesDenied", null, 0],
      [
        "trusted(lambda:subprocess.run('lscpu'));trusted(lambda:subprocess.run('lscpu'))",
        "optionalProbeDenied",
        probe,
        1,
      ],
    ];
    const shellMarker = `"${lockedPython}" -I -B -c "open('executed.txt','w').write('executed')"`;
    const canonicalPython = await realpath(lockedPython);
    for (const [operation, counter, authority, budget] of cases) {
      const source =
        `import subprocess,socket,runpy,sys\nfrom pathlib import Path\nassert Path(sys.executable).resolve()==Path(${JSON.stringify(canonicalPython)})\nfixture_path=${JSON.stringify(probePath)}\nwrong_source=${JSON.stringify(wrongSource)}\nshell_marker=${JSON.stringify(shellMarker)}\n` +
        pythonAuditPolicy(root, root, authority) +
        invoke +
        `try:\n ${operation}\nexcept PermissionError:\n pass\n`;
      const result = spawnSync(lockedPython, ["-I", "-B", "-c", source], {
        cwd: root,
        encoding: "utf8",
        timeout: 10_000,
        maxBuffer: 65_536,
        windowsHide: true,
      });
      assert.equal(result.error, undefined);
      assert.equal(result.status, 0, result.stderr);
      const stream = new PassThrough();
      const reader = new AuditReader(stream, budget);
      stream.write(result.stderr);
      assert.ok(reader.last[counter] >= 1);
      for (const key of [
        "networkDenied",
        "processDenied",
        "optionalProbeDenied",
        "optionalIpv6ProbeDenied",
        "audioWritesDenied",
        "payloadWritesDenied",
      ])
        if (key !== counter) assert.equal(reader.last[key], 0);
      if (counter === "optionalProbeDenied" && reader.last[counter] === 1)
        assert.equal(reader.admit(true).optionalProbeDenied, 1);
      else assert.throws(() => reader.admit(true), /filesystem-network-audit/u);
      await assert.rejects(access(marker), { code: "ENOENT" });
      for (const name of ["audio.wav", "payload.txt"])
        await assert.rejects(access(path.join(root, name)), { code: "ENOENT" });
      assert.equal(await readFile(probePath, "utf8"), fixture);
    }
    const forced = spawnSync(
      lockedPython,
      [
        "-I",
        "-B",
        "-c",
        pythonAuditPolicy(root, root) +
          `import subprocess\nassert Path(sys.executable).resolve()==Path(${JSON.stringify(canonicalPython)})\nsys.stderr.write('noise' * 10000)\ntry:\n subprocess.run([sys.executable,'-c',"open('executed.txt','w').write('executed')"])\nexcept PermissionError:\n pass\nos._exit(0)\n`,
      ],
      {
        cwd: root,
        encoding: "utf8",
        timeout: 10_000,
        maxBuffer: 65_536,
        windowsHide: true,
      },
    );
    assert.equal(forced.error, undefined);
    assert.equal(forced.status, 0, forced.stderr);
    const stream = new PassThrough();
    const forcedAudit = new AuditReader(stream, 0);
    stream.write(forced.stderr);
    assert.equal(forcedAudit.final, false);
    assert.equal(forcedAudit.last.processDenied, 1);
    assert.throws(() => forcedAudit.admit(false), /filesystem-network-audit/u);
    await assert.rejects(access(marker), { code: "ENOENT" });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("streaming audit admission keeps caught violations through truncation and forced exit", () => {
  const zero = {
    writes: 0,
    networkDenied: 0,
    processDenied: 0,
    optionalProbeDenied: 0,
    optionalIpv6ProbeDenied: 0,
    audioWritesDenied: 0,
    payloadWritesDenied: 0,
  };
  const line = (phase, counts = zero) =>
    `VOXLEAF_LAYOUT_AUDIT:${JSON.stringify({ phase, counts })}\n`;
  const admit = (text, budget = 0, clean = true) => {
    const stream = new PassThrough();
    const reader = new AuditReader(stream, budget);
    for (let offset = 0; offset < text.length; offset += 7)
      stream.write(text.slice(offset, offset + 7));
    return reader.admit(clean);
  };
  assert.equal(admit(line("activation"), 0, false).orderlyExit, false);
  assert.equal(admit(line("activation") + line("exit")).orderlyExit, true);
  for (const clean of [false, true])
    assert.throws(
      () => admit(line("activation") + line("exit"), 1, clean),
      /filesystem-network-audit/u,
    );
  const denied = { ...zero, optionalProbeDenied: 1 };
  assert.equal(
    admit(line("activation") + line("denial", denied), 1, false)
      .optionalProbeDenied,
    1,
  );
  assert.throws(
    () => admit(line("activation") + line("denial", denied), 0, false),
    /filesystem-network-audit/u,
  );
  for (const key of [
    "networkDenied",
    "processDenied",
    "audioWritesDenied",
    "payloadWritesDenied",
  ]) {
    const text =
      line("activation") +
      line("denial", { ...zero, [key]: 1 }) +
      "noise".repeat(10_000) +
      "\n";
    assert.throws(() => admit(text, 1, false), /filesystem-network-audit/u);
  }
  for (const text of [
    "",
    line("activation"),
    line("exit"),
    line("activation") + line("activation"),
    line("activation") + line("denial"),
    line("activation") + line("exit") + line("exit"),
    "VOXLEAF_LAYOUT_AUDIT:{invalid}\n",
    "VOXLEAF_LAYOUT_AUDIT:" + "x".repeat(600) + "\n",
    line("activation") + "VOXLEAF_LAYOUT_AUDIT:{",
  ])
    assert.throws(() => admit(text), /audit|JSON/u);
  for (const value of [undefined, -1, 0.5, 4097, "0", true, null])
    assert.throws(
      () =>
        admit(line("activation", { ...zero, writes: value }) + line("exit")),
      /audit-schema/u,
    );
  assert.throws(
    () => admit(line("activation", { ...zero, extra: 0 })),
    /audit-schema/u,
  );
  assert.throws(
    () =>
      admit(
        line("activation") + line("denial", denied) + line("exit", zero),
        1,
      ),
    /audit-sequence/u,
  );
  assert.throws(() => new AuditReader(new PassThrough(), 2), /audit-budget/u);
});

test("real locked Python classifies only the denied provenance-bound IPv6 bind", async () => {
  await access(lockedPython);
  const root = await mkdtemp(path.join(tmpdir(), "voxleaf-ipv6-policy-"));
  const sourcePath = path.join(root, "connection.py");
  const otherPath = path.join(root, "other-connection.py");
  const fixture = `import socket
def _has_ipv6(address=('::1',0),family=socket.AF_INET6,kind=socket.SOCK_STREAM,protocol=0,operation='bind'):
 with socket.socket(family,kind,protocol) as candidate:
  try:
   if operation=='bind':candidate.bind(address)
   elif operation=='connect':candidate.connect(address)
   else:socket.getaddrinfo('localhost',80)
  except PermissionError:
   try:
    assert candidate.getsockname()[1]==0
   except OSError:
    pass
   return False
  raise AssertionError('socket operation was permitted')
`;
  try {
    await writeFile(sourcePath, fixture);
    await writeFile(otherPath, fixture);
    const authority = {
      path: sourcePath,
      sha256: createHash("sha256").update(fixture).digest("hex"),
    };
    const canonicalPython = await realpath(lockedPython);
    const cases = [
      ["assert trusted() is False", 0],
      [
        "assert trusted() is False",
        1,
        { ...authority, sha256: "0".repeat(64) },
      ],
      [
        "trusted=runpy.run_path(other_path,run_name='urllib3.util.connection')['_has_ipv6'];assert trusted() is False",
        1,
      ],
      [
        "trusted=runpy.run_path(fixture_path,run_name='other')['_has_ipv6'];assert trusted() is False",
        1,
      ],
      [
        "trusted.__globals__['__file__']=other_path;assert trusted() is False",
        1,
      ],
      [
        "trusted.__code__=trusted.__code__.replace(co_name='other');assert trusted() is False",
        1,
      ],
      ["assert trusted(address=('::',0)) is False", 1],
      ["assert trusted(address=('::1',1)) is False", 1],
      ["assert trusted(address=('::1',False)) is False", 1],
      ["assert trusted(address=('::1',0,0,0)) is False", 1],
      [
        "assert trusted(address=('127.0.0.1',0),family=socket.AF_INET) is False",
        1,
      ],
      ["assert trusted(kind=socket.SOCK_DGRAM) is False", 1],
      ["assert trusted(protocol=socket.IPPROTO_TCP) is False", 1],
      [
        "with socket.socket(socket.AF_INET6) as ordinary:\n ordinary.bind(('::1',0))",
        1,
      ],
      ["assert trusted(operation='connect') is False", 1],
      ["assert trusted(operation='resolve') is False", 1],
      ["assert trusted() is False;assert trusted() is False", 0, authority, 2],
    ];
    for (const [
      operation,
      unexpected,
      descriptor = authority,
      attempts = 1,
    ] of cases) {
      const source =
        "import sys,json\nevents=[]\ndef observe(event,args):\n if event in ('socket.bind','socket.connect','socket.getaddrinfo'):events.append(event)\nsys.addaudithook(observe)\n" +
        pythonAuditPolicy(root, root, null, descriptor) +
        `import runpy\nassert Path(sys.executable).resolve()==Path(${JSON.stringify(canonicalPython)})\nfixture_path=${JSON.stringify(sourcePath)}\nother_path=${JSON.stringify(otherPath)}\ntrusted=runpy.run_path(fixture_path,run_name='urllib3.util.connection')['_has_ipv6']\ntry:\n` +
        operation
          .split("\n")
          .map((line) => ` ${line}\n`)
          .join("") +
        "except PermissionError:\n pass\nprint(json.dumps(events))\n";
      const result = spawnSync(lockedPython, ["-I", "-B", "-c", source], {
        cwd: root,
        encoding: "utf8",
        timeout: 10_000,
        maxBuffer: 65_536,
        windowsHide: true,
      });
      assert.equal(result.error, undefined);
      assert.equal(result.status, 0, result.stderr);
      const expectedEvent = operation.includes("operation='connect'")
        ? "socket.connect"
        : operation.includes("operation='resolve'")
          ? "socket.getaddrinfo"
          : "socket.bind";
      assert.deepEqual(
        JSON.parse(result.stdout),
        Array(attempts).fill(expectedEvent),
      );
      const stream = new PassThrough();
      const reader = new AuditReader(stream, 0, 1);
      stream.write(result.stderr);
      assert.equal(reader.last.networkDenied, unexpected);
      assert.equal(
        reader.last.optionalIpv6ProbeDenied,
        unexpected ? 0 : attempts,
      );
      for (const key of [
        "processDenied",
        "optionalProbeDenied",
        "audioWritesDenied",
        "payloadWritesDenied",
      ])
        assert.equal(reader.last[key], 0);
      if (unexpected || reader.last.optionalIpv6ProbeDenied !== 1)
        assert.throws(() => reader.admit(true), /filesystem-network-audit/u);
      else {
        assert.equal(reader.admit(true).optionalIpv6ProbeDenied, 1);
        const piperStream = new PassThrough();
        const piperAudit = new AuditReader(piperStream, 0, 0);
        piperStream.write(result.stderr);
        assert.throws(
          () => piperAudit.admit(true),
          /filesystem-network-audit/u,
        );
      }
      assert.equal(await readFile(sourcePath, "utf8"), fixture);
    }
    const forcedSource =
      pythonAuditPolicy(root, root, null, authority) +
      `sys.stderr.write('noise' * 10000)\nwith socket.socket(socket.AF_INET6) as ordinary:\n try:\n  ordinary.bind(('::1',0))\n except PermissionError:\n  pass\nos._exit(0)\n`;
    const forced = spawnSync(lockedPython, ["-I", "-B", "-c", forcedSource], {
      cwd: root,
      encoding: "utf8",
      timeout: 10_000,
      maxBuffer: 65_536,
      windowsHide: true,
    });
    assert.equal(forced.error, undefined);
    assert.equal(forced.status, 0, forced.stderr);
    const stream = new PassThrough();
    const reader = new AuditReader(stream, 0, 1);
    stream.write(forced.stderr);
    assert.equal(reader.final, false);
    assert.equal(reader.last.networkDenied, 1);
    assert.equal(reader.last.optionalIpv6ProbeDenied, 0);
    assert.throws(() => reader.admit(false), /filesystem-network-audit/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("both probe budgets and exact IPv6 schema apply to forced and clean evidence", () => {
  const zero = {
    writes: 0,
    networkDenied: 0,
    processDenied: 0,
    optionalProbeDenied: 0,
    optionalIpv6ProbeDenied: 0,
    audioWritesDenied: 0,
    payloadWritesDenied: 0,
  };
  const line = (phase, counts) =>
    `VOXLEAF_LAYOUT_AUDIT:${JSON.stringify({ phase, counts })}\n`;
  function observed(cpu, ipv6, clean, fields = zero) {
    const stream = new PassThrough();
    const reader = new AuditReader(stream, 1, 1);
    stream.write(line("activation", fields));
    let counts = { ...fields };
    for (const [key, times] of [
      ["optionalProbeDenied", cpu],
      ["optionalIpv6ProbeDenied", ipv6],
    ])
      for (let index = 0; index < times; index += 1) {
        counts = { ...counts, [key]: counts[key] + 1 };
        stream.write(line("denial", counts));
      }
    if (clean) stream.write(line("exit", counts));
    return reader.admit(clean);
  }
  for (const clean of [false, true]) {
    assert.equal(observed(1, 1, clean).optionalIpv6ProbeDenied, 1);
    for (const [cpu, ipv6] of [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 2],
      [2, 1],
    ])
      assert.throws(
        () => observed(cpu, ipv6, clean),
        /filesystem-network-audit/u,
      );
    for (const value of [undefined, null, true, -1, 0.5, 4097, "0"])
      assert.throws(
        () =>
          observed(1, 1, clean, { ...zero, optionalIpv6ProbeDenied: value }),
        /audit-schema/u,
      );
  }
  assert.throws(
    () => new AuditReader(new PassThrough(), 0, 2),
    /audit-budget/u,
  );
});

const environment = { LOCALAPPDATA: path.resolve("tmp/host-local-app-data") };
const identity = {
  requestId: "request:1",
  sessionId: "session:1",
  generationId: "generation:1",
  segmentId: "segment:1",
};
test("completion identity accepts sorted wire keys and rejects field drift", () => {
  const sorted = JSON.parse(
    JSON.stringify(identity, Object.keys(identity).sort()),
  );
  assert.deepEqual(Object.keys(sorted), [
    "generationId",
    "requestId",
    "segmentId",
    "sessionId",
  ]);
  assert.doesNotThrow(() => assertWorkIdentity(sorted, identity));
  for (const key of Object.keys(identity)) {
    const missing = { ...sorted };
    delete missing[key];
    for (const invalid of [missing, { ...sorted, [key]: "stale" }])
      assert.throws(
        () => assertWorkIdentity(invalid, identity),
        /completed-identity/u,
      );
  }
  assert.throws(
    () => assertWorkIdentity({ ...sorted, extra: "value" }, identity),
    /completed-identity/u,
  );
});
function metadata() {
  return {
    kind: "audioMetadata",
    requestId: identity.requestId,
    sampleFormat: "float32-le",
    payloadBytes: 16,
    frame: {
      schemaVersion: 1,
      frameId: identity.requestId,
      sessionId: identity.sessionId,
      generationId: identity.generationId,
      segmentId: identity.segmentId,
      sequence: 0,
      sampleRateHz: 24_000,
      channelCount: 1,
      sampleCountSamples: 4,
      endOfSegment: true,
    },
  };
}
test("admits only the three modes with absolute contained artifact and receipt paths", () => {
  for (const mode of ["preflight", "candidate", "desktop"]) {
    const options = parseArguments(["--mode", mode], environment);
    assert.equal(options.mode, mode);
    assert.ok(path.isAbsolute(options.piperRoot));
    assert.ok(
      options.chatterboxRoot.endsWith(path.join("v4", "voxleaf-chatterbox-v4")),
    );
    assert.ok(
      options.chatterboxModelRoot.endsWith(path.join("cb", "3", "models")),
    );
  }
  for (const args of [
    ["--mode", "journey"],
    ["--mode", "candidate", "--mode", "desktop"],
    ["--unknown", "x"],
    ["--piper-root", "relative"],
    ["--receipt", path.resolve("package.json")],
    ["--chatterbox-model-root", path.resolve("services/tts/src")],
  ]) {
    assert.throws(
      () => parseArguments(args, environment),
      /tts-adapter-layout-host:/u,
    );
  }
  assert.throws(() => parseArguments([], {}), /local-app-data/u);
});
test("removes checkout/user/development injection while retaining offline identity", () => {
  const sanitized = childEnvironment(
    {
      ...environment,
      PYTHONPATH: "checkout",
      PYTHONHOME: "outside",
      PYTHONUSERBASE: "user",
      VIRTUAL_ENV: "dev",
      VOXLEAF_TTS_PIPER_PYTHON: "dev",
      VOXLEAF_TTS_CHATTERBOX_ENABLED: "1",
      PATH: "retained",
      SystemRoot: "C:\\Windows",
      PSModulePath: "development-module-path",
    },
    "cache",
  );
  for (const key of [
    "PYTHONPATH",
    "PYTHONHOME",
    "PYTHONUSERBASE",
    "VIRTUAL_ENV",
    "VOXLEAF_TTS_PIPER_PYTHON",
    "VOXLEAF_TTS_CHATTERBOX_ENABLED",
  ])
    assert.equal(sanitized[key], undefined);
  assert.equal(sanitized.PATH, "retained");
  assert.equal(
    sanitized.PSModulePath,
    process.platform === "win32"
      ? path.join("C:\\Windows", "System32/WindowsPowerShell/v1.0/Modules")
      : "development-module-path",
  );
  assert.equal(sanitized.HF_HUB_OFFLINE, "1");
  assert.equal(sanitized.TRANSFORMERS_OFFLINE, "1");
  assert.equal(sanitized.PYTHONDONTWRITEBYTECODE, "1");
});
test("module closure rejects missing required modules, dormant providers and maintainers", () => {
  const prefix = "runtime/Lib/site-packages/voxleaf_tts/";
  const expected = [
    "service.py",
    "adapters/fake.py",
    "generated/protocol_schemas.py",
  ];
  const manifest = { files: expected.map((name) => ({ path: prefix + name })) };
  verifyModuleClosure(manifest, expected);
  for (const files of [
    manifest.files.slice(1),
    [...manifest.files, { path: prefix + "adapters/qwen.py" }],
    [...manifest.files, { path: prefix + "packaging/chatterbox_sources.py" }],
  ]) {
    assert.throws(
      () => verifyModuleClosure({ files }, expected),
      /module-closure/u,
    );
  }
});
test("tree verifier binds actual bytes and rejects missing extra tampered and duplicate records", async () => {
  // TEMP may use a short path or aliased parent; the fixture needs a canonical root.
  const root = await mkdtemp(
    path.join(await realpath(tmpdir()), "voxleaf-layout-test-"),
  );
  try {
    const payload = Buffer.from("synthetic payload");
    await mkdir(path.join(root, "runtime"));
    await writeFile(path.join(root, "runtime/python.exe"), payload);
    await writeFile(path.join(root, "manifest.json"), "{}");
    const record = {
      path: "runtime/python.exe",
      sizeBytes: payload.length,
      sha256: createHash("sha256").update(payload).digest("hex"),
    };
    const result = await verifyTree(root, { files: [record] }, "manifest.json");
    assert.equal(result.fileCount, 1);
    assert.equal(result.bytes, payload.length);
    const linkedRoot = `${root}-link`;
    await symlink(root, linkedRoot, "junction");
    try {
      await assert.rejects(
        verifyTree(linkedRoot, { files: [record] }, "manifest.json"),
        /artifact-link/u,
      );
    } finally {
      await rm(linkedRoot);
    }
    await symlink(
      path.join(root, "runtime"),
      path.join(root, "alias"),
      "junction",
    );
    await assert.rejects(
      verifyTree(root, { files: [record] }, "manifest.json"),
      /artifact-link/u,
    );
    await rm(path.join(root, "alias"));
    await assert.rejects(
      verifyTree(root, { files: [record, record] }, "manifest.json"),
      /manifest/u,
    );
    await writeFile(path.join(root, "extra.txt"), "extra");
    await assert.rejects(
      verifyTree(root, { files: [record] }, "manifest.json"),
      /tree-closure/u,
    );
    await rm(path.join(root, "extra.txt"));
    await writeFile(path.join(root, "runtime/python.exe"), "tampered");
    await assert.rejects(
      verifyTree(root, { files: [record] }, "manifest.json"),
      /tree-identity/u,
    );
    await rm(path.join(root, "runtime/python.exe"));
    await assert.rejects(
      verifyTree(root, { files: [record] }, "manifest.json"),
      /tree-closure/u,
    );
    await assert.rejects(
      verifyTree(
        root,
        { files: [{ ...record, path: "../outside" }] },
        "manifest.json",
      ),
      /artifact-path/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("admits only the verified Windows virtualization pair without root links", () => {
  const environment = { LOCALAPPDATA: "C:/Users/synthetic/AppData/Local" };
  const logical =
    "C:/Users/synthetic/AppData/Local/com.voxleaf.desktop/tts/cb/3";
  const canonical =
    "C:/Users/synthetic/AppData/Local/Packages/OpenAI.Codex_2p2nqsd0c76g0/LocalCache/Local/com.voxleaf.desktop/tts/cb/3";
  assert.equal(
    verifyRootBinding(logical, canonical, false, environment),
    canonical,
  );
  assert.equal(verifyRootBinding(canonical, canonical, false), canonical);
  for (const [root, actual, link] of [
    [logical, canonical, true],
    [logical, `${canonical}-other`, false],
    [`${logical}-other`, canonical, false],
  ])
    assert.throws(
      () => verifyRootBinding(root, actual, link, environment),
      /artifact-link/u,
    );
});
test("framing accepts fragmented records and rejects declared overflow before buffering", async () => {
  const stream = new PassThrough();
  const reader = new FrameReader(stream);
  const encoded = encodeControl({ kind: "synthetic" });
  const pending = reader.next(1000);
  stream.write(encoded.subarray(0, 7));
  stream.write(encoded.subarray(7));
  const decoded = await pending;
  assert.equal(decoded.kind, 1);
  assert.deepEqual(JSON.parse(decoded.payload), { kind: "synthetic" });
  const oversized = Buffer.alloc(12);
  oversized.write("VLTP");
  oversized.writeUInt16BE(1, 4);
  oversized[6] = 1;
  oversized.writeUInt32BE(16_385, 8);
  stream.write(oversized);
  await assert.rejects(reader.next(1000), /frame-header/u);
  const invalid = new PassThrough();
  const other = new FrameReader(invalid);
  const flags = Buffer.from(encoded);
  flags[7] = 1;
  invalid.write(flags);
  await assert.rejects(other.next(1000), /frame-header/u);
});
test("frame timeout always invokes tree cleanup through the owner", async () => {
  const reader = new FrameReader(new PassThrough());
  const cleanups = [];
  const child = { pid: 123 };
  await assert.rejects(
    withChild(
      child,
      () => reader.next(1),
      async (value) => {
        cleanups.push(value.pid);
      },
    ),
    /frame-timeout/u,
  );
  assert.deepEqual(cleanups, [123]);
  await withChild(
    child,
    async () => 42,
    async (value) => {
      cleanups.push(value.pid);
    },
  );
  assert.deepEqual(cleanups, [123, 123]);
});
const processRow = (pid, parent, tick = pid) => ({
  ProcessId: pid,
  ParentProcessId: parent,
  CreationDate: `2026-10-16T00:00:00.${String(tick).padStart(7, "0")}Z`,
  ExecutablePath: "C:\\synthetic\\python.exe",
});
function cleanupIO(snapshot) {
  let time = 0;
  const killed = [];
  return {
    snapshot,
    killed,
    kill: (pid) => {
      killed.push(pid);
      return {};
    },
    now: () => time,
    pause: async (ms) => {
      time += ms;
    },
  };
}
test("network observation skips empty ownership and binds nonempty queries", () => {
  const queries = [];
  const query = (script) => {
    queries.push(script);
    return "0";
  };
  assertNoNetwork([], query);
  assert.equal(queries.length, 0);
  const owned = [processRow(10, 1, 17)];
  assertNoNetwork(owned, query);
  assert.equal(queries.length, 1);
  assert.ok(
    queries[0].startsWith("$expected=@{10='2026-10-16T00:00:00.0000017Z'};"),
  );
  assert.throws(
    () => assertNoNetwork(owned, () => "1"),
    /network-observation/u,
  );
  const error = new Error("synthetic-query-error");
  const failedQuery = () => {
    throw error;
  };
  assert.throws(
    () => assertNoNetwork(owned, failedQuery),
    (actual) => actual === error,
  );
});
test("owned lifetimes traverse shuffled rows but never adopt replacement roots or parents", () => {
  const root = processRow(10, 1);
  const child = processRow(20, 10);
  const leaf = processRow(30, 20);
  const tree = new ProcessTree([leaf, child, root], 10, "synthetic-arm");
  const ids = tree.observe([leaf, root, child]).map((row) => row.ProcessId);
  assert.deepEqual(ids, [10, 20, 30]);
  const replacements = [
    processRow(10, 1, 40),
    processRow(20, 10, 50),
    processRow(40, 20, 60),
  ];
  assert.deepEqual(tree.observe(replacements), []);
  assert.deepEqual(tree.observe([leaf]), [leaf]);
  assert.deepEqual(tree.observe([]), []);
  const reusedParent = new ProcessTree([root, child], 10);
  const outside = [root, processRow(20, 1, 50), processRow(40, 20, 60)];
  assert.deepEqual(reusedParent.observe(outside), [root]);
  const older = [root, processRow(5, 10, 5)];
  assert.deepEqual(new ProcessTree(older, 10).observe(older), [root]);
});
test("missing or ambiguous relevant creation data rejects, unrelated protected rows do not", () => {
  const root = processRow(10, 1);
  const tree = new ProcessTree([root, { ProcessId: 99 }], 10);
  assert.deepEqual(tree.observe([root, { ProcessId: 99 }]), [root]);
  for (const snapshot of [[], [{ ...root, CreationDate: null }], [root, root]])
    assert.throws(() => new ProcessTree(snapshot, 10), /process-identity/u);
  for (const snapshot of [
    [{ ...root, CreationDate: null }],
    [root, { ProcessId: 20, ParentProcessId: 10 }],
  ])
    assert.throws(() => tree.observe(snapshot), /process-identity/u);
  assert.throws(() => tree.observe([processRow(20, 10)]), /process-ancestry/u);
});
test("cleanup ignores replacement lifetimes and never kills a reused root", async () => {
  const root = processRow(10, 1);
  const tree = new ProcessTree([root, processRow(20, 10)], 10);
  const io = cleanupIO(() => [processRow(10, 1, 50), processRow(20, 1, 60)]);
  await terminateTree({ pid: 10 }, tree, io);
  assert.deepEqual(io.killed, []);
  let samples = 0;
  const changed = cleanupIO(() =>
    ++samples === 1 ? [root] : [processRow(10, 1, 50)],
  );
  await terminateTree({ pid: 10 }, new ProcessTree([root], 10), changed);
  assert.deepEqual(changed.killed, []);
});
test("same-identity live children and observed orphans remain cleanup failures", async () => {
  const root = processRow(10, 1);
  const child = processRow(20, 10);
  for (const current of [[root, child], [child]]) {
    const tree = new ProcessTree([root, child], 10, "synthetic-arm");
    const io = cleanupIO(() => current);
    await assert.rejects(
      terminateTree({ pid: 10 }, tree, io),
      /process-cleanup/u,
    );
    assert.deepEqual(io.killed, current.includes(root) ? [10] : []);
  }
  const exited = cleanupIO(() => [root]);
  await assert.rejects(
    terminateTree(
      { pid: 10, exitCode: 0 },
      new ProcessTree([root], 10),
      exited,
    ),
    /process-cleanup/u,
  );
  assert.deepEqual(exited.killed, []);
});
test("child ownership retains cleanup after work failure and rejects rapid exit before work", async () => {
  const root = processRow(10, process.pid);
  const child = { pid: 10, spawnfile: root.ExecutablePath, exitCode: null };
  let running = true;
  const io = cleanupIO(() => (running ? [root] : []));
  io.kill = (pid) => {
    io.killed.push(pid);
    running = false;
    return {};
  };
  const cleanup = (value, tree) => terminateTree(value, tree, io);
  const error = new Error("synthetic-work-failure");
  const work = async () => {
    throw error;
  };
  await assert.rejects(
    withChild(child, work, cleanup, io.snapshot),
    (actual) => actual === error,
  );
  assert.deepEqual(io.killed, [10]);
  const cases = [
    [child, []],
    [{ ...child, exitCode: 0 }, [root]],
    [{ ...child }, [processRow(10, process.pid, 50)]],
    [{ ...child }, [processRow(10, 1)], false],
    [{ ...child, spawnfile: "C:\\other.exe" }, [root], false],
  ];
  for (const [value, snapshot, exit = true] of cases) {
    const gone = cleanupIO(() => {
      if (exit) value.exitCode = 0;
      return snapshot;
    });
    const work = () => assert.fail("exited root must not begin work");
    const clean = (item, tree) => terminateTree(item, tree, gone);
    await assert.rejects(
      withChild(value, work, clean, gone.snapshot),
      /process-identity/u,
    );
    assert.deepEqual(gone.killed, []);
  }
});
test("PCM requires finite bounded samples and exact request/session/generation/segment identities", () => {
  const payload = Buffer.alloc(16);
  assertAudio(metadata(), payload, identity);
  for (const key of ["requestId", "sessionId", "generationId", "segmentId"]) {
    assert.throws(
      () => assertAudio(metadata(), payload, { ...identity, [key]: "stale" }),
      /audio-identity-bound/u,
    );
  }
  const oversized = metadata();
  oversized.frame.sampleCountSamples = 480_001;
  assert.throws(
    () => assertAudio(oversized, payload, identity),
    /audio-identity-bound/u,
  );
  const nonFinite = Buffer.from(payload);
  nonFinite.writeFloatLE(Number.NaN, 0);
  assert.throws(
    () => assertAudio(metadata(), nonFinite, identity),
    /audio-finite/u,
  );
  const sequence = metadata();
  sequence.frame.sequence = 1;
  assert.throws(
    () => assertAudio(sequence, payload, identity),
    /audio-identity-bound/u,
  );
});
