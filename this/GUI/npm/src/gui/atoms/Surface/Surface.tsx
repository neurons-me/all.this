import React from 'react';
import MuiSurface from '@mui/material/Paper';
import type { SurfaceProps } from './Surface.types';

/**
 * Surface
 * -------
 * A visual container primitive.
 * Acts as a thin wrapper around MUI's Paper.
 * Supports elevation, variant, square, and sx overrides.
 */
const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>((props, ref) => {
  const {
    variant = 'elevation',
    elevation: elevationProp,
    sx,
    ...rest
  } = props;

  const isCard = variant === 'card';
  const mappedVariant = (isCard ? 'outlined' : variant) as 'elevation' | 'outlined';
  const elevation = isCard ? 0 : elevationProp;

  const cardSx = isCard
    ? [
        (theme: any) => ({
          borderRadius: theme.shape?.borderRadius ?? 8,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow: theme.customShadows?.card ?? theme.shadows?.[3] ?? 'none',
        }),
      ]
    : [];
  const sxArray = Array.isArray(sx) ? sx : sx ? [sx] : [];
  const composedSx = isCard ? [...cardSx, ...sxArray] : sx;

  return (
    <MuiSurface
      ref={ref}
      variant={mappedVariant}
      elevation={elevation}
      sx={composedSx}
      {...rest}
    />
  );
});

Surface.displayName = 'Surface';
export default Surface;
