export type AllThisBootRoot = string | Element | null | undefined;

export type AllThisGuiAssets = {
  bootstrap?: string;
  css?: string;
  gui?: string;
  logo?: string;
  localReact?: string;
  localReactDom?: string;
  react?: string;
  reactDom?: string;
};

export type AllThisGuiCandidate = {
  label: string;
  source: "existing" | "local" | "monad" | "cdn" | "fallback";
  detail?: string;
  assets?: AllThisGuiAssets;
};

export type AllThisMeBoot = {
  status: "pending" | "initiated" | "error";
  seed: string;
  expression: string;
  memories: number;
  error: string;
};

export type AllThisMonadRoute = {
  id?: string;
  name?: string;
  endpoint: string;
  aliases?: string[];
  namespace?: string;
  status: "online" | "offline" | "stale";
  latency?: number;
  cost?: string;
  capabilities?: string[];
  raw?: any;
};

export type AllThisMonadsControlRecord = {
  name: string;
  port?: number;
  status: string;
  namespace?: string;
  endpoint?: string;
  healthy?: boolean;
  error?: string;
};

export type AllThisMonadsControlAction = {
  name: string;
  label?: string;
  command?: string;
  method?: string;
  path?: string;
  scope?: string;
};

export type AllThisMonadsControl = {
  available: boolean;
  endpoint: string;
  records: AllThisMonadsControlRecord[];
  actions: string[];
  commandActions: AllThisMonadsControlAction[];
  error: string;
  installCommand: string;
  startCommand: string;
};

export type AllThisGuiResolution = {
  status: "pending" | "resolving" | "resolved" | "offline";
  label: string;
  source: string;
  detail: string;
  logo?: string;
  error: string;
};

export type AllThisBootOptions = {
  root?: AllThisBootRoot;
  allowCdn?: boolean;
  meSeed?: string;
  meExpression?: string;
  meCandidates?: string[];
  guiCandidates?: AllThisGuiCandidate[];
  monadEndpoints?: string[];
  monadScanTimeoutMs?: number;
  rescan?: boolean;
  onStatus?: (status: AllThisBootStatus) => void;
};

export type AllThisBootStatus = {
  step: string;
  detail?: string;
  me?: AllThisMeBoot;
  gui?: AllThisGuiResolution;
  monads?: AllThisMonadRoute[];
};

export type AllThisBootResult = {
  GUI: any;
  me: any;
  monads: AllThisMonadRoute[];
  monadsControl: AllThisMonadsControl;
  spec: any;
  mount: any;
  meBoot: AllThisMeBoot;
  guiResolution: AllThisGuiResolution;
};

const BOOT_VERSION = "20260404-all-this-boot";
const DEFAULT_ME_SEED = "tetragrammaton";
const DEFAULT_ME_EXPRESSION = "local-me";
const DEFAULT_MONAD_SCAN_TIMEOUT_MS = 650;
const SCRIPT_LOADED_ATTR = "data-all-this-runtime-loaded";

const DEFAULT_ME_CANDIDATES = [
  "./me/npm/dist/me.umd.js",
  "me/npm/dist/me.umd.js",
  "/me/npm/dist/me.umd.js",
  "/me/me.umd.js",
];

const DEFAULT_LOCAL_GUI_CANDIDATES: AllThisGuiCandidate[] = [
  {
    label: "local GUI",
    source: "local",
    detail: "host build",
    assets: {
      bootstrap: "./packages/GUI/npm/dist/this.gui.bootstrap.umd.js",
      css: "./packages/GUI/npm/dist/styles.css",
      gui: "./packages/GUI/npm/dist/this.gui.umd.js",
      logo: "./packages/GUI/npm/dist/GUI.png",
      react: "./packages/GUI/npm/node_modules/react/umd/react.production.min.js",
      reactDom: "./packages/GUI/npm/node_modules/react-dom/umd/react-dom.production.min.js",
    },
  },
  {
    label: "served GUI",
    source: "local",
    detail: "served /gui",
    assets: {
      bootstrap: "/gui/this.gui.bootstrap.umd.js",
      css: "/gui/styles.css",
      gui: "/gui/this.gui.umd.js",
      logo: "/gui/GUI.png",
      react: "/vendor/react/react.production.min.js",
      reactDom: "/vendor/react-dom/react-dom.production.min.js",
    },
  },
];

const DEFAULT_CDN_GUI_CANDIDATE: AllThisGuiCandidate = {
  label: "cdn GUI",
  source: "cdn",
  detail: "last resort",
  assets: {
    bootstrap: "https://cdn.jsdelivr.net/npm/this.gui@2.1.7/dist/this.gui.bootstrap.umd.js",
    css: "https://cdn.jsdelivr.net/npm/this.gui@2.1.7/dist/styles.css",
    gui: "https://cdn.jsdelivr.net/npm/this.gui@2.1.7/dist/this.gui.umd.js",
    logo: "https://cdn.jsdelivr.net/npm/this.gui@2.1.7/dist/GUI.png",
    react: "https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js",
    reactDom: "https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js",
  },
};

const DEFAULT_MONAD_ENDPOINTS = [
  "http://127.0.0.1:8161",
  "http://localhost:8161",
];

const RESCAN_MONAD_ENDPOINTS = [
  "http://127.0.0.1:8161",
  "http://localhost:8161",
  "http://local.monad:8161",
  "http://127.0.0.1:8162",
  "http://localhost:8162",
  "http://127.0.0.1:8163",
  "http://localhost:8163",
  "http://127.0.0.1:8164",
  "http://localhost:8164",
  "http://127.0.0.1:8165",
  "http://localhost:8165",
];

const MONAD_INSTALL_GUIDE_PATH = "modules/monad/npm/README.md";
const MONAD_INSTALL_GUIDE_BASE = "modules/monad/npm/";

const pendingScripts = new Map<string, Promise<boolean>>();
const pendingStyles = new Map<string, Promise<boolean>>();
const MONAD_ENDPOINTS_STORAGE_KEY = "all.this.monadEndpoints";

function asGlobal(): any {
  return globalThis as any;
}

function isFileProtocol(): boolean {
  return typeof window !== "undefined" && window.location?.protocol === "file:";
}

function getStoredMonadEndpoints(): string[] {
  try {
    const raw = window.localStorage?.getItem(MONAD_ENDPOINTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeMonadEndpointInput).filter(Boolean) : [];
  } catch (_) {
    return [];
  }
}

function setStoredMonadEndpoints(endpoints: string[]) {
  try {
    const unique = Array.from(new Set(endpoints.map(normalizeMonadEndpointInput).filter(Boolean)));
    window.localStorage?.setItem(MONAD_ENDPOINTS_STORAGE_KEY, JSON.stringify(unique));
  } catch (_) {
    // localStorage may be unavailable under file:// or privacy settings.
  }
}

function normalizeMonadEndpointInput(value: unknown): string {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
  try {
    return new URL(withProtocol).href.replace(/\/+$/, "");
  } catch (_) {
    return "";
  }
}

function addStoredMonadEndpoint(endpoint: string): string {
  const normalized = normalizeMonadEndpointInput(endpoint);
  if (!normalized) return "";
  setStoredMonadEndpoints([...getStoredMonadEndpoints(), normalized]);
  return normalized;
}

function resolveMonadDiscoveryFactory(GUI: any): ((options?: Record<string, any>) => any) | null {
  const candidates = [
    GUI?.createMonadDiscovery,
    GUI?.createMonadDiscoveryStore,
    GUI?.runtime?.createMonadDiscovery,
    GUI?.Runtime?.createMonadDiscovery,
    GUI?.default?.createMonadDiscovery,
  ];
  return candidates.find((candidate) => typeof candidate === "function") || null;
}

function createAllThisMonadDiscovery(GUI: any, options: AllThisBootOptions): any | null {
  const factory = resolveMonadDiscoveryFactory(GUI);
  if (!factory) return null;
  return factory({
    endpoints: options.monadEndpoints,
    extendedPorts: [8161, 8162, 8163, 8164, 8165],
    storageKey: MONAD_ENDPOINTS_STORAGE_KEY,
    requestTimeoutMs: options.monadScanTimeoutMs || DEFAULT_MONAD_SCAN_TIMEOUT_MS,
    fastIntervalMs: 1000,
    stableIntervalMs: 15000,
    settlingWindowMs: 10000,
    enableSSE: true,
  });
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error ?? "Unknown error");
}

function readString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function readList(...values: unknown[]): string[] {
  for (const value of values) {
    if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
    if (typeof value === "string" && value.trim()) {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
    if (value && typeof value === "object") {
      return Object.keys(value as Record<string, unknown>).filter((key) => Boolean((value as any)[key]));
    }
  }
  return [];
}

function resolveRoot(root: AllThisBootRoot): Element {
  if (typeof root === "string") {
    const target = document.querySelector(root);
    if (!target) throw new Error(`[all.this] root not found: ${root}`);
    return target;
  }
  if (root) return root;
  const target = document.getElementById("root");
  if (!target) throw new Error("[all.this] root not found: #root");
  return target;
}

function notify(options: AllThisBootOptions, status: AllThisBootStatus) {
  asGlobal().__ALL_THIS_BOOT_STATUS__ = {
    ...status,
    version: BOOT_VERSION,
    at: Date.now(),
  };
  options.onStatus?.(status);
}

function ensureBootScreen(root: Element, title: string, detail: string) {
  if (!document.getElementById("all-this-boot-style")) {
    const style = document.createElement("style");
    style.id = "all-this-boot-style";
    style.textContent = `
      :root { color-scheme: dark; }
      body { margin: 0; background: rgb(5, 5, 5); color: #e8eaed; }
      .all-this-boot {
        min-height: 100vh;
        display: grid;
        align-items: center;
        padding: 24px;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, "Segoe UI", sans-serif;
      }
      .all-this-boot-panel {
        width: min(100%, 520px);
        border: 1px solid rgba(220, 224, 228, 0.12);
        background: rgba(12, 13, 15, 0.72);
        border-radius: 14px;
        padding: 18px;
        box-shadow: 0 18px 60px rgba(0, 0, 0, 0.32);
      }
      .all-this-boot-kicker {
        font: 11px/1.4 "SFMono-Regular", Menlo, Consolas, monospace;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: #8d949b;
        margin-bottom: 10px;
      }
      .all-this-boot-title {
        font: 14px/1.55 "SFMono-Regular", Menlo, Consolas, monospace;
        color: #f0f2f3;
      }
      .all-this-boot-detail {
        margin-top: 8px;
        color: #9da4aa;
        font-size: 13px;
        line-height: 1.6;
      }
    `;
    document.head.appendChild(style);
  }

  root.innerHTML = `
    <section class="all-this-boot">
      <div class="all-this-boot-panel">
        <div class="all-this-boot-kicker">all.this</div>
        <div class="all-this-boot-title">${escapeHtml(title)}</div>
        <div class="all-this-boot-detail">${escapeHtml(detail)}</div>
      </div>
    </section>
  `;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function loadScriptOnce(src: string): Promise<boolean> {
  if (!src) return Promise.reject(new Error("Missing script src"));
  if (pendingScripts.has(src)) return pendingScripts.get(src) as Promise<boolean>;

  const absoluteSrc = new URL(src, document.baseURI).href;
  const existing = Array.from(document.querySelectorAll("script[src]")).find(
    (node) => node instanceof HTMLScriptElement && node.src === absoluteSrc,
  ) as HTMLScriptElement | undefined;

  if (existing && existing.getAttribute(SCRIPT_LOADED_ATTR) === "true") {
    return Promise.resolve(true);
  }

  const promise = new Promise<boolean>((resolve, reject) => {
    const script = existing || document.createElement("script");
    if (!existing) {
      script.src = src;
      script.async = false;
      if (/^https?:/i.test(src)) script.crossOrigin = "anonymous";
    }
    script.onload = () => {
      script.setAttribute(SCRIPT_LOADED_ATTR, "true");
      resolve(true);
    };
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    if (!existing) document.head.appendChild(script);
  }).finally(() => {
    pendingScripts.delete(src);
  });

  pendingScripts.set(src, promise);
  return promise;
}

function loadStyleOnce(href: string): Promise<boolean> {
  if (!href) return Promise.resolve(false);
  if (pendingStyles.has(href)) return pendingStyles.get(href) as Promise<boolean>;

  const absoluteHref = new URL(href, document.baseURI).href;
  const existing = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(
    (node) => node instanceof HTMLLinkElement && node.href === absoluteHref,
  ) as HTMLLinkElement | undefined;

  if (existing && existing.getAttribute(SCRIPT_LOADED_ATTR) === "true") return Promise.resolve(true);

  const promise = new Promise<boolean>((resolve, reject) => {
    const link = existing || document.createElement("link");
    if (!existing) {
      link.rel = "stylesheet";
      link.href = href;
      if (/^https?:/i.test(href)) link.crossOrigin = "anonymous";
    }
    link.onload = () => {
      link.setAttribute(SCRIPT_LOADED_ATTR, "true");
      resolve(true);
    };
    link.onerror = () => reject(new Error(`Failed to load css: ${href}`));
    if (!existing) document.head.appendChild(link);
  }).finally(() => {
    pendingStyles.delete(href);
  });

  pendingStyles.set(href, promise);
  return promise;
}

function resolveMeCtor(): any {
  const global = asGlobal();
  const candidates = [global.Me, global.ME, (globalThis as any).Me, (globalThis as any).ME];

  for (const candidate of candidates) {
    if (typeof candidate === "function") return candidate;
    if (candidate && typeof candidate.ME === "function") return candidate.ME;
    if (candidate && typeof candidate.default === "function") return candidate.default;
    if (candidate?.default && typeof candidate.default.ME === "function") return candidate.default.ME;
  }
  return null;
}

export async function resolveMeKernel(options: AllThisBootOptions = {}): Promise<{ me: any; boot: AllThisMeBoot }> {
  const seed = options.meSeed || DEFAULT_ME_SEED;
  const expression = options.meExpression || DEFAULT_ME_EXPRESSION;
  const boot: AllThisMeBoot = {
    status: "pending",
    seed,
    expression,
    memories: 0,
    error: "",
  };

  const candidates = options.meCandidates?.length ? options.meCandidates : DEFAULT_ME_CANDIDATES;
  let ctor = resolveMeCtor();
  let lastError: unknown = null;

  if (typeof ctor !== "function") {
    for (const src of candidates) {
      try {
        await loadScriptOnce(src);
        ctor = resolveMeCtor();
        if (typeof ctor === "function") break;
        lastError = new Error(`.me loaded without exposing a constructor: ${src}`);
      } catch (error) {
        lastError = error;
      }
    }
  }

  if (typeof ctor !== "function") {
    boot.status = "error";
    boot.error = errorMessage(lastError || new Error(".me runtime unavailable"));
    return { me: null, boot };
  }

  try {
    const me = new ctor(seed);
    if (typeof me?.["@"] === "function") me["@"](expression);
    const inspected = typeof me?.inspect === "function" ? me.inspect({ last: 8 }) : null;
    boot.status = "initiated";
    boot.memories = Array.isArray(inspected?.memories) ? inspected.memories.length : 1;
    asGlobal().me = me;
    asGlobal().__ALL_THIS_ME__ = me;
    asGlobal().__ALL_THIS_ME_BOOT__ = boot;
    return { me, boot };
  } catch (error) {
    boot.status = "error";
    boot.error = errorMessage(error);
    return { me: null, boot };
  }
}

function withTimeout(ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { controller, timer };
}

function endpointFromSurface(surface: any, fallback: string): string {
  return readString(
    surface?.endpoint,
    surface?.url,
    surface?.origin,
    surface?.transport?.endpoint,
    surface?.surfaceEntry?.endpoint,
    fallback,
  ).replace(/\/+$/, "");
}

function normalizeSurface(surface: any, fallbackEndpoint: string, latency: number): AllThisMonadRoute {
  const endpoint = endpointFromSurface(surface, fallbackEndpoint);
  const monadId = readString(
    surface?.monadId,
    surface?.monad?.id,
    surface?.id,
    surface?.surfaceEntry?.monadId,
    surface?.surfaceEntry?.monad?.id,
    surface?.surfaceEntry?.id,
    endpoint,
  );
  const monadName = readString(
    surface?.monadName,
    surface?.monad?.name,
    surface?.name,
    surface?.surfaceEntry?.monadName,
    surface?.surfaceEntry?.monad?.name,
    surface?.identity,
  );
  return {
    id: monadId,
    name: monadName,
    endpoint,
    aliases: [endpoint],
    namespace: readString(surface?.namespace, surface?.rootspace, surface?.surfaceEntry?.namespace),
    status: "online",
    latency,
    cost: readString(surface?.cost, surface?.operationalCost, surface?.route?.cost) || inferCost(endpoint),
    capabilities: readList(surface?.capabilities, surface?.features, surface?.surfaceEntry?.capabilities),
    raw: surface,
  };
}

function inferCost(endpoint: string): string {
  if (/127\.0\.0\.1|localhost|local\.monad/i.test(endpoint)) return "low";
  return "medium";
}

function endpointIdentity(value: string): { host: string; port: string; key: string } {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const port = url.port || (url.protocol === "https:" ? "443" : url.protocol === "http:" ? "80" : "");
    const identityHost = isLoopbackHost(host) ? "local" : host;
    return {
      host,
      port,
      key: `${url.protocol}//${identityHost}${port ? `:${port}` : ""}`,
    };
  } catch (_) {
    const clean = String(value || "").trim().toLowerCase().replace(/\/+$/, "");
    return { host: "", port: "", key: clean };
  }
}

function isLoopbackHost(host: string): boolean {
  const normalized = String(host || "").trim().toLowerCase().replace(/^\[|\]$/g, "");
  return (
    normalized === "localhost" ||
    normalized === "local.monad" ||
    normalized === "::1" ||
    normalized === "0.0.0.0" ||
    /^127(?:\.\d{1,3}){3}$/.test(normalized)
  );
}

function normalizeIdentityPart(value: unknown): string {
  return String(value || "").trim().toLowerCase().replace(/\/+$/, "");
}

function stableMonadId(monad: AllThisMonadRoute): string {
  const id = readString(
    monad.id,
    monad.raw?.monadId,
    monad.raw?.monad?.id,
    monad.raw?.surfaceEntry?.monadId,
    monad.raw?.surfaceEntry?.monad?.id,
  );
  return /^https?:\/\//i.test(id) ? "" : id;
}

function monadIdentityKey(monad: AllThisMonadRoute): string {
  const stableId = stableMonadId(monad);
  if (stableId) return `id:${normalizeIdentityPart(stableId)}`;

  const endpoint = endpointIdentity(monad.endpoint);
  const namespace = endpointIdentity(
    readString(monad.namespace, monad.raw?.namespace, monad.raw?.surfaceEntry?.namespace),
  ).key;
  const name = normalizeIdentityPart(
    readString(
      monad.name,
      monad.raw?.monadName,
      monad.raw?.monad?.name,
      monad.raw?.surfaceEntry?.monadName,
      monad.raw?.surfaceEntry?.monad?.name,
    ),
  );

  if (name && endpoint.port) {
    return `name:${name}:${namespace || endpoint.key}:${endpoint.port}`;
  }

  return `endpoint:${endpoint.key}`;
}

function monadScore(monad: AllThisMonadRoute): number {
  const endpoint = endpointIdentity(monad.endpoint);
  const localityBonus = isLoopbackHost(endpoint.host) ? 0 : 18;
  return Number(monad.latency ?? 999) + costRank(monad.cost) + localityBonus;
}

function mergeCapabilities(a: AllThisMonadRoute, b: AllThisMonadRoute): string[] {
  return Array.from(new Set([...(a.capabilities || []), ...(b.capabilities || [])].filter(Boolean)));
}

function mergeAliases(a: AllThisMonadRoute, b: AllThisMonadRoute): string[] {
  return Array.from(new Set([...(a.aliases || []), ...(b.aliases || []), a.endpoint, b.endpoint].filter(Boolean)));
}

function mergeMonadRoutes(a: AllThisMonadRoute, b: AllThisMonadRoute): AllThisMonadRoute {
  const primary = monadScore(b) < monadScore(a) ? b : a;
  const secondary = primary === b ? a : b;
  const aliases = mergeAliases(a, b);
  return {
    ...primary,
    id: readString(stableMonadId(primary), stableMonadId(secondary), primary.id, secondary.id, primary.name, primary.endpoint),
    name: readString(primary.name, secondary.name),
    namespace: readString(primary.namespace, secondary.namespace),
    capabilities: mergeCapabilities(primary, secondary),
    aliases,
    raw: {
      ...(primary.raw || {}),
      aliases,
      canonicalKey: monadIdentityKey(primary),
    },
  };
}

export function reduceMonadRoutes(routes: AllThisMonadRoute[]): AllThisMonadRoute[] {
  const reduced = new Map<string, AllThisMonadRoute>();
  for (const route of routes) {
    const key = monadIdentityKey(route);
    const existing = reduced.get(key);
    reduced.set(
      key,
      existing
        ? mergeMonadRoutes(existing, route)
        : { ...route, aliases: route.aliases?.length ? route.aliases : [route.endpoint] },
    );
  }
  return Array.from(reduced.values()).sort((a, b) => monadScore(a) - monadScore(b));
}

async function probeMonadEndpoint(endpoint: string, timeoutMs: number): Promise<AllThisMonadRoute | null> {
  const cleanEndpoint = endpoint.replace(/\/+$/, "");
  const startedAt = Date.now();
  const { controller, timer } = withTimeout(timeoutMs);
  try {
    const response = await fetch(`${cleanEndpoint}/__surface`, {
      method: "GET",
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const surface = await response.json();
    return normalizeSurface(surface, cleanEndpoint, Date.now() - startedAt);
  } catch (_) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function resolveMonadProvider(options: AllThisBootOptions = {}): Promise<AllThisMonadRoute[]> {
  const manualEndpoints = getStoredMonadEndpoints();
  const defaultEndpoints = options.rescan ? RESCAN_MONAD_ENDPOINTS : DEFAULT_MONAD_ENDPOINTS;
  const endpoints = [
    ...manualEndpoints,
    ...(options.monadEndpoints?.length ? options.monadEndpoints : defaultEndpoints),
  ];
  const timeoutMs = Math.max(250, Number(options.monadScanTimeoutMs || DEFAULT_MONAD_SCAN_TIMEOUT_MS));
  const seen = new Set<string>();
  const uniqueEndpoints = endpoints
    .map(normalizeMonadEndpointInput)
    .filter((endpoint) => endpoint && !seen.has(endpoint) && seen.add(endpoint));
  const results = await Promise.all(uniqueEndpoints.map((endpoint) => probeMonadEndpoint(endpoint, timeoutMs)));
  return reduceMonadRoutes(results.filter(Boolean) as AllThisMonadRoute[]);
}

async function fetchJsonWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 1200): Promise<any> {
  const { controller, timer } = withTimeout(timeoutMs);
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        accept: "application/json",
        ...(init.body ? { "content-type": "application/json" } : {}),
        ...(init.headers || {}),
      },
      signal: controller.signal,
    });
    const payload = await response.json().catch(async () => ({ text: await response.text().catch(() => "") }));
    if (!response.ok) {
      throw new Error(payload?.error || payload?.message || `HTTP ${response.status}`);
    }
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

function monadsControlUnavailable(endpoint = "", error = ""): AllThisMonadsControl {
  return {
    available: false,
    endpoint,
    records: [],
    actions: [],
    commandActions: [],
    error,
    installCommand: "npm install -g monad.ai",
    startCommand: "monads start",
  };
}

function normalizeMonadsControlAction(value: any): AllThisMonadsControlAction | null {
  const name = readString(value?.name, value);
  if (!name) return null;
  return {
    name,
    label: readString(value?.label),
    command: readString(value?.command),
    method: readString(value?.method),
    path: readString(value?.path),
    scope: readString(value?.scope),
  };
}

function normalizeMonadsControlActions(command: any): AllThisMonadsControlAction[] {
  const explicit = Array.isArray(command?.actions)
    ? command.actions.map(normalizeMonadsControlAction).filter(Boolean) as AllThisMonadsControlAction[]
    : [];
  if (explicit.length) return explicit;
  return [
    { name: "list", label: "List", command: "monads list" },
    { name: "start", label: "Start New", command: "monads start [name]" },
    { name: "stop", label: "Stop", command: "monads stop <name>" },
    { name: "status", label: "Status", command: "monads status <name>" },
    { name: "logs", label: "Logs", command: "monads logs <name> --tail" },
  ];
}

function normalizeMonadsControlRecord(value: any): AllThisMonadsControlRecord | null {
  const name = readString(value?.name, value?.record?.name);
  if (!name) return null;
  return {
    name,
    port: Number(value?.port ?? value?.record?.port) || undefined,
    status: readString(value?.status, value?.state) || "unknown",
    namespace: readString(value?.namespace, value?.record?.namespace),
    endpoint: readString(value?.endpoint, value?.record?.endpoint),
    healthy: Boolean(value?.healthy),
    error: readString(value?.error),
  };
}

export async function resolveMonadsControl(monad: AllThisMonadRoute | null): Promise<AllThisMonadsControl> {
  if (!monad?.endpoint) {
    return monadsControlUnavailable("", "No local monad is exposing the web control panel.");
  }

  const endpoint = monad.endpoint.replace(/\/+$/, "");
  try {
    const payload = await fetchJsonWithTimeout(`${endpoint}/__monads`, {}, 1400);
    const records = (Array.isArray(payload?.monads) ? payload.monads : [])
      .map(normalizeMonadsControlRecord)
      .filter(Boolean) as AllThisMonadsControlRecord[];
    const command = payload?.command || {};
    const commandActions = normalizeMonadsControlActions(command);
    return {
      available: true,
      endpoint,
      records,
      actions: commandActions.map((action) => action.name),
      commandActions,
      error: "",
      installCommand: readString(command.install) || "npm install -g monad.ai",
      startCommand: readString(command.start) || "monads start",
    };
  } catch (error) {
    return monadsControlUnavailable(endpoint, errorMessage(error));
  }
}

function monadsFromDiscoveryState(state: any): AllThisMonadRoute[] {
  const monads = Array.isArray(state?.monads) ? state.monads : [];
  return monads
    .map((monad: any): AllThisMonadRoute | null => {
      const endpoint = normalizeMonadEndpointInput(monad?.endpoint || monad?.endpoints?.[0]);
      if (!endpoint) return null;
      return {
        id: readString(monad?.id, endpoint),
        name: readString(monad?.name, monad?.namespace, endpoint),
        endpoint,
        aliases: Array.isArray(monad?.endpoints) ? monad.endpoints.map(normalizeMonadEndpointInput).filter(Boolean) : [endpoint],
        namespace: readString(monad?.namespace),
        status: monad?.healthy === false ? "offline" : "online",
        cost: inferCost(endpoint),
        capabilities: Array.isArray(monad?.capabilities) ? monad.capabilities : [],
        raw: monad,
      };
    })
    .filter(Boolean) as AllThisMonadRoute[];
}

function monadsControlFromDiscoveryState(state: any): AllThisMonadsControl {
  const controls = Array.isArray(state?.control) ? state.control : [];
  const control = controls.find((entry: any) => entry?.available) || controls[0];
  if (!control?.available || !control?.endpoint) {
    const bestEndpoint = readString(state?.source?.surface?.[0], state?.endpoints?.find?.((endpoint: any) => endpoint?.status === "alive")?.url);
    return monadsControlUnavailable(bestEndpoint, "No local monad is exposing the web control panel.");
  }
  const commandActions = normalizeMonadsControlActions(control.command);
  const records = (Array.isArray(control.records) ? control.records : [])
    .map(normalizeMonadsControlRecord)
    .filter(Boolean) as AllThisMonadsControlRecord[];
  return {
    available: true,
    endpoint: normalizeMonadEndpointInput(control.endpoint),
    records,
    actions: commandActions.map((action) => action.name),
    commandActions,
    error: readString(control.error),
    installCommand: readString(control.command?.install) || "npm install -g monad.ai",
    startCommand: readString(control.command?.start) || "monads start",
  };
}

function costRank(cost: unknown): number {
  const normalized = String(cost || "").toLowerCase();
  if (normalized.includes("low") || normalized.includes("bajo")) return 0;
  if (normalized.includes("medium") || normalized.includes("medio")) return 100;
  if (normalized.includes("high") || normalized.includes("alto")) return 220;
  return 140;
}

export function recommendedMonad(monads: AllThisMonadRoute[]): AllThisMonadRoute | null {
  return [...monads].sort((a, b) => monadScore(a) - monadScore(b))[0] ?? null;
}

function monadGuiAssets(monad: AllThisMonadRoute): AllThisGuiAssets | null {
  const endpoint = String(monad.endpoint || "").replace(/\/+$/, "");
  if (!endpoint) return null;
  const manifest =
    monad.raw?.gui ||
    monad.raw?.GUI ||
    monad.raw?.assets?.gui ||
    monad.raw?.assets?.GUI ||
    monad.raw?.runtime?.gui ||
    monad.raw?.runtimes?.gui ||
    {};

  const assetUrl = (value: unknown, fallback: string) => {
    const asset = String(value || "").trim();
    if (!asset) return fallback;
    if (/^https?:\/\//i.test(asset)) return asset;
    if (asset.startsWith("/")) return `${endpoint}${asset}`;
    return `${endpoint}/${asset.replace(/^\.?\//, "")}`;
  };

  return {
    bootstrap: assetUrl(readString(manifest.bootstrap, manifest.bootstrapSrc, manifest.boot), `${endpoint}/gui/this.gui.bootstrap.umd.js`),
    css: assetUrl(readString(manifest.css, manifest.styles, manifest.style), `${endpoint}/gui/styles.css`),
    gui: assetUrl(readString(manifest.gui, manifest.runtime, manifest.umd), `${endpoint}/gui/this.gui.umd.js`),
    logo: assetUrl(readString(manifest.logo, manifest.brandLogo, manifest.image), `${endpoint}/gui/GUI.png`),
    react: assetUrl(readString(manifest.react), `${endpoint}/vendor/react/react.production.min.js`),
    reactDom: assetUrl(readString(manifest.reactDom, manifest.reactDOM), `${endpoint}/vendor/react-dom/react-dom.production.min.js`),
  };
}

function resolveGuiRuntime(): any {
  const global = asGlobal();
  const candidates = [
    global.GUI,
    global.ThisGUI,
    global.thisGUI,
    global["this.gui"],
    (globalThis as any).GUI,
    (globalThis as any).ThisGUI,
  ];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;
    if (typeof candidate.mount === "function" || typeof candidate.startApp === "function") return candidate;
    if (candidate.default && typeof candidate.default === "object") {
      if (typeof candidate.default.mount === "function" || typeof candidate.default.startApp === "function") {
        return candidate.default;
      }
    }
  }
  return null;
}

function guiCandidatesFromMonads(monads: AllThisMonadRoute[]): AllThisGuiCandidate[] {
  const preferred = recommendedMonad(monads);
  const ordered = [
    ...(preferred ? [preferred] : []),
    ...monads.filter((monad) => monad.endpoint !== preferred?.endpoint),
  ];
  return ordered
    .map((monad) => {
      const assets = monadGuiAssets(monad);
      if (!assets) return null;
      return {
        label: `${displayMonadName(monad)} GUI`,
        source: "monad" as const,
        detail: "served by monad",
        assets,
      };
    })
    .filter(Boolean) as AllThisGuiCandidate[];
}

async function resolveGuiCandidate(candidate: AllThisGuiCandidate): Promise<any> {
  if (candidate.source === "existing") {
    const existing = resolveGuiRuntime();
    if (existing) return existing;
    throw new Error("Existing GUI runtime not found");
  }

  const assets = candidate.assets || {};
  if (!assets.bootstrap || !assets.gui) throw new Error(`GUI candidate missing assets: ${candidate.label}`);

  const global = asGlobal();
  global.process ||= { env: {} };
  global.process.env ||= {};
  global.process.env.NODE_ENV ||= "production";
  global.__THIS_GUI_DISABLE_AUTOBOOT__ = true;
  global.__THIS_GUI_BOOTSTRAP_ASSETS__ = {
    css: assets.css,
    gui: assets.gui,
    localReact: assets.localReact || assets.react,
    localReactDom: assets.localReactDom || assets.reactDom,
    react: assets.react,
    reactDom: assets.reactDom,
  };

  if (!global.React && (assets.localReact || assets.react)) {
    await loadScriptOnce(assets.localReact || assets.react || "");
  }
  if (!global.ReactDOM && (assets.localReactDom || assets.reactDom)) {
    await loadScriptOnce(assets.localReactDom || assets.reactDom || "");
  }
  if (!global.ReactJSXRuntime && global.React && typeof global.React.createElement === "function") {
    global.ReactJSXRuntime = {
      jsx: global.React.createElement,
      jsxs: global.React.createElement,
      Fragment: global.React.Fragment,
    };
  }

  if (isFileProtocol()) {
    if (assets.css) {
      await loadStyleOnce(assets.css).catch(() => false);
    }
    await loadScriptOnce(assets.gui);
    const GUI = resolveGuiRuntime();
    if (!GUI || (typeof GUI.mount !== "function" && typeof GUI.startApp !== "function")) {
      throw new Error(`GUI runtime unavailable after loading ${candidate.label}`);
    }
    return GUI;
  }

  await loadScriptOnce(assets.bootstrap);
  const bootstrap =
    typeof global.bootGUI === "function"
      ? global.bootGUI
      : typeof global.GUI?.bootstrap === "function"
        ? global.GUI.bootstrap
        : null;
  const GUI = bootstrap ? await bootstrap(global.__THIS_GUI_BOOTSTRAP_ASSETS__) : resolveGuiRuntime();
  if (!GUI || (typeof GUI.mount !== "function" && typeof GUI.startApp !== "function")) {
    throw new Error(`GUI runtime unavailable after loading ${candidate.label}`);
  }
  return GUI;
}

export async function resolveGUI(
  options: AllThisBootOptions & { monads?: AllThisMonadRoute[] } = {},
): Promise<{ GUI: any; resolution: AllThisGuiResolution }> {
  const existing = resolveGuiRuntime();
  if (existing) {
    return {
      GUI: existing,
      resolution: {
        status: "resolved",
        label: "existing GUI",
        source: "existing",
        detail: "already loaded",
        error: "",
      },
    };
  }

  const candidates = [
    ...(options.guiCandidates || []),
    ...DEFAULT_LOCAL_GUI_CANDIDATES.filter((candidate) => {
      const bootstrap = candidate.assets?.bootstrap || "";
      return !isFileProtocol() || !bootstrap.startsWith("/");
    }),
    ...guiCandidatesFromMonads(options.monads || []),
    ...(options.allowCdn === false ? [] : [DEFAULT_CDN_GUI_CANDIDATE]),
  ];
  const seen = new Set<string>();
  const uniqueCandidates = candidates.filter((candidate) => {
    const key = candidate.assets?.bootstrap || candidate.assets?.gui || candidate.label;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const failures: string[] = [];
  for (const candidate of uniqueCandidates) {
    try {
      const GUI = await resolveGuiCandidate(candidate);
      const resolution: AllThisGuiResolution = {
        status: "resolved",
        label: candidate.label,
        source: candidate.source,
        detail: candidate.detail || "",
        logo: candidate.assets?.logo,
        error: "",
      };
      asGlobal().__ALL_THIS_GUI__ = GUI;
      asGlobal().__ALL_THIS_GUI_RESOLUTION__ = resolution;
      return { GUI, resolution };
    } catch (error) {
      failures.push(`${candidate.label}: ${errorMessage(error)}`);
    }
  }

  const resolution: AllThisGuiResolution = {
    status: "offline",
    label: "GUI",
    source: "unresolved",
    detail: "not resolved",
    error: failures.length ? failures.join("\n") : "GUI unavailable",
  };
  asGlobal().__ALL_THIS_GUI_RESOLUTION__ = resolution;
  throw new Error(resolution.error);
}

function guiNode(type: string, props: Record<string, any> = {}, children?: any): any {
  const node: any = { type, props: { ...props } };
  if (children !== undefined) node.children = children;
  return node;
}

function guiText(text: string, props: Record<string, any> = {}): any {
  return guiNode("Typography", { text, ...props });
}

function displayMonadName(monad: AllThisMonadRoute | null | undefined): string {
  const raw = String(monad?.name || monad?.id || "").trim();
  if (raw) return raw.replace(/^monad[-_]?/i, "") || raw;
  if (monad?.endpoint) {
    try {
      const url = new URL(monad.endpoint);
      return url.port || url.hostname;
    } catch (_) {
      return monad.endpoint;
    }
  }
  return "monad";
}

function resolveGuiMonadComponent(GUI: any): any {
  return GUI?.Monad || GUI?.widgets?.Monad || GUI?.Widgets?.Monad || GUI?.default?.Monad || null;
}

function hashString(value: unknown): number {
  const text = String(value || "");
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

function avatarColors(seed: unknown) {
  const hash = hashString(seed);
  const hue = hash % 360;
  return {
    primary: `hsl(${hue} 18% 76%)`,
    secondary: `hsl(${(hue + 42) % 360} 16% 50%)`,
  };
}

function guiPixelAvatar(seed: unknown): any {
  const hash = hashString(seed);
  const colors = avatarColors(seed);
  const cells = [];
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const mirrorCol = col > 2 ? 4 - col : col;
      const bitIndex = row * 3 + mirrorCol;
      const active = ((hash >> bitIndex) & 1) === 1 || (row === 2 && col === 2);
      cells.push(guiNode("Box", {
        component: "span",
        sx: {
          borderRadius: "1px",
          bgcolor: active ? (((hash >> (bitIndex + 8)) & 1) ? colors.secondary : colors.primary) : "transparent",
          opacity: active ? 1 : 0,
        },
      }));
    }
  }
  return guiNode("Box", {
    sx: {
      width: 62,
      height: 62,
      borderRadius: "50%",
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      gridTemplateRows: "repeat(5, 1fr)",
      gap: "3px",
      p: "18px",
      border: "1px solid",
      borderColor: "divider",
      background:
        "radial-gradient(circle at 34% 26%, rgba(231,238,240,0.14), transparent 20%), radial-gradient(circle at 64% 72%, rgba(0,0,0,0.62), transparent 42%), #111316",
      imageRendering: "pixelated",
    },
  }, cells);
}

function guiMonadAiBubble(GUI: any, seed: unknown, kind: "me" | "monad", sx: Record<string, any> = {}): any {
  const React = asGlobal().React;
  const MonadComponent = resolveGuiMonadComponent(GUI);
  if (!React || typeof React.createElement !== "function" || typeof MonadComponent !== "function") {
    return guiPixelAvatar(seed);
  }
  return guiNode("Box", {
    sx: {
      position: "relative",
      minHeight: 132,
      display: "grid",
      placeItems: "center",
      overflow: "hidden",
      ...sx,
    },
    children: React.createElement(MonadComponent, {
      variant: "bubble",
      mode: "contained",
      kind,
      seed: String(seed || ""),
    }),
  });
}

function guiStatusCard({ title, subtitle, state, chips = [], body = [], actions = [] }: {
  title: string;
  subtitle?: string;
  state?: string;
  chips?: string[];
  body?: any[];
  actions?: any[];
}) {
  return guiNode("Paper", {
    variant: "outlined",
    sx: {
      minWidth: 0,
      p: { xs: 1.5, sm: 2 },
      display: "grid",
      gap: 1.25,
      bgcolor: "background.paper",
    },
  }, [
    guiNode("Box", {
      sx: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 1.25,
      },
    }, [
      guiNode("Box", { sx: { minWidth: 0 } }, [
        guiText(title, { variant: "subtitle1", sx: { fontWeight: 500, lineHeight: 1.35 } }),
        subtitle ? guiText(subtitle, { variant: "body2", sx: { color: "text.secondary", lineHeight: 1.5 } }) : null,
      ].filter(Boolean)),
      state ? guiNode("Chip", { label: state, size: "small", variant: "outlined" }) : null,
    ].filter(Boolean)),
    chips.length
      ? guiNode("Box", { sx: { display: "flex", gap: 0.75, flexWrap: "wrap" } },
        chips.map((chip) => guiNode("Chip", { label: chip, size: "small" })))
      : null,
    ...body,
    actions.length ? guiNode("Box", { sx: { display: "flex", gap: 1, flexWrap: "wrap" } }, actions) : null,
  ].filter(Boolean));
}

function browserConfirm(message: string): boolean {
  const confirmFn = (globalThis as any).confirm;
  return typeof confirmFn === "function" ? Boolean(confirmFn(message)) : true;
}

function browserPrompt(message: string, fallback = ""): string | null {
  const promptFn = (globalThis as any).prompt;
  return typeof promptFn === "function" ? promptFn(message, fallback) : null;
}

const INFO_MODAL_ID = "all-this-info-modal";

function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*[mGKHF]/g, "");
}

