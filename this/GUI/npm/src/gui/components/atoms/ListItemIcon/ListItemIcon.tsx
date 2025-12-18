/*
 * This.GUI — ListItemIcon
 * Thin wrapper that preserves MUI typing.
 * Use our resolver for declarative sugar (icon tokens) and granular styling patterns.
 */
import * as React from 'react';
import MuiListItemIcon from '@mui/material/ListItemIcon';
const ListItemIcon = MuiListItemIcon;
export type ListItemIconProps = React.ComponentProps<typeof ListItemIcon>;
(ListItemIcon as any).displayName = 'Gui.ListItemIcon';
export default ListItemIcon;
