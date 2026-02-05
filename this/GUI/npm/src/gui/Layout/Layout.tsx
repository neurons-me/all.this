// Layout/Layout/Layout.tsx
import { LeftSidebarProvider } from '@/gui/contexts/LeftSidebarContext';
import { RightSidebarProvider } from '@/gui/contexts/RightSidebarContext';
import Box from '@/gui/atoms/Box/Box';
import TopBar from '@/gui/Layout/TopBar/TopBar';
import LeftSidebar from '@/gui/Layout/Sidebars/LeftSidebar/LeftSidebar';
import RightSidebar from '@/gui/Layout/Sidebars/RightSidebar/RightSidebar';
import Footer from '@/gui/Layout/Footer/Footer';
import Namespace from '@/gui/Layout/Namespace/Namespace';
import Content from '@/gui/Layout/Content/Content';
import type { LayoutProps } from './Layout.types';
function Layout({
  topBarConfig = false,
  leftSidebarConfig = false,
  rightSidebarConfig = false,
  footerConfig = false,
  children,
}: LayoutProps) {
  const hasTopBar = Boolean(topBarConfig);
  const hasLeftSidebar = Boolean(leftSidebarConfig);
  const hasRightSidebar = Boolean(rightSidebarConfig);
  const leftInitialView =
    typeof leftSidebarConfig === 'object' && 'initialView' in leftSidebarConfig
      ? leftSidebarConfig.initialView
      : undefined;
  const rightInitialView =
    typeof rightSidebarConfig === 'object' && 'initialView' in rightSidebarConfig
      ? rightSidebarConfig.initialView
      : undefined;
  return (
    <LeftSidebarProvider initialView={leftInitialView}>
      <RightSidebarProvider initialView={rightInitialView}>
        <Box
          id="layout-root"
          sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
        >
          {hasTopBar && (
            <TopBar
              {...(typeof topBarConfig === 'object'
                ? (() => {
                    const { showMenuButton, brandLogo, ...rest } = topBarConfig as any;
                    return {
                      ...rest,
                      // Convention: use `brandLogo` as the config field, but TopBar expects `logo`.
                      ...(brandLogo ? { logo: brandLogo } : {}),
                    };
                  })()
                : {})}
            />
          )}
          <Box sx={{ display: 'flex', flex: 1 }}>
            {hasLeftSidebar && (
              <LeftSidebar
                elements={[]}
                {...(typeof leftSidebarConfig === 'object' ? leftSidebarConfig : {})}
              />
            )}
<Content disableInsetPadding>
  {children ?? <Namespace />}
</Content>
            {hasRightSidebar && (
              <RightSidebar
                elements={[]}
                {...(typeof rightSidebarConfig === 'object' ? rightSidebarConfig : {})}
              />
            )}
          </Box>
          {footerConfig && (
            <Footer
              {...(typeof footerConfig === 'object'
                ? (() => {
                    const {
                      title,
                      brandLabel,
                      brandLogo,
                      brandHref,
                      brandAvatarFallback,
                      leftElements,
                      centerElements,
                      rightElements,
                      position,
                      elevation,
                      className,
                      id,
                      sx,
                      appBarSx,
                      sectionSx,
                      'data-testid': dataTestId,
                    } = footerConfig;
                    return {
                      brandLabel: brandLabel ?? title,
                      brandLogo,
                      brandHref,
                      brandAvatarFallback,
                      leftElements,
                      centerElements,
                      rightElements,
                      position,
                      elevation,
                      className,
                      id,
                      sx,
                      appBarSx,
                      sectionSx,
                      'data-testid': dataTestId,
                    };
                  })()
                : {})}
            />
          )}
        </Box>
      </RightSidebarProvider>
    </LeftSidebarProvider>
  );
}

export default Layout;
