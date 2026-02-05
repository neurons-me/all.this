import { useEffect, useMemo, useRef } from 'react';
import { Bar, Box, Toolbar, Typography, Avatar, Tooltip } from '@/gui/atoms';
import { Link as RouterLink } from 'react-router-dom';
import Icon from '@/gui/Theme/Icon/Icon';
import { useGuiTheme, useGuiMediaQuery, useInsets, useUpdateInsets } from '@/gui/hooks';
import type { FooterProps, FooterElement } from './Footer.types';
import type { FooterLinkProps, FooterActionProps } from './Footer.types';
import type { SxProps, Theme } from '@mui/material/styles';
const sxN = (...parts: Array<SxProps<Theme> | undefined>): SxProps<Theme> =>
  (parts.filter(Boolean) as unknown) as SxProps<Theme>;
type FooterLinkRenderProps = FooterLinkProps & {
  showLabel: boolean;
};

type FooterActionRenderProps = FooterActionProps & {
  showLabel: boolean;
};

const FooterLink = ({
  label,
  icon,
  iconColor,
  href,
  external,
  onClick,
  showLabel,
}: FooterLinkRenderProps) => {
  const content = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: showLabel ? 1 : 0,
        color: 'inherit',
        textDecoration: 'none',
        px: showLabel ? 1.5 : 0.75,
        py: 0.75,
        borderRadius: 1,
        transition: 'background-color 0.2s ease, color 0.2s ease',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      {icon && <Icon name={icon} iconColor={iconColor} />}
      {showLabel && label && (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
      )}
    </Box>
  );

  const wrappedContent =
    !showLabel && label ? (
      <Tooltip title={label} placement="top">
        <span style={{ display: 'inline-flex' }}>{content}</span>
      </Tooltip>
    ) : (
      content
    );

  const commonProps = {
    onClick,
    style: { color: 'inherit' },
  };

  if (href) {
    const component = href.startsWith('http')
      ? 'a'
      : RouterLink;
    return (
      <Box
        component={component as any}
        to={!href.startsWith('http') ? href : undefined}
        href={href.startsWith('http') ? href : undefined}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        sx={{ display: 'inline-flex' }}
        {...commonProps}
      >
        {wrappedContent}
      </Box>
    );
  }

  return (
    <Box component="button" type="button" sx={{ display: 'inline-flex', background: 'none', border: 'none', p: 0 }} {...commonProps}>
      {wrappedContent}
    </Box>
  );
};

const FooterAction = ({
  label,
  icon,
  iconColor,
  onClick,
  element,
  showLabel,
}: FooterActionRenderProps) => {
  if (element) {
    return <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>{element}</Box>;
  }

  const content = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: showLabel ? 1 : 0,
        px: showLabel ? 1.5 : 0.75,
        py: 0.75,
        borderRadius: 1,
        transition: 'background-color 0.2s ease',
        '&:hover': { backgroundColor: 'action.hover' },
        color: 'inherit',
      }}
      onClick={onClick}
      role="button"
    >
      {icon && <Icon name={icon} iconColor={iconColor} />}
      {showLabel && label && (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
      )}
    </Box>
  );

  if (!showLabel && label) {
    return (
      <Tooltip title={label} placement="top">
        <span style={{ display: 'inline-flex' }}>{content}</span>
      </Tooltip>
    );
  }

  return content;
};

function renderFooterElement(el: FooterElement, showLabel: boolean, key: string | number) {
  if (el.type === 'link') return <FooterLink key={key} {...el.props} showLabel={showLabel} />;
  if (el.type === 'action') return <FooterAction key={key} {...el.props} showLabel={showLabel} />;
  return null;
}

export default function Footer(props: FooterProps) {
  const {
    brandLabel = '',
    brandLogo = '',
    brandHref = '/',
    brandAvatarFallback,
    leftElements = [],
    centerElements = [],
    rightElements = [],
    position = 'static',
    elevation = 0,
    className,
    id,
    sx,
    appBarSx,
    sectionSx,
    'data-testid': dataTestId,
  } = props;

  const theme = useGuiTheme();
  const isMobile = useGuiMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useGuiMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useGuiMediaQuery(theme.breakpoints.up('md'));
  const showLabels = isDesktop;
  const showBrandLabel = !isMobile;

  const insets = useInsets();
  const updateInsets = useUpdateInsets();
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const BarRef = useRef<HTMLDivElement | null>(null);

  const insetLeft = Math.max(0, Number(insets?.left ?? 0));
  const insetRight = Math.max(0, Number(insets?.right ?? 0));
  const horizontalInset = insetLeft + insetRight;

  const brandVisual = useMemo(() => {
    if (brandLogo) {
      return <Box component="img" src={brandLogo} alt={brandLabel ? `${brandLabel} logo` : 'Footer logo'} sx={{ height: 24 }} />;
    }
    const fallback = brandAvatarFallback || brandLabel?.trim().charAt(0)?.toUpperCase() || '?';
    return <Avatar sx={{ width: 28, height: 28, fontSize: '0.875rem' }}>{fallback}</Avatar>;
  }, [brandAvatarFallback, brandLabel, brandLogo]);

  useEffect(() => {
    if (typeof updateInsets !== 'function') return;
    const measure = () => {
      const target = BarRef.current ?? toolbarRef.current;
      const h = target?.offsetHeight ?? 56;
      updateInsets({ bottom: position === 'fixed' || position === 'sticky' ? h : 0 });
    };
    measure();

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      const target = BarRef.current ?? toolbarRef.current;
      if (target) {
        ro = new ResizeObserver(() => measure());
        ro.observe(target);
      }
    }

    return () => {
      if (ro) ro.disconnect();
      updateInsets({ bottom: 0 });
    };
  }, [position, updateInsets, isMobile, isTablet]);

  const isFixed = position === 'fixed' || position === 'sticky';
  const baseBarSx = {
    top: 'auto',
    bottom: 0,
    backgroundColor: theme.palette.background.paper ?? theme.palette.grey[900],
    borderTop: '1px solid',
    borderColor: theme.palette.divider,
    minHeight: 56,
    zIndex: (theme.zIndex?.appBar ?? 1100) - 1,
    boxShadow: 'none',
    ...(isFixed
      ? {
          position: 'fixed',
          left: `${insetLeft}px`,
          right: `${insetRight}px`,
          width: `calc(100% - ${horizontalInset}px)`,
          transition: 'left 0.3s ease, right 0.3s ease, width 0.3s ease',
        }
      : {
          position: 'static',
          ml: `${insetLeft}px`,
          mr: `${insetRight}px`,
          width: `calc(100% - ${horizontalInset}px)`,
          transition: 'margin-left 0.3s ease, margin-right 0.3s ease, width 0.3s ease',
        }),
  } as const;

  return (
    <Bar
      ref={BarRef}
      id={id}
      className={className}
      data-testid={dataTestId}
      position={position}
      elevation={elevation}
      sx={sxN(baseBarSx as SxProps<Theme>, sx, appBarSx)}
    >
      <Toolbar
        ref={toolbarRef}
        variant="dense"
        disableGutters
        sx={sxN(
          {
            minHeight: 56,
            px: 1.5,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
          },
          sectionSx
        )}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: showLabels ? 1 : 0.5,
            color: 'text.secondary',
            flexShrink: 0,
          }}
        >
          {leftElements.map((el, idx) => renderFooterElement(el, showLabels, `left-${idx}`))}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: showLabels ? 1 : 0.5,
            flex: 1,
            justifyContent: 'center',
            color: 'text.secondary',
          }}
        >
          {centerElements.map((el, idx) => renderFooterElement(el, showLabels, `center-${idx}`))}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: showLabels ? 1 : 0.75,
            color: 'text.secondary',
            flexShrink: 0,
          }}
        >
          {rightElements.map((el, idx) => renderFooterElement(el, showLabels, `right-${idx}`))}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: showBrandLabel ? 1 : 0.75,
              textDecoration: 'none',
              color: 'inherit',
            }}
            component={brandHref ? RouterLink : 'div'}
            to={brandHref ? brandHref : undefined}
          >
            {brandVisual}
            {showBrandLabel && brandLabel && (
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {brandLabel}
              </Typography>
            )}
          </Box>
        </Box>
      </Toolbar>
    </Bar>
  );
}
