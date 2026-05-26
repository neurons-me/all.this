(function (global) {
  "use strict";

  var BOOT_VERSION = "20260404-all-this-boot-global";
  var DEFAULT_ME_SEED = "tetragrammaton";
  var DEFAULT_ME_EXPRESSION = "local-me";
  var SCRIPT_LOADED_ATTR = "data-all-this-runtime-loaded";
  var DEFAULT_MONAD_SCAN_TIMEOUT_MS = 650;

  var DEFAULT_ME_CANDIDATES = [
    "./me/npm/dist/me.umd.js",
    "me/npm/dist/me.umd.js",
    "/me/npm/dist/me.umd.js",
    "/me/me.umd.js",
  ];

  var DEFAULT_LOCAL_GUI_CANDIDATES = [
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

  var DEFAULT_CDN_GUI_CANDIDATE = {
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

  var DEFAULT_MONAD_ENDPOINTS = [
    "http://127.0.0.1:8161",
    "http://localhost:8161",
  ];

  var RESCAN_MONAD_ENDPOINTS = [
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

  var MONAD_INSTALL_GUIDE_PATH = "modules/monad/npm/README.md";
  var MONAD_INSTALL_GUIDE_BASE = "modules/monad/npm/";

  var pendingScripts = new Map();
  var pendingStyles = new Map();
  var MONAD_ENDPOINTS_STORAGE_KEY = "all.this.monadEndpoints";

  function errorMessage(error) {
    return error && error.message ? error.message : String(error || "Unknown error");
  }

  function normalizeMonadEndpointInput(value) {
    var raw = String(value || "").trim();
    if (!raw) return "";
    var withProtocol = /^https?:\/\//i.test(raw) ? raw : "http://" + raw;
    try {
      return new URL(withProtocol).href.replace(/\/+$/, "");
    } catch (_) {
      return "";
    }
  }

  function getStoredMonadEndpoints() {
    try {
      var raw = global.localStorage && global.localStorage.getItem(MONAD_ENDPOINTS_STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.map(normalizeMonadEndpointInput).filter(Boolean) : [];
    } catch (_) {
      return [];
    }
  }

  function setStoredMonadEndpoints(endpoints) {
    try {
      var unique = Array.from(new Set((endpoints || []).map(normalizeMonadEndpointInput).filter(Boolean)));
      if (global.localStorage) global.localStorage.setItem(MONAD_ENDPOINTS_STORAGE_KEY, JSON.stringify(unique));
    } catch (_) {}
  }

  function addStoredMonadEndpoint(endpoint) {
    var normalized = normalizeMonadEndpointInput(endpoint);
    if (!normalized) return "";
    setStoredMonadEndpoints(getStoredMonadEndpoints().concat([normalized]));
    return normalized;
  }

  function resolveMonadDiscoveryFactory(GUI) {
    var candidates = [
      GUI && GUI.createMonadDiscovery,
      GUI && GUI.createMonadDiscoveryStore,
      GUI && GUI.runtime && GUI.runtime.createMonadDiscovery,
      GUI && GUI.Runtime && GUI.Runtime.createMonadDiscovery,
      GUI && GUI.default && GUI.default.createMonadDiscovery,
    ];
    return candidates.find(function (candidate) { return typeof candidate === "function"; }) || null;
  }

  function createAllThisMonadDiscovery(GUI, options) {
    var factory = resolveMonadDiscoveryFactory(GUI);
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

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function readString() {
    for (var index = 0; index < arguments.length; index += 1) {
      var value = arguments[index];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
    return "";
  }

  function readList() {
    for (var index = 0; index < arguments.length; index += 1) {
      var value = arguments[index];
      if (Array.isArray(value)) return value.map(String).filter(Boolean);
      if (typeof value === "string" && value.trim()) {
        return value.split(",").map(function (item) {
          return item.trim();
        }).filter(Boolean);
      }
    }
    return [];
  }

  function isFileProtocol() {
    return typeof window !== "undefined" && window.location && window.location.protocol === "file:";
  }

  function resolveRoot(root) {
    if (typeof root === "string") {
      var queried = document.querySelector(root);
      if (!queried) throw new Error("[all.this] root not found: " + root);
      return queried;
    }
    if (root) return root;
    var target = document.getElementById("root");
    if (!target) throw new Error("[all.this] root not found: #root");
    return target;
  }

  function notify(options, status) {
    global.__ALL_THIS_BOOT_STATUS__ = Object.assign({}, status, {
      version: BOOT_VERSION,
      at: Date.now(),
    });
    if (typeof options.onStatus === "function") options.onStatus(status);
  }

  function ensureBootScreen(root, title, detail) {
    if (!document.getElementById("all-this-boot-style")) {
      var style = document.createElement("style");
      style.id = "all-this-boot-style";
      style.textContent = [
        ":root { color-scheme: dark; }",
        "body { margin: 0; background: rgb(5, 5, 5); color: #e8eaed; }",
        ".all-this-boot { min-height: 100vh; display: grid; align-items: center; padding: 24px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, 'Segoe UI', sans-serif; }",
        ".all-this-boot-panel { width: min(100%, 520px); border: 1px solid rgba(220, 224, 228, 0.12); background: rgba(10, 11, 12, 0.74); border-radius: 14px; padding: 18px; box-shadow: 0 18px 60px rgba(0, 0, 0, 0.32); }",
        ".all-this-boot-kicker { font: 11px/1.4 'SFMono-Regular', Menlo, Consolas, monospace; letter-spacing: 0.16em; text-transform: uppercase; color: #8d949b; margin-bottom: 10px; }",
        ".all-this-boot-title { font: 14px/1.55 'SFMono-Regular', Menlo, Consolas, monospace; color: #f0f2f3; }",
        ".all-this-boot-detail { margin-top: 8px; color: #9da4aa; font-size: 13px; line-height: 1.6; white-space: pre-wrap; }",
      ].join("\n");
      document.head.appendChild(style);
    }

    root.innerHTML = [
      '<section class="all-this-boot">',
      '  <div class="all-this-boot-panel">',
      '    <div class="all-this-boot-kicker">all.this</div>',
      '    <div class="all-this-boot-title">' + escapeHtml(title) + "</div>",
      '    <div class="all-this-boot-detail">' + escapeHtml(detail) + "</div>",
      "  </div>",
      "</section>",
    ].join("");
  }

  function loadScriptOnce(src) {
    if (!src) return Promise.reject(new Error("Missing script src"));
    if (pendingScripts.has(src)) return pendingScripts.get(src);

    var absoluteSrc = new URL(src, document.baseURI).href;
    var existing = Array.from(document.querySelectorAll("script[src]")).find(function (node) {
      return node instanceof HTMLScriptElement && node.src === absoluteSrc;
    });

    if (existing && existing.getAttribute(SCRIPT_LOADED_ATTR) === "true") {
      return Promise.resolve(true);
    }

    var promise = new Promise(function (resolve, reject) {
      var script = existing || document.createElement("script");
      if (!existing) {
        script.src = src;
        script.async = false;
        if (/^https?:/i.test(src)) script.crossOrigin = "anonymous";
      }
      script.onload = function () {
        script.setAttribute(SCRIPT_LOADED_ATTR, "true");
        resolve(true);
      };
      script.onerror = function () {
        reject(new Error("Failed to load script: " + src));
      };
      if (!existing) document.head.appendChild(script);
    }).finally(function () {
      pendingScripts.delete(src);
    });

    pendingScripts.set(src, promise);
    return promise;
  }

  function loadStyleOnce(href) {
    if (!href) return Promise.resolve(false);
    if (pendingStyles.has(href)) return pendingStyles.get(href);

    var absoluteHref = new URL(href, document.baseURI).href;
    var existing = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(function (node) {
      return node instanceof HTMLLinkElement && node.href === absoluteHref;
    });

    if (existing && existing.getAttribute(SCRIPT_LOADED_ATTR) === "true") {
      return Promise.resolve(true);
    }

    var promise = new Promise(function (resolve, reject) {
      var link = existing || document.createElement("link");
      if (!existing) {
        link.rel = "stylesheet";
        link.href = href;
        if (/^https?:/i.test(href)) link.crossOrigin = "anonymous";
      }
      link.onload = function () {
        link.setAttribute(SCRIPT_LOADED_ATTR, "true");
        resolve(true);
      };
      link.onerror = function () {
        reject(new Error("Failed to load css: " + href));
      };
      if (!existing) document.head.appendChild(link);
    }).finally(function () {
      pendingStyles.delete(href);
    });

    pendingStyles.set(href, promise);
    return promise;
  }

  function resolveMeCtor() {
    var candidates = [global.Me, global.ME, globalThis.Me, globalThis.ME];
    for (var index = 0; index < candidates.length; index += 1) {
      var candidate = candidates[index];
      if (typeof candidate === "function") return candidate;
      if (candidate && typeof candidate.ME === "function") return candidate.ME;
      if (candidate && typeof candidate.default === "function") return candidate.default;
      if (candidate && candidate.default && typeof candidate.default.ME === "function") return candidate.default.ME;
    }
    return null;
  }

  function resolveMeKernel(options) {
    var seed = options.meSeed || DEFAULT_ME_SEED;
    var expression = options.meExpression || DEFAULT_ME_EXPRESSION;
    var boot = {
      status: "pending",
      seed: seed,
      expression: expression,
      memories: 0,
      error: "",
    };
    var candidates = options.meCandidates && options.meCandidates.length ? options.meCandidates : DEFAULT_ME_CANDIDATES;
    var lastError = null;
    var ctor = resolveMeCtor();

    var load = Promise.resolve();
    if (typeof ctor !== "function") {
      load = candidates.reduce(function (chain, src) {
        return chain.then(function () {
          if (typeof ctor === "function") return null;
          return loadScriptOnce(src)
            .then(function () {
              ctor = resolveMeCtor();
              if (typeof ctor !== "function") {
                lastError = new Error(".me loaded without exposing a constructor: " + src);
              }
            })
            .catch(function (error) {
              lastError = error;
            });
        });
      }, Promise.resolve());
    }

    return load.then(function () {
      if (typeof ctor !== "function") {
        boot.status = "error";
        boot.error = errorMessage(lastError || new Error(".me runtime unavailable"));
        return { me: null, boot: boot };
      }

      try {
        var me = new ctor(seed);
        if (me && typeof me["@"] === "function") me["@"](expression);
        var inspected = me && typeof me.inspect === "function" ? me.inspect({ last: 8 }) : null;
        boot.status = "initiated";
        boot.memories = inspected && Array.isArray(inspected.memories) ? inspected.memories.length : 1;
        global.me = me;
        global.__ALL_THIS_ME__ = me;
        global.__ALL_THIS_ME_BOOT__ = boot;
        return { me: me, boot: boot };
      } catch (error) {
        boot.status = "error";
        boot.error = errorMessage(error);
        return { me: null, boot: boot };
      }
    });
  }

  function withTimeout(ms) {
    var controller = new AbortController();
    var timer = setTimeout(function () {
      controller.abort();
    }, ms);
    return { controller: controller, timer: timer };
  }

  function endpointFromSurface(surface, fallback) {
    return readString(
      surface && surface.endpoint,
      surface && surface.url,
      surface && surface.origin,
      surface && surface.transport && surface.transport.endpoint,
      surface && surface.surfaceEntry && surface.surfaceEntry.endpoint,
      fallback,
    ).replace(/\/+$/, "");
  }

  function inferCost(endpoint) {
    if (/127\.0\.0\.1|localhost|local\.monad/i.test(endpoint)) return "low";
    return "medium";
  }

  function normalizeSurface(surface, fallbackEndpoint, latency) {
    var endpoint = endpointFromSurface(surface, fallbackEndpoint);
    var monadId = readString(
      surface && surface.monadId,
      surface && surface.monad && surface.monad.id,
      surface && surface.id,
      surface && surface.surfaceEntry && surface.surfaceEntry.monadId,
      surface && surface.surfaceEntry && surface.surfaceEntry.monad && surface.surfaceEntry.monad.id,
      surface && surface.surfaceEntry && surface.surfaceEntry.id,
      endpoint,
    );
    var monadName = readString(
      surface && surface.monadName,
      surface && surface.monad && surface.monad.name,
      surface && surface.name,
      surface && surface.surfaceEntry && surface.surfaceEntry.monadName,
      surface && surface.surfaceEntry && surface.surfaceEntry.monad && surface.surfaceEntry.monad.name,
      surface && surface.identity,
    );
    return {
      id: monadId,
      name: monadName,
      endpoint: endpoint,
      aliases: [endpoint],
      namespace: readString(surface && surface.namespace, surface && surface.rootspace, surface && surface.surfaceEntry && surface.surfaceEntry.namespace),
      status: "online",
      latency: latency,
      cost: readString(surface && surface.cost, surface && surface.operationalCost, surface && surface.route && surface.route.cost) || inferCost(endpoint),
      capabilities: readList(surface && surface.capabilities, surface && surface.features, surface && surface.surfaceEntry && surface.surfaceEntry.capabilities),
      raw: surface,
    };
  }

  function isLoopbackHost(host) {
    var normalized = String(host || "").trim().toLowerCase().replace(/^\[|\]$/g, "");
    return normalized === "localhost"
      || normalized === "local.monad"
      || normalized === "::1"
      || normalized === "0.0.0.0"
      || /^127(?:\.\d{1,3}){3}$/.test(normalized);
  }

  function endpointIdentity(value) {
    try {
      var url = new URL(value);
      var host = url.hostname.toLowerCase();
      var port = url.port || (url.protocol === "https:" ? "443" : url.protocol === "http:" ? "80" : "");
      var identityHost = isLoopbackHost(host) ? "local" : host;
      return {
        host: host,
        port: port,
        key: url.protocol + "//" + identityHost + (port ? ":" + port : ""),
      };
    } catch (_) {
      var clean = String(value || "").trim().toLowerCase().replace(/\/+$/, "");
      return { host: "", port: "", key: clean };
    }
  }

  function normalizeIdentityPart(value) {
    return String(value || "").trim().toLowerCase().replace(/\/+$/, "");
  }

  function stableMonadId(monad) {
    var id = readString(
      monad && monad.id,
      monad && monad.raw && monad.raw.monadId,
      monad && monad.raw && monad.raw.monad && monad.raw.monad.id,
      monad && monad.raw && monad.raw.surfaceEntry && monad.raw.surfaceEntry.monadId,
      monad && monad.raw && monad.raw.surfaceEntry && monad.raw.surfaceEntry.monad && monad.raw.surfaceEntry.monad.id,
    );
    return /^https?:\/\//i.test(id) ? "" : id;
  }

  function monadIdentityKey(monad) {
    var stableId = stableMonadId(monad);
    if (stableId) return "id:" + normalizeIdentityPart(stableId);

    var endpoint = endpointIdentity(monad && monad.endpoint);
    var namespace = endpointIdentity(readString(
      monad && monad.namespace,
      monad && monad.raw && monad.raw.namespace,
      monad && monad.raw && monad.raw.surfaceEntry && monad.raw.surfaceEntry.namespace,
    )).key;
    var name = normalizeIdentityPart(readString(
      monad && monad.name,
      monad && monad.raw && monad.raw.monadName,
      monad && monad.raw && monad.raw.monad && monad.raw.monad.name,
      monad && monad.raw && monad.raw.surfaceEntry && monad.raw.surfaceEntry.monadName,
      monad && monad.raw && monad.raw.surfaceEntry && monad.raw.surfaceEntry.monad && monad.raw.surfaceEntry.monad.name,
    ));

    if (name && endpoint.port) {
      return "name:" + name + ":" + (namespace || endpoint.key) + ":" + endpoint.port;
    }

    return "endpoint:" + endpoint.key;
  }

  function monadScore(monad) {
    var endpoint = endpointIdentity(monad && monad.endpoint);
    var localityBonus = isLoopbackHost(endpoint.host) ? 0 : 18;
    return Number(!monad || monad.latency == null ? 999 : monad.latency) + costRank(monad && monad.cost) + localityBonus;
  }

  function mergeCapabilities(a, b) {
    return Array.from(new Set([].concat(a.capabilities || [], b.capabilities || []).filter(Boolean)));
  }

  function mergeAliases(a, b) {
    return Array.from(new Set([].concat(a.aliases || [], b.aliases || [], a.endpoint, b.endpoint).filter(Boolean)));
  }

  function mergeMonadRoutes(a, b) {
    var primary = monadScore(b) < monadScore(a) ? b : a;
    var secondary = primary === b ? a : b;
    var aliases = mergeAliases(a, b);
    return Object.assign({}, primary, {
      id: readString(stableMonadId(primary), stableMonadId(secondary), primary.id, secondary.id, primary.name, primary.endpoint),
      name: readString(primary.name, secondary.name),
      namespace: readString(primary.namespace, secondary.namespace),
      capabilities: mergeCapabilities(primary, secondary),
      aliases: aliases,
      raw: Object.assign({}, primary.raw || {}, {
        aliases: aliases,
        canonicalKey: monadIdentityKey(primary),
      }),
    });
  }

  function reduceMonadRoutes(routes) {
    var reduced = new Map();
    routes.forEach(function (route) {
      var key = monadIdentityKey(route);
      var existing = reduced.get(key);
      reduced.set(key, existing ? mergeMonadRoutes(existing, route) : Object.assign({}, route, {
        aliases: route.aliases && route.aliases.length ? route.aliases : [route.endpoint],
      }));
    });
    return Array.from(reduced.values()).sort(function (a, b) {
      return monadScore(a) - monadScore(b);
    });
  }

  function probeMonadEndpoint(endpoint, timeoutMs) {
    var cleanEndpoint = String(endpoint).replace(/\/+$/, "");
    var startedAt = Date.now();
    var timeout = withTimeout(timeoutMs);
    return fetch(cleanEndpoint + "/__surface", {
      method: "GET",
      headers: { accept: "application/json" },
      signal: timeout.controller.signal,
    })
      .then(function (response) {
        if (!response.ok) return null;
        return response.json();
      })
      .then(function (surface) {
        return surface ? normalizeSurface(surface, cleanEndpoint, Date.now() - startedAt) : null;
      })
      .catch(function () {
        return null;
      })
      .finally(function () {
        clearTimeout(timeout.timer);
      });
  }

  function resolveMonadProvider(options) {
    var defaultEndpoints = options.rescan ? RESCAN_MONAD_ENDPOINTS : DEFAULT_MONAD_ENDPOINTS;
    var endpoints = getStoredMonadEndpoints().concat(
      options.monadEndpoints && options.monadEndpoints.length ? options.monadEndpoints : defaultEndpoints,
    );
    var timeoutMs = Math.max(250, Number(options.monadScanTimeoutMs || DEFAULT_MONAD_SCAN_TIMEOUT_MS));
    var seen = new Set();
    var uniqueEndpoints = endpoints
      .map(normalizeMonadEndpointInput)
      .filter(function (endpoint) {
        if (!endpoint || seen.has(endpoint)) return false;
        seen.add(endpoint);
        return true;
      });
    return Promise.all(uniqueEndpoints.map(function (endpoint) {
      return probeMonadEndpoint(endpoint, timeoutMs);
    })).then(function (results) {
      return reduceMonadRoutes(results.filter(Boolean));
    });
  }

  function fetchJsonWithTimeout(url, init, timeoutMs) {
    init = init || {};
    var timeout = withTimeout(timeoutMs || 1200);
    return fetch(url, Object.assign({}, init, {
      headers: Object.assign(
        { accept: "application/json" },
        init.body ? { "content-type": "application/json" } : {},
        init.headers || {},
      ),
      signal: timeout.controller.signal,
    }))
      .then(function (response) {
        return response.json().catch(function () {
          return {};
        }).then(function (payload) {
          if (!response.ok) throw new Error(payload && (payload.error || payload.message) || ("HTTP " + response.status));
          return payload;
        });
      })
      .finally(function () {
        clearTimeout(timeout.timer);
      });
  }

  function monadsControlUnavailable(endpoint, error) {
    return {
      available: false,
      endpoint: endpoint || "",
      records: [],
      actions: [],
      commandActions: [],
      error: error || "",
      installCommand: "npm install -g monad.ai",
      startCommand: "monads start",
    };
  }

  function normalizeMonadsControlAction(value) {
    var name = readString(value && value.name, value);
    if (!name) return null;
    return {
      name: name,
      label: readString(value && value.label),
      command: readString(value && value.command),
      method: readString(value && value.method),
      path: readString(value && value.path),
      scope: readString(value && value.scope),
    };
  }

  function normalizeMonadsControlActions(command) {
    var explicit = Array.isArray(command && command.actions)
      ? command.actions.map(normalizeMonadsControlAction).filter(Boolean)
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

  function normalizeMonadsControlRecord(value) {
    var name = readString(value && value.name, value && value.record && value.record.name);
    if (!name) return null;
    return {
      name: name,
      port: Number((value && value.port) || (value && value.record && value.record.port)) || undefined,
      status: readString(value && value.status, value && value.state) || "unknown",
      namespace: readString(value && value.namespace, value && value.record && value.record.namespace),
      endpoint: readString(value && value.endpoint, value && value.record && value.record.endpoint),
      healthy: Boolean(value && value.healthy),
      error: readString(value && value.error),
    };
  }

  function resolveMonadsControl(monad) {
    if (!monad || !monad.endpoint) {
      return Promise.resolve(monadsControlUnavailable("", "No local monad is exposing the web control panel."));
    }
    var endpoint = monad.endpoint.replace(/\/+$/, "");
    return fetchJsonWithTimeout(endpoint + "/__monads", {}, 1400)
      .then(function (payload) {
        var records = (Array.isArray(payload && payload.monads) ? payload.monads : [])
          .map(normalizeMonadsControlRecord)
          .filter(Boolean);
        var command = (payload && payload.command) || {};
        var commandActions = normalizeMonadsControlActions(command);
        return {
          available: true,
          endpoint: endpoint,
          records: records,
          actions: commandActions.map(function (action) { return action.name; }),
          commandActions: commandActions,
          error: "",
          installCommand: readString(command.install) || "npm install -g monad.ai",
          startCommand: readString(command.start) || "monads start",
        };
      })
      .catch(function (error) {
        return monadsControlUnavailable(endpoint, errorMessage(error));
      });
  }

  function monadsFromDiscoveryState(state) {
    var rawMonads = Array.isArray(state && state.monads) ? state.monads : [];
    return rawMonads.map(function (monad) {
      var endpoint = normalizeMonadEndpointInput((monad && monad.endpoint) || (monad && monad.endpoints && monad.endpoints[0]));
      if (!endpoint) return null;
      return {
        id: readString(monad && monad.id, endpoint),
        name: readString(monad && monad.name, monad && monad.namespace, endpoint),
        endpoint: endpoint,
        aliases: Array.isArray(monad && monad.endpoints) ? monad.endpoints.map(normalizeMonadEndpointInput).filter(Boolean) : [endpoint],
        namespace: readString(monad && monad.namespace),
        status: monad && monad.healthy === false ? "offline" : "online",
        cost: inferCost(endpoint),
        capabilities: Array.isArray(monad && monad.capabilities) ? monad.capabilities : [],
        raw: monad,
      };
    }).filter(Boolean);
  }

  function monadsControlFromDiscoveryState(state) {
    var controls = Array.isArray(state && state.control) ? state.control : [];
    var control = controls.find(function (entry) { return entry && entry.available; }) || controls[0];
    if (!control || !control.available || !control.endpoint) {
      var aliveEndpoint = "";
      var endpoints = Array.isArray(state && state.endpoints) ? state.endpoints : [];
      var alive = endpoints.find(function (endpoint) { return endpoint && endpoint.status === "alive"; });
      aliveEndpoint = readString(state && state.source && state.source.surface && state.source.surface[0], alive && alive.url);
      return monadsControlUnavailable(aliveEndpoint, "No local monad is exposing the web control panel.");
    }
    var commandActions = normalizeMonadsControlActions(control.command);
    return {
      available: true,
      endpoint: normalizeMonadEndpointInput(control.endpoint),
      records: (Array.isArray(control.records) ? control.records : []).map(normalizeMonadsControlRecord).filter(Boolean),
      actions: commandActions.map(function (action) { return action.name; }),
      commandActions: commandActions,
      error: readString(control.error),
      installCommand: readString(control.command && control.command.install) || "npm install -g monad.ai",
      startCommand: readString(control.command && control.command.start) || "monads start",
    };
  }

  function costRank(cost) {
    var normalized = String(cost || "").toLowerCase();
    if (normalized.indexOf("low") >= 0 || normalized.indexOf("bajo") >= 0) return 0;
    if (normalized.indexOf("medium") >= 0 || normalized.indexOf("medio") >= 0) return 100;
    if (normalized.indexOf("high") >= 0 || normalized.indexOf("alto") >= 0) return 220;
    return 140;
  }

  function recommendedMonad(monads) {
    return monads.slice().sort(function (a, b) {
      return monadScore(a) - monadScore(b);
    })[0] || null;
  }

  function displayMonadName(monad) {
    var raw = String((monad && (monad.name || monad.id)) || "").trim();
    if (raw) return raw.replace(/^monad[-_]?/i, "") || raw;
    if (monad && monad.endpoint) {
      try {
        var url = new URL(monad.endpoint);
        return url.port || url.hostname;
      } catch (_) {
        return monad.endpoint;
      }
    }
    return "monad";
  }

  function resolveGuiRuntime() {
    var candidates = [
      global.GUI,
      global.ThisGUI,
      global.thisGUI,
      global["this.gui"],
      globalThis.GUI,
      globalThis.ThisGUI,
    ];
    for (var index = 0; index < candidates.length; index += 1) {
      var candidate = candidates[index];
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

  function resolveGuiCandidate(candidate) {
    if (candidate.source === "existing") {
      var existing = resolveGuiRuntime();
      if (existing) return Promise.resolve(existing);
      return Promise.reject(new Error("Existing GUI runtime not found"));
    }

    var assets = candidate.assets || {};
    if (!assets.bootstrap || !assets.gui) {
      return Promise.reject(new Error("GUI candidate missing assets: " + candidate.label));
    }

    global.process = global.process || { env: {} };
    global.process.env = global.process.env || {};
    global.process.env.NODE_ENV = global.process.env.NODE_ENV || "production";
    global.__THIS_GUI_DISABLE_AUTOBOOT__ = true;
    global.__THIS_GUI_BOOTSTRAP_ASSETS__ = {
      css: assets.css,
      gui: assets.gui,
      localReact: assets.localReact || assets.react,
      localReactDom: assets.localReactDom || assets.reactDom,
      react: assets.react,
      reactDom: assets.reactDom,
    };

    return Promise.resolve()
      .then(function () {
        if (!global.React && (assets.localReact || assets.react)) {
          return loadScriptOnce(assets.localReact || assets.react);
        }
        return null;
      })
      .then(function () {
        if (!global.ReactDOM && (assets.localReactDom || assets.reactDom)) {
          return loadScriptOnce(assets.localReactDom || assets.reactDom);
        }
        return null;
      })
      .then(function () {
        if (!global.ReactJSXRuntime && global.React && typeof global.React.createElement === "function") {
          global.ReactJSXRuntime = {
            jsx: global.React.createElement,
            jsxs: global.React.createElement,
            Fragment: global.React.Fragment,
          };
        }
        if (isFileProtocol()) {
          return Promise.resolve()
            .then(function () {
              if (assets.css) return loadStyleOnce(assets.css).catch(function () {
                return false;
              });
              return false;
            })
            .then(function () {
              return loadScriptOnce(assets.gui);
            })
            .then(function () {
              var GUI = resolveGuiRuntime();
              if (!GUI || (typeof GUI.mount !== "function" && typeof GUI.startApp !== "function")) {
                throw new Error("GUI runtime unavailable after loading " + candidate.label);
              }
              return GUI;
            });
        }
        return loadScriptOnce(assets.bootstrap);
      })
      .then(function () {
      var bootstrap =
        typeof global.bootGUI === "function"
          ? global.bootGUI
          : global.GUI && typeof global.GUI.bootstrap === "function"
            ? global.GUI.bootstrap
            : null;
      var runtime = bootstrap ? bootstrap(global.__THIS_GUI_BOOTSTRAP_ASSETS__) : resolveGuiRuntime();
      return Promise.resolve(runtime).then(function (GUI) {
        if (!GUI || (typeof GUI.mount !== "function" && typeof GUI.startApp !== "function")) {
          throw new Error("GUI runtime unavailable after loading " + candidate.label);
        }
        return GUI;
      });
    });
  }

  function resolveGUI(options) {
    var existing = resolveGuiRuntime();
    if (existing) {
      return Promise.resolve({
        GUI: existing,
        resolution: {
          status: "resolved",
          label: "existing GUI",
          source: "existing",
          detail: "already loaded",
          error: "",
        },
      });
    }

    var candidates = []
      .concat(options.guiCandidates || [])
      .concat(DEFAULT_LOCAL_GUI_CANDIDATES.filter(function (candidate) {
        var bootstrap = (candidate.assets && candidate.assets.bootstrap) || "";
        return !isFileProtocol() || bootstrap.indexOf("/") !== 0;
      }))
      .concat(options.allowCdn ? [DEFAULT_CDN_GUI_CANDIDATE] : []);
    var seen = new Set();
    var uniqueCandidates = candidates.filter(function (candidate) {
      var key = (candidate.assets && (candidate.assets.bootstrap || candidate.assets.gui)) || candidate.label;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    var failures = [];
    return uniqueCandidates.reduce(function (chain, candidate) {
      return chain.catch(function () {
        return resolveGuiCandidate(candidate)
          .then(function (GUI) {
            var resolution = {
              status: "resolved",
              label: candidate.label,
              source: candidate.source,
              detail: candidate.detail || "",
              logo: candidate.assets && candidate.assets.logo,
              error: "",
            };
            global.__ALL_THIS_GUI__ = GUI;
            global.__ALL_THIS_GUI_RESOLUTION__ = resolution;
            return { GUI: GUI, resolution: resolution };
          })
          .catch(function (error) {
            failures.push(candidate.label + ": " + errorMessage(error));
            throw error;
          });
      });
    }, Promise.reject(new Error("start GUI resolution"))).catch(function () {
      var resolution = {
        status: "offline",
        label: "GUI",
        source: "unresolved",
        detail: "not resolved",
        error: failures.length ? failures.join("\n") : "GUI unavailable",
      };
      global.__ALL_THIS_GUI_RESOLUTION__ = resolution;
      throw new Error(resolution.error);
    });
  }

  function guiNode(type, props, children) {
    var node = { type: type, props: Object.assign({}, props || {}) };
    if (children !== undefined) node.children = children;
    return node;
  }

  function guiText(text, props) {
    return guiNode("Typography", Object.assign({ text: text }, props || {}));
  }

  function resolveGuiMonadComponent(GUI) {
    return (GUI && (GUI.Monad || (GUI.widgets && GUI.widgets.Monad) || (GUI.Widgets && GUI.Widgets.Monad) || (GUI.default && GUI.default.Monad))) || null;
  }

  function hashString(value) {
    var text = String(value || "");
    var hash = 0;
    for (var index = 0; index < text.length; index += 1) {
      hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
    }
    return Math.abs(hash);
  }

  function guiPixelAvatar(seed) {
    var hash = hashString(seed);
    var hue = hash % 360;
    var cells = [];
    for (var row = 0; row < 5; row += 1) {
      for (var col = 0; col < 5; col += 1) {
        var mirrorCol = col > 2 ? 4 - col : col;
        var bitIndex = row * 3 + mirrorCol;
        var active = ((hash >> bitIndex) & 1) === 1 || (row === 2 && col === 2);
        cells.push(guiNode("Box", {
          component: "span",
          sx: {
            borderRadius: "1px",
            bgcolor: active ? (((hash >> (bitIndex + 8)) & 1) ? "hsl(" + ((hue + 42) % 360) + " 16% 50%)" : "hsl(" + hue + " 18% 76%)") : "transparent",
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
        background: "radial-gradient(circle at 34% 26%, rgba(231,238,240,0.14), transparent 20%), radial-gradient(circle at 64% 72%, rgba(0,0,0,0.62), transparent 42%), #111316",
        imageRendering: "pixelated",
      },
    }, cells);
  }

  function guiMonadAiBubble(GUI, seed, kind, sx) {
    var React = global.React;
    var MonadComponent = resolveGuiMonadComponent(GUI);
    if (!React || typeof React.createElement !== "function" || typeof MonadComponent !== "function") {
      return guiPixelAvatar(seed);
    }
    return guiNode("Box", {
      sx: Object.assign({
        position: "relative",
        minHeight: 132,
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
      }, sx || {}),
      children: React.createElement(MonadComponent, {
        variant: "bubble",
        mode: "contained",
        kind: kind,
        seed: String(seed || ""),
      }),
    });
  }

  function guiStatusCard(config) {
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
        sx: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.25 },
      }, [
        guiNode("Box", { sx: { minWidth: 0 } }, [
          guiText(config.title, { variant: "subtitle1", sx: { fontWeight: 500, lineHeight: 1.35 } }),
          config.subtitle ? guiText(config.subtitle, { variant: "body2", sx: { color: "text.secondary", lineHeight: 1.5 } }) : null,
        ].filter(Boolean)),
        config.state ? guiNode("Chip", { label: config.state, size: "small", variant: "outlined" }) : null,
      ].filter(Boolean)),
      config.chips && config.chips.length
        ? guiNode("Box", { sx: { display: "flex", gap: 0.75, flexWrap: "wrap" } },
          config.chips.map(function (chip) {
            return guiNode("Chip", { label: chip, size: "small" });
          }))
        : null,
    ].concat(config.body || [], config.actions && config.actions.length
      ? [guiNode("Box", { sx: { display: "flex", gap: 1, flexWrap: "wrap" } }, config.actions)]
      : []).filter(Boolean));
  }

  function browserConfirm(message) {
    return typeof global.confirm === "function" ? Boolean(global.confirm(message)) : true;
  }

  function browserPrompt(message, fallback) {
    return typeof global.prompt === "function" ? global.prompt(message, fallback || "") : null;
  }

  var INFO_MODAL_ID = "all-this-info-modal";

  function stripAnsi(str) {
    return String(str || "").replace(/\x1B\[[0-9;]*[mGKHF]/g, "");
  }

  function showInfoModal(title, content) {
    var existing = document.getElementById(INFO_MODAL_ID);
    if (existing) existing.parentNode && existing.parentNode.removeChild(existing);

    var overlay = document.createElement("div");
    overlay.id = INFO_MODAL_ID;
    overlay.setAttribute(
      "style",
      "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.72);display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box",
    );

    function close() {
      var el = document.getElementById(INFO_MODAL_ID);
      if (el && el.parentNode) el.parentNode.removeChild(el);
      document.removeEventListener("keydown", handleKey);
    }

    function handleKey(e) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("keydown", handleKey);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });

    overlay.innerHTML = [
      '<div style="background:#111316;border:1px solid rgba(255,255,255,0.1);border-radius:12px;width:min(100%,780px);max-height:82vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.5)">',
      '  <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.08);flex-shrink:0">',
      '    <span style="font:500 13px/1 -apple-system,BlinkMacSystemFont,\'SF Pro Text\',Inter,sans-serif;color:#e8eaed">' + escapeHtml(title) + "</span>",
      '    <button data-modal-close style="background:none;border:none;cursor:pointer;color:#9da4aa;font-size:16px;line-height:1;padding:3px 7px;border-radius:4px">&#x2715;</button>',
      "  </div>",
      '  <pre style="flex:1;overflow:auto;margin:0;padding:16px 18px;font:12px/1.65 \'SFMono-Regular\',Menlo,Consolas,monospace;color:#c9d1d9;white-space:pre-wrap;word-break:break-all;min-height:0;background:rgba(0,0,0,0.18)">' + escapeHtml(stripAnsi(content)) + "</pre>",
      '  <div style="padding:10px 18px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:flex-end;flex-shrink:0">',
      '    <button data-modal-close style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:#e8eaed;cursor:pointer;border-radius:6px;padding:6px 18px;font:13px -apple-system,BlinkMacSystemFont,\'SF Pro Text\',Inter,sans-serif">Close</button>',
      "  </div>",
      "</div>",
    ].join("\n");

    overlay.querySelectorAll("[data-modal-close]").forEach(function (btn) {
      btn.addEventListener("click", close);
    });

    document.body.appendChild(overlay);
  }

  function showMonadsInstallHelp(control) {
    var needsRestart = /PATH_NOT_FOUND|404|NOT_FOUND/i.test((control && control.error) || "");
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
        control.error ? "Detail: " + control.error : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  function refreshAfterMonadControl(onRescan) {
    if (typeof onRescan === "function") onRescan();
  }

  function runMonadsControlAction(control, path, init, onRescan) {
    if (!control.available || !control.endpoint) {
      showMonadsInstallHelp(control);
      return Promise.resolve(null);
    }
    return fetchJsonWithTimeout(control.endpoint + path, init, 15000)
      .then(function (payload) {
        refreshAfterMonadControl(onRescan);
        return payload;
      })
      .catch(function (error) {
        showInfoModal("monads control error", errorMessage(error));
        return null;
      });
  }

  function runMonadLifecycleAction(control, path, onRescan, discovery, init) {
    var task = function () {
      return runMonadsControlAction(control, path, init || { method: "POST" }, onRescan);
    };
    if (discovery && typeof discovery.withSettling === "function") {
      discovery.withSettling(task);
      return;
    }
    task();
  }

  function startMonadFromWeb(control, onRescan, discovery) {
    if (!control.available) {
      showMonadsInstallHelp(control);
      return;
    }
    var name = browserPrompt("Monad name (blank = auto):", "");
    if (name === null) return;
    var rawPort = browserPrompt("Port (blank = auto):", "");
    if (rawPort === null) return;
    var port = String(rawPort).trim() ? Number(String(rawPort).trim()) : undefined;
    if (port !== undefined && (!Number.isInteger(port) || port < 1 || port > 65535)) {
      browserAlert("Port must be a number from 1 to 65535.");
      return;
    }
    var task = function () {
      return runMonadsControlAction(control, "/__monads/start", {
        method: "POST",
        body: JSON.stringify({ name: String(name).trim() || undefined, port: port }),
      }, onRescan);
    };
    if (discovery && typeof discovery.withSettling === "function") {
      discovery.withSettling(task);
      return;
    }
    task();
  }

  function addManualMonadEndpoint(onRescan, discovery) {
    var value = browserPrompt("Monad endpoint:", "http://127.0.0.1:8161");
    if (value === null) return;
    var endpoint = addStoredMonadEndpoint(value);
    if (!endpoint) {
      browserAlert("That endpoint does not look valid.");
      return;
    }
    if (discovery && typeof discovery.addEndpoint === "function") {
      discovery.addEndpoint(endpoint);
    } else {
      refreshAfterMonadControl(onRescan);
    }
  }

  function clearManualMonadEndpoints(onRescan, discovery) {
    var manual = getStoredMonadEndpoints();
    setStoredMonadEndpoints([]);
    if (discovery && typeof discovery.removeEndpoint === "function") {
      manual.forEach(function (endpoint) { discovery.removeEndpoint(endpoint); });
    } else {
      refreshAfterMonadControl(onRescan);
    }
  }

  function showMonadsCommandHelp(control) {
    var lines = (control.commandActions || [])
      .map(function (action) { return action.command || action.name; })
      .filter(Boolean);
    showInfoModal(
      "monads commands",
      ["Available from this local monad:", ""].concat(lines.length ? lines : [control.startCommand]).join("\n"),
    );
  }

  function onMonadFromWeb(control, record, onRescan, discovery) {
    runMonadLifecycleAction(control, monadsControlActionPath(control, record, "on", "resume", "start"), onRescan, discovery);
  }

  function pauseMonadFromWeb(control, record, onRescan, discovery) {
    runMonadLifecycleAction(control, monadsControlActionPath(control, record, "pause"), onRescan, discovery);
  }

  function restartMonadFromWeb(control, record, onRescan, discovery) {
    if (!browserConfirm("Restart " + record.name + "?")) return;
    runMonadLifecycleAction(control, monadsControlActionPath(control, record, "restart"), onRescan, discovery);
  }

  function offMonadFromWeb(control, record, onRescan, discovery) {
    if (!browserConfirm("Turn off " + record.name + "?")) return;
    runMonadLifecycleAction(control, monadsControlActionPath(control, record, "off", "stop"), onRescan, discovery);
  }

  function deleteMonadFromWeb(control, record, onRescan, discovery) {
    var confirmed = browserConfirm(
      "Delete " + record.name + "? This will stop it and remove its local runtime data and logs.",
    );
    if (!confirmed) return;
    runMonadLifecycleAction(control, monadsControlActionPath(control, record, "delete", "rm", "remove"), onRescan, discovery);
  }

  function showMonadStatusFromWeb(control, record) {
    runMonadsControlAction(control, "/__monads/" + encodeURIComponent(record.name) + "/status", { method: "GET" })
      .then(function (payload) {
        var monad = payload && payload.monad;
        if (!monad) return;
        showInfoModal(
          record.name + " — status",
          [
            "name:       " + monad.name,
            "status:     " + monad.status,
            "namespace:  " + (monad.namespace || "-"),
            "endpoint:   " + (monad.endpoint || "-"),
            "pid:        " + (monad.pid || "-"),
            monad.error ? "error:      " + monad.error : "",
          ]
            .filter(Boolean)
            .join("\n"),
        );
      });
  }

  function showMonadLogsFromWeb(control, record) {
    runMonadsControlAction(control, "/__monads/" + encodeURIComponent(record.name) + "/logs?lines=80", { method: "GET" })
      .then(function (payload) {
        var monad = payload && payload.monad;
        if (!monad) return;
        var logContent = [
          monad.stdout || "(stdout empty)",
          monad.stderr ? "\n[stderr]\n" + monad.stderr : "",
        ]
          .filter(Boolean)
          .join("");
        showInfoModal(record.name + " — logs", logContent);
      });
  }

  function buildLeftRailElements(monads) {
    return [
      { type: "link", props: { icon: "neurology", iconColor: "var(--gui-primary)", label: ".me", href: "#me", active: true } },
      { type: "link", props: { icon: "widgets", iconColor: "var(--gui-secondary)", label: "GUI", href: "#gui" } },
      { type: "link", props: { icon: "hub", iconColor: "var(--gui-text-secondary)", label: monads.length ? "Monads" : "monads offline", href: "#monads" } },
    ];
  }

  function invokeGuiControl(name, legacyName) {
    var fn =
      (global.GUI && typeof global.GUI[name] === "function" ? global.GUI[name] : null) ||
      (typeof global[name] === "function" ? global[name] : null) ||
      (legacyName && typeof global[legacyName] === "function" ? global[legacyName] : null);
    if (typeof fn === "function") fn();
  }

  function buildSettingsMenuItems(onRescan) {
    return [
      { label: "Rescan", icon: "refresh", onClick: onRescan },
      { label: "Admin View", icon: "visibility", onClick: function () { invokeGuiControl("toggleAdminView", "__guiToggleAdminView"); } },
      { label: "Inspector", icon: "code", inspectorControl: true, onClick: function () { invokeGuiControl("toggleInspector", "__guiToggleInspector"); } },
    ].filter(function (item) {
      return typeof item.onClick === "function";
    });
  }

  function buildLeftBar(GUI, monads, onRescan) {
    return {
      initialView: "rail",
      elements: buildLeftRailElements(monads),
      footerElements: [
        { type: "menu", props: { icon: "settings", label: "Settings", items: buildSettingsMenuItems(onRescan) } },
      ],
    };
  }

  function buildMonadsGrid(GUI, monads, recommended) {
    if (!monads.length) return null;
    return guiNode("Box", {
      sx: {
        display: "grid",
        gridTemplateColumns: { xs: "repeat(auto-fit, minmax(118px, 1fr))", sm: "repeat(auto-fit, minmax(132px, 1fr))" },
        gap: { xs: 1.25, sm: 1.75 },
      },
    }, monads.map(function (monad) {
      var isRecommended = recommended && recommended.endpoint === monad.endpoint;
      var name = displayMonadName(monad);
      return guiNode("Paper", {
        component: "a",
        href: monad.endpoint.replace(/\/+$/, "") + "/",
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

  function monadsControlAction(control) {
    var commandActions = Array.isArray(control.commandActions) ? control.commandActions : [];
    var requested = Array.prototype.slice.call(arguments, 1).map(function (name) { return String(name).toLowerCase(); });
    return commandActions.find(function (action) { return requested.indexOf(String(action.name).toLowerCase()) >= 0; }) || null;
  }

  function monadsControlHasAction(control) {
    var available = new Set((control.actions || []).map(function (name) { return String(name).toLowerCase(); }));
    for (var index = 1; index < arguments.length; index += 1) {
      if (available.has(String(arguments[index]).toLowerCase())) return true;
    }
    return Boolean(monadsControlAction.apply(null, arguments));
  }

  function monadsControlActionPath(control, record) {
    var names = Array.prototype.slice.call(arguments, 2);
    var action = monadsControlAction.apply(null, [control].concat(names));
    if (action && action.path) {
      return action.path.replace(/:name/g, encodeURIComponent(record.name));
    }
    var suffix = names.find(function (name) { return monadsControlHasAction(control, name); }) || names[0] || "status";
    return "/__monads/" + encodeURIComponent(record.name) + "/" + suffix;
  }

  function isMonadOnline(record) {
    return record.status === "online" || record.status === "running";
  }

  function buildMonadsControlRows(control, onRescan, discovery) {
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

    var header = guiNode("Box", {
      sx: {
        display: { xs: "none", sm: "grid" },
        gridTemplateColumns: "minmax(110px, 1fr) 64px 90px minmax(120px, 1.2fr) minmax(250px, auto)",
        gap: 1,
        px: 0.5,
        color: "text.secondary",
      },
    }, ["name", "port", "status", "namespace", ""].map(function (label) {
      return guiText(label, { variant: "caption" });
    }));

    var rows = control.records.map(function (record) {
      return guiNode("Box", {
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
      }, (function () {
        var online = isMonadOnline(record);
        var paused = record.status === "paused";
        return [
        guiText(record.name, { variant: "body2", sx: { fontWeight: 500 } }),
        guiText(record.port ? String(record.port) : "-", { variant: "caption", sx: { color: "text.secondary", fontFamily: "monospace" } }),
        guiNode("Chip", { label: record.status, size: "small", variant: online ? "filled" : "outlined" }),
        guiText(record.namespace || "-", {
          variant: "caption",
          sx: { color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
        }),
        guiNode("Box", { sx: { display: "flex", gap: 0.5, flexWrap: "wrap", justifyContent: { xs: "flex-start", sm: "flex-end" } } }, [
          monadsControlHasAction(control, "status")
            ? guiNode("Button", { variant: "text", size: "small", label: "Status", onClick: function () { showMonadStatusFromWeb(control, record); } })
            : null,
          monadsControlHasAction(control, "logs")
            ? guiNode("Button", { variant: "text", size: "small", label: "Logs", onClick: function () { showMonadLogsFromWeb(control, record); } })
            : null,
          !online && monadsControlHasAction(control, "on", "resume")
            ? guiNode("Button", { variant: paused ? "contained" : "outlined", size: "small", label: "On", onClick: function () { onMonadFromWeb(control, record, onRescan, discovery); } })
            : null,
          online && monadsControlHasAction(control, "pause")
            ? guiNode("Button", { variant: "outlined", size: "small", label: "Pause", onClick: function () { pauseMonadFromWeb(control, record, onRescan, discovery); } })
            : null,
          monadsControlHasAction(control, "restart")
            ? guiNode("Button", { variant: "text", size: "small", label: "Restart", onClick: function () { restartMonadFromWeb(control, record, onRescan, discovery); } })
            : null,
          (online || paused) && monadsControlHasAction(control, "off", "stop")
            ? guiNode("Button", { variant: "text", size: "small", label: "Off", onClick: function () { offMonadFromWeb(control, record, onRescan, discovery); } })
            : null,
          monadsControlHasAction(control, "delete", "rm", "remove")
            ? guiNode("Button", { variant: "text", size: "small", color: "error", label: "Delete", onClick: function () { deleteMonadFromWeb(control, record, onRescan, discovery); } })
            : null,
        ].filter(Boolean)),
        ];
      })());
    });

    return [header].concat(rows);
  }

  function buildMonadsControlCard(control, onRescan, discovery) {
    var manualEndpoints = getStoredMonadEndpoints();
    return guiStatusCard({
      title: "Monads Control Panel",
      subtitle: control.available
        ? "The CLI registry is available through the local monad."
        : "The browser needs a local monad to expose the monads command.",
      state: control.available ? "ready" : "install",
      chips: control.available ? [control.records.length + " known", "monads"] : ["monads not detected"],
      body: buildMonadsControlRows(control, onRescan, discovery),
      actions: [
        guiNode("Button", {
          variant: "contained",
          size: "small",
          label: "Start a New Monad",
          onClick: function () { startMonadFromWeb(control, onRescan, discovery); },
        }),
        guiNode("Button", { variant: "outlined", size: "small", label: "Rescan", onClick: onRescan }),
        guiNode("Button", {
          variant: "outlined",
          size: "small",
          label: "Add endpoint",
          onClick: function () { addManualMonadEndpoint(onRescan, discovery); },
        }),
        control.available ? guiNode("Button", {
          variant: "text",
          size: "small",
          label: "Commands",
          onClick: function () { showMonadsCommandHelp(control); },
        }) : null,
        manualEndpoints.length ? guiNode("Button", {
          variant: "text",
          size: "small",
          label: "Clear manual",
          onClick: function () { clearManualMonadEndpoints(onRescan, discovery); },
        }) : null,
        control.available ? null : guiNode("Button", {
          variant: "text",
          size: "small",
          label: "Install help",
          onClick: function () { showMonadsInstallHelp(control); },
        }),
      ].filter(Boolean),
    });
  }

  function resolveMainSurface(input) {
    var GUI = input.GUI;
    var meBoot = input.meBoot;
    var monads = input.monads;
    var monadsControl = input.monadsControl;
    var guiResolution = input.guiResolution;
    var onRescan = input.onRescan;
    var onOpenInstallGuide = input.onOpenInstallGuide;
    var discovery = input.discovery;
    var best = recommendedMonad(monads);
    var bestName = best ? displayMonadName(best) : "none";
    var meState = meBoot.status === "initiated" ? "online" : meBoot.status;

    return Promise.resolve(guiNode("Box", {
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
              ? ['me[@]("' + meBoot.expression + '")', meBoot.error || "kernel unavailable"]
              : ['me[@]("' + meBoot.expression + '")', "kernel local"],
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
          chips: monads.length ? [monads.length + " reduced", "best: " + bestName] : ["local first", "network optional"],
          body: monads.length ? [buildMonadsGrid(GUI, monads, best)] : [],
          actions: best
            ? [guiNode("Button", { variant: "outlined", size: "small", label: "Open", href: best.endpoint.replace(/\/+$/, "") + "/" })]
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
    ]));
  }

  function buildMonadInstallGuideSurface(onBack) {
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

  function buildAllThisLayoutSpec(input) {
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

  function startAllThis(options) {
    options = options || {};
    var root = resolveRoot(options.root);
    var me = null;
    var meBoot = null;
    var GUI = null;
    var guiResolution = null;
    var discovery = null;
    var fallbackMonads = [];
    var fallbackMonadsControl = monadsControlUnavailable("", "Monad discovery runtime unavailable.");
    var lastRenderFingerprint = "";
    var currentResult = null;

    if (!options.rescan) {
      notify(options, { step: "boot:start", detail: "all.this package global boot" });
      ensureBootScreen(root, "all.this", "Resolving local .me, monads, and GUI.");
    }

    function renderFromState(state, force) {
      var monads = discovery ? monadsFromDiscoveryState(state) : fallbackMonads;
      var monadsControl = discovery ? monadsControlFromDiscoveryState(state) : fallbackMonadsControl;
      var shouldOpenGuide = typeof window !== "undefined" && window.location.hash === "#view=monad-install";
      var view = shouldOpenGuide ? "monad-install" : "main";
      var renderFingerprint = JSON.stringify({
        view: view,
        discovery: (state && state.fingerprint) || "",
        monads: monads.map(function (monad) { return [monad.id, monad.endpoint, monad.status]; }),
        control: [
          monadsControl.available,
          monadsControl.endpoint,
          monadsControl.records.map(function (record) { return [record.name, record.status, record.endpoint]; }),
        ],
        gui: guiResolution && guiResolution.source,
        me: meBoot && meBoot.status,
      });
      if (!force && renderFingerprint === lastRenderFingerprint) return Promise.resolve(currentResult);
      lastRenderFingerprint = renderFingerprint;

      var rescan = function () {
        if (discovery && typeof discovery.rescan === "function") {
          discovery.rescan({ mode: "fast", reason: "all.this:rescan" });
          return;
        }
        startAllThis(Object.assign({}, options, { rescan: true })).catch(function (error) {
          showInfoModal("rescan error", errorMessage(error));
        });
      };
      var backFromGuide = function () {
        if (typeof window !== "undefined") {
          history.replaceState(null, "", window.location.pathname + window.location.search);
        }
        renderFromState((discovery && discovery.getState && discovery.getState()) || state, true);
      };
      var openInstallGuide = function (event) {
        if (event && typeof event.preventDefault === "function") event.preventDefault();
        if (typeof window !== "undefined") {
          history.replaceState(null, "", "#view=monad-install");
        }
        renderFromState((discovery && discovery.getState && discovery.getState()) || state, true);
      };

      var surfacePromise = shouldOpenGuide
        ? Promise.resolve(buildMonadInstallGuideSurface(backFromGuide))
        : resolveMainSurface({
            GUI: GUI,
            me: me,
            meBoot: meBoot,
            monads: monads,
            monadsControl: monadsControl,
            guiResolution: guiResolution,
            onRescan: rescan,
            onOpenInstallGuide: openInstallGuide,
            discovery: discovery,
          });

      return surfacePromise.then(function (surface) {
        var spec = buildAllThisLayoutSpec({ GUI: GUI, me: me, monads: monads, surface: surface, onRescan: rescan });
        if (typeof GUI.mount !== "function") throw new Error("[all.this] GUI.mount unavailable");
        if (!options.rescan && (!currentResult || !currentResult.mount)) root.innerHTML = "";
        var mount = GUI.mount(spec, root, {
          gui: GUI,
          me: me,
          devtools: { inspector: false, adminView: false },
        });
        currentResult = { GUI: GUI, me: me, monads: monads, monadsControl: monadsControl, spec: spec, mount: mount, meBoot: meBoot, guiResolution: guiResolution };
        global.__ALL_THIS_BOOT__ = currentResult;
        notify(options, { step: "boot:mounted", me: meBoot, monads: monads, gui: guiResolution });
        return currentResult;
      });
    }

    return resolveMeKernel(options)
      .then(function (result) {
        me = result.me;
        meBoot = result.boot;
        notify(options, { step: "me:resolve:done", me: meBoot });
        if (!options.rescan) ensureBootScreen(root, "all.this", "Resolving GUI local-first.");
        notify(options, { step: "gui:resolve:start", me: meBoot, monads: [] });
        return resolveGUI(Object.assign({}, options, { monads: [] }));
      })
      .then(function (resolved) {
        GUI = resolved.GUI;
        guiResolution = resolved.resolution;
        notify(options, { step: "gui:resolve:done", me: meBoot, monads: [], gui: guiResolution });
        discovery = createAllThisMonadDiscovery(GUI, options);
        var previousDiscovery = global.__ALL_THIS_MONAD_DISCOVERY__;
        if (previousDiscovery && previousDiscovery !== discovery && typeof previousDiscovery.stop === "function") {
          previousDiscovery.stop();
        }
        global.__ALL_THIS_MONAD_DISCOVERY__ = discovery;
        currentResult = { GUI: GUI, me: me, monads: [], monadsControl: fallbackMonadsControl, spec: null, mount: null, meBoot: meBoot, guiResolution: guiResolution };

        if (!discovery) {
          notify(options, { step: "monad:scan:start", me: meBoot });
          return resolveMonadProvider(options)
            .then(function (resolvedMonads) {
              fallbackMonads = resolvedMonads;
              notify(options, { step: "monad:scan:done", me: meBoot, monads: fallbackMonads });
              return resolveMonadsControl(recommendedMonad(fallbackMonads));
            })
            .then(function (resolvedControl) {
              fallbackMonadsControl = resolvedControl;
              return renderFromState({ fingerprint: "fallback" }, true);
            });
        }

        notify(options, { step: "monad:discovery:start", me: meBoot });
        discovery.subscribe(function (state) {
          renderFromState(state).catch(function (error) {
            showInfoModal("render error", errorMessage(error));
          });
        });
        discovery.start();
        var wait = typeof discovery.waitForChange === "function"
          ? discovery.waitForChange({
              timeoutMs: Math.max(1200, DEFAULT_MONAD_SCAN_TIMEOUT_MS + 700),
              predicate: function (state) { return !!(state && state.lastUpdatedAt); },
            }).catch(function () { return null; })
          : Promise.resolve(null);
        return wait.then(function () {
          return renderFromState(discovery.getState(), true);
        });
      });
  }

  global.AllThisBoot = {
    version: BOOT_VERSION,
    loadScriptOnce: loadScriptOnce,
    resolveMeKernel: resolveMeKernel,
    resolveMonadProvider: resolveMonadProvider,
    reduceMonadRoutes: reduceMonadRoutes,
    resolveMonadsControl: resolveMonadsControl,
    recommendedMonad: recommendedMonad,
    resolveGUI: resolveGUI,
    buildLeftRailElements: buildLeftRailElements,
    resolveMainSurface: resolveMainSurface,
    buildAllThisLayoutSpec: buildAllThisLayoutSpec,
    startAllThis: startAllThis,
    default: startAllThis,
  };
})(globalThis);
