// src/gui/atoms/Menu/Menu.resolver.tsx
import * as React from 'react';
import Menu from './Menu';
import type { RegistryEntry, ResolveCtx } from '@/gui/registry/types';
import type { SxProps, Theme } from '@mui/material/styles';
import type { PopoverOrigin } from '@mui/material/Popover';
import { ensureNodeId } from '@/gui/utils/nodeID';

/**
 * Declarative spec for Menu
 *
 * Notes
 * - Wraps MUI's Menu. Not polymorphic.
 * - Supports granular styling via:
 *    - `sx` (root Popover/Menu container)
 *    - `paperSx` (Paper slot)
 *    - `listSx` (MenuList slot)
 * - You can also pass through `PaperProps` and `MenuListProps`; their `sx` will be merged with `paperSx`/`listSx`.
 * - Supports `"data-gui-id"` for editor instrumentation.
 */
export type MenuSpec = {
  type: 'Menu';
  props?: {
    children?: React.ReactNode;

    // Core Menu props (subset; rest is passthrough)
    open?: boolean;
    anchorEl?: Element | null;
    onClose?: (...args: any[]) => void;
    onClick?: (...args: any[]) => void;
    keepMounted?: boolean;
    elevation?: number;
    variant?: 'menu' | 'selectedMenu';
    anchorOrigin?: PopoverOrigin;
    transformOrigin?: PopoverOrigin;
    TransitionProps?: any;

    // Granular styling
    sx?: SxProps<Theme>;         // root (Popover)
    paperSx?: SxProps<Theme>;    // Paper slot
    listSx?: SxProps<Theme>;     // MenuList slot

    // Slot props passthrough
    PaperProps?: any;
    MenuListProps?: any;

    // Misc passthrough
    id?: string;
    className?: string;
    'data-testid'?: string;
    "data-gui-id"?: string;

    // Allow arbitrary passthrough
    [key: string]: any;
  };
};

const MenuResolver: RegistryEntry = {
  type: 'Menu',
  resolve(spec: MenuSpec, _ctx?: ResolveCtx) {
    const p = spec.props ?? {};

    // Extract resolver-only style helpers and children
    const {
      sx,
      id,
      className,
      paperSx,
      listSx,
      PaperProps,
      MenuListProps,
      open,
      "data-gui-id": dataGuiId,
      // keep other props in `rest`
      ...rest
    } = p;

    const guiId = ensureNodeId('menu', dataGuiId);

    // Merge sx for Paper/MenuList without inserting `undefined` inside arrays
    const mergedPaperSx =
      paperSx != null && PaperProps?.sx != null
        ? [paperSx, PaperProps.sx]
        : paperSx ?? PaperProps?.sx;

    const mergedListSx =
      listSx != null && MenuListProps?.sx != null
        ? [listSx, MenuListProps.sx]
        : listSx ?? MenuListProps?.sx;

    const finalPaperProps = PaperProps ? { ...PaperProps, sx: mergedPaperSx } : (mergedPaperSx != null ? { sx: mergedPaperSx } : undefined);
    const finalMenuListProps = MenuListProps ? { ...MenuListProps, sx: mergedListSx } : (mergedListSx != null ? { sx: mergedListSx } : undefined);

    return (
      <Menu
        open={!!open}
        sx={sx}
        id={id}
        className={className}
        data-testid={p['data-testid']}
        data-gui-id={guiId}
        {...rest}
        PaperProps={finalPaperProps}
        MenuListProps={finalMenuListProps}
      >
        {p.children}
      </Menu>
    );
  },
};

export default MenuResolver;