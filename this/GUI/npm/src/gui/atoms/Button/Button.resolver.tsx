// src/gui/primitives/Button/Button.resolver.tsx
import * as React from 'react';
import Button from './Button';
import Icon from '@/gui/Theme/Icon/Icon';
import Link from '../Link/Link';
import type { RegistryEntry } from '@/gui/registry/types';
import type { SxProps, Theme } from '@mui/material/styles';
import { ensureNodeId } from '@/gui/utils/nodeID';
/**
 * Declarative spec for Button.
 * This is the JSON-friendly shape your renderer/LLM can emit.
 */
type ButtonSpec = {
  type: 'Button';
  props?: {
    // Content
    label?: string;                  // convenience for children text
    children?: React.ReactNode;      // optional explicit children
    // Visual
    variant?: 'text' | 'outlined' | 'contained';
    color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';
    size?: 'small' | 'medium' | 'large';
    startIcon?: React.ReactNode | string;
    endIcon?: React.ReactNode | string;
    sx?: SxProps<Theme>;
    disabled?: boolean;
    fullWidth?: boolean;
    // Routing / polymorphism
    external?: boolean | 'true' | 1;              // if true → anchor + target/rel
    href?: string;                   // for anchors
    to?: string;                     // for routers
    target?: React.HTMLAttributeAnchorTarget;
    rel?: string;
    component?: React.ElementType | string;                 // override polymorphic target (e.g., your Link)
    as?: React.ElementType | string;
    type?: 'button' | 'submit' | 'reset';
    // You can extend with data-* attributes, id, className, etc.
    id?: string;
    className?: string;
    'data-testid'?: string;
    [key: string]: any;
  };
};

/**
 * ButtonResolver
 * - Maps JSON-friendly spec → real <Button /> props.
 * - Keeps MUI polymorphism intact. If `to` is provided and no `component`,
 *   it defaults to your primitives Link; if `external` is true, it uses an anchor safely.
 */
const ButtonResolver: RegistryEntry = {
  type: 'Button',
  resolve(spec: ButtonSpec) {
    const p = spec.props ?? {};
    // Decide component priority
    const isExternal = p.external === true || p.external === 'true' || p.external === 1;
    let component: React.ElementType | string | undefined =
      p.component ?? p.as ?? (p.to ? Link : (p.href || isExternal) ? 'a' : undefined);

    const routingProps: Record<string, any> = {};
    if (component === Link && p.to) {
      routingProps.to = p.to;
    } else if (component === 'a') {
      routingProps.href = p.href;
      if (isExternal) {
        routingProps.target = p.target ?? '_blank';
        routingProps.rel = p.rel ?? 'noopener noreferrer';
      } else {
        if (p.target) routingProps.target = p.target;
        if (p.rel) routingProps.rel = p.rel;
      }
    }

    // Children precedence: explicit children > label > fallback
    const children = p.children ?? p.label ?? 'Button';
    return (
      <Button
        {...(component ? { component } : {})}
        variant={p.variant ?? 'text'}
        color={p.color ?? 'inherit'}
        size={p.size ?? 'medium'}
        startIcon={
          typeof p.startIcon === 'string' ? <Icon name={p.startIcon} /> : p.startIcon
        }
        endIcon={
          typeof p.endIcon === 'string' ? <Icon name={p.endIcon} /> : p.endIcon
        }
        disabled={p.disabled}
        fullWidth={p.fullWidth}
        type={p.type}
        sx={p.sx}
        id={ensureNodeId('button', p.id)}
        className={p.className}
        data-testid={p['data-testid']}
        {...routingProps}
      >
        {children}
      </Button>
    );
  },
};

export default ButtonResolver;