// src/gui/atoms/ListItemIcon/ListItemIcon.resolver.tsx
import * as React from 'react';
import ListItemIcon from './ListItemIcon';
import Icon from '@/gui/Theme/Icon/Icon';
import type { RegistryEntry, ResolveCtx } from '@/gui/registry/types';
import type { SxProps, Theme } from '@mui/material/styles';
import { ensureNodeId } from '@/gui/utils/nodeID';

/**
 * Declarative spec for ListItemIcon
 *
 * Fidelity
 * - Forwards MUI props faithfully to `<ListItemIcon />`.
 * - `children` has priority over any sugar props.
 *
 * Sugar
 * - `icon`: string token (e.g., "lucide:mail", "mui:settings") or a ReactNode.
 * - `iconProps`: forwarded to `<Icon />` when `icon` is a string.
 * - `iconColor`: convenience alias mapped to Icon's color/htmlColor semantics.
 * - `size`: sets Icon size (default 20).
 *
 * Editor/Inspector
 * - Always emits a stable `data-gui-id` (auto via `ensureNodeId`) unless provided.
 */
export type ListItemIconSpec = {
  type: 'ListItemIcon';
  props?: {
    // content
    children?: React.ReactNode;

    // sugar for registry-driven icons
    icon?: React.ReactNode | string;
    iconProps?: Record<string, any>;
    iconColor?: string;
    size?: number;

    // styling
    sx?: SxProps<Theme>;
    className?: string;
    id?: string;
    'data-testid'?: string;

    // inspector id (auto if omitted)
    'data-gui-id'?: string;

    // passthrough
    [key: string]: any;
  };
};

const normalizeToken = (s: string) => String(s).trim().toLowerCase();

const ListItemIconResolver: RegistryEntry = {
  type: 'ListItemIcon',
  resolve(spec: ListItemIconSpec, _ctx?: ResolveCtx) {
    const p = spec.props ?? {};

    // Build content with precedence: children > icon sugar
    const { children, icon, iconColor, iconProps, size = 20 } = p;
    let content: React.ReactNode = children;
    if (content == null && icon) {
      content =
        typeof icon === 'string'
          ? <Icon name={normalizeToken(icon)} iconColor={iconColor} fontSize={size} {...iconProps} />
          : icon;
    }

    // Prepare safe props for ListItemIcon (avoid leaking resolver-only keys)
    const {
      // sugar / resolver-only
      icon: _icon,
      iconProps: _iconProps,
      iconColor: _iconColor,
      size: _size,
      'data-gui-id': providedNodeId,
      // keep common
      sx,
      className,
      id,
      'data-testid': dataTestId,
      // everything else passes through
      ...rest
    } = p;

    const dataGuiId = ensureNodeId('list-item-icon', providedNodeId);

    return (
      <ListItemIcon
        sx={sx}
        className={className}
        id={id}
        data-testid={dataTestId}
        data-gui-id={dataGuiId}
        {...rest}
      >
        {content}
      </ListItemIcon>
    );
  },
};

export default ListItemIconResolver;