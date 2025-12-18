//@/gui/hooks/useViewportProp.ts
import { useTheme } from '@mui/material/styles';
import { resolveViewportProp } from '@/types/viewport';
/**
 * useViewportProp allows you to pass responsive props as objects (e.g., { sm: 'value', md: 'value' })
 * and resolves the appropriate value based on the current screen width and theme breakpoints.
 * This helps in adapting component behavior or styling dynamically based on the viewport.
 */
export function useViewportProp<T extends string | number | boolean | object>(
  prop: T | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', T>> & { default?: T },
  opts?: { widthOverride?: number }
): T | undefined {
  const theme = useTheme();
  return resolveViewportProp(prop as any, theme, opts);
}

export default useViewportProp;