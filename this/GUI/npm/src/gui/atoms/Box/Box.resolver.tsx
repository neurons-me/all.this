import * as React from 'react';
import Box from './Box';
import Link from '../Link/Link';
import type { RegistryEntry, ResolveCtx } from '@/Registry/types';
import type { SxProps, Theme } from '@mui/material/styles';
import { ensureNodeId } from '@/gui/utils/nodeID';

/**
 * Declarative spec for Box (polymorphic container)
 *
 * JSON-friendly rules:
 * - Prefer `to` / `href` / `external` over passing a string `"Link"`.
 * - We accept intrinsic element strings (e.g. 'div', 'section', 'span', 'a', 'img').
 * - If `to` is present and no explicit React component was provided, we render with This.GUI `Link`.
 * - If `href`/`external` are present and no explicit component was provided, we render an anchor (`'a'`).
 * - When `component="img"`, image attributes (`src`, `alt`, `width`, `height`, etc.) are passed through.
 */
export type BoxSpec = {
  type: 'Box';
  props?: {
    children?: React.ReactNode;

    // Polymorphism / routing
  component?: React.ElementType | string;
    as?: React.ElementType | string; // alias for component
    to?: string;     // router target (when component={Link} or inferred)
    href?: string;   // anchor target (when component='a' or inferred)
    external?: boolean | 'true' | 1; // if truthy, anchor gets safe target/rel
    target?: React.HTMLAttributeAnchorTarget;
    rel?: string;

    // IMG-specific (when component='img')
    src?: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
    loading?: 'eager' | 'lazy';
    decoding?: 'auto' | 'sync' | 'async';
    referrerPolicy?: React.HTMLAttributeReferrerPolicy;
    sizes?: string;
    srcSet?: string;

    // Styling & misc
    sx?: SxProps<Theme>;
    className?: string;
    id?: string;
    'data-testid'?: string;

    // Allow system props / arbitrary passthrough (gap, p, m, display, etc.)
    [key: string]: any;
  };
};

const BoxResolver: RegistryEntry = {
  type: 'Box',
  resolve(spec: BoxSpec, _ctx?: ResolveCtx) {
    const p = spec.props ?? {};

    // Decide polymorphic target (safe for JSON):
    // - Accept real React components (functions/classes).
    // - Accept intrinsic strings ('div','section','span','a','img', etc.) EXCEPT the string "Link".
    // - Infer Link/'a' from `to`/`href` when no explicit component is provided.
    const rawComp = p.component ?? p.as;

    const isReactComp = typeof rawComp === 'function';
    const isString = typeof rawComp === 'string';

    // Normalize strings (e.g. 'Img' -> 'img'); disallow the literal "Link"
    const normalizedString = isString ? String(rawComp).trim() : undefined;
    const lowered = normalizedString ? normalizedString.toLowerCase() : undefined;
    const isIntrinsicString = !!normalizedString && lowered !== 'link';

    let component: any | undefined =
      isReactComp ? (rawComp as React.ElementType) :
      isIntrinsicString ? normalizedString :
      undefined;

    if (!component) {
      if (p.to) {
        component = Link;
      } else if (p.href || p.external) {
        component = 'a';
      }
    }

    // Build routing/anchor props only if they match the chosen component
    const routingProps: Record<string, any> = {};
    if (component === Link && p.to) {
      routingProps.to = p.to;
    }
    if (component === 'a') {
      routingProps.href = p.href;
      const isExternal = p.external === true || p.external === 'true' || p.external === 1;
      if (isExternal) {
        routingProps.target = p.target ?? '_blank';
        routingProps.rel = p.rel ?? 'noopener noreferrer';
      } else {
        if (p.target) routingProps.target = p.target;
        if (p.rel) routingProps.rel = p.rel;
      }
    }

    // IMG specific passthrough (only when explicitly rendering an <img>)
    const imgProps =
      component === 'img'
        ? {
            src: p.src,
            alt: p.alt,
            width: p.width,
            height: p.height,
            loading: p.loading,
            decoding: p.decoding,
            referrerPolicy: p.referrerPolicy,
            sizes: p.sizes,
            srcSet: p.srcSet,
          }
        : {};

    // Dev-time nudge if someone picked 'img' without a src
    if (process.env.NODE_ENV !== 'production' && component === 'img' && !p.src) {
      // eslint-disable-next-line no-console
      console.warn('[Box.resolver] component="img" used without a `src` prop.');
    }

    // Collect common props and avoid leaking resolver-only keys
    const {
      children,
      // resolver-only / routing keys to strip
      as: _as,
      to: _to,
      href: _href,
      external: _external,
      target: _target,
      rel: _rel,
      // img-only keys already handled
      src: _src,
      alt: _alt,
      width: _width,
      height: _height,
      loading: _loading,
      decoding: _decoding,
      referrerPolicy: _referrerPolicy,
      sizes: _sizes,
      srcSet: _srcSet,
      // passthrough everything else (system props, data-*, aria-*, etc.)
      ...rest
    } = p;

    // Build root props, conditionally attach `component`
    const rootProps: Record<string, any> = {
      sx: p.sx,
      id: ensureNodeId('box', p.id),
      className: p.className,
      'data-testid': p['data-testid'],
      ...routingProps,
      ...imgProps,
      ...rest,
    };
    if (component) {
      rootProps.component = component;
    }

    return (
      <Box {...rootProps}>
        {children}
      </Box>
    );
  },
};

export default BoxResolver;