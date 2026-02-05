// src/gui/atoms/MenuItem/MenuItem.resolver.tsx
import * as React from 'react';
import MenuItem from './MenuItem';
import Link from '@/gui/atoms/Link/Link';
import Icon from '@/gui/Theme/Icon/Icon';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import type { RegistryEntry, ResolveCtx } from '@/Registry/types';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ListItemIconProps as MuiListItemIconProps } from '@mui/material/ListItemIcon';
import type { ListItemTextProps as MuiListItemTextProps } from '@mui/material/ListItemText';
import { ensureNodeId } from '@/gui/utils/nodeID';

// Merge sx parts into a single SxProps (filters out undefined)
const sxJoin = (...parts: Array<SxProps<Theme> | undefined>): SxProps<Theme> =>
  (parts.filter(Boolean) as unknown) as SxProps<Theme>;

/**
 * Declarative spec for MenuItem
 *
 * Notes
 * - Wraps MUI's MenuItem (supports `component` polymorphism).
 * - Declarative sugar:
 *    - `label` / `secondary` map to `<ListItemText primary/secondary />`
 *    - `startIcon` accepts a token (e.g., "mui:Settings", "lucide:mail") or a React node
 * - Granular styling:
 *    - `sx` (root MenuItem)
 *    - `iconSx` (ListItemIcon)
 *    - `textSx` (ListItemText)
 * - Slot props passthrough:
 *    - `ListItemIconProps`, `ListItemTextProps` (their `sx` are merged with iconSx/textSx)
 */
export type MenuItemSpec = {
  type: 'MenuItem';
  props?: {
    children?: React.ReactNode;

    // Polymorphism / routing
    component?: any; // 'li' | 'a' | Link | custom
    as?: any;        // alias for component
    to?: string;     // router target (when component={Link})
    href?: string;   // anchor target (when component='a')
    external?: boolean; // force external anchor
    target?: React.HTMLAttributeAnchorTarget;
    rel?: string;

    // Sugar
    label?: React.ReactNode | string;
    secondary?: React.ReactNode | string;
    startIcon?: React.ReactNode | string;
    iconColor?: string;

    // Core MenuItem props (subset; others passthrough)
    dense?: boolean;
    disabled?: boolean;
    divider?: boolean;
    selected?: boolean;
    autoFocus?: boolean;

    // Granular styling
    sx?: SxProps<Theme>;       // root
    iconSx?: SxProps<Theme>;   // ListItemIcon
    textSx?: SxProps<Theme>;   // ListItemText

    // Slot props passthrough
    ListItemIconProps?: MuiListItemIconProps;
    ListItemTextProps?: MuiListItemTextProps;

    // Misc
    id?: string;
    className?: string;
    'data-testid'?: string;
    'data-gui-id'?: string;

    // Allow arbitrary passthrough
    [key: string]: any;
  };
};

function renderDeclarativeIcon(node: React.ReactNode | string | undefined, iconColor?: string) {
  if (!node) return null;
  if (typeof node === 'string') return <Icon name={node} iconColor={iconColor} fontSize={20} />;
  return node;
}

function coerceComponent(comp: any) {
  // allow declarative string token "Link" to map to our Link component
  if (comp === 'Link') return Link;
  return comp;
}

const MenuItemResolver: RegistryEntry = {
  type: 'MenuItem',
  resolve(spec: MenuItemSpec, _ctx?: ResolveCtx) {
    const p = spec.props ?? {};

    const providedDataGuiId = p['data-gui-id'];

    // Decide polymorphic target
    const component = coerceComponent(p.component ?? p.as ?? (p.to ? Link : p.external ? 'a' : undefined));

    // Routing/anchor props
    const routingProps =
      component === 'a' || p.external
        ? {
            href: p.href,
            target: p.target ?? (p.external ? '_blank' : undefined),
            rel: p.rel ?? (p.external ? 'noopener noreferrer' : undefined),
          }
        : component === Link || (p.to && !p.component)
        ? { to: p.to }
        : {};

    const {
      children,
      label,
      secondary,
      startIcon,
      iconColor,
      ListItemIconProps,
      ListItemTextProps,
      // strip resolver-only keys
      as: _as,
      external: _external,
      to: _to,
      href: _href,
      target: _target,
      rel: _rel,
      'data-gui-id': _dataGuiId,
      ...rest
    } = p;

    const iconNode = renderDeclarativeIcon(startIcon, iconColor);
    const hasTextBlock = label != null || secondary != null;

    // Merge sx for ListItemIcon/Text if provided both via shorthand and slot props
    const mergedIconSx = (p.iconSx || ListItemIconProps?.sx)
      ? sxJoin(p.iconSx, ListItemIconProps?.sx as SxProps<Theme>)
      : undefined;

    const mergedTextSx = (p.textSx || ListItemTextProps?.sx)
      ? sxJoin(p.textSx, ListItemTextProps?.sx as SxProps<Theme>)
      : undefined;

    const finalIconProps: MuiListItemIconProps | undefined = iconNode
      ? {
          ...(ListItemIconProps || {}),
          ...(mergedIconSx ? { sx: mergedIconSx } : {}),
        }
      : undefined;

    const finalTextProps: MuiListItemTextProps | undefined = hasTextBlock
      ? {
          ...(ListItemTextProps || {}),
          ...(mergedTextSx ? { sx: mergedTextSx } : {}),
        }
      : undefined;

    const dataGuiId = ensureNodeId('menu-item', providedDataGuiId);

    return (
      <MenuItem
        component={component}
        sx={p.sx}
        id={p.id}
        className={p.className}
        data-testid={p['data-testid']}
        data-gui-id={dataGuiId}
        {...routingProps}
        {...rest}
      >
        {iconNode ? <ListItemIcon {...finalIconProps}>{iconNode}</ListItemIcon> : null}
        {hasTextBlock ? (
          <ListItemText primary={label} secondary={secondary} {...finalTextProps} />
        ) : (
          children
        )}
      </MenuItem>
    );
  },
};

export default MenuItemResolver;