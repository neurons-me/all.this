/**
 * This component is a thin wrapper around MUI’s ListItemButton.
 * It preserves MUI’s props and typing, staying faithful to MUI.
 * 
 * Why wrap it?
 * - Consistency with This.GUI’s atom pattern (each atom has its own file).
 * - Supports declarative/resolver usage while keeping all MUI props intact.
 * - Allows granular style control via `sx`.
 */
import * as React from 'react';
import MuiListItemButton from '@mui/material/ListItemButton';
const ListItemButton = MuiListItemButton;
export type ListItemButtonProps = React.ComponentProps<typeof ListItemButton>;
(ListItemButton as any).displayName = 'Gui.ListItemButton';
export default ListItemButton;
