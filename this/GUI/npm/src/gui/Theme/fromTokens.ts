// src/themes/fromTokens.ts
import { createTheme, type Theme } from '@mui/material/styles';
import { buildShadows } from '@/gui/Theme/styles/buildShadows';
// Helpers ------------------------------------------------------------
declare module '@mui/material/styles' {
  interface Palette {
    section: {
      default: string;
      subtle: string;
      strong: string;
    };
    blur: {
      light: string;
      medium: string;
      heavy: string;
      all: string;
    };
  }
  interface PaletteOptions {
    section?: {
      default?: string;
      subtle?: string;
      strong?: string;
    };
    blur?: {
      light?: string;
      medium?: string;
      heavy?: string;
      all?: string;
    };
  }
}

export const pxToRem = (n: number): string => `${n / 16}rem`;
const pick = <T = any,>(obj: any, path: Array<string | number>, fallback?: T): T => {
  // Safely read nested token value supporting multiple token shapes
  // - Tokens Studio style: { $value: '...' }
  // - simple style: { value: '...' }
  // - raw primitive values
  const raw = path.reduce<any>((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj) ?? undefined;
  if (raw && typeof raw === 'object') {
    if ('$value' in raw) return (raw as any).$value as T;
    if ('value' in raw) return (raw as any).value as T;
  }
  return (raw ?? fallback) as T;
};

const readNumber = (v: unknown, fb: number): number => {
  if (v === undefined || v === null) return fb;
  const n = typeof v === 'string' ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? (n as number) : fb;
};

// Main compiler ------------------------------------------------------
export function makeMuiTheme(themeTokens: any, modeTokens: any, mode: 'light' | 'dark' = 'light'): Theme {
  const g = themeTokens || {};
  const c = modeTokens?.color || {};
  const blurTokens = pick(modeTokens, ['blur'], pick(c, ['blur'], undefined));
  const blurRadiusTokens =
    pick(g, ['blur', 'radius'], undefined) ??
    pick(g, ['custom', 'blurRadius'], undefined) ??
    pick(g, ['blurRadius'], undefined);
  // Core primitives
  const radius = readNumber(pick(g, ['radius', 'md'], 10), 10);
  const spacing = readNumber(pick(g, ['spacing', 'base'], 8), 8);
  const fontFamily = pick<string>(g, ['font', 'family'], 'Roboto, sans-serif');
  const borderDefault =
    pick<string | undefined>(g, ['border', 'default'], undefined) ??
    (mode === 'dark' ? 'rgb(45,45,55)' : 'rgba(0,0,0,0.08)');
  // Text/icon color that sits on top of `primary.main` (e.g. contained primary buttons).
  // If not provided by tokens, fall back to a dark surface color for readability.
  const onPrimary =
    pick<string | undefined>(c, ['onPrimary'], undefined) ??
    pick<string>(c, ['background', 'nav'], mode === 'dark' ? '#1a2928' : '#111');
  // Extended tokens
  const semantic = modeTokens?.extendedColors || modeTokens?.semantic || {};
  const gradients = semantic?.gradients || {};
  const overlays = semantic?.overlays || {};
  const zIndexTokens = g.zIndex || {};
  const breakpointsTokens = g.breakpoints || {};
  const motion = g.motion || {};
  const opacity = g.opacity || {};
  const iconSizes = g.iconSizes || {};
  const lineHeights = g.lineHeights || {};
  const shadowsTokens = g.shadows;
  // Build MUI theme
  const theme = createTheme({
    // Palette accepts custom keys like `link` and `background.nav` in our design system,
    // so we cast to any to avoid fighting MUI's strict palette types.
    palette: {
      mode,
      primary: {
        main: pick(c, ['primary'], '#1976d2'),
        contrastText: onPrimary,
      },
      secondary: { main: pick(c, ['secondary'], '#9c27b0') },
      icon: { main: pick(c, ['icon'], '#5e5e5e') },
      background: {
        default: pick(c, ['background','default'], mode === 'dark' ? '#121214' : '#f8f9fa'),
        paper: pick(c, ['background','paper'], mode === 'dark' ? '#181a1c' : '#fff'),
        nav: pick(c, ['background','nav'], mode === 'dark' ? '#16181a' : '#fdfdfd'),
      },
      text: {
        primary: pick(c, ['textPrimary'], mode === 'dark' ? '#fff' : '#111'),
        secondary: pick(
          c,
          ['textSecondary'],
          mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#444'
        ),
      },
      link: {
        main: pick(c, ['link'], mode === 'dark' ? '#00aa96' : '#008c7d'),
        visited: pick(c, ['linkVisited'], mode === 'dark' ? '#008278' : '#006e64'),
      },
      error:   { main: pick(semantic, ['error'],   mode === 'dark' ? '#ef5350' : '#d32f2f') },
      warning: { main: pick(semantic, ['warning'], '#ed6c02') },
      info:    { main: pick(semantic, ['info'],    '#0288d1') },
      success: { main: pick(semantic, ['success'], '#2e7d32') },
      divider: pick(c, ['border'], borderDefault),
      action: {
        hoverOpacity:     readNumber(pick(opacity, ['hover'],     0.08), 0.08),
        selectedOpacity:  readNumber(pick(opacity, ['selected'],  0.12), 0.12),
        disabledOpacity:  readNumber(pick(opacity, ['disabled'],  0.38), 0.38),
        focusOpacity:     readNumber(pick(opacity, ['focus'],     0.12), 0.12),
        activatedOpacity: readNumber(pick(opacity, ['activated'], 0.12), 0.12),
      },
      section: mode === 'dark' ? {
        default: '#121212',
        subtle: '#1a1a1a',
        strong: '#202020',
      } : {
        default: '#f9f9fb',
        subtle: '#ffffff',
        strong: '#f0f2f5',
      },
      blur: blurTokens ?? (
        mode === 'dark'
          ? {
              light: 'rgba(25, 37, 36, 1)',
              medium: 'rgba(25, 37, 36, 1)',
              heavy: 'rgba(25, 37, 36, 1)',
              all: 'rgba(25, 37, 36, 1)',
            }
          : {
              light: 'rgba(255, 245, 250, 1)',
              medium: 'rgba(255, 240, 245, 1)',
              heavy: 'rgba(255, 235, 240, 1)',
              all: 'rgba(255, 220, 230, 1)',
            }
      ),
    },
    // All tokens exposed under theme.custom for easy access
    custom: {
      border: pick(c, ['border'], borderDefault),
      gradients,
      overlays,
      iconSizes,
      lineHeights,
      blurRadius: {
        light: pick(blurRadiusTokens, ['light'], '6px'),
        medium: pick(blurRadiusTokens, ['medium'], '12px'),
        heavy: pick(blurRadiusTokens, ['heavy'], '24px'),
        all: pick(blurRadiusTokens, ['all'], '32px'),
      },
    },
    shape: { borderRadius: Number.isFinite(radius) ? (radius as number) : 10 },
    spacing: Number.isFinite(spacing) ? (spacing as number) : 8,
    breakpoints: {
      values: {
        xs: readNumber(pick(breakpointsTokens, ['values', 'xs'], 0), 0),
        sm: readNumber(pick(breakpointsTokens, ['values', 'sm'], 600), 600),
        md: readNumber(pick(breakpointsTokens, ['values', 'md'], 900), 900),
        lg: readNumber(pick(breakpointsTokens, ['values', 'lg'], 1200), 1200),
        xl: readNumber(pick(breakpointsTokens, ['values', 'xl'], 1536), 1536),
      },
    },
    zIndex: {
      appBar: readNumber(pick(zIndexTokens, ['appBar'], 1100), 1100),
      drawer: readNumber(pick(zIndexTokens, ['drawer'], 1200), 1200),
      modal: readNumber(pick(zIndexTokens, ['modal'], 1300), 1300),
      snackbar: readNumber(pick(zIndexTokens, ['snackbar'], 1400), 1400),
      tooltip: readNumber(pick(zIndexTokens, ['tooltip'], 1500), 1500),
    },
    transitions: {
      easing: {
        easeInOut: pick(motion, ['easing', 'standard'], 'cubic-bezier(0.4, 0, 0.2, 1)'),
        easeOut: pick(motion, ['easing', 'decelerate'], 'cubic-bezier(0.0, 0, 0.2, 1)'),
        easeIn: pick(motion, ['easing', 'accelerate'], 'cubic-bezier(0.4, 0, 1, 1)'),
        sharp: pick(motion, ['easing', 'sharp'], 'cubic-bezier(0.4, 0, 0.6, 1)'),
      },
      duration: {
        shortest: readNumber(pick(motion, ['duration', 'shortest'], 150), 150),
        shorter: readNumber(pick(motion, ['duration', 'shorter'], 200), 200),
        short: readNumber(pick(motion, ['duration', 'short'], 250), 250),
        standard: readNumber(pick(motion, ['duration', 'standard'], 300), 300),
        complex: readNumber(pick(motion, ['duration', 'complex'], 375), 375),
        enteringScreen: readNumber(pick(motion, ['duration', 'entering'], 225), 225),
        leavingScreen: readNumber(pick(motion, ['duration', 'leaving'], 195), 195),
      },
    },
    typography: {
      fontFamily,
      // existing variants
      h1: { fontSize: pxToRem(40), fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.01em' },
      h2: { fontSize: pxToRem(32), fontWeight: 600, lineHeight: 1.25 },
      h3: { fontSize: pxToRem(26), fontWeight: 600, lineHeight: 1.3 },
      h4: { fontSize: pxToRem(21), fontWeight: 600, lineHeight: 1.35 },
      h5: { fontSize: pxToRem(18), fontWeight: 600, lineHeight: 1.35 },
      subtitle1: { fontSize: pxToRem(16), fontWeight: 600, lineHeight: 1.4 },
      body1: { fontSize: pxToRem(16), lineHeight: 1.6 },
      body2: { fontSize: pxToRem(14), lineHeight: 1.6 },
      button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.02em' },
    },
    shadows: buildShadows(shadowsTokens, mode),
    layout: {
      insets: {
        left:   readNumber(pick(g, ['layout', 'insets', 'left'],   0), 0),
        right:  readNumber(pick(g, ['layout', 'insets', 'right'],  0), 0),
        top:    readNumber(pick(g, ['layout', 'insets', 'top'],    0), 0),
        bottom: readNumber(pick(g, ['layout', 'insets', 'bottom'], 0), 0),
      },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: ({ theme }) => ({ borderRadius: theme.shape.borderRadius }),
          containedPrimary: ({ theme }) => ({
            color: theme.palette.primary.contrastText,
            '& .MuiButton-startIcon, & .MuiButton-endIcon': {
              color: theme.palette.primary.contrastText,
            },
          }),
          sizeLarge: { padding: '12px 20px' },
          sizeMedium: { padding: '10px 18px' },
          sizeSmall: { padding: '8px 14px' },
        },
      },
      MuiPaper: { styleOverrides: { rounded: { borderRadius: 14 } } },
      MuiTextField: { defaultProps: { size: 'small' } },
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          ':root': {
            '--gui-primary': theme.palette.primary.main,
            '--gui-secondary': theme.palette.secondary.main,
            '--gui-bg-default': theme.palette.background.default,
            '--gui-bg-paper': theme.palette.background.paper,
            '--gui-bg-nav': theme.palette.background.nav || theme.palette.background.paper,
            '--gui-text-primary': theme.palette.text.primary,
            '--gui-text-secondary': theme.palette.text.secondary,
            '--gui-link': theme.palette.link.main,
            '--gui-link-visited': theme.palette.link.visited || theme.palette.link.main,
            '--gui-border': theme.custom?.border || theme.palette.divider,
            // Motion / opacity / icon sizes CSS vars for non-MUI DOM
            '--gui-ease-standard': theme.transitions.easing.easeInOut,
            '--gui-duration-standard': `${theme.transitions.duration.standard}ms`,
            '--gui-opacity-hover': theme.palette.action.hoverOpacity,
            '--gui-opacity-disabled': theme.palette.action.disabledOpacity,
            '--gui-icon-size-sm': (iconSizes as any).sm ?? '16px',
            '--gui-icon-size-md': (iconSizes as any).md ?? '20px',
            '--gui-icon-size-lg': (iconSizes as any).lg ?? '24px',
            '--gui-radius': `${theme.shape.borderRadius}px`,
            '--gui-font-family': theme.typography.fontFamily,
            '--gui-spacing': typeof theme.spacing === 'function' ? theme.spacing(1) : `${(theme as any).spacing}px`,
            '--gui-inset-left': theme.layout.insets.left + 'px',
            '--gui-inset-right': theme.layout.insets.right + 'px',
            '--gui-inset-top': theme.layout.insets.top + 'px',
            '--gui-inset-bottom': theme.layout.insets.bottom + 'px',
          },
          body: {
            fontFamily: theme.typography.fontFamily,
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
          a: {
            color: theme.palette.link.main,
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
            '&:visited': { color: theme.palette.link.visited || theme.palette.link.main },
          },
        }),
      },
    },
  });
  return theme;
}
