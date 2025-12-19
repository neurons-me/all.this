// src/gui/atoms/ListItemButton/ListItemButton.resolver.tsx
import * as React from 'react';
import ListItemButton from './ListItemButton';
import Link from '@/gui/atoms/Link/Link';
import Icon from '@/gui/Theme/Icon/Icon';
// Use our own thin wrappers for consistency & display names
import ListItemIcon from '@/gui/atoms/ListItemIcon/ListItemIcon';
import ListItemText from '@/gui/atoms/ListItemText/ListItemText';
import type { RegistryEntry, ResolveCtx } from '@/gui/registry/types';
import type { SxProps, Theme } from '@mui/material/styles';
import Box from '../Box/Box';
import { ensureNodeId } from '@/gui/utils/nodeID';

/**
 * Declarative spec for ListItemButton
 *
 * Goals
 * - Be faithful to MUI's API: forward native props like `selected`, `disabled`, `dense`, `alignItems`, etc.
 * - Preserve polymorphism via MUI's `component` prop (and alias `as`).
 * - Add **declarative sugar** (optional):
 *    - `startIcon` / `endIcon`: string token (e.g., "lucide:mail", "mui:settings") or ReactNode
 *    - `label` / `secondary`: mapped to `<ListItemText primary/secondary />`
 * - Add **granular styling** for slots:
 *    - `sx`         → root ListItemButton
 *    - `iconSx`     → ListItemIcon (leading)
 *    - `textSx`     → ListItemText
 *    - `endIconSx`  → trailing icon container
 *
 * Notes
 * - If `children` are provided, they take precedence and render as-is (no sugar applied).
 * - Tokens are normalized (lowercased & trimmed) to avoid missing icons due to casing.
 * - Routing:
 *    - If `to` is provided (and no explicit `component`), the resolver will default to This.GUI `Link`.
 *    - If `external` is true (and no explicit `component`), it will default to an anchor `'a'` and add safe `target`/`rel`.
 */
export type ListItemButtonSpec = {
  type: 'ListItemButton';
  props?: {
    children?: React.ReactNode;

    // Polymorphism / routing
    component?: any; // 'div' | 'a' | Link | custom
    as?: any;        // alias for component
    to?: string;     // router target (when component={Link})
    href?: string;   // anchor target (when component='a')
    external?: boolean; // force external anchor
    target?: React.HTMLAttributeAnchorTarget;
    rel?: string;

    // Sugar (optional)
    startIcon?: React.ReactNode | string;
    endIcon?: React.ReactNode | string;
    iconColor?: string;       // applies to startIcon/endIcon when tokens
    endIconColor?: string;    // override for trailing icon
    size?: number;            // icon size (default 20)
    label?: React.ReactNode | string;
    secondary?: React.ReactNode | string;

    // MUI props (subset; others passthrough)
    selected?: boolean;
    disabled?: boolean;
    dense?: boolean;
    alignItems?: 'flex-start' | 'center';
    divider?: boolean;

    // Granular styling
    sx?: SxProps<Theme>;          // root
    iconSx?: SxProps<Theme>;      // leading ListItemIcon
    textSx?: SxProps<Theme>;      // ListItemText
    endIconSx?: SxProps<Theme>;   // trailing icon container

    // Slot props passthrough (their own sx can be merged)
    ListItemIconProps?: { sx?: SxProps<Theme>; [k: string]: any };
    ListItemTextProps?: { sx?: SxProps<Theme>; [k: string]: any };

    // Editor / telemetry
    'data-gui-id'?: string;

    // Misc DOM
    id?: string;
    className?: string;
    'data-testid'?: string;

    // Arbitrary passthrough
    [key: string]: any;
  };
};

const normalizeToken = (s: string) => s.trim().toLowerCase();

function renderIcon(node: React.ReactNode | string | undefined, color?: string, size = 20) {
  if (!node) return null;
  return typeof node === 'string'
    ? (
      <Icon
        name={normalizeToken(node)}
        iconColor={color}
        fontSize={size}
      />
    )
    : node;
}

