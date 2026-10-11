import console from "node:console";
import { Buffer } from "node:buffer";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { StringDecoder } from "node:string_decoder";
import { clearTimeout, setTimeout } from "node:timers";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  BILINGUAL_PORTFOLIO_ARMS,
  modelFreeLifecycleEnvironment,
  nativeRunnerArguments,
  selectPortfolioArms,
} from "./bilingual-portfolio-host.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const evidenceRoot = path.join(
  repositoryRoot,
  "tmp/evidence/tts-adapter-layout",
);
const MAX_CONTROL_BYTES = 16_384;
const MAX_AUDIO_BYTES = 1_920_000;
const LOAD_TIMEOUT_MS = 180_000;
const GENERATION_TIMEOUT_MS = 90_000;
const CLEANUP_TIMEOUT_MS = 15_000;
const ARM_TIMEOUT_MS = 30 * 60 * 1_000;
const SERVICE_PREFIX = "runtime/Lib/site-packages/voxleaf_tts/";
const COMMON_MODULES = [
  "__init__.py",
  "engine.py",
  "protocol.py",
  "service.py",
  "adapters/__init__.py",
  "adapters/fake.py",
  "generated/__init__.py",
  "generated/protocol_schemas.py",
];
const PIPER_MODULES = [
  ...COMMON_MODULES,
  "adapters/piper.py",
  "piper_service.py",
];
const CHATTERBOX_MODULES = [
  ...COMMON_MODULES,
  "adapters/chatterbox.py",
  "chatterbox_service.py",
];

function fail(code) {
  throw new Error(`tts-adapter-layout-host:${code}`);
}
function contained(root, target) {
  const relative = path.relative(root, target);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}
function absoluteContained(value, root) {
  if (
    !value ||
    !path.isAbsolute(value) ||
    !contained(root, path.resolve(value))
  )
    fail("path");
  return path.resolve(value);
}
export function parseArguments(args, environment = process.env) {
  const allowed = new Set([
    "mode",
    "piper-root",
    "chatterbox-root",
    "chatterbox-model-root",
    "executable",
    "receipt",
  ]);
  const values = {};
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const match = /^--([^=]+)(?:=(.*))?$/u.exec(argument);
    if (!match || !allowed.has(match[1]) || values[match[1]] !== undefined)
      fail("arguments");
    const value = match[2] ?? args[++index];
    if (!value || value.startsWith("--")) fail("arguments");
    values[match[1]] = value;
  }
  const mode = values.mode ?? "preflight";
  if (!["preflight", "candidate", "desktop"].includes(mode)) fail("mode");
  if (!environment.LOCALAPPDATA || !path.isAbsolute(environment.LOCALAPPDATA))
    fail("local-app-data");
  const installedRoot = path.join(
    environment.LOCALAPPDATA,
    "com.voxleaf.desktop/tts/cb/3",
  );
  return Object.freeze({
    mode,
    installedRoot,
    piperRoot: absoluteContained(
      values["piper-root"] ??
        path.join(
          repositoryRoot,
          "services/tts/release/core/dist/voxleaf-piper-core-v1",
        ),
      repositoryRoot,
    ),
    chatterboxRoot: absoluteContained(
      values["chatterbox-root"] ??
        path.join(
          repositoryRoot,
          "services/tts/release/optional/chatterbox/dist/v4/voxleaf-chatterbox-v4",
        ),
      repositoryRoot,
    ),
    chatterboxModelRoot: absoluteContained(
      values["chatterbox-model-root"] ?? path.join(installedRoot, "models"),
      path.join(installedRoot, "models"),
    ),
    executable: absoluteContained(
      values.executable ??
        path.join(
          repositoryRoot,
          "apps/desktop/src-tauri/target/release/voxleaf-desktop.exe",
        ),
      repositoryRoot,
    ),
    receipt: absoluteContained(
      values.receipt ?? path.join(evidenceRoot, `candidate/${mode}.json`),
      evidenceRoot,
    ),
  });
}

export async function hashFile(filename) {
  const digest = createHash("sha256");
  for await (const block of createReadStream(filename)) digest.update(block);
  return digest.digest("hex");
}
async function readJson(filename) {
  return JSON.parse(await readFile(filename, "utf8"));
}
async function fileIdentity(filename) {
  const info = await lstat(filename);
  if (!info.isFile() || info.isSymbolicLink()) fail("artifact-file");
  return { sizeBytes: info.size, sha256: await hashFile(filename) };
}
function samePath(left, right) {
  return (
    path.win32.normalize(left).toLowerCase() ===
    path.win32.normalize(right).toLowerCase()
  );
}
export function verifyRootBinding(
  root,
  canonical,
  symbolicLink,
  environment = process.env,
) {
  const virtualized =
    typeof environment.LOCALAPPDATA === "string" &&
    path.win32.isAbsolute(environment.LOCALAPPDATA) &&
    samePath(
      root,
      path.win32.join(environment.LOCALAPPDATA, "com.voxleaf.desktop/tts/cb/3"),
    ) &&
    samePath(
      canonical,
      path.win32.join(
        environment.LOCALAPPDATA,
        "Packages/OpenAI.Codex_2p2nqsd0c76g0/LocalCache/Local/com.voxleaf.desktop/tts/cb/3",
      ),
    );
  if (symbolicLink || (!samePath(root, canonical) && !virtualized))
    fail("artifact-link");
  return canonical;
}
async function collectFiles(root, relative = "", canonical = root) {
  const result = [];
  for (const name of await readdir(path.join(root, relative))) {
    const filename = path.join(root, relative, name);
    const info = await lstat(filename);
    const actual = await realpath(filename);
    if (
      info.isSymbolicLink() ||
      !contained(canonical, actual) ||
      !samePath(actual, path.join(canonical, relative, name))
    )
      fail("artifact-link");
    const child = path.posix.join(relative.replaceAll(path.sep, "/"), name);
    if (info.isDirectory())
      result.push(...(await collectFiles(root, child, canonical)));
    else if (info.isFile()) result.push(child);
    else fail("artifact-file");
  }
  return result.sort();
}
function safeRelative(value) {
  if (
    typeof value !== "string" ||
    !value ||
    value.includes("\\") ||
    value.includes(":") ||
    value.startsWith("/") ||
    value.split("/").some((part) => !part || part === "." || part === "..")
  )
    fail("artifact-path");
  return value;
}
export async function verifyTree(
  root,
  manifest,
  manifestName,
  extraRecords = [],
) {
  const canonical = verifyRootBinding(
    root,
    await realpath(root),
    (await lstat(root)).isSymbolicLink(),
  );
  verifyRootBinding(
    canonical,
    await realpath(canonical),
    (await lstat(canonical)).isSymbolicLink(),
  );
  if (!Array.isArray(manifest.files) || !manifest.files.length)
    fail("manifest");
  const records = [...manifest.files, ...extraRecords];
  const expected = new Map();
  for (const record of records) {
    const relative = safeRelative(record.path);
    if (
      expected.has(relative) ||
      relative === manifestName ||
      !Number.isSafeInteger(record.sizeBytes) ||
      record.sizeBytes < 0 ||
      !/^[a-f0-9]{64}$/u.test(record.sha256)
    )
      fail("manifest");
    expected.set(relative, record);
  }
  const actual = (await collectFiles(root, "", canonical)).filter(
    (relative) => relative !== manifestName,
  );
  if (
    actual.length !== expected.size ||
    actual.some((relative) => !expected.has(relative))
  )
    fail("tree-closure");
  let bytes = 0;
  for (const [relative, expectedIdentity] of expected) {
    const identity = await fileIdentity(path.join(root, relative));
    if (
      identity.sha256 !== expectedIdentity.sha256 ||
      identity.sizeBytes !== expectedIdentity.sizeBytes
    )
      fail("tree-identity");
    bytes += identity.sizeBytes;
  }
  return {
    root,
    canonicalRoot: canonical,
    fileCount: records.length,
    bytes,
    manifestSha256: await hashFile(path.join(root, manifestName)),
  };
}
export function verifyModuleClosure(manifest, expected) {
  const actual = manifest.files
    .filter((record) => record.path.startsWith(SERVICE_PREFIX))
    .map((record) => record.path.slice(SERVICE_PREFIX.length))
    .sort();
  if (JSON.stringify(actual) !== JSON.stringify([...expected].sort()))
    fail("module-closure");
}
function powershell(script) {
  const result = spawnSync(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-Command", script],
    {
      encoding: "utf8",
      windowsHide: true,
      timeout: CLEANUP_TIMEOUT_MS,
      env: childEnvironment(
        process.env,
        path.join(evidenceRoot, "candidate/cache"),
      ),
    },
  );
  if (result.error || result.status !== 0) fail("host-observation");
  return result.stdout.trim();
}
function encoded(value) {
  return Buffer.from(value, "utf16le").toString("base64");
}
function psString(value) {
  return `[Text.Encoding]::Unicode.GetString([Convert]::FromBase64String('${encoded(value)}'))`;
}
function assertFirewall(executable) {
  const script =
    `$target=${psString(executable)};` +
    "$profiles=@(Get-NetFirewallProfile);if ($profiles.Count -ne 3 -or @($profiles | Where-Object {-not $_.Enabled}).Count) {exit 1};" +
    "if ((Get-Service MpsSvc).Status -ne 'Running') {exit 1};" +
    "$rules=@(Get-NetFirewallRule -DisplayName 'VoxLeaf TTS Benchmark Offline' -ErrorAction SilentlyContinue | " +
    "Where-Object {$_.Enabled -eq 'True' -and $_.Direction -eq 'Outbound' -and $_.Action -eq 'Block' -and $_.Profile -eq 'Any'} | " +
    "Get-NetFirewallApplicationFilter | Where-Object {[IO.Path]::GetFullPath($_.Program).Equals($target,[StringComparison]::OrdinalIgnoreCase)});" +
    "if ($rules.Count -lt 1) {exit 1};[Console]::Out.Write('blocked')";
  if (powershell(script) !== "blocked") fail("firewall");
}
function processes() {
  const output = powershell(
    "$items=@(Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,ExecutablePath,CommandLine);ConvertTo-Json -Compress -Depth 3 -InputObject $items",
  );
  return JSON.parse(output);
}
function descendantIds(snapshot, rootId) {
  const result = new Set([rootId]);
  let changed;
  do {
    changed = false;
    for (const item of snapshot)
      if (result.has(item.ParentProcessId) && !result.has(item.ProcessId)) {
        result.add(item.ProcessId);
        changed = true;
      }
  } while (changed);
  return result;
}
function assertNoNetwork(ids) {
  const output = powershell(
    `$ids=@(${[...ids].join(",")});` +
      "$tcp=@(Get-NetTCPConnection -ErrorAction SilentlyContinue | Where-Object {$ids -contains $_.OwningProcess -and " +
      "($_.State -eq 'Listen' -or $_.RemoteAddress -notin @('0.0.0.0','::','127.0.0.1','::1'))});" +
      "$udp=@(Get-NetUDPEndpoint -ErrorAction SilentlyContinue | Where-Object {$ids -contains $_.OwningProcess});" +
      "[Console]::Out.Write(($tcp.Count+$udp.Count))",
  );
  if (output !== "0") fail("network-observation");
}
export function childEnvironment(environment, cacheRoot) {
  const sanitized = modelFreeLifecycleEnvironment(environment);
  for (const key of [
    "PYTHONPATH",
    "PYTHONHOME",
    "PYTHONUSERBASE",
    "VIRTUAL_ENV",
    "CONDA_PREFIX",
    "CONDA_DEFAULT_ENV",
    "VOXLEAF_CHATTERBOX_VALIDATION_PACKAGE_ROOT",
  ])
    delete sanitized[key];
  if (process.platform === "win32")
    sanitized.PSModulePath = path.join(
      environment.SystemRoot ?? "C:\\Windows",
      "System32/WindowsPowerShell/v1.0/Modules",
    );
  return {
    ...sanitized,
    HF_HUB_OFFLINE: "1",
    TRANSFORMERS_OFFLINE: "1",
    HF_HUB_DISABLE_TELEMETRY: "1",
    PYTHONNOUSERSITE: "1",
    PYTHONDONTWRITEBYTECODE: "1",
    PYTHONUTF8: "1",
    NUMBA_CACHE_DIR: cacheRoot,
  };
}

async function isolatedImports(root, service, adapter, cacheRoot) {
  const script = [
    "import importlib,json,sys;from pathlib import Path",
    `root=Path(${JSON.stringify(root)}).resolve()`,
    `importlib.import_module('voxleaf_tts.${service}')`,
    "modules={name:str(Path(module.__file__).resolve()) for name,module in sys.modules.items() if name.startswith('voxleaf_tts') and getattr(module,'__file__',None)}",
    "assert all(Path(location).is_relative_to(root) for location in modules.values())",
    "assert Path(sys.executable).resolve()==root/'runtime/python.exe'",
    `assert 'voxleaf_tts.adapters.${adapter}' in modules`,
    `assert not any('voxleaf_tts.adapters.'+name in modules for name in ('piper','chatterbox','qwen') if name!=${JSON.stringify(adapter)})`,
    "assert not any(name.split('.')[0] in {'piper','chatterbox','qwen_tts','torch','numpy'} for name in sys.modules)",
    "print(json.dumps({'executable':sys.executable,'modules':modules,'isolated':sys.flags.isolated,'userSiteDisabled':sys.flags.no_user_site}))",
  ].join(";");
  const result = spawnSync(
    path.join(root, "runtime/python.exe"),
    ["-I", "-B", "-c", script],
    {
      cwd: root,
      env: childEnvironment(process.env, cacheRoot),
      encoding: "utf8",
      timeout: LOAD_TIMEOUT_MS,
      windowsHide: true,
    },
  );
  if (result.error || result.status !== 0) fail("isolated-import");
  const report = JSON.parse(result.stdout);
  if (report.isolated !== 1 || report.userSiteDisabled !== 1)
    fail("isolated-import");
  return report;
}

async function preflight(options) {
  if (process.platform !== "win32") fail("windows-host-required");
  const installed = options.installedRoot;
  if (
    (await realpath(options.chatterboxModelRoot)).toLowerCase() !==
    (await realpath(path.join(installed, "models"))).toLowerCase()
  )
    fail("model-root-binding");
  const v3Authority = await readJson(
    path.join(
      repositoryRoot,
      "services/tts/release/optional/chatterbox/optional-package-manifest-v3.json",
    ),
  );
  const v3Manifest = await readJson(
    path.join(installed, "runtime-manifest-v3.json"),
  );
  if (
    (await hashFile(path.join(installed, "runtime-manifest-v3.json"))) !==
    v3Authority.runtimeArtifact.runtimeManifestSha256
  )
    fail("installed-v3-identity");
  const modelRecords = v3Authority.modelArtifacts.map((item) => ({
    path: `models/${item.filename}`,
    sizeBytes: item.downloadBytes,
    sha256: item.sha256,
  }));
  if (modelRecords.length !== 6) fail("model-closure");
  const installedIdentity = await verifyTree(
    installed,
    v3Manifest,
    "runtime-manifest-v3.json",
    modelRecords,
  );
  const logical = path.join(installed, "runtime/python.exe");
  const canonical = path.join(
    installedIdentity.canonicalRoot,
    "runtime/python.exe",
  );
  if (
    !samePath(await realpath(logical), canonical) ||
    !samePath(await realpath(canonical), canonical)
  )
    fail("installed-interpreter-binding");
  const logicalIdentity = await fileIdentity(logical);
  const canonicalIdentity = await fileIdentity(canonical);
  if (JSON.stringify(logicalIdentity) !== JSON.stringify(canonicalIdentity))
    fail("installed-interpreter-binding");
  installedIdentity.interpreter = {
    logical,
    canonical,
    logicalIdentity,
    canonicalIdentity,
  };
  assertFirewall(canonical);
  const piperManifest = await readJson(
    path.join(options.piperRoot, "runtime-manifest-v1.json"),
  );
  if (
    (await hashFile(
      path.join(options.piperRoot, "runtime-manifest-v1.json"),
    )) !==
    (await hashFile(
      path.join(
        repositoryRoot,
        "services/tts/release/core/runtime-manifest-v1.json",
      ),
    ))
  )
    fail("piper-authority");
  verifyModuleClosure(piperManifest, PIPER_MODULES);
  const piper = await verifyTree(
    options.piperRoot,
    piperManifest,
    "runtime-manifest-v1.json",
  );
  const chatterboxManifest = await readJson(
    path.join(options.chatterboxRoot, "runtime-manifest-v4.json"),
  );
  if (
    chatterboxManifest.packageVersion !== "4" ||
    chatterboxManifest.packageId !== "voxleaf-chatterbox-v4"
  )
    fail("candidate-identity");
  verifyModuleClosure(chatterboxManifest, CHATTERBOX_MODULES);
  const chatterbox = await verifyTree(
    options.chatterboxRoot,
    chatterboxManifest,
    "runtime-manifest-v4.json",
  );
  const localReceipt = await readJson(
    path.join(
      path.dirname(options.chatterboxRoot),
      "local-build-evidence-v4.json",
    ),
  );
  if (
    localReceipt.distribution?.published !== false ||
    localReceipt.distribution?.admitted !== false ||
    localReceipt.measurements?.runtimeManifestSha256 !==
      chatterbox.manifestSha256 ||
    localReceipt.authority?.sourceManifestSha256 !==
      (await hashFile(
        path.join(options.chatterboxRoot, "source-manifest-v4.json"),
      ))
  )
    fail("candidate-receipt");
  if (
    !Array.isArray(localReceipt.sources) ||
    localReceipt.sources.length !== CHATTERBOX_MODULES.length
  )
    fail("candidate-source-binding");
  const sourceNames = new Set();
  for (const record of localReceipt.sources) {
    const module = safeRelative(record.path);
    if (!CHATTERBOX_MODULES.includes(module) || sourceNames.has(module))
      fail("candidate-source-binding");
    sourceNames.add(module);
    for (const filename of [
      path.join(options.chatterboxRoot, SERVICE_PREFIX, module),
      path.join(repositoryRoot, "services/tts/src/voxleaf_tts", module),
    ]) {
      const identity = await fileIdentity(filename);
      if (
        identity.sha256 !== record.sha256 ||
        identity.sizeBytes !== record.sizeBytes
      )
        fail("candidate-source-binding");
    }
  }
  if (
    localReceipt.authority.sourceManifestSha256 !==
    (await hashFile(
      path.join(
        repositoryRoot,
        "services/tts/release/optional/chatterbox/source-manifest-v4.json",
      ),
    ))
  )
    fail("candidate-source-binding");
  for (const root of [options.piperRoot, options.chatterboxRoot, installed])
    assertFirewall(path.join(root, "runtime/python.exe"));
  const cacheRoot = path.join(evidenceRoot, "candidate/cache");
  await mkdir(cacheRoot, { recursive: true });
  const imports = [
    await isolatedImports(
      options.piperRoot,
      "piper_service",
      "piper",
      cacheRoot,
    ),
    await isolatedImports(
      options.chatterboxRoot,
      "chatterbox_service",
      "chatterbox",
      cacheRoot,
    ),
  ];
  return {
    piper,
    chatterbox,
    installedV3: installedIdentity,
    models: modelRecords,
    imports,
    firewall: "exact-program-outbound-block-active",
    options,
  };
}

export function encodeControl(message) {
  const payload = Buffer.from(JSON.stringify(message));
  if (payload.length < 1 || payload.length > MAX_CONTROL_BYTES)
    fail("control-bound");
  const header = Buffer.alloc(12);
  header.write("VLTP");
  header.writeUInt16BE(1, 4);
  header[6] = 1;
  header.writeUInt32BE(payload.length, 8);
  return Buffer.concat([header, payload]);
}
export class FrameReader {
  constructor(stream) {
    this.buffer = Buffer.alloc(0);
    this.records = [];
    this.queuedBytes = 0;
    this.waiter = undefined;
    this.error = undefined;
    stream.on("data", (block) => {
      try {
        this.add(block);
      } catch (error) {
        this.reject(error);
      }
    });
    stream.on("end", () =>
      this.reject(new Error("tts-adapter-layout-host:unexpected-eof")),
    );
    stream.on("error", (error) => this.reject(error));
  }
  reject(error) {
    this.error = error;
    this.waiter?.reject(error);
    this.waiter = undefined;
  }
  add(block) {
    if (this.error) return;
    if (
      this.buffer.length + block.length >
      MAX_AUDIO_BYTES + MAX_CONTROL_BYTES * 64 + 12 * 64
    )
      fail("frame-buffer-bound");
    this.buffer = Buffer.concat([this.buffer, block]);
    while (this.buffer.length >= 12) {
      const header = this.buffer.subarray(0, 12);
      const kind = header[6];
      const size = header.readUInt32BE(8);
      if (
        header.toString("ascii", 0, 4) !== "VLTP" ||
        header.readUInt16BE(4) !== 1 ||
        header[7] !== 0 ||
        ![1, 2].includes(kind) ||
        size < (kind === 1 ? 1 : 4) ||
        size > (kind === 1 ? MAX_CONTROL_BYTES : MAX_AUDIO_BYTES)
      )
        fail("frame-header");
      if (this.buffer.length < 12 + size) return;
      const payload = Buffer.from(this.buffer.subarray(12, 12 + size));
      this.buffer = this.buffer.subarray(12 + size);
      const record = { kind, payload };
      if (this.waiter) {
        const waiter = this.waiter;
        this.waiter = undefined;
        waiter.resolve(record);
      } else {
        if (
          this.records.length >= 64 ||
          this.queuedBytes + payload.length >
            MAX_AUDIO_BYTES + MAX_CONTROL_BYTES * 64
        )
          fail("frame-queue-bound");
        this.records.push(record);
        this.queuedBytes += payload.length;
      }
    }
  }
  async next(timeout = GENERATION_TIMEOUT_MS) {
    if (this.records.length) {
      const record = this.records.shift();
      this.queuedBytes -= record.payload.length;
      return record;
    }
    if (this.error) throw this.error;
    if (this.waiter) fail("concurrent-reader");
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.waiter = undefined;
        reject(new Error("tts-adapter-layout-host:frame-timeout"));
      }, timeout);
      this.waiter = {
        resolve: (record) => {
          clearTimeout(timer);
          resolve(record);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      };
    });
  }
}
function control(record, instance) {
  if (record.kind !== 1) fail("unexpected-audio");
  const value = JSON.parse(record.payload.toString("utf8"));
  if (
    value.schemaVersion !== 1 ||
    value.protocolVersion !== 1 ||
    (value.kind !== "protocolRejected" && value.serviceInstanceId !== instance)
  )
    fail("control-identity");
  return value;
}
export function assertAudio(metadata, payload, identity) {
  const frame = metadata.frame;
  if (
    metadata.kind !== "audioMetadata" ||
    metadata.sampleFormat !== "float32-le" ||
    metadata.requestId !== identity.requestId ||
    frame?.frameId !== identity.requestId ||
    frame.sessionId !== identity.sessionId ||
    frame.generationId !== identity.generationId ||
    frame.segmentId !== identity.segmentId ||
    frame.schemaVersion !== 1 ||
    frame.sequence !== 0 ||
    frame.sampleRateHz !== 24_000 ||
    frame.channelCount !== 1 ||
    frame.endOfSegment !== true ||
    !Number.isSafeInteger(frame.sampleCountSamples) ||
    frame.sampleCountSamples <= 0 ||
    frame.sampleCountSamples > 480_000 ||
    payload.length !== frame.sampleCountSamples * 4 ||
    metadata.payloadBytes !== payload.length ||
    payload.length > MAX_AUDIO_BYTES
  )
    fail("audio-identity-bound");
  for (let offset = 0; offset < payload.length; offset += 4)
    if (!Number.isFinite(payload.readFloatLE(offset))) fail("audio-finite");
}

export async function terminateTree(child) {
  if (!child.pid) return;
  const before = processes();
  const ids = descendantIds(before, child.pid);
  if (before.some((item) => item.ProcessId === child.pid)) {
    const killed = spawnSync(
      "taskkill.exe",
      ["/PID", String(child.pid), "/T", "/F"],
      { windowsHide: true, timeout: CLEANUP_TIMEOUT_MS },
    );
    if (killed.error) fail("termination");
  }
  const deadline = Date.now() + CLEANUP_TIMEOUT_MS;
  do {
    if (!processes().some((item) => ids.has(item.ProcessId))) return;
    await delay(250);
  } while (Date.now() < deadline);
  fail("process-cleanup");
}
export async function withChild(child, work, cleanup = terminateTree) {
  try {
    return await work(child);
  } finally {
    await cleanup(child);
  }
}

const AUDIT_PREFIX = "VOXLEAF_LAYOUT_AUDIT:";
const AUDIT_KEYS = [
  "writes",
  "networkDenied",
  "processDenied",
  "optionalProbeDenied",
  "optionalIpv6ProbeDenied",
  "audioWritesDenied",
  "payloadWritesDenied",
];
// Shared by production bootstrap and real-interpreter tests; no command can execute.
export function pythonAuditPolicy(
  root,
  modelRoot,
  probe = null,
  ipv6Probe = null,
) {
  return `import atexit,hashlib,json,os,socket,sys
from pathlib import Path
root=Path(${JSON.stringify(root)}).resolve()
model_root=Path(${JSON.stringify(modelRoot)}).resolve()
probe=json.loads(${JSON.stringify(JSON.stringify(probe))})
probe_path=Path(probe['path']).resolve() if probe else None
probe_verified=bool(probe and hashlib.sha256(probe_path.read_bytes()).hexdigest()==probe['sha256'])
ipv6_probe=json.loads(${JSON.stringify(JSON.stringify(ipv6Probe))})
ipv6_path=Path(ipv6_probe['path']).resolve() if ipv6_probe else None
ipv6_verified=bool(ipv6_probe and hashlib.sha256(ipv6_path.read_bytes()).hexdigest()==ipv6_probe['sha256'])
counts=dict.fromkeys(${JSON.stringify(AUDIT_KEYS)},0)
def snapshot(phase):
 sys.stderr.write('\\n${AUDIT_PREFIX}'+json.dumps({'phase':phase,'counts':counts})+'\\n');sys.stderr.flush()
def optional_probe(event,args):
 if not probe_verified or event!='subprocess.Popen' or len(args)!=4:return False
 executable,argv,cwd,env=args
 exact_argv=argv=='lscpu' if isinstance(argv,str) else isinstance(argv,(list,tuple)) and len(argv)==1 and argv[0]=='lscpu'
 expected_executable=None if os.name=='nt' else 'lscpu'
 if executable!=expected_executable or not exact_argv or cwd is not None or env is not None:return False
 default_context=False
 frame=sys._getframe(1)
 for _ in range(16):
  if frame is None:return False
  if frame.f_code.co_name=='__init__' and frame.f_globals.get('__name__')=='subprocess':
   default_context=frame.f_locals.get('executable') is None and frame.f_locals.get('shell') is False
  if frame.f_code.co_name=='check_support_sve' and frame.f_globals.get('__name__')=='numpy.testing._private.utils':
   return default_context and Path(frame.f_code.co_filename).resolve()==probe_path and Path(frame.f_globals.get('__file__','')).resolve()==probe_path
  frame=frame.f_back
 return False
def optional_ipv6_probe(event,args):
 if not ipv6_verified or event!='socket.bind' or len(args)!=2:return False
 candidate,address=args
 if not isinstance(candidate,socket.socket) or candidate.family!=socket.AF_INET6 or candidate.type!=socket.SOCK_STREAM or candidate.proto!=0:return False
 if type(address) is not tuple or len(address)!=2 or type(address[0]) is not str or type(address[1]) is not int or address!=('::1',0):return False
 caller=sys._getframe(2)
 return caller.f_code.co_name=='_has_ipv6' and caller.f_globals.get('__name__')=='urllib3.util.connection' and Path(caller.f_code.co_filename).resolve()==ipv6_path and Path(caller.f_globals.get('__file__','')).resolve()==ipv6_path
def deny(key):
 counts[key]+=1;snapshot('denial');raise PermissionError('layout-policy-denied')
def audit(event,args):
 if event in ('subprocess.Popen','os.system'):
  deny('optionalProbeDenied' if optional_probe(event,args) else 'processDenied')
 if event in ('socket.connect','socket.bind','socket.getaddrinfo'):
  deny('optionalIpv6ProbeDenied' if optional_ipv6_probe(event,args) else 'networkDenied')
 if event=='open' and isinstance(args[0],(str,bytes,os.PathLike)):
  mode,flags=args[1:3]
  writing=(isinstance(mode,str) and any(c in mode for c in 'wax+')) or (isinstance(flags,int) and flags & (os.O_WRONLY|os.O_RDWR|os.O_CREAT|os.O_TRUNC))
  if writing:
   target=Path(os.fsdecode(args[0])).resolve();counts['writes']+=1
   if target.suffix.lower() in ('.wav','.mp3','.ogg','.flac','.pcm','.m4a'):deny('audioWritesDenied')
   if target.is_relative_to(root) or target.is_relative_to(model_root):deny('payloadWritesDenied')
sys.addaudithook(audit)
atexit.register(lambda:snapshot('exit'))
snapshot('activation')
`;
}
export class AuditReader {
  constructor(stream, probeBudget, ipv6Budget = 0) {
    if (![0, 1].includes(probeBudget) || ![0, 1].includes(ipv6Budget))
      fail("audit-budget");
    this.probeBudget = probeBudget;
    this.ipv6Budget = ipv6Budget;
    this.pending = "";
    this.discard = false;
    this.records = 0;
    this.final = false;
    this.decoder = new StringDecoder("utf8");
    stream.on("data", (block) => this.add(this.decoder.write(block)));
    stream.on("end", () => this.add(this.decoder.end()));
  }
  add(text) {
    try {
      for (const character of text) {
        if (character === "\n") {
          if (!this.discard && this.pending.startsWith(AUDIT_PREFIX))
            this.record(this.pending.slice(AUDIT_PREFIX.length));
          this.pending = "";
          this.discard = false;
        } else if (!this.discard) {
          this.pending += character;
          if (this.pending.length > 512) {
            if (this.pending.startsWith(AUDIT_PREFIX))
              fail("audit-record-bound");
            this.pending = "";
            this.discard = true;
          }
        }
      }
    } catch (error) {
      this.error ??= error;
    }
  }
  record(text) {
    const value = JSON.parse(text);
    const counts = value?.counts;
    if (
      !value ||
      Object.keys(value).sort().join() !== "counts,phase" ||
      !counts ||
      Object.keys(counts).sort().join() !== [...AUDIT_KEYS].sort().join() ||
      AUDIT_KEYS.some(
        (key) =>
          !Number.isSafeInteger(counts[key]) ||
          counts[key] < 0 ||
          counts[key] > 4096,
      ) ||
      this.final ||
      ++this.records > 32
    )
      fail("audit-schema");
    if (!this.last) {
      if (
        value.phase !== "activation" ||
        AUDIT_KEYS.some((key) => counts[key] !== 0)
      )
        fail("audit-activation");
    } else {
      if (
        !["denial", "exit"].includes(value.phase) ||
        AUDIT_KEYS.some((key) => counts[key] < this.last[key])
      )
        fail("audit-sequence");
      const denials = AUDIT_KEYS.slice(1).reduce(
        (sum, key) => sum + counts[key] - this.last[key],
        0,
      );
      if (denials !== (value.phase === "denial" ? 1 : 0))
        fail("audit-sequence");
    }
    this.last = counts;
    this.final = value.phase === "exit";
  }
  admit(cleanShutdown) {
    if (this.error) throw this.error;
    if (
      !this.last ||
      (!this.discard && this.pending.startsWith(AUDIT_PREFIX)) ||
      (cleanShutdown && !this.final)
    )
      fail("audit-unavailable");
    if (
      this.last.optionalProbeDenied !== this.probeBudget ||
      this.last.optionalIpv6ProbeDenied !== this.ipv6Budget ||
      [
        "networkDenied",
        "processDenied",
        "audioWritesDenied",
        "payloadWritesDenied",
      ].some((key) => this.last[key] !== 0)
    )
      fail("filesystem-network-audit");
    return { ...this.last, orderlyExit: this.final };
  }
}
function bootstrap(root, modelRoot, service, probe, ipv6Probe) {
  return (
    `import importlib.util,runpy,sys\nfrom pathlib import Path\n` +
    `assert Path(sys.executable).resolve()==Path(${JSON.stringify(root)}).resolve()/'runtime/python.exe'\n` +
    `assert Path(importlib.util.find_spec('voxleaf_tts.${service}').origin).resolve().is_relative_to(Path(${JSON.stringify(root)}).resolve())\n` +
    pythonAuditPolicy(root, modelRoot, probe, ipv6Probe) +
    `runpy.run_module('voxleaf_tts.${service}',run_name='__main__')\n`
  );
}
async function startService(
  root,
  modelRoot,
  service,
  language,
  cacheRoot,
  work,
) {
  const python = path.join(root, "runtime/python.exe");
  let probe = null;
  let ipv6Probe = null;
  if (service === "chatterbox_service") {
    const manifest = await readJson(
      path.join(root, "runtime-manifest-v4.json"),
    );
    const relative =
      "runtime/Lib/site-packages/numpy/testing/_private/utils.py";
    const record = manifest.files.find((item) => item.path === relative);
    if (
      !record ||
      (await hashFile(path.join(root, relative))) !== record.sha256
    )
      fail("probe-provenance");
    probe = { path: path.join(root, relative), sha256: record.sha256 };
    const ipv6Relative = "runtime/Lib/site-packages/urllib3/util/connection.py";
    const ipv6Record = manifest.files.find(
      (item) => item.path === ipv6Relative,
    );
    if (
      !ipv6Record ||
      (await hashFile(path.join(root, ipv6Relative))) !== ipv6Record.sha256
    )
      fail("ipv6-probe-provenance");
    ipv6Probe = {
      path: path.join(root, ipv6Relative),
      sha256: ipv6Record.sha256,
    };
  }
  const env = childEnvironment(process.env, cacheRoot);
  if (service === "piper_service")
    env.VOXLEAF_TTS_RUNTIME_PIPER_VOICE =
      language === "es" ? "davefx-es" : "joe-en";
  else env.VOXLEAF_TTS_RUNTIME_CHATTERBOX_LANGUAGE = language;
  const child = spawn(
    python,
    ["-I", "-B", "-c", bootstrap(root, modelRoot, service, probe, ipv6Probe)],
    { cwd: modelRoot, env, stdio: ["pipe", "pipe", "pipe"], windowsHide: true },
  );
  const audit = new AuditReader(child.stderr, probe ? 1 : 0, ipv6Probe ? 1 : 0);
  const reader = new FrameReader(child.stdout);
  const exit = new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code, signal) => resolve({ code, signal }));
  });
  return withChild(child, async () => {
    const result = await work({ child, reader, exit });
    await Promise.race([
      exit,
      delay(CLEANUP_TIMEOUT_MS).then(() => fail("audit-drain-timeout")),
    ]);
    result.audit = audit.admit(result.cleanShutdown === true);
    return result;
  });
}
async function receiveState(
  reader,
  instance,
  desired,
  timeout = LOAD_TIMEOUT_MS,
) {
  const deadline = Date.now() + timeout;
  for (let index = 0; index < 16; index += 1) {
    const value = control(
      await reader.next(Math.max(1, deadline - Date.now())),
      instance,
    );
    if (["error", "protocolRejected"].includes(value.kind))
      fail("service-lifecycle");
    if (value.kind === "state" && value.state === desired) return;
  }
  fail("state-bound");
}
async function prepareService(child, reader, instance) {
  const send = (kind) =>
    child.stdin.write(
      encodeControl({
        schemaVersion: 1,
        protocolVersion: 1,
        kind,
        serviceInstanceId: instance,
      }),
    );
  send("handshake");
  const handshake = [];
  for (let index = 0; index < 4; index += 1)
    handshake.push(control(await reader.next(LOAD_TIMEOUT_MS), instance));
  if (
    handshake.map((item) => item.kind).join(",") !==
      "state,handshakeAccepted,state,capabilities" ||
    handshake[0].state !== "handshaking" ||
    handshake[2].state !== "unloaded" ||
    handshake[3].cancellationContainment !==
      "identity-invalidation-then-worker-termination"
  )
    fail("handshake");
  send("load");
  await receiveState(reader, instance, "warming");
  send("warm");
  await receiveState(reader, instance, "ready");
  const capabilities = control(await reader.next(), instance);
  if (
    capabilities.kind !== "capabilities" ||
    capabilities.report?.capabilities?.localSpeechGeneration !== "supported"
  )
    fail("capabilities");
  return send;
}
async function synthesizeMessage(instance, language, suffix, long = false) {
  const fixture = await readJson(
    path.join(
      repositoryRoot,
      "packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json",
    ),
  );
  fixture.serviceInstanceId = instance;
  fixture.requestId = `request:layout-${suffix}`;
  fixture.segment.sessionId = `session:layout-${suffix}`;
  fixture.segment.generationId = `generation:layout-${suffix}`;
  fixture.segment.segmentId = `segment:layout-${suffix}`;
  const text =
    language === "es"
      ? "Esta es una prueba breve de narración local."
      : "This is a brief local narration test.";
  fixture.segment.text = long ? Array(10).fill(text).join(" ") : text;
  fixture.segment.sourceRange.end.textOffsetCodePoints = [
    ...fixture.segment.text,
  ].length;
  return fixture;
}
function workIdentity(message) {
  return {
    requestId: message.requestId,
    sessionId: message.segment.sessionId,
    generationId: message.segment.generationId,
    segmentId: message.segment.segmentId,
  };
}
export function assertWorkIdentity(observed, expected) {
  const keys = ["requestId", "sessionId", "generationId", "segmentId"];
  if (
    !observed ||
    Object.keys(observed).length !== keys.length ||
    keys.some(
      (key) => !Object.hasOwn(observed, key) || observed[key] !== expected[key],
    )
  )
    fail("completed-identity");
}
async function completeGeneration(reader, instance, identity) {
  const metadata = control(await reader.next(), instance);
  const audio = await reader.next();
  if (audio.kind !== 2) fail("missing-audio");
  assertAudio(metadata, audio.payload, identity);
  const completed = control(await reader.next(), instance);
  if (completed.kind !== "completed") fail("completed-identity");
  assertWorkIdentity(completed.workIdentity, identity);
  await receiveState(reader, instance, "ready", GENERATION_TIMEOUT_MS);
  return {
    payloadBytes: audio.payload.length,
    audioSeconds: audio.payload.length / 96_000,
  };
}
async function candidateArm(options, root, language, service) {
  const modelRoot =
    service === "piper_service"
      ? path.join(root, "voices", language)
      : options.chatterboxModelRoot;
  const cacheRoot = path.join(
    evidenceRoot,
    "candidate/cache",
    service,
    language,
  );
  await mkdir(cacheRoot, { recursive: true });
  const first = await startService(
    root,
    modelRoot,
    service,
    language,
    cacheRoot,
    async ({ child, reader }) => {
      const instance = `service:layout-${service}-${language}-1`;
      const started = Date.now();
      await prepareService(child, reader, instance);
      const prepareMs = Date.now() - started;
      assertNoNetwork(descendantIds(processes(), child.pid));
      const message = await synthesizeMessage(instance, language, "first");
      child.stdin.write(encodeControl(message));
      await receiveState(reader, instance, "generating", GENERATION_TIMEOUT_MS);
      const generationStart = Date.now();
      const generation = await completeGeneration(
        reader,
        instance,
        workIdentity(message),
      );
      const generationMs = Date.now() - generationStart;
      const cancel = await synthesizeMessage(
        instance,
        language,
        "cancel",
        true,
      );
      child.stdin.write(encodeControl(cancel));
      await receiveState(reader, instance, "generating", GENERATION_TIMEOUT_MS);
      child.stdin.write(
        encodeControl({
          schemaVersion: 1,
          protocolVersion: 1,
          kind: "cancel",
          serviceInstanceId: instance,
          workIdentity: workIdentity(cancel),
        }),
      );
      const cleanupStart = Date.now();
      await terminateTree(child);
      // Native cancellation invalidates ownership before terminating the blocked inference tree.
      // Pending records are deliberately discarded; no cancelled identity can reach a player.
      return {
        prepareMs,
        generationMs,
        ...generation,
        cancellationMs: Date.now() - cleanupStart,
        cancellation: "identity-invalidation-then-worker-termination",
        cancelledIdentity: workIdentity(cancel),
        discardedBufferedFrames: reader.records.length,
      };
    },
  );
  const restart = await startService(
    root,
    modelRoot,
    service,
    language,
    cacheRoot,
    async ({ child, reader, exit }) => {
      const instance = `service:layout-${service}-${language}-2`;
      const send = await prepareService(child, reader, instance);
      const message = await synthesizeMessage(instance, language, "restart");
      child.stdin.write(encodeControl(message));
      await receiveState(reader, instance, "generating", GENERATION_TIMEOUT_MS);
      const generation = await completeGeneration(
        reader,
        instance,
        workIdentity(message),
      );
      assertNoNetwork(descendantIds(processes(), child.pid));
      send("shutdown");
      await receiveState(reader, instance, "stopped", CLEANUP_TIMEOUT_MS);
      const exited = await Promise.race([
        exit,
        delay(CLEANUP_TIMEOUT_MS).then(() => fail("shutdown-timeout")),
      ]);
      if (exited.code !== 0 || exited.signal !== null) fail("shutdown");
      return { ...generation, cleanShutdown: true };
    },
  );
  return { service, language, root, first, restart };
}
async function malformedInput(root) {
  const child = spawn(
    path.join(root, "runtime/python.exe"),
    ["-I", "-B", "-m", "voxleaf_tts.service"],
    {
      cwd: root,
      env: childEnvironment(
        process.env,
        path.join(evidenceRoot, "candidate/cache"),
      ),
      windowsHide: true,
    },
  );
  const reader = new FrameReader(child.stdout);
  child.stderr.resume();
  const exit = new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => resolve(code));
  });
  return withChild(child, async () => {
    const header = Buffer.alloc(12);
    header.write("VLTP");
    header.writeUInt16BE(1, 4);
    header[6] = 1;
    header.writeUInt32BE(MAX_CONTROL_BYTES + 1, 8);
    child.stdin.end(header);
    const rejection = control(await reader.next(CLEANUP_TIMEOUT_MS));
    if (
      rejection.kind !== "protocolRejected" ||
      rejection.reason !== "over-limit"
    )
      fail("malformed-rejection");
    const code = await Promise.race([
      exit,
      delay(CLEANUP_TIMEOUT_MS).then(() => fail("malformed-timeout")),
    ]);
    if (code !== 1) fail("malformed-exit");
    return { reason: rejection.reason, exitCode: code };
  });
}

async function audioFileSnapshot(roots) {
  const records = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) fail("filesystem-link");
      if (entry.isDirectory()) await visit(target);
      else if (/\.(?:wav|mp3|ogg|flac|pcm|m4a)$/iu.test(entry.name)) {
        const info = await lstat(target);
        records.push(`${target}:${info.size}:${info.mtimeMs}`);
      }
    }
  }
  for (const root of roots) await visit(root);
  return {
    count: records.length,
    identity: createHash("sha256")
      .update(records.sort().join("\n"))
      .digest("hex"),
  };
}
async function desktop(options, installed) {
  const expected = await readJson(
    path.join(
      repositoryRoot,
      "apps/desktop/src-tauri/release/windows-package-evidence-v3.json",
    ),
  );
  const binary = await fileIdentity(options.executable);
  if (
    binary.sha256 !== expected.package.applicationBinary.sha256 ||
    binary.sizeBytes !== expected.package.applicationBinary.sizeBytes
  )
    fail("desktop-binary-identity");
  const desktopRoot = path.dirname(options.executable);
  const observedRoots = [
    desktopRoot,
    path.resolve(options.installedRoot, "../../.."),
  ];
  const audioBefore = await audioFileSnapshot(observedRoots);
  const piperRoot = path.join(
    desktopRoot,
    "resources/tts/voxleaf-piper-core-v1",
  );
  const manifest = await readJson(
    path.join(piperRoot, "runtime-manifest-v1.json"),
  );
  const piper = await verifyTree(
    piperRoot,
    manifest,
    "runtime-manifest-v1.json",
  );
  if (piper.manifestSha256 !== expected.authority.piperRuntimeManifestSha256)
    fail("desktop-piper-identity");
  const resources = [
    "optional-package-manifest-v3.json",
    "runtime-package-evidence-v4.json",
    "source-manifest-v3.json",
    "THIRD-PARTY-NOTICES.md",
  ];
  for (const name of resources)
    if (
      (await hashFile(
        path.join(desktopRoot, "resources/release/optional/chatterbox", name),
      )) !==
      (await hashFile(
        path.join(
          repositoryRoot,
          "services/tts/release/optional/chatterbox",
          name,
        ),
      ))
    )
      fail("desktop-v3-authority");
  const interpreters = [
    {
      logical: path.join(piperRoot, "runtime/python.exe"),
      canonical: path.join(piperRoot, "runtime/python.exe"),
    },
    installed.interpreter,
  ];
  for (const python of interpreters) assertFirewall(python.canonical);
  const arms = BILINGUAL_PORTFOLIO_ARMS.slice(0, 4);
  const results = [];
  for (const arm of arms) {
    if (
      selectPortfolioArms([
        `--profile=${arm.profileId}`,
        `--language=${arm.language}`,
      ]).length !== 1
    )
      fail("desktop-arm");
    const python = arm.profileId.startsWith("piper-")
      ? interpreters[0].canonical
      : interpreters[1].canonical;
    const seen = new Set();
    let requestedRuntimeObserved = false;
    const observedIds = new Set();
    const observedInterpreters = new Set();
    const child = spawn(
      process.execPath,
      [
        path.join(
          repositoryRoot,
          "apps/desktop/scripts/native-startup-smoke.mjs",
        ),
        `--executable=${options.executable}`,
        ...nativeRunnerArguments(arm),
      ],
      {
        cwd: repositoryRoot,
        env: childEnvironment(
          process.env,
          path.join(evidenceRoot, "candidate/cache"),
        ),
        stdio: "inherit",
        windowsHide: true,
      },
    );
    await withChild(child, async () => {
      let settled = false;
      let outcome;
      child.once("exit", (code, signal) => {
        outcome = { code, signal };
        settled = true;
      });
      child.once("error", () => {
        outcome = { code: 1 };
        settled = true;
      });
      const deadline = Date.now() + ARM_TIMEOUT_MS;
      while (!settled) {
        if (Date.now() > deadline) fail("desktop-timeout");
        const snapshot = processes();
        const ids = descendantIds(snapshot, child.pid);
        for (const id of ids) observedIds.add(id);
        for (const item of snapshot)
          if (
            ids.has(item.ProcessId) &&
            /python(?:w)?\.exe$/iu.test(item.ExecutablePath ?? "")
          ) {
            const runtimeIndex = interpreters.findIndex(
              (expectedPython) =>
                samePath(item.ExecutablePath, expectedPython.logical) ||
                samePath(item.ExecutablePath, expectedPython.canonical),
            );
            if (
              runtimeIndex < 0 ||
              !item.CommandLine?.includes(
                runtimeIndex === 0
                  ? "voxleaf_tts.piper_service"
                  : "voxleaf_tts.chatterbox_service",
              )
            )
              fail("desktop-runtime-binding");
            if (interpreters[runtimeIndex].canonical === python)
              requestedRuntimeObserved = true;
            observedInterpreters.add(item.ExecutablePath);
            seen.add(item.ProcessId);
          }
        // WebDriver's own loopback listeners are allowed; the model tree has none.
        for (const pid of seen)
          if (snapshot.some((item) => item.ProcessId === pid))
            assertNoNetwork(descendantIds(snapshot, pid));
        await delay(1_000);
      }
      if (
        outcome.code !== 0 ||
        outcome.signal !== null ||
        !requestedRuntimeObserved
      )
        fail("desktop-arm-result");
    });
    const remaining = processes().filter((item) =>
      observedIds.has(item.ProcessId),
    );
    if (remaining.length) fail("desktop-process-cleanup");
    results.push({
      profileId: arm.profileId,
      language: arm.language,
      python,
      observedInterpreters: [...observedInterpreters],
      observedChildren: seen.size,
      status: "passed",
    });
  }
  if ((await fileIdentity(options.executable)).sha256 !== binary.sha256)
    fail("desktop-artifact-drift");
  await verifyTree(piperRoot, manifest, "runtime-manifest-v1.json");
  const audioAfter = await audioFileSnapshot(observedRoots);
  if (JSON.stringify(audioAfter) !== JSON.stringify(audioBefore))
    fail("desktop-audio-filesystem-drift");
  return {
    binary,
    piper,
    arms: results,
    audioFilesystem: { before: audioBefore, after: audioAfter },
  };
}

export async function run(args = process.argv.slice(2)) {
  const options = parseArguments(args);
  const before = await preflight(options);
  const result = {
    schemaVersion: 1,
    mode: options.mode,
    distribution: { published: false, admitted: false },
    bindings: before,
  };
  if (options.mode === "candidate") {
    result.malformed = await malformedInput(options.piperRoot);
    result.arms = [];
    for (const language of ["es", "en"])
      result.arms.push(
        await candidateArm(
          options,
          options.piperRoot,
          language,
          "piper_service",
        ),
      );
    for (const language of ["es", "en"])
      result.arms.push(
        await candidateArm(
          options,
          options.chatterboxRoot,
          language,
          "chatterbox_service",
        ),
      );
  } else if (options.mode === "desktop")
    result.desktop = await desktop(options, before.installedV3);
  const after = await preflight(options);
  if (JSON.stringify(before) !== JSON.stringify(after)) fail("artifact-drift");
  result.status = "passed";
  await mkdir(path.dirname(options.receipt), { recursive: true });
  await writeFile(options.receipt, JSON.stringify(result, null, 2) + "\n", {
    flag: "wx",
  });
  console.log(`tts-adapter-layout-host:${options.mode}:passed`);
}
if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  try {
    await run();
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "tts-adapter-layout-host:failed",
    );
    process.exitCode = 1;
  }
}
