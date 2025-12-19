import MuiGrid from '@mui/material/Grid';
import type { GridProps as MuiGridProps } from '@mui/material/Grid';
export type GridProps = React.ComponentProps<typeof MuiGrid> & MuiGridProps;

export type GridResolverSpec = {
  type: 'Grid';
  props?: GridProps; // or GridProps if you want to alias it
};

