/**
 * This.GUI — ListItem
 * Thin wrapper around MUI’s ListItem that preserves MUI’s props and typing.
 *
 * Fidelity
 * - We directly re-export MUI’s component so all behavior and typing remain intact.
 * - Granular styling is supported via the standard `sx` prop (MUI System).
 *
 * Why wrap it?
 * - Consistency with This.GUI’s atom pattern (each atom in its own module).
 * - Enables a clean spot for a resolver (declarative mode) without changing React usage.
 */
import * as React from 'react';
import MuiListItem from '@mui/material/ListItem';
const ListItem = MuiListItem;
export type ListItemProps = React.ComponentProps<typeof ListItem>;
// Useful name in React DevTools
(ListItem as any).displayName = 'Gui.ListItem';
export default ListItem;