// @/gui/layouts/ResponsiveUI/Layout/Layout.types.ts
import type { FooterElement } from '@/gui/Layout/Footer/Footer.types';
import type { ReactNode } from 'react';

export interface TopBarConfig {
  showMenuButton?: boolean;
  [key: string]: any;
}

export interface LeftSidebarConfig {
  [key: string]: any;
}

export interface RightSidebarConfig {
  [key: string]: any;
}

export interface FooterConfig {
  title?: string;
  brandLabel?: string;
  brandLogo?: string;
  brandHref?: string;
  brandAvatarFallback?: string;
  leftElements?: FooterElement[];
  centerElements?: FooterElement[];
  rightElements?: FooterElement[];
  position?: 'static' | 'fixed' | 'sticky';
  elevation?: number;
  className?: string;
  id?: string;
  'data-testid'?: string;
  sx?: any;
  appBarSx?: any;
  sectionSx?: any;
}

export interface LayoutProps {
  // Legacy names (supported)
  topBarConfig?: TopBarConfig | boolean;
  leftSidebarConfig?: LeftSidebarConfig | boolean;
  rightSidebarConfig?: RightSidebarConfig | boolean;
  footerConfig?: FooterConfig | boolean;

  // New semantic names (preferred)
  TopBar?: TopBarConfig | boolean;
  LeftSideBar?: LeftSidebarConfig | boolean;
  RightSideBar?: RightSidebarConfig | boolean;
  Footer?: FooterConfig | boolean;

  children?: ReactNode;
}

export interface ContentChild {
  type: string;
  props?: Record<string, any>;
}

export interface ContentProps {
  children?: ContentChild[];
}

export interface LayoutSpec {
  type: 'Layout';
  props?: LayoutProps;
  Content?: ContentProps[];
}
