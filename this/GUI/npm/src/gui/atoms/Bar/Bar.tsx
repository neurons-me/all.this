import React from 'react';
import MuiAppBar from '@mui/material/AppBar';
import type { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import type { SxProps, Theme } from '@mui/material/styles';
// Keep your local AppBarProps, but allow us to extend it safely at runtime.
// If ./AppBar.types.js already defines AppBarProps, we can widen it here.
import type { AppBarProps as LocalAppBarProps } from './Bar.types.js';
export type AppBarVariant = 'mui' | 'glass';
export type AppBarProps = LocalAppBarProps & {
  /**
   * Semantic preset.
   * - `mui` (default): behaves exactly like MUI AppBar.
   * - `glass`: a floating “welcome” topbar style (blurred panel), suitable for quick links.
   */
  variant?: AppBarVariant;

  /**
   * Where to dock the AppBar when using the `glass` variant.
   */
  dock?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /**
   * Pixel offsets for the `glass` variant.
   */
  offset?: number;
};

const glassDockSx = (dock: NonNullable<AppBarProps['dock']>, offset: number): SxProps<Theme> => {
  const o = `${offset}px`;
  switch (dock) {
    case 'top-left':
      return { top: o, left: o };
    case 'top-right':
      return { top: o, right: o };
    case 'bottom-left':
      return { bottom: o, left: o };
    case 'bottom-right':
      return { bottom: o, right: o };
    default:
      return { top: o, right: o };
  }
};

const AppBar = React.forwardRef<HTMLDivElement, AppBarProps>((props, ref) => {
  const {
    variant = 'mui',
    dock = 'top-right',
    offset = 16,
    sx,
    position,
    elevation,
    ...rest
  } = props;

  if (variant === 'mui') {
    // Default behavior: pass-through to MUI.
    return (
      <MuiAppBar
        ref={ref}
        sx={sx as any}
        position={position}
        elevation={elevation}
        {...(rest as any)}
      />
    );
  }

  // Glass/floating preset
  return (
    <MuiAppBar
      ref={ref}
      // Force floating positioning
      position="fixed"
      elevation={0}
      sx={(
        [
          {
            zIndex: (theme: Theme) => (theme as any)?.zIndex?.modal ?? 1300,
            width: 'auto',
            borderRadius: 999,
            overflow: 'hidden',
            background: 'rgba(10, 10, 10, 0.55)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 6px 30px rgba(0,0,0,0.25)',
            padding: '10px 14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            ...glassDockSx(dock, offset),
          },
          // allow user overrides last
          sx as any,
        ]
      ) as any}
      {...(rest as any)}
    />
  );
});

AppBar.displayName = 'AppBar';
export default AppBar;
