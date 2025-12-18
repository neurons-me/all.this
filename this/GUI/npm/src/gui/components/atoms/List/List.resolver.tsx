// src/gui/atoms/List/List.resolver.tsx
import * as React from 'react';
import List from './List';
import ListSubheader from '@mui/material/ListSubheader';
import type { RegistryEntry, ResolveCtx } from '@/gui/registry/types';
import type { SxProps, Theme } from '@mui/material/styles';
import { ensureNodeId } from '@/gui/utils/nodeID';
/**
 * Declarative resolver for List
 *
 * Fidelity
 * - Forwards MUI props faithfully (dense, disablePadding, subheader, etc.).
 * - Supports polymorphism via `component` (and alias `as`).
 * - Provides **granular styling** via `sx` (root) and optional `subheaderSx`.
 * - Generates a stable id via `ensureNodeId`.
 *
 * Sugar
 * - `subheaderText`: if provided (and `subheader` not provided), we render
 *   a `<ListSubheader />` with that text. You can style it via `subheaderSx`.
 *
 * Note: Routing props (`href`, `to`, `external`) are not handled at the List level.
 */
export type ListSpec = {
  type: 'List';
  props?: {
    children?: React.ReactNode;
    // Polymorphism
    component?: any;
    as?: any; // alias of component
    // MUI props (subset; others passthrough)
    dense?: boolean;
    disablePadding?: boolean;
    subheader?: React.ReactNode;
    // Sugar
    subheaderText?: React.ReactNode;
    subheaderSx?: SxProps<Theme>;
    // Styling
    sx?: SxProps<Theme>; // root styles
    className?: string;
    id?: string;
    'data-testid'?: string;
    // Arbitrary passthrough
    [key: string]: any;
  };
};

const ListResolver: RegistryEntry = {
  type: 'List',
  resolve(spec: ListSpec, _ctx?: ResolveCtx) {
    const p = spec.props ?? {};
    const id = ensureNodeId('list', p.id);
    const component = p.component ?? p.as;
    const {
      children,
      subheader,
      subheaderText,
      subheaderSx,
      // strip resolver-only alias
      as: _as,
      // passthrough rest (dense, disablePadding, sx, etc.)
      ...rest
    } = p;
    const effectiveSubheader =
      subheader != null
        ? subheader
        : subheaderText != null
        ? (
            <ListSubheader component="div" sx={subheaderSx}>
              {subheaderText}
            </ListSubheader>
          )
        : undefined;

    const rootProps: any = {
      ...rest,
      sx: p.sx,
      className: p.className,
      id,
      'data-testid': p['data-testid'],
      subheader: effectiveSubheader,
    };
    if (component !== undefined) {
      rootProps.component = component;
    }

    return (
      <List {...rootProps}>
        {children}
      </List>
    );
  },
};

export default ListResolver;