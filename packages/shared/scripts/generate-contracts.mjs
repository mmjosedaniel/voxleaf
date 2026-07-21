import console from "node:console";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { compileFromFile } from "json-schema-to-typescript";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDirectory, "..");
const schemaRoot = path.join(packageRoot, "schemas");
const outputRoot = path.join(packageRoot, "src", "generated", "contracts");
const checkOnly = process.argv.includes("--check");

const bannerComment = `/**
 * This file is generated from the canonical JSON Schema source.
 * DO NOT MODIFY IT BY HAND. Run the @voxleaf/shared generate command instead.
 */`;

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
    throw new Error(`Schema path must use <family>/vN.schema.json: ${relativePath}`);
  }

  return `${family}-${version}.ts`;
}

async function expectedOutputs() {
  const schemaPaths = (await listFiles(schemaRoot))
    .filter((filePath) => filePath.endsWith(".schema.json"))
    .sort();

  if (schemaPaths.length === 0) {
    throw new Error("No canonical contract schemas were found.");
  }

  const outputs = new Map();

  for (const schemaPath of schemaPaths) {
    const generated = await compileFromFile(schemaPath, {
      bannerComment,
      cwd: schemaRoot,
      format: true,
      style: {
        bracketSpacing: true,
        printWidth: 100,
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
      throw new Error(`Multiple schemas generate the same output: ${outputName}`);
    }

    outputs.set(outputName, normalized);
  }

  return outputs;
}

async function currentGeneratedNames() {
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

async function checkOutputs(outputs) {
  const problems = [];
  const expectedNames = [...outputs.keys()].sort();
  const actualNames = await currentGeneratedNames();

  for (const outputName of expectedNames) {
    const outputPath = path.join(outputRoot, outputName);

    try {
      const actual = await readFile(outputPath, "utf8");
      if (actual !== outputs.get(outputName)) {
        problems.push(`stale generated file: ${outputName}`);
      }
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
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

  if (problems.length > 0) {
    for (const problem of problems) {
      console.error(problem);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Verified ${expectedNames.length} generated contract file(s).`);
}

async function writeOutputs(outputs) {
  await mkdir(outputRoot, { recursive: true });

  for (const [outputName, contents] of outputs) {
    const outputPath = path.join(outputRoot, outputName);
    let current = null;

    try {
      current = await readFile(outputPath, "utf8");
    } catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) {
        throw error;
      }
    }

    if (current !== contents) {
      await writeFile(outputPath, contents, "utf8");
    }
  }

  const unexpectedNames = (await currentGeneratedNames()).filter((fileName) => !outputs.has(fileName));
  if (unexpectedNames.length > 0) {
    throw new Error(
      `Unexpected generated files must be removed explicitly: ${unexpectedNames.join(", ")}`,
    );
  }

  console.log(`Generated ${outputs.size} contract file(s).`);
}

const outputs = await expectedOutputs();

if (checkOnly) {
  await checkOutputs(outputs);
} else {
  await writeOutputs(outputs);
}
