import { defineConfig } from "@playwright/test";

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
});
