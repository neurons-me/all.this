import * as React from 'react';
import MuiSwitch from '@mui/material/Switch';
import type { SwitchProps as MuiSwitchProps } from '@mui/material/Switch';
/**
 * Switch (This.GUI primitive)
 * ----------------------------------------
 * Thin wrapper over MUI's `Switch`.
 * - Non‑polymorphic (same as MUI): forwards ref to the root element.
 * - Preserves all MUI props (`checked`, `onChange`, `size`, `color`, etc.).
 *
 * Usage:
 *   import { Switch } from '@/gui/atoms';
 *   <Switch checked={on} onChange={(e) => setOn(e.target.checked)} size="small" />
 */

// Re-export MUI's prop types so consumers can import from our surface.
export type SwitchProps = MuiSwitchProps;
const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(function Switch(props, ref) {
  return <MuiSwitch ref={ref} {...props} />;
});
export default Switch;
export type { MuiSwitchProps };