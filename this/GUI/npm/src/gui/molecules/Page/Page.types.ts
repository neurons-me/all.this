import type { ReactNode } from 'react';
/**
 * PageProps
 * ----------
 * Public props for the Page container.
 */
export interface PageProps {
  /** Page content */
  children?: ReactNode;
  /**
   * Padding applied to the page.
   *
   * - number → resolved via theme.spacing when available
   * - string → raw CSS value (e.g. "24px", "2rem", "16px 24px")
   */
  padding?: number | string;
  /** Any valid CSS background value (color / gradient / image). */
  background?: string;
  /** Additional style overrides forwarded to Box `sx`. */
  sx?: Record<string, any>;
  /** Respect layout insets via CSS vars: --gui-inset-* */
  insetsAware?: boolean;
}
