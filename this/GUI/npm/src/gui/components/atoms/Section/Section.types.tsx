import React from 'react';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';

export interface SectionProps {
  id?: string;
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
  colorVariant?: keyof Theme['palette']['section'];
  bgcolor?: string;
  className?: string;
  component?: React.ElementType;
  elevation?: number;
  padded?: boolean;
  centered?: boolean;
  'data-testid'?: string;
  maxWidth?: number | string;
  padding?: number | string | Record<string, any>;
  height?: number | string;
  marginTop?: number | string | Record<string, any>;
  marginBottom?: number | string | Record<string, any>;
  marginLeft?: number | string | Record<string, any>;
  marginRight?: number | string | Record<string, any>;
}