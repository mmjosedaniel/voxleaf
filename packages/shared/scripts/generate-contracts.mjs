import console from "node:console";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import standaloneCode from "ajv/dist/standalone/index.js";
import { compileFromFile } from "json-schema-to-typescript";
import { format } from "prettier";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDirectory, "..");
const schemaRoot = path.join(packageRoot, "schemas");
const contractOutputRoot = path.join(
  packageRoot,
  "src",
  "generated",
  "contracts",
);
const validatorOutputRoot = path.join(
  packageRoot,
  "src",
  "generated",
  "validators",
);
const checkOnly = process.argv.includes("--check");

const bannerComment = `/**
 * This file is generated from the canonical JSON Schema source.
 * DO NOT MODIFY IT BY HAND. Run the @voxleaf/shared generate command instead.
 */`;

const validatorDefinitions = Object.freeze([
  {
    exportName: "validateAudioFrameV1Wire",
    schemaId: "urn:voxleaf:schema:audio-frame:v1",
    typeName: "AudioFrameV1Wire",
    typeModule: "audio-frame-v1.js",
  },
  {
    exportName: "validateBookV1Wire",
    schemaId: "urn:voxleaf:schema:book:v1",
    typeName: "BookV1Wire",
    typeModule: "book-v1.js",
  },
  {
    exportName: "validateBufferStatusV1Wire",
    schemaId: "urn:voxleaf:schema:buffer-status:v1",
    typeName: "BufferStatusV1Wire",
    typeModule: "buffer-status-v1.js",
  },
  {
    exportName: "validateCapabilityReportV1Wire",
    schemaId: "urn:voxleaf:schema:capability-report:v1",
    typeName: "CapabilityReportV1Wire",
    typeModule: "capability-report-v1.js",
  },
  {
    exportName: "validateLocatorRangeV1Wire",
    schemaId: "urn:voxleaf:schema:locator-range:v1",
    typeName: "LocatorRangeV1Wire",
    typeModule: "locator-range-v1.js",
  },
  {
    exportName: "validateReadingLocatorV1Wire",
    schemaId: "urn:voxleaf:schema:locator:v1",
    typeName: "ReadingLocatorV1Wire",
    typeModule: "locator-v1.js",
  },
  {
    exportName: "validateNarrationSegmentV1Wire",
    schemaId: "urn:voxleaf:schema:narration-segment:v1",
    typeName: "NarrationSegmentV1Wire",
    typeModule: "narration-segment-v1.js",
  },
  {
    exportName: "validateOperationalErrorV1Wire",
    schemaId: "urn:voxleaf:schema:operational-error:v1",
    typeName: "OperationalErrorV1Wire",
    typeModule: "operational-error-v1.js",
  },
  {
    exportName: "validatePersistedReadingStateV1Wire",
    schemaId: "urn:voxleaf:schema:persisted-reading-state:v1",
    typeName: "PersistedReadingStateV1Wire",
    typeModule: "persisted-reading-state-v1.js",
  },
  {
    exportName: "validateReadingSessionV1Wire",
    schemaId: "urn:voxleaf:schema:reading-session:v1",
    typeName: "ReadingSessionV1Wire",
    typeModule: "reading-session-v1.js",
  },
]);

const standaloneRuntimeHelpers = Object.freeze([
  {
    emittedSpecifier: "ajv/dist/runtime/equal",
    render: (generatedName) => `function ${generatedName}(left, right) {
  if (left === right) return true;

  if (
    left &&
    right &&
    typeof left === "object" &&
    typeof right === "object"
  ) {
    if (left.constructor !== right.constructor) return false;

    let length;
    let index;
    let keys;
    if (Array.isArray(left)) {
      length = left.length;
      if (length !== right.length) return false;
      for (index = length; index-- !== 0; ) {
        if (!${generatedName}(left[index], right[index])) return false;
      }
      return true;
    }

    if (left.constructor === RegExp) {
      return left.source === right.source && left.flags === right.flags;
    }
    if (left.valueOf !== Object.prototype.valueOf) {
      return left.valueOf() === right.valueOf();
    }
    if (left.toString !== Object.prototype.toString) {
      return left.toString() === right.toString();
    }

    keys = Object.keys(left);
    length = keys.length;
    if (length !== Object.keys(right).length) return false;

    for (index = length; index-- !== 0; ) {
      if (!Object.prototype.hasOwnProperty.call(right, keys[index])) return false;
    }
    for (index = length; index-- !== 0; ) {
      const key = keys[index];
      if (!${generatedName}(left[key], right[key])) return false;
    }

    return true;
  }

  return left !== left && right !== right;
}`,
  },
  {
    emittedSpecifier: "ajv/dist/runtime/ucs2length",
    render: (generatedName) => `function ${generatedName}(value) {
  const codeUnitLength = value.length;
  let codePointLength = 0;
  let position = 0;
  let codeUnit;

  while (position < codeUnitLength) {
    codePointLength += 1;
    codeUnit = value.charCodeAt(position);
    position += 1;
    if (
      codeUnit >= 0xd800 &&
      codeUnit <= 0xdbff &&
      position < codeUnitLength
    ) {
      codeUnit = value.charCodeAt(position);
      if ((codeUnit & 0xfc00) === 0xdc00) position += 1;
    }
  }

  return codePointLength;
}`,
  },
]);

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(entryPath)));
    } else {
      files.push(entryPath);
    }
  }

  return files;
}

