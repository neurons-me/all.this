import type React from 'react';
import type { RightSidebarView } from '@/gui/contexts';
export type { RightSidebarView };

export type RightSidebarElement =
  | { type: 'link'; props: Record<string, any> }
  | { type: 'menu'; props: Record<string, any> }
  | { type: 'action'; props: Record<string, any> };

export type RightSidebarProps = {
  elements?: RightSidebarElement[];
  footerElements?: RightSidebarElement[];
  className?: string;
  initialView?: RightSidebarView;
  id?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
};