function showInfoModal(title: string, content: string): void {
  document.getElementById(INFO_MODAL_ID)?.remove();

  const overlay = document.createElement("div");
  overlay.id = INFO_MODAL_ID;
  overlay.setAttribute(
    "style",
    "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.72);display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box",
  );

  const close = () => {
    document.getElementById(INFO_MODAL_ID)?.remove();
    document.removeEventListener("keydown", handleKey);
  };
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") close();
  };
  document.addEventListener("keydown", handleKey);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  overlay.innerHTML = `
    <div style="background:#111316;border:1px solid rgba(255,255,255,0.1);border-radius:12px;width:min(100%,780px);max-height:82vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.5)">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.08);flex-shrink:0">
        <span style="font:500 13px/1 -apple-system,BlinkMacSystemFont,'SF Pro Text',Inter,sans-serif;color:#e8eaed">${escapeHtml(title)}</span>
        <button data-modal-close style="background:none;border:none;cursor:pointer;color:#9da4aa;font-size:16px;line-height:1;padding:3px 7px;border-radius:4px">✕</button>
      </div>
      <pre style="flex:1;overflow:auto;margin:0;padding:16px 18px;font:12px/1.65 'SFMono-Regular',Menlo,Consolas,monospace;color:#c9d1d9;white-space:pre-wrap;word-break:break-all;min-height:0;background:rgba(0,0,0,0.18)">${escapeHtml(stripAnsi(content))}</pre>
      <div style="padding:10px 18px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:flex-end;flex-shrink:0">
        <button data-modal-close style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:#e8eaed;cursor:pointer;border-radius:6px;padding:6px 18px;font:13px -apple-system,BlinkMacSystemFont,'SF Pro Text',Inter,sans-serif">Close</button>
      </div>
    </div>
  `;

  overlay.querySelectorAll("[data-modal-close]").forEach((btn) => {
    btn.addEventListener("click", close);
  });

  document.body.appendChild(overlay);
}

function showMonadsInstallHelp(control: AllThisMonadsControl) {
  const needsRestart = /PATH_NOT_FOUND|404|NOT_FOUND/i.test(control.error || "");
  showInfoModal(
    "monads install",
    [
      needsRestart
        ? "monads web control is not exposed by this local monad yet."
        : "monads command not detected from this surface.",
      "",
      needsRestart ? "Rebuild/restart your local monad.ai, then rescan." : "Install:",
      needsRestart ? "" : control.installCommand,
      "",
      "Start:",
      control.startCommand,
      "",
      control.error ? `Detail: ${control.error}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

function refreshAfterMonadControl(onRescan?: () => void) {
  if (typeof onRescan === "function") {
    onRescan();
  }
}

async function runMonadsControlAction(
  control: AllThisMonadsControl,
  path: string,
  init: RequestInit,
  onRescan?: () => void,
) {
  if (!control.available || !control.endpoint) {
    showMonadsInstallHelp(control);
    return null;
  }
  try {
    const payload = await fetchJsonWithTimeout(`${control.endpoint}${path}`, init, 15000);
    refreshAfterMonadControl(onRescan);
    return payload;
  } catch (error) {
    showInfoModal("monads control error", errorMessage(error));
    return null;
  }
}

async function runMonadLifecycleAction(
  control: AllThisMonadsControl,
  path: string,
  onRescan?: () => void,
  discovery?: any,
  init: RequestInit = { method: "POST" },
) {
  const task = () => runMonadsControlAction(control, path, init, onRescan);
  if (discovery && typeof discovery.withSettling === "function") {
    await discovery.withSettling(task);
    return;
  }
  await task();
}

async function startMonadFromWeb(control: AllThisMonadsControl, onRescan?: () => void, discovery?: any) {
  if (!control.available) {
    showMonadsInstallHelp(control);
    return;
  }
  const name = browserPrompt("Monad name (blank = auto):", "");
  if (name === null) return;
  const rawPort = browserPrompt("Port (blank = auto):", "");
  if (rawPort === null) return;
  const port = rawPort.trim() ? Number(rawPort.trim()) : undefined;
  if (port !== undefined && (!Number.isInteger(port) || port < 1 || port > 65535)) {
    showInfoModal("invalid port", "Port must be a number from 1 to 65535.");
    return;
  }
  const task = () => runMonadsControlAction(control, "/__monads/start", {
    method: "POST",
    body: JSON.stringify({
      name: name.trim() || undefined,
      port,
    }),
  }, onRescan);
  if (discovery && typeof discovery.withSettling === "function") {
    await discovery.withSettling(task);
    return;
  }
  await task();
}

function addManualMonadEndpoint(onRescan?: () => void, discovery?: any) {
  const value = browserPrompt("Monad endpoint:", "http://127.0.0.1:8161");
  if (value === null) return;
  const endpoint = addStoredMonadEndpoint(value);
  if (!endpoint) {
    showInfoModal("invalid endpoint", "That endpoint does not look valid.");
    return;
  }
  if (discovery && typeof discovery.addEndpoint === "function") {
    discovery.addEndpoint(endpoint);
  } else {
    refreshAfterMonadControl(onRescan);
  }
}

function clearManualMonadEndpoints(onRescan?: () => void, discovery?: any) {
  const manual = getStoredMonadEndpoints();
  setStoredMonadEndpoints([]);
  if (discovery && typeof discovery.removeEndpoint === "function") {
    manual.forEach((endpoint) => discovery.removeEndpoint(endpoint));
  } else {
    refreshAfterMonadControl(onRescan);
  }
}

function showMonadsCommandHelp(control: AllThisMonadsControl) {
  const lines = control.commandActions
    .map((action) => action.command || action.name)
    .filter(Boolean);
  showInfoModal(
    "monads commands",
    [
      "Available from this local monad:",
      "",
      ...(lines.length ? lines : [control.startCommand]),
    ].join("\n"),
  );
}

async function onMonadFromWeb(
  control: AllThisMonadsControl,
  record: AllThisMonadsControlRecord,
  onRescan?: () => void,
  discovery?: any,
) {
  await runMonadLifecycleAction(
    control,
    monadsControlActionPath(control, record, "on", "resume", "start"),
    onRescan,
    discovery,
  );
}

async function pauseMonadFromWeb(
  control: AllThisMonadsControl,
  record: AllThisMonadsControlRecord,
  onRescan?: () => void,
  discovery?: any,
) {
  await runMonadLifecycleAction(control, monadsControlActionPath(control, record, "pause"), onRescan, discovery);
}

async function restartMonadFromWeb(
  control: AllThisMonadsControl,
  record: AllThisMonadsControlRecord,
  onRescan?: () => void,
  discovery?: any,
) {
  if (!browserConfirm(`Restart ${record.name}?`)) return;
  await runMonadLifecycleAction(control, monadsControlActionPath(control, record, "restart"), onRescan, discovery);
}

async function offMonadFromWeb(
  control: AllThisMonadsControl,
  record: AllThisMonadsControlRecord,
  onRescan?: () => void,
  discovery?: any,
) {
  if (!browserConfirm(`Turn off ${record.name}?`)) return;
  await runMonadLifecycleAction(
    control,
    monadsControlActionPath(control, record, "off", "stop"),
    onRescan,
    discovery,
  );
}

async function deleteMonadFromWeb(
  control: AllThisMonadsControl,
  record: AllThisMonadsControlRecord,
  onRescan?: () => void,
  discovery?: any,
) {
  const confirmed = browserConfirm(
    `Delete ${record.name}? This will stop it and remove its local runtime data and logs.`,
  );
  if (!confirmed) return;
  await runMonadLifecycleAction(
    control,
    monadsControlActionPath(control, record, "delete", "rm", "remove"),
    onRescan,
    discovery,
  );
}

async function showMonadStatusFromWeb(control: AllThisMonadsControl, record: AllThisMonadsControlRecord) {
  const payload = await runMonadsControlAction(
    control,
    `/__monads/${encodeURIComponent(record.name)}/status`,
    { method: "GET" },
  );
  const monad = payload?.monad;
  if (!monad) return;
  showInfoModal(
    `${record.name} — status`,
    [
      `name:       ${monad.name}`,
      `status:     ${monad.status}`,
      `namespace:  ${monad.namespace || "-"}`,
      `endpoint:   ${monad.endpoint || "-"}`,
      `pid:        ${monad.pid || "-"}`,
      monad.error ? `error:      ${monad.error}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

async function showMonadLogsFromWeb(control: AllThisMonadsControl, record: AllThisMonadsControlRecord) {
  const payload = await runMonadsControlAction(
    control,
    `/__monads/${encodeURIComponent(record.name)}/logs?lines=80`,
    { method: "GET" },
  );
  const monad = payload?.monad;
  if (!monad) return;
  const logContent = [
    monad.stdout || "(stdout empty)",
    monad.stderr ? `\n[stderr]\n${monad.stderr}` : "",
  ]
    .filter(Boolean)
    .join("");
  showInfoModal(`${record.name} — logs`, logContent);
}

export function buildLeftRailElements(monads: AllThisMonadRoute[] = []): any[] {
  return [
    {
      type: "link",
      props: {
        icon: "neurology",
        iconColor: "var(--gui-primary)",
        label: ".me",
        href: "#me",
        active: true,
      },
    },
    {
      type: "link",
      props: {
        icon: "widgets",
        iconColor: "var(--gui-secondary)",
        label: "GUI",
        href: "#gui",
      },
    },
    {
      type: "link",
      props: {
        icon: "hub",
        iconColor: "var(--gui-text-secondary)",
        label: monads.length ? "Monads" : "monads offline",
        href: "#monads",
      },
    },
  ];
}

function invokeGuiControl(name: string, legacyName?: string) {
  const global = asGlobal();
  const fn =
    (global.GUI && typeof global.GUI[name] === "function" ? global.GUI[name] : null) ||
    (typeof global[name] === "function" ? global[name] : null) ||
    (legacyName && typeof global[legacyName] === "function" ? global[legacyName] : null);
  if (typeof fn === "function") fn();
}

function buildSettingsMenuItems(onRescan?: () => void) {
  return [
    {
      label: "Rescan",
      icon: "refresh",
      onClick: onRescan,
    },
    {
      label: "Admin View",
      icon: "visibility",
      onClick: () => invokeGuiControl("toggleAdminView", "__guiToggleAdminView"),
    },
    {
      label: "Inspector",
      icon: "code",
      inspectorControl: true,
      onClick: () => invokeGuiControl("toggleInspector", "__guiToggleInspector"),
    },
  ].filter((item) => typeof item.onClick === "function");
}

function buildLeftBar(GUI: any, monads: AllThisMonadRoute[], onRescan?: () => void): any {
  return {
    initialView: "rail",
    elements: buildLeftRailElements(monads),
    footerElements: [
      {
        type: "menu",
        props: {
          icon: "settings",
          label: "Settings",
          items: buildSettingsMenuItems(onRescan),
        },
      },
    ],
  };
}

function buildMonadsGrid(GUI: any, monads: AllThisMonadRoute[], recommended: AllThisMonadRoute | null): any {
  if (!monads.length) return null;
  return guiNode("Box", {
    sx: {
      display: "grid",
      gridTemplateColumns: { xs: "repeat(auto-fit, minmax(118px, 1fr))", sm: "repeat(auto-fit, minmax(132px, 1fr))" },
      gap: { xs: 1.25, sm: 1.75 },
    },
  }, monads.map((monad) => {
    const isRecommended = recommended?.endpoint === monad.endpoint;
    const name = displayMonadName(monad);
    return guiNode("Paper", {
      component: "a",
      href: `${monad.endpoint.replace(/\/+$/, "")}/`,
      variant: "outlined",
      sx: {
        position: "relative",
        minHeight: 172,
        p: "20px 12px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.25,
        textAlign: "center",
        textDecoration: "none",
        color: "text.primary",
        borderColor: isRecommended ? "primary.main" : "divider",
      },
    }, [
      isRecommended ? guiNode("Chip", { label: "best", size: "small", color: "primary", sx: { position: "absolute", top: 10, right: 10 } }) : null,
      guiMonadAiBubble(GUI, monad.id || monad.name || monad.endpoint, "monad", { minHeight: 76, width: 88 }),
      guiText(name, { variant: "body2", sx: { fontWeight: 500, lineHeight: 1.25 } }),
      guiText(monad.status, { variant: "caption", sx: { color: "text.secondary" } }),
    ].filter(Boolean));
  }));
}

function monadsControlAction(control: AllThisMonadsControl, ...names: string[]): AllThisMonadsControlAction | null {
  const commandActions = Array.isArray(control.commandActions) ? control.commandActions : [];
  const requested = names.map((name) => name.toLowerCase());
  return commandActions.find((action) => requested.includes(action.name.toLowerCase())) || null;
}

function monadsControlHasAction(control: AllThisMonadsControl, ...names: string[]): boolean {
  const available = new Set((control.actions || []).map((name) => name.toLowerCase()));
  return Boolean(monadsControlAction(control, ...names)) || names.some((name) => available.has(name.toLowerCase()));
}

function monadsControlActionPath(
  control: AllThisMonadsControl,
  record: AllThisMonadsControlRecord,
  ...names: string[]
): string {
  const action = monadsControlAction(control, ...names);
  if (action?.path) {
    return action.path.replace(/:name/g, encodeURIComponent(record.name));
  }
  const suffix = names.find((name) => monadsControlHasAction(control, name)) || names[0] || "status";
  return `/__monads/${encodeURIComponent(record.name)}/${suffix}`;
}

function isMonadOnline(record: AllThisMonadsControlRecord): boolean {
  return record.status === "online" || record.status === "running";
}

function buildMonadsControlRows(control: AllThisMonadsControl, onRescan?: () => void, discovery?: any): any[] {
  if (!control.available) {
    return [
      guiText("No local web control endpoint answered. Install monad.ai, start one monad, then rescan.", {
        variant: "body2",
        sx: { color: "text.secondary", lineHeight: 1.55 },
      }),
      guiNode("Box", {
        sx: {
          display: "grid",
          gap: 0.5,
          p: 1.25,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "rgba(255,255,255,0.02)",
          fontFamily: "monospace",
          fontSize: 12,
          color: "text.secondary",
        },
      }, [
        guiText(control.installCommand, { variant: "caption", sx: { fontFamily: "monospace" } }),
        guiText(control.startCommand, { variant: "caption", sx: { fontFamily: "monospace" } }),
      ]),
    ];
  }

  if (!control.records.length) {
    return [
      guiText("No monads are registered yet.", {
        variant: "body2",
        sx: { color: "text.secondary", lineHeight: 1.55 },
      }),
    ];
  }

  const header = guiNode("Box", {
    sx: {
      display: { xs: "none", sm: "grid" },
      gridTemplateColumns: "minmax(110px, 1fr) 64px 90px minmax(120px, 1.2fr) minmax(250px, auto)",
      gap: 1,
      px: 0.5,
      color: "text.secondary",
    },
  }, ["name", "port", "status", "namespace", ""].map((label) => guiText(label, { variant: "caption" })));

  const rows = control.records.map((record) => guiNode("Box", {
    sx: {
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "minmax(110px, 1fr) 64px 90px minmax(120px, 1.2fr) minmax(250px, auto)" },
      gap: { xs: 0.75, sm: 1 },
      alignItems: "center",
      p: 0.75,
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 1,
      bgcolor: "rgba(255,255,255,0.018)",
    },
  }, (() => {
    const online = isMonadOnline(record);
    const paused = record.status === "paused";
    return [
      guiText(record.name, { variant: "body2", sx: { fontWeight: 500 } }),
      guiText(record.port ? String(record.port) : "-", { variant: "caption", sx: { color: "text.secondary", fontFamily: "monospace" } }),
      guiNode("Chip", { label: record.status, size: "small", variant: online ? "filled" : "outlined" }),
      guiText(record.namespace || "-", {
        variant: "caption",
        sx: {
          color: "text.secondary",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        },
      }),
      guiNode("Box", { sx: { display: "flex", gap: 0.5, flexWrap: "wrap", justifyContent: { xs: "flex-start", sm: "flex-end" } } }, [
        monadsControlHasAction(control, "status")
          ? guiNode("Button", { variant: "text", size: "small", label: "Status", onClick: () => showMonadStatusFromWeb(control, record) })
          : null,
        monadsControlHasAction(control, "logs")
          ? guiNode("Button", { variant: "text", size: "small", label: "Logs", onClick: () => showMonadLogsFromWeb(control, record) })
          : null,
        !online && monadsControlHasAction(control, "on", "resume")
          ? guiNode("Button", { variant: paused ? "contained" : "outlined", size: "small", label: "On", onClick: () => onMonadFromWeb(control, record, onRescan, discovery) })
          : null,
        online && monadsControlHasAction(control, "pause")
          ? guiNode("Button", { variant: "outlined", size: "small", label: "Pause", onClick: () => pauseMonadFromWeb(control, record, onRescan, discovery) })
          : null,
        monadsControlHasAction(control, "restart")
          ? guiNode("Button", { variant: "text", size: "small", label: "Restart", onClick: () => restartMonadFromWeb(control, record, onRescan, discovery) })
          : null,
        (online || paused) && monadsControlHasAction(control, "off", "stop")
          ? guiNode("Button", { variant: "text", size: "small", label: "Off", onClick: () => offMonadFromWeb(control, record, onRescan, discovery) })
          : null,
        monadsControlHasAction(control, "delete", "rm", "remove")
          ? guiNode("Button", { variant: "text", size: "small", color: "error", label: "Delete", onClick: () => deleteMonadFromWeb(control, record, onRescan, discovery) })
          : null,
      ].filter(Boolean)),
    ];
  })()));

  return [header, ...rows];
}

function buildMonadsControlCard(control: AllThisMonadsControl, onRescan?: () => void, discovery?: any): any {
  const manualEndpoints = getStoredMonadEndpoints();
  return guiStatusCard({
    title: "Monads Control Panel",
    subtitle: control.available
      ? "The CLI registry is available through the local monad."
      : "The browser needs a local monad to expose the monads command.",
    state: control.available ? "ready" : "install",
    chips: control.available
      ? [`${control.records.length} known`, "monads"]
      : ["monads not detected"],
    body: buildMonadsControlRows(control, onRescan, discovery),
    actions: [
      guiNode("Button", {
        variant: "contained",
        size: "small",
        label: "Start a New Monad",
        onClick: () => startMonadFromWeb(control, onRescan, discovery),
      }),
      guiNode("Button", {
        variant: "outlined",
        size: "small",
        label: "Rescan",
        onClick: onRescan,
      }),
      guiNode("Button", {
        variant: "outlined",
        size: "small",
        label: "Add endpoint",
        onClick: () => addManualMonadEndpoint(onRescan, discovery),
      }),
      control.available ? guiNode("Button", {
        variant: "text",
        size: "small",
        label: "Commands",
        onClick: () => showMonadsCommandHelp(control),
      }) : null,
      manualEndpoints.length ? guiNode("Button", {
        variant: "text",
        size: "small",
        label: "Clear manual",
        onClick: () => clearManualMonadEndpoints(onRescan, discovery),
      }) : null,
      control.available ? null : guiNode("Button", {
        variant: "text",
        size: "small",
        label: "Install help",
        onClick: () => showMonadsInstallHelp(control),
      }),
    ].filter(Boolean),
  });
}

export async function resolveMainSurface(input: {
  GUI: any;
  me: any;
  meBoot: AllThisMeBoot;
  monads: AllThisMonadRoute[];
  monadsControl: AllThisMonadsControl;
  guiResolution: AllThisGuiResolution;
  onRescan?: () => void;
  onOpenInstallGuide?: (event?: Event) => void;
  discovery?: any;
}): Promise<any> {
  const { GUI, meBoot, monads, monadsControl, guiResolution, onRescan, onOpenInstallGuide, discovery } = input;
  const best = recommendedMonad(monads);
  const bestName = best ? displayMonadName(best) : "none";
  const meState = meBoot.status === "initiated" ? "online" : meBoot.status;

  return guiNode("Box", {
    sx: {
      flex: 1,
      minHeight: "100%",
      width: "100%",
      p: { xs: 1.5, sm: 2.5, md: 3 },
    },
  }, [
    guiNode("Box", {
      sx: {
        width: "min(100%, 940px)",
        display: "grid",
        gap: { xs: 1.4, sm: 1.8 },
      },
    }, [
      guiText(".me", { variant: "h5", sx: { fontWeight: 500, lineHeight: 1.2 } }),
      guiText("Local-first boot resolves GUI, .me, and the nearest monad route before mounting this surface.", {
        variant: "body2",
        sx: { color: "text.secondary", maxWidth: 680, lineHeight: 1.6 },
      }),
      guiNode("Box", {
        sx: {
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.08fr) minmax(260px, 0.92fr)" },
          gap: { xs: 1.25, md: 1.5 },
        },
      }, [
        guiStatusCard({
          title: ".me",
          subtitle: "tetragrammaton seed, local expression",
          state: meState,
          chips: meBoot.status === "error"
            ? [`me[@]("${meBoot.expression}")`, meBoot.error || "kernel unavailable"]
            : [`me[@]("${meBoot.expression}")`, "kernel local"],
          body: [guiMonadAiBubble(GUI, meBoot.seed, "me", { minHeight: { xs: 118, sm: 142 } })],
        }),
        guiStatusCard({
          title: "GUI",
          subtitle: "Single object vocabulary, contextual props.",
          state: guiResolution.status === "resolved" ? "resolved" : guiResolution.status,
          chips: [guiResolution.source, guiResolution.detail].filter(Boolean),
        }),
      ]),
      guiStatusCard({
        title: "Monads",
        subtitle: monads.length ? "monads.ai: synthesis by reduction." : "No monad route answered yet.",
        state: monads.length ? "online" : "offline",
        chips: monads.length ? [`${monads.length} reduced`, `best: ${bestName}`] : ["local first", "network optional"],
        body: monads.length ? [buildMonadsGrid(GUI, monads, best)] : [],
        actions: best
          ? [guiNode("Button", { variant: "outlined", size: "small", label: "Open", href: `${best.endpoint.replace(/\/+$/, "")}/` })]
          : [guiNode("Button", {
              variant: "outlined",
              size: "small",
              label: "Installation guide",
              href: MONAD_INSTALL_GUIDE_PATH,
              onClick: onOpenInstallGuide,
            })],
      }),
      buildMonadsControlCard(monadsControl, onRescan, discovery),
    ]),
  ]);
}

function buildMonadInstallGuideSurface(onBack?: () => void): any {
  return guiNode("Box", {
    sx: {
      flex: 1,
      minHeight: "100%",
      width: "100%",
      p: { xs: 1.5, sm: 2.5, md: 3 },
    },
  }, [
    guiNode("Box", {
      sx: {
        width: "min(100%, 980px)",
        display: "grid",
        gap: { xs: 1.25, sm: 1.75 },
      },
    }, [
      guiNode("Box", {
        sx: {
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        },
      }, [
        guiText("monad.ai installation", { variant: "h5", sx: { fontWeight: 560, lineHeight: 1.2 } }),
        guiNode("Box", { sx: { display: "flex", gap: 0.75, flexWrap: "wrap" } }, [
          onBack ? guiNode("Button", { variant: "outlined", size: "small", label: "Back", onClick: onBack }) : null,
          guiNode("Button", { variant: "text", size: "small", label: "Raw README", href: MONAD_INSTALL_GUIDE_PATH }),
        ].filter(Boolean)),
      ]),
      guiNode("MarkdownDocument", {
        src: MONAD_INSTALL_GUIDE_PATH,
        baseUrl: MONAD_INSTALL_GUIDE_BASE,
        title: "monad.ai",
        subtitle: "Installation guide",
        maxWidth: 920,
        sx: { mx: 0 },
      }),
    ]),
  ]);
}

export function buildAllThisLayoutSpec(input: {
  GUI: any;
  me: any;
  monads: AllThisMonadRoute[];
  surface: any;
  onRescan?: () => void;
}): any {
  return {
    type: "Layout",
    props: {
      TopBar: false,
      LeftBar: buildLeftBar(input.GUI, input.monads, input.onRescan),
      RightBar: false,
      Footer: false,
    },
    children: input.surface,
  };
}

export async function startAllThis(options: AllThisBootOptions = {}): Promise<AllThisBootResult> {
  const root = resolveRoot(options.root);

  if (!options.rescan) {
    notify(options, { step: "boot:start", detail: "all.this package boot" });
    ensureBootScreen(root, "all.this", "Resolving local .me, monads, and GUI.");
  }

  notify(options, { step: "me:resolve:start" });
  const { me, boot: meBoot } = await resolveMeKernel(options);
  notify(options, { step: "me:resolve:done", me: meBoot });

  if (!options.rescan) {
    ensureBootScreen(root, "all.this", "Resolving GUI local-first.");
  }
  notify(options, { step: "gui:resolve:start", me: meBoot, monads: [] });
  const { GUI, resolution: guiResolution } = await resolveGUI({ ...options, monads: [] });
  notify(options, { step: "gui:resolve:done", me: meBoot, monads: [], gui: guiResolution });

  if (typeof GUI.mount !== "function") {
    throw new Error("[all.this] GUI.mount unavailable");
  }

  const discovery = createAllThisMonadDiscovery(GUI, options);
  const previousDiscovery = asGlobal().__ALL_THIS_MONAD_DISCOVERY__;
  if (previousDiscovery && previousDiscovery !== discovery && typeof previousDiscovery.stop === "function") {
    previousDiscovery.stop();
  }
  asGlobal().__ALL_THIS_MONAD_DISCOVERY__ = discovery;
  let fallbackMonads: AllThisMonadRoute[] = [];
  let fallbackMonadsControl: AllThisMonadsControl = monadsControlUnavailable("", "Monad discovery runtime unavailable.");
  let lastRenderFingerprint = "";
  let currentResult: AllThisBootResult = {
    GUI,
    me,
    monads: [],
    monadsControl: fallbackMonadsControl,
    spec: null,
    mount: null,
    meBoot,
    guiResolution,
  };

  const mountOptions = {
    gui: GUI,
    me,
    devtools: {
      inspector: false,
      adminView: false,
    },
  };

  const renderFromState = async (state: any, force = false) => {
    const monads = discovery ? monadsFromDiscoveryState(state) : fallbackMonads;
    const monadsControl = discovery ? monadsControlFromDiscoveryState(state) : fallbackMonadsControl;
    const shouldOpenGuide = typeof window !== "undefined" && window.location.hash === "#view=monad-install";
    const view = shouldOpenGuide ? "monad-install" : "main";
    const renderFingerprint = JSON.stringify({
      view,
      discovery: state?.fingerprint || "",
      monads: monads.map((monad) => [monad.id, monad.endpoint, monad.status]),
      control: [monadsControl.available, monadsControl.endpoint, monadsControl.records.map((record) => [record.name, record.status, record.endpoint])],
      gui: guiResolution.source,
      me: meBoot.status,
    });
    if (!force && renderFingerprint === lastRenderFingerprint) return;
    lastRenderFingerprint = renderFingerprint;

    const backFromGuide = () => {
      if (typeof window !== "undefined") {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
      void renderFromState(discovery?.getState?.() || state, true);
    };
    const openInstallGuide = (event?: Event) => {
      event?.preventDefault?.();
      if (typeof window !== "undefined") {
        history.replaceState(null, "", "#view=monad-install");
      }
      void renderFromState(discovery?.getState?.() || state, true);
    };
    const rescan = () => {
      if (discovery && typeof discovery.rescan === "function") {
        discovery.rescan({ mode: "fast", reason: "all.this:rescan" });
        return;
      }
      startAllThis({ ...options, rescan: true }).catch((error) => {
        showInfoModal("rescan error", errorMessage(error));
      });
    };

    const surface = shouldOpenGuide
      ? buildMonadInstallGuideSurface(backFromGuide)
      : await resolveMainSurface({
          GUI,
          me,
          meBoot,
          monads,
          monadsControl,
          guiResolution,
          onRescan: rescan,
          onOpenInstallGuide: openInstallGuide,
          discovery,
        });
    const spec = buildAllThisLayoutSpec({ GUI, me, monads, surface, onRescan: rescan });
    if (!options.rescan && !currentResult.mount) {
      root.innerHTML = "";
    }
    const mount = GUI.mount(spec, root, mountOptions);
    currentResult = { GUI, me, monads, monadsControl, spec, mount, meBoot, guiResolution };
    asGlobal().__ALL_THIS_BOOT__ = currentResult;
    notify(options, { step: "boot:mounted", me: meBoot, monads, gui: guiResolution });
  };

  if (!discovery) {
    notify(options, { step: "monad:scan:start", me: meBoot });
    fallbackMonads = await resolveMonadProvider(options);
    fallbackMonadsControl = await resolveMonadsControl(recommendedMonad(fallbackMonads));
    notify(options, { step: "monad:scan:done", me: meBoot, monads: fallbackMonads });
    await renderFromState({ fingerprint: "fallback" }, true);
    return currentResult;
  }

  notify(options, { step: "monad:discovery:start", me: meBoot });
  discovery.subscribe((state: any) => {
    void renderFromState(state);
  });
  discovery.start();
  await discovery.waitForChange?.({
    timeoutMs: Math.max(1200, DEFAULT_MONAD_SCAN_TIMEOUT_MS + 700),
    predicate: (state: any) => Boolean(state?.lastUpdatedAt),
  }).catch(() => null);
  await renderFromState(discovery.getState(), true);
  return currentResult;
}

export default startAllThis;
