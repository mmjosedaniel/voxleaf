import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { once } from "node:events";
import { createServer } from "node:http";
import test from "node:test";

import {
  runWebDriverElementInteractionWithRetry,
  runWebDriverInteractionWithRetry,
  WebDriverClient,
  WebDriverClientError,
} from "./native-webdriver-client.mjs";
import {
  assertNativeSmokeInvariant,
  assertNativeSmokeInvariants,
  nativeSmokeInvariantFailureCode,
  NativeSmokeInvariantError,
  resolveNativeSmokeExecutable,
} from "./native-smoke-invariants.mjs";

const ELEMENT_KEY = "element-6066-11e4-a52e-4f735466cecf";

test("resolves one absolute installed executable without accepting ambiguous paths", () => {
  assert.equal(
    resolveNativeSmokeExecutable(
      [
        "--executable=C:\\Users\\tester\\AppData\\Local\\VoxLeaf\\voxleaf-desktop.exe",
      ],
      "C:\\fallback\\voxleaf-desktop.exe",
      "win32",
    ),
    "C:\\Users\\tester\\AppData\\Local\\VoxLeaf\\voxleaf-desktop.exe",
  );
  assert.equal(
    resolveNativeSmokeExecutable(
      [],
      "C:\\fallback\\voxleaf-desktop.exe",
      "win32",
    ),
    "C:\\fallback\\voxleaf-desktop.exe",
  );
  assert.throws(
    () =>
      resolveNativeSmokeExecutable(
        ["--executable=relative.exe"],
        "C:\\fallback\\voxleaf-desktop.exe",
        "win32",
      ),
    /must be an absolute path/u,
  );
  assert.throws(
    () =>
      resolveNativeSmokeExecutable(
        [
          "--executable=C:\\one\\voxleaf-desktop.exe",
          "--executable=C:\\two\\voxleaf-desktop.exe",
        ],
        "C:\\fallback\\voxleaf-desktop.exe",
        "win32",
      ),
    /provided more than once/u,
  );
});

async function startServer(handler) {
  const requests = [];
  const server = createServer(async (request, response) => {
    const chunks = [];

    for await (const chunk of request) {
      chunks.push(chunk);
    }

    const rawBody = Buffer.concat(chunks).toString("utf8");
    const body = rawBody.length === 0 ? undefined : JSON.parse(rawBody);
    requests.push({
      body,
      method: request.method,
      path: request.url,
    });
    const result = await handler(requests.at(-1));
    response.writeHead(result.status ?? 200, {
      "content-type": "application/json",
    });
    response.end(JSON.stringify(result.body));
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.equal(typeof address, "object");
  const endpoint = `http://127.0.0.1:${address.port}`;

  return {
    endpoint,
    requests,
    stop: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

test("creates a Tauri session and sends bounded WebDriver commands", async () => {
  const fake = await startServer(({ method, path }) => {
    if (method === "GET" && path === "/status") {
      return { body: { value: { ready: true } } };
    }
    if (method === "POST" && path === "/session") {
      return { body: { value: { sessionId: "fixed-session" } } };
    }
    if (method === "POST" && path.endsWith("/element")) {
      return { body: { value: { [ELEMENT_KEY]: "fixed-element" } } };
    }
    return { body: { value: null } };
  });
  const client = new WebDriverClient(fake.endpoint);

  try {
    assert.equal(await client.isReady(), true);
    await client.createSession(
      "C:\\fixed\\voxleaf-desktop.exe",
      "C:\\fixed\\profile",
    );
    assert.equal(client.hasSession, true);
    const element = await client.findElement("#root");
    await client.sendKeys(element, "C:\\fixed\\synthetic.epub");
    await client.execute("return true;");
    await client.setWindowRect(320, 640);
    await client.executeCdp("Network.enable");
    await client.deleteSession();
    assert.equal(client.hasSession, false);

    assert.deepEqual(fake.requests[1].body, {
      capabilities: {
        alwaysMatch: {
          browserName: "wry",
          "ms:loggingPrefs": {
            browser: "ALL",
            performance: "ALL",
          },
          "tauri:options": {
            application: "C:\\fixed\\voxleaf-desktop.exe",
            webviewOptions: {
              userDataFolder: "C:\\fixed\\profile",
            },
          },
        },
      },
    });
    assert.deepEqual(fake.requests[3].body, {
      text: "C:\\fixed\\synthetic.epub",
      value: Array.from("C:\\fixed\\synthetic.epub"),
    });
    assert.equal(
      fake.requests.some(
        ({ body, path }) =>
          path === "/session/fixed-session/window/rect" &&
          body?.width === 320 &&
          body?.height === 640,
      ),
      true,
    );
    assert.equal(
      fake.requests.some(
        ({ path }) => path === "/session/fixed-session/ms/cdp/execute",
      ),
      true,
    );
  } finally {
    await fake.stop();
  }
});

test("contains transport and protocol details behind fixed error codes", async () => {
  const fake = await startServer(() => ({
    body: {
      value: {
        error: "unknown error",
        message: "private driver detail",
      },
    },
    status: 500,
  }));
  const client = new WebDriverClient(fake.endpoint);

  try {
    await assert.rejects(
      client.createSession(
        "C:\\private\\book-name.exe",
        "C:\\private\\profile",
      ),
      (error) =>
        error instanceof WebDriverClientError &&
        error.message === "webdriver-unknown-error" &&
        !error.message.includes("private"),
    );
  } finally {
    await fake.stop();
  }
});

test("classifies retryable element failures without exposing driver details", async () => {
  for (const [protocolCode, expectedCode] of [
    ["stale element reference", "webdriver-stale-element-reference"],
    ["element not interactable", "webdriver-element-not-interactable"],
  ]) {
    const fake = await startServer(() => ({
      body: {
        value: {
          error: protocolCode,
          message: "private driver detail",
        },
      },
      status: 500,
    }));
    const client = new WebDriverClient(fake.endpoint);
    try {
      await assert.rejects(
        client.createSession(
          "C:\\private\\book-name.exe",
          "C:\\private\\profile",
        ),
        (error) =>
          error instanceof WebDriverClientError &&
          error.code === expectedCode &&
          !error.message.includes("private"),
      );
    } finally {
      await fake.stop();
    }
  }
});

test("classifies known session failures without exposing driver messages", async () => {
  const fake = await startServer(() => ({
    body: {
      value: {
        error: "session not created",
        message:
          "session not created: DevToolsActivePort file does not exist at C:\\private",
      },
    },
    status: 500,
  }));
  const client = new WebDriverClient(fake.endpoint);

  try {
    await assert.rejects(
      client.createSession(
        "C:\\private\\book-name.exe",
        "C:\\private\\profile",
      ),
      (error) =>
        error instanceof WebDriverClientError &&
        error.code === "webdriver-automation-marker-missing" &&
        !error.message.includes("private"),
    );
  } finally {
    await fake.stop();
  }
});

test("fails closed when a response does not contain a W3C session", async () => {
  const fake = await startServer(() => ({
    body: { value: {} },
  }));
  const client = new WebDriverClient(fake.endpoint);

  try {
    await assert.rejects(
      client.createSession(
        "C:\\fixed\\voxleaf-desktop.exe",
        "C:\\fixed\\profile",
      ),
      (error) =>
        error instanceof WebDriverClientError &&
        error.code === "webdriver-session-invalid",
    );
  } finally {
    await fake.stop();
  }
});

test("retries one timed-out interaction once before succeeding", async () => {
  const attempts = [];
  const timeouts = [];
  let actionCount = 0;
  let conditionCount = 0;

  await runWebDriverInteractionWithRetry({
    action: async () => {
      actionCount += 1;
    },
    condition: async () => {
      conditionCount += 1;
      if (conditionCount === 1) {
        throw new WebDriverClientError("webdriver-condition-timeout");
      }
    },
    onAttempt: async (attempt, maximumAttempts) => {
      attempts.push([attempt, maximumAttempts]);
    },
    onConditionTimeout: async (attempt, maximumAttempts) => {
      timeouts.push([attempt, maximumAttempts]);
    },
  });

  assert.equal(actionCount, 2);
  assert.equal(conditionCount, 2);
  assert.deepEqual(attempts, [
    [1, 2],
    [2, 2],
  ]);
  assert.deepEqual(timeouts, [[1, 2]]);
});

test("stops after the second timed-out interaction", async () => {
  const attempts = [];
  const timeouts = [];
  let actionCount = 0;

  await assert.rejects(
    runWebDriverInteractionWithRetry({
      action: async () => {
        actionCount += 1;
      },
      condition: async () => {
        throw new WebDriverClientError("webdriver-condition-timeout");
      },
      onAttempt: async (attempt, maximumAttempts) => {
        attempts.push([attempt, maximumAttempts]);
      },
      onConditionTimeout: async (attempt, maximumAttempts) => {
        timeouts.push([attempt, maximumAttempts]);
      },
    }),
    (error) =>
      error instanceof WebDriverClientError &&
      error.code === "webdriver-condition-timeout",
  );

  assert.equal(actionCount, 2);
  assert.deepEqual(attempts, [
    [1, 2],
    [2, 2],
  ]);
  assert.deepEqual(timeouts, [
    [1, 2],
    [2, 2],
  ]);
});

test("retries one stale element interaction after checking delivery state", async () => {
  let actions = 0;
  let acceptedChecks = 0;
  let retries = 0;
  await runWebDriverElementInteractionWithRetry({
    action: async () => {
      actions += 1;
      if (actions === 1) {
        throw new WebDriverClientError("webdriver-stale-element-reference");
      }
    },
    accepted: async () => {
      acceptedChecks += 1;
      return false;
    },
    onRetry: async () => {
      retries += 1;
    },
  });
  assert.equal(actions, 2);
  assert.equal(acceptedChecks, 1);
  assert.equal(retries, 1);
});

test("accepts a delivered element interaction without sending it twice", async () => {
  let actions = 0;
  await runWebDriverElementInteractionWithRetry({
    action: async () => {
      actions += 1;
      throw new WebDriverClientError("webdriver-element-not-interactable");
    },
    accepted: async () => true,
  });
  assert.equal(actions, 1);
});

test("does not retry unclassified WebDriver interaction failures", async () => {
  let actions = 0;
  await assert.rejects(
    runWebDriverElementInteractionWithRetry({
      action: async () => {
        actions += 1;
        throw new WebDriverClientError("webdriver-command-failed");
      },
      accepted: async () => false,
    }),
    (error) =>
      error instanceof WebDriverClientError &&
      error.code === "webdriver-command-failed",
  );
  assert.equal(actions, 1);
});

test("reports only fixed content-safe native smoke invariant codes", () => {
  assert.doesNotThrow(() =>
    assertNativeSmokeInvariants([
      ["action-contract", true],
      ["cleanup-highlight-cleared", true],
    ]),
  );

  assert.throws(
    () => assertNativeSmokeInvariant(false, "cleanup-gpu-released"),
    (error) =>
      error instanceof NativeSmokeInvariantError &&
      error.message === "Native smoke invariant failed." &&
      nativeSmokeInvariantFailureCode(error) ===
        "native-invariant-cleanup-gpu-released",
  );
  assert.throws(
    () => assertNativeSmokeInvariant(false, "private publication text"),
    (error) =>
      error instanceof TypeError &&
      error.message === "Unknown native smoke invariant." &&
      nativeSmokeInvariantFailureCode(error) === undefined,
  );
});
