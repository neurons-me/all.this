/**
 * This.GUI — List
 * Thin wrapper around MUI’s List that preserves MUI props & typing.
 *
 * Fidelity
 * - We directly re-export MUI’s component so all behavior/typing remain intact.
 * - Granular styling is supported via the standard `sx` prop (MUI System).
 *
 * Why wrap it?
 * - Consistency with This.GUI’s atom pattern (each atom in its own module).
 * - Provides a clean surface for a resolver (declarative mode) without
 *   altering React usage.
 */
import * as React from 'react';
import MuiList from '@mui/material/List';
const List = MuiList;
export type ListProps = React.ComponentProps<typeof List>;
// Helpful display name in React DevTools
(List as any).displayName = 'Gui.List';
export default List;