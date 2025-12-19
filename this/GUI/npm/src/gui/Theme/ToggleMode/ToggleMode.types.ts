import type { SxProps, Theme } from '@mui/material/styles';
export type ThemeModeToggleProps = {
  variant?: 'minimal' | 'switchMinimal' | 'switchWithLabel';
  show?: 'icons' | 'label' | 'both';
  id?: string;
  className?: string;
  ['data-testid']?: string;
  sx?: SxProps<Theme>;
  iconSx?: SxProps<Theme>;
  switchSx?: SxProps<Theme>;
  labelSx?: SxProps<Theme>;
  switchSize?: 'small' | 'medium';
  iconSize?: 'small' | 'medium' | 'large';
};

export type ThemeModeToggleResolverSpec = {
  type?: 'ThemeModeToggle';
  variant?: 'minimal' | 'switchMinimal' | 'switchWithLabel';
  show?: 'icons' | 'label' | 'both';
  id?: string;
  className?: string;
  ['data-testid']?: string;
  sx?: SxProps<Theme>;
  iconSx?: SxProps<Theme>;
  switchSx?: SxProps<Theme>;
  labelSx?: SxProps<Theme>;
  switchSize?: 'small' | 'medium';
  iconSize?: 'small' | 'medium' | 'large';
};
