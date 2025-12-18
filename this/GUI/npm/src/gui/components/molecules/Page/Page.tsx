// Page.tsx
import React, { useMemo } from 'react';
import { Box } from '@/gui/components/atoms';
import { useInsetsContext } from '@/gui/contexts/InsetsContext';
import { useGuiTheme } from '@/gui/hooks';
export interface PageProps {
  children?: React.ReactNode;
  padding?: number | string;
  background?: string;
  sx?: any;
  insetsAware?: boolean;
}
/**
 * Page
 * ----------
 * A flexible container for rendering page-level content within layouts.
 * Typically used inside Layout components or Routes.
 *
 * Features:
 * - Applies consistent padding and layout structure.
 * - Supports background color/image and custom sx overrides.
 * - Fully responsive by default.
 */
export default function Page({
  children,
  padding = 3,
  background = 'transparent',
  sx = {},
  insetsAware = true,
}: PageProps) {
  useInsetsContext();
  const theme = useGuiTheme();

  const resolvedPadding = useMemo(() => {
    if (typeof padding === 'number') {
      if (padding <= 10 && typeof theme.spacing === 'function') {
        return theme.spacing(padding);
      }
      return `${padding}px`;
    }
    return padding ?? '0px';
  }, [padding, theme]);

  const isUniformPadding =
    typeof resolvedPadding === 'string' && resolvedPadding.trim().split(/\s+/).length === 1;

  const basePadding = isUniformPadding ? resolvedPadding : undefined;
  const topCalc =
    insetsAware && basePadding
      ? `calc(${basePadding} + var(--gui-inset-top, 0px))`
      : undefined; 
  const bottomCalc =
    insetsAware && basePadding
      ? `calc(${basePadding} + var(--gui-inset-bottom, 0px))`
      : undefined;
  const leftCalc =
    insetsAware && basePadding
      ? `calc(${basePadding} + var(--gui-inset-left, 0px))`
      : undefined;
  const rightCalc =
    insetsAware && basePadding
      ? `calc(${basePadding} + var(--gui-inset-right, 0px))`
      : undefined;

  return (
    <Box
      id="page-container"
      sx={{
        flex: 1,
        flexGrow: 1,
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: resolvedPadding,
        background,
        boxSizing: 'border-box',
        ...(insetsAware &&
          basePadding && {
            padding: 0,
            paddingTop: topCalc,
            paddingBottom: bottomCalc,
            paddingLeft: leftCalc,
            paddingRight: rightCalc,
          }),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
