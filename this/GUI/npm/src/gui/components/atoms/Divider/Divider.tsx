import * as React from 'react';
import MuiDivider from '@mui/material/Divider';
/**
 * This.GUI — Divider (atom)
 * Thin wrapper around MUI's Divider. Keeps the API stable under our namespace
 * while preserving all props, including `sx`.
 */
export type DividerProps = React.ComponentProps<typeof MuiDivider>;
const Divider = React.forwardRef<HTMLHRElement, DividerProps>(function Divider(props, ref) {
  return <MuiDivider ref={ref} {...props} />;
});

(Divider as any).displayName = 'Divider';
export default Divider;