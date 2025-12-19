// src/gui/atoms/Stack/Stack.resolver.tsx
import * as React from 'react';
import Stack from './Stack';
import Link from '@/gui/atoms/Link/Link';
import type { RegistryEntry, ResolveCtx } from '@/gui/registry/types';
import { ensureNodeId } from '@/gui/utils/nodeID';
/**
 * Declarative spec for Stack (layout primitive)
 *
 * Notes
 * - Choose the rendered element via `component` (e.g. 'div', 'section', 'a', custom).
 * - If `to` is provided (and no explicit component), the resolver will default to This.GUI `Link`.
 * - If `external` is true (and no explicit component), it will default to an anchor (`'a'`) and apply
 *   safe `target`/`rel` defaults.
 * - Common Stack props (direction, spacing, divider, alignItems, justifyContent, useFlexGap, flexWrap, etc.) are passed through.
 */
export type StackSpec = {
  type: 'Stack';
  props?: {
    children?: React.ReactNode;
    // Polymorphism / routing
    component?: any; // 'div' | 'section' | 'a' | Link | custom
    as?: any;        // alias for component
    to?: string;     // router target (when component={Link})
    href?: string;   // anchor target (when component='a')
    external?: boolean; // force external anchor
    target?: React.HTMLAttributeAnchorTarget;
    rel?: string;
    // Core Stack props (subset; rest is passthrough)
    direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
    spacing?: number | string;
    divider?: React.ReactNode;
    useFlexGap?: boolean;
    alignItems?: React.CSSProperties['alignItems'];
    justifyContent?: React.CSSProperties['justifyContent'];
    flexWrap?: React.CSSProperties['flexWrap'];
    // Styling & misc
    sx?: any;
    className?: string;
    id?: string;
    'data-testid'?: string;
    // Allow system props / arbitrary passthrough
    [key: string]: any;
  };
};

const StackResolver: RegistryEntry = {
  type: 'Stack',
  resolve(spec: StackSpec, _ctx?: ResolveCtx) {
    const p = spec.props ?? {};
    const nodeId = ensureNodeId('Stack', p.id);
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
      as: _as,
      external: _external,
      to: _to,
      href: _href,
      target: _target,
      rel: _rel,
      id: _id,
      'data-testid': _dataTestId,
      ...rest
    } = p;
    return (
      <Stack
        component={component}
        sx={p.sx}
        id={nodeId}
        className={p.className}
        data-testid={p['data-testid']}
        {...routingProps}
        {...rest}
      >
        {children}
      </Stack>
    );
  },
};

export default StackResolver;