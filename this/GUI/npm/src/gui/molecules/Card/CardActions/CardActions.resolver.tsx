import * as React from 'react';
import type { RegistryEntry, ResolveCtx } from '@/Registry/types';
import type { SxProps, Theme } from '@mui/material/styles';
import { ensureNodeId } from '@/gui/utils/nodeID';
import CardActions from './CardActions';

/**
 * Declarative resolver for CardActions
 *
 * - Preserves MUI fidelity: `disableSpacing`, `sx`, and any pass-through props.
 * - Supports polymorphism via `component` or `as`.
 * - Accepts children and standard layout styling.
 */
export type CardActionsSpec = {
  type: 'CardActions';
  props?: {
    children?: React.ReactNode;
    disableSpacing?: boolean;
    sx?: SxProps<Theme>;
    className?: string;
    id?: string;
    'data-testid'?: string;
    component?: React.ElementType;
    as?: React.ElementType;
    [key: string]: any;
  };
};

const CardActionsResolver: RegistryEntry = {
  type: 'CardActions',
  resolve(spec: CardActionsSpec, _ctx?: ResolveCtx) {
    const p = spec.props ?? {};
    const {
      children,
      sx,
      className,
      id,
      component,
      as,
      ...rest
    } = p;
    const resolvedComponent = component ?? as;
    const actionsId = ensureNodeId('cardActions', id);
    return (
      <CardActions
        sx={sx}
        className={className}
        id={actionsId}
        data-testid={p['data-testid']}
        {...(resolvedComponent ? { component: resolvedComponent } : {})}
        {...rest}
      >
        {children}
      </CardActions>
    );
  },
};

export default CardActionsResolver;