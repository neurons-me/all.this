import React from 'react';
import MuiDrawer from '@mui/material/Drawer';
export type DrawerProps = React.ComponentProps<typeof MuiDrawer>;
/**
 * `Drawer` is a wrapper around MUI's `Drawer` component.
 *
 * It provides a consistent drawer interface for side navigation or temporary content containers.
 * All props from MUI's `Drawer` are forwarded via `DrawerProps`, ensuring type safety and
 * autocomplete support.
 *
 * This component also uses `React.forwardRef` to support ref forwarding for advanced use cases
 * like controlling the drawer programmatically or integrating with custom animations.
 *
 * Example usage:
 * ```tsx
 * <Drawer anchor="left" open={open} onClose={handleClose}>
 *   <List>...</List>
 * </Drawer>
 * ```
 */
export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(function Drawer(props, ref) {
  return <MuiDrawer ref={ref} {...props} />;
});

export default Drawer;