const ListItemButtonResolver: RegistryEntry = {
  type: 'ListItemButton',
  resolve(spec: ListItemButtonSpec, _ctx?: ResolveCtx) {
    const p = spec.props ?? {};

    // Generate/ensure a stable gui id (does not override an explicit one)
    const dataGuiId = ensureNodeId('list-item-button', (p as any)['data-gui-id']);

    // Decide polymorphic target (only pass when defined)
    const decidedComponent = p.component ?? p.as ?? (p.to ? Link : p.external ? 'a' : undefined);
    const componentProp = decidedComponent ? { component: decidedComponent } : undefined;

    // Routing/anchor props
    const routingProps =
      decidedComponent === 'a' || p.external
        ? {
            href: p.href,
            target: p.target ?? (p.external ? '_blank' : undefined),
            rel: p.rel ?? (p.external ? 'noopener noreferrer' : undefined),
          }
        : decidedComponent === Link || (p.to && !p.component)
        ? { to: p.to }
        : {};

    // Destructure and clean resolver-only fields
    const {
      children,
      startIcon,
      endIcon,
      iconColor,
      endIconColor,
      size = 20,
      ListItemIconProps,
      ListItemTextProps,
      iconSx,
      textSx,
      endIconSx,

      // strip resolver-only aliasing keys so they don't leak to DOM
      as: _as,
      external: _external,
      to: _to,
      href: _href,
      target: _target,
      rel: _rel,

      // keep rest: native MUI props (selected, dense, disabled, divider, alignItems, sx, etc.)
      ...rest
    } = p as any;

    // If explicit children, render as-is (no sugar)
    if (children != null) {
      return (
        <ListItemButton
          {...componentProp}
          sx={p.sx}
          id={p.id}
          className={p.className}
          data-testid={p['data-testid']}
          data-gui-id={dataGuiId}
          {...routingProps}
          {...rest}
        >
          {children}
        </ListItemButton>
      );
    }

    // Build sugar content
    const leadingIcon = renderIcon(startIcon, iconColor, size);
    const trailingIcon = renderIcon(endIcon, endIconColor ?? iconColor, size);
    const hasText = p.label != null || p.secondary != null;

    // Merge sx for slot props safely (array merge preserves both)
    const mergedIconSx =
      iconSx != null && ListItemIconProps?.sx != null ? [iconSx, ListItemIconProps.sx] : iconSx ?? ListItemIconProps?.sx;
    const mergedTextSx =
      textSx != null && ListItemTextProps?.sx != null ? [textSx, ListItemTextProps.sx] : textSx ?? ListItemTextProps?.sx;

    const finalIconProps = leadingIcon
      ? (ListItemIconProps ? { ...ListItemIconProps, sx: mergedIconSx } : (mergedIconSx != null ? { sx: mergedIconSx } : undefined))
      : undefined;

    const finalTextProps = hasText
      ? (ListItemTextProps ? { ...ListItemTextProps, sx: mergedTextSx } : (mergedTextSx != null ? { sx: mergedTextSx } : undefined))
      : undefined;

    return (
      <ListItemButton
        {...componentProp}
        sx={p.sx}
        id={p.id}
        className={p.className}
        data-testid={p['data-testid']}
        data-gui-id={dataGuiId}
        {...routingProps}
        {...rest}
      >
        {leadingIcon ? <ListItemIcon {...finalIconProps}>{leadingIcon}</ListItemIcon> : null}
        {hasText ? <ListItemText primary={p.label} secondary={p.secondary} {...finalTextProps} /> : null}
        {trailingIcon ? (
          <Box sx={[{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center' }, endIconSx as any]}>
            {trailingIcon}
          </Box>
        ) : null}
      </ListItemButton>
    );
  },
};

export default ListItemButtonResolver;