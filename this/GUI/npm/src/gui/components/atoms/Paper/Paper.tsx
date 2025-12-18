/*
 * This.GUI — Paper (polymorphic)
 * Thin wrapper that preserves MUI's own typing and `component` API.
 * Examples:
 *   <Paper elevation={3} />
 *   <Paper component="section" square variant="outlined" />
 *   <Paper component="a" href="/docs" />
 */
import MuiPaper from '@mui/material/Paper';
import * as React from 'react';
// Re-export using MUI's own component type to keep polymorphism and full typing
const Paper = MuiPaper;
export type PaperProps = React.ComponentProps<typeof Paper>;
(Paper as any).displayName = 'Gui.Paper';
export default Paper;