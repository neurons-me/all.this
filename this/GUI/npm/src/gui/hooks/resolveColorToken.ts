//@/gui/hooks/resolveColorToken.ts
/**
 * Resolves a color token to a valid CSS color string.
 *
 * Supports raw CSS colors (e.g., '#fff', 'rgb(...)', 'hsl(...)'),
 * and theme palette tokens such as 'primary.main', 'text.secondary', etc.
 * Falls back to the raw token or undefined if it cannot be resolved.
 *
 * @param token - The color token or raw color string to resolve.
 * @param theme - Optional MUI Theme object to resolve from. Defaults to useTheme() if not provided.
 * @returns A resolved color string or undefined.
 */
import { useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

export function resolveColorToken(token?: string, theme?: Theme): string | undefined {
  if (!token) return undefined;
  const resolvedTheme = theme ?? useTheme();
  const pal: any = resolvedTheme?.palette ?? {};

  // If raw CSS color (e.g. #fff, rgb(...), etc), return as is
  if (/^#|^rgb\(|^hsl\(/i.test(token)) return token;

  // If dot notation, try to resolve from palette (e.g., text.secondary)
  if (token.includes('.')) {
    const v = token.split('.').reduce<any>((acc, k) => (acc ? acc[k] : undefined), pal);
    if (typeof v === 'string') return v;
    if (v && typeof v === 'object') return v.main ?? v.default;
    return undefined;
  }

  // Otherwise, try direct access (e.g., 'primary', 'secondary')
  const v = pal[token];
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object') return v.main ?? v.default;
  return undefined;
}

export default resolveColorToken;