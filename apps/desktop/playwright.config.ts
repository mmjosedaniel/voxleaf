import { defineConfig } from "@playwright/test";

const BASE_URL = "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests/browser",
  outputDir: "./test-results/browser",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: true,
  reporter: "list",
  timeout: 15_000,
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
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: {
    command:
      "pnpm run build && pnpm exec vite preview --host 127.0.0.1 --port 4173 --strictPort",
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 30_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
