import * as React from 'react';
import type { RegistryEntry, ResolveCtx } from '@/gui/registry/types';
import type { SxProps, Theme } from '@mui/material/styles';
import { ensureNodeId } from '@/gui/utils/nodeID';
import Avatar from './Avatar';
export type AvatarSpec = {
  type: 'Avatar';
  props?: {
    children?: React.ReactNode;
    alt?: string;
    src?: string;
    variant?: 'circular' | 'rounded' | 'square';
    sx?: SxProps<Theme>;
    className?: string;
    id?: string;
    'data-testid'?: string;
    component?: React.ElementType;
    as?: React.ElementType;
    [key: string]: any;
  };
};

const AvatarResolver: RegistryEntry = {
  type: 'Avatar',
  resolve(spec: AvatarSpec, _ctx?: ResolveCtx) {
    const p = spec.props ?? {};
    const {
      children,
      alt,
      src,
      variant,
      sx,
      className,
      id,
      component,
      as,
      ...rest
    } = p;

    const resolvedComponent = component ?? as;
    const avatarId = ensureNodeId('avatar', id);

    return (
      <Avatar
        src={src}
        alt={alt}
        variant={variant}
        sx={sx}
        className={className}
        id={avatarId}
        data-testid={p['data-testid']}
        {...(resolvedComponent ? { component: resolvedComponent } : {})}
        {...rest}
      >
        {children}
      </Avatar>
    );
  },
};

export default AvatarResolver;