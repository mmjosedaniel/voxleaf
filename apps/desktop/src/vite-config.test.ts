import config from "../vite.config";
import { describe, expect, it } from "vitest";

describe("Vite development watch boundary", () => {
  it("ignores generated Tauri output", () => {
    expect(config.server?.watch?.ignored).toEqual(
      expect.arrayContaining(["**/src-tauri/**"]),
    );
  });
});
