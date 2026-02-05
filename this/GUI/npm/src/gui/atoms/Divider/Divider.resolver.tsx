import * as React from 'react';
import { Divider } from '@/gui/components/atoms';
import type { SxProps, Theme } from '@mui/material/styles';
import type { RegistryEntry, ResolveCtx } from '@/Registry/types';
import { ensureNodeId } from '@/gui/utils/nodeID';

/**
 * DividerResolver — declarative adapter for MUI Divider
 *
 * Fidelity
 * - Forwards MUI props faithfully (orientation, flexItem, light, variant, textAlign, etc.).
 * - Supports polymorphism via `component` (and alias `as`) when compatible with MUI Divider.
 * - Granular styling via `sx` on the root Divider.
 *
 * Sugar
 * - `text`: convenience for inline content (maps to children). If both `children` and `text`
 *   are provided, `children` takes precedence.
 *
 * JSON example:
 * {
 *   "type": "Divider",
 *   "props": {
 *     "orientation": "vertical",
 *     "flexItem": true,
 *     "text": "OR",
 *     "sx": { "borderColor": "primary.main" }
 *   }
 * }
 */
export type DividerSpec = {
  type: 'Divider';
  props?: {
    // Content
    children?: React.ReactNode;
    text?: React.ReactNode; // convenience alias for children

    // Polymorphism
    component?: React.ElementType | string;
    as?: React.ElementType | string; // alias for component

    // Common MUI Divider props (subset; passthrough handles the rest)
    orientation?: 'horizontal' | 'vertical';
    flexItem?: boolean;
    light?: boolean;
    variant?: 'fullWidth' | 'inset' | 'middle';
    textAlign?: 'center' | 'left' | 'right';

    // Styling & misc
    sx?: SxProps<Theme>;
    className?: string;
    id?: string;
    'data-testid'?: string;

    // Arbitrary passthrough
    [key: string]: any;
  };
};

const DividerResolver: RegistryEntry = {
  type: 'Divider',
  resolve(spec: DividerSpec, _ctx?: ResolveCtx) {
    const p = spec.props ?? {};
    // Extract and sanitize resolver-only fields so they don't leak to DOM
    const {
      children,
      text,
      as: _as,
      component: _component,
      sx,
      className,
      id,
      'data-testid': dataTestId,
      ...rest
    } = p;

    const component = (_component ?? _as) as React.ElementType | string | undefined;
    const content = children ?? text ?? undefined;
    const dividerId = ensureNodeId('divider', id);

    return (
      <Divider
        {...(component ? { component } : {})}
        sx={sx}
        className={className}
        id={dividerId}
        data-testid={dataTestId}
        {...rest}
      >
        {content}
      </Divider>
    );
  },
};

export default DividerResolver;