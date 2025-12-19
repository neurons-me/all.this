import * as React from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import type { RegistryEntry, ResolveCtx } from '@/gui/registry/types';
import { ensureNodeId } from '@/gui/utils/nodeID';
import Card from './Card';

/**
 * Declarative resolver for Card
 * -----------------------------
 * - Faithfully wraps MUI's Card.
 * - Supports standard props like `variant`, `elevation`, `sx`, etc.
 * - `children` maps directly to content inside the Card.
 * - Supports polymorphic `component` prop and alias `as`.
 */
export type CardSpec = {
  type: 'Card';
  props?: {
    children?: React.ReactNode;
    variant?: 'elevation' | 'outlined';
    raised?: boolean;
    elevation?: number;
    sx?: SxProps<Theme>;
    className?: string;
    id?: string;
    'data-testid'?: string;
    component?: React.ElementType;
    as?: React.ElementType;
    [key: string]: any;
  };
};

const CardResolver: RegistryEntry = {
  type: 'Card',
  resolve(spec: CardSpec, _ctx?: ResolveCtx) {
    const p = spec.props ?? {};
    const {
      children,
      id,
      className,
      sx,
      component,
      as,
      ...rest
    } = p;

    const resolvedComponent = component ?? as;
    const cardId = ensureNodeId('card', id);

    return (
      <Card
        {...(resolvedComponent ? { component: resolvedComponent } : {})}
        id={cardId}
        className={className}
        sx={sx}
        {...rest}
      >
        {children}
      </Card>
    );
  },
};

export default CardResolver;