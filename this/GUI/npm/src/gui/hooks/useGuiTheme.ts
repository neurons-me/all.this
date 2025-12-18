//@/gui/hooks/useTheme.ts
/**
 * React hook wrapper for MUI's `useTheme`.
 *
 * This wrapper ensures consistent typing across your app by casting the returned theme
 * as the expected MUI `Theme`. It allows your components to remain decoupled from direct MUI imports,
 * making future migration or customization easier.
 */
import { useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
/**
 * Returns the current theme typed as MUI's `Theme`.
 */
export function useGuiTheme(): Theme {
  return useTheme() as Theme;
}

export default useGuiTheme;