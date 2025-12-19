import * as React from 'react';
import type { RegistryEntry, ResolveCtx } from '@/gui/registry/types';
import type { SxProps, Theme } from '@mui/material/styles';
import { ensureNodeId } from '@/gui/utils/nodeID';
import CardContent from './CardContent';

/**
 * Declarative resolver for CardContent
 *
 * Maps JSON-friendly specs into a GUI-compatible CardContent wrapper.
 * - Passes through `children`, `sx`, `className`, `id`, and `component`/`as`.
 * - Allows custom styling and polymorphic rendering.
 */
export type CardContentSpec = {
  type: 'CardContent';
  props?: {
    children?: React.ReactNode;
    sx?: SxProps<Theme>;
    className?: string;
    id?: string;
    'data-testid'?: string;
    component?: React.ElementType;
    as?: React.ElementType;
    [key: string]: any;
  };
};

const CardContentResolver: RegistryEntry = {
  type: 'CardContent',
  resolve(spec: CardContentSpec, _ctx?: ResolveCtx) {
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

    const contentId = ensureNodeId('cardContent', id);
    const resolvedComponent = component ?? as;

    return (
      <CardContent
        sx={sx}
        className={className}
        id={contentId}
        data-testid={p['data-testid']}
        {...(resolvedComponent ? { component: resolvedComponent } : {})}
        {...rest}
      >
        {children}
      </CardContent>
    );
  },
};

export default CardContentResolver;