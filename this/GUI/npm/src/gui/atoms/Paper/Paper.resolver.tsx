// src/gui/atoms/Paper/Paper.resolver.tsx
import * as React from 'react';
import Paper from './Paper';
import Link from '@/gui/atoms/Link/Link';
import type { RegistryEntry, ResolveCtx } from '@/Registry/types';
import { ensureNodeId } from '@/gui/utils/nodeID';

/**
 * Declarative spec for Paper (polymorphic container)
 *
 * Notes
 * - You can choose the rendered element via `component` (e.g. 'div', 'section', 'a')
 * - If `to` is provided (and no explicit component), the resolver will default to This.GUI `Link`.
 * - If `external` is true (and no explicit component), it will default to an anchor (`'a'`) and apply
 *   safe `target`/`rel` defaults.
 * - Supports `sx` and arbitrary system props passthrough.
 */
export type PaperSpec = {
  type: 'Paper';
  props?: {
    children?: React.ReactNode;

    // Polymorphism / routing
    component?: any; // 'div' | 'section' | 'article' | 'a' | Link | custom
    as?: any;        // alias for component
    to?: string;     // router target (when component={Link})
    href?: string;   // anchor target (when component='a')
    external?: boolean; // force external anchor
    target?: React.HTMLAttributeAnchorTarget;
    rel?: string;

    // MUI Paper core props (subset; rest is passthrough)
    elevation?: number;
    square?: boolean;
    variant?: 'elevation' | 'outlined';

    // Styling & misc
    sx?: any;
    className?: string;
    id?: string;
    'data-testid'?: string;

    // Allow system props / arbitrary passthrough (p, m, display, etc.)
    [key: string]: any;
  };
};

const PaperResolver: RegistryEntry = {
  type: 'Paper',
  resolve(spec: PaperSpec, _ctx?: ResolveCtx) {
    const p = spec.props ?? {};
    const nodeId = ensureNodeId('Paper', p.id);

    // Decide polymorphic target
    const component = p.component ?? p.as ?? (p.to ? Link : p.external ? 'a' : undefined);

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

    // Collect common props and avoid leaking resolver-only keys
    const {
      children,
      // remove resolver-only keys so they don't end up as DOM attributes
      as: _as,
      external: _external,
      to: _to,
      href: _href,
      target: _target,
      rel: _rel,
      ...rest
    } = p;

    return (
      <Paper
        component={component}
        sx={p.sx}
        id={nodeId}
        className={p.className}
        data-testid={p['data-testid']}
        {...routingProps}
        {...rest}
      >
        {children}
      </Paper>
    );
  },
};

export default PaperResolver;