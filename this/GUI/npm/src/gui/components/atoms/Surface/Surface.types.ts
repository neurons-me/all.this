import type { PaperProps } from '@mui/material/Paper';
import type { ReactNode } from 'react';
export type SurfaceVariant = 'elevation' | 'outlined' | 'card';
export interface SurfaceProps extends Omit<PaperProps, 'variant'> {
  /**
   * Visual style for the surface.
   * `card` maps to an outlined paper with subtle shadow + rounded corners.
   */
  variant?: SurfaceVariant;
}

export type SurfaceResolverSpec = {
  type?: 'Surface';
  props?: Partial<SurfaceProps> & {
    children?: ReactNode;
    id?: string;
    className?: string;
    'data-testid'?: string;
  };
};
