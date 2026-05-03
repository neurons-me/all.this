export type AllThisBootRoot = string | Element | null | undefined;

export type AllThisGuiAssets = {
  bootstrap?: string;
  css?: string;
  gui?: string;
  logo?: string;
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
  namespace?: string;
  status: "online" | "offline" | "stale";
  latency?: number;
  cost?: string;
  capabilities?: string[];
  raw?: any;
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
  spec: any;
  mount: any;
  meBoot: AllThisMeBoot;
  guiResolution: AllThisGuiResolution;
};

const BOOT_VERSION = "20260404-all-this-boot";
const DEFAULT_ME_SEED = "tetragrammaton";
const DEFAULT_ME_EXPRESSION = "me";
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
  "http://local.monad:8161",
  "http://127.0.0.1:8161",
  "http://localhost:8161",
  ...Array.from({ length: 27 }, (_, index) => `http://127.0.0.1:${8162 + index}`),
  ...Array.from({ length: 27 }, (_, index) => `http://localhost:${8162 + index}`),
];

const pendingScripts = new Map<string, Promise<boolean>>();

function asGlobal(): any {
  return globalThis as any;
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
  return {
    id: readString(surface?.id, surface?.monadId, surface?.surfaceEntry?.id, endpoint),
    name: readString(surface?.name, surface?.monadName, surface?.surfaceEntry?.monadName, surface?.identity),
    endpoint,
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
  const endpoints = options.monadEndpoints?.length ? options.monadEndpoints : DEFAULT_MONAD_ENDPOINTS;
  const timeoutMs = Math.max(250, Number(options.monadScanTimeoutMs || DEFAULT_MONAD_SCAN_TIMEOUT_MS));
  const seen = new Set<string>();
  const uniqueEndpoints = endpoints
    .map((endpoint) => String(endpoint).trim().replace(/\/+$/, ""))
    .filter((endpoint) => endpoint && !seen.has(endpoint) && seen.add(endpoint));
  const results = await Promise.all(uniqueEndpoints.map((endpoint) => probeMonadEndpoint(endpoint, timeoutMs)));
  return results.filter(Boolean) as AllThisMonadRoute[];
}

function costRank(cost: unknown): number {
  const normalized = String(cost || "").toLowerCase();
  if (normalized.includes("low") || normalized.includes("bajo")) return 0;
  if (normalized.includes("medium") || normalized.includes("medio")) return 100;
  if (normalized.includes("high") || normalized.includes("alto")) return 220;
  return 140;
}

export function recommendedMonad(monads: AllThisMonadRoute[]): AllThisMonadRoute | null {
  return [...monads].sort((a, b) => {
    const aScore = Number(a.latency ?? 999) + costRank(a.cost);
    const bScore = Number(b.latency ?? 999) + costRank(b.cost);
    return aScore - bScore;
  })[0] ?? null;
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
  global.__THIS_GUI_DISABLE_AUTOBOOT__ = true;
  global.__THIS_GUI_BOOTSTRAP_ASSETS__ = {
    css: assets.css,
    gui: assets.gui,
    react: assets.react,
    reactDom: assets.reactDom,
  };

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
    ...DEFAULT_LOCAL_GUI_CANDIDATES,
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

  let lastError: unknown = null;
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
      lastError = error;
    }
  }

  const resolution: AllThisGuiResolution = {
    status: "offline",
    label: "GUI",
    source: "unresolved",
    detail: "not resolved",
    error: errorMessage(lastError || new Error("GUI unavailable")),
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

function buildLeftBar(GUI: any, monads: AllThisMonadRoute[], onRescan?: () => void): any {
  const collections = GUI?.SideBarsCollections || GUI?.sideBarsCollections;
  const createGUISettings =
    typeof collections?.GUISettings === "function"
      ? collections.GUISettings
      : typeof GUI?.GUISettings === "function"
        ? GUI.GUISettings
        : null;
  return {
    initialView: "rail",
    elements: buildLeftRailElements(monads),
    footerCollections: createGUISettings
      ? [
          createGUISettings({
            includeBrand: false,
            includeRuntimeControlsToggle: false,
          }),
        ]
      : [],
    footerElements: [
      {
        type: "action",
        props: {
          icon: "refresh",
          iconColor: "var(--gui-primary)",
          label: "Rescan",
          onClick: onRescan,
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

export async function resolveMainSurface(input: {
  GUI: any;
  me: any;
  meBoot: AllThisMeBoot;
  monads: AllThisMonadRoute[];
  guiResolution: AllThisGuiResolution;
}): Promise<any> {
  const { GUI, meBoot, monads, guiResolution } = input;
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
        subtitle: monads.length ? "The lowest cost route is ready; endpoints stay internal." : "No monad route answered yet.",
        state: monads.length ? "online" : "offline",
        chips: monads.length ? [`${monads.length} reduced`, `best: ${bestName}`] : ["local first", "network optional"],
        body: monads.length ? [buildMonadsGrid(GUI, monads, best)] : [],
        actions: best
          ? [guiNode("Button", { variant: "outlined", size: "small", label: "Open", href: `${best.endpoint.replace(/\/+$/, "")}/` })]
          : [guiNode("Button", { variant: "outlined", size: "small", label: "Installation guide", href: "modules/monad/npm/README.md" })],
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
  notify(options, { step: "boot:start", detail: "all.this package boot" });
  ensureBootScreen(root, "all.this", "Resolving local .me, monads, and GUI.");

  notify(options, { step: "me:resolve:start" });
  const { me, boot: meBoot } = await resolveMeKernel(options);
  notify(options, { step: "me:resolve:done", me: meBoot });

  ensureBootScreen(root, "all.this", "Scanning local monad routes.");
  notify(options, { step: "monad:scan:start", me: meBoot });
  const monads = await resolveMonadProvider(options);
  notify(options, { step: "monad:scan:done", me: meBoot, monads });

  ensureBootScreen(root, "all.this", "Resolving GUI local-first.");
  notify(options, { step: "gui:resolve:start", me: meBoot, monads });
  const { GUI, resolution: guiResolution } = await resolveGUI({ ...options, monads });
  notify(options, { step: "gui:resolve:done", me: meBoot, monads, gui: guiResolution });

  const rescan = () => {
    startAllThis(options).catch((error) => {
      ensureBootScreen(root, "all.this boot fault", errorMessage(error));
    });
  };

  const surface = await resolveMainSurface({ GUI, me, meBoot, monads, guiResolution });
  const spec = buildAllThisLayoutSpec({ GUI, me, monads, surface, onRescan: rescan });

  if (typeof GUI.mount !== "function") {
    throw new Error("[all.this] GUI.mount unavailable");
  }

  root.innerHTML = "";
  const mount = GUI.mount(spec, root, {
    gui: GUI,
    me,
    devtools: {
      inspector: false,
      adminView: false,
    },
  });

  const result = { GUI, me, monads, spec, mount, meBoot, guiResolution };
  asGlobal().__ALL_THIS_BOOT__ = result;
  notify(options, { step: "boot:mounted", me: meBoot, monads, gui: guiResolution });
  return result;
}

export default startAllThis;
