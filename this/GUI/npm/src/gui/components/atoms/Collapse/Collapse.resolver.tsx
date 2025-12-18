// src/gui/atoms/Collapse/Collapse.resolver.tsx
import * as React from 'react';
import Collapse from './Collapse';
import type { RegistryEntry, ResolveCtx } from '@/gui/registry/types';
import type { SxProps, Theme } from '@mui/material/styles';
import type { TransitionProps } from '@mui/material/transitions';
import { ensureNodeId } from '@/gui/utils/nodeID';

/**
 * Declarative resolver for Collapse
 * ---------------------------------
 * Fidelity
 * - Forwards MUI props faithfully (in, orientation, collapsedSize, timeout, easing, unmountOnExit, etc.).
 * - Supports polymorphism via `component` (and alias `as`).
 * - Provides granular styling through `sx` on the root.
 *
 * Usage (declarative JSON):
 * {
 *   "type": "Collapse",
 *   "props": {
 *     "in": true,
 *     "orientation": "vertical",
 *     "sx": { "border": "1px dashed", "borderColor": "divider" }
 *   }
 * }
 */
export type CollapseSpec = {
  type: 'Collapse';
  props?: {
    children?: React.ReactNode;

    // Note: MUI Collapse's `component` must be a React component (not a string tag) due to Transition typing.
    component?: React.ElementType<TransitionProps>;
    as?: any; // alias of component

    // Core MUI props (subset; others passthrough)
    in?: boolean;
    orientation?: 'vertical' | 'horizontal';
    collapsedSize?: number | string;
    timeout?: 'auto' | number | { appear?: number; enter?: number; exit?: number };
    easing?: string | { enter?: string; exit?: string };
    unmountOnExit?: boolean;
    mountOnEnter?: boolean;
    appear?: boolean;

    // Styling
    sx?: SxProps<Theme>;
    className?: string;
    id?: string;
    'data-testid'?: string;

    // Arbitrary passthrough
    [key: string]: any;
  };
};

const CollapseResolver: RegistryEntry = {
  type: 'Collapse',
  resolve(spec: CollapseSpec, _ctx?: ResolveCtx) {
    const p = spec.props ?? {};
    const { children, as: _as, component: _component, ...rest } = p;
    // Collapse's `component` must be a React component (not a string tag), otherwise TS will error.
    const rawComponent = _component ?? _as;
    const component = (typeof rawComponent === 'string'
      ? undefined
      : (rawComponent as React.ElementType<TransitionProps>)) as React.ElementType<TransitionProps> | undefined;

    // Guarantee a stable, prefixed id for editor tooling
    const collapseId = ensureNodeId('collapse', p.id);
    return (
      <Collapse
        {...(component ? { component: component as React.ElementType<TransitionProps> } : {})}
        sx={p.sx}
        className={p.className}
        id={collapseId}
        data-testid={p['data-testid']}
        {...rest}
      >
        {children}
      </Collapse>
    );
  },
};

export default CollapseResolver;