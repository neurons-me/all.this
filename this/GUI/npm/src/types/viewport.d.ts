/** MUI-aligned viewport keys. Keep in sync with your theme breakpoints. */
export type ViewportKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
/** Map viewport → variant/value. You may also include a global `default`. */
export type ViewportMap<TVariant extends string | number | boolean | object> = Partial<Record<ViewportKey, TVariant>> & {
    default?: TVariant;
};
/**
 * Prop that can be a single value (applies to all sizes) or a map by viewport.
 * Examples:
 *  - "pill"
 *  - { xs: "icons", sm: "pill", md: "pill", lg: "pill" }
 */
export type ViewportProp<TVariant extends string | number | boolean | object> = TVariant | ViewportMap<TVariant>;
/** Options for resolution helpers. */
export type ViewportResolveOptions = {
    /** Force a specific width (useful in unit tests or storybook containers). */
    widthOverride?: number;
    /** Fallback key when no direct match is found. Defaults to last matching by min-width. */
    fallbackKey?: ViewportKey;
};
/** Narrow theme shape we care about; avoids hard dependency on @mui types. */
type MaybeMuiTheme = {
    breakpoints?: {
        values?: Partial<Record<ViewportKey, number>>;
    };
};
/** Safely read breakpoint mins from a MUI theme; otherwise use defaults. */
export declare function getBreakpointMins(theme?: MaybeMuiTheme): Record<ViewportKey, number>;
/** Return the active viewport key for a given width using min-width semantics. */
export declare function keyForWidth(width: number, theme?: MaybeMuiTheme): ViewportKey;
/**
 * Resolve a ViewportProp to a concrete value for the current width.
 * - If `prop` is a single value, returns it directly.
 * - If it's a map, returns `map[activeKey]`, falling back to:
 *   `map.default` → first defined in xs→xl order → undefined.
 */
export declare function resolveViewportProp<TVariant extends string | number | boolean | object>(prop: ViewportProp<TVariant>, theme?: MaybeMuiTheme, opts?: ViewportResolveOptions): TVariant | undefined;
/**
 * Shallow-merge a base object with the resolved override from a viewport map.
 * Useful for config objects where each viewport only overrides a few keys.
 *
 * Example:
 *   const base = { gap: 8, size: 'pill' }
 *   const map  = { xs: { size: 'icons' } }
 *   → resolveResponsiveConfig(base, map) === { gap: 8, size: 'icons' }
 */
export declare function resolveResponsiveConfig<T extends Record<string, any>>(base: T | undefined, map: ViewportMap<Partial<T>> | undefined, theme?: MaybeMuiTheme, opts?: ViewportResolveOptions): T | undefined;
export {};
//# sourceMappingURL=viewport.d.ts.map