import { defineConfig } from "@playwright/test";

const BASE_URL = "http://127.0.0.1:4174";

export default defineConfig({
  testDir: "./tests/browser",
  testMatch: "**/*.benchmark.spec.ts",
  outputDir: "./test-results/reader-benchmark",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: true,
  reporter: "line",
  timeout: 180_000,
  use: {
    baseURL: BASE_URL,
    browserName: "chromium",
    colorScheme: "light",
    locale: "en-US",
    contextOptions: {
      reducedMotion: "reduce",
    },
    serviceWorkers: "block",
    timezoneId: "UTC",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  webServer: {
    command:
      "pnpm run build && pnpm exec vite preview --host 127.0.0.1 --port 4174 --strictPort",
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 30_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
