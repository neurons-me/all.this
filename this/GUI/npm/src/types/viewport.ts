// src/types/viewport.ts
// Shared viewport types + helpers for responsive, declarative variants.
// These utilities do not depend on React. They accept an optional MUI Theme
// but also work without it (fallbacks to MUI default breakpoint values).

// ---- Types -----------------------------------------------------------------

/** MUI-aligned viewport keys. Keep in sync with your theme breakpoints. */
export type ViewportKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Map viewport → variant/value. You may also include a global `default`. */
export type ViewportMap<TVariant extends string | number | boolean | object> = Partial<
  Record<ViewportKey, TVariant>
> & { default?: TVariant };

/**
 * Prop that can be a single value (applies to all sizes) or a map by viewport.
 * Examples:
 *  - "pill"
 *  - { xs: "icons", sm: "pill", md: "pill", lg: "pill" }
 */
export type ViewportProp<TVariant extends string | number | boolean | object> =
  | TVariant
  | ViewportMap<TVariant>;

/** Options for resolution helpers. */
export type ViewportResolveOptions = {
  /** Force a specific width (useful in unit tests or storybook containers). */
  widthOverride?: number;
  /** Fallback key when no direct match is found. Defaults to last matching by min-width. */
  fallbackKey?: ViewportKey;
};

// ---- Internals --------------------------------------------------------------

/** Default MUI breakpoint mins used when no theme is provided. */
const DEFAULT_MINS: Record<ViewportKey, number> = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

/** Default key order (small → large). */
const DEFAULT_ORDER: ViewportKey[] = ['xs', 'sm', 'md', 'lg', 'xl'];

/** Narrow theme shape we care about; avoids hard dependency on @mui types. */
type MaybeMuiTheme = {
  breakpoints?: {
    values?: Partial<Record<ViewportKey, number>>;
  };
};

/** Safely read breakpoint mins from a MUI theme; otherwise use defaults. */
export function getBreakpointMins(theme?: MaybeMuiTheme): Record<ViewportKey, number> {
  const v = (theme?.breakpoints?.values ?? {}) as Partial<Record<ViewportKey, number>>;
  return {
    xs: Number.isFinite(v.xs!) ? (v.xs as number) : DEFAULT_MINS.xs,
    sm: Number.isFinite(v.sm!) ? (v.sm as number) : DEFAULT_MINS.sm,
    md: Number.isFinite(v.md!) ? (v.md as number) : DEFAULT_MINS.md,
    lg: Number.isFinite(v.lg!) ? (v.lg as number) : DEFAULT_MINS.lg,
    xl: Number.isFinite(v.xl!) ? (v.xl as number) : DEFAULT_MINS.xl,
  };
}

/** Return the active viewport key for a given width using min-width semantics. */
export function keyForWidth(width: number, theme?: MaybeMuiTheme): ViewportKey {
  const mins = getBreakpointMins(theme);
  // Pick the largest key whose min ≤ width
  let current: ViewportKey = 'xs';
  for (const k of DEFAULT_ORDER) {
    if (width >= mins[k]) current = k;
  }
  return current;
}

/**
 * Resolve a ViewportProp to a concrete value for the current width.
 * - If `prop` is a single value, returns it directly.
 * - If it's a map, returns `map[activeKey]`, falling back to:
 *   `map.default` → first defined in xs→xl order → undefined.
 */
export function resolveViewportProp<TVariant extends string | number | boolean | object>(
  prop: ViewportProp<TVariant>,
  theme?: MaybeMuiTheme,
  opts: ViewportResolveOptions = {}
): TVariant | undefined {
  // Simple (scalar) value → universal
  if (prop == null || typeof prop !== 'object' || Array.isArray(prop)) {
    return prop as TVariant;
  }

  // Map case
  const map = prop as ViewportMap<TVariant>;
  const width =
    typeof opts.widthOverride === 'number'
      ? opts.widthOverride
      : (typeof window !== 'undefined' ? window.innerWidth : DEFAULT_MINS.xs);

  const activeKey = keyForWidth(width, theme);
  const pick =
    (map as any)[activeKey] ??
    map.default ??
    (DEFAULT_ORDER.find((k) => (map as any)[k] != null)
      ? (map as any)[DEFAULT_ORDER.find((k) => (map as any)[k] != null)!]
      : undefined);

  return pick as TVariant | undefined;
}

/**
 * Shallow-merge a base object with the resolved override from a viewport map.
 * Useful for config objects where each viewport only overrides a few keys.
 *
 * Example:
 *   const base = { gap: 8, size: 'pill' }
 *   const map  = { xs: { size: 'icons' } }
 *   → resolveResponsiveConfig(base, map) === { gap: 8, size: 'icons' }
 */
export function resolveResponsiveConfig<T extends Record<string, any>>(
  base: T | undefined,
  map: ViewportMap<Partial<T>> | undefined,
  theme?: MaybeMuiTheme,
  opts: ViewportResolveOptions = {}
): T | undefined {
  if (base == null && map == null) return undefined;
  if (!map || typeof map !== 'object') return base as T | undefined;

  const override = resolveViewportProp<Partial<T>>(map as any, theme, opts) || {};
  return { ...(base as T), ...override };
}
