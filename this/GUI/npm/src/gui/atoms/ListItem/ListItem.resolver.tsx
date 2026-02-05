// src/gui/atoms/ListItem/ListItem.resolver.tsx
import * as React from 'react';
import ListItem from './ListItem';
import type { RegistryEntry, ResolveCtx } from '@/Registry/types';
import type { SxProps, Theme } from '@mui/material/styles';
import { ensureNodeId } from '@/gui/utils/nodeID';

/**
 * Declarative resolver for ListItem
 *
 * Fidelity
 * - Forwards all MUI ListItem props faithfully (alignItems, dense, divider, selected, etc.).
 * - Supports polymorphism via `component` prop (and alias `as`).
 * - Provides **granular styling** via `sx`.
 *
 * Notes
 * - In declarative (JSON/registry) mode, just pass props as object.
 * - If children are provided, they render directly.
 * - We emit a stable editor id under `data-gui-id` (not `id`) to avoid clashing with user-provided DOM ids.
 */
export type ListItemSpec = {
  type: 'ListItem';
  props?: {
    children?: React.ReactNode;

    // Polymorphism
    component?: any;
    as?: any;

    // MUI props (subset; others passthrough in `...rest`)
    dense?: boolean;
    divider?: boolean;
    disableGutters?: boolean;
    selected?: boolean;
    alignItems?: 'flex-start' | 'center';
    secondaryAction?: React.ReactNode;

    // Styling
    sx?: SxProps<Theme>;
    className?: string;

    // Identity & testing
    id?: string;
    'data-testid'?: string;
    'data-gui-id'?: string;

    // Arbitrary passthrough
    [key: string]: any;
  };
};

const ListItemResolver: RegistryEntry = {
  type: 'ListItem',
  resolve(spec: ListItemSpec, _ctx?: ResolveCtx) {
    const p = spec.props ?? {};

    // Polymorphic target (avoid passing undefined)
    const component = p.component ?? p.as;
    const rootPolymorphic = component ? { component } : {};

    // Stable editor id that doesn't clash with user DOM ids
    const guiId = ensureNodeId('list-item', p['data-gui-id']);

    // Collect props, strip resolver-only keys
    const {
      children,
      as: _as,
      'data-gui-id': _guiIdIn,
      ...rest
    } = p;

    return (
      <ListItem
        {...rootPolymorphic}
        sx={p.sx}
        className={p.className}
        id={p.id}
        data-testid={p['data-testid']}
        data-gui-id={guiId}
        {...rest}
      >
        {children}
      </ListItem>
    );
  },
};

export default ListItemResolver;