// File: Grid.tsx
import MuiGrid from '@mui/material/Grid';
import type { GridProps } from './Grid.types';

/**
 * This.GUI — Grid
 * Wrapper around MUI’s Grid that preserves props & typing.
 * 
 * Purpose:
 * - Consistent namespace integration (This.GUI).
 * - Supports full MUI Grid props including `sx`, `container`, `item`, etc.
 */
const Grid = MuiGrid;
(Grid as any).displayName = 'Gui.Grid';
export default Grid;