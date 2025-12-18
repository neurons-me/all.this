// src/gui/hooks/useGuiMediaQuery.ts
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
/**
 * Wrapper around MUI's useMediaQuery that accepts either a string or a function
 * returning a string based on the theme. This allows using theme breakpoints
 * easily within the media query.
 *
 * @param query - The media query string or a function that takes the theme and returns a string.
 * @returns A boolean indicating whether the document matches the media query.  
 */
export function useGuiMediaQuery(query: string | ((theme: ReturnType<typeof useTheme>) => string)) {
  const theme = useTheme();
  const finalQuery = typeof query === 'function' ? query(theme) : query;
  return useMediaQuery(finalQuery);
}

export default useGuiMediaQuery;