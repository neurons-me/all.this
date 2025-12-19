// src/gui/atoms/Box/Box.tsx
/*
 * This.GUI — Box (polymorphic)
 * Wrapper that keeps MUI's own typing, including the `component` prop.
 * Ejemplos válidos:
 *   <Box component="img" src="..." alt="..." />
 *   <Box component="a" href="..." />
 */
import MuiBox from '@mui/material/Box';
import * as React from 'react';
// Re-export using MUI's own component type
const Box = MuiBox;
export type BoxProps = React.ComponentProps<typeof Box>;
(Box as any).displayName = 'Gui.Box';
export default Box;