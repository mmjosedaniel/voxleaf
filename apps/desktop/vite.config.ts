import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { configDefaults, defineConfig } from "vitest/config";

function contractValidatorRuntimeGuard(): Plugin {
  return {
    name: "voxleaf-contract-validator-runtime-guard",
    apply: "build",
    generateBundle(_options, bundle) {
      const forbiddenAjvModules = [...this.getModuleIds()]
        .map((moduleId) => moduleId.replaceAll("\\", "/").split("?", 1)[0]!)
        .filter(
          (moduleId) =>
            moduleId.includes("/node_modules/") && moduleId.includes("/ajv/"),
        )
        .map((moduleId) => moduleId.slice(moduleId.lastIndexOf("/ajv/") + 1))
        .sort();

      if (forbiddenAjvModules.length > 0) {
        this.error(
          `Production bundle contains Ajv compiler modules: ${forbiddenAjvModules.join(", ")}`,
        );
      }

      for (const output of Object.values(bundle)) {
        if (
          output.type === "chunk" &&
          (/\beval\s*\(/u.test(output.code) ||
            /\bFunction\s*\(/u.test(output.code))
        ) {
          this.error(
            `Production bundle contains runtime code generation in ${output.fileName}.`,
          );
        }
      }
    },
  };
}

export default defineConfig({
  clearScreen: false,
  plugins: [react(), contractValidatorRuntimeGuard()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "tests/browser/**"],
    setupFiles: "./src/test/setup.ts",
  },
});
