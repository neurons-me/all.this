import type React from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

export type ContentSection = {
  type: string;
  props?: Record<string, any>;
  children?: ContentSection[];
};

export interface ContentProps {
  /**
   * Array of layout sections or components to render within the Content area.
   */
  sections?: ContentSection[];

  /**
   * Optional unique identifier.
   */
  id?: string;

  /**
   * Custom CSS class name for additional styling.
   */
  className?: string;

  /**
   * Optional style overrides for the main container.
   */
  sx?: SxProps<Theme>;

  /**
   * Optional data-testid for testing purposes.
   */
  'data-testid'?: string;

  /**
   * Optional React children that can be rendered directly.
   */
  children?: React.ReactNode;
}