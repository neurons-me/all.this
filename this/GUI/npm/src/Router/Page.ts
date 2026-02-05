// src/Router/Page.ts
//
// Page + Link core model for this.GUI routing.
// - Page is the canonical "address" (input) of the system.
// - Link is a directed edge from one Page to another.
// This file is intentionally React-free (pure TS), even if it lives under Router/.
export type Page = string;

/**
 * A directed edge in the navigation graph.
 * `to` can be external; `kind` can be derived by the router at runtime.
 */
export type Link = {
  from: Page;
  to: Page;
  kind?: "internal" | "external";
  label?: string;
  // Signals (optional; useful for analytics / learning)
  clicks?: number;
  weight?: number;
  lastUsedAt?: number;
};

/**
 * Canonicalize any href-like input into a Page id.
 *
 * Default policy (web):
 *   Page = origin + pathname
 * and we intentionally DROP search/hash to keep Page identity stable.
 *
 * Notes:
 * - Accepts absolute URLs and relative paths.
 * - In non-browser runtimes, it falls back to best-effort normalization.
 */
export function canonicalizePage(input: string, baseOrigin?: string): Page {
  const raw = String(input ?? "").trim();
  if (!raw) return "/";
  const origin =
    baseOrigin ??
    (typeof window !== "undefined" && window.location ? window.location.origin : undefined);
  // If we can use URL parsing (browser or node), do it.
  try {
    // `new URL(relative, base)` requires a base for relative paths.
    const url = origin ? new URL(raw, origin) : new URL(raw);
    return `${url.origin}${url.pathname}` as Page;
  } catch {
    // Best-effort fallback (no URL base available).
    // Strip hash/query; keep leading slash if present.
    const noHash = raw.split("#")[0] ?? raw;
    const noQuery = noHash.split("?")[0] ?? noHash;
    return (noQuery || "/") as Page;
  }
}

/**
 * Convenience: get the current Page from window.location using the canonical policy.
 */
export function getCurrentPage(): Page {
  if (typeof window === "undefined" || !window.location) return "/";
  return canonicalizePage(window.location.href, window.location.origin);
}

/**
 * Build a Link object with canonicalized endpoints.
 * Router can set `kind` based on origin comparison when running in the browser.
 */
export function makeLink(from: string, to: string, baseOrigin?: string): Link {
  const cFrom = canonicalizePage(from, baseOrigin);
  const cTo = canonicalizePage(to, baseOrigin);
  return { from: cFrom, to: cTo };
}

/**
 * Determine whether a canonical Page is internal to a given origin.
 * If origin is not available, returns true if the page is not an absolute http(s) URL.
 */
export function isInternalPage(page: Page, origin?: string): boolean {
  const base =
    origin ?? (typeof window !== "undefined" && window.location ? window.location.origin : undefined);
  // For canonical pages produced by canonicalizePage, page will be absolute if origin was available.
  if (base) return page.startsWith(base);
  // Fallback heuristics
  return !/^https?:\/\//i.test(page);
}