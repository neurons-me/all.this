import * as React from 'react';
import type { RegistryEntry, ResolveCtx } from '@/Registry/types';
import type { SxProps, Theme } from '@mui/material/styles';
import { ensureNodeId } from '@/gui/utils/nodeID';
import CardHeader from './CardHeader';

/**
 * Declarative resolver for CardHeader
 *
 * Purpose:
 * - Enables JSON-based rendering of card headers with title, subheader, and actions.
 * - Supports polymorphism (`component` or `as`) and typical MUI props.
 */
export type CardHeaderSpec = {
  type: 'CardHeader';
  props?: {
    title?: React.ReactNode;
    subheader?: React.ReactNode;
    action?: React.ReactNode;
    avatar?: React.ReactNode;
    component?: React.ElementType;
    as?: React.ElementType;
    sx?: SxProps<Theme>;
    className?: string;
    id?: string;
    'data-testid'?: string;
    [key: string]: any;
  };
};

const CardHeaderResolver: RegistryEntry = {
  type: 'CardHeader',
  resolve(spec: CardHeaderSpec, _ctx?: ResolveCtx) {
    const p = spec.props ?? {};
    const {
      id,
      component,
      as,
      sx,
      className,
      title,
      subheader,
      action,
      avatar,
      ...rest
    } = p;

    const headerId = ensureNodeId('cardHeader', id);
    const resolvedComponent = component ?? as;

    return (
      <CardHeader
        title={title}
        subheader={subheader}
        action={action}
        avatar={avatar}
        sx={sx}
        className={className}
        id={headerId}
        data-testid={p['data-testid']}
        {...(resolvedComponent ? { component: resolvedComponent } : {})}
        {...rest}
      />
    );
  },
};

export default CardHeaderResolver;