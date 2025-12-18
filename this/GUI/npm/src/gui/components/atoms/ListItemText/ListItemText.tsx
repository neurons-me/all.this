/**
 * This component is a thin wrapper around MUI’s ListItemText.
 * It preserves MUI’s own props and typing.
 * It is kept polymorphic in line with MUI’s design.
 * This wrapper enables consistency with This.GUI’s declarative/resolver pattern.
 *
 * It is faithful to MUI because it re-exports MuiListItemText directly,
 * keeping props intact and typing consistent.
 */
import React from 'react';
import MuiListItemText from '@mui/material/ListItemText';
const ListItemText = MuiListItemText;
export type ListItemTextProps = React.ComponentProps<typeof ListItemText>;
(ListItemText as any).displayName = 'Gui.ListItemText';
export default ListItemText;