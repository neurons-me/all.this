/**
 * This.GUI — Collapse
 * Thin wrapper around MUI’s Collapse that preserves props & typing.
 *
 * Fidelity
 * - Directly re-exports MUI’s component so behavior/typing remain intact.
 * - No custom logic; consumers keep using it exactly like MUI.
 *
 * Styling / Granular control
 * - Supports MUI System styling via props exposed by MUI (e.g. `sx` on slots where applicable).
 */
import * as React from 'react';
import MuiCollapse from '@mui/material/Collapse';
const Collapse = MuiCollapse;
export type CollapseProps = React.ComponentProps<typeof Collapse>;
(Collapse as any).displayName = 'Gui.Collapse';
export default Collapse;