/**
 * This.GUI — IconButton
 * ----------------------------------------
 * Thin wrapper around MUI’s IconButton.
 *
 * Fidelity:
 * - Directly re-exports MUI’s IconButton so all typing and props remain intact.
 * - Preserves polymorphism (`component` prop) via OverridableComponent.
 * - Supports granular styling via the standard `sx` prop (MUI System).
 *
 * Why wrap?
 * - Consistency with This.GUI’s atom pattern (every MUI primitive wrapped).
 * - Provides a clean declarative/resolver entry point.
 */
import * as React from 'react';
import MuiIconButton from '@mui/material/IconButton';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { IconButtonTypeMap } from '@mui/material/IconButton';
const IconButton = MuiIconButton as OverridableComponent<IconButtonTypeMap<{}, 'button'>>;
export type IconButtonProps = React.ComponentProps<typeof IconButton>;
(IconButton as any).displayName = 'Gui.IconButton';
export default IconButton;