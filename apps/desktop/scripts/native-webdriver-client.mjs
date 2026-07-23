const W3C_ELEMENT_KEY = "element-6066-11e4-a52e-4f735466cecf";
const PROTOCOL_FAILURE_PATTERNS = Object.freeze([
  ["devtoolsactiveport", "webdriver-automation-marker-missing"],
  ["unable to discover open pages", "webdriver-page-discovery-failed"],
  ["user data directory is already in use", "webdriver-profile-in-use"],
  ["failed to create webview2", "webdriver-webview-environment-failed"],
  ["webview2 runtime is not installed", "webdriver-runtime-unavailable"],
  ["microsoft edge failed to start", "webdriver-edge-start-failed"],
  ["failed to start: crashed", "webdriver-edge-start-failed"],
  ["timed out", "webdriver-session-timeout"],
  ["timeout", "webdriver-session-timeout"],
  ["0x80070005", "webdriver-profile-access-denied"],
  ["0x80070002", "webdriver-runtime-unavailable"],
  ["0x800705aa", "webdriver-insufficient-resources"],
]);
const PROTOCOL_FAILURE_CODES = new Map([
  ["invalid argument", "webdriver-capability-invalid"],
  ["session not created", "webdriver-session-not-created"],
  ["unknown error", "webdriver-unknown-error"],
]);

export class WebDriverClientError extends Error {
  constructor(code) {
    super(code);
    this.name = "WebDriverClientError";
    this.code = code;
  }
}

export class WebDriverClient {
  #endpoint;
  #requestTimeoutMs;
  #sessionId;

  constructor(endpoint, { requestTimeoutMs = 10_000 } = {}) {
    this.#endpoint = endpoint.replace(/\/+$/, "");
    this.#requestTimeoutMs = requestTimeoutMs;
  }

  get hasSession() {
    return this.#sessionId !== undefined;
  }

  async isReady() {
    try {
      await this.#request("GET", "/status");
      return true;
    } catch {
      return false;
    }
  }

  async createSession(applicationPath, userDataFolder) {
    const response = await this.#request("POST", "/session", {
      capabilities: {
        alwaysMatch: {
          browserName: "wry",
          "ms:loggingPrefs": {
            browser: "ALL",
            performance: "ALL",
          },
          "tauri:options": {
            application: applicationPath,
            webviewOptions: {
              userDataFolder,
            },
          },
        },
      },
    });
    const sessionId = response?.sessionId;

    if (typeof sessionId !== "string" || sessionId.length === 0) {
      throw new WebDriverClientError("webdriver-session-invalid");
    }

    this.#sessionId = sessionId;
  }

  async deleteSession() {
    if (this.#sessionId === undefined) {
      return;
    }

    const sessionId = this.#sessionId;
    this.#sessionId = undefined;
    await this.#request("DELETE", `/session/${sessionId}`);
  }

  async findElement(selector) {
    const value = await this.#sessionRequest("POST", "/element", {
      using: "css selector",
      value: selector,
    });
    return this.#elementId(value);
  }

  async findElements(selector) {
    const values = await this.#sessionRequest("POST", "/elements", {
      using: "css selector",
      value: selector,
    });

    if (!Array.isArray(values)) {
      throw new WebDriverClientError("webdriver-elements-invalid");
    }

    return values.map((value) => this.#elementId(value));
  }

  async click(elementId) {
    await this.#sessionRequest("POST", `/element/${elementId}/click`, {});
  }

  async sendKeys(elementId, text) {
    await this.#sessionRequest("POST", `/element/${elementId}/value`, {
      text,
      value: Array.from(text),
    });
  }

  async execute(script, args = []) {
    return await this.#sessionRequest("POST", "/execute/sync", {
      args,
      script,
    });
  }

  async executeCdp(command, params = {}) {
    return await this.#sessionRequest("POST", "/ms/cdp/execute", {
      cmd: command,
      params,
    });
  }

  async getLogs(type) {
    const logs = await this.#sessionRequest("POST", "/log", {
      type,
    });

    if (!Array.isArray(logs)) {
      throw new WebDriverClientError("webdriver-logs-invalid");
    }

    return logs;
  }

  async #sessionRequest(method, path, body) {
    if (this.#sessionId === undefined) {
      throw new WebDriverClientError("webdriver-session-missing");
    }

    return await this.#request(
      method,
      `/session/${this.#sessionId}${path}`,
      body,
    );
  }

  #elementId(value) {
    const elementId = value?.[W3C_ELEMENT_KEY];

    if (typeof elementId !== "string" || elementId.length === 0) {
      throw new WebDriverClientError("webdriver-element-invalid");
    }

    return elementId;
  }

  async #request(method, path, body) {
    let response;

    try {
      response = await globalThis.fetch(`${this.#endpoint}${path}`, {
        body: body === undefined ? undefined : JSON.stringify(body),
        headers:
          body === undefined
            ? undefined
            : { "content-type": "application/json" },
        method,
        signal: globalThis.AbortSignal.timeout(this.#requestTimeoutMs),
      });
    } catch (error) {
      throw new WebDriverClientError(
        error?.name === "TimeoutError"
          ? "webdriver-request-timeout"
          : "webdriver-request-failed",
      );
    }

    let payload;

    try {
      payload = await response.json();
    } catch {
      throw new WebDriverClientError("webdriver-response-invalid");
    }

    if (!response.ok || payload?.value?.error !== undefined) {
      throw new WebDriverClientError(protocolFailureCode(payload));
    }

    return payload?.value;
  }
}

function protocolFailureCode(payload) {
  const message =
    typeof payload?.value?.message === "string"
      ? payload.value.message.toLowerCase()
      : "";

  for (const [pattern, code] of PROTOCOL_FAILURE_PATTERNS) {
    if (message.includes(pattern)) {
      return code;
    }
  }

  return (
    PROTOCOL_FAILURE_CODES.get(payload?.value?.error) ??
    "webdriver-command-failed"
  );
}
