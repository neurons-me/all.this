import clsx from 'clsx';
import { useEffect, useState, useRef } from 'react';
import IconButton from '@mui/material/IconButton';
import Icon from '@/gui/Theme/Icon/Icon';
import { Box, Drawer } from '@/gui/atoms';
import { useRightSidebar, useGuiTheme, useGuiMediaQuery, useUpdateInsets, useInsets } from '@/gui/hooks';
import type { RightSidebarView } from '@/gui/contexts';
import type { RightSidebarElement, RightSidebarProps } from './RightSidebar.types';
import RightSidebarLink from './components/RightSidebarLink/RightSidebarLink';
import RightSidebarMenu from './components/RightSidebarMenu/RightSidebarMenu';
import RightSidebarAction from './components/RightSidebarAction/RightSidebarAction';
import RightSidebarToggleButton from './components/RightSidebarToggleButton/RightSidebarToggleButton';

const RAIL_WIDTH = 72;
const EXPANDED_WIDTH = 264;

const RightSidebar = ({
  elements = [],
  footerElements = [],
  className,
  initialView = 'rail',
  id,
  style,
  'data-testid': dataTestId,
}: RightSidebarProps) => {
  const { view, setView } = useRightSidebar();
  const theme = useGuiTheme();
  const isMobile = useGuiMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastNonMobileView, setLastNonMobileView] = useState<RightSidebarView>(
    view === 'mobile' ? 'expanded' : view
  );
  const setInsets = useUpdateInsets();
  const insets = useInsets();
  const navInset = Math.max(0, Number(insets?.nav ?? insets?.top ?? 0));
  const headerHeight = navInset > 0 ? navInset : 48;
  const toggleOffset = (navInset > 0 ? navInset : 0) + 12;
  const hasFooterElements = Array.isArray(footerElements) && footerElements.length > 0;
  const initialViewApplied = useRef(false);

  useEffect(() => {
    if (typeof setInsets !== 'function') return;
    const desired =
      isMobile || view === 'mobile' ? 0 : view === 'expanded' ? EXPANDED_WIDTH : RAIL_WIDTH;
    setInsets({ right: desired });
    return () => setInsets({ right: 0 });
  }, [isMobile, setInsets, view]);

  useEffect(() => {
    initialViewApplied.current = false;
  }, [initialView]);

  useEffect(() => {
    if (initialViewApplied.current) return;
    if (initialView !== 'mobile') {
      if (lastNonMobileView !== initialView) setLastNonMobileView(initialView);
      if (!isMobile && view !== initialView) {
        setView(initialView);
      }
    } else if (view !== 'mobile') {
      setView('mobile');
    }
    initialViewApplied.current = true;
  }, [initialView, isMobile, lastNonMobileView, setView, view]);

  useEffect(() => {
    if (view === 'expanded' || view === 'rail') {
      setLastNonMobileView(view);
    }
  }, [view]);

  useEffect(() => {
    if (isMobile && view !== 'mobile') {
      setView('mobile');
    } else if (!isMobile && view === 'mobile') {
      setView(lastNonMobileView);
    }
  }, [isMobile, lastNonMobileView, setView, view]);

  useEffect(() => {
    if (view !== 'mobile' && mobileOpen) {
      setMobileOpen(false);
    }
  }, [mobileOpen, view]);

  const renderElements = (items: RightSidebarElement[]) =>
    items.map((el, idx) => {
      if (el.type === 'link') return <RightSidebarLink key={idx} {...el.props} />;
      if (el.type === 'menu') return <RightSidebarMenu key={idx} view={view} {...el.props} />;
      if (el.type === 'action') return <RightSidebarAction key={idx} view={view} {...el.props} />;
      return null;
    });

  const renderFooterItems = (items: RightSidebarElement[]) =>
    items.map((el, idx) => {
      if (el.type === 'link') return <RightSidebarLink key={`footer-link-${idx}`} {...el.props} />;
      if (el.type === 'menu')
        return <RightSidebarMenu key={`footer-menu-${idx}`} view={view} {...el.props} />;
      if (el.type === 'action')
        return <RightSidebarAction key={`footer-action-${idx}`} view={view} {...el.props} />;
      return null;
    });

  if (view === 'rail') {
    return (
      <Box
        component="aside"
        className={clsx('RightSidebar', className)}
        id={id}
        data-testid={dataTestId}
        style={style}
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          width: `${RAIL_WIDTH}px`,
          overflow: 'hidden',
          borderLeft: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Box
          component="header"
          sx={{
            flexShrink: 0,
            borderBottom: '1px solid',
            borderColor: 'divider',
            height: `${headerHeight}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            px: 1.5,
            py: 0,
            gap: 1.25,
          }}
        >
            <RightSidebarToggleButton
              expanded={view === ('expanded' as any)}
              onToggle={() => setView(view === 'rail' ? 'expanded' : 'rail')}
          />
        </Box>
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>{renderElements(elements)}</Box>
        {hasFooterElements && (
          <Box
            component="footer"
            sx={{
              flexShrink: 0,
              px: 1,
              py: 1.5,
                      borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            {renderFooterItems(footerElements)}
          </Box>
        )}
      </Box>
    );
  }

  if (view === 'mobile') {
    return (
      <>
        <Box
          sx={{
            position: 'fixed',
            top: `${toggleOffset}px`,
            right: 0,
            zIndex: ((theme as any)?.zIndex?.drawer ?? 1200) + 1,
            display: mobileOpen ? 'none' : 'flex',
          }}
        >
          <IconButton
            aria-label="Open right sidebar"
            onClick={() => setMobileOpen(true)}
            sx={{
              borderRadius: '16px 0 0 16px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              color: 'text.secondary',
              boxShadow: 3,
              '&:hover': {
                bgcolor: 'background.nav',
                color: 'text.primary',
              },
            }}
          >
            <Icon name="menu" />
          </IconButton>
        </Box>
        <Drawer
          anchor="right"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          variant="temporary"
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: EXPANDED_WIDTH,
              top: `${navInset}px`,
              height: `calc(100vh - ${navInset}px)`,
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid',
              borderColor: 'divider',
            },
          }}
          PaperProps={{ id, 'data-testid': dataTestId, style, className }}
        >
          <Box
            component="header"
            sx={{
              flexShrink: 0,
              borderBottom: '1px solid',
              borderColor: 'divider',
              height: `${headerHeight}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              px: 1.5,
              gap: 1.25,
            }}
          >
            <RightSidebarToggleButton expanded onToggle={() => setMobileOpen(false)} />
          </Box>
          <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>{renderElements(elements)}</Box>
          {hasFooterElements && (
            <Box
              component="footer"
              sx={{
                flexShrink: 0,
                px: 1.5,
                py: 1.5,
                          borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
              }}
            >
              {renderFooterItems(footerElements)}
            </Box>
          )}
        </Drawer>
      </>
    );
  }

  return (
    <Box
      component="aside"
      className={clsx('RightSidebar', className)}
      id={id}
      data-testid={dataTestId}
      style={style}
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: `${EXPANDED_WIDTH}px`,
        overflow: 'hidden',
        borderLeft: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Box
        component="header"
        sx={{
          flexShrink: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
          height: `${headerHeight}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          px: 1.5,
          py: 0,
          gap: 1.25,
        }}
      >
        <RightSidebarToggleButton
          expanded={view === ('expanded' as any)}
          onToggle={() => setView(view === 'expanded' ? 'rail' : 'expanded')}
        />
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>{renderElements(elements)}</Box>
      {hasFooterElements && (
        <Box
          component="footer"
          sx={{
            flexShrink: 0,
            px: 1.5,
            py: 1.5,
                  borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
          }}
        >
          {renderFooterItems(footerElements)}
        </Box>
      )}
    </Box>
  );
};

export default RightSidebar;
