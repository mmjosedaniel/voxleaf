import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { once } from "node:events";
import { createServer } from "node:http";
import test from "node:test";

import {
  runWebDriverInteractionWithRetry,
  WebDriverClient,
  WebDriverClientError,
} from "./native-webdriver-client.mjs";

const ELEMENT_KEY = "element-6066-11e4-a52e-4f735466cecf";

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
