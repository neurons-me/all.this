// src/gui/components/atoms/Table/Table.resolver.tsx
import * as React from 'react';
import type { RegistryEntry, ResolveCtx } from '@/gui/registry/types';
import { ensureNodeId } from '@/gui/utils/nodeID';
import type { SxProps, Theme } from '@mui/material/styles';
import Table from './Table';

/**
 * Declarative spec for Table
 *
 * Notes
 * - Wraps MUI's Table. Polymorphic.
 * - Supports `sx` and common passthrough props.
 * - Use `id` / `data-gui-id` for editor instrumentation.
 */
export type TableSpec = {
  type: 'Table';
  props?: {
    children?: React.ReactNode;

    // Common Table props (subset; rest is passthrough)
    component?: any;
    as?: any; // alias
    size?: 'small' | 'medium';
    padding?: 'default' | 'checkbox' | 'none';
    stickyHeader?: boolean;

    // Styling
    sx?: SxProps<Theme>;

    // Instrumentation / misc
    id?: string;
    className?: string;
    'data-testid'?: string;
    'data-gui-id'?: string;

    // Allow arbitrary passthrough
    [key: string]: any;
  };
};

const TableResolver: RegistryEntry = {
  type: 'Table',
  resolve(spec: TableSpec, _ctx?: ResolveCtx) {
    const p = spec.props ?? {};

    const {
      children,
      sx,
      id,
      className,
      as: _as,
      component: componentProp,
      'data-gui-id': dataGuiIdProp,
      ...rest
    } = p as any;

    const component = componentProp ?? _as;
    const tableId = ensureNodeId('table', dataGuiIdProp ?? id);

    return (
      <Table
        component={component}
        id={tableId}
        className={className}
        sx={sx}
        data-testid={p['data-testid']}
        data-gui-id={tableId}
        {...rest}
      >
        {children}
      </Table>
    );
  },
};

export default TableResolver;
