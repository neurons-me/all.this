//@/gui/hooks/useIsMobile.ts
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
/**
 * Returns `true` if the viewport width is at or below the "sm" breakpoint (mobile).
 * Abstracts the mobile detection logic away from MUI internals.
 */
export function useIsMobile(): boolean {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'));
}

export default useIsMobile;