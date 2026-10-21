import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import { createAcquisitionFileBarrier } from "./acquisition-file-barrier.mjs";

test(
  "Windows verification barrier holds a real file read until explicit release",
  { skip: process.platform !== "win32" },
  async () => {
    const root = await mkdtemp(
      path.join(tmpdir(), "voxleaf-verification-barrier-"),
    );
    const file = path.join(root, "synthetic.bin");
    await writeFile(file, "synthetic");
    const barrier = createAcquisitionFileBarrier("verification", file);
    let read;
    try {
      await barrier.waitFor("ready");
      let completed = false;
      read = readFile(file).then((bytes) => {
        completed = true;
        return bytes;
      });
      await barrier.waitFor("reached");
      assert.equal(completed, false);
      assert.equal(await barrier.close(), 0);
      assert.equal((await read).toString(), "synthetic");
    } finally {
      await barrier.close();
      await read;
      await rm(root, { recursive: true, force: true });
    }
  },
);

test(
  "Windows cleanup barrier denies deletion until its owned handle closes",
  { skip: process.platform !== "win32" },
  async () => {
    const root = await mkdtemp(path.join(tmpdir(), "voxleaf-cleanup-barrier-"));
    const file = path.join(root, "synthetic.lock");
    const barrier = createAcquisitionFileBarrier("cleanup", file);
    try {
      await barrier.waitFor("ready");
      await assert.rejects(rm(file), (error) =>
        ["EPERM", "EBUSY", "EACCES"].includes(error.code),
      );
      assert.equal(await barrier.close(), 0);
      await rm(file);
    } finally {
      await barrier.close();
      await rm(root, { recursive: true, force: true });
    }
  },
);
