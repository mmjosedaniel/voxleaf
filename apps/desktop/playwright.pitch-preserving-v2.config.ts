import { defineConfig } from "@playwright/test";

const BASE_URL = "http://127.0.0.1:4175";

export default defineConfig({
  testDir: "./tests/browser",
  testMatch: "pitch-preserving-backend-v2.comparison.spec.ts",
  outputDir: "./test-results/pitch-preserving-v2",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: true,
  reporter: "list",
  timeout: 720_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: BASE_URL,
    browserName: "chromium",
    viewport: { width: 1_280, height: 720 },
    colorScheme: "light",
    contextOptions: {
      reducedMotion: "reduce",
    },
    locale: "en-US",
    serviceWorkers: "block",
    timezoneId: "UTC",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
});
