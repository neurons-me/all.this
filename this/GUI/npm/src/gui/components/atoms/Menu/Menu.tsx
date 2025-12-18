/*
 * This.GUI — Menu
 * Thin wrapper that preserves MUI's own typing and API.
 * Examples:
 *   <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
 *     {children}
 *   </Menu>
 */
import MuiMenu from '@mui/material/Menu';
import * as React from 'react';

// Re-export using MUI's own component type to keep full typing
const Menu = MuiMenu;
export type MenuProps = React.ComponentProps<typeof Menu>;

(Menu as any).displayName = 'Gui.Menu';
export default Menu;