//src/themes/utils/themeUtils.ts
import { Theme } from '@mui/material/styles';
export type Insets = { left: number; right: number; top: number; bottom: number };
// Helper to get CSS variable from theme
export const getCssVar = (theme: Theme, name: string) => {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`) || theme.palette?.[name as keyof typeof theme.palette];
};

// Generates a string of CSS custom properties based on theme.palette
export const generatePaletteCssVars = (theme: Theme, prefix = '--palette') => {
  const cssVars: Record<string, string> = {};
  Object.entries(theme.palette).forEach(([key, value]) => {
    if (!value || typeof value === 'function') return;
    if (typeof value === 'object') {
      Object.entries(value).forEach(([subKey, subVal]) => {
        const varName = `${prefix}-${key}-${subKey}`;
        cssVars[varName] = String(subVal);
      });
    } else {
      const varName = `${prefix}-${key}`;
      cssVars[varName] = String(value);
    }
  });
  return cssVars;
};

// Appends generated CSS variables to the document root
export const applyThemeCssVars = (theme: Theme) => {
  const cssVars = generatePaletteCssVars(theme);
  const root = document.documentElement;
  Object.entries(cssVars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
};