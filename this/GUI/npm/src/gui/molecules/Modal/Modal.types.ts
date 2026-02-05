import type React from 'react';

/**
 * Modal props (aligns with component implementation)
 */
export interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  blurBackground?: boolean;
  /**
   * 3D position offsets (per-axis) applied via translate3d.
   */
  xyz?: { x?: number; y?: number; z?: number };
  /**
   * Insets from layout/topbar/sidebars to avoid overlap.
   */
  insets?: { top?: number; right?: number; bottom?: number; left?: number };
  /** Optional className for custom styling */
  className?: string;
  /** Optional ID for targeting and registry mapping */
  id?: string;
  /** Optional test ID for automated testing */
  ['data-testid']?: string;
}
