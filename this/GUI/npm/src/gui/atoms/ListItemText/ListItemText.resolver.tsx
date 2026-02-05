// src/gui/atoms/ListItemText/ListItemText.resolver.tsx
import * as React from 'react';
import ListItemText from './ListItemText';
import type { RegistryEntry, ResolveCtx } from '@/Registry/types';
import type { SxProps, Theme } from '@mui/material/styles';
import { ensureNodeId } from '@/gui/utils/nodeID';

/**
 * Declarative spec for ListItemText
 *
 * Goals
 * - Be faithful to MUI's API: pass through native props like `primary`, `secondary`,
 *   `inset`, `disableTypography`, `primaryTypographyProps`, `secondaryTypographyProps`, etc.
 * - Add **granular styling** sugar for slots:
 *    - `sx`            → root container
 *    - `primarySx`     → merged into `primaryTypographyProps.sx`
 *    - `secondarySx`   → merged into `secondaryTypographyProps.sx`
 *
 * Notes
 * - Not a routing component; we simply respect optional `component` (or `as`) for polymorphism.
 * - We avoid inserting `undefined` inside `sx` arrays; we compute merged values safely.
 */
export type ListItemTextSpec = {
  type: 'ListItemText';
  props?: {
    // MUI core props (subset; the rest are forwarded)
    primary?: React.ReactNode;
    secondary?: React.ReactNode;
    inset?: boolean;
    disableTypography?: boolean;
    primaryTypographyProps?: any;
    secondaryTypographyProps?: any;

    // Polymorphism
    component?: any;
    as?: any; // alias of component

    // Granular styling
    sx?: SxProps<Theme>;            // root
    primarySx?: SxProps<Theme>;     // Typography for primary
    secondarySx?: SxProps<Theme>;   // Typography for secondary

    // Misc
    id?: string;
    className?: string;
    'data-testid'?: string;
    'data-gui-id'?: string;

    // Allow arbitrary passthrough (Typography props, etc.)
    [key: string]: any;
  };
};

const ListItemTextResolver: RegistryEntry = {
  type: 'ListItemText',
  resolve(spec: ListItemTextSpec, _ctx?: ResolveCtx) {
    const p = spec.props ?? {};

    const dataGuiId = ensureNodeId('list-item-text', (p as any)['data-gui-id']);

    // Determine component target (no routing here)
    const component = p.component ?? p.as;

    const {
      // extract slot style sugar and slot props to merge
      primarySx,
      secondarySx,
      primaryTypographyProps,
      secondaryTypographyProps,
      // strip resolver-only alias
      as: _as,
      "data-gui-id": dataGuiIdProp,
      // keep the rest (includes primary/secondary/sx/etc.)
      ...rest
    } = p;

    // Merge sx into Typography slot props without introducing undefined in arrays
    const mergedPrimarySx =
      primarySx != null && primaryTypographyProps?.sx != null
        ? [primarySx, primaryTypographyProps.sx]
        : primarySx ?? primaryTypographyProps?.sx;

    const mergedSecondarySx =
      secondarySx != null && secondaryTypographyProps?.sx != null
        ? [secondarySx, secondaryTypographyProps.sx]
        : secondarySx ?? secondaryTypographyProps?.sx;

    const finalPrimaryTypographyProps = primaryTypographyProps
      ? { ...primaryTypographyProps, sx: mergedPrimarySx }
      : mergedPrimarySx != null
      ? { sx: mergedPrimarySx }
      : undefined;

    const finalSecondaryTypographyProps = secondaryTypographyProps
      ? { ...secondaryTypographyProps, sx: mergedSecondarySx }
      : mergedSecondarySx != null
      ? { sx: mergedSecondarySx }
      : undefined;

    return (
      <ListItemText
        component={component}
        primaryTypographyProps={finalPrimaryTypographyProps}
        secondaryTypographyProps={finalSecondaryTypographyProps}
        data-gui-id={dataGuiId}
        {...rest}
      />
    );
  },
};

export default ListItemTextResolver;