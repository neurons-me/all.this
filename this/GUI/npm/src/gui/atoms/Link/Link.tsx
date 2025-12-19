import React, { forwardRef, Suspense } from 'react';
import { Link as MuiLink, LinkProps as MuiLinkProps } from '@mui/material';
import { useInRouterContext } from 'react-router-dom';
import type { LinkProps as RouterLinkProps } from 'react-router-dom';

type GuiLinkProps = MuiLinkProps & { to?: RouterLinkProps['to'] };

/**
 * Safe Link wrapper for MUI + React Router
 */
const Link = forwardRef<HTMLAnchorElement, GuiLinkProps>(function Link(props, ref) {
  const { to, ...rest } = props;
  const inRouterContext = useInRouterContext();

  if (!to) return <MuiLink ref={ref} {...rest} />;

  if (!inRouterContext) {
    const href = typeof to === 'string' ? to : undefined;
    return <MuiLink href={href} ref={ref} {...rest} />;
  }

  // ✅ Lazy load RouterLink only inside router context
  const RouterLink = React.lazy(async () => {
    const mod = await import('react-router-dom');
    return { default: mod.Link };
  });

  return (
    <Suspense fallback={<MuiLink ref={ref} {...rest} />}>
      <MuiLink component={RouterLink} to={to} ref={ref} {...rest} />
    </Suspense>
  );
});

export default Link;
export type { GuiLinkProps as LinkProps };