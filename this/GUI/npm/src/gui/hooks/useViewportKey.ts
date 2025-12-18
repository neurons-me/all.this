//@/gui/hooks/useViewportKey.ts
/**
 * Hook that returns the current viewport key ('xs', 'sm', 'md', 'lg', or 'xl')
 * based on the browser's window.innerWidth and the theme's breakpoints.
 * Useful for conditional rendering or styling based on screen size.
 */
import { useTheme } from '@mui/material/styles';
export function useViewportKey(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' {
  const theme = useTheme();
  const width = typeof window !== 'undefined' ? window.innerWidth : 0;
  const breakpoints = theme.breakpoints.values;
  if (width < breakpoints.sm) return 'xs';
  if (width < breakpoints.md) return 'sm';
  if (width < breakpoints.lg) return 'md';
  if (width < breakpoints.xl) return 'lg';
  return 'xl';
}

export default useViewportKey;