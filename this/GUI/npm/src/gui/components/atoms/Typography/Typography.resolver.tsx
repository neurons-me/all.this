// src/gui/atoms/Typography/Typography.resolver.tsx
import * as React from 'react';
import Typography from './Typography';
import Link from '@/gui/atoms/Link/Link';
import type { RegistryEntry } from '@/gui/registry/types';
import type { SxProps, Theme } from '@mui/material/styles';
import { ensureNodeId } from '@/gui/utils/nodeID';

/**
 * Declarative spec for Typography
 * - JSON-friendly: prefer `to` / `href` / `external` over `component`.
 * - React usage: `component` may be a real React element type (Link, etc.).
 * - A `data-gui-id` is attached automatically for stable editor/node identification.
 */
type TypographySpec = {
  type: 'Typography';
  props?: {
    // Content
    text?: React.ReactNode;            // convenience for simple text
    children?: React.ReactNode;        // explicit children wins over `text`

    // Core MUI props (subset; rest are passthrough)
    variant?:
      | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
      | 'subtitle1' | 'subtitle2'
      | 'body1' | 'body2'
      | 'caption' | 'overline'
      | 'button';
    align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
    paragraph?: boolean;
    gutterBottom?: boolean;
    noWrap?: boolean;
    color?: any;
    variantMapping?: Record<string, React.ElementType>;

    // Polymorphism / routing
    component?: any;                   // React-only; ignored if a plain string (except 'a')
    as?: any;                          // alias of component
    to?: string;                       // SPA routing (resolver defaults to This.GUI Link)
    href?: string;                     // anchor target
    external?: boolean;                // if true → anchor + safe target/rel
    target?: React.HTMLAttributeAnchorTarget;
    rel?: string;

    // Styling / misc
    sx?: SxProps<Theme>;
    className?: string;
    id?: string;
    'data-testid'?: string;

    // arbitrary passthrough
    [key: string]: any;
  };
};

/**
 * TypographyResolver
 * - Maps JSON-friendly spec → real <Typography /> props.
 * - If `to` is present (and no explicit component), defaults to This.GUI `Link`.
 * - If `external` is true, or `href` is provided (and no explicit component), renders an anchor.
 * - Never leaks `to`/`href` to invalid targets.
 * - A `data-gui-id` is attached automatically for stable editor/node identification.
 */
const TypographyResolver: RegistryEntry = {
  type: 'Typography',
  resolve(spec: TypographySpec) {
    const p = spec.props ?? {};

    // Stable editor/node id (does not collide with user's `id`)
    const guiId = ensureNodeId('Typography', (p as any)['data-gui-id']);

    // Resolve a safe component:
    // - accept real React element types/functions (React usage)
    // - allow intrinsic 'a' (string) explicitly
    // - ignore other strings coming from JSON (e.g. "Link")
    const rawComp = p.component ?? p.as;
    const safeFromReact =
      typeof rawComp === 'function' ? rawComp
      : undefined;
    const allowedIntrinsic = rawComp === 'a' ? 'a' : undefined;

    let component: any = safeFromReact ?? allowedIntrinsic ?? undefined;

    // Build routing props carefully, only when target supports them
    const extraProps: Record<string, any> = {};

    if (p.external) {
      // External anchors always render as <a>
      if (!component) component = 'a';
      if (component === 'a') {
        extraProps.href = p.href;
        extraProps.target = p.target ?? '_blank';
        extraProps.rel = p.rel ?? 'noopener noreferrer';
      }
    } else if (p.to && !component) {
      // SPA routing by default uses our Link
      component = Link;
      extraProps.to = p.to;
    } else if (p.href && !component) {
      // Plain anchors (non-external)
      component = 'a';
      extraProps.href = p.href;
      if (p.target) extraProps.target = p.target;
      if (p.rel) extraProps.rel = p.rel;
    } else {
      // If user passed a real Link component explicitly, wire `to`
      if (component === Link && p.to) {
        extraProps.to = p.to;
      }
      // If user passed 'a', wire `href`/`target`/`rel`
      if (component === 'a' && (p.href || p.target || p.rel)) {
        if (p.href) extraProps.href = p.href;
        if (p.target) extraProps.target = p.target;
        if (p.rel) extraProps.rel = p.rel;
      }
      // Otherwise do not leak `to`/`href` to invalid DOM nodes
    }

    // Children precedence: explicit children > text > empty
    const children = p.children ?? p.text ?? null;

    // Strip resolver-only fields so they don't end up as DOM attributes
    const {
      text: _text,
      as: _as,
      external: _external,
      to: _to,
      href: _href,
      target: _target,
      rel: _rel,
      ...rest
    } = p;

    return (
      <Typography
        component={component}
        variant={p.variant}
        align={p.align}
        paragraph={p.paragraph}
        gutterBottom={p.gutterBottom}
        noWrap={p.noWrap}
        color={p.color}
        variantMapping={p.variantMapping}
        sx={p.sx}
        className={p.className}
        id={p.id}
        data-testid={p['data-testid']}
        data-gui-id={guiId}
        {...extraProps}
        {...rest}
      >
        {children}
      </Typography>
    );
  },
};

export default TypographyResolver;