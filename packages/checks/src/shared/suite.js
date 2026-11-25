import { spawn } from "node:child_process";
import { getFreePort } from "./ports.js";
import { stopChild } from "./process-tree.js";

/**
 * Mutable suite state shared across checks in one run.
 */
export function createSuiteState() {
  const state = {
    port: null,
    baseUrl: null,
    sidecarPort: null,
    child: null,
    sidecarChild: null,
    logs: "",
    started: false,
  };

  return {
    get port() {
      return state.port;
    },
    get baseUrl() {
      return state.baseUrl;
    },
    get sidecarPort() {
      return state.sidecarPort;
    },
    get started() {
      return state.started;
    },
    get logs() {
      return state.logs;
    },
    /** @internal */
    _state: state,
    tokens() {
      return {
        port: state.port != null ? String(state.port) : "",
        baseUrl: state.baseUrl ?? "",
        sidecarPort: state.sidecarPort != null ? String(state.sidecarPort) : "",
      };
    },
    env() {
      const t = this.tokens();
      const out = { CI: "1", NEXT_TELEMETRY_DISABLED: "1" };
      if (t.port) {
        out.PORT = t.port;
        out.BASE_URL = t.baseUrl;
      }
      if (t.sidecarPort) out.SIDECAR_PORT = t.sidecarPort;
      return out;
    },
    async cleanup() {
      if (state.child) stopChild(state.child);
      if (state.sidecarChild) stopChild(state.sidecarChild);
      state.child = null;
      state.sidecarChild = null;
      state.started = false;
      state.port = null;
      state.baseUrl = null;
      state.sidecarPort = null;
      state.logs = "";
    },
  };
}

export function interpolate(value, suite) {
  if (value == null) return value;
  if (typeof value !== "string") return value;
  const t = suite?.tokens?.() ?? { port: "", baseUrl: "", sidecarPort: "" };
  return value
    .replaceAll("{port}", t.port)
    .replaceAll("{baseUrl}", t.baseUrl)
    .replaceAll("{sidecarPort}", t.sidecarPort);
}

export function interpolateEnv(env, suite) {
  const out = {};
  for (const [key, value] of Object.entries(env ?? {})) {
    out[key] = interpolate(String(value), suite);
  }
  return out;
}

/**
 * Start a long-lived server into suite state. Waits for ready probe.
 */
export async function startSuiteServer(suite, options, cwd) {
  if (suite.started) {
    throw new Error("suite server already started — call stop first");
  }
  const port = await getFreePort();
  let sidecarPort;
  let sidecarChild;
  const startEnv = { ...(options.env ?? {}) };

  if (options.sidecar?.command) {
    sidecarPort = await getFreePort();
    const portEnvName = options.sidecar.portEnv ?? "SIDECAR_PORT";
    startEnv[portEnvName] = String(sidecarPort);
    for (const [key, value] of Object.entries(startEnv)) {
      startEnv[key] = String(value)
        .replaceAll("{sidecarPort}", String(sidecarPort))
        .replaceAll("{port}", String(port));
    }
    sidecarChild = spawn(interpolate(options.sidecar.command, { tokens: () => ({
      port: String(port),
      baseUrl: `http://127.0.0.1:${port}`,
      sidecarPort: String(sidecarPort),
    }) }), {
      cwd,
      env: {
        ...process.env,
        PORT: String(sidecarPort),
        ...interpolateEnv(options.sidecar.env, {
          tokens: () => ({
            port: String(port),
            baseUrl: `http://127.0.0.1:${port}`,
            sidecarPort: String(sidecarPort),
          }),
        }),
      },
      shell: true,
      detached: process.platform !== "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });
  }

  const command = String(options.command)
    .replaceAll("{port}", String(port))
    .replaceAll("{sidecarPort}", sidecarPort != null ? String(sidecarPort) : "");

  for (const [key, value] of Object.entries(startEnv)) {
    startEnv[key] = String(value)
      .replaceAll("{sidecarPort}", sidecarPort != null ? String(sidecarPort) : "")
      .replaceAll("{port}", String(port));
  }

  const child = spawn(command, {
    cwd,
    env: { ...process.env, PORT: String(port), ...startEnv },
    shell: true,
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });

  let logs = "";
  child.stdout.on("data", (chunk) => {
    logs += chunk;
  });
  child.stderr.on("data", (chunk) => {
    logs += chunk;
  });

  const baseUrl = `http://127.0.0.1:${port}`;
  const timeoutMs = options.timeoutMs ?? 15000;
  const ready = options.ready ?? { path: "/health", status: 200 };

  try {
    if (ready.stdoutContains) {
      await waitStdout( () => logs, ready.stdoutContains, timeoutMs);
    } else if (ready.path) {
      await waitHttpReady(baseUrl, ready, timeoutMs);
    } else {
      await sleep(300);
    }
  } catch (error) {
    stopChild(child);
    if (sidecarChild) stopChild(sidecarChild);
    throw new Error(`${error.message}; server output: ${logs.slice(0, 500)}`);
  }

  const s = suite._state;
  s.port = port;
  s.baseUrl = baseUrl;
  s.sidecarPort = sidecarPort ?? null;
  s.child = child;
  s.sidecarChild = sidecarChild ?? null;
  s.logs = logs;
  s.started = true;

  child.on("exit", () => {
    if (s.child === child) s.started = false;
  });

  return { port, baseUrl, sidecarPort };
}

export async function stopSuiteServer(suite) {
  if (!suite.started && !suite._state.child) {
    return { stopped: false, details: "no suite server running" };
  }
  await suite.cleanup();
  return { stopped: true, details: "stopped" };
}

export async function waitHttpReady(baseUrl, ready, timeoutMs) {
  const path = ready.path ?? "/";
  const wantStatus = ready.status ?? 200;
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: ready.method ?? "GET",
        signal: AbortSignal.timeout(Math.min(3000, Math.max(1, deadline - Date.now()))),
      });
      if (response.status === wantStatus) return;
      lastError = new Error(`ready ${path} status ${response.status}, want ${wantStatus}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(150);
  }
  throw new Error(`server did not become ready: ${lastError?.message ?? "timeout"}`);
}

async function waitStdout(getLogs, needle, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (String(getLogs()).includes(needle)) return;
    await sleep(100);
  }
  throw new Error(`server stdout did not contain ${JSON.stringify(needle)}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
