//@/gui/layouts/ResponsiveUI/Layout/Layout.types.ts
import type { FooterElement } from '@/gui/Theme/Layout/Footer/Footer.types';

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
  topBarConfig?: TopBarConfig | boolean;
  leftSidebarConfig?: LeftSidebarConfig | boolean;
  rightSidebarConfig?: RightSidebarConfig | boolean;
  footerConfig?: FooterConfig | boolean;
  children?: React.ReactNode;
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
