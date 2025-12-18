//@/gui/hooks/useInsets.ts
import { useContext } from 'react';
import { useGuiTheme } from '@/gui/hooks';
import { InsetsContext } from '@/gui/contexts';
/**
 * Returns the current insets from the InsetsContext when available.
 * Falls back to the theme's static layout insets if the provider is missing.
 */
export function useInsets() {
  const theme = useGuiTheme();
  const context = useContext(InsetsContext);
  if (context) return context.insets;
  const fallback = theme.layout?.insets ?? { top: 0, right: 0, bottom: 0, left: 0, nav: 0 };
  return { ...fallback, nav: fallback.nav ?? 0 };
}
/**
 * Returns the updater function for insets, defaulting to a no-op if unavailable.
 */
export function useUpdateInsets() {
  const theme = useGuiTheme() as any;
  const context = useContext(InsetsContext);
  if (context) return context.updateInsets;
  return typeof theme.updateInsets === 'function' ? theme.updateInsets : () => {};
}

export default useInsets;
