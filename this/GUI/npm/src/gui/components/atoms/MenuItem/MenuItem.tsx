/*
 * This.GUI — MenuItem
 * Thin wrapper that preserves MUI's own typing and API.
 * Examples:
 *   <MenuItem onClick={...}>Profile</MenuItem>
 *   <MenuItem selected dense>Settings</MenuItem>
 */
import MuiMenuItem from '@mui/material/MenuItem';
import * as React from 'react';
// Re-export using MUI's own component type to keep full typing
const MenuItem = MuiMenuItem;
export type MenuItemProps = React.ComponentProps<typeof MenuItem>;
(MenuItem as any).displayName = 'Gui.MenuItem';
export default MenuItem;
