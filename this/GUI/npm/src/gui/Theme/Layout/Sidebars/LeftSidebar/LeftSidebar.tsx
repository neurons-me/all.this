// LeftSidebar.tsx
import clsx from 'clsx';
import { useEffect, useState, useRef } from 'react';
import IconButton from '@mui/material/IconButton';
import Icon from '@/gui/Theme/Icon/Icon';
import { LeftSidebarElement } from './LeftSidebar.types';
import LeftSidebarLink from './components/LeftSidebarLink/LeftSidebarLink';
import LeftSidebarMenu from './components/LeftSidebarMenu/LeftSidebarMenu';
import LeftSidebarAction from './components/LeftSidebarAction/LeftSidebarAction';
import LeftSidebarToggleButton from './components/LeftSidebarToggleButton/LeftSidebarToggleButton';
import { useLeftSidebar, useGuiTheme, useGuiMediaQuery, useUpdateInsets, useInsets } from '@/gui/hooks';
import { Box, Drawer } from '@/gui/components/atoms';
import type { LeftSidebarView } from '@/gui/contexts';

const LeftSidebar = ({
  elements = [],
  className,
  initialView = 'rail',
  footerElements = [],
}: {
  elements: LeftSidebarElement[];
  className?: string;
  initialView?: LeftSidebarView;
  footerElements?: LeftSidebarElement[];
}) => {
  const { view, setView } = useLeftSidebar();
  const theme = useGuiTheme();
  const isMobile = useGuiMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastNonMobileView, setLastNonMobileView] = useState<LeftSidebarView>(view === 'mobile' ? 'expanded' : view);
  const setInsets = useUpdateInsets();
  const insets = useInsets();
  const navInset = Math.max(0, Number(insets?.nav ?? insets?.top ?? 0));
  const headerHeight = navInset > 0 ? navInset : 48;
  const toggleOffset = (navInset > 0 ? navInset : 0) + 12;
  const hasFooterElements = Array.isArray(footerElements) && footerElements.length > 0;
  const initialViewApplied = useRef(false);

  useEffect(() => {
    if (typeof setInsets !== 'function') return;
    const desired = view === 'expanded' ? 220 : view === 'rail' ? 72 : 0;
    setInsets({ left: desired });
    return () => setInsets({ left: 0 });
  }, [setInsets, view]);

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

  const renderElements = () =>
    elements.map((el, idx) => {
      if (el.type === 'link') return <LeftSidebarLink key={idx} view={view} {...el.props} />;
      if (el.type === 'menu') return <LeftSidebarMenu key={idx} view={view} {...el.props} />;
      if (el.type === 'action') return <LeftSidebarAction key={idx} view={view} {...el.props} />;
      return null;
    });
  const renderFooterItems = () =>
    footerElements.map((el, idx) => {
      if (el.type === 'link') return <LeftSidebarLink key={`footer-link-${idx}`} view={view} {...el.props} />;
      if (el.type === 'menu') return <LeftSidebarMenu key={`footer-menu-${idx}`} view={view} {...el.props} />;
      if (el.type === 'action') return <LeftSidebarAction key={`footer-action-${idx}`} view={view} {...el.props} />;
      return null;
    });

  if (view === 'rail') {
    return (
      <Box
        component="aside"
        className={clsx('LeftSidebar', className)}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          width: '72px',
          overflow: 'visible',
          borderRight: '1px solid',
          borderColor: 'divider',
          '--gui-rail-width': '72px',
          zIndex: (theme) => theme.zIndex.drawer + 2,
          backgroundColor: 'background.nav',
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
            justifyContent: 'flex-end',
            px: 1.5,
            py: 0,
            gap: 1.25,
          }}
        >
          <LeftSidebarToggleButton
            expanded={view === ('expanded' as any)}
            onToggle={() => setView(view === 'rail' ? 'expanded' : 'rail')}
          />
        </Box>
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>{renderElements()}</Box>
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
            {renderFooterItems()}
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
            left: 0,
            zIndex: ((theme as any)?.zIndex?.drawer ?? 1200) + 1,
            display: mobileOpen ? 'none' : 'flex',
          }}
        >
          <IconButton
            aria-label="Abrir navegación"
            onClick={() => setMobileOpen(true)}
            sx={{
              borderRadius: '0 16px 16px 0',
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
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          variant="temporary"
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 220,
              top: `${navInset}px`,
              height: `calc(100vh - ${navInset}px)`,
              display: 'flex',
              flexDirection: 'column',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
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
              justifyContent: 'flex-end',
              px: 1.5,
              gap: 1.25,
            }}
          >
            <LeftSidebarToggleButton expanded onToggle={() => setMobileOpen(false)} />
          </Box>
          <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>{renderElements()}</Box>
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
              {renderFooterItems()}
            </Box>
          )}
        </Drawer>
      </>
    );
  }

  // Default to 'expanded' view
  return (
    <Box
      component="aside"
      className={clsx('LeftSidebar', className)}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: '220px',
        overflow: 'visible',
        borderRight: '1px solid',
        borderColor: 'divider',
        '--gui-expanded-width': '220px',
        backgroundColor: 'background.nav',
        zIndex: (theme) => theme.zIndex.drawer + 2,
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
          justifyContent: 'flex-end',
          px: 1.5,
          py: 0,
          gap: 1.25,
        }}
      >
        <LeftSidebarToggleButton
          expanded={view === ('expanded' as any)}
          onToggle={() => setView(view === 'expanded' ? 'rail' : 'expanded')}
        />
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>{renderElements()}</Box>
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
          {renderFooterItems()}
        </Box>
      )}
    </Box>
  );
};

export default LeftSidebar;
