import * as React from 'react';
import type { RegistryEntry, ResolveCtx } from '@/Registry/types';
import Icon from '@/gui/Theme/Icon/Icon';

export type IconSpec = {
  type: 'Icon';
  props: {
    name: string;
    fill?: number;
    weight?: number;
    grade?: number;
    opticalSize?: number;
    fontSize?: number | string;
    iconColor?: string;
    className?: string;
    style?: React.CSSProperties;
    [key: string]: any; // permite pasar props adicionales
  };
};

const IconResolver: RegistryEntry = {
  type: 'Icon',
  resolve(spec: IconSpec, _ctx?: ResolveCtx) {
    const p = spec.props ?? {};
    return <Icon {...p} />;
  },
};

export default IconResolver;