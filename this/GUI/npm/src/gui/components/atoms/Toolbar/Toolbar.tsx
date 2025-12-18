import * as React from 'react';
import MuiToolbar from '@mui/material/Toolbar';
/**
 * This.GUI — Toolbar atom
 * Thin wrapper around MUI's Toolbar so consumers import from "@/gui/atoms"
 * instead of "@mui/material". This keeps the engine swappable.
 *
 * Notes:
 * - We type props from MuiToolbar to preserve its full API (incl. `component`, `sx`, etc.).
 * - Ref is HTMLDivElement, matching the default DOM element Toolbar renders.
 */
export type ToolbarProps = React.ComponentProps<typeof MuiToolbar>;
const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(props, ref) {
  return <MuiToolbar ref={ref} {...props} />;});
(Toolbar as any).displayName = 'Gui.Toolbar';
export default Toolbar;