function outputNameFor(schemaPath) {
  const relativePath = path.relative(schemaRoot, schemaPath);
  const parsedPath = path.parse(relativePath);
  const family = parsedPath.dir.split(path.sep).join("-");
  const version = parsedPath.name.replace(/\.schema$/u, "");

  if (family.length === 0 || version.length === 0) {
    throw new Error(
      `Schema path must use <family>/vN.schema.json: ${relativePath}`,
    );
  }

  return `${family}-${version}.ts`;
}

async function loadCanonicalSchemas() {
  const schemaPaths = (await listFiles(schemaRoot))
    .filter((filePath) => filePath.endsWith(".schema.json"))
    .sort();

  if (schemaPaths.length === 0) {
    throw new Error("No canonical contract schemas were found.");
  }

  const schemasById = new Map();
  const schemaContentsById = new Map();

  for (const schemaPath of schemaPaths) {
    const contents = await readFile(schemaPath, "utf8");
    const schema = JSON.parse(contents);

    if (
      typeof schema.$id !== "string" ||
      !schema.$id.startsWith("urn:voxleaf:schema:")
    ) {
      throw new Error(`Schema must declare a VoxLeaf URN $id: ${schemaPath}`);
    }

    if (schemasById.has(schema.$id)) {
      throw new Error(`Duplicate schema $id: ${schema.$id}`);
    }

    schemasById.set(schema.$id, schema);
    schemaContentsById.set(schema.$id, contents);
  }

  return { schemaContentsById, schemaPaths, schemasById };
}

async function expectedContractOutputs(schemaPaths, schemaContentsById) {
  const outputs = new Map();

  for (const schemaPath of schemaPaths) {
    const generated = await compileFromFile(schemaPath, {
      $refOptions: {
        resolve: {
          http: false,
          voxleaf: {
            order: 1,
            canRead: ({ url }) => url.startsWith("urn:voxleaf:schema:"),
            read: ({ url }) => {
              const schemaId = url.split("#", 1)[0];
              const contents = schemaContentsById.get(schemaId);

              if (contents === undefined) {
                throw new Error(
                  `Unregistered VoxLeaf schema reference: ${schemaId}`,
                );
              }

              return contents;
            },
          },
        },
      },
      bannerComment,
      cwd: schemaRoot,
      format: true,
      style: {
        bracketSpacing: true,
        printWidth: 80,
        semi: true,
        singleQuote: false,
        tabWidth: 2,
        trailingComma: "all",
        useTabs: false,
      },
      unreachableDefinitions: true,
    });
    const normalized = `${generated.replace(/\r\n/gu, "\n").trimEnd()}\n`;
    const outputName = outputNameFor(schemaPath);

    if (outputs.has(outputName)) {
      throw new Error(
        `Multiple schemas generate the same output: ${outputName}`,
      );
    }

    outputs.set(outputName, normalized);
  }

  return outputs;
}

function replaceStandaloneRuntimeRequires(source) {
  let transformed = source;

  for (const helper of standaloneRuntimeHelpers) {
    const escapedSpecifier = helper.emittedSpecifier.replace(
      /[.*+?^${}()|[\]\\]/gu,
      "\\$&",
    );
    const pattern = new RegExp(
      `const (func\\d+) = require\\("${escapedSpecifier}"\\)\\.default;`,
      "gu",
    );
    const matches = [...transformed.matchAll(pattern)];

    if (matches.length !== 1 || matches[0]?.[1] === undefined) {
      throw new Error(
        `Expected one standalone runtime helper for ${helper.emittedSpecifier}.`,
      );
    }

    const generatedName = matches[0][1];
    transformed = transformed.replace(pattern, helper.render(generatedName));
  }

  if (/\brequire\s*\(/u.test(transformed)) {
    throw new Error(
      "Standalone validator output contains an unregistered runtime require.",
    );
  }

  return transformed;
}

function assertNoDynamicCode(source) {
  if (/\beval\s*\(/u.test(source) || /\bFunction\s*\(/u.test(source)) {
    throw new Error(
      "Standalone validator output contains runtime code generation.",
    );
  }
}

async function expectedValidatorOutputs(schemasById) {
  const validator = new Ajv2020({
    allErrors: true,
    coerceTypes: false,
    removeAdditional: false,
    strict: true,
    useDefaults: false,
    code: {
      esm: true,
      lines: true,
      source: true,
    },
  });

  for (const schema of schemasById.values()) {
    validator.addSchema(schema);
  }

  const exportsByName = Object.fromEntries(
    validatorDefinitions.map(({ exportName, schemaId }) => [
      exportName,
      schemaId,
    ]),
  );
  const standalone = replaceStandaloneRuntimeRequires(
    standaloneCode(validator, exportsByName),
  );
  assertNoDynamicCode(standalone);

  const standaloneModule = `${bannerComment}\n// @ts-nocheck -- Ajv emits JavaScript; typed exports live in index.ts.\n${standalone
    .replace(/\r\n/gu, "\n")
    .trimEnd()}\n`;
  const wrapperImports = validatorDefinitions
    .map(
      ({ exportName }) =>
        `  ${exportName} as standalone${exportName[0].toUpperCase()}${exportName.slice(1)},`,
    )
    .join("\n");
  const typeImports = validatorDefinitions
    .map(
      ({ typeModule, typeName }) =>
        `import type { ${typeName} } from "../contracts/${typeModule}";`,
    )
    .join("\n");
  const typedExports = validatorDefinitions
    .map(({ exportName, typeName }) => {
      const standaloneName = `standalone${exportName[0].toUpperCase()}${exportName.slice(1)}`;
      return `export const ${exportName} =\n  ${standaloneName} as unknown as ContractValidator<${typeName}>;`;
    })
    .join("\n\n");
  const indexModule = await format(
    `${bannerComment}\nimport {\n${wrapperImports}\n} from "./standalone.js";\n\n${typeImports}\n\ntype ContractValidator<T> = (input: unknown) => input is T;\n\n${typedExports}\n`,
    {
      bracketSpacing: true,
      endOfLine: "lf",
      parser: "typescript",
      printWidth: 80,
      semi: true,
      singleQuote: false,
      tabWidth: 2,
      trailingComma: "all",
      useTabs: false,
    },
  );

  return new Map([
    ["index.ts", indexModule],
    ["standalone.ts", standaloneModule],
  ]);
}

async function currentGeneratedNames(outputRoot) {
  try {
    return (await readdir(outputRoot))
      .filter((fileName) => fileName.endsWith(".ts"))
      .sort();
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function outputProblems(outputRoot, outputs) {
  const problems = [];
  const expectedNames = [...outputs.keys()].sort();
  const actualNames = await currentGeneratedNames(outputRoot);

  for (const outputName of expectedNames) {
    const outputPath = path.join(outputRoot, outputName);

    try {
      const actual = await readFile(outputPath, "utf8");
      if (actual !== outputs.get(outputName)) {
        problems.push(`stale generated file: ${outputName}`);
      }
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        problems.push(`missing generated file: ${outputName}`);
      } else {
        throw error;
      }
    }
  }

  for (const outputName of actualNames) {
    if (!outputs.has(outputName)) {
      problems.push(`unexpected generated file: ${outputName}`);
    }
  }

  return problems;
}

async function checkOutputGroups(outputGroups) {
  const problems = [];

  for (const { outputRoot, outputs } of outputGroups) {
    problems.push(...(await outputProblems(outputRoot, outputs)));
  }

  if (problems.length > 0) {
    for (const problem of problems) {
      console.error(problem);
    }
    process.exitCode = 1;
    return;
  }

  const total = outputGroups.reduce(
    (count, { outputs }) => count + outputs.size,
    0,
  );
  console.log(`Verified ${total} generated contract file(s).`);
}

async function writeOutputGroup(outputRoot, outputs) {
  await mkdir(outputRoot, { recursive: true });

  for (const [outputName, contents] of outputs) {
    const outputPath = path.join(outputRoot, outputName);
    let current = null;

    try {
      current = await readFile(outputPath, "utf8");
    } catch (error) {
      if (!(
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      )) {
        throw error;
      }
    }

    if (current !== contents) {
      await writeFile(outputPath, contents, "utf8");
    }
  }

  const unexpectedNames = (await currentGeneratedNames(outputRoot)).filter(
    (fileName) => !outputs.has(fileName),
  );
  if (unexpectedNames.length > 0) {
    throw new Error(
      `Unexpected generated files must be removed explicitly: ${unexpectedNames.join(", ")}`,
    );
  }
}

async function writeOutputGroups(outputGroups) {
  for (const { outputRoot, outputs } of outputGroups) {
    await writeOutputGroup(outputRoot, outputs);
  }

  const total = outputGroups.reduce(
    (count, { outputs }) => count + outputs.size,
    0,
  );
  console.log(`Generated ${total} contract file(s).`);
}

const { schemaContentsById, schemaPaths, schemasById } =
  await loadCanonicalSchemas();
const outputGroups = [
  {
    outputRoot: contractOutputRoot,
    outputs: await expectedContractOutputs(schemaPaths, schemaContentsById),
  },
  {
    outputRoot: validatorOutputRoot,
    outputs: await expectedValidatorOutputs(schemasById),
  },
];

if (checkOnly) {
  await checkOutputGroups(outputGroups);
} else {
  await writeOutputGroups(outputGroups);
}
