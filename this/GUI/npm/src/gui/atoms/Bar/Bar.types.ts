import type { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';

/**
 * AppBarProps
 * -----------
 * Extends MUI's AppBarProps to add This.GUI-specific fields (id, data-testid).
 */
export interface AppBarProps extends MuiAppBarProps {
  /** Optional id for targeting/testing */
  id?: string;
  /** Optional data-testid for testing */
  ['data-testid']?: string;
}

/**
 * AppBarResolverSpec
 * ------------------
 * JSON-friendly spec for declarative usage.
 */
export type AppBarResolverSpec = {
  type?: 'AppBar';
  props?: Partial<AppBarProps> & {
    /** Optional polymorphic component (Link, 'a', etc.) */
    component?: React.ElementType;
    /** Children to render inside the AppBar */
    children?: React.ReactNode;
  };
};