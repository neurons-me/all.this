import type * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useGuiTheme } from '@/gui/hooks';
import type { Theme } from '@mui/material/styles';
import Icon from '@/gui/Theme/Icon/Icon';
export type StickyItem = {
  icon: React.ReactNode | string;
  label?: string;
  href?: string;
  variant?: 'primary' | 'neutral';
  trackId?: string;
  ariaLabel?: string;
  iconColor?: string; // palette key/path or CSS color
};

export type StickyPositioning = {
  topOffset?: number | string;
  maxWidth?: number | string;
  mode?: 'sticky' | 'fixed';
  reserveSpace?: boolean;
};

export type StickyBehavior = {
  hideOnScrollDown?: boolean;
  collapseToFabOnMobile?: boolean; // kept for backwards compatibility
  iconOnlyOnMobile?: boolean;
  mobileBreakpoint?: number;
  hideThreshold?: number;
  showThreshold?: number;
  topGuard?: number;
};

export type StickyThemeOpts = {
  elevation?: number;
  blur?: number;
  contrastMode?: 'auto' | 'light' | 'dark';
};

export type StickyVisibility = {
  enabled?: boolean;
  includeRoutes?: string[] | null;
  excludeRoutes?: string[] | null;
};

export type StickyI18nOpts = {
  useI18n?: boolean;
  t?: (s: string) => string;
};

export type StickyOptionsTopProps = {
  items?: StickyItem[];
  mobileVersion?: 'pill' | 'icons';
  positioning?: StickyPositioning;
  behavior?: StickyBehavior;
  theme?: StickyThemeOpts;
  visibility?: StickyVisibility;
  i18n?: StickyI18nOpts;
};
/**
 * StickyOptions (this.GUI)
 * A reusable sticky CTA menu that hangs below the navbar.
 *
 * Props shape (all optional unless noted):
 *  - items: Array<{ icon: ReactNode|string, label?: string, href?: string, variant?: 'primary'|'neutral', trackId?: string, ariaLabel?: string }>
 *  - positioning: { topOffset?: number|string, maxWidth?: number|string, mode?: 'sticky'|'fixed', reserveSpace?: boolean }
 *  - behavior: { hideOnScrollDown?: boolean, collapseToFabOnMobile?: boolean, iconOnlyOnMobile?: boolean, mobileBreakpoint?: number, hideThreshold?: number, showThreshold?: number, topGuard?: number }
 *  - theme: { elevation?: number, blur?: number, contrastMode?: 'auto'|'light'|'dark' }
 *  - visibility: { enabled?: boolean, includeRoutes?: string[]|null, excludeRoutes?: string[]|null }
 *  - i18n: { useI18n?: boolean }
 *  - mobileVersion: 'pill' | 'icons'
 */

const StickyOptionsTop = ({
  items = [],
  mobileVersion = 'pill',
  positioning = {},
  behavior = {
    hideOnScrollDown: false,      // never hide on scroll
    iconOnlyOnMobile: false,      // keep text visible on mobile
    mobileBreakpoint: 768
  },
  theme: themeOpts = {},
  visibility = {},
  i18n: i18nOpts = {}
}: StickyOptionsTopProps) => {
  const muiTheme = (useGuiTheme() as Theme) || ({} as Theme);
  // ---- Defaults
  const {
    topOffset = '0.55rem',   // default separation from navbar (tighter default)
    maxWidth = 800,
    mode = 'sticky',         // 'sticky' | 'fixed'
    reserveSpace = false     // when true, push content down by menu height + offset
  } = positioning;

  const {
    hideOnScrollDown = false,
    collapseToFabOnMobile = false, // backward-compat
    iconOnlyOnMobile = false,
    mobileBreakpoint = 768,
    hideThreshold = 36,   // px scrolled down before hiding
    showThreshold = 12,   // px scrolled up before showing again
    topGuard = 20         // do not hide near top of page
  } = behavior;

  const iconsOnly = mobileVersion === 'icons' || (typeof iconOnlyOnMobile === 'boolean' ? iconOnlyOnMobile : collapseToFabOnMobile);

  const {
    elevation = 28,
    blur = 9,
    contrastMode = 'auto'
  } = themeOpts;

  const {
    enabled = true,
    includeRoutes = null,
    excludeRoutes = null
  } = visibility;

  const { useI18n = false, t: tFn } = i18nOpts;

  // ---- Translate helper
  const translate: (s: string) => string =
    useI18n && typeof tFn === 'function' ? tFn : (s: string) => s;

  // Render icon helper: supports ReactNode or declarative string ("mui:Something" / "lucide:something")
  const resolveIconColor = (iconColor?: string): { css?: string } => {
    if (!iconColor) return {};
    const token = iconColor.trim();

    // Direct CSS color? (#hex, rgb(), hsl())
    if (/^#|^rgb\(|^hsl\(/i.test(token)) {
      return { css: token };
    }

    const pal: any = muiTheme?.palette;
    if (!pal) return {};

    // Support palette path notation like "text.secondary" or "action.active"
    if (token.includes('.')) {
      const val = token.split('.').reduce<any>((acc, k) => (acc ? acc[k] : undefined), pal);
      if (typeof val === 'string') return { css: val };
      if (val && typeof val === 'object' && typeof val.main === 'string') return { css: val.main };
      if (val && typeof val === 'object' && typeof (val as any).default === 'string') return { css: (val as any).default };
      return {};
    }

    // Top-level palette key (e.g., "primary", "info", "divider", "link")
    const v = pal[token];
    if (typeof v === 'string') return { css: v };
    if (v && typeof v === 'object') {
      if (typeof v.main === 'string') return { css: v.main };
      if (typeof (v as any).default === 'string') return { css: (v as any).default };
    }
    return {};
  };

  const renderIconNode = (icon: React.ReactNode | string, iconColor?: string): React.ReactNode => {
    if (!icon) return null;
    // Direct React element: pass through (do not override color)
    if (typeof icon !== 'string') return icon;

    const colorInfo = resolveIconColor(iconColor);
    const isMui = icon.toLowerCase().startsWith('mui:');
    const isLucide = icon.toLowerCase().startsWith('lucide:');

    // If a color was declared, map to the right prop for provider;
    // otherwise, let Icon use theme-aware defaults.
    const colorProps = colorInfo.css
      ? (isMui ? { htmlColor: colorInfo.css } : { color: colorInfo.css })
      : {};

    // Refactor: use fontSize and iconColor props per new IconProps interface
    const newColorProps = colorInfo.css
      ? { iconColor: colorInfo.css }
      : {};
    return <Icon name={icon} fontSize={16} {...newColorProps} />;
  };

  // ---- Spacer measurement (optional content push)
  const groupElRef = useRef<HTMLDivElement | null>(null);
  const [groupHeight, setGroupHeight] = useState<number>(0);

  useEffect(() => {
    if (!reserveSpace) return;
    const el = groupElRef.current;
    if (!el) return;
    const update = () => {
      try { setGroupHeight(el.getBoundingClientRect().height || 0); } catch {}
    };
    update();
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => update());
      ro.observe(el);
    }
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      if (ro) try { ro.disconnect(); } catch {}
    };
  }, [reserveSpace]);

  const topOffsetCSS = typeof topOffset === 'number' ? `${topOffset}px` : String(topOffset);
  // Read insets directly from GUI theme (source of truth set by GuiProvider / components)
  const insetLeft = Math.max(0, Number(muiTheme?.layout?.insets?.left ?? 0));
  const insetRight = Math.max(0, Number(muiTheme?.layout?.insets?.right ?? 0));
  const navPx = Math.max(0, Number(muiTheme?.layout?.insets?.nav ?? 0));

  // If there is a navbar (navPx > 0) we add the topOffset, else we stick to page top.
  const effectiveTopOffset = navPx > 0 ? topOffsetCSS : '0px';
  const topCSS = `calc(${navPx}px + ${effectiveTopOffset})`;
  const spacerStyle: React.CSSProperties | undefined = reserveSpace ? { height: `calc(${topOffsetCSS} + ${groupHeight}px)` } : undefined;

  // ---- Route-based visibility
  const isRouteIncluded = useMemo<boolean>(() => {
    if (!enabled) return false;
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    if (excludeRoutes && excludeRoutes.some((r) => path.startsWith(r))) return false;
    if (includeRoutes && includeRoutes.length > 0) return includeRoutes.some((r) => path.startsWith(r));
    return true;
  }, [enabled, includeRoutes, excludeRoutes]);

  // ---- Scroll hide behavior (with hysteresis)
  const [hidden, setHidden] = useState<boolean>(false);
  const lastY = useRef<number>(typeof window !== 'undefined' ? window.scrollY : 0);
  const acc = useRef<number>(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!hideOnScrollDown) return;

    const onScroll = () => {
      if (raf.current) return; // throttle to rAF
      raf.current = requestAnimationFrame(() => {
        const y = window.scrollY;
        const dy = y - lastY.current;
        lastY.current = y;

        // Guard: don't hide near very top
        if (y <= topGuard) {
          acc.current = 0;
          setHidden(false);
          raf.current = null;
          return;
        }

        // Accumulate deltas; reset when direction changes
        if ((dy > 0 && acc.current < 0) || (dy < 0 && acc.current > 0)) acc.current = 0;
        acc.current += dy;

        if (acc.current > hideThreshold && !hidden) {
          setHidden(true);
          acc.current = 0; // reset after state change
        } else if (acc.current < -showThreshold && hidden) {
          setHidden(false);
          acc.current = 0; // reset after state change
        }
        raf.current = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf.current !== null) cancelAnimationFrame(raf.current as number);
    };
  }, [hideOnScrollDown, hideThreshold, showThreshold, topGuard, hidden]);

  // ---- Colors from MUI theme with safe fallbacks
  const colors = useMemo(() => {
    const mode = muiTheme?.palette?.mode || 'dark';
    const linkMain = muiTheme?.palette?.link?.main || 'rgb(0, 170, 150)';
    const bgPaper = muiTheme?.palette?.background?.paper || (mode === 'dark' ? 'rgb(24,26,28)' : '#ffffff');
    const bg = mode === 'dark' ? 'rgba(24,26,28,0.65)' : 'rgba(255,255,255,0.8)';
    const border = muiTheme?.custom?.border || (mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)');
    const neutralBg = mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
    const neutralBorder = mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)';
    const text = muiTheme?.palette?.text?.primary || (mode === 'dark' ? '#fff' : '#111');
    return { linkMain, bgPaper, bg, border, neutralBg, neutralBorder, text, mode };
  }, [muiTheme]);

  // ---- Collapse to FAB on mobile
  // Reusable size for mobile FAB layout
  const FAB_SIZE = 40;
  const [isMobile, setIsMobile] = useState<boolean>(() => (typeof window !== 'undefined' ? window.innerWidth < mobileBreakpoint : false));
  useEffect(() => {
    if (!iconsOnly) return;
    const onResize = () => setIsMobile(window.innerWidth < mobileBreakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [iconsOnly, mobileBreakpoint]);

  // New isSmall state that tracks window.innerWidth < mobileBreakpoint regardless of iconsOnly
  const [isSmall, setIsSmall] = useState<boolean>(() => (typeof window !== 'undefined' ? window.innerWidth < mobileBreakpoint : false));
  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth < mobileBreakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [mobileBreakpoint]);

  // ---- Tracking helper
  const trackClick = (trackId?: string, label?: string) => {
    try {
      window.dispatchEvent(new CustomEvent('stickyoptions:click', { detail: { trackId, label } }));
    } catch {/* no-op */}
  };

  if (!isRouteIncluded) return null;

  // ---- Render item (anchor or span)
  const renderItem = (item: StickyItem, i: number): React.ReactNode => {
    const { icon, label, href, variant = 'neutral', trackId, ariaLabel } = item || {};
    const hasText = !!label;
    const isPrimary = variant === 'primary';
    const commonStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: hasText ? 8 : 0,
      padding: `${isSmall ? 6 : 7}px ${hasText ? (isSmall ? 10 : 12) : (isSmall ? 6 : 8)}px`,
      borderRadius: 999,
      minWidth: hasText ? (isSmall ? 92 : 108) : 40,
      whiteSpace: 'nowrap',
      flexShrink: 0,
      justifyContent: 'center',
      fontWeight: 800,
      textDecoration: 'none',
      border: isPrimary ? '1px solid transparent' : `1px solid ${colors.neutralBorder}`,
      background: isPrimary ? 'rgba(0, 170, 150, 0.12)' : colors.neutralBg,
      color: isPrimary ? colors.linkMain : colors.text
    } as React.CSSProperties;

    const content = (
      <>
        {icon ? (
          <span style={{ display: 'inline-flex', marginRight: hasText ? 6 : 0 }}>
            {renderIconNode(icon, item?.iconColor)}
          </span>
        ) : null}
        {hasText ? (useI18n ? translate(label!) : label) : null}
      </>
    );

    if (href) {
      const external = /^https?:\/\//i.test(href);
      return (
        <a
          key={i}
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          aria-label={ariaLabel || label}
          onClick={() => trackClick(trackId, label)}
          style={commonStyle}
        >
          {content}
        </a>
      );
    }
    return (
      <span key={i} aria-label={ariaLabel || label} style={commonStyle}>
        {content}
      </span>
    );
  };

  // ---- Layout wrappers
  const wrapperStyle: React.CSSProperties = {
    // Use sticky by default; fixed when explicitly requested
    position: mode === 'fixed' ? 'fixed' : 'sticky',
    top: topCSS,
    left: mode === 'fixed' ? `${insetLeft}px` : undefined,
    right: mode === 'fixed' ? `${insetRight}px` : undefined,
    zIndex: Math.max(0, (muiTheme?.zIndex?.appBar ?? 1100) - 1),
    width: '100%',
    // Apply hide animation only when the feature is enabled and the bar is actually hidden.
    ...(hideOnScrollDown && hidden
      ? {
          transform: 'translateY(-8px)',
          opacity: 0,
          transition: 'transform 180ms ease, opacity 180ms ease',
        }
      : {
          transition: 'transform 180ms ease, opacity 180ms ease',
        }),
    // Ensure the wrapper contributes height when children are absolutely positioned (e.g., mobile FAB)
    minHeight: iconsOnly && isMobile ? FAB_SIZE + 8 : undefined,
  } as React.CSSProperties;

  const innerWrapStyle: React.CSSProperties = {
    position: 'relative',
    width: `calc(100% - ${insetLeft}px - ${insetRight}px)`,
    margin: '0 auto',
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center'
  } as React.CSSProperties;

  const groupBase: React.CSSProperties = {
    display: 'inline-flex',
    gap: 6,
    padding: '4px 8px',
    borderRadius: 999,
    background: colors.bg,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: `1px solid ${colors.border}`,
    boxShadow: `0 ${Math.round(elevation/3)}px ${elevation}px rgba(0,0,0,0.35)`,
    whiteSpace: 'nowrap',
    pointerEvents: 'auto'
  } as React.CSSProperties;

  // Position group: always center
  const groupStyle: React.CSSProperties = {
    ...groupBase,
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth
  } as React.CSSProperties;

  // Collapse: icon-only FABs on mobile
  if (iconsOnly && isMobile) {
    const fabWrapStyle: React.CSSProperties = {
      display: 'inline-flex',
      gap: 10,
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'nowrap'
    } as React.CSSProperties;

    return (
      <>
        {reserveSpace && <div style={spacerStyle} />}
        <div style={wrapperStyle}>
          <div style={innerWrapStyle}>
            <div style={fabWrapStyle} ref={groupElRef}>
              {items.slice(0, 3).map((item, i) => {
                const isPrimary = (item?.variant || 'neutral') === 'primary';
                const style: React.CSSProperties = {
                  width: FAB_SIZE,
                  height: FAB_SIZE,
                  minWidth: FAB_SIZE,
                  minHeight: FAB_SIZE,
                  flex: `0 0 ${FAB_SIZE}px`,
                  aspectRatio: '1 / 1',
                  boxSizing: 'border-box',
                  padding: 0,
                  borderRadius: 999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 0,
                  textDecoration: 'none',
                  border: isPrimary ? '1px solid transparent' : `1px solid ${colors.neutralBorder}`,
                  background: isPrimary ? 'rgba(0, 170, 150, 0.12)' : colors.neutralBg,
                  color: isPrimary ? colors.linkMain : colors.text
                } as React.CSSProperties;
                const aria = item?.ariaLabel || item?.label;
                if (item?.href) {
                  const external = /^https?:\/\//i.test(item.href);
                  return (
                    <a key={i} href={item.href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} aria-label={aria} onClick={() => trackClick(item?.trackId, item?.label)} style={style}>
                      {renderIconNode(item?.icon, item?.iconColor)}
                    </a>
                  );
                }
                return <span key={i} aria-label={aria} style={style}>{renderIconNode(item?.icon, item?.iconColor)}</span>;
              })}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Default full pill rendering
  return (
    <>
      {reserveSpace && <div style={spacerStyle} />}
      <div style={wrapperStyle}>
        <div style={innerWrapStyle}>
          <div style={groupStyle} ref={groupElRef}>
            {items.map((item, i) => renderItem(item, i))}
          </div>
        </div>
      </div>
    </>
  );
};

export default StickyOptionsTop;
