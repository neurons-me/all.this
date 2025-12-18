// src/gui/atoms/IconButton/IconButton.resolver.tsx
import * as React from 'react';
import IconButton from './IconButton';
import Icon from '@/gui/Theme/Icon/Icon';
import Link from '@/gui/atoms/Link/Link';
import type { RegistryEntry, ResolveCtx } from '@/gui/registry/types';
import type { SxProps, Theme } from '@mui/material/styles';
import { ensureNodeId } from '@/gui/utils/nodeID';

/**
 * Declarative resolver for IconButton
 * -----------------------------------
 * - Forwards all MUI IconButton props faithfully.
 * - Supports polymorphism via `component` / `as`.
 * - Adds sugar:
 *    • `icon` string → rendered through our Icon registry (mui:/lucide: tokens), normalized to lowercase.
 *    • Routing helpers: if `to` w/o `component` → uses This.GUI `Link`; if `href`/`external` → uses anchor with safe target/rel.
 * - Provides granular styling via `sx` (root) and optional `iconSx`.
 *
 * A11y note: when rendering only an icon (no visible text), pass an `aria-label`.
 */
export type IconButtonSpec = {
  type: 'IconButton';
  props?: {
    children?: React.ReactNode;

    // Polymorphism
    component?: any;
    as?: any; // alias for component

    // Routing sugar
    to?: string;
    href?: string;
    external?: boolean;
    target?: React.HTMLAttributeAnchorTarget;
    rel?: string;

    // Sugar: icon may be a token or a node
    icon?: string | React.ReactNode;
    iconProps?: Record<string, any>;

    // MUI props passthrough (subset; others go via index signature)
    color?:
      | 'inherit'
      | 'default'
      | 'primary'
      | 'secondary'
      | 'success'
      | 'error'
      | 'info'
      | 'warning';
    size?: 'small' | 'medium' | 'large';
    edge?: 'start' | 'end' | false;
    disabled?: boolean;

    // Styling
    sx?: SxProps<Theme>;
    className?: string;
    id?: string;
    'data-testid'?: string;

    // Arbitrary passthrough (MUI will validate)
    [key: string]: any;
  };
};

const IconButtonResolver: RegistryEntry = {
  type: 'IconButton',
  resolve(spec: IconButtonSpec, _ctx?: ResolveCtx) {
    const p = spec.props ?? {};
    const nodeId = ensureNodeId('iconbutton', p.id as string | undefined);

    // Decide polymorphic target
    const component =
      p.component ??
      p.as ??
      (p.to ? Link : (p.href || p.external) ? 'a' : undefined);

    // Routing / anchor props
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

    // Prepare children (icon sugar)
    const { children, icon, iconProps } = p;
    const normalizedToken =
      typeof icon === 'string' ? icon.trim() : null;

    const effectiveChildren =
      children ??
      (normalizedToken ? (
        <Icon
          name={normalizedToken}
          {...(iconProps || {})}
        />
      ) : (
        icon ?? null
      ));

    // Collect & strip resolver-only keys so they don't leak to DOM
    const {
      as: _as,
      to: _to,
      href: _href,
      external: _external,
      target: _target,
      rel: _rel,
      icon: _icon,
      iconSx: _iconSx,
      iconProps: _iconProps,
      ...rest
    } = p;

    return (
      <IconButton
        {...(component ? { component } : {})}
        sx={p.sx}
        className={p.className}
        id={nodeId}
        data-testid={p['data-testid']}
        {...routingProps}
        {...rest}
      >
        {effectiveChildren}
      </IconButton>
    );
  },
};

export default IconButtonResolver